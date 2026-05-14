# YOLO Model Training Guide - A to Z

## 📋 Table of Contents
1. [Pre-requisites](#pre-requisites)
2. [Setup Instructions](#setup-instructions)
3. [Getting Training Data](#getting-training-data)
4. [Manual Model Training](#manual-model-training)
5. [Automated Model Training](#automated-model-training)
6. [Monitoring Training](#monitoring-training)
7. [Using Trained Models](#using-trained-models)

---

## 1. Pre-requisites

### System Requirements
- Python 3.10 or higher
- CUDA 11.8+ (for GPU acceleration - optional but recommended)
- 8GB RAM minimum (16GB recommended)
- 10GB free disk space

### Current Models in System
```
backend/python/best.pt        (6.0 MB)  - April 1, 2026
backend/python/best_v2.pt     (5.5 MB)  - May 1, 2026
backend/python/best_new.pt    (6.2 MB)  - April 1, 2026
```

---

## 2. Setup Instructions

### Step 1: Install Python
**Windows:**
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or 3.10
3. Run installer
4. **IMPORTANT:** Check "Add Python to PATH"
5. Click "Install Now"

**Verify installation:**
```bash
python --version
pip --version
```

### Step 2: Install Required Libraries
```bash
# Navigate to backend directory
cd backend

# Install all dependencies
pip install ultralytics opencv-python numpy torch torchvision torchaudio pillow pyyaml
pip install roboflow  # For accessing Roboflow datasets
pip install pandas matplotlib scipy tqdm
```

**Verify installations:**
```bash
python -c "import torch; print(torch.__version__)"
python -c "from ultralytics import YOLO; print('YOLO ready')"
```

### Step 3: Check GPU Support (Optional)
```bash
python -c "import torch; print('GPU Available:', torch.cuda.is_available())"
```

---

## 3. Getting Training Data

### Option A: Use Roboflow (Recommended for Beginners)

**Benefits:**
- Pre-annotated floor plan datasets
- Easy integration
- Automatic format conversion

**Steps:**
1. Go to https://universe.roboflow.com
2. Search for "floor plan" or "architectural plan"
3. Pick a public dataset → Click "Download"
4. Choose "YOLOv8" format
5. Save dataset to: `backend/datasets/floor-plans/`

**Roboflow Popular Datasets:**
- Floor Plan Detection
- Room Detection
- Door & Window Detection
- Architectural Elements

### Option B: Use Custom Data

**Directory Structure:**
```
backend/datasets/floor-plans/
├── images/
│   ├── train/
│   │   ├── image1.jpg
│   │   ├── image2.jpg
│   │   └── ...
│   ├── val/
│   │   ├── image1.jpg
│   │   └── ...
│   └── test/
│       └── ...
├── labels/
│   ├── train/
│   │   ├── image1.txt
│   │   └── ...
│   ├── val/
│   │   └── ...
│   └── test/
│       └── ...
└── data.yaml
```

**Label Format (YOLO Format):**
Each image has a `.txt` file with one line per object:
```
<class_id> <x_center> <y_center> <width> <height>
```
Values: 0-1 (normalized to image dimensions)

**Example `data.yaml`:**
```yaml
path: /path/to/backend/datasets/floor-plans
train: images/train
val: images/val
test: images/test

nc: 5  # number of classes
names: ['wall', 'door', 'window', 'room', 'furniture']  # class names
```

### Option C: Generate Synthetic Data
Use these tools to create annotated training data:
- **Label Studio**: https://labelstud.io/
- **CVAT**: https://www.cvat.ai/
- **Roboflow Annotate**: https://roboflow.com/annotate
- **Makesense.ai**: https://www.makesense.ai/

---

## 4. Manual Model Training

### Method 1: Using Training Script (Easiest)

**Create `backend/python/train_model.py`:**

```python
from ultralytics import YOLO

# Load a pretrained model
model = YOLO('yolov8n.pt')  # nano model (fastest, less accurate)
# Or use: 'yolov8s.pt' (small), 'yolov8m.pt' (medium), 'yolov8l.pt' (large)

# Train the model
results = model.train(
    data='../datasets/floor-plans/data.yaml',  # Path to dataset config
    epochs=100,                                  # Number of training epochs
    imgsz=640,                                   # Image size
    batch=16,                                    # Batch size (adjust based on GPU memory)
    patience=20,                                 # Early stopping patience
    device=0,                                    # GPU device (0 for first GPU, 'cpu' for CPU)
    save=True,                                   # Save trained model
    project='runs/detect',                       # Project directory
    name='floor_plan_model_v3',                 # Run name
    verbose=True
)

# Validate the model
metrics = model.val()

# Export the model
model.export(format='onnx')  # Export to ONNX format
```

**Run training:**
```bash
cd backend/python
python train_model.py
```

### Method 2: Direct Command Line

```bash
cd backend/python

# Train using YOLOv8
yolo detect train data=../datasets/floor-plans/data.yaml model=yolov8m.pt epochs=100 imgsz=640 device=0

# For CPU training (slower but no GPU needed)
yolo detect train data=../datasets/floor-plans/data.yaml model=yolov8m.pt epochs=100 device=cpu
```

### Method 3: Python Script with Advanced Options

**Create `backend/python/advanced_train.py`:**

```python
from ultralytics import YOLO
import torch

# Check available resources
print(f"GPU Available: {torch.cuda.is_available()}")
if torch.cuda.is_available():
    print(f"GPU Device: {torch.cuda.get_device_name(0)}")

# Load base model
model = YOLO('yolov8m.pt')  # Medium model for balance

# Advanced training configuration
results = model.train(
    data='../datasets/floor-plans/data.yaml',
    epochs=150,
    imgsz=640,
    batch=32,  # Increase if GPU allows
    patience=25,
    device=0,
    save=True,
    project='runs/detect',
    name='floor_plan_advanced_v1',
    
    # Augmentation
    augment=True,
    mosaic=1.0,
    mixup=0.1,
    
    # Optimization
    optimizer='SGD',  # or 'Adam'
    lr0=0.01,
    lrf=0.01,
    momentum=0.937,
    weight_decay=0.0005,
    
    # Callbacks
    verbose=True,
    save_period=10,  # Save every 10 epochs
)

print("Training completed!")
print(f"Best model: {results.save_dir}/weights/best.pt")
```

**Run advanced training:**
```bash
python advanced_train.py
```

---

## 5. Automated Model Training

### Auto-Training Script with Scheduling

**Create `backend/python/auto_train.py`:**

```python
import os
import json
import time
import schedule
from datetime import datetime
from ultralytics import YOLO
import torch

class AutoTrainer:
    def __init__(self):
        self.log_file = 'training_log.json'
        self.dataset_path = '../datasets/floor-plans/data.yaml'
        self.model_dir = 'models'
        
        if not os.path.exists(self.model_dir):
            os.makedirs(self.model_dir)
    
    def log_training(self, status, details):
        """Log training status"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'status': status,
            'details': details
        }
        
        logs = []
        if os.path.exists(self.log_file):
            with open(self.log_file, 'r') as f:
                logs = json.load(f)
        
        logs.append(log_entry)
        
        with open(self.log_file, 'w') as f:
            json.dump(logs, f, indent=2)
    
    def train_model(self):
        """Execute model training"""
        try:
            self.log_training('started', 'Auto training started')
            
            # Load model
            model = YOLO('yolov8m.pt')
            
            # Train
            results = model.train(
                data=self.dataset_path,
                epochs=100,
                imgsz=640,
                batch=16,
                device=0 if torch.cuda.is_available() else 'cpu',
                save=True,
                project='runs/detect',
                name=f'auto_train_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
                verbose=False
            )
            
            # Save trained model
            best_model_path = os.path.join(
                results.save_dir, 'weights', 'best.pt'
            )
            output_path = os.path.join(
                self.model_dir, 
                f'best_{datetime.now().strftime("%Y%m%d_%H%M%S")}.pt'
            )
            
            import shutil
            shutil.copy(best_model_path, output_path)
            
            self.log_training('completed', f'Model saved to {output_path}')
            print(f"✅ Training completed! Model saved: {output_path}")
            
        except Exception as e:
            self.log_training('failed', str(e))
            print(f"❌ Training failed: {e}")
    
    def start_scheduler(self, train_time='02:00'):
        """Start automatic training scheduler"""
        schedule.every().day.at(train_time).do(self.train_model)
        
        print(f"🤖 Auto-trainer scheduled for {train_time} daily")
        
        while True:
            schedule.run_pending()
            time.sleep(60)

if __name__ == '__main__':
    trainer = AutoTrainer()
    
    # Option 1: Train immediately
    # trainer.train_model()
    
    # Option 2: Schedule for 2 AM daily
    trainer.start_scheduler('02:00')
```

**Run auto-trainer:**
```bash
pip install schedule
python auto_train.py
```

---

## 6. Monitoring Training

### Real-time Monitoring

**During training, check:**
- Training runs folder: `backend/python/runs/detect/`
- TensorBoard visualization:
  ```bash
  tensorboard --logdir=runs/detect
  # Open http://localhost:6006 in browser
  ```

### Training Metrics to Watch

- **mAP@50**: Average Precision at 50% IOU (should increase)
- **Loss**: Should decrease over time
- **Precision/Recall**: Should increase

---

## 7. Using Trained Models

### Update Backend to Use New Model

**Edit `backend/routes/common/ai-designer.js`:**

```javascript
// Replace model path
const MODEL_PATH = './python/best_v3.pt';  // Your trained model

// The backend already handles model loading through Python scripts
```

### Test Trained Model

**Create `backend/python/test_model.py`:**

```python
from ultralytics import YOLO
import cv2

# Load your trained model
model = YOLO('models/best_20260513_120000.pt')

# Test on an image
results = model.predict(
    source='../uploads/plans/test_image.jpg',
    conf=0.5,
    device=0
)

# Print results
for result in results:
    print(result.boxes)
    print(f"Detections: {len(result.boxes)}")

# Save annotated image
results[0].save('output_annotated.jpg')
```

---

## 📊 Model Comparison

| Model Size | Speed | Accuracy | GPU Memory |
|-----------|-------|----------|-----------|
| Nano (n)   | ⚡⚡⚡   | ⭐⭐     | 2GB       |
| Small (s)  | ⚡⚡    | ⭐⭐⭐   | 3GB       |
| Medium (m) | ⚡     | ⭐⭐⭐⭐  | 5GB       |
| Large (l)  | 🐌    | ⭐⭐⭐⭐⭐ | 8GB+      |

---

## 🚀 Quick Start Commands

### For Complete Beginners
```bash
# 1. Install Python & dependencies
pip install ultralytics opencv-python

# 2. Download dataset from Roboflow
# (Save to: backend/datasets/floor-plans/)

# 3. Train model
cd backend/python
yolo detect train data=../datasets/floor-plans/data.yaml model=yolov8m.pt epochs=50 device=cpu

# 4. Use trained model
python test_model.py
```

### For GPU Users
```bash
# Install PyTorch with CUDA
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118

# Train with GPU
yolo detect train data=../datasets/floor-plans/data.yaml model=yolov8m.pt epochs=100 device=0
```

---

## ❓ FAQ

**Q: Can I train without a GPU?**
A: Yes! Use `device=cpu`, but it will be slower (10-100x slower depending on model size).

**Q: How long does training take?**
A: 1-24 hours depending on dataset size, model size, and hardware.

**Q: My training stops randomly?**
A: Check RAM/GPU memory. Reduce batch size: `batch=8` (instead of 16).

**Q: How do I know if training is good?**
A: Watch mAP@50 metric. If it stops increasing for 20+ epochs, training is done.

**Q: Can I use multiple GPUs?**
A: Yes! `device=0,1` for dual GPU training.

---

## 📞 Support Resources

- **Ultralytics Docs**: https://docs.ultralytics.com/
- **YOLOv8 GitHub**: https://github.com/ultralytics/ultralytics
- **Roboflow Docs**: https://docs.roboflow.com/
- **YOLO Training Guide**: https://docs.ultralytics.com/modes/train/

---

**Last Updated**: May 13, 2026
**Current Models Available**: 3 (best.pt, best_v2.pt, best_new.pt)
**Status**: Ready for training
