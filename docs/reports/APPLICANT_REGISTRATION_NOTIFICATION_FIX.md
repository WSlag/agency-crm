# Applicant Registration Notification Fix

## Issue Reported
When logged in as Admin, after a new applicant was added by Cotabato Branch, the notifications remained empty. The Admin did not receive any notification about the new applicant registration.

## Root Cause
The `createApplicant` function in `src/stores/applicantStore.ts` was only creating the applicant document in Firestore but **NOT sending any notifications** to inform relevant stakeholders about the new registration.

### Original Code (Lines 314-331)
```typescript
createApplicant: async (applicant) => {
  try {
    const docRef = doc(collection(firestore, 'applicants'));
    await setDoc(docRef, {
      ...applicant,
      status: applicant.status || 'active',
      currentStage: applicant.currentStage || 'registration',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;  // ❌ No notifications sent
  } catch (error) {
    console.error('Error creating applicant:', error);
    throw error;
  }
},
```

## Solution Implemented

### Added Notification Logic to createApplicant

**File Modified**: `src/stores/applicantStore.ts`

**What Was Added**:
After creating the applicant document, the function now:
1. Queries for all Admin users
2. Queries for all President users
3. Queries for the Branch Manager of the applicant's branch
4. Fetches the branch name for better notification context
5. Creates individual notifications for each recipient

### Updated Code
```typescript
createApplicant: async (applicant) => {
  try {
    const docRef = doc(collection(firestore, 'applicants'));
    await setDoc(docRef, {
      ...applicant,
      status: applicant.status || 'active',
      currentStage: applicant.currentStage || 'registration',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // ✅ NEW: Send notifications to admins and presidents
    try {
      const notificationsRef = collection(firestore, 'notifications');
      const recipients: string[] = [];

      // Get all admin users
      const adminQuery = query(
        collection(firestore, 'users'),
        where('role', '==', 'admin')
      );
      const adminSnapshot = await getDocs(adminQuery);
      adminSnapshot.docs.forEach(doc => recipients.push(doc.id));

      // Get all president users
      const presidentQuery = query(
        collection(firestore, 'users'),
        where('role', '==', 'president')
      );
      const presidentSnapshot = await getDocs(presidentQuery);
      presidentSnapshot.docs.forEach(doc => recipients.push(doc.id));

      // Get branch manager of the applicant's branch
      if (applicant.branchId) {
        const branchManagerQuery = query(
          collection(firestore, 'users'),
          where('role', '==', 'branch_manager'),
          where('branchId', '==', applicant.branchId)
        );
        const branchManagerSnapshot = await getDocs(branchManagerQuery);
        branchManagerSnapshot.docs.forEach(doc => recipients.push(doc.id));
      }

      // Get branch name for notification
      let branchName = 'Unknown Branch';
      if (applicant.branchId) {
        try {
          const branchDoc = await getDoc(doc(firestore, 'branches', applicant.branchId));
          if (branchDoc.exists()) {
            branchName = branchDoc.data().name || applicant.branchId;
          }
        } catch (branchError) {
          console.error('Error fetching branch name:', branchError);
        }
      }

      // Create notifications for all recipients
      const applicationType = applicant.applicationType === 'with_agent' 
        ? 'With Agent' 
        : 'Direct Hire';

      for (const recipientId of recipients) {
        await addDoc(notificationsRef, {
          type: 'applicant_created',
          title: 'New Applicant Registered',
          body: `${applicant.fullName} (${applicationType}) has been registered from ${branchName}`,
          priority: 'medium',
          status: 'unread',
          recipientId: recipientId,
          recipientEmail: '',
          icon: '👤',
          metadata: {
            applicantId: docRef.id,
            applicantName: applicant.fullName,
            applicantEmail: applicant.email,
            applicationType: applicant.applicationType,
            branchId: applicant.branchId,
            branchName: branchName,
          },
          createdAt: Timestamp.now(),
        });
      }

      console.log(`✅ Sent ${recipients.length} notifications for new applicant registration`);
    } catch (notifError) {
      console.error('Error sending notifications:', notifError);
      // Don't fail the whole operation if notifications fail
    }

    return docRef.id;
  } catch (error) {
    console.error('Error creating applicant:', error);
    throw error;
  }
},
```

## Notification Details

### Who Receives Notifications?
When a new applicant is registered:
- ✅ **All Admin users** - They oversee the entire system
- ✅ **All President users** - They need to know about new registrations
- ✅ **Branch Manager** of the applicant's branch - They manage the branch where the applicant was registered

### Notification Content

**Type**: `applicant_created`

**Title**: "New Applicant Registered"

**Body**: "[Applicant Name] ([Application Type]) has been registered from [Branch Name]"

**Priority**: Medium

**Icon**: 👤

**Metadata**:
- `applicantId`: The new applicant's ID
- `applicantName`: The applicant's full name
- `applicantEmail`: The applicant's email
- `applicationType`: "with_agent" or "direct_hire"
- `branchId`: The branch ID
- `branchName`: The human-readable branch name

### Example Notification
```
Title: New Applicant Registered
Body: Anisa Udtungan (Direct Hire) has been registered from Cotabato Branch
```

## How It Works

### Flow:
1. **Branch Manager** (or Admin) fills out the New Applicant Registration form
2. **System** creates the applicant document in Firestore
3. **System** queries for all Admins, Presidents, and the Branch Manager
4. **System** fetches the branch name for better context
5. **System** creates individual notification documents for each recipient
6. **Recipients** see the new notification in their notification center
7. **If notification fails**, the applicant creation still succeeds (graceful error handling)

## Benefits

### 1. **Improved Communication** ✅
- Admins are immediately notified when new applicants are registered
- Presidents stay informed about new registrations
- Branch Managers know when applicants are added to their branch

### 2. **Better Context** ✅
- Notifications include the applicant's name
- Shows the application type (With Agent or Direct Hire)
- Displays the branch name instead of just an ID
- Provides clickable metadata for easy access

### 3. **Graceful Error Handling** ✅
- If notification creation fails, the applicant creation still succeeds
- Errors are logged but don't interrupt the main operation
- User experience is not affected by notification failures

### 4. **Consistent with Other Features** ✅
- Follows the same pattern as User Creation notifications
- Follows the same pattern as Branch Creation notifications
- Maintains consistency across the application

## Testing Instructions

### Test Case 1: New Applicant Registration (Branch Manager)
1. **Login as Branch Manager** (Cotabato Branch)
2. **Navigate to**: Applicants → New Applicant
3. **Fill out all 5 steps** of the registration form
4. **Submit** the form
5. **Logout** from Branch Manager account
6. **Login as Admin**
7. **Navigate to**: Notifications
8. **Verify**: You see a notification like:
   - "New Applicant Registered"
   - "[Applicant Name] (Direct Hire) has been registered from Cotabato Branch"

### Test Case 2: Check Multiple Recipients
1. **Create a new applicant** from any branch
2. **Check Admin notifications** - Should have the notification
3. **Check President notifications** - Should have the notification
4. **Check Branch Manager notifications** - Should have the notification

### Test Case 3: Verify Branch Name Display
1. **Create a new applicant** from Cotabato Branch
2. **Check notification body** - Should show "Cotabato Branch", NOT the branch ID
3. **Create another applicant** from a different branch
4. **Check notification body** - Should show that branch's name

## Error Handling

### If Branch Name Fetch Fails:
- Falls back to "Unknown Branch" in the notification
- Does not crash or prevent notification creation

### If Notification Creation Fails:
- Error is logged to console
- Applicant creation still succeeds
- User is not blocked or shown an error

### If No Recipients Found:
- Loop simply doesn't create any notifications
- No errors thrown
- Applicant creation still succeeds

## Files Modified
- ✅ `src/stores/applicantStore.ts` - Added notification logic to `createApplicant` function

## Related Implementations
- `src/pages/admin/users/UserForm.tsx` - User creation notifications
- `src/pages/admin/branches/BranchForm.tsx` - Branch creation notifications
- `src/services/stageService.ts` - Stage change notifications

## Notes
- All required imports (`getDoc`, `doc`, `Timestamp`, `addDoc`) were already present in the file
- No breaking changes to existing functionality
- Notification creation is wrapped in try-catch to ensure graceful failure
- Branch name lookup adds minimal latency but provides much better UX

## Status
✅ **IMPLEMENTED AND READY TO TEST**

When you register a new applicant now, all Admins, Presidents, and the relevant Branch Manager will receive a notification about the new registration.

