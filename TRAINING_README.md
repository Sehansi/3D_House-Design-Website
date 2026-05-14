# 🤖 YOLO Model Training System - Complete Guide

## 📌 Overview

This system provides **two ways to train YOLO models** for floor plan detection:

1. **Manual Training** - Train when you want using `train_model.py`
2. **Automatic Training** - Schedule training to run automatically using `auto_train_scheduler.py`

---

## 🚀 Quick Start (5 minutes)

### Step 1: Install Python & Dependencies

**Windows:**
```bash
cd backend/python
setup.bat
```

**Linux/Mac:**
```bash
cd backend/python
bash setup.sh
```

### Step 2: Prepare Your Dataset

Download floor plan dataset from [Roboflow](https://universe.roboflow.com) in YOLOv8 format, then extract to:
```
backend/datasets/floor-plans/
├── images/
│   ├── train/
│   ├── val/
│   └── test/
├── labels/
│   ├── train/
│   ├── val/
│   └── test/
└── data.yaml
```

### Step 3: Start Training

**Option A - Train Now:**
```bash
cd backend/python
python train_model.py
```

**Option B - Auto-train Now:**
```bash
python auto_train_scheduler.py --now
```

---

## 📊 System Architecture

```
3D_House_Design_webapp_yolo/
├── backend/
│   ├── python/
│   │   ├── train_model.py              ← Manual training script
│   │   ├── auto_train_scheduler.py     ← Automatic training
│   │   ├── setup.bat                   ← Windows setup
│   │   ├── setup.sh                    ← Linux/Mac setup
│   │   ├── best.pt                     ← Current models
│   │   ├── best_v2.pt
│   │   └── best_new.pt
│   └── datasets/
│       └── floor-plans/                ← Your training data
│           ├── images/
│           ├── labels/
│           └── data.yaml
├── MODEL_TRAINING_GUIDE.md             ← Detailed documentation
└── TRAINING_README.md                  ← This file
```

---

## 🎯 Training Options Comparison

| Feature | Manual Training | Auto Training |
|---------|-----------------|---------------|
| Run Time | When you run | Scheduled (2 AM daily) |
| Setup Time | 2 minutes | 5 minutes |
| GPU Memory | Adjustable | Fixed config |
| Logging | Console + JSON | JSON only |
| Best For | Testing, Development | Production, 24/7 training |

---

## 🔧 Manual Training Guide

### Command-Line Training

```bash
cd backend/python

# Option 1: Simple training
python train_model.py

# Option 2: Direct YOLO command
yolo detect train data=../datasets/floor-plans/data.yaml model=yolov8m.pt epochs=100 device=0

# Option 3: CPU training (slower)
yolo detect train data=../datasets/floor-plans/data.yaml model=yolov8m.pt epochs=50 device=cpu
```

### Python Script Training

```python
from ultralytics import YOLO

# Load model
model = YOLO('yolov8m.pt')  # Medium model

# Train
results = model.train(
    data='../datasets/floor-plans/data.yaml',
    epochs=100,
    imgsz=640,
    batch=16,
    device=0  # 0=GPU, 'cpu'=CPU
)

# Use trained model
model = YOLO('runs/detect/floor_plan_model/weights/best.pt')
results = model.predict(source='image.jpg')
```

### Configuration Options

**Batch Size** (adjust if GPU runs out of memory):
- `batch=8` - Uses less memory, slower
- `batch=16` - Recommended default
- `batch=32` - Faster, needs more GPU memory

**Model Size** (larger = more accurate but slower):
- `yolov8n.pt` - Nano (fastest, least accurate)
- `yolov8s.pt` - Small
- `yolov8m.pt` - Medium (recommended)
- `yolov8l.pt` - Large
- `yolov8x.pt` - Extra Large (most accurate, slowest)

**Epochs** (how long to train):
- `epochs=50` - Quick training (~2-3 hours)
- `epochs=100` - Standard training (~4-6 hours)
- `epochs=150` - Extended training (~8-12 hours)

---

## 🤖 Automatic Training Guide

### One-Time Setup

```bash
cd backend/python

# Install dependencies
pip install schedule

# Create auto-trainer configuration
python auto_train_scheduler.py --status
```

### Start Auto-Training

```bash
# Train immediately (first run)
python auto_train_scheduler.py --now

# Schedule for 2 AM daily
python auto_train_scheduler.py --schedule

# Check status anytime
python auto_train_scheduler.py --status
```

### Auto-Trainer Features

✅ Automatic daily training at 2 AM  
✅ JSON logging of all training sessions  
✅ Automatic model saving with timestamps  
✅ Email alerts (can be added)  
✅ Training history tracking  

### Status Check

```bash
python auto_train_scheduler.py --status
```

Output shows:
- Current configuration
- Dataset info
- Recent training history
- Saved models

---

## 📊 Dataset Preparation

### Format: YOLO Darknet Format

Each image needs a corresponding `.txt` file with same name:

**Image:** `image123.jpg`  
**Label:** `image123.txt`

**Label file format:**
```
<class_id> <x_center> <y_center> <width> <height>
<class_id> <x_center> <y_center> <width> <height>
...
```

**Values are normalized (0-1):**
- `x_center` = X coordinate of box center / image width
- `y_center` = Y coordinate of box center / image height
- `width` = box width / image width
- `height` = box height / image height

**Example:**
```
0 0.25 0.35 0.5 0.4
2 0.75 0.2 0.15 0.2
```

### Getting Training Data

**Option 1: Roboflow (Recommended)**
```bash
# Download from: https://universe.roboflow.com
# Search: "floor plan"
# Download in "YOLOv8" format
# Extract to: backend/datasets/floor-plans/
```

**Option 2: Label Your Own Data**

Tools:
- [Label Studio](https://labelstud.io/) - Free, web-based
- [CVAT](https://www.cvat.ai/) - Professional
- [Makesense.ai](https://www.makesense.ai/) - Simple, no install

### Directory Structure

```
backend/datasets/floor-plans/
├── images/
│   ├── train/          # 70% of data
│   │   ├── 001.jpg
│   │   ├── 002.jpg
│   │   └── ...
│   ├── val/            # 20% of data
│   │   ├── 051.jpg
│   │   └── ...
│   └── test/           # 10% of data
│       └── ...
├── labels/
│   ├── train/
│   │   ├── 001.txt
│   │   ├── 002.txt
│   │   └── ...
│   ├── val/
│   └── test/
└── data.yaml
```

---

## 📈 Monitoring Training

### Real-Time Monitoring

```bash
# While training (in another terminal)
tensorboard --logdir=runs/detect
# Open: http://localhost:6006
```

### Check Training Results

```bash
# After training completes
ls runs/detect/floor_plan_*/weights/
# Shows: best.pt, last.pt

# View metrics
cat runs/detect/floor_plan_*/results.csv
```

### Training Logs

**Manual training:**
```bash
cat training_log.json | more
```

**Auto training:**
```bash
cat training_log.json | tail -20  # Last 20 entries
```

---

## 🎯 Metrics to Watch

### During Training

**mAP@50** - Main metric (should increase):
- 0.5+ = Good
- 0.7+ = Excellent
- 0.85+ = State-of-the-art

**Loss** - Should decrease:
- Box Loss - Location accuracy
- Cls Loss - Classification accuracy
- obj Loss - Detection confidence

### Final Results

After training completes, check:
1. **Best model**: `runs/detect/.../weights/best.pt`
2. **Metrics**: `runs/detect/.../results.csv`
3. **Confusion matrix**: `runs/detect/.../confusion_matrix.png`

---

## 🔄 Using Trained Models

### In Backend Code

**Update `backend/routes/common/ai-designer.js`:**

```javascript
// Replace the model path
const MODEL_PATH = './python/models/best_20260513_120000.pt';

// The backend will automatically use this model
```

### Manual Model Testing

```bash
cd backend/python

# Create test_model.py
python test_model.py
```

**test_model.py:**
```python
from ultralytics import YOLO

# Load trained model
model = YOLO('models/best_20260513_120000.pt')

# Predict on image
results = model.predict(source='../uploads/test_plan.jpg', conf=0.5)

# Show results
for result in results:
    print(f"Found {len(result.boxes)} objects")
    result.save('output_annotated.jpg')
```

---

## ⚡ Performance Tips

### Speed Up Training

1. **Use GPU**: `device=0` (10-100x faster than CPU)
2. **Smaller model**: Use `yolov8s.pt` instead of `yolov8l.pt`
3. **Fewer epochs**: Start with `epochs=50`
4. **Smaller images**: Use `imgsz=416` instead of `640`
5. **Larger batches**: Use `batch=32` (if GPU memory allows)

### Improve Accuracy

1. **More data**: Get more training images
2. **Larger model**: Use `yolov8l.pt` or `yolov8x.pt`
3. **More epochs**: Train for `epochs=200+`
4. **Data augmentation**: Automatically enabled, vary `augment` settings
5. **Better labeling**: Ensure accurate annotations

### Save GPU Memory

1. **Reduce batch**: `batch=8` or `batch=4`
2. **Reduce image size**: `imgsz=416` or `imgsz=320`
3. **Use smaller model**: `yolov8n.pt`
4. **Enable gradual freezing**: `freeze=[0,10,15]`

---

## 🐛 Troubleshooting

### "Python not found"
```bash
# Windows
set PATH=%PATH%;C:\Users\YourName\AppData\Local\Programs\Python\Python311

# Linux/Mac
export PATH=$PATH:~/Library/Python/3.11/bin
```

### "Out of memory"
```bash
# Reduce batch size
python train_model.py  # Then edit config to batch=8
```

### "Dataset not found"
```bash
# Ensure structure:
ls ../datasets/floor-plans/data.yaml
ls ../datasets/floor-plans/images/train/
```

### "No training images"
```bash
# Check image count
ls ../datasets/floor-plans/images/train/ | wc -l
# Should be > 0
```

### Training very slow
```bash
# Check if using GPU
python -c "from ultralytics import YOLO; import torch; print(torch.cuda.is_available())"

# If False, install CUDA:
# https://developer.nvidia.com/cuda-downloads
```

---

## 📞 Support Resources

- **Ultralytics Docs**: https://docs.ultralytics.com/
- **YOLO Training**: https://docs.ultralytics.com/modes/train/
- **YOLOv8 GitHub**: https://github.com/ultralytics/ultralytics
- **Roboflow Docs**: https://docs.roboflow.com/
- **Label Studio**: https://labelstud.io/guide/

---

## 📋 Checklist

### Before Training
- [ ] Python 3.10+ installed
- [ ] Dependencies installed (`setup.bat` or `setup.sh`)
- [ ] Dataset prepared in `backend/datasets/floor-plans/`
- [ ] `data.yaml` created
- [ ] Images verified (check 10 random images)
- [ ] Labels verified (check 10 random label files)

### During Training
- [ ] Monitor GPU usage (if using GPU)
- [ ] Check loss is decreasing
- [ ] Verify mAP is increasing
- [ ] No errors in console

### After Training
- [ ] Best model saved to `models/` directory
- [ ] Training log updated
- [ ] Metrics reviewed
- [ ] Model tested on sample image
- [ ] Model path updated in backend code

---

## 🎓 Learning Resources

1. **YOLO Basics**: https://www.youtube.com/watch?v=V6zdx_FSM5E
2. **Training Tips**: https://docs.ultralytics.com/guides/training-tips-and-tricks/
3. **Dataset Preparation**: https://roboflow.com/blog/how-to-prepare-dataset-for-computer-vision
4. **Object Detection**: https://cs.stanford.edu/people/andrej/cs231n/

---

## 📝 Example Commands

```bash
# Quick setup and train
cd backend/python
bash setup.sh              # or setup.bat on Windows
python train_model.py      # Start training

# Auto-training
python auto_train_scheduler.py --now      # Train now
python auto_train_scheduler.py --schedule # Schedule daily
python auto_train_scheduler.py --status   # Check status

# Direct YOLO commands
yolo detect train data=../datasets/floor-plans/data.yaml model=yolov8m.pt epochs=100
yolo detect val model=runs/detect/.../weights/best.pt
yolo detect predict model=runs/detect/.../weights/best.pt source=image.jpg
```

---

**Version**: 1.0  
**Last Updated**: May 13, 2026  
**Status**: Ready for Production  

For detailed information, see: `MODEL_TRAINING_GUIDE.md`
