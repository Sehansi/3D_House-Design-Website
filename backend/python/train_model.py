"""
train_model.py
==============
Simple YOLO model training script for floor plan detection.

Usage:
    python train_model.py

Requirements:
    - ultralytics
    - opencv-python
    - torch
    - torchvision

Setup:
    1. Prepare your dataset in YOLO format
    2. Create data.yaml with dataset paths
    3. Run this script
"""

import os
import sys
import json
from datetime import datetime
from pathlib import Path

try:
    from ultralytics import YOLO
    import torch
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Install with: pip install ultralytics torch torchvision")
    sys.exit(1)


def check_environment():
    """Check system environment for training"""
    print("\n" + "="*60)
    print("🔍 ENVIRONMENT CHECK")
    print("="*60)
    
    print(f"✓ Python version: {sys.version.split()[0]}")
    print(f"✓ PyTorch version: {torch.__version__}")
    print(f"✓ GPU Available: {torch.cuda.is_available()}")
    
    if torch.cuda.is_available():
        print(f"✓ GPU Device: {torch.cuda.get_device_name(0)}")
        print(f"✓ GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
        device = 0
    else:
        print("⚠️  GPU not available, using CPU (slower)")
        device = 'cpu'
    
    return device


def check_dataset(dataset_path):
    """Verify dataset exists and has required structure"""
    print("\n" + "="*60)
    print("📊 DATASET CHECK")
    print("="*60)
    
    if not Path(dataset_path).exists():
        print(f"❌ Dataset not found: {dataset_path}")
        print("\nExpected structure:")
        print("""
        datasets/floor-plans/
        ├── images/
        │   ├── train/
        │   ├── val/
        │   └── test/
        ├── labels/
        │   ├── train/
        │   ├── val/
        │   └── test/
        └── data.yaml
        """)
        return False
    
    print(f"✓ Dataset path: {dataset_path}")
    
    # Check for data.yaml
    yaml_path = Path(dataset_path) / 'data.yaml'
    if yaml_path.exists():
        print(f"✓ Found data.yaml")
    else:
        print(f"⚠️  data.yaml not found")
    
    # Count images
    train_images = list(Path(dataset_path).glob('images/train/*'))
    val_images = list(Path(dataset_path).glob('images/val/*'))
    
    print(f"✓ Training images: {len(train_images)}")
    print(f"✓ Validation images: {len(val_images)}")
    
    if len(train_images) == 0:
        print("❌ No training images found!")
        return False
    
    return True


def train_model(config):
    """Train YOLO model with given configuration"""
    print("\n" + "="*60)
    print("🚀 STARTING TRAINING")
    print("="*60)
    
    try:
        # Load base model
        print(f"\n📦 Loading base model: {config['model']}")
        model = YOLO(config['model'])
        
        # Train model
        print(f"⏳ Training will start now...")
        print(f"   - Epochs: {config['epochs']}")
        print(f"   - Batch size: {config['batch']}")
        print(f"   - Image size: {config['imgsz']}")
        print(f"   - Device: {config['device']}")
        
        results = model.train(
            data=config['data_yaml'],
            epochs=config['epochs'],
            imgsz=config['imgsz'],
            batch=config['batch'],
            patience=config['patience'],
            device=config['device'],
            save=True,
            project=config['project_dir'],
            name=config['run_name'],
            verbose=True,
            augment=True,
            mosaic=1.0,
        )
        
        print("\n" + "="*60)
        print("✅ TRAINING COMPLETED")
        print("="*60)
        
        # Show results
        best_model_path = Path(results.save_dir) / 'weights' / 'best.pt'
        print(f"\n📍 Best model saved: {best_model_path}")
        print(f"📍 Training directory: {results.save_dir}")
        
        # Validation results
        print("\n📊 Final Metrics:")
        print(f"   - mAP@50: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
        print(f"   - Box Loss: {results.results_dict.get('train/box_loss', 'N/A')}")
        
        return {
            'status': 'success',
            'model_path': str(best_model_path),
            'results_dir': str(results.save_dir),
            'timestamp': datetime.now().isoformat()
        }
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            'status': 'failed',
            'error': str(e),
            'timestamp': datetime.now().isoformat()
        }


def save_training_log(log_data):
    """Save training results to JSON log"""
    log_file = Path('training_log.json')
    
    logs = []
    if log_file.exists():
        with open(log_file, 'r') as f:
            logs = json.load(f)
    
    logs.append(log_data)
    
    with open(log_file, 'w') as f:
        json.dump(logs, f, indent=2)
    
    print(f"\n📝 Training log saved: {log_file}")


def main():
    """Main training pipeline"""
    print("\n" + "="*60)
    print("YOLO MODEL TRAINING - FLOOR PLAN DETECTION")
    print("="*60)
    
    # Configuration
    config = {
        'model': 'yolov8m.pt',  # Can use: yolov8n, yolov8s, yolov8m, yolov8l, yolov8x
        'data_yaml': '../datasets/floor-plans/data.yaml',
        'epochs': 100,
        'batch': 16,  # Reduce if GPU out of memory
        'imgsz': 640,
        'patience': 20,  # Early stopping patience
        'project_dir': 'runs/detect',
        'run_name': f'floor_plan_{datetime.now().strftime("%Y%m%d_%H%M%S")}',
    }
    
    # Check environment
    device = check_environment()
    config['device'] = device
    
    # Check dataset
    if not check_dataset(config['data_yaml']):
        print("\n❌ Dataset check failed. Please prepare your dataset first.")
        print("\nFor help, see: MODEL_TRAINING_GUIDE.md")
        sys.exit(1)
    
    # Train model
    results = train_model(config)
    
    # Save log
    save_training_log(results)
    
    # Print summary
    print("\n" + "="*60)
    print("📋 SUMMARY")
    print("="*60)
    print(json.dumps(results, indent=2))


if __name__ == '__main__':
    main()
