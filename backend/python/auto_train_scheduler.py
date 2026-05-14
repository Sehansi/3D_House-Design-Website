"""
auto_train_scheduler.py
=======================
Automatic YOLO model training with scheduling and logging.

This script automatically trains the model at specified times.

Usage:
    python auto_train_scheduler.py

Commands:
    - python auto_train_scheduler.py --now      # Train immediately
    - python auto_train_scheduler.py --schedule # Schedule for 2 AM daily
    - python auto_train_scheduler.py --status   # Show training status

Requirements:
    - schedule
    - ultralytics
    - torch
"""

import os
import sys
import json
import time
import argparse
from pathlib import Path
from datetime import datetime
import threading

try:
    import schedule
    from ultralytics import YOLO
    import torch
except ImportError as e:
    print(f"❌ Missing dependency: {e}")
    print("Install with: pip install schedule ultralytics torch")
    sys.exit(1)


class AutoTrainer:
    """Automatic model training manager"""
    
    def __init__(self):
        self.log_file = Path('training_log.json')
        self.dataset_path = Path('../datasets/floor-plans/data.yaml')
        self.model_dir = Path('models')
        self.config_file = Path('auto_train_config.json')
        
        # Create directories
        self.model_dir.mkdir(exist_ok=True)
        
        # Load or create config
        self.config = self.load_config()
    
    def load_config(self):
        """Load training configuration"""
        if self.config_file.exists():
            with open(self.config_file, 'r') as f:
                return json.load(f)
        
        return {
            'model': 'yolov8m.pt',
            'epochs': 100,
            'batch': 16,
            'imgsz': 640,
            'patience': 20,
            'schedule_time': '02:00',  # 2 AM
            'enabled': True
        }
    
    def save_config(self):
        """Save training configuration"""
        with open(self.config_file, 'w') as f:
            json.dump(self.config, f, indent=2)
    
    def log_training(self, status, details):
        """Log training event"""
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'status': status,
            'details': details
        }
        
        logs = []
        if self.log_file.exists():
            with open(self.log_file, 'r') as f:
                logs = json.load(f)
        
        logs.append(log_entry)
        
        with open(self.log_file, 'w') as f:
            json.dump(logs, f, indent=2)
        
        return log_entry
    
    def check_dataset(self):
        """Verify dataset exists"""
        if not self.dataset_path.exists():
            print(f"❌ Dataset not found: {self.dataset_path}")
            return False
        
        train_images = list(self.dataset_path.parent.glob('images/train/*'))
        if not train_images:
            print(f"❌ No training images found")
            return False
        
        return True
    
    def train_model(self):
        """Execute model training"""
        print("\n" + "="*70)
        print("🚀 AUTO TRAINING STARTED")
        print("="*70)
        print(f"⏰ Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        
        try:
            # Check dataset
            if not self.check_dataset():
                self.log_training('failed', 'Dataset validation failed')
                return False
            
            # Check GPU
            device = 0 if torch.cuda.is_available() else 'cpu'
            if device == 0:
                gpu_info = torch.cuda.get_device_name(0)
                print(f"💻 Using GPU: {gpu_info}")
            else:
                print(f"💻 Using CPU (slower)")
            
            self.log_training('started', {
                'model': self.config['model'],
                'device': device,
                'epochs': self.config['epochs']
            })
            
            # Load model
            print(f"📦 Loading model: {self.config['model']}")
            model = YOLO(self.config['model'])
            
            # Train
            print(f"⏳ Training started (this may take a while)...")
            results = model.train(
                data=str(self.dataset_path),
                epochs=self.config['epochs'],
                imgsz=self.config['imgsz'],
                batch=self.config['batch'],
                patience=self.config['patience'],
                device=device,
                save=True,
                project='runs/detect',
                name=f"auto_{datetime.now().strftime('%Y%m%d_%H%M%S')}",
                verbose=False
            )
            
            # Save best model
            best_path = Path(results.save_dir) / 'weights' / 'best.pt'
            output_path = self.model_dir / f"best_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pt"
            
            import shutil
            shutil.copy(best_path, output_path)
            
            self.log_training('completed', {
                'model_path': str(output_path),
                'results_dir': str(results.save_dir),
                'epochs': self.config['epochs']
            })
            
            print("\n" + "="*70)
            print("✅ TRAINING COMPLETED SUCCESSFULLY")
            print("="*70)
            print(f"📍 Model saved: {output_path}")
            print(f"📊 Results: {results.save_dir}")
            
            return True
            
        except Exception as e:
            error_msg = str(e)
            print(f"\n❌ Training failed: {error_msg}")
            
            self.log_training('failed', {
                'error': error_msg,
                'model': self.config['model']
            })
            
            return False
    
    def start_scheduler(self, schedule_time='02:00'):
        """Start scheduled training"""
        print("\n" + "="*70)
        print("🤖 AUTO TRAINER SCHEDULER")
        print("="*70)
        print(f"⏰ Scheduled training time: {schedule_time} daily")
        print(f"📝 Logs will be saved to: {self.log_file}")
        print(f"💾 Models will be saved to: {self.model_dir}")
        print("\nPress Ctrl+C to stop scheduler\n")
        
        schedule.every().day.at(schedule_time).do(self.train_model)
        
        try:
            while True:
                schedule.run_pending()
                time.sleep(60)
        except KeyboardInterrupt:
            print("\n⛔ Scheduler stopped")
    
    def show_status(self):
        """Show training status and history"""
        print("\n" + "="*70)
        print("📊 TRAINING STATUS")
        print("="*70)
        
        # Config
        print("\n⚙️  Configuration:")
        print(f"   Model: {self.config['model']}")
        print(f"   Epochs: {self.config['epochs']}")
        print(f"   Batch: {self.config['batch']}")
        print(f"   Schedule: {self.config['schedule_time']} daily")
        print(f"   Enabled: {'Yes' if self.config['enabled'] else 'No'}")
        
        # Dataset
        print("\n📊 Dataset:")
        if self.dataset_path.exists():
            train_images = list(self.dataset_path.parent.glob('images/train/*'))
            val_images = list(self.dataset_path.parent.glob('images/val/*'))
            print(f"   ✓ Training images: {len(train_images)}")
            print(f"   ✓ Validation images: {len(val_images)}")
        else:
            print(f"   ✗ Dataset not found")
        
        # Recent trainings
        print("\n📜 Recent Trainings:")
        if self.log_file.exists():
            with open(self.log_file, 'r') as f:
                logs = json.load(f)
            
            recent = logs[-5:] if len(logs) > 5 else logs
            for i, log in enumerate(reversed(recent), 1):
                timestamp = log['timestamp'][:10]
                status = log['status']
                icon = '✅' if status == 'completed' else '❌' if status == 'failed' else '⏳'
                print(f"   {icon} [{timestamp}] {status}")
        else:
            print("   No training history")
        
        # Models
        print("\n💾 Saved Models:")
        models = list(self.model_dir.glob('best_*.pt'))
        if models:
            for model_file in sorted(models)[-3:]:
                size_mb = model_file.stat().st_size / (1024*1024)
                print(f"   📦 {model_file.name} ({size_mb:.1f} MB)")
        else:
            print("   No models saved yet")


def main():
    parser = argparse.ArgumentParser(
        description='YOLO Auto-Training Scheduler'
    )
    parser.add_argument(
        '--now',
        action='store_true',
        help='Train immediately'
    )
    parser.add_argument(
        '--schedule',
        action='store_true',
        help='Start scheduler (default: 2 AM daily)'
    )
    parser.add_argument(
        '--status',
        action='store_true',
        help='Show training status'
    )
    
    args = parser.parse_args()
    
    trainer = AutoTrainer()
    
    if args.now:
        trainer.train_model()
    elif args.status:
        trainer.show_status()
    else:
        # Default: start scheduler
        trainer.start_scheduler(trainer.config['schedule_time'])


if __name__ == '__main__':
    main()
