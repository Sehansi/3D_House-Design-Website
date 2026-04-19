"""
roboflow_extractor.py
=====================
Hybrid Floor Plan Extractor using the official Roboflow Python SDK.

The SDK handles authentication, endpoint routing, and model versioning
automatically — no manual REST endpoint construction needed.

SETUP (one-time):
  1. Go to https://app.roboflow.com → Settings → Roboflow API
     Copy your private API key (starts with rf_ or is alphanumeric)

  2. Go to https://universe.roboflow.com → search "floor plan"
     Pick a public model → click Deploy → Use via API
     Note down: workspace slug, project slug, version number

  3. Open backend/.env and set:
       ROBOFLOW_API_KEY=<your key>
       ROBOFLOW_WORKSPACE=<workspace-slug>   e.g.  floor-plan-1pzb7
       ROBOFLOW_PROJECT=<project-slug>       e.g.  floor-plans-dgxgo-ozagw
       ROBOFLOW_VERSION=<version number>     e.g.  2

USAGE:
  python roboflow_extractor.py <input.pdf|image.png>
"""

import sys
import json
import traceback
import os
import tempfile

# ── 1. Standard library imports first ───────────────────────────────────────
try:
    import fitz       # PyMuPDF  — pip install pymupdf
    import cv2        # OpenCV   — pip install opencv-python
    import numpy as np
except ImportError as e:
    print(json.dumps({
        "success": False,
        "error": f"Missing library: {e}",
        "hint": "Run: pip install pymupdf opencv-python numpy"
    }))
    sys.exit(1)

# ── 2. Read config from environment ─────────────────────────────────────────
ROBOFLOW_API_KEY  = os.environ.get("ROBOFLOW_API_KEY",  "")
ROBOFLOW_WORKSPACE = os.environ.get("ROBOFLOW_WORKSPACE", "")
ROBOFLOW_PROJECT  = os.environ.get("ROBOFLOW_PROJECT",  "")
ROBOFLOW_VERSION  = int(os.environ.get("ROBOFLOW_VERSION", "1"))
CONFIDENCE        = float(os.environ.get("ROBOFLOW_CONFIDENCE", "0.35"))
OVERLAP           = float(os.environ.get("ROBOFLOW_OVERLAP", "0.3"))

# Legacy support: if ROBOFLOW_MODEL_ID is set (format "workspace/project/version")
# parse it automatically
MODEL_ID = os.environ.get("ROBOFLOW_MODEL_ID", "")
if MODEL_ID and not ROBOFLOW_PROJECT:
    parts = MODEL_ID.split("/")
    if len(parts) == 2:
        ROBOFLOW_PROJECT = parts[0]
        ROBOFLOW_VERSION = int(parts[1])
    elif len(parts) == 3:
        ROBOFLOW_WORKSPACE = parts[0]
        ROBOFLOW_PROJECT   = parts[1]
        ROBOFLOW_VERSION   = int(parts[2])

# ── 3. Validate key ─────────────────────────────────────────────────────────
if not ROBOFLOW_API_KEY or ROBOFLOW_API_KEY in ("YOUR_ACTUAL_API_KEY_HERE", "YOUR_ROBOFLOW_API_KEY"):
    print(json.dumps({
        "success": False,
        "error":   "ROBOFLOW_API_KEY is not configured.",
        "hint":    "Open backend/.env → set ROBOFLOW_API_KEY=<key from app.roboflow.com → Settings>"
    }))
    sys.exit(1)

if not ROBOFLOW_PROJECT:
    print(json.dumps({
        "success": False,
        "error":   "Roboflow project slug not configured.",
        "hint":    (
            "Open backend/.env → set ROBOFLOW_PROJECT=<project-slug>  "
            "and ROBOFLOW_WORKSPACE=<workspace-slug>  "
            "(find them at universe.roboflow.com → your model → Deploy → Use via API)"
        )
    }))
    sys.exit(1)

# ── 4. Load Roboflow SDK (installed via pip install roboflow) ───────────────
try:
    from roboflow import Roboflow
except ImportError:
    print(json.dumps({
        "success": False,
        "error":   "roboflow package not found.",
        "hint":    "Run: pip install roboflow"
    }))
    sys.exit(1)


# ── HELPER FUNCTIONS ─────────────────────────────────────────────────────────

def pdf_to_image(file_path: str) -> np.ndarray:
    """Render the first page of a PDF to a high-res BGR numpy array."""
    doc  = fitz.open(file_path)
    page = doc[0]
    mat  = fitz.Matrix(2.5, 2.5)   # 2.5× zoom ≈ 180 DPI
    pix  = page.get_pixmap(matrix=mat, alpha=False)
    img  = np.frombuffer(pix.samples, dtype=np.uint8).reshape(pix.h, pix.w, 3)
    return cv2.cvtColor(img, cv2.COLOR_RGB2BGR)


def load_image(file_path: str) -> np.ndarray:
    ext = os.path.splitext(file_path)[1].lower()
    if ext == ".pdf":
        return pdf_to_image(file_path)
    img = cv2.imread(file_path)
    if img is None:
        raise ValueError(f"Could not read image: {file_path}")
    return img


def normalise(px: float, py: float, img_w: int, img_h: int):
    """Pixel coords → Three.js world coords in [-50, +50]."""
    return round(px / img_w * 100 - 50, 2), round(py / img_h * 100 - 50, 2)


def predictions_to_polygons(predictions: list, img_w: int, img_h: int) -> list:
    """Convert Roboflow prediction dicts → polygon dicts for Three.js."""
    polygons = []
    for pred in predictions:
        # ── Segmentation result (has 'points') ──────────────────────────
        raw_pts = pred.get("points", [])

        # ── Detection result fallback (bbox only) ───────────────────────
        if not raw_pts:
            x, y = pred.get("x", 0), pred.get("y", 0)
            w, h = pred.get("width", 0), pred.get("height", 0)
            raw_pts = [
                {"x": x - w / 2, "y": y - h / 2},
                {"x": x + w / 2, "y": y - h / 2},
                {"x": x + w / 2, "y": y + h / 2},
                {"x": x - w / 2, "y": y + h / 2},
            ]

        if len(raw_pts) < 3:
            continue

        np_pts = np.array([[p["x"], p["y"]] for p in raw_pts], dtype=np.float32)
        if cv2.contourArea(np_pts) < 400:
            continue

        epsilon = 0.006 * cv2.arcLength(np_pts, True)
        approx  = cv2.approxPolyDP(np_pts, epsilon, True)

        points_3d = []
        for pt in approx:
            nx, nz = normalise(float(pt[0][0]), float(pt[0][1]), img_w, img_h)
            points_3d.append({"x": nx, "z": nz})

        if len(points_3d) >= 3:
            polygons.append({
                "points":     points_3d,
                "type":       pred.get("class", "wall").lower(),
                "class_id":   pred.get("class_id", 0),
                "confidence": round(pred.get("confidence", 0), 3),
            })
    return polygons


def polygons_to_walls(polygons: list) -> list:
    """Decompose polygons into individual WallBox-compatible segments."""
    walls = []
    for poly in polygons:
        pts = poly["points"]
        for i in range(len(pts)):
            p1, p2 = pts[i], pts[(i + 1) % len(pts)]
            dx, dz = p2["x"] - p1["x"], p2["z"] - p1["z"]
            length = round(float(np.sqrt(dx*dx + dz*dz)), 2)
            if length < 1.0:
                continue
            walls.append({
                "centerX":   round((p1["x"] + p2["x"]) / 2, 2),
                "centerZ":   round((p1["z"] + p2["z"]) / 2, 2),
                "length":    length,
                "rotation":  round(float(-np.arctan2(dz, dx)), 4),
                "thickness": 1.5,
                "height":    5.0,
            })
    return walls


def fallback_box():
    pts = [{"x": -40.0, "z": -40.0}, {"x": 40.0, "z": -40.0},
           {"x": 40.0,  "z":  40.0}, {"x": -40.0,"z":  40.0}]
    poly = [{"points": pts, "type": "wall", "class_id": 0, "confidence": 0.0}]
    return poly, polygons_to_walls(poly)


# ── MAIN ─────────────────────────────────────────────────────────────────────

def process_file(file_path: str):
    try:
        # 1. Load image into memory
        img = load_image(file_path)
        img_h, img_w = img.shape[:2]

        # 2. Save to a temp JPEG so Roboflow SDK can read it from disk
        with tempfile.NamedTemporaryFile(suffix=".jpg", delete=False) as tmp:
            tmp_path = tmp.name
        cv2.imwrite(tmp_path, img, [cv2.IMWRITE_JPEG_QUALITY, 92])

        try:
            # 3. Initialise Roboflow SDK and load model
            rf      = Roboflow(api_key=ROBOFLOW_API_KEY)
            project = (
                rf.workspace(ROBOFLOW_WORKSPACE).project(ROBOFLOW_PROJECT)
                if ROBOFLOW_WORKSPACE
                else rf.project(ROBOFLOW_PROJECT)
            )
            model   = project.version(ROBOFLOW_VERSION).model

            # 4. Run inference (InstanceSegmentationModel only accepts confidence)
            result      = model.predict(tmp_path, confidence=int(CONFIDENCE * 100)).json()
            predictions = result.get("predictions", [])

        finally:
            # Always clean up temp file
            if os.path.exists(tmp_path):
                os.remove(tmp_path)

        # 5. Classify predictions by detected class name
        DOOR_CLASSES   = {"door", "doors", "opening", "entrance"}
        WINDOW_CLASSES = {"window", "windows"}

        wall_preds, door_preds, window_preds = [], [], []
        for pred in predictions:
            cls = pred.get("class", "wall").lower().strip()
            if cls in DOOR_CLASSES:
                door_preds.append(pred)
            elif cls in WINDOW_CLASSES:
                window_preds.append(pred)
            else:
                wall_preds.append(pred)  # wall, room, unknown → treat as wall

        # 6. Convert each group to Three.js polygon + wall-segment format
        wall_polygons   = predictions_to_polygons(wall_preds,   img_w, img_h)
        door_polygons   = predictions_to_polygons(door_preds,   img_w, img_h)
        window_polygons = predictions_to_polygons(window_preds, img_w, img_h)

        wall_segments   = polygons_to_walls(wall_polygons)
        door_segments   = polygons_to_walls(door_polygons)
        window_segments = polygons_to_walls(window_polygons)

        # 7. Fallback if nothing detected at all
        if not wall_polygons and not door_polygons and not window_polygons:
            wall_polygons, wall_segments = fallback_box()

        print(json.dumps({
            "success":         True,
            "polygons":        wall_polygons,    # polygon floors for walls
            "walls":           wall_segments,    # WallBox segments
            "door_polygons":   door_polygons,
            "doors":           door_segments,
            "window_polygons": window_polygons,
            "windows":         window_segments,
            "detection_count": len(wall_polygons) + len(door_polygons) + len(window_polygons),
            "wall_count":      len(wall_polygons),
            "door_count":      len(door_polygons),
            "window_count":    len(window_polygons),
            "source":          "roboflow",
            "model":           f"{ROBOFLOW_PROJECT}/{ROBOFLOW_VERSION}",
        }))

    except Exception as e:
        err_str = str(e)
        hint    = ""
        if "403" in err_str or "Forbidden" in err_str:
            hint = (
                "403 Forbidden: The model may be PRIVATE. "
                "On universe.roboflow.com open the model → Settings → make it Public. "
                "Or set ROBOFLOW_WORKSPACE correctly in backend/.env."
            )
        elif "401" in err_str or "Unauthorized" in err_str:
            hint = "Invalid API key. Check ROBOFLOW_API_KEY in backend/.env."
        elif "404" in err_str or "not found" in err_str.lower():
            hint = (
                "Model not found. Check ROBOFLOW_PROJECT and ROBOFLOW_VERSION in backend/.env. "
                "Find the correct slugs at universe.roboflow.com → your model → Deploy → Use via API."
            )

        print(json.dumps({
            "success":   False,
            "error":     err_str,
            "hint":      hint,
            "traceback": traceback.format_exc(),
        }))
        sys.exit(1)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print(json.dumps({"success": False, "error": "Usage: python roboflow_extractor.py <input.pdf|image>"}))
        sys.exit(1)
    process_file(sys.argv[1])
