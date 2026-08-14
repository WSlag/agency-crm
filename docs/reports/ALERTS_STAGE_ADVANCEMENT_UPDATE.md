# Priority Alerts - Stage Advancement Feature Added

## Overview

Successfully added "Pending Stage Advancements" alerts to the Branch Manager (and Admin) Priority Alerts widget. This ensures branch managers are immediately notified when applicants are waiting for approval to advance to the next stage in the recruitment pipeline.

## Changes Made

### 1. Updated Alert Types
**File:** `src/hooks/useRealtimeAlerts.ts`

**Changes:**
- Added `'stage_advancement'` to the Alert type union
- Implemented real-time listener for pending stage advancements from `stage_history` collection
- Added branch filtering support (branch managers only see their branch's pending advancements)

**New Alert Type:**
```typescript
export interface Alert {
  id: string;
  type: 'expense' | 'commission' | 'document' | 'transfer' | 'stage_advancement';
  // ... other fields
}
```

**Query Implementation:**
```typescript
// Pending Stage Advancements
const stageAdvancementsQuery = branchId
  ? query(
      collection(firestore, 'stage_history'),
      where('branchId', '==', branchId),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(50)
    )
  : query(
      collection(firestore, 'stage_history'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(50)
    );
```

### 2. Updated Alert Display
**File:** `src/components/dashboard/AlertsWidget.tsx`

**Changes:**
- Added `ArrowUpCircleIcon` import from Heroicons
- Updated `getAlertIcon()` function to return the appropriate icon for stage advancement alerts
- Icon displayed: ⬆️ (Arrow Up Circle) - represents moving to next stage

**Icon Mapping:**
```typescript
case 'stage_advancement':
  return ArrowUpCircleIcon;
```

## Alert Details

### Display Information
- **Title:** "Pending Stage Advancements"
- **Description:** "{count} applicant(s) waiting for approval to advance"
- **Priority:** 
  - High: When count > 5
  - Medium: When count ≤ 5
- **Action URL:** `/applicants` (navigates to applicants list)
- **Icon:** Arrow Up Circle (⬆️)

### Real-time Updates
- Uses Firestore `onSnapshot` for live updates
- No page refresh needed - alerts appear instantly
- Updates count dynamically as approvals are processed

## Data Filtering

### For Branch Managers
- Only shows pending stage advancements from their assigned branch
- Query filtered by: `where('branchId', '==', branchId)`
- Ensures data isolation and security

### For Admins
- Shows all pending stage advancements across all branches
- No branch filtering applied

## User Experience

### How It Appears in Dashboard
1. Branch manager logs in
2. Dashboard loads with Priority Alerts widget
3. If there are applicants waiting for stage advancement approval:
   - Alert card appears with orange/yellow gradient (medium priority)
   - Shows count of pending approvals
   - Displays upward arrow icon
   - Shows description: "X applicant(s) waiting for approval to advance"
4. Clicking the alert navigates to the applicants page
5. Branch manager can review and approve stage advancements

### Priority System
The alert priority adjusts based on the number of pending approvals:
- **1-5 pending:** Medium priority (yellow/amber colors)
- **6+ pending:** High priority (red/orange colors with animation)

## Technical Details

### Firestore Collection Structure
```
stage_history/
  {documentId}/
    - applicantId: string
    - branchId: string
    - fromStage: string
    - toStage: string
    - status: 'pending' | 'approved' | 'rejected'
    - createdAt: Timestamp
    - requestedBy: string
    - approvedBy?: string
    - approvalDate?: Timestamp
```

### Query Optimization
- Limited to 50 most recent pending items
- Ordered by `createdAt` descending (newest first)
- Uses composite index for efficient filtering:
  - `branchId` + `status` + `createdAt`

### Performance Considerations
- Real-time listener automatically unsubscribes on component unmount
- Query results cached by Firestore
- Minimal data transfer (only metadata, no full applicant documents)

## Integration with Existing System

### Works With
- ✅ Branch Manager Dashboard
- ✅ Admin Dashboard
- ✅ Existing Priority Alerts widget
- ✅ Real-time notification system
- ✅ Branch data isolation

### Complements Existing Alerts
1. Pending Expense Approvals
2. Pending Commission Requests
3. Pending Transfer Requests
4. Documents Expiring Soon
5. **NEW:** Pending Stage Advancements ⬆️

## Testing Checklist

### For Branch Managers
- [ ] Login as branch manager
- [ ] Verify dashboard shows Priority Alerts widget
- [ ] Create a stage advancement request for an applicant
- [ ] Verify alert appears in Priority Alerts
- [ ] Confirm count is accurate
- [ ] Click alert to navigate to applicants page
- [ ] Approve stage advancement
- [ ] Verify alert disappears or count decreases

### For Admins
- [ ] Login as admin
- [ ] Verify can see stage advancement alerts from all branches
- [ ] Confirm count includes all pending approvals system-wide

### Data Isolation Test
- [ ] Login as Branch Manager A
- [ ] Note pending count for their branch
- [ ] Login as Branch Manager B (different branch)
- [ ] Confirm they don't see Branch A's pending approvals
- [ ] Verify each manager only sees their branch data

## Firestore Rules Required

Ensure Firestore security rules allow:
```javascript
match /stage_history/{documentId} {
  // Branch managers can read their branch's stage history
  allow read: if request.auth != null && 
    (request.auth.token.role == 'admin' || 
     request.auth.token.role == 'president' ||
     (request.auth.token.role == 'branch_manager' && 
      resource.data.branchId == request.auth.token.branchId));
  
  // Allow creation and updates as per your business logic
  allow write: if request.auth != null;
}
```

## Firestore Index Required

Create composite index:
```
Collection: stage_history
Fields:
  - branchId (Ascending)
  - status (Ascending)  
  - createdAt (Descending)
```

Alternative index (for queries without branchId):
```
Collection: stage_history
Fields:
  - status (Ascending)
  - createdAt (Descending)
```

## Benefits

### For Branch Managers
1. **Instant Visibility** - Know immediately when approvals are needed
2. **Prevents Delays** - No applicants stuck waiting for advancement
3. **Better Workflow** - Proactive management of recruitment pipeline
4. **Data Isolation** - Only see relevant alerts for their branch

### For Applicants
1. **Faster Processing** - Quicker stage advancements
2. **Reduced Wait Times** - Branch managers notified immediately
3. **Better Experience** - Smoother recruitment journey

### For the System
1. **Improved Efficiency** - Real-time notifications reduce bottlenecks
2. **Better Metrics** - Track approval times and delays
3. **Proactive Management** - Issues identified before they escalate

## Future Enhancements

Potential improvements:
1. Add filters to view alerts by stage type (Medical, Processing, etc.)
2. Show applicant names in alert description
3. Add quick approve/reject actions directly from alert
4. Email notifications for pending approvals
5. SLA tracking for stage advancement times
6. Analytics on average approval times per branch

## Summary

The Priority Alerts widget now includes real-time notifications for pending stage advancements, ensuring branch managers never miss an applicant waiting for approval. The implementation:

- ✅ Uses real-time Firestore listeners
- ✅ Maintains branch data isolation
- ✅ Follows existing alert patterns
- ✅ Supports both branch managers and admins
- ✅ Includes proper priority levels
- ✅ Uses intuitive iconography
- ✅ Optimized for performance
- ✅ Mobile responsive
- ✅ No linting errors

This feature significantly improves the workflow for managing applicant progression through the recruitment pipeline!

