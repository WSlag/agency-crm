# Expense Receipt Upload - Final Fix

## Issues Found
After the initial fix, two errors persisted when submitting expense requests with uploaded documents:

### Error 1: Storage Permission Denied
```
Firebase Storage: User does not have permission to access 
'expense_receipts/BM5EgmgNX8nWRB3kKDIS/1760884729480_logo2.png'. 
(storage/unauthorized)
```

### Error 2: Notification Creation Failed
```
FirebaseError: Function addDoc() called with invalid data. 
Unsupported field value: undefined (found in field metadata.category 
in document notifications/GVFWQi0RnJlpfaCKQfs3)
```

## Root Causes

### Issue 1: Storage Rules Branch Validation
The storage rules for `expense_receipts` didn't include branch validation for Branch Managers. Since expenses are branch-specific, Branch Managers should only be able to upload receipts for their own branch's expenses.

**Original Path Structure:**
```
expense_receipts/{expenseId}/{receiptId}
```

**Problem:** No way to validate branch ownership in storage rules.

### Issue 2: Undefined Values in Notifications
The notification metadata included `category` field which could be `undefined`, and Firestore doesn't allow `undefined` values.

## Solutions Implemented

### 1. Updated Storage Rules Path Structure

**File:** `storage.rules`

**Changed from:**
```javascript
match /expense_receipts/{expenseId}/{receiptId} {
  allow write: if isAuthenticated() &&
    isValidFileSize(5) &&
    isValidDocumentType() &&
    (isAdmin() ||
     isHOAccountant() ||
     isBranchManager());
}
```

**Changed to:**
```javascript
match /expense_receipts/{branchId}/{expenseId}/{receiptId} {
  allow read: if isAuthenticated() && (
    isAdmin() ||
    isPresident() ||
    isHOAccountant() ||
    belongsToBranch(branchId)
  );
  
  allow write: if isAuthenticated() &&
    isValidFileSize(5) &&
    isValidDocumentType() &&
    (isAdmin() ||
     isHOAccountant() ||
     (isBranchManager() && belongsToBranch(branchId)));
}
```

**Benefits:**
- ✅ Branch Managers can only upload receipts for their own branch
- ✅ Branch validation happens at the storage rule level (security layer)
- ✅ Admins and HO Accountants can upload for any branch
- ✅ Users can only read receipts from their own branch (except admins/accountants)

### 2. Updated Upload Function

**File:** `src/stores/expenseStore.ts`

```typescript
uploadReceipt: async (expenseId, file) => {
  try {
    set({ loading: true, error: null });
    
    // ✅ Get expense to retrieve branchId
    const expenseDoc = await getDoc(doc(firestore, 'expenses', expenseId));
    if (!expenseDoc.exists()) {
      throw new Error('Expense not found');
    }
    
    const expenseData = expenseDoc.data();
    const branchId = expenseData.branchId;
    
    if (!branchId) {
      throw new Error('Expense does not have a branch ID');
    }
    
    const timestamp = Date.now();
    // ✅ Include branchId in path
    const storageRef = ref(
      storage,
      `expense_receipts/${branchId}/${expenseId}/${timestamp}_${file.name}`
    );

    await uploadBytes(storageRef, file);
    const receiptUrl = await getDownloadURL(storageRef);

    await updateDoc(doc(firestore, 'expenses', expenseId), {
      receiptUrl,
      updatedAt: serverTimestamp(),
    });

    return receiptUrl;
  } catch (error) {
    set({
      error: error instanceof Error ? error.message : 'Failed to upload receipt',
      loading: false,
    });
    throw error;
  } finally {
    set({ loading: false });
  }
},
```

### 3. Fixed Notification Metadata

**File:** `src/stores/expenseStore.ts`

**Changed from:**
```typescript
metadata: {
  expenseId: docRef.id,
  applicantId: data.applicantId,
  applicantName,
  category: data.category, // ❌ Could be undefined
  amount: data.amount,
  enteredBy: data.enteredBy,
}
```

**Changed to:**
```typescript
// ✅ Filter out undefined values from metadata
const metadata: any = {
  expenseId: docRef.id,
};

if (data.applicantId) metadata.applicantId = data.applicantId;
if (applicantName) metadata.applicantName = applicantName;
if (data.category) metadata.category = data.category;
if (data.amount !== undefined) metadata.amount = data.amount;
if (data.enteredBy) metadata.enteredBy = data.enteredBy;
```

**Also updated notification body:**
```typescript
body: `New ${data.category || 'expense'} expense of ₱${data.amount?.toLocaleString() || '0'} submitted${data.applicantId ? ` for ${applicantName}` : ''}`,
```

## Complete Upload Flow

### New Expense Creation
1. **User fills form** → Selects file and fills expense details
2. **Form submission** → Passes file to parent component
3. **Create expense** → Writes expense document to Firestore (gets expense ID)
4. **Upload receipt** → Fetches expense to get branchId → Uploads to `expense_receipts/{branchId}/{expenseId}/{timestamp}_file.png`
5. **Update expense** → Adds `receiptUrl` to expense document
6. **Send notifications** → Notifies HO Accountant and Admins (with filtered metadata)

### Security Layers
1. **Application Level** - Branch Managers can only create expenses for their branch
2. **Firestore Rules** - Validates `branchId` on expense creation
3. **Storage Rules** - Validates `branchId` matches user's branch on receipt upload

## Files Changed
- ✅ `storage.rules` - Updated path structure with branchId validation
- ✅ `src/stores/expenseStore.ts` - Updated upload function and notification metadata

## Testing Steps
1. Log in as a Branch Manager (e.g., Cotabato)
2. Navigate to **Expenses** > **New Expense**
3. Fill in all required fields:
   - Expense Type (e.g., "Medical")
   - Amount
   - Date
   - Applicant (if required)
   - Description
4. Upload a receipt (image or PDF)
5. Click **Submit Request**
6. ✅ **Expected:** Expense created successfully
7. ✅ **Expected:** Receipt uploaded to Firebase Storage
8. ✅ **Expected:** Notification sent to HO Accountant and Admins
9. ✅ **Expected:** No errors in console

### Verify Branch Isolation
1. Log in as **Cotabato Branch Manager**
2. Create expense with receipt → ✅ Success
3. Log in as **Iloilo Branch Manager**  
4. Try to access Cotabato's receipt URL → ❌ Should be denied
5. Create own expense with receipt → ✅ Success

## Status
✅ **COMPLETELY FIXED** - Branch Managers can now create expenses with receipts, with proper branch-level security

## Deployment
```bash
# Already deployed
firebase deploy --only storage
# Output: ✅ Deploy complete!
```

