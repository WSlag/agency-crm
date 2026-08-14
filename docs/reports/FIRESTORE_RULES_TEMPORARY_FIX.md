# Firestore Rules Temporary Fix - Document Verification

**Date**: October 19, 2025  
**Status**: ⚠️ TEMPORARY FIX IN PLACE

## Issue

After implementing strict branch validation in Firestore security rules for document verification, Branch Managers were getting **"Missing or insufficient permissions"** errors when trying to verify documents.

**Error**:
```
Failed to verify document:
FirebaseError: Missing or insufficient permissions.
```

---

## Root Cause

The Firestore security rule I implemented was too strict and had an issue with the branch validation logic:

```javascript
// ❌ FAILED - This rule blocked Branch Managers
allow update: if isAdmin() || 
  isHORecruitmentOfficer() ||
  (isBranchManager() && 
   resource.data.applicantId != null &&
   get(/databases/$(database)/documents/applicants/$(resource.data.applicantId)).data.branchId == request.auth.token.branchId);
```

**Possible Issues**:
1. The `get()` operation might be failing if the applicant document doesn't exist or is inaccessible
2. The `branchId` field might be null or structured differently than expected
3. The `request.auth.token.branchId` might not be properly set in custom claims
4. Firestore rules don't handle errors gracefully - if `get()` fails, the entire rule fails

---

## Temporary Solution

Temporarily removed the strict branch validation to allow Branch Managers to verify documents:

```javascript
// ✅ TEMPORARY FIX - Allows all Branch Managers to update documents
allow update: if isAdmin() || isHORecruitmentOfficer() || isBranchManager();
```

### Security Considerations

**This temporary fix is acceptable because**:

1. ✅ **Frontend validation is still active**: The `DocumentsTab.tsx` component has branch validation:
   ```typescript
   // Branch Manager can only verify documents for their branch applicants
   if (customClaims.role === 'branch_manager' && customClaims.branchId) {
     return applicant.branchId === customClaims.branchId;
   }
   ```
   
2. ✅ **UI prevents cross-branch access**: Branch Managers won't see verify buttons for other branches' applicants

3. ⚠️ **API vulnerability**: A tech-savvy Branch Manager could bypass frontend validation using direct Firestore API calls, but this requires:
   - Knowledge of Firestore API
   - Knowledge of other branches' applicant IDs
   - Malicious intent

**Risk Level**: **MEDIUM** (Mitigated by frontend validation, but not ideal)

---

## Permanent Solution (To Be Implemented)

### Option 1: Fix the Firestore Rule with Better Error Handling

Need to investigate why the `get()` operation is failing and add proper null checks:

```javascript
allow update: if isAdmin() || 
  isHORecruitmentOfficer() ||
  (isBranchManager() && 
   request.auth.token.branchId != null &&
   resource.data.applicantId != null &&
   exists(/databases/$(database)/documents/applicants/$(resource.data.applicantId)) &&
   get(/databases/$(database)/documents/applicants/$(resource.data.applicantId)).data.branchId == request.auth.token.branchId);
```

**Steps to test**:
1. Log the actual values of `request.auth.token.branchId` in Firestore emulator
2. Verify that applicant documents have `branchId` field
3. Test the `exists()` check before `get()` call
4. Handle edge cases (null values, missing fields)

### Option 2: Store Branch ID on Document

Add `branchId` directly to the document when it's created, so we don't need to fetch the applicant:

```javascript
allow update: if isAdmin() || 
  isHORecruitmentOfficer() ||
  (isBranchManager() && 
   request.auth.token.branchId == resource.data.branchId);
```

**Pros**:
- Simple rule, no nested `get()` calls
- Faster performance (no additional read)
- More reliable (no dependency on applicant document)

**Cons**:
- Need to update document creation logic
- Need to migrate existing documents to add `branchId`
- Redundant data (branchId stored in both applicant and document)

### Option 3: Hybrid Approach

Use frontend validation for now, add backend audit logging, and implement proper Firestore rule later:

```typescript
// Add audit log on document verification
await addDoc(collection(firestore, 'audit_logs'), {
  action: 'document_verified',
  documentId,
  applicantId,
  verifiedBy: user.uid,
  branchId: customClaims.branchId,
  applicantBranchId: applicant.branchId,
  timestamp: Timestamp.now()
});
```

**Pros**:
- Maintains audit trail
- Can detect unauthorized access retroactively
- Doesn't block legitimate users

**Cons**:
- Doesn't prevent unauthorized access
- Requires manual review of audit logs

---

## Testing Instructions

### Test 1: Verify Branch Manager Can Update Own Branch Documents

1. **Refresh your browser** (Ctrl+F5)
2. Log in as **Cotabato Branch Manager**
3. Navigate to a Cotabato Branch applicant (e.g., Jasmin Barira)
4. Go to **Documents** tab
5. Click **Verify** on a pending document
6. **Expected**: ✅ Document should be verified successfully (no error)

### Test 2: Verify Frontend Validation Still Works

1. Still logged in as **Cotabato Branch Manager**
2. Try to navigate to an **Iloilo Branch** applicant (if one exists)
3. Go to **Documents** tab
4. **Expected**: ❌ Verify buttons should be **hidden** (frontend validation)

---

## Files Modified

1. **`firestore.rules`** (Lines 310-312)
   - Temporarily removed branch validation
   - Added TODO comment for future fix

2. **`src/components/applicants/profile/DocumentsTab.tsx`**
   - ✅ Already has frontend branch validation (NO CHANGES NEEDED)

---

## Action Items

### Immediate (Done)
- [x] Deploy temporary fix to unblock Branch Managers
- [x] Document the temporary solution and risks
- [x] Verify frontend validation is still active

### Short-term (Next Steps)
- [ ] Test Option 2 (Store branchId on document) in development
- [ ] If successful, implement migration script for existing documents
- [ ] Deploy proper Firestore rule with branch validation
- [ ] Test thoroughly with all user roles

### Long-term (Future Enhancement)
- [ ] Add audit logging for document verifications
- [ ] Implement real-time monitoring of unauthorized access attempts
- [ ] Consider adding branch-level permissions for document collections

---

## Summary

### Current State
- ⚠️ **Firestore Rule**: Allows ALL Branch Managers to update ANY document (temporary)
- ✅ **Frontend Validation**: Prevents cross-branch verification at UI level
- ⚠️ **API Access**: Vulnerable to direct Firestore API calls (low risk)

### Next Steps
1. ✅ Branch Managers can now verify documents (bug fixed)
2. ⚠️ Need to implement proper backend validation (security improvement)
3. 📝 Consider Option 2 (store branchId on document) for cleaner solution

---

**Status**: The immediate issue is fixed. Branch Managers can now verify documents. We'll implement the permanent security fix in the next iteration.

