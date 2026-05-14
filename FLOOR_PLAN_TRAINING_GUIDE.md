# 📐 Floor Plan Upload & YOLO Training Guide

## Step 1: Login to System

### Open Browser:
- **URL:** `http://localhost:3000/signin`

### Login Credentials:
```
Email: admin@gmail.com
Password: 123456
```

### After Login:
- ✅ You'll see **Admin Dashboard**
- ✅ Access to all features
- ✅ Can upload projects and floor plans

---

## Step 2: Create a Project (First Time)

### Navigate to: Dashboard → Create New Project

### Fill in:
- **Project Name:** e.g., "House Design Project 1"
- **Client Name:** e.g., "John Doe"
- **Description:** "Floor plan detection and 3D design"
- **Location:** Your area

### Click: Create Project

---

## Step 3: Upload Floor Plan

### Go to: Dashboard → My Projects → Select Project

### Upload Options:

**Option A: Single Floor Plan**
1. Click "Upload Floor Plan"
2. Select image file (JPG, PNG)
3. Click "Upload"
4. System will:
   - Save the image
   - Run YOLO detection
   - Detect walls and objects
   - Show detection results

**Option B: Multiple Floor Plans (Batch)**
1. Prepare folder with images:
   ```
   floor_plans/
   ├── plan1.jpg
   ├── plan2.jpg
   ├── plan3.jpg
   └── plan4.jpg
   ```
2. Upload each one
3. System processes all automatically

---

## Step 4: View Detection Results

### After Upload:

You'll see:
- Original floor plan image
- **Detected walls** (highlighted)
- **Detected objects** (furniture, doors, windows)
- Confidence scores for each detection

### Features:
✅ **Wall Editor** - Edit detected walls  
✅ **Wall Orientation** - Change wall angles  
✅ **3D Preview** - See 3D model of detected walls  
✅ **Export** - Save detection results  

---

## Step 5: Prepare Dataset for Training

### Create Training Dataset

**Option A: Use Uploaded Floor Plans**
1. All uploaded plans are automatically saved to:
   ```
   backend/uploads/plans/
   └── [project_id]/
       └── [floor_plan_images]
   ```
2. These are used for training

**Option B: Manual Dataset Preparation**

Create folder structure:
```
backend/python/data/
├── images/
│   ├── plan1.jpg
│   ├── plan2.jpg
│   ├── plan3.jpg
│   └── ...
└── labels/
    ├── plan1.txt
    ├── plan2.txt
    ├── plan3.txt
    └── ...
```

**Label Format (YOLO):**

Each `.txt` file contains detections:
```
0 0.5 0.5 0.3 0.4     # Wall: class=0, x=0.5, y=0.5, width=0.3, height=0.4
1 0.7 0.3 0.1 0.2     # Door: class=1, x=0.7, y=0.3, width=0.1, height=0.2
2 0.2 0.8 0.15 0.15   # Window: class=2, x=0.2, y=0.8, width=0.15, height=0.15
```

**Classes:**
- `0` = Wall
- `1` = Door
- `2` = Window
- `3` = Furniture
- `4` = Full House (when full building is visible)

---

## Step 6: Train YOLO Model with Your Data

### Terminal: Go to Python Directory
```bash
cd backend/python
```

### Option A: Quick Training (Existing Model)
```bash
python train_model.py
```

**What this does:**
- Uses existing Roboflow dataset
- Trains for 100 epochs
- Creates `best.pt` (best model)
- Takes 2-20 hours depending on GPU

### Option B: Train with Custom Data

**Create file:** `backend/python/train_custom.py`

```python
from ultralytics import YOLO
import os

# Load pretrained model
model = YOLO('best.pt')

# Your data configuration
data_yaml = {
    'path': os.path.abspath('data'),
    'train': 'images',
    'val': 'images',
    'nc': 5,  # 5 classes: wall, door, window, furniture, full_house
    'names': ['wall', 'door', 'window', 'furniture', 'full_house']
}

# Save configuration
import yaml
with open('data.yaml', 'w') as f:
    yaml.dump(data_yaml, f)

# Train with your custom data
results = model.train(
    data='data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    patience=20,
    device='cuda',  # Use 'cpu' if no GPU
    plots=True,
    save=True,
)

print("✅ Training completed!")
print(f"📊 Best model: {results.save_dir}/best.pt")
```

### Run Custom Training:
```bash
python train_custom.py
```

### Training Output:
```
Epoch 1/100   Loss: 0.45   mAP: 0.32   ✓
Epoch 2/100   Loss: 0.42   mAP: 0.38   ✓
...
Epoch 100/100 Loss: 0.05   mAP: 0.92   ✓ BEST MODEL

💾 Model saved: runs/detect/best.pt
✅ Training completed!
```

---

## Step 7: Verify Trained Model

### Check Model Files:
```bash
ls backend/python/runs/detect/
# Should show:
# - best.pt          (trained model)
# - last.pt          (latest checkpoint)
# - training_results.csv  (metrics)
```

### Restart Backend (Loads New Model):
```bash
# In terminal where backend is running:
# Press Ctrl+C to stop

# Then restart:
npm start
```

### Verify Model Loaded:
```
✅ YOLO Model loaded from backend/python/best.pt
Server running on port 5000
```

---

## Step 8: Test Detection on New Floor Plans

### Upload New Floor Plan:
1. Dashboard → My Projects
2. Select project
3. Click "Upload Floor Plan"
4. Select image file
5. Click "Upload"

### System Will:
✅ Run your trained model on the image  
✅ Detect walls with HIGH accuracy  
✅ Detect doors, windows, furniture  
✅ Show detection results with confidence scores  
✅ Allow editing and 3D preview  

---

## 🎯 Full House Detection Configuration

### For Detecting ENTIRE Houses:

**Update Class:**
```python
# In train_custom.py
'names': ['wall', 'door', 'window', 'furniture', 'FULL_HOUSE']
```

**Training Data:**
- Include images of complete house exteriors
- Label entire building as class=4 (FULL_HOUSE)
- Use bounding box around whole building

**Example Label:**
```
4 0.5 0.5 0.9 0.9     # Full house: x=0.5, y=0.5, width=0.9, height=0.9
```

**After Training:**
- Model will detect when full house is visible
- System generates 3D model of complete building
- All rooms, walls, doors detected automatically

---

## 📊 Monitoring Training Progress

### Real-Time Monitoring:

```bash
# In separate terminal:
cd backend/python
tensorboard --logdir runs/detect
```

Then open: `http://localhost:6006`

**View:**
- Training loss graph
- Validation metrics
- Detection examples
- Confidence distribution

---

## 🚀 Complete Workflow

```
1. Login (admin@gmail.com / 123456)
   ↓
2. Create Project
   ↓
3. Upload Floor Plan Images
   ↓
4. System detects walls & objects
   ↓
5. Prepare dataset for training
   ↓
6. Train YOLO model with custom data
   ↓
7. Restart backend (loads new model)
   ↓
8. Upload new floor plan
   ↓
9. Model now detects with YOUR custom training
   ↓
10. Generate 3D house automatically
```

---

## 🔍 Troubleshooting

### Error: "Model not found"
```bash
# Ensure best.pt exists:
ls backend/python/best.pt

# If not, train first:
cd backend/python
python train_model.py
```

### Error: "Detection failed"
```bash
# Check image format:
# Supported: JPG, PNG, BMP, WEBP

# Check image size:
# Minimum: 64x64 pixels
# Recommended: 640x640 or larger

# Ensure YOLO model is loaded:
# Check backend logs: "✅ YOLO Model loaded"
```

### Slow Detection
```bash
# If on CPU and slow:
# Option 1: Use GPU (NVIDIA)
# Option 2: Reduce image size in backend/server.js

# Current default: 640x640
# Change to: 416x416 (faster but less accurate)
```

### Training is Very Slow
```bash
# Check if using GPU:
python -c "import torch; print(torch.cuda.is_available())"

# If False (no GPU):
# Option 1: Install NVIDIA GPU drivers
# Option 2: Reduce epochs: python train_model.py (edit EPOCHS=50)
# Option 3: Use Roboflow pre-trained model
```

---

## 📝 Training Parameters Reference

### Common Settings in `train_model.py`:

```python
EPOCHS = 100              # Increase = better accuracy, slower
BATCH_SIZE = 16          # Increase = faster, needs more GPU memory
IMG_SIZE = 640           # Larger = more accurate, slower
PATIENCE = 20            # Early stopping patience
CONFIDENCE = 0.5         # Detection confidence threshold
IOU = 0.5                # Intersection over Union threshold
DEVICE = 'cuda'          # 'cuda' for GPU, 'cpu' for CPU
```

### Recommendations:

**Fast Training (Testing):**
```python
EPOCHS = 10
BATCH_SIZE = 8
IMG_SIZE = 416
```

**Balanced (Recommended):**
```python
EPOCHS = 50
BATCH_SIZE = 16
IMG_SIZE = 640
```

**High Accuracy (Production):**
```python
EPOCHS = 200
BATCH_SIZE = 32
IMG_SIZE = 768
```

---

## ✅ Verification Checklist

- [ ] MongoDB running and connected
- [ ] Backend running on port 5000
- [ ] Frontend running on port 3000
- [ ] Login works with admin@gmail.com / 123456
- [ ] Can create new project
- [ ] Can upload floor plan image
- [ ] Detection results show walls
- [ ] Training dataset prepared
- [ ] YOLO model trained
- [ ] Backend restarted with new model
- [ ] Can detect walls with better accuracy

---

**Ready to upload and train? Let's go! 🎉**
