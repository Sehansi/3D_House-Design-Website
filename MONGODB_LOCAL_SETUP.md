# MongoDB Local Installation Guide

## Why Local MongoDB?

✅ No internet needed  
✅ Faster connection  
✅ No IP whitelist issues  
✅ Perfect for development  
✅ Free & unlimited  

---

## Windows Installation (5 minutes)

### Step 1: Download MongoDB

1. Go to: https://www.mongodb.com/try/download/community
2. Select:
   - **Version**: Latest (or 7.0+)
   - **OS**: Windows
   - **Package**: MSI
3. Click **Download**

### Step 2: Install

1. Double-click the `.msi` file
2. Click: **Next**
3. Accept license: **I Agree** → **Next**
4. Choose: **Complete** → **Next**
5. **MongoDB as a Service** - CHECK THIS ✓
6. Click: **Install**
7. Click: **Finish**

### Step 3: Verify Installation

Open PowerShell and run:
```bash
mongod --version
```

You should see:
```
db version v7.x.x
```

If you see "command not found", add MongoDB to PATH:
1. Open: **System → Environment Variables**
2. Click: **Edit environment variables**
3. Click: **New**
4. Add: `C:\Program Files\MongoDB\Server\7.0\bin`
5. Click: **OK** → **OK**
6. Restart PowerShell

### Step 4: Start MongoDB Service

MongoDB should auto-start. To verify:

**Option A: Check Service**
```bash
Get-Service MongoDB
```

Should show: **Running**

**Option B: Manual Start**
```bash
# If not running, start it
Start-Service MongoDB
```

**Option C: Command Line (no service needed)**
```bash
# If service didn't install, run this:
mongod --dbpath "C:\data\db"
```

---

## Linux Installation

### Ubuntu/Debian

```bash
# Import GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list

# Update and install
sudo apt-get update
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod  # Start on boot

# Verify
mongod --version
```

---

## Mac Installation

### Using Homebrew (Recommended)

```bash
# Install Homebrew (if needed)
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install MongoDB
brew install mongodb-community

# Start MongoDB
brew services start mongodb-community

# Verify
mongod --version
```

---

## Test Installation

### Check MongoDB is Running

**Windows:**
```bash
# If service is running
Get-Service MongoDB

# Or test connection
mongosh --eval "db.adminCommand('ping')"
```

**Linux/Mac:**
```bash
# Test connection
mongosh --eval "db.adminCommand('ping')"

# Or use older syntax
mongo --eval "db.adminCommand('ping')"
```

You should see:
```json
{ "ok" : 1 }
```

---

## Start/Stop MongoDB

### Windows

```bash
# Start service
Start-Service MongoDB

# Stop service
Stop-Service MongoDB

# Check status
Get-Service MongoDB
```

### Linux/Mac

```bash
# Start
brew services start mongodb-community

# Stop
brew services stop mongodb-community

# Restart
brew services restart mongodb-community

# Check status
brew services list
```

---

## Connection Test

### From Your App

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

### Manual Connection Test

```bash
cd backend
node test-mongodb.js
```

Should show:
```
✅ MongoDB Connected Successfully!
```

---

## Next Steps

1. ✅ Install MongoDB (done!)
2. ✅ Start MongoDB service (done!)
3. Start your backend: `npm start`
4. Start your frontend: `npm start` (from frontend folder)
5. Open: http://localhost:3000

---

## Troubleshooting

### MongoDB not starting?

**Windows:**
```bash
# Check if port is in use
netstat -ano | findstr :27017

# If in use, find and stop the process
taskkill /PID <PID> /F

# Then restart
Start-Service MongoDB
```

**Linux/Mac:**
```bash
# Check if port is in use
lsof -i :27017

# If in use, kill the process
kill -9 <PID>

# Then restart
brew services start mongodb-community
```

### Error: "Connection refused"

```bash
# Make sure MongoDB is running
# Windows
Get-Service MongoDB

# Linux/Mac
brew services list

# Start if needed
# Windows: Start-Service MongoDB
# Mac: brew services start mongodb-community
```

### Error: "Data directory not found"

**Windows:**
```bash
# Create data directory
mkdir C:\data\db

# Run MongoDB with explicit path
mongod --dbpath "C:\data\db"
```

**Linux/Mac:**
```bash
# Data is usually in /var/lib/mongodb
# Check permissions
sudo chown -R mongodb:mongodb /var/lib/mongodb
```

---

## Uninstall MongoDB (if needed)

**Windows:**
1. Control Panel → Programs → Uninstall a program
2. Find: MongoDB Community Server
3. Click: **Uninstall**

**Mac:**
```bash
brew uninstall mongodb-community
```

**Linux:**
```bash
sudo apt-get remove mongodb-org
```

---

## MongoDB GUI Tools (Optional)

To view your data visually:

**MongoDB Compass** (Recommended)
- Download: https://www.mongodb.com/try/download/compass
- Connect to: `mongodb://localhost:27017`

**MongoDB Shell**
```bash
# New shell interface
mongosh

# Or old shell
mongo
```

---

## Resources

- **MongoDB Docs**: https://docs.mongodb.com/
- **Compass GUI**: https://www.mongodb.com/try/download/compass
- **Connection Troubleshooting**: https://docs.mongodb.com/manual/reference/connection-string/

---

**Version**: 1.0  
**Last Updated**: May 13, 2026  
**Status**: Ready to use
