# MongoDB Setup & Integration Guide

## 📋 Table of Contents
1. [MongoDB Connection Setup](#mongodb-connection-setup)
2. [Configure Environment Variables](#configure-environment-variables)
3. [Verify Connection](#verify-connection)
4. [Load Sample Data (Dataset)](#load-sample-data)
5. [Train YOLO Model](#train-yolo-model)
6. [Run Complete System](#run-complete-system)

---

## 🔗 MongoDB Connection Setup

### Option 1: Local MongoDB (Recommended for Development)

**For Windows:**
1. Download MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Run the installer (.msi file)
3. Choose "Install MongoDB as a Service"
4. Default port: `27017`
5. Verify installation:
   ```bash
   mongosh
   # Should connect to: mongodb://localhost:27017/
   ```

### Option 2: MongoDB Atlas (Cloud)

If you have an existing MongoDB Atlas account:
1. Go to: https://cloud.mongodb.com
2. Select your cluster
3. Click "Connect"
4. Choose "Drivers" → "Node.js"
5. Copy connection string
6. Add your credentials to the string

### Option 3: Your Existing MongoDB

If you already have MongoDB running:
- Get connection string from your MongoDB setup
- Format: `mongodb://username:password@host:port/database`

---

## ⚙️ Configure Environment Variables

### Step 1: Edit backend/.env file

Open: `backend/.env`

**Replace MongoDB URI with your credentials:**

```env
# Local MongoDB (if running locally)
MONGODB_URI=mongodb://localhost:27017/3dhouse_db

# OR Cloud MongoDB (replace with your actual connection string)
# MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/3dhouse_db?retryWrites=true&w=majority

# Other settings
PORT=5000
NODE_ENV=development
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
GEMINI_API_KEY=your_gemini_api_key_here
ROBOFLOW_API_KEY=your_roboflow_api_key_here
```

### Step 2: Verify .env location

```
backend/
├── .env          ← THIS FILE
├── server.js
├── package.json
└── ...
```

---

## ✅ Verify Connection

### Step 1: Create Connection Test Script

Create file: `backend/test-connection.js`

```javascript
const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('🔄 Testing MongoDB connection...');
    console.log('Connection URI:', process.env.MONGODB_URI);
    
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });
    
    console.log('✅ MongoDB connected successfully!');
    console.log('📊 Database:', mongoose.connection.name);
    console.log('🖥️ Host:', mongoose.connection.host);
    
    // List collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('📁 Collections:', collections.map(c => c.name));
    
    await mongoose.disconnect();
    console.log('✅ Test completed - connection closed');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    process.exit(1);
  }
}

testConnection();
```

### Step 2: Run Test

```bash
cd backend
node test-connection.js
```

**Expected Output:**
```
🔄 Testing MongoDB connection...
✅ MongoDB connected successfully!
📊 Database: 3dhouse_db
🖥️ Host: localhost
📁 Collections: [User, Project, Design, ...]
```

---

## 📊 Load Sample Data (Dataset)

### Option 1: Seed Default Data (Recommended)

The system automatically creates admin user when MongoDB connects.

**Verify admin was created:**
```bash
cd backend
mongosh
> use 3dhouse_db
> db.users.find({role: 'Admin'}).pretty()
```

**Expected Result:**
```json
{
  "_id": ObjectId("..."),
  "email": "admin@gmail.com",
  "fullName": "System Administrator",
  "role": "Admin",
  "createdAt": ISODate("2026-05-14T...")
}
```

### Option 2: Import Custom Dataset

**Step 1: Prepare JSON file**

Create `dataset.json`:
```json
{
  "users": [
    {
      "email": "admin@gmail.com",
      "fullName": "Administrator",
      "password": "$2b$10$...",
      "role": "Admin"
    }
  ],
  "projects": [
    {
      "name": "Sample Project",
      "clientName": "John Doe",
      "status": "Active"
    }
  ]
}
```

**Step 2: Import using mongoimport**

```bash
mongoimport --db 3dhouse_db --collection users --file users.json --jsonArray
mongoimport --db 3dhouse_db --collection projects --file projects.json --jsonArray
```

---

## 🤖 Train YOLO Model

### Prerequisites

```bash
# Install Python dependencies (if not already done)
cd backend/python
pip install -r requirements.txt
```

If `requirements.txt` doesn't exist, create it:

```
torch==2.0.0
torchvision==0.15.0
opencv-python==4.8.0.74
ultralytics==8.0.0
roboflow==1.1.0
pandas==2.0.0
numpy==1.24.0
Pillow==10.0.0
```

### Training Steps

**Step 1: Download Dataset from Roboflow**

```bash
cd backend/python
python roboflow_extractor.py
```

Expected: Downloads floor plans dataset to `data/` folder

**Step 2: Train Model**

```bash
python train_model.py
```

**Configuration (edit `train_model.py`):**
```python
# Model settings
EPOCHS = 100              # Number of training epochs
BATCH_SIZE = 16          # Batch size
IMG_SIZE = 640           # Image size
PATIENCE = 20            # Early stopping patience
DEVICE = 'cuda'          # 'cuda' for GPU, 'cpu' for CPU

# Paths
DATA_DIR = 'data/'       # Dataset directory
OUTPUT_DIR = 'runs/'     # Output directory for trained models
```

**Step 3: Monitor Training**

Output shows:
```
Epoch 1/100   Loss: 0.45   mAP: 0.32   ✓
Epoch 2/100   Loss: 0.42   mAP: 0.38   ✓
...
Epoch 100/100 Loss: 0.05   mAP: 0.92   ✓ BEST MODEL
```

**Step 4: Verify Trained Model**

Check `backend/python/runs/detect/` for:
- `best.pt` - Best model checkpoint
- `training_results.csv` - Training metrics

---

## 🚀 Run Complete System

### Step 1: Start MongoDB

```bash
# Windows
mongod

# Mac/Linux
brew services start mongodb-community
```

### Step 2: Verify Connection

```bash
cd backend
node test-connection.js
```

Should show: ✅ **MongoDB connected successfully!**

### Step 3: Start Backend

```bash
cd backend
npm start
```

Expected output:
```
✅ MongoDB connected successfully
🚀 Gemini Service v10 initialized
🤖 YOLO Model loaded from backend/python/best.pt
🔐 Admin user created: admin@gmail.com
Server running on port 5000
```

### Step 4: Start Frontend (New Terminal)

```bash
cd frontend
npm start
```

Expected: React app opens at `http://localhost:3000`

### Step 5: Login

- **URL:** `http://localhost:3000/signin`
- **Email:** `admin@gmail.com`
- **Password:** `123456`

---

## 🔍 Troubleshooting

### Error: "MongoDB connection error"

**Solution:**
```bash
# Check if MongoDB is running
mongosh

# If not running, start it:
# Windows: mongod
# Mac: brew services start mongodb-community
# Linux: sudo systemctl start mongod
```

### Error: "Cannot find module 'torch'"

**Solution:**
```bash
cd backend/python
pip install torch torchvision
```

### Error: "Model not found: best.pt"

**Solution:**
```bash
# Train model first
cd backend/python
python train_model.py
```

### Error: "Invalid credentials"

**Solution:**
```bash
# Verify user exists in MongoDB
mongosh
> use 3dhouse_db
> db.users.findOne({role: 'Admin'})

# If empty, seed admin:
# Restart backend - it auto-creates admin user
```

---

## 📝 Complete Checklist

- [ ] MongoDB installed and running
- [ ] `.env` file configured with MongoDB URI
- [ ] Connection test passes (`test-connection.js`)
- [ ] Admin user created in database
- [ ] Dataset downloaded from Roboflow
- [ ] YOLO model trained (`best.pt` exists)
- [ ] Backend starts without errors
- [ ] Frontend starts at port 3000
- [ ] Login works with admin@gmail.com / 123456
- [ ] Can create projects and designs

---

## 🎯 Next Steps

1. ✅ Set up MongoDB (local or cloud)
2. ✅ Configure `.env` with connection string
3. ✅ Verify connection with `test-connection.js`
4. ✅ Train YOLO model
5. ✅ Start both backend and frontend
6. ✅ Log in and start using the system

**Questions? Check the troubleshooting section or review your .env file.**
