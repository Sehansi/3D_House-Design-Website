# 🔐 Admin Login Credentials

## Default Admin Account

### Credentials
```
📧 Email:    admin@gmail.com
🔑 Password: 123456
👤 Role:     Administrator
```

---

## How to Login as Admin

### Step 1: Open Application
Go to: **http://localhost:3000**

### Step 2: Click Sign In
- Click: **Sign In** button (top right)
- Or navigate to: **http://localhost:3000/signin**

### Step 3: Enter Credentials
```
Email:    admin@gmail.com
Password: 123456
```

### Step 4: Click Sign In
- Click: **Sign In** button
- Wait for redirect

### Step 5: Admin Dashboard
You should see:
```
✅ Admin Dashboard
✅ User Management
✅ System Settings
✅ Analytics/Reports
```

---

## Admin Dashboard Features

Once logged in as admin, you have access to:

### 👥 User Management
- View all users
- Manage user roles
- Block/unblock users
- View user profiles

### 🏢 System Administration
- System settings
- Configuration management
- Feature management

### 📊 Analytics
- User statistics
- System performance
- Activity logs

### 🛠️ Tools
- System maintenance
- Data management
- Backup controls

---

## Important Notes

### Auto-Creation
- Admin account is **automatically created** when MongoDB connects
- Runs on backend startup via `seeders/adminSeeder.js`
- If doesn't exist → Created
- If exists → Password reset to `123456`

### Security
⚠️ **For Development Only!**
- These are default credentials
- **Change in production!**
- Never use these in live environments

---

## Change Admin Password (Optional)

To change password after login:

1. Login as admin
2. Go to: **Profile/Settings**
3. Click: **Change Password**
4. Enter:
   - Current: `123456`
   - New: Your new password
5. Click: **Save**

---

## Test All Roles

### Admin Login
```
Email:    admin@gmail.com
Password: 123456
```

### Create Test Accounts
Once logged as admin, create test accounts for:
- **Architect**: For design creation
- **Constructor**: For project management
- **Customer**: For design viewing
- **Regular User**: For gallery access

---

## Troubleshooting

### "Cannot login"

**Check:**
1. MongoDB is running: `node test-mongodb.js`
2. Backend is running: See port 5000 in terminal
3. Frontend is running: See port 3000 in terminal
4. Entered correct email: `admin@gmail.com`
5. Entered correct password: `123456`

### "Admin account not created"

**Solution:**
```bash
# Restart backend (creates admin)
cd backend
npm start
```

Should show:
```
✅ Admin account created → admin@gmail.com / 123456
```

### "Login button not working"

**Check:**
1. Backend is running (`npm start` in backend)
2. Check browser console for errors (F12)
3. Try different browser
4. Clear browser cache (Ctrl+Shift+Delete)

---

## Admin Features Enabled

### User Management
- ✅ Add/edit/delete users
- ✅ Assign roles
- ✅ View activity
- ✅ Manage permissions

### System Settings
- ✅ Configure system
- ✅ Manage features
- ✅ Set policies
- ✅ System maintenance

### Analytics
- ✅ User statistics
- ✅ System metrics
- ✅ Performance monitoring
- ✅ Activity logs

---

## Other Default Accounts (Optional)

You can create additional test accounts:

### Architect Account
```
Email: architect@gmail.com
Password: password123
Role: Architect
```

### Constructor Account
```
Email: constructor@gmail.com
Password: password123
Role: Constructor
```

### Customer Account
```
Email: customer@gmail.com
Password: password123
Role: Customer
```

Create these from Admin Dashboard → User Management

---

## Quick Reference

| Item | Value |
|------|-------|
| **Admin Email** | `admin@gmail.com` |
| **Admin Password** | `123456` |
| **Admin Role** | Administrator |
| **Login URL** | `http://localhost:3000/signin` |
| **Dashboard URL** | `http://localhost:3000/admin` |
| **Auto-Created** | On backend startup |
| **Password Reset** | On each backend restart |

---

## Session Info

After login:
- ✅ JWT token stored in localStorage
- ✅ Session lasts until logout
- ✅ Refresh page: Session persists
- ✅ Close browser: Session ends

---

## Logout

To logout:
1. Click: **Profile** (top right)
2. Click: **Logout**
3. Redirected to: Home page
4. Session cleared

---

## For Production

### Before Deploying
1. **Change admin password** (not `123456`)
2. **Change JWT secret** in `.env`
3. **Enable HTTPS**
4. **Set NODE_ENV=production**
5. **Remove debug logs**

### Production Credentials
```env
# .env
JWT_SECRET=your_very_long_random_secret_key_here
NODE_ENV=production
```

Then create admin with strong password:
```bash
node -e "
const User = require('./models/User');
const admin = new User({
  fullName: 'Admin',
  email: 'your-email@company.com',
  password: 'YourStrongPassword123!',
  role: 'Admin'
});
admin.save();
"
```

---

## 📞 Common Questions

**Q: Can I change the admin email?**
A: Yes, after login → Profile → Edit email

**Q: Can multiple admins exist?**
A: Yes, create more from User Management

**Q: Password reset forgotten?**
A: Restart backend (auto-resets to `123456`)

**Q: Login not working?**
A: Check MongoDB running + Backend running + Credentials correct

---

## ✅ Login Checklist

- [ ] MongoDB running: `node test-mongodb.js` ✅
- [ ] Backend running: `npm start` ✅
- [ ] Frontend running: `npm start` ✅
- [ ] Go to: http://localhost:3000
- [ ] Click: Sign In
- [ ] Email: `admin@gmail.com`
- [ ] Password: `123456`
- [ ] Click: Sign In
- [ ] See: Admin Dashboard ✅

---

**Credentials Valid**: ✅  
**Last Updated**: May 13, 2026  
**For**: Development/Testing
