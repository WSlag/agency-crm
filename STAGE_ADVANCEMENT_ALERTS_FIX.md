# Stage Advancement Alerts Fix

## Issue Identified

The "Pending Stage Advancements" alerts were not showing up in the Priority Alerts widget for Branch Managers (and Admins).

### Root Cause

The `stage_history` collection records did **not include a `branchId` field**, but the alerts query was trying to filter by branchId:

```typescript
// In useRealtimeAlerts.ts - This query was failing
const stageAdvancementsQuery = branchId
  ? query(
      collection(firestore, 'stage_history'),
      where('branchId', '==', branchId),  // ❌ This field didn't exist!
      where('status', '==', 'pending'),
      ...
    )
```

Since the `branchId` field didn't exist in the stage_history documents, the query would return 0 results even when there were pending stage advancements.

## Solution Implemented

### 1. Updated Stage Service
**File:** `src/services/stageService.ts`

Added `branchId` field when creating stage history records:

```typescript
const historyDoc = await addDoc(stageHistoryRef, {
  applicantId: transition.applicantId,
  branchId: applicant.branchId, // ✅ Now included
  fromStage: transition.fromStage,
  toStage: transition.toStage,
  changedBy: user.uid,
  changedAt: Timestamp.now(),
  approvalRequired: transition.requiresApproval,
  status: transition.requiresApproval ? 'pending' : 'approved',
  notes: transition.notes || '',
  approvedBy: null,
  approvedAt: null,
  rejectionReason: null
});
```

### 2. Updated TypeScript Interface
**File:** `src/types/applicant.ts`

Added `branchId` to the `StageHistory` interface:

```typescript
export interface StageHistory {
  id: string;
  applicantId: string;
  branchId: string; // ✅ Added
  fromStage: ApplicantStage | null;
  toStage: ApplicantStage;
  changedBy: string;
  changedAt: Date;
  approvalRequired: boolean;
  approvedBy: string | null;
  approvedAt: Date | null;
  status: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
  notes?: string;
}
```

### 3. Created Migration Script
**File:** `src/migrations/add-branchId-to-stage-history.ts`

Created a migration script to update existing stage_history records that don't have a branchId field. This ensures that pending approvals that were created before this fix will show up in the alerts.

## How to Apply the Fix

### For New Stage Advancements
✅ **Automatic** - New stage advancement requests will automatically include the branchId field.

### For Existing Stage History Records

Run the migration script to update existing records:

```bash
# Navigate to project root
cd C:\Users\HP\Desktop\agency

# Run the migration
npm run migrate:stage-history-branchid
```

Or run directly with Node:
```bash
npx tsx src/migrations/add-branchId-to-stage-history.ts
```

## Testing Instructions

### Step 1: Create a Test Stage Advancement
1. Login as a Branch Manager
2. Navigate to an applicant in the Medical stage (like Anisa Udtungan)
3. Click "Advance to Transfer to HO" button
4. Check documents and submit the request

### Step 2: Verify Alert Appears
1. Navigate back to the Dashboard
2. Check the "Priority Alerts" widget
3. You should now see:
   - "Pending Stage Advancements"
   - "1 applicant waiting for approval to advance"
   - Orange/yellow gradient background (medium priority)
   - Arrow up circle icon ⬆️

### Step 3: Verify Branch Filtering
1. Login as Branch Manager for Branch A
2. Create a pending stage advancement
3. Note the alert count
4. Login as Branch Manager for Branch B
5. Verify they DON'T see Branch A's pending approval
6. Verify each manager only sees their branch's pending approvals

### Step 4: Test Admin View
1. Login as Admin
2. Verify you see ALL pending stage advancements across all branches
3. Count should be the sum of all branches' pending approvals

## What Changed

### Before
- ❌ Stage history records had NO branchId field
- ❌ Alert queries couldn't filter by branch
- ❌ No pending stage advancement alerts showed up
- ❌ Branch managers couldn't see when applicants needed approval

### After  
- ✅ Stage history records include branchId
- ✅ Alert queries can filter by branch
- ✅ Pending stage advancement alerts appear in Priority Alerts
- ✅ Branch managers see real-time notifications
- ✅ Data isolation maintained (branch managers only see their branch)
- ✅ Admins see all pending approvals system-wide

## Firestore Index Required

After running the migration, create a composite index in Firestore:

**Index Configuration:**
```
Collection: stage_history
Fields:
  - branchId (Ascending)
  - status (Ascending)
  - createdAt (Descending)
```

**Alternative index (for queries without branchId):**
```
Collection: stage_history
Fields:
  - status (Ascending)
  - createdAt (Descending)
```

You can create these indexes manually in the Firebase Console, or they will be auto-created when the queries first run (you'll see an error with a link to create the index).

## Database Schema

### Updated stage_history Document Structure

```typescript
{
  id: "auto-generated-id",
  applicantId: "cLfD0rLoGt2BgFWnEYTH",
  branchId: "qZJ8K9L0M1N2O3P4Q5R6", // ✅ Now included
  fromStage: "medical",
  toStage: "transfer",
  changedBy: "user-uid-123",
  changedAt: Timestamp,
  approvalRequired: true,
  status: "pending", // "pending" | "approved" | "rejected"
  notes: "Ready for transfer to HO",
  approvedBy: null,
  approvedAt: null,
  rejectionReason: null
}
```

## Impact

### For Branch Managers
- ✅ Now see real-time alerts for pending stage advancements in their branch
- ✅ Can quickly identify applicants waiting for approval
- ✅ No more missed stage advancement requests
- ✅ Improved workflow efficiency

### For Applicants
- ✅ Faster stage advancement processing
- ✅ Reduced wait times
- ✅ Better experience through the recruitment pipeline

### For System
- ✅ Better data organization with branchId tracking
- ✅ Enables branch-specific reporting and analytics
- ✅ Improved audit trail with branch information
- ✅ Supports multi-branch operations at scale

## Files Modified

1. ✅ `src/services/stageService.ts` - Added branchId to stage history creation
2. ✅ `src/types/applicant.ts` - Updated StageHistory interface
3. ✅ `src/migrations/add-branchId-to-stage-history.ts` - Created migration script
4. ✅ `src/hooks/useRealtimeAlerts.ts` - Already had the query (was waiting for branchId field)
5. ✅ `src/components/dashboard/AlertsWidget.tsx` - Already had the icon and display logic

## Rollback Plan

If issues arise, you can rollback by:

1. Remove the branchId filtering from the query (temporary fix):
```typescript
// In useRealtimeAlerts.ts
const stageAdvancementsQuery = query(
  collection(firestore, 'stage_history'),
  where('status', '==', 'pending'),
  orderBy('createdAt', 'desc'),
  limit(50)
);
```

2. This will show ALL pending approvals regardless of branch (not ideal for branch managers, but will work for admins)

## Summary

The fix ensures that:
- ✅ Stage history records now include branchId for proper filtering
- ✅ Branch managers see pending stage advancement alerts for their branch
- ✅ Admins see all pending stage advancement alerts system-wide
- ✅ Existing records can be migrated to include branchId
- ✅ Real-time alerts work correctly with branch data isolation
- ✅ No applicants get stuck waiting for stage advancement approval

The Priority Alerts widget now provides complete visibility into all pending approvals, including stage advancements! 🎉

