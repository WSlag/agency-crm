# Firestore Rules - Branch Validation Security Fix

**Date**: October 19, 2025  
**Status**: ✅ COMPLETED  
**Severity**: 🔴 **HIGH - Security Vulnerability Fixed**

## Executive Summary

After fixing the frontend form branchId validation issues, we discovered **2 critical security vulnerabilities** in the Firestore security rules that allowed Branch Managers to create records for **any branch**, not just their own.

**Collections Fixed**:
1. ✅ **Applicants** - Now enforces branch validation
2. ✅ **Commissions** - Now enforces branch validation

**Already Secure** (No changes needed):
3. ✅ **Agents** - Already had branch validation
4. ✅ **Expenses** - Already had branch validation

---

## Security Vulnerabilities Found

### 🚨 Vulnerability #1: Applicants Collection

**Location**: `firestore.rules` Line 142

**Before (VULNERABLE)**:
```javascript
match /applicants/{applicantId} {
  allow read: if isAuthenticated();
  allow create: if isAdmin() || isBranchManager();  // ❌ No branch check!
  allow update: if isAdmin() || 
    (isBranchManager() && belongsToBranch(resource.data.branchId)) ||
    isHORecruitmentOfficer();
  allow delete: if isAdmin();
}
```

**Security Issue**:
- ❌ **ANY Branch Manager** could create applicants for **ANY branch**
- ❌ Iloilo Branch Manager could create applicants for Cotabato Branch
- ❌ No backend validation of branchId on creation
- ❌ Only frontend validation (easily bypassed via direct API calls)

**Example Attack**:
```javascript
// Iloilo Branch Manager (branchId: "iloilo-branch")
// Could create applicant for Cotabato Branch:
firestore.collection('applicants').add({
  fullName: "John Doe",
  branchId: "cotabato-branch",  // ❌ Different branch! Should be blocked
  // ... other fields
});
// Would succeed! ❌
```

---

### 🚨 Vulnerability #2: Commissions Collection

**Location**: `firestore.rules` Line 333

**Before (VULNERABLE)**:
```javascript
match /commissions/{commissionId} {
  allow read: if isAuthenticated();
  allow create: if isAdmin() || isHOAccountant() || isBranchManager();  // ❌ No branch check!
  allow update: if isAdmin() || isHOAccountant() || isPresident();
  allow delete: if isAdmin();
}
```

**Security Issue**:
- ❌ **ANY Branch Manager** could create commissions for **ANY branch**
- ❌ Could manipulate commission records across branches
- ❌ Potential for financial fraud (creating commissions for other branches)
- ❌ No audit trail showing unauthorized access

**Example Attack**:
```javascript
// Cotabato Branch Manager (branchId: "cotabato-branch")
// Could create commission for North Branch:
firestore.collection('commissions').add({
  agentId: "north-branch-agent",
  branchId: "north-branch",  // ❌ Different branch! Should be blocked
  amount: 50000,
  // ... other fields
});
// Would succeed! ❌
```

---

## Solutions Implemented

### ✅ Fix #1: Applicants Collection

**File**: `firestore.rules` Line 142-143

**After (SECURE)**:
```javascript
match /applicants/{applicantId} {
  allow read: if isAuthenticated();
  allow create: if isAdmin() || 
    (isBranchManager() && belongsToBranch(request.resource.data.branchId));  // ✅ Branch validation!
  allow update: if isAdmin() || 
    (isBranchManager() && belongsToBranch(resource.data.branchId)) ||
    isHORecruitmentOfficer();
  allow delete: if isAdmin();
}
```

**What Changed**:
- ✅ Added `belongsToBranch(request.resource.data.branchId)` check
- ✅ Branch Managers can **ONLY** create applicants for their own branch
- ✅ `request.resource.data` = the data being created (new applicant)
- ✅ `belongsToBranch()` = helper function that checks `request.auth.token.branchId == branchId`

**How It Works**:
```javascript
// Iloilo Branch Manager (branchId: "iloilo-branch")
firestore.collection('applicants').add({
  fullName: "John Doe",
  branchId: "iloilo-branch",    // ✅ Same branch - ALLOWED
});

firestore.collection('applicants').add({
  fullName: "Jane Doe",
  branchId: "cotabato-branch",  // ❌ Different branch - BLOCKED!
});
// Error: Missing or insufficient permissions
```

---

### ✅ Fix #2: Commissions Collection

**File**: `firestore.rules` Line 334-335

**After (SECURE)**:
```javascript
match /commissions/{commissionId} {
  allow read: if isAuthenticated();
  allow create: if isAdmin() || isHOAccountant() || 
    (isBranchManager() && belongsToBranch(request.resource.data.branchId));  // ✅ Branch validation!
  allow update: if isAdmin() || isHOAccountant() || isPresident();
  allow delete: if isAdmin();
}
```

**What Changed**:
- ✅ Added `belongsToBranch(request.resource.data.branchId)` check
- ✅ Branch Managers can **ONLY** create commissions for their own branch
- ✅ Prevents cross-branch commission manipulation
- ✅ Protects financial data integrity

---

## Already Secure Collections

### ✅ Agents Collection (No Changes Needed)

**File**: `firestore.rules` Line 130-131

```javascript
match /agents/{agentId} {
  allow read: if isAuthenticated();
  allow create: if isAdmin() || 
    (isBranchManager() && belongsToBranch(request.resource.data.branchId));  // ✅ Already secure
  allow update, delete: if isAdmin() || 
    (isBranchManager() && belongsToBranch(resource.data.branchId));
}
```

✅ Already had proper branch validation on creation and updates!

---

### ✅ Expenses Collection (No Changes Needed)

**File**: `firestore.rules` Line 401

```javascript
match /expenses/{expenseId} {
  allow create: if isAuthenticated() && (
    isAdmin() ||
    isHOAccountant() ||
    (isBranchManager() && belongsToBranch(request.resource.data.branchId))  // ✅ Already secure
  );
}
```

✅ Already had proper branch validation on creation!

---

## Security Impact

### Before Fix (VULNERABLE)

```
Iloilo Branch Manager (branchId: "iloilo-branch"):
  Can create applicants for:
    ✅ Iloilo Branch
    ❌ Cotabato Branch  ← SECURITY BUG
    ❌ North Branch     ← SECURITY BUG
    ❌ South Branch     ← SECURITY BUG
    ❌ Head Office      ← SECURITY BUG
  
  Can create commissions for:
    ✅ Iloilo Branch
    ❌ Cotabato Branch  ← SECURITY BUG
    ❌ North Branch     ← SECURITY BUG
    ❌ Any Branch!      ← SECURITY BUG

Risk Level: HIGH
  - Cross-branch data manipulation
  - Financial fraud potential (commissions)
  - Data integrity issues
  - No audit trail of unauthorized access
```

### After Fix (SECURE)

```
Iloilo Branch Manager (branchId: "iloilo-branch"):
  Can create applicants for:
    ✅ Iloilo Branch    ← ALLOWED
    ❌ Cotabato Branch  ← BLOCKED (PERMISSION_DENIED)
    ❌ North Branch     ← BLOCKED (PERMISSION_DENIED)
    ❌ South Branch     ← BLOCKED (PERMISSION_DENIED)
    ❌ Head Office      ← BLOCKED (PERMISSION_DENIED)
  
  Can create commissions for:
    ✅ Iloilo Branch    ← ALLOWED
    ❌ Cotabato Branch  ← BLOCKED (PERMISSION_DENIED)
    ❌ Any Other Branch ← BLOCKED (PERMISSION_DENIED)

Risk Level: LOW
  - Branch isolation enforced at database level
  - Cannot bypass via API calls
  - Financial data protected
  - Clear audit trail (PERMISSION_DENIED errors logged)
```

---

## Testing Instructions

### Test 1: Verify Applicant Creation is Branch-Restricted

**As Iloilo Branch Manager**:

1. Open browser console
2. Try to create applicant for **own branch** (should work):
   ```javascript
   firebase.firestore().collection('applicants').add({
     fullName: "Test Applicant",
     email: "test@example.com",
     branchId: "iloilo-branch",  // Your branch
     // ... other required fields
   });
   ```
   **Expected**: ✅ Success

3. Try to create applicant for **different branch** (should fail):
   ```javascript
   firebase.firestore().collection('applicants').add({
     fullName: "Test Applicant",
     email: "test2@example.com",
     branchId: "cotabato-branch",  // Different branch
     // ... other required fields
   });
   ```
   **Expected**: ❌ Error: "Missing or insufficient permissions"

---

### Test 2: Verify Commission Creation is Branch-Restricted

**As Cotabato Branch Manager**:

1. Open browser console
2. Try to create commission for **own branch** (should work):
   ```javascript
   firebase.firestore().collection('commissions').add({
     agentId: "cotabato-agent",
     branchId: "cotabato-branch",  // Your branch
     amount: 10000,
     // ... other required fields
   });
   ```
   **Expected**: ✅ Success

3. Try to create commission for **different branch** (should fail):
   ```javascript
   firebase.firestore().collection('commissions').add({
     agentId: "iloilo-agent",
     branchId: "iloilo-branch",  // Different branch
     amount: 10000,
     // ... other required fields
   });
   ```
   **Expected**: ❌ Error: "Missing or insufficient permissions"

---

### Test 3: Verify Admin Can Still Create for Any Branch

**As Admin**:

1. Try to create applicant for **any branch**:
   ```javascript
   firebase.firestore().collection('applicants').add({
     fullName: "Admin Test",
     email: "admin-test@example.com",
     branchId: "any-branch-id",  // Any branch
     // ...
   });
   ```
   **Expected**: ✅ Success (Admin has global access)

---

## Deployment

**Status**: ✅ **DEPLOYED SUCCESSFULLY**

```bash
firebase deploy --only firestore:rules
```

**Output**:
```
+  cloud.firestore: rules file firestore.rules compiled successfully
+  firestore: released rules firestore.rules to cloud.firestore
+  Deploy complete!
```

**Console**: https://console.firebase.google.com/project/crm-agency-22f30/overview

---

## Security Layers

### Defense in Depth

With this fix, we now have **3 layers of security**:

1. **Frontend Validation** (First Layer)
   - Forms automatically set `branchId` from `customClaims`
   - UI prevents cross-branch selection
   - User-friendly error messages

2. **Firestore Rules** (Second Layer) ✅ **NEW**
   - Backend validation of `branchId`
   - Blocks unauthorized API calls
   - Prevents malicious users or bugs

3. **Custom Claims** (Third Layer)
   - User's `branchId` stored in Firebase Auth token
   - Cannot be manipulated by client
   - Server-side verification

**All layers working together = Maximum security** 🔒

---

## Summary Table

| Collection | Before | After | Risk Level | Status |
|---|---|---|---|---|
| **Applicants** | ❌ No validation | ✅ Branch validated | 🔴 High → ✅ Low | ✅ Fixed |
| **Commissions** | ❌ No validation | ✅ Branch validated | 🔴 High → ✅ Low | ✅ Fixed |
| **Agents** | ✅ Already validated | ✅ No changes | ✅ Low | ✅ Secure |
| **Expenses** | ✅ Already validated | ✅ No changes | ✅ Low | ✅ Secure |

---

## Files Modified

1. **`firestore.rules`**
   - Line 142-143: Added branch validation for applicants creation
   - Line 334-335: Added branch validation for commissions creation

---

## Related Documentation

- [ALL_FORMS_BRANCHID_FIX_COMPLETE.md](./ALL_FORMS_BRANCHID_FIX_COMPLETE.md) - Frontend form fixes
- [BRANCH_MANAGER_APPLICANT_REGISTRATION_FIX.md](./BRANCH_MANAGER_APPLICANT_REGISTRATION_FIX.md) - Original issue
- [DOCUMENT_VERIFICATION_PERMISSION_FIX.md](./DOCUMENT_VERIFICATION_PERMISSION_FIX.md) - Previous security fix
- [FIRESTORE_SECURITY_AUDIT_REPORT.md](./FIRESTORE_SECURITY_AUDIT_REPORT.md) - If exists

---

## Verification Checklist

- [x] Applicants: Branch validation added to create rule
- [x] Commissions: Branch validation added to create rule
- [x] Firestore rules compiled successfully
- [x] Rules deployed to Firebase
- [x] Agents: Confirmed already secure
- [x] Expenses: Confirmed already secure
- [x] Documentation complete
- [x] Testing instructions provided

---

**✅ SECURITY FIX COMPLETE AND DEPLOYED!**

Both frontend forms and backend Firestore rules now properly validate that Branch Managers can only create records for their own branch. The application now has proper defense-in-depth security for branch-level data isolation.

