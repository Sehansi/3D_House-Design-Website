# 🔧 MongoDB Connection - Fix Guide

## Problem Identified

❌ **DNS resolution failed**: `queryA ECONNREFUSED cluster0.5ep9gwn.mongodb.net`

This means: **Your system cannot reach MongoDB Atlas servers**

---

## 🎯 Quick Solutions (Try These)

### Solution 1: Check Internet Connection (Fast)

```bash
# Test internet
ping google.com

# Test DNS
nslookup cluster0.5ep9gwn.mongodb.net
```

If both fail → **Your internet is down**

### Solution 2: Use Local MongoDB (Fastest Fix)

This eliminates the internet requirement completely.

**Windows:**
1. Download: https://www.mongodb.com/try/download/community
2. Install with default settings
3. Edit `backend/.env`:
```
MONGODB_URI=mongodb://localhost:27017/3dhouse_db
PORT=5000
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development
ROBOFLOW_API_KEY=FZ9wrnTEjI7fjUj0a5Ci
ROBOFLOW_WORKSPACE=saveens-workspace
ROBOFLOW_PROJECT=floor-plans-dgxgo-ozagw
ROBOFLOW_VERSION=3
ROBOFLOW_CONFIDENCE=15
ROBOFLOW_OVERLAP=30
GEMINI_API_KEY=AIzaSyBYQ9BrOGxpudKuTZZeUGlVoJG5btU0we8
```
4. Restart MongoDB service
5. Test with: `node test-mongodb.js`

**Linux/Mac:**
```bash
# Install MongoDB
brew install mongodb-community      # macOS
sudo apt-get install mongodb        # Ubuntu

# Start MongoDB
brew services start mongodb-community

# Update .env
# MONGODB_URI=mongodb://localhost:27017/3dhouse_db

# Test
node test-mongodb.js
```

### Solution 3: Fix Firewall/Network Issue

**Windows:**
1. Open: **Settings → Privacy & Security → Firewall & network protection**
2. Click: **Allow an app through firewall**
3. Find: **Node.js** or your terminal app
4. Check: Both **Private** and **Public**
5. Restart your terminal
6. Test again

**Mac:**
```bash
# Check firewall
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --getglobalstate

# Disable temporarily to test
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate off

# Re-enable
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --setglobalstate on
```

### Solution 4: Try Different Network

1. Try connecting via **Mobile hotspot** or **Different WiFi**
2. If it works → Your main network is blocking MongoDB Atlas
3. If it doesn't work → Try Solution 2 (Local MongoDB)

---

## ✅ Recommended Setup

For your situation, **Local MongoDB** is best:

### Step 1: Install MongoDB Locally

**Windows:**
```
1. Go to: https://www.mongodb.com/try/download/community
2. Download: Windows 64-bit (MSI)
3. Run installer
4. Leave defaults checked
5. Finish
```

**Verify Install:**
```bash
mongod --version
```

### Step 2: Update .env File

**File:** `backend/.env`

Replace entire file with:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/3dhouse_db
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
NODE_ENV=development

# Roboflow Integration
ROBOFLOW_API_KEY=FZ9wrnTEjI7fjUj0a5Ci
ROBOFLOW_WORKSPACE=saveens-workspace
ROBOFLOW_PROJECT=floor-plans-dgxgo-ozagw
ROBOFLOW_VERSION=3
ROBOFLOW_CONFIDENCE=15
ROBOFLOW_OVERLAP=30

# Gemini AI
GEMINI_API_KEY=AIzaSyBYQ9BrOGxpudKuTZZeUGlVoJG5btU0we8
```

### Step 3: Test Connection

```bash
cd backend
node test-mongodb.js
```

Should show:
```
✅ MongoDB Connected Successfully!
```

### Step 4: Start Your System

```bash
cd backend
npm start
```

Should show:
```
✅ MongoDB connected successfully
Using real MongoDB routes for Auth and Favorites
🚀 Server running on port 5000
```

---

## 📊 Comparison

| Method | Setup Time | Internet Needed | Speed | Best For |
|--------|-----------|-----------------|-------|----------|
| **Local MongoDB** | 5 min | ❌ No | ⚡⚡⚡ Fast | Development, Testing |
| **MongoDB Atlas** | 2 min | ✅ Yes | ⚡ Slower | Production |

---

## 🔄 Switching Back to Cloud

If you want MongoDB Atlas later:

1. Get your IP address: `ipconfig`
2. Go to: https://cloud.mongodb.com
3. → **Network Access** → **Add IP Address**
4. Enter your IP
5. Change `.env`:
```
MONGODB_URI=mongodb+srv://saveenkudagama_db_user:Saveen123@cluster0.5ep9gwn.mongodb.net/3dhouse_db?retryWrites=true&w=majority&appName=Cluster0
```
6. Test: `node test-mongodb.js`

---

## 📋 Troubleshooting Checklist

After following the steps:

- [ ] MongoDB installed locally
- [ ] `.env` file updated with local URI
- [ ] Ran `node test-mongodb.js` successfully
- [ ] Saw ✅ test results
- [ ] Started server with `npm start`
- [ ] Saw ✅ "MongoDB connected successfully"
- [ ] Frontend loads at http://localhost:3000
- [ ] Backend runs at http://localhost:5000

---

## 🚀 Final Test

Once everything is set up:

```bash
# Terminal 1: Start MongoDB (if using local)
# Windows: MongoDB Service should auto-start
# Linux/Mac: brew services start mongodb-community

# Terminal 2: Start Backend
cd backend
npm start

# Terminal 3: Start Frontend (if needed)
cd frontend
npm start
```

You should see:
```
✅ MongoDB connected successfully
Using real MongoDB routes for Auth and Favorites
🚀 Server running on port 5000
```

---

## 💡 What This Enables

Once MongoDB is connected:

✅ User authentication (login/register)  
✅ Admin dashboard  
✅ Architect features  
✅ Constructor features  
✅ Customer accounts  
✅ Design history  
✅ All database features  

---

## 📞 Still Having Issues?

Run this diagnostic:
```bash
cd backend
node test-mongodb.js
```

Check the output for which step failed:
1. **Environment** ✅ - Config OK
2. **DNS** ❌ - Internet/network problem
3. **Port** ❌ - MongoDB not running
4. **Connection** ❌ - Credentials issue
5. **Database** ❌ - Database access issue

Then fix accordingly!

---

## ✨ For Development

If you want unlimited free MongoDB without internet:

**Use Local MongoDB** (recommended):
```bash
# Already covered above
```

---

**Version**: 1.0  
**Last Updated**: May 13, 2026  
**Status**: Ready to implement
