#!/bin/bash
# ========================================================================
# SETUP SCRIPT FOR YOLO MODEL TRAINING (Linux/Mac)
# ========================================================================
# This script sets up Python and all required dependencies for training
#
# Run: bash setup.sh
# ========================================================================

echo ""
echo "========================================================================"
echo "YOLO MODEL TRAINING - SETUP SCRIPT"
echo "========================================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed"
    echo ""
    echo "Install with:"
    echo "  Ubuntu/Debian: sudo apt-get install python3 python3-pip"
    echo "  macOS: brew install python3"
    echo ""
    exit 1
fi

# Show Python version
echo "✅ Python is installed:"
python3 --version
echo ""

# Upgrade pip
echo "Installing/upgrading pip..."
python3 -m pip install --upgrade pip setuptools wheel
if [ $? -ne 0 ]; then
    echo "❌ Failed to upgrade pip"
    exit 1
fi
echo "✅ pip upgraded"
echo ""

# Install core dependencies
echo "Installing core dependencies (this may take a few minutes)..."
pip install ultralytics opencv-python numpy torch torchvision torchaudio pillow pyyaml
if [ $? -ne 0 ]; then
    echo "❌ Failed to install core dependencies"
    exit 1
fi
echo "✅ Core dependencies installed"
echo ""

# Install optional dependencies
echo "Installing optional dependencies..."
pip install schedule roboflow pandas matplotlib scipy tqdm
echo "✅ Optional dependencies installed"
echo ""

# Verify installations
echo ""
echo "========================================================================"
echo "VERIFICATION"
echo "========================================================================"
echo ""

echo "Checking PyTorch..."
python3 -c "import torch; print(f'✅ PyTorch {torch.__version__}'); print(f'   GPU Available: {torch.cuda.is_available()}')" || echo "❌ PyTorch check failed"
echo ""

echo "Checking Ultralytics..."
python3 -c "from ultralytics import YOLO; print('✅ Ultralytics YOLO ready')" || echo "❌ Ultralytics check failed"
echo ""

echo "Checking OpenCV..."
python3 -c "import cv2; print(f'✅ OpenCV {cv2.__version__}')" || echo "❌ OpenCV check failed"
echo ""

# Create necessary directories
echo ""
echo "Creating required directories..."
mkdir -p ../datasets/floor-plans/images/{train,val,test}
mkdir -p ../datasets/floor-plans/labels/{train,val,test}
mkdir -p models
mkdir -p runs/detect
echo "✅ Directories created"
echo ""

# Show next steps
echo ""
echo "========================================================================"
echo "SETUP COMPLETE! ✅"
echo "========================================================================"
echo ""
echo "Next steps:"
echo "  1. Prepare your training dataset (images and YOLO format labels)"
echo "  2. Copy dataset to: ../datasets/floor-plans/"
echo "  3. Create data.yaml configuration file"
echo "  4. Run training:"
echo "     - Manual:  python3 train_model.py"
echo "     - Auto:    python3 auto_train_scheduler.py --now"
echo ""
echo "For detailed instructions, see: MODEL_TRAINING_GUIDE.md"
echo ""
