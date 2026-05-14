@echo off
REM ========================================================================
REM SETUP SCRIPT FOR YOLO MODEL TRAINING
REM ========================================================================
REM This script sets up Python and all required dependencies for training
REM
REM Run this script ONCE to set up your environment
REM ========================================================================

echo.
echo ========================================================================
echo YOLO MODEL TRAINING - SETUP SCRIPT
echo ========================================================================
echo.

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ❌ Python is not installed or not in PATH
    echo.
    echo Please install Python 3.10+ from: https://www.python.org/downloads/
    echo.
    echo IMPORTANT: During installation, check the option:
    echo    [✓] Add Python to PATH
    echo.
    echo After installation, restart this script.
    echo.
    pause
    exit /b 1
)

REM Show Python version
echo ✅ Python is installed:
python --version
echo.

REM Upgrade pip
echo Installing/upgrading pip...
python -m pip install --upgrade pip setuptools wheel
if %errorlevel% neq 0 (
    echo ❌ Failed to upgrade pip
    pause
    exit /b 1
)
echo ✅ pip upgraded
echo.

REM Install core dependencies
echo Installing core dependencies...
pip install ultralytics opencv-python numpy torch torchvision torchaudio pillow pyyaml
if %errorlevel% neq 0 (
    echo ❌ Failed to install core dependencies
    pause
    exit /b 1
)
echo ✅ Core dependencies installed
echo.

REM Install optional dependencies
echo Installing optional dependencies...
pip install schedule roboflow pandas matplotlib scipy tqdm
echo ✅ Optional dependencies installed
echo.

REM Verify installations
echo.
echo ========================================================================
echo VERIFICATION
echo ========================================================================
echo.

echo Checking PyTorch...
python -c "import torch; print(f'✅ PyTorch {torch.__version__}'); print(f'   GPU Available: {torch.cuda.is_available()}')" || echo "❌ PyTorch check failed"
echo.

echo Checking Ultralytics...
python -c "from ultralytics import YOLO; print('✅ Ultralytics YOLO ready')" || echo "❌ Ultralytics check failed"
echo.

echo Checking OpenCV...
python -c "import cv2; print(f'✅ OpenCV {cv2.__version__}')" || echo "❌ OpenCV check failed"
echo.

REM Create necessary directories
echo.
echo Creating required directories...
if not exist "..\datasets\floor-plans\images\train" mkdir ..\datasets\floor-plans\images\train
if not exist "..\datasets\floor-plans\images\val" mkdir ..\datasets\floor-plans\images\val
if not exist "..\datasets\floor-plans\images\test" mkdir ..\datasets\floor-plans\images\test
if not exist "..\datasets\floor-plans\labels\train" mkdir ..\datasets\floor-plans\labels\train
if not exist "..\datasets\floor-plans\labels\val" mkdir ..\datasets\floor-plans\labels\val
if not exist "..\datasets\floor-plans\labels\test" mkdir ..\datasets\floor-plans\labels\test
if not exist "models" mkdir models
if not exist "runs\detect" mkdir runs\detect
echo ✅ Directories created
echo.

REM Show next steps
echo.
echo ========================================================================
echo SETUP COMPLETE! ✅
echo ========================================================================
echo.
echo Next steps:
echo   1. Prepare your training dataset (images and YOLO format labels)
echo   2. Copy dataset to: ..\datasets\floor-plans\
echo   3. Create data.yaml configuration file
echo   4. Run training:
echo      - Manual:  python train_model.py
echo      - Auto:    python auto_train_scheduler.py --now
echo.
echo For detailed instructions, see: MODEL_TRAINING_GUIDE.md
echo.
pause
