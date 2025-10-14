# 🔄 Database Reset Guide

**Purpose:** Clear all existing data and create fresh sample data while preserving your admin user.

---

## ⚠️ **CRITICAL WARNING**

This process will:
- ✅ **KEEP** your admin user: `admin@agency.com` with password `YOUR_ADMIN_PASSWORD`
- 🗑️ **DELETE** all other users
- 🗑️ **DELETE** all applicants, agents, branches, communications, etc.
- 🆕 **CREATE** fresh sample data for testing

**This action CANNOT be undone!**

---

## 🎯 **When to Use This**

Use this reset process when you want to:
- Test the new security features with clean data
- Start fresh without old test data
- Keep only the admin user and create new sample users
- Test the initialization process

**DO NOT use in production!** This is for **development/staging only!**

---

## 📋 **Pre-Reset Checklist**

Before running the reset:

### 1. **Verify Environment**
```bash
# Make sure you're on the DEVELOPMENT project
firebase use
# Should show: crm-agency-22f30 (or your dev project)

# If not, switch to development
firebase use default  # or: firebase use development
```

### 2. **Backup (Optional but Recommended)**

Even though this is development, you might want to backup:

**Option A: Export specific data from Firebase Console**
1. Go to [Firestore Console](https://console.firebase.google.com/project/crm-agency-22f30/firestore)
2. Export any collections you want to keep (optional)

**Option B: Take a snapshot**
```bash
# Note: This requires Firebase Admin SDK and service account
# Just document what you have if needed
```

### 3. **Confirm Admin Credentials**

Verify you can login with:
- Email: `admin@agency.com`
- Password: `YOUR_ADMIN_PASSWORD`

If these credentials are different, update the script first.

---

## 🚀 **Reset Process**

### **Option 1: Complete Reset (Recommended)**

This will clear and reinitialize in one command:

```bash
# 1. Make sure you're in development
firebase use default

# 2. Create .env.local with your settings
cp .env.development .env.local

# 3. Run the complete reset script
npx tsx src/scripts/clearAndReinitializeComplete.ts
```

**What it does:**
1. Finds and preserves admin user (admin@agency.com)
2. Deletes all other data from all collections
3. Creates fresh sample data
4. Preserves admin login credentials

### **Option 2: Step-by-Step Reset**

If you want more control:

```bash
# Step 1: Clear the database (keep admin)
npx tsx src/scripts/clearAndReinitialize.ts

# Step 2: Review what was cleared
# Check Firebase Console

# Step 3: Reinitialize with fresh data
npm run init-database
```

---

## 📊 **What Gets Created**

After the reset, you'll have:

### **Users:**
- ✅ **Admin** (preserved): `admin@agency.com` / `YOUR_ADMIN_PASSWORD`
- 🆕 **President**: `president@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`
- 🆕 **HO Recruitment Officer 1**: `recruitment1@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`
- 🆕 **HO Recruitment Officer 2**: `recruitment2@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`
- 🆕 **HO Accountant**: `accountant@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`

### **Branches:**
- 🆕 Head Office (HO)
- 🆕 North Branch (NB)
- 🆕 South Branch (SB)
- 🆕 East Branch (EB)

### **Branch Managers:**
- 🆕 `manager.ho@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`
- 🆕 `manager.nb@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`
- 🆕 `manager.sb@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`
- 🆕 `manager.eb@agency.com` / `YOUR_DEFAULT_USER_PASSWORD`

### **Sample Data:**
- 🆕 ~14 Agents (3-4 per branch)
- 🆕 ~20 Applicants (4 per status: initial, document_verification, interview, approved, rejected)
- 🆕 2-4 Documents per applicant
- 🆕 1-3 Expenses per applicant

---

## ✅ **Post-Reset Verification**

After running the reset:

### 1. **Check Firebase Console**
Visit: https://console.firebase.google.com/project/crm-agency-22f30/firestore

Verify:
- [ ] `users` collection has ~9 documents (1 admin + 8 new users)
- [ ] `branches` collection has 4 documents
- [ ] `agents` collection has ~14 documents
- [ ] `applicants` collection has ~20 documents
- [ ] Admin user is preserved in Authentication

### 2. **Test Login**
```
Email: admin@agency.com
Password: YOUR_ADMIN_PASSWORD
```

Should login successfully.

### 3. **Test Other Users**
Try logging in as:
- President
- Branch Manager
- HO Recruitment Officer

Use password: `YOUR_DEFAULT_USER_PASSWORD`

### 4. **Verify Data Access**
- Admin should see all data
- Branch Managers should only see their branch data
- HO Officers should see assigned applicants

---

## 🔐 **Security Notes**

### **Admin User Preservation**
The script finds your admin user by:
1. Querying Firestore `users` collection for `email == 'admin@agency.com'`
2. Getting the user document ID
3. Preserving that document during deletion

### **What Happens to Authentication**
- The Firebase Authentication user for admin is **NOT deleted**
- Only the Firestore user document is preserved
- Other Authentication users remain but will have no Firestore data
- New users will be created in both Authentication and Firestore

### **Data Security**
- All existing applicant data is **permanently deleted**
- All communications, budgets, etc. are **permanently deleted**
- Only admin user document is preserved

---

## 🐛 **Troubleshooting**

### **Issue: "Admin user not found"**

If the script can't find your admin user:

1. Check Firebase Console → Authentication
2. Verify email is exactly: `admin@agency.com`
3. Check Firestore → users collection
4. Verify there's a document with `email: "admin@agency.com"`

**Solution:** Update the script with your actual admin email:
```typescript
// In src/scripts/clearAndReinitialize.ts, line 19
const ADMIN_EMAIL = 'your_actual_admin@agency.com';
```

### **Issue: "Permission denied"**

If you get permission errors:

1. Make sure you're logged in: `firebase login`
2. Check you're on the right project: `firebase use`
3. Verify your Firebase Security Rules allow admin access

### **Issue: Script hangs or times out**

If the script takes too long:

1. Check your internet connection
2. Verify Firestore is responding (check Firebase Console)
3. Try clearing collections one at a time manually

### **Issue: Some data not deleted**

If some old data remains:

1. Check Firebase Console → Firestore
2. Manually delete remaining collections
3. Run the script again

---

## 🚨 **Emergency Rollback**

If something goes wrong:

### **Option 1: Re-run Initialization**
```bash
# Just run initialization again
npm run init-database
```

### **Option 2: Restore from Backup**
If you exported data before reset:
1. Go to Firebase Console → Firestore
2. Import your backup data manually

### **Option 3: Start Fresh**
```bash
# Clear everything and start over
npx tsx src/scripts/clearAndReinitializeComplete.ts
```

---

## 📝 **Script Details**

### **clearAndReinitialize.ts**
- Clears all collections except admin user
- Handles subcollections (applicant documents, expenses)
- Preserves admin by user ID
- Safe deletion with error handling

### **clearAndReinitializeComplete.ts**
- Combines clear + initialize
- Sets environment variables automatically
- Provides detailed progress output
- Shows summary of what was created

### **initializeDatabase.ts**
- Creates sample users, branches, agents, applicants
- Uses admin credentials from environment
- Skips creating admin if already exists
- Creates realistic sample data

---

## ✅ **Final Checklist**

Before running:
- [ ] Verified I'm in development environment
- [ ] Backed up any important data (if needed)
- [ ] Confirmed admin credentials are correct
- [ ] Read and understood this guide
- [ ] Ready to lose all current data except admin

After running:
- [ ] Verified admin login works
- [ ] Checked new data was created
- [ ] Tested new user logins
- [ ] Changed default passwords
- [ ] Verified role-based access works

---

## 🎯 **Next Steps After Reset**

Once your database is reset and fresh data is created:

1. **Deploy Security Updates**
   ```bash
   firebase deploy --only firestore:indexes
   # Wait for indexes to build
   firebase deploy --only firestore:rules
   firebase deploy --only storage
   ```

2. **Test New Security Features**
   - Test role-based access control
   - Test permission checks
   - Test file upload validation
   - Verify audit logs are created

3. **Change Default Passwords**
   - Login as each user
   - Change from `YOUR_DEFAULT_USER_PASSWORD` to secure passwords

---

**Script Location:** `src/scripts/clearAndReinitializeComplete.ts`  
**Last Updated:** October 14, 2025  
**Environment:** Development Only

---

🚀 **Ready to reset? Run the command and your database will be fresh with only your admin user preserved!**

