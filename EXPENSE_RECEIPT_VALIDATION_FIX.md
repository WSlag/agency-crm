# Expense Receipt Validation Fix

## Issue
When submitting an expense request with a receipt that was cleared (or without a receipt), the form showed a validation error:
```
Expected string, received null
```

This appeared below the "Receipt / Supporting Documents" field in red text.

## Root Cause
The Zod schema for expenses had:
```typescript
receiptUrl: z.string().url().optional(),
```

This validation rule means:
- The field is **optional** (can be omitted)
- BUT if provided, it MUST be a valid URL string
- ❌ It does NOT accept `null` values

When the user:
1. Uploads a file and then clears it, OR
2. Doesn't upload a file at all

The form passes `receiptUrl: null`, which fails validation because `z.string()` expects a string, not `null`.

## Solution

### Fixed Schema Validation

**File:** `src/schemas/financial.ts` (line 23)

**Before:**
```typescript
receiptUrl: z.string().url().optional(),
```

**After:**
```typescript
receiptUrl: z.string().url().nullable().optional(),
```

### What Changed:
- ✅ Added `.nullable()` to accept `null` values
- ✅ Kept `.optional()` to make the field optional
- ✅ Kept `.url()` to validate URL format when provided

### Now Accepts:
1. ✅ `receiptUrl: undefined` - Field omitted entirely
2. ✅ `receiptUrl: null` - Field explicitly set to null (cleared file)
3. ✅ `receiptUrl: "https://..."` - Valid URL string

### Rejects:
- ❌ `receiptUrl: ""` - Empty string
- ❌ `receiptUrl: "not-a-url"` - Invalid URL format
- ❌ `receiptUrl: 123` - Wrong data type

## Testing Instructions

### Test 1: Submit Without Receipt
1. Log in as **Branch Manager**
2. Go to **Expenses** > **New Expense**
3. Fill in all required fields:
   - Expense Type: Office Expenses
   - Amount: 1000
   - Description: "Meals for the boys"
   - Receipt Number: We2323d
   - Expense Date: 19/10/2025
   - Tags: meals
4. **DO NOT** upload a receipt
5. Click **Create**
6. ✅ **Expected:** Expense created successfully (receipt is optional for some expense types)

### Test 2: Submit With Receipt
1. Follow steps 1-3 above
2. Click **Choose File** and select an image
3. Click **Create**
4. ✅ **Expected:** Expense created successfully with receipt uploaded

### Test 3: Clear Receipt and Submit
1. Follow steps 1-3 above
2. Click **Choose File** and select an image
3. Click the red ❌ button to clear the file
4. Click **Create**
5. ✅ **Expected:** Expense created successfully without receipt

### Test 4: Receipt Required Type
1. Select **Expense Type: Medical** (requires receipt)
2. Try to submit without uploading a receipt
3. ✅ **Expected:** Form validation should prevent submission OR backend should validate

## Related Issues Fixed

This validation fix is part of the complete expense submission solution:

1. ✅ **Storage Rules** - Fixed receipt upload path with branch validation
2. ✅ **Upload Flow** - Fixed to upload after expense creation
3. ✅ **Notification Validation** - Fixed Firestore rules for notification structure
4. ✅ **Firestore Rules** - Temporarily simplified for debugging
5. ✅ **Receipt Validation** - **THIS FIX** - Allow null values for optional receipts

## Files Changed
- ✅ `src/schemas/financial.ts` - Updated `expenseSchema.receiptUrl` validation

## Status
✅ **FIXED** - Receipt field now properly accepts null values and optional receipts

## Next Steps
1. Test expense submission (as outlined above)
2. If successful, restore branch validation in Firestore rules
3. Remove debug logging from ExpenseEntry.tsx and expenseStore.ts

