# 🎯 QUICK REFERENCE - Model Training

## Two Ways to Train Models

### ✅ Manual Training - When You Want
```bash
cd backend/python
python train_model.py
```
- Takes 2-12 hours depending on settings
- Shows training progress in real-time
- Best for: Testing, experimenting

### ✅ Auto Training - Daily at 2 AM
```bash
cd backend/python
python auto_train_scheduler.py --now     # First run
python auto_train_scheduler.py --schedule # Then schedule
```
- Trains automatically every day
- Saves results automatically
- Best for: Production, continuous improvement

---

## Before You Start (One-Time Setup)

### Windows:
```bash
cd backend\python
setup.bat
```

### Linux/Mac:
```bash
cd backend/python
bash setup.sh
```

---

## Get Training Data

**Easiest Way - Roboflow:**
1. Go to https://universe.roboflow.com
2. Search "floor plan"
3. Download in "YOLOv8" format
4. Extract to: `backend/datasets/floor-plans/`

**Your Own Data:**
- Collect images of floor plans
- Label them with tools like Label Studio
- Put in: `backend/datasets/floor-plans/`

---

## What Happens During Training

```
Input (Images + Labels)
        ↓
  YOLO Model
  (learns patterns)
        ↓
  Better Model
        ↓
Output (best.pt)
        ↓
Used by system
```

---

## Expected Results

| Training Time | Quality | When to Use |
|---------------|---------|------------|
| 30 mins       | 🟡 OK   | Testing    |
| 2 hours       | 🟢 Good | Normal use |
| 4-8 hours     | 🟢 Very Good | Production |
| 12+ hours     | 🟢⭐ Excellent | Best results |

---

## Status Check Anytime

```bash
cd backend/python
python auto_train_scheduler.py --status
```

Shows:
- Current settings
- Dataset info
- Training history
- Saved models

---

## File Locations

```
backend/
├── python/
│   ├── train_model.py           ← Run manual training
│   ├── auto_train_scheduler.py  ← Run auto training
│   ├── setup.bat/setup.sh       ← Install dependencies
│   └── models/                  ← Saved trained models
└── datasets/
    └── floor-plans/             ← Put training data here
        ├── images/
        │   ├── train/
        │   └── val/
        ├── labels/
        └── data.yaml
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| "Python not found" | Install from python.org |
| "Out of memory" | Reduce batch size (batch=8) |
| "Training too slow" | Use GPU (device=0) |
| "No data" | Download from Roboflow |

---

## Detailed Guides

- **Full Training Guide**: `MODEL_TRAINING_GUIDE.md`
- **Complete Documentation**: `TRAINING_README.md`

---

**Quick Links:**
- 🐍 Python: https://www.python.org/
- 📊 Roboflow Data: https://universe.roboflow.com/
- 📚 YOLO Docs: https://docs.ultralytics.com/
- 🏷️ Label Tool: https://labelstud.io/
