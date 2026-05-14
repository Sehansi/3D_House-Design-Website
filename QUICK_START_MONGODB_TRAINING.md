# 🚀 Quick Start: MongoDB + Model Training + Run System

## Your MongoDB Credentials (Already Configured ✅)

```
Username: saveenkudagama_db_user
Password: Saveen123
Cluster: cluster0.5ep9gwn.mongodb.net
Database: 3dhouse_db
```

**✅ Already in your `.env` file!** No need to configure.

---

## Step 1️⃣: Verify MongoDB Connection

### Command:
```bash
cd backend
node test-connection.js
```

### Expected Output:
```
🔄 Testing MongoDB connection...
✅ MongoDB connected successfully!
📊 Database: 3dhouse_db
🖥️ Host: cluster0.5ep9gwn.mongodb.net
👤 Admin users in database: 1
   Email: admin@gmail.com
   Name: System Administrator
✅ Test completed - connection closed
```

### If Connection Fails ❌

**Error: "queryA ECONNREFUSED"**
- Solution: Check internet connection
- Check: https://cloud.mongodb.com → Your Cluster → Network Access
- Allow your IP address if needed

**Error: "Authentication failed"**
- Solution: Verify username/password in `.env`
- Your credentials: `saveenkudagama_db_user` / `Saveen123`

---

## Step 2️⃣: Train YOLO Model

### Prerequisites: Python & Dependencies

```bash
# Install Python packages
cd backend/python
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist:
```bash
pip install torch torchvision ultralytics opencv-python roboflow pandas numpy Pillow
```

### Training Command:

```bash
cd backend/python
python train_model.py
```

### What Happens:
1. Downloads floor plan dataset from Roboflow ✅
2. Trains YOLO model for 100 epochs ✅
3. Creates `best.pt` (trained model) ✅
4. Saves training results ✅

### Training Output:
```
📥 Downloading dataset from Roboflow...
✅ Dataset downloaded: data/train, data/val, data/test

🤖 Starting YOLO training...
Epoch 1/100   Loss: 0.45   mAP: 0.32   ✓
Epoch 2/100   Loss: 0.42   mAP: 0.38   ✓
...
Epoch 100/100 Loss: 0.05   mAP: 0.92   ✓ BEST MODEL

💾 Model saved: runs/detect/best.pt
✅ Training completed!
```

### Training Time:
- GPU (NVIDIA): ~2-4 hours
- CPU: ~10-20 hours

### After Training:
Check that these files exist:
```
backend/python/runs/detect/
├── best.pt                    ← This is your trained model
├── last.pt
└── training_results.csv
```

---

## Step 3️⃣: Restart Backend (to Load Trained Model)

```bash
cd backend
npm start
```

### Expected Output:
```
MongoDB connection error: querySrv ECONNREFUSED
OR
✅ MongoDB connected successfully!

Using fallback in-memory routes for Auth and Favorites
✅ Default admin loaded (fallback mode) → admin@gmail.com / 123456
🚀 Gemini Service v10 (Smart Sleep & Lite Recovery) initialized
🤖 YOLO Model loaded from backend/python/best.pt
Server running on port 5000
```

---

## Step 4️⃣: Start Frontend (New Terminal Window)

```bash
cd frontend
npm start
```

### Expected:
- Terminal shows: "webpack compiled successfully"
- Browser opens: `http://localhost:3000`

---

## Step 5️⃣: Login

**URL:** `http://localhost:3000/signin`

**Credentials:**
```
Email: admin@gmail.com
Password: 123456
```

**After Login:**
- ✅ See Admin Dashboard
- ✅ Create projects
- ✅ Upload floor plans
- ✅ Use AI designer
- ✅ Trained YOLO model detects objects in images

---

## 🎯 Complete Checklist

| Step | Task | Status |
|------|------|--------|
| 1 | ✅ Run `node test-connection.js` | ? |
| 2 | ✅ Train model with `python train_model.py` | ? |
| 3 | ✅ Restart backend with `npm start` | ? |
| 4 | ✅ Start frontend with `npm start` | ? |
| 5 | ✅ Login with admin@gmail.com / 123456 | ? |
| 6 | ✅ Test upload floor plan image | ? |
| 7 | ✅ Test AI designer feature | ? |

---

## 🔍 Troubleshooting

### "Can't connect to MongoDB"
```bash
# Check internet connection
# Verify: https://cloud.mongodb.com → Network Access
# Allow your IP address
```

### "Model not found: best.pt"
```bash
# Train the model first
cd backend/python
python train_model.py
```

### "Invalid credentials" on login
```bash
# If using fallback (no MongoDB):
# Email: admin@gmail.com
# Password: 123456

# If MongoDB connected, verify user exists:
cd backend
node test-connection.js
```

### "YOLO model prediction is slow"
```bash
# Train for fewer epochs or use GPU
# Edit backend/python/train_model.py:
EPOCHS = 50         # Instead of 100
DEVICE = 'cuda'     # If you have NVIDIA GPU
```

---

## 📱 System Features (After Setup)

✅ **AI Designer** - Uses YOLO + Gemini to design from floor plans  
✅ **3D House Viewer** - View 3D models of houses  
✅ **Furniture Customizer** - Add/customize furniture  
✅ **Project Management** - Create and manage projects  
✅ **Role-Based Access** - Admin/Architect/Constructor/Customer  
✅ **Design Gallery** - Browse community designs  

---

## 🆘 Need Help?

Check these files for more info:
- `MONGODB_SETUP_GUIDE.md` - Detailed MongoDB setup
- `MODEL_TRAINING_GUIDE.md` - Detailed training guide
- `backend/server.js` - See how system initializes
- `backend/routes/auth/auth.js` - See authentication logic

---

## 🎬 Ready? Start Here:

```bash
# Terminal 1: Test MongoDB
cd backend
node test-connection.js

# Wait for ✅, then...

# Terminal 2: Train model (takes 2-20 hours depending on GPU)
cd backend/python
python train_model.py

# Wait for completion, then...

# Terminal 3: Start backend
cd backend
npm start

# Terminal 4: Start frontend
cd frontend
npm start

# Browser: http://localhost:3000/signin
# Login with: admin@gmail.com / 123456
```

**You're all set! 🎉**
