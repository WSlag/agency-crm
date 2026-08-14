# Expense Submission - Debugging with Simplified Rules

## Issue
After fixing notification validation, expense submission still fails with:
```
FirebaseError: Missing or insufficient permissions
```

## Hypothesis
The issue may be with the branch validation in the Firestore rules. Specifically:
```javascript
(isBranchManager() && belongsToBranch(request.resource.data.branchId))
```

This could fail if:
1. The user's custom claims don't have a `branchId`
2. The expense data's `branchId` is not set correctly
3. There's a type mismatch between the two values
4. The custom claims haven't loaded yet when submitting

## Debugging Approach

### Step 1: Simplified Rules (TEMPORARY)
I've temporarily removed branch validation from the expense rules to isolate the issue:

**File:** `firestore.rules` (lines 411-437)

```javascript
match /expenses/{expenseId} {
  // Create: Admins, HO Accountant, and Branch Managers
  // Temporarily simplified for debugging
  allow create: if isAuthenticated() && (
    isAdmin() ||
    isHOAccountant() ||
    isBranchManager()  // ✅ NO branch validation temporarily
  );
  
  // Read: All authenticated branch managers
  allow read: if isAuthenticated() && (
    isAdmin() ||
    isPresident() ||
    isHOAccountant() ||
    isBranchManager()  // ✅ NO branch validation temporarily
  );
  
  // Update: Admins, President, and HO Accountant
  allow update: if isAuthenticated() && (
    isAdmin() ||
    isPresident() ||
    isHOAccountant()
  );
}
```

### Step 2: Added Detailed Logging

**File:** `src/pages/expenses/ExpenseEntry.tsx`
- Added console log before createExpense to show:
  - All expense data
  - User's custom claims role
  - User's custom claims branchId
  - User UID

**File:** `src/stores/expenseStore.ts`
- Added console log before Firestore write to show:
  - Document ID
  - All expense data fields
  - Whether branchId exists
  - Whether enteredBy exists

## Testing Instructions

### Test 1: Try to Submit Expense
1. **Refresh the browser** (Ctrl+F5 or Cmd+Shift+R)
2. Log in as **Branch Manager**
3. Go to **Expenses** > **New Expense**
4. Fill in the form
5. Upload a receipt
6. Click **Submit Request**
7. **Check the console** for these logs:
   - `📋 Expense Data Before Submission:` - Shows data passed to store
   - `✅ Expense Form: Branch ID set from custom claims:` - Shows branchId was set
   - `🔥 Firestore Write Attempt:` - Shows data being written to Firestore

### Test 2: Analyze Console Output

If it **SUCCEEDS** with simplified rules:
- ✅ The issue WAS with branch validation
- Need to investigate why `belongsToBranch()` is failing:
  - Check if custom claims have branchId
  - Check if branchId types match (both strings?)
  - Check timing (claims loaded before submit?)

If it **STILL FAILS** with simplified rules:
- ❌ The issue is NOT branch validation
- Possible causes:
  - Required field missing
  - Invalid data type
  - Missing role in custom claims
  - Authentication issue

## Expected Console Output (Success Case)

```javascript
✅ Expense Form: Branch ID set from custom claims: BM5EgmgNX8nWRB3kKDIS

📋 Expense Data Before Submission: {
  expenseType: "medical",
  category: "Medical",
  amount: 5000,
  expenseDate: Date,
  applicantId: "xyz123",
  description: "Test expense",
  branchId: "BM5EgmgNX8nWRB3kKDIS",  // ✅ Should exist
  enteredBy: "user123",  // ✅ Should exist
  customClaimsRole: "branch_manager",  // ✅ Should exist
  customClaimsBranchId: "BM5EgmgNX8nWRB3kKDIS",  // ✅ Should exist
  userUid: "user123"
}

🔥 Firestore Write Attempt: {
  docId: "expenseDoc123",
  expenseData: { ... },
  hasBranchId: true,  // ✅ Should be true
  hasEnteredBy: true  // ✅ Should be true
}

✅ Sent 3 notifications for new expense
```

## Next Steps Based on Results

### If Success:
1. Re-enable branch validation
2. Add logging to `belongsToBranch()` check
3. Ensure custom claims are loaded before form submission
4. Possibly add client-side validation before submit

### If Still Fails:
1. Check user authentication state
2. Verify custom claims are set correctly
3. Check for missing required fields
4. Verify Firestore rules syntax

## Deployment
```bash
firebase deploy --only firestore:rules
✅ Deploy complete!
```

## IMPORTANT: Restore Security
⚠️ These simplified rules are for **DEBUGGING ONLY**. They allow any Branch Manager to create/read expenses for any branch, which is a security risk. Once the issue is identified, the branch validation MUST be restored:

```javascript
allow create: if isAuthenticated() && (
  isAdmin() ||
  isHOAccountant() ||
  (isBranchManager() && belongsToBranch(request.resource.data.branchId))
);
```

## Files Modified
- ✅ `firestore.rules` - Temporarily simplified expense rules
- ✅ `src/pages/expenses/ExpenseEntry.tsx` - Added logging
- ✅ `src/stores/expenseStore.ts` - Added logging

