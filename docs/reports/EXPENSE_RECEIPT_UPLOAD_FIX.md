# Expense Receipt Upload Fix

## Issue
When uploading a receipt in the expense form, the following error occurred:
```
Firebase Storage: User does not have permission to access 'receipts/temp/1760884255712_logo2.png'. (storage/unauthorized)
```

## Root Cause
The expense form was trying to upload the receipt file **before** the expense was created in Firestore. This resulted in:
1. Using `'temp'` as the expenseId (since the expense didn't exist yet)
2. Attempting to upload to `receipts/temp/...` path
3. Storage rules rejected the upload because the path didn't match any allowed patterns

Additionally, the upload path `receipts/${expenseId}/...` didn't match the storage rules which expected `expense_receipts/${expenseId}/...`.

## Solution

### 1. Fixed Upload Flow
**Before:**
- Form tried to upload file → Used 'temp' ID → Permission denied

**After:**
- Form passes file to parent → Create expense in Firestore → Get expense ID → Upload file with real ID

### 2. Updated Files

#### `src/components/expenses/ExpenseForm.tsx`
```typescript
// OLD: Tried to upload before expense creation
const handleFormSubmit = async (data: any) => {
  if (selectedFile && config?.requiresReceipt) {
    const receiptUrl = await uploadReceipt(initialData?.id || 'temp', selectedFile);
    data.receiptUrl = receiptUrl;
  }
  await onSubmit(data);
};

// NEW: Pass file to parent for upload after expense creation
const handleFormSubmit = async (data: any) => {
  await onSubmit({
    ...data,
    _selectedFile: selectedFile, // Pass file to parent
  });
};
```

#### `src/pages/expenses/ExpenseEntry.tsx`
```typescript
const handleSubmit = async (data: Partial<Expense> & { _selectedFile?: File }) => {
  const { _selectedFile, ...expenseData } = data;
  
  if (id) {
    // Edit mode
    await updateExpense(id, expenseData);
    if (_selectedFile) {
      await useExpenseStore.getState().uploadReceipt(id, _selectedFile);
    }
  } else {
    // Create mode
    const expenseId = await createExpense(expenseData); // Returns new expense ID
    
    // Upload receipt after expense is created
    if (_selectedFile) {
      await useExpenseStore.getState().uploadReceipt(expenseId, _selectedFile);
    }
  }
  navigate('/expenses');
};
```

#### `src/stores/expenseStore.ts`
```typescript
// OLD: Wrong path
const storageRef = ref(storage, `receipts/${expenseId}/${timestamp}_${file.name}`);

// NEW: Correct path matching storage.rules line 149
const storageRef = ref(storage, `expense_receipts/${expenseId}/${timestamp}_${file.name}`);
```

### 3. Storage Rules (No changes needed)
The existing storage rules at `storage.rules` line 149-164 already allow this path:
```javascript
match /expense_receipts/{expenseId}/{receiptId} {
  allow read: if isAuthenticated() && (
    isAdmin() ||
    isPresident() ||
    isHOAccountant()
  );
  
  allow write: if isAuthenticated() &&
    isValidFileSize(5) &&
    isValidDocumentType() &&
    (isAdmin() ||
     isHOAccountant() ||
     isBranchManager());
}
```

## Testing Steps
1. Log in as a Branch Manager
2. Navigate to Expenses > New Expense
3. Fill in all required fields
4. Upload a receipt (image or PDF)
5. Submit the form
6. ✅ The expense should be created successfully
7. ✅ The receipt should be uploaded to Firebase Storage
8. ✅ The expense should display the receipt URL

## Benefits
1. **Security**: Receipts are now uploaded with valid expense IDs
2. **Storage Rules Compliance**: Upload path matches security rules
3. **Always Visible**: Receipt field is now always visible (as requested)
4. **Edit Support**: Also fixed receipt upload when editing expenses
5. **Better Error Handling**: Added alert for failed submissions

## Files Changed
- ✅ `src/components/expenses/ExpenseForm.tsx`
- ✅ `src/pages/expenses/ExpenseEntry.tsx`
- ✅ `src/stores/expenseStore.ts`

## Status
✅ **FIXED** - Receipt upload now works correctly for both new and edited expenses

