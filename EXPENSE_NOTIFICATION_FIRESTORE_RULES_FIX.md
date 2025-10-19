# Expense Submission Fix - Firestore Rules Update

## Issue
Expense submission was failing with the error:
```
FirebaseError: Missing or insufficient permissions.
```

Despite fixing the storage rules for receipt uploads, the expense creation itself was being blocked.

## Root Cause
The Firestore rules had an **outdated validation function** for notifications that didn't match the actual notification structure used by the application.

### The Problem in `firestore.rules`

**Original `isValidNotification()` function (INCORRECT):**
```javascript
function isValidNotification() {
  let data = request.resource.data;
  return data.keys().hasAll(['recipientId', 'type', 'title', 'message', 'status'])  // ❌ Expected 'message'
    && data.recipientId is string
    && data.type in ['info', 'success', 'warning', 'error']  // ❌ Limited to 4 values
    && data.title is string
    && data.message is string  // ❌ Field doesn't exist
    && data.status in ['unread', 'read', 'archived'];
}
```

**What the application actually sends:**
```javascript
await addDoc(notificationsRef, {
  type: 'expense_created',  // ✅ Custom type, not in the allowed list
  title: 'New Expense Submitted',
  body: '...',  // ✅ Uses 'body', not 'message'
  priority: 'medium',
  status: 'unread',
  recipientId: recipientId,
  recipientEmail: '',
  icon: '📝',
  metadata: {...},
  createdAt: Timestamp.now(),
});
```

### Mismatch Details:
1. **Field name**: Rules expected `message`, app uses `body`
2. **Type values**: Rules only allowed `['info', 'success', 'warning', 'error']`, but app uses:
   - `expense_created`
   - `expense_verified`
   - `expense_rejected`
   - `expense_approved`
   - `applicant_created`
   - `agent_created`
   - `commission_rejected`
   - `commission_approved`
   - `commission_paid`
   - And many more...

## Solution

### Updated `isValidNotification()` function:

**File:** `firestore.rules`

```javascript
function isValidNotification() {
  let data = request.resource.data;
  return data.keys().hasAll(['recipientId', 'type', 'title', 'body', 'status'])  // ✅ Now expects 'body'
    && data.recipientId is string
    && data.type is string  // ✅ Any string allowed
    && data.title is string
    && data.body is string  // ✅ Matches application
    && data.status in ['unread', 'read', 'archived'];
}
```

### Changes Made:
1. ✅ Changed `'message'` to `'body'` in required fields
2. ✅ Changed `data.message is string` to `data.body is string`
3. ✅ Changed `data.type in ['info', 'success', 'warning', 'error']` to `data.type is string` (accepts any string)

## Impact
This fix affects **ALL** notification creation across the application, including:
- ✅ Expense notifications (created, verified, rejected, approved)
- ✅ Commission notifications (rejected, approved, paid)
- ✅ Applicant notifications (created, stage changes)
- ✅ Agent notifications (created)
- ✅ Transfer notifications
- ✅ Document expiry notifications
- ✅ User and branch creation notifications

## Testing
1. Log in as **Branch Manager**
2. Navigate to **Expenses** > **New Expense**
3. Fill in the form:
   - Expense Type: Medical
   - Amount: 5000
   - Date: Today
   - Applicant: Select any
   - Description: "Test expense"
4. Upload a receipt
5. Click **Submit Request**
6. ✅ **Expected:** Expense created successfully
7. ✅ **Expected:** Notifications sent to HO Accountant and Admin
8. ✅ **Expected:** No errors in console

### Verify Notifications
1. Log in as **Admin**
2. Check **Notifications** bell icon
3. ✅ Should see notification: "New Expense Submitted"

## Deployment
```bash
firebase deploy --only firestore:rules
✅ Deploy complete!
```

## Files Changed
- ✅ `firestore.rules` - Updated `isValidNotification()` function

## Related Fixes
This issue was discovered while fixing:
1. Storage rules for expense receipt uploads
2. Branch validation for expense creation
3. Notification metadata undefined values

All three issues are now resolved:
- ✅ Storage rules allow branch-validated receipt uploads
- ✅ Firestore rules allow expense creation with proper validation
- ✅ Notifications are created with valid data structure

## Status
✅ **COMPLETELY FIXED** - Branch Managers can now successfully submit expense requests with receipts and notifications are sent properly

