# ❌ MongoDB Connection Troubleshooting

## Problem: `querySrv ECONNREFUSED _mongodb._tcp.cluster0.5ep9gwn.mongodb.net`

This error means your system **cannot reach** MongoDB Atlas servers.

---

## 🔧 Solution 1: Check Network Access (Quickest)

### Step 1: Go to MongoDB Atlas
- URL: https://cloud.mongodb.com
- Login with your account

### Step 2: Open Your Cluster
- Click on "Cluster0"
- Go to "Security" → "Network Access"

### Step 3: Check IP Whitelist
- Look for your current IP address
- If not there, click "Add IP Address"
- Select "Add Current IP Address"
- Or add: `0.0.0.0/0` (allows all - for development only)

### Step 4: Test Again
```bash
cd backend
node test-connection.js
```

---

## 🔧 Solution 2: Switch to Local MongoDB (Recommended)

If Network Access doesn't work, use **Local MongoDB** instead.

### Step 1: Download MongoDB
https://www.mongodb.com/try/download/community

### Step 2: Install
- Run the `.msi` file
- Choose "Install MongoDB as a Service"
- Accept defaults

### Step 3: Start MongoDB Service
```bash
# Check if running
Get-Service MongoDB

# If stopped, start it:
Start-Service MongoDB
```

### Step 4: Update .env File

Change:
```env
MONGODB_URI=mongodb+srv://saveenkudagama_db_user:Saveen123@cluster0.5ep9gwn.mongodb.net/3dhouse_db?retryWrites=true&w=majority&appName=Cluster0
```

To:
```env
MONGODB_URI=mongodb://localhost:27017/3dhouse_db
```

### Step 5: Test Local Connection
```bash
cd backend
node test-connection.js
```

Expected output:
```
✅ MongoDB connected successfully!
📊 Database: 3dhouse_db
🖥️ Host: localhost
```

---

## 🔧 Solution 3: Check Firewall/ISP

### Check if DNS is working:
```bash
nslookup cluster0.5ep9gwn.mongodb.net
```

If it says "can't find server":
- Your ISP/Firewall is blocking DNS queries
- **Use Solution 2: Local MongoDB** instead

### If DNS works but connection still fails:
- Your ISP might be blocking MongoDB Atlas ports
- **Use Solution 2: Local MongoDB** instead

---

## 📋 Which Solution to Use?

| Situation | Solution |
|-----------|----------|
| Can access MongoDB Atlas website | Solution 1: Fix Network Access |
| Cannot access any MongoDB Atlas pages | Solution 2: Use Local MongoDB |
| Development/Testing only | Solution 2: Local MongoDB (faster) |
| Production/Team project | Solution 1: MongoDB Atlas |

---

## ✅ After Fixing MongoDB Connection

Once you see:
```
✅ MongoDB connected successfully!
```

Then proceed with:

### Step 1: Train YOLO Model
```bash
cd backend/python
python train_model.py
```

### Step 2: Restart Backend
```bash
cd backend
npm start
```

### Step 3: Start Frontend
```bash
cd frontend
npm start
```

### Step 4: Login
- URL: `http://localhost:3000/signin`
- Email: `admin@gmail.com`
- Password: `123456`

---

## 🆘 Still Having Issues?

Run this diagnostic:
```bash
cd backend

# Check Node version
node --version

# Check npm packages
npm list mongoose

# Check .env file
type .env | findstr MONGODB_URI

# Detailed connection test
node -e "console.log(process.env.MONGODB_URI)"
```

Share the output and I can help debug!

---

## 🎯 Quick Checklist

- [ ] Can open https://cloud.mongodb.com
- [ ] Your IP is in Network Access whitelist
- [ ] Run `node test-connection.js` shows ✅ connected
- [ ] MongoDB database is not empty
- [ ] Ready to train model
- [ ] Ready to run system

**Choose one: Atlas (Solution 1) or Local MongoDB (Solution 2), then proceed! 🚀**
