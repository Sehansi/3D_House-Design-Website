import sys
import json
import traceback
import os

try:
    import fitz  # PyMuPDF
    import cv2
    import numpy as np
    from ultralytics import YOLO
except ImportError as e:
    print(json.dumps({"success": False, "error": f"Missing required library: {e}"}))
    sys.exit(1)

# ─────────────────────────────────────────────────────────────
# DOOR/WINDOW HEURISTICS
# Using classical OpenCV image processing on the floor plan image.
# We detect:
#   - Doors  : small arc-like or thin rectangular openings (door swings)
#   - Windows: thin dashed or double-line segments on outer walls
# ─────────────────────────────────────────────────────────────

def detect_openings_cv(img, scale_x, scale_z, img_h):
    """
    Detect doors and windows from the floor plan image using classical CV.
    Returns (doors_list, windows_list) each in the same
    {centerX, centerZ, length, rotation, thickness, height} format as walls.
    """
    doors   = []
    windows = []

    # ── 1. Grayscale + binarize ──────────────────────────────
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    _, binary = cv2.threshold(gray, 200, 255, cv2.THRESH_BINARY_INV)

    # ── 2. Detect door arc / quarter-circle swings ──────────
    # Floor plan doors are drawn as an arc (quarter circle).
    # We look for circles in the plan. Small circles ≈ door pivots.
    circles = cv2.HoughCircles(
        gray,
        cv2.HOUGH_GRADIENT,
        dp=1.5,
        minDist=30,
        param1=60,
        param2=25,
        minRadius=12,
        maxRadius=60,
    )
    if circles is not None:
        circles = np.round(circles[0, :]).astype(int)
        for (cx_px, cy_px, r_px) in circles:
            # The door "width" ≈ radius of the arc
            door_len = round(float(r_px * 2 * scale_x), 2)
            if door_len < 0.5:
                continue
            nx  = float(round(cx_px * scale_x - 50.0, 2))
            nz  = float(round(cy_px * scale_z - 50.0, 2))
            doors.append({
                "centerX":   nx,
                "centerZ":   nz,
                "length":    door_len,
                "rotation":  0.0,
                "thickness": 0.15,
                "height":    2.2,
            })

    # ── 3. Detect window double-lines on outer walls ─────────
    # Windows appear as very short parallel lines (double line patterns).
    # We find short horizontal/vertical line segments that appear in pairs.
    kernel_h = cv2.getStructuringElement(cv2.MORPH_RECT, (25, 1))
    kernel_v = cv2.getStructuringElement(cv2.MORPH_RECT, (1, 25))

    horiz = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_h)
    vert  = cv2.morphologyEx(binary, cv2.MORPH_OPEN, kernel_v)

    for mask, is_horiz in [(horiz, True), (vert, False)]:
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for cnt in contours:
            x, y, w, h = cv2.boundingRect(cnt)
            # Window segments: short span in one axis, thin in the other
            span   = w if is_horiz else h
            thin   = h if is_horiz else w
            if span < 15 or span > 120:
                continue
            if thin > 8:
                continue
            cx_px = x + w // 2
            cy_px = y + h // 2
            nx  = float(round(cx_px * scale_x - 50.0, 2))
            nz  = float(round(cy_px * scale_z - 50.0, 2))
            seg_len = round(float(span * (scale_x if is_horiz else scale_z)), 2)
            rot = 0.0 if is_horiz else round(float(np.pi / 2), 4)
            windows.append({
                "centerX":   nx,
                "centerZ":   nz,
                "length":    seg_len,
                "rotation":  rot,
                "thickness": 0.15,
                "height":    1.0,
            })

    # Deduplicate windows that are too close together (< 2 units apart)
    deduped = []
    for w in windows:
        too_close = any(
            abs(w["centerX"] - e["centerX"]) < 2 and abs(w["centerZ"] - e["centerZ"]) < 2
            for e in deduped
        )
        if not too_close:
            deduped.append(w)

    return doors, deduped


def process_file(file_path):
    try:
        # Check if the AI model exists
        model_path = os.path.join(os.path.dirname(__file__), 'best_new.pt')
        if not os.path.exists(model_path):
            raise FileNotFoundError(f"AI Model not found at {model_path}")

        # 1. Smart file loader
        ext = os.path.splitext(file_path)[1].lower()
        IMAGE_EXTS = ['.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tiff']

        if ext == '.pdf':
            doc  = fitz.open(file_path)
            page = doc[0]
            zoom = 2.0
            mat  = fitz.Matrix(zoom, zoom)
            pix  = page.get_pixmap(matrix=mat)
            if pix.n == 1:
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w)
                img = cv2.cvtColor(img, cv2.COLOR_GRAY2BGR)
            elif pix.n == 3:
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, 3)
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            elif pix.n == 4:
                img = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, 4)
                img = cv2.cvtColor(img, cv2.COLOR_RGBA2RGB)
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)
            else:
                raise ValueError("Unsupported PDF image format")
        elif ext in IMAGE_EXTS:
            img = cv2.imread(file_path)
            if img is None:
                raise ValueError(f"Could not read image file: {file_path}")
        else:
            raise ValueError(f"Unsupported file type: {ext}")

        img_h, img_w = img.shape[:2]

        # 1.5 Upscale small images for better detection
        if img_w < 1000 or img_h < 1000:
            img = cv2.resize(img, None, fx=2, fy=2, interpolation=cv2.INTER_CUBIC)
            img_h, img_w = img.shape[:2]

        scale_x = 100.0 / img_w
        scale_z = 100.0 / img_h

        # 2. YOLO wall/room detection
        model   = YOLO(model_path)
        results = model.predict(source=img, conf=0.15, verbose=False, iou=0.45)

        polygons      = []
        walls_fallback = []

        for result in results:
            if result.masks is not None:
                masks_xy = result.masks.xy
                classes  = result.boxes.cls.cpu().numpy()

                for idx, mask in enumerate(masks_xy):
                    class_id = int(classes[idx])
                    epsilon  = 0.008 * cv2.arcLength(mask, True)
                    approx   = cv2.approxPolyDP(mask, epsilon, True)

                    area = cv2.contourArea(approx)
                    if area < 500:
                        continue

                    points = []
                    for point in approx:
                        nx = float(round((float(point[0][0]) * scale_x) - 50.0, 2))
                        nz = float(round((float(point[0][1]) * scale_z) - 50.0, 2))
                        points.append({"x": nx, "z": nz})

                    if len(points) >= 3:
                        polygons.append({"points": points, "type": "structural", "class_id": class_id})

            elif result.boxes is not None:
                boxes   = result.boxes.xyxy.cpu().numpy()
                classes = result.boxes.cls.cpu().numpy()

                for idx, box in enumerate(boxes):
                    class_id = int(classes[idx])
                    x1, y1, x2, y2 = box
                    points = [
                        {"x": float(round((x1 * scale_x) - 50.0, 2)), "z": float(round((y1 * scale_z) - 50.0, 2))},
                        {"x": float(round((x2 * scale_x) - 50.0, 2)), "z": float(round((y1 * scale_z) - 50.0, 2))},
                        {"x": float(round((x2 * scale_x) - 50.0, 2)), "z": float(round((y2 * scale_z) - 50.0, 2))},
                        {"x": float(round((x1 * scale_x) - 50.0, 2)), "z": float(round((y2 * scale_z) - 50.0, 2))},
                    ]
                    polygons.append({"points": points, "type": "structural", "class_id": int(class_id)})

        # 3. Build wall segments from polygon edges
        for poly in polygons:
            pts = poly['points']
            for i in range(len(pts)):
                p1 = pts[i]
                p2 = pts[(i + 1) % len(pts)]
                dx, dz = p2['x'] - p1['x'], p2['z'] - p1['z']
                length = round(float(np.sqrt(dx**2 + dz**2)), 2)
                if length < 0.8:
                    continue
                cx  = round((p1['x'] + p2['x']) / 2, 2)
                cz  = round((p1['z'] + p2['z']) / 2, 2)
                rot = round(float(-np.arctan2(dz, dx)), 4)
                angle_deg = abs(np.degrees(rot)) % 90
                if angle_deg < 2 or angle_deg > 88:
                    if abs(dx) > abs(dz):
                        cz  = round(cz, 1)
                        rot = 0.0 if dx > 0 else float(np.pi)
                    else:
                        cx  = round(cx, 1)
                        rot = float(-np.pi / 2) if dz > 0 else float(np.pi / 2)
                walls_fallback.append({
                    "centerX": cx, "centerZ": cz,
                    "length": length, "rotation": rot,
                    "thickness": 1.5, "height": 5.0,
                })

        # 4. Fallback outer box if nothing detected
        if not polygons and not walls_fallback:
            outer_pts = [
                {"x": -40.0, "z": -40.0}, {"x": 40.0, "z": -40.0},
                {"x":  40.0, "z":  40.0}, {"x": -40.0, "z":  40.0},
            ]
            polygons.append({"points": outer_pts, "type": "structural", "class_id": 0})
            for i in range(4):
                p1 = outer_pts[i]
                p2 = outer_pts[(i + 1) % 4]
                cx  = round((p1["x"] + p2["x"]) / 2, 2)
                cz  = round((p1["z"] + p2["z"]) / 2, 2)
                length = round(float(np.sqrt((p2["x"] - p1["x"])**2 + (p2["z"] - p1["z"])**2)), 2)
                rot    = round(float(-np.arctan2(p2["z"] - p1["z"], p2["x"] - p1["x"])), 4)
                walls_fallback.append({"centerX": cx, "centerZ": cz, "length": length,
                                       "rotation": rot, "thickness": 1.5, "height": 5.0})

        # 5. Detect doors & windows using classical CV
        cv_doors, cv_windows = detect_openings_cv(img, scale_x, scale_z, img_h)

        # 6. Output
        output_data = {
            "success":         True,
            "polygons":        polygons,
            "walls":           walls_fallback,
            "doors":           cv_doors,
            "windows":         cv_windows,
            "detection_count": len(polygons),
            "door_count":      len(cv_doors),
            "window_count":    len(cv_windows),
        }

        print(json.dumps(output_data))

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e), "traceback": traceback.format_exc()}))
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python plan_to_3d.py <input.pdf|image>"}))
        sys.exit(1)

    process_file(sys.argv[1])
