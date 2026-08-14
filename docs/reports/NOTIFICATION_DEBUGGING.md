# Notification System Debugging

## Current Status
Notifications are being created when expenses are submitted (console shows "✅ Sent 2 notifications for new expense"), but the notifications page shows "No notifications".

## Diagnostic Logging Added

I've added comprehensive logging to `src/stores/notificationStore.ts` to track:
1. Which user ID is being used to fetch notifications
2. What query filters are being applied
3. How many notifications are found
4. Details of each notification (type, title, recipientId, status)
5. Any errors that occur

### Console Output to Look For:

**Expected logs when viewing notifications page:**
```
🔔 Fetching notifications for user: q7iALmupzjCUJh5PrDAbhXAR0qN2
📋 Query filter: { recipientId: "...", filter: {...}, sort: {...} }
✅ Found X notifications
📬 Notification: { id: "...", type: "expense_created", title: "New Expense Submitted", recipientId: "...", status: "unread" }
```

## Possible Issues

### Issue 1: User ID Mismatch
**Symptom:** Notifications created with one user ID, but fetching with different user ID

**Check:** Compare these in console:
- User ID when creating expense: `q7iALmupzjCUJh5PrDAbhXAR0qN2`
- User ID when fetching notifications: Should be the same

**Solution:** If different, the issue is with user authentication state

### Issue 2: Firestore Query Error
**Symptom:** Error in console when fetching notifications

**Check:** Look for `❌ Error fetching notifications:` in console

**Solution:** Fix the query or Firestore rules

### Issue 3: Notifications Created for Wrong Recipients
**Symptom:** Notifications created but not for the current user

**Check:** 
- Expense creator is Branch Manager (ID: `q7iALmupzjCUJh5PrDAbhXAR0qN2`)
- Notifications should be sent to HO Accountant and Admin
- Log in as Admin or HO Accountant to see if they have notifications

**Solution:** Branch Managers don't receive their own notifications, only Admin and HO Accountant do

### Issue 4: Firestore Rules Blocking Read
**Symptom:** No error, but 0 notifications found

**Check:** Firestore rules may be blocking the query

**Solution:** Verify notification read rules allow the current user

## Testing Instructions

### Step 1: Check as Branch Manager (Current User)
1. **Refresh** the browser (F5)
2. Go to **Notifications** page
3. **Open Console** (F12)
4. Look for these logs:
   ```
   🔔 Fetching notifications for user: [your-user-id]
   ✅ Found X notifications
   ```
5. **Copy and share** the console output

### Step 2: Check as Admin
1. **Sign out** as Branch Manager
2. **Sign in as Admin** (admin@agency.com)
3. Go to **Notifications** page
4. Check if Admin sees notifications about expenses

### Step 3: Check as HO Accountant
1. Sign in as HO Accountant (accountant@agency.com or hoaccountant@example.com)
2. Go to **Notifications** page
3. Check if HO Accountant sees notifications about expenses

## Expected Behavior

### Who Should See Expense Notifications:
- ✅ **Admin** - Should see all expense notifications
- ✅ **HO Accountant** - Should see all expense notifications  
- ❌ **Branch Manager** - Should NOT see their own expense notifications (they created them)
- ❌ **President** - Not included in expense notification recipients

### Notification Flow:
1. Branch Manager creates expense
2. System finds all users with role `ho_accountant`
3. System finds all users with role `admin`
4. System creates notification for each of these users
5. Each recipient can see the notification in their notifications page

## Files Modified
- ✅ `src/stores/notificationStore.ts` - Added diagnostic logging

## Next Steps
Please:
1. **Refresh** the notifications page
2. **Check console** for the diagnostic logs
3. **Share** the console output showing:
   - User ID being used
   - Number of notifications found
   - Any errors

This will help identify exactly where the issue is!

