# 🚀 Firebase Security Update - Deployment Guide

**IMPORTANT:** Follow these steps in order to ensure smooth deployment.

---

## ⚠️ Pre-Deployment Checklist

- [ ] All code changes have been reviewed
- [ ] No sensitive data in source code
- [ ] `.env.local` is in `.gitignore`
- [ ] Backup current Firestore rules and indexes (if in production)

---

## 📝 Step-by-Step Deployment

### Step 1: Create Environment Configuration

1. **Copy the environment template:**
   ```bash
   cp environment-variables-template.txt .env.local
   ```

2. **Edit `.env.local` with your actual values:**
   ```bash
   # Required Firebase values (from Firebase Console > Project Settings)
   VITE_FIREBASE_API_KEY=your_actual_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
   VITE_FIREBASE_APP_ID=your_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id
   VITE_FIREBASE_VAPID_KEY=your_vapid_key

   # CRITICAL: Set strong passwords (minimum 12 characters)
   ADMIN_EMAIL=admin@youragency.com
   ADMIN_PASSWORD=YourVeryStrong123!Password
   ADMIN_DISPLAY_NAME=System Administrator
   DEFAULT_USER_PASSWORD=AnotherStrong456!Password
   ```

3. **Verify `.env.local` is git-ignored:**
   ```bash
   git status
   # .env.local should NOT appear in the list
   ```

---

### Step 2: Deploy Firestore Indexes (FIRST!)

**Why first?** Index creation can take 10-30 minutes. Deploy these before rules.

```bash
# Login to Firebase (if not already)
firebase login

# Deploy indexes
firebase deploy --only firestore:indexes
```

**Monitor Progress:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Navigate to Firestore Database > Indexes
4. Wait until all indexes show "Enabled" (green checkmark)

**Expected Indexes (25 total):**
- ✅ applicants (4 indexes)
- ✅ communications (2 indexes)
- ✅ budgets (2 indexes)
- ✅ notifications (2 indexes)
- ✅ jobs (2 indexes)
- ✅ transfers (3 indexes)
- ✅ documents (2 indexes)
- ✅ expenses (2 indexes)
- ✅ report_shares (2 indexes)
- ✅ audit_logs (2 indexes)
- ✅ commissions (1 index)
- ✅ reports (1 index)

---

### Step 3: Deploy Security Rules

**After all indexes are built**, deploy the new security rules:

```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Storage rules
firebase deploy --only storage
```

**Verify Rules are Active:**
```bash
# Check deployment output for success messages
# ✔ Deploy complete!
```

---

### Step 4: Deploy Hosting Configuration

```bash
firebase deploy --only hosting
```

This updates:
- Security headers (CSP, XSS protection, etc.)
- Cache control
- Redirect rules

---

### Step 5: Initialize Database (First-Time Setup Only)

⚠️ **ONLY run this if setting up a new database!**

```bash
# Install dependencies if not already done
npm install

# Run initialization script
npm run init-database

# Or with tsx directly:
npx tsx src/scripts/runInitialization.ts
```

**What this creates:**
- Admin user (from ADMIN_EMAIL)
- President user
- HO Recruitment Officers (2)
- HO Accountant
- 4 Branches (Head Office, North, South, East)
- Branch Managers for each branch
- Sample applicants, agents, and data

⚠️ **CRITICAL: Change all default passwords immediately after initialization!**

---

### Step 6: Post-Deployment Verification

#### 6.1 Test Security Headers

Visit your deployed site and check headers:

```bash
# Method 1: Use curl
curl -I https://your-app.web.app

# Look for these headers:
# X-Content-Type-Options: nosniff
# X-Frame-Options: DENY
# X-XSS-Protection: 1; mode=block
# Strict-Transport-Security: max-age=31536000
# Content-Security-Policy: ...
```

**Method 2:** Use online tool
- Visit https://securityheaders.com
- Enter your site URL
- Verify you get an "A" rating

#### 6.2 Test Authentication & Permissions

1. **Test Admin Login:**
   ```
   Email: [Your ADMIN_EMAIL]
   Password: [Your ADMIN_PASSWORD]
   ```

2. **Test Role-Based Access:**
   - Log in as admin → should see all features
   - Log in as branch manager → should only see their branch
   - Try accessing another branch's data → should be denied

3. **Test Permission Checks:**
   - Try creating a budget as non-admin → should fail
   - Try accessing applicant from different branch → should fail
   - Verify error messages are clear

#### 6.3 Test Query Performance

1. Open browser DevTools → Network tab
2. Navigate to applicants page
3. Check Firestore queries:
   - Should have `limit=50` or similar
   - Should not fetch all documents
   - Should complete in < 2 seconds

#### 6.4 Test File Uploads

1. Upload a test document
2. Verify file size validation (try >10MB file → should reject)
3. Verify file type validation (try .exe file → should reject)
4. Check successful upload of valid PDF/image

#### 6.5 Verify Audit Logs

1. Perform some actions (create applicant, update budget, etc.)
2. Check Firestore Console → audit_logs collection
3. Verify logs are being created with correct data

---

## 🔐 Security Hardening (Post-Deployment)

### Immediate Actions (Within 24 Hours)

1. **Change ALL Default Passwords:**
   ```
   - Admin account
   - President account
   - All HO Recruitment Officers
   - All Branch Managers
   - HO Accountant
   ```

2. **Enable Multi-Factor Authentication (MFA):**
   - Go to Firebase Console > Authentication > Sign-in method
   - Enable "Email/Password" provider MFA
   - Require MFA for admin and president roles

3. **Set Up Firebase App Check:**
   ```bash
   # Install App Check
   npm install firebase/app-check

   # Configure in Firebase Console > App Check
   # Register your web app
   # Enable reCAPTCHA v3
   ```

4. **Configure Alerts:**
   - Firebase Console > Project Settings > Usage and billing
   - Set up billing alerts
   - Configure Firestore usage alerts

### Within First Week

1. **Review Access Logs:**
   - Check audit_logs for unusual activity
   - Verify all users are legitimate
   - Remove any test/demo accounts

2. **Set Up Monitoring:**
   - Enable Firebase Performance Monitoring
   - Set up Sentry error tracking (if using)
   - Configure uptime monitoring

3. **Test Backup/Restore:**
   - Set up Firestore automated backups
   - Test restoration process
   - Document recovery procedures

### Ongoing Maintenance

1. **Weekly:**
   - Review audit logs for security events
   - Check Firebase usage for anomalies
   - Monitor error rates in Sentry

2. **Monthly:**
   - Run `npm audit` and update dependencies
   - Review and rotate API keys
   - Check for Firebase SDK updates

3. **Quarterly:**
   - Full security audit
   - Review and update security rules
   - Penetration testing
   - User access review

---

## 🐛 Troubleshooting

### Issue: "Insufficient permissions" errors

**Solution:**
1. Check user's role in Firestore `users` collection
2. Verify `branchId` is set for branch managers
3. Ensure security rules are deployed
4. Check browser console for detailed error

### Issue: "Index required" errors

**Solution:**
1. Check Firebase Console > Firestore > Indexes
2. Ensure all 25 indexes are "Enabled"
3. If building, wait for completion (can take 30 mins)
4. Redeploy if necessary: `firebase deploy --only firestore:indexes`

### Issue: File upload fails

**Solution:**
1. Check file size (must be < 10MB for documents)
2. Check file type (only images, PDFs, Word docs, Excel allowed)
3. Verify user has correct role (admin/branch_manager/ho_recruitment_officer)
4. Check storage rules are deployed

### Issue: Queries are slow

**Solution:**
1. Verify indexes are built
2. Check pagination limits are applied
3. Monitor Firestore usage in console
4. Consider adding more specific indexes

### Issue: Environment variables not loading

**Solution:**
1. Verify `.env.local` exists in project root
2. Ensure all variables are prefixed with `VITE_` (for client-side)
3. Restart development server after changing `.env.local`
4. For server-side scripts, don't prefix with `VITE_`

---

## 📞 Rollback Plan

If issues arise after deployment:

### Rollback Firestore Rules

```bash
# If you backed up old rules
firebase deploy --only firestore:rules

# Or manually in Firebase Console:
# Firestore Database > Rules > View previous versions > Publish
```

### Rollback Storage Rules

```bash
firebase deploy --only storage

# Or in Console: Storage > Rules > History
```

### Rollback Indexes

⚠️ **Cannot rollback indexes** - they can only be deleted
- Delete new indexes in Firebase Console if causing issues
- Original indexes will remain active

---

## ✅ Deployment Checklist

Use this checklist to track your deployment:

```
Pre-Deployment:
[ ] Code reviewed
[ ] .env.local created and configured
[ ] .env.local in .gitignore
[ ] Backup existing rules (if production)

Deployment:
[ ] Firebase login completed
[ ] Firestore indexes deployed
[ ] All indexes showing "Enabled" in console
[ ] Firestore rules deployed successfully
[ ] Storage rules deployed successfully
[ ] Hosting configuration deployed
[ ] Database initialized (first-time only)

Verification:
[ ] Security headers verified (securityheaders.com)
[ ] Admin login works
[ ] Role-based access tested
[ ] Permission checks working
[ ] Query performance acceptable
[ ] File upload validation working
[ ] Audit logs being created

Security Hardening:
[ ] All default passwords changed
[ ] MFA enabled for admin accounts
[ ] App Check configured
[ ] Billing alerts set up
[ ] Monitoring configured
[ ] Backup tested

Documentation:
[ ] Deployment documented
[ ] Team notified of changes
[ ] Support team briefed
[ ] Runbook updated
```

---

## 📚 Additional Resources

- [Firebase Security Rules Documentation](https://firebase.google.com/docs/rules)
- [Firebase Security Best Practices](https://firebase.google.com/docs/rules/best-practices)
- [Firestore Indexes Guide](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Firebase App Check](https://firebase.google.com/docs/app-check)
- [OWASP Security Guidelines](https://owasp.org/www-project-web-security-testing-guide/)

---

**Deployment Guide Version:** 1.0  
**Last Updated:** October 14, 2025  
**Maintained By:** Development Team

---

## 🎉 Success Criteria

Deployment is successful when:
- ✅ All indexes are built and enabled
- ✅ Security rules are active and enforced
- ✅ Authentication works for all roles
- ✅ Permission checks prevent unauthorized access
- ✅ File uploads validate size and type
- ✅ Queries complete in < 2 seconds
- ✅ Security headers are present
- ✅ Audit logs are being created
- ✅ No console errors during normal operation
- ✅ All tests pass

**Ready for production traffic!** 🚀

