# 🗄️ MongoDB Connection Guide

## Current Status

Your system has MongoDB URI configured:
```
mongodb+srv://saveenkudagama_db_user:Saveen123@cluster0.5ep9gwn.mongodb.net/3dhouse_db
```

**Issue**: Cannot connect (ECONNREFUSED)

---

## 🔧 Solutions (Choose One)

### Option 1: Fix MongoDB Atlas IP Whitelist (Most Common)

**Step 1: Get Your IP Address**
```bash
# Windows
ipconfig

# Linux/Mac
ifconfig
```
Look for "IPv4 Address"

**Step 2: Add to MongoDB Atlas**
1. Go to: https://cloud.mongodb.com
2. Sign in with: `saveenkudagama_db_user` / `Saveen123`
3. Click: **Network Access** (left menu)
4. Click: **+ Add IP Address**
5. Enter your IP address (from Step 1)
6. Click: **Confirm**

**Step 3: Test Connection**
```bash
cd backend
npm start
```

---

### Option 2: Use MongoDB Locally (Fastest for Testing)

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Create `.env` in `backend/`:
```
MONGODB_URI=mongodb://localhost:27017/3dhouse_db
```
4. Start MongoDB service
5. Run: `npm start`

**Linux/Mac:**
```bash
# Install MongoDB
brew install mongodb-community  # macOS
sudo apt-get install mongodb    # Ubuntu

# Start MongoDB
brew services start mongodb-community

# Or manually
mongod --dbpath /path/to/db

# Then test
cd backend
npm start
```

---

### Option 3: Use MongoDB Atlas (Cloud) - Setup

If Atlas isn't working, restart your cluster:

1. Go to: https://cloud.mongodb.com
2. Click: **Clusters** (left menu)
3. Find your cluster: `cluster0`
4. Check status (should be **Available**)
5. If paused, click: **Resume**
6. Wait 5-10 minutes for it to start

---

## 📊 Quick Test

Run this to test connection:

```bash
cd backend
node -e "
const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB Connected!'))
  .catch(err => console.error('❌ Connection Failed:', err.message));
"
```

---

## 🔍 Troubleshooting

### "ECONNREFUSED" Error
**Cause**: Cannot reach MongoDB server

**Fix**:
1. Check internet connection
2. Add your IP to MongoDB Atlas whitelist
3. Or use local MongoDB instead

### "Authentication Failed" Error
**Cause**: Wrong username/password

**Fix**:
```env
# Check these are correct in .env
MONGODB_URI=mongodb+srv://username:password@host/database
```

### "Cluster Not Found" Error
**Cause**: Wrong URL or cluster paused

**Fix**:
1. Verify cluster name: `cluster0`
2. Check cluster status in Atlas
3. Resume cluster if paused

### "ENOTFOUND" Error
**Cause**: DNS resolution problem

**Fix**:
1. Check internet connection
2. Restart your computer
3. Try local MongoDB instead

---

## ✅ Recommended Setup

### For Development (Local)
```bash
# Simple, no internet needed
MONGODB_URI=mongodb://localhost:27017/3dhouse_db
```

### For Production (Cloud)
```bash
# Add your server IP to Atlas whitelist
MONGODB_URI=mongodb+srv://saveenkudagama_db_user:Saveen123@cluster0.5ep9gwn.mongodb.net/3dhouse_db
```

---

## 🚀 After Connecting

Once MongoDB connects, you'll see:
```
✅ MongoDB connected successfully
Using real MongoDB routes for Auth and Favorites
```

Then:
1. Admin account auto-created
2. Database features enabled
3. All routes work with real data

---

## 📞 Need Help?

### MongoDB Atlas Support
- Docs: https://docs.mongodb.com/manual/
- Support: https://support.mongodb.com

### Connection String Format
```
mongodb+srv://username:password@host/database?retryWrites=true&w=majority
```

Components:
- `username` : Database user
- `password` : Database password  
- `host` : Cluster address
- `database` : Database name

---

## 📋 Checklist

- [ ] I can see my IP address (`ipconfig` or `ifconfig`)
- [ ] I added my IP to MongoDB Atlas whitelist
- [ ] My cluster is running (not paused)
- [ ] My credentials are correct in `.env`
- [ ] I can reach mongodb.com from my browser
- [ ] I ran `npm start` and got ✅ MongoDB connected

