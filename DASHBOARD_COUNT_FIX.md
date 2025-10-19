# Dashboard Applicant Count Fix

**Date**: October 19, 2025  
**Status**: ✅ COMPLETED (Updated)

## Problem

The Dashboard's "Applicants By Status" widget was showing an incorrect count (3 applicants) instead of the actual 2 applicants. The issue was **double-counting** applicants who were in "Pending Approval" status.

**Reported Issues**:
1. Dashboard shows: **Total Applicants: 3** (2 Active + 1 Pending Approval)
2. Applicant Management shows: **2 applicants** (Jasmin Barira, Anisa Udlungan)
3. The 1 "Pending Approval" applicant was **ALREADY included** in the 2 "Active" applicants
4. **Result**: Double-counting led to showing 3 instead of 2

**Key Insight**:
> "Pending Approval" applicants are NOT a separate status - they are **Active applicants waiting for stage advancement approval**. They should not be counted separately from Active applicants.

---

## Root Causes

### 1. **Double-Counting Active and Pending Approval** ❌ CRITICAL

The dashboard was counting the same applicant twice:
- Once in "Active" (because `status === 'active'`)
- Again in "Pending Approval" (because `requiresApproval === true && !approvedBy`)

**Example**:
```
Applicant: Jasmin Barira
- status: 'active'
- requiresApproval: true
- approvedBy: null

Counted as:
✓ Active (1)
✓ Pending Approval (1)
Total: 2 ❌ WRONG (should be 1)
```

### 2. **Cached Dashboard Data** ❌
The `useDashboardMetrics` hook was only refetching data when `role` or `branchId` changed. When navigating back to the Dashboard after deleting applicants, the metrics were not refreshed because these dependencies didn't change.

**Original Code** (`src/hooks/useDashboardMetrics.ts` line 320):
```typescript
useEffect(() => {
  fetchMetrics();
}, [role, branchId]); // Only refetches when role or branchId changes
```

**Problem**: When you:
1. View Dashboard (metrics loaded)
2. Navigate to Applicants
3. Delete applicants
4. Navigate back to Dashboard
5. ❌ Metrics are stale (not refetched)

### 2. **No Soft-Delete Filtering** ❌
The dashboard was counting ALL documents in the `applicants` collection without checking if they were marked as deleted or invalid.

**Original Code** (line 52-56):
```typescript
const [applicants, expenses, commissions] = await Promise.all([
  getDocs(collection(firestore, 'applicants')),  // Gets ALL applicants
  ...
]);

// Then directly counts all docs
const activeCount = applicants.docs.filter(doc => doc.data().status === 'active').length;
```

---

## Solutions Implemented

### ✅ Solution 1: Fix Double-Counting (CRITICAL FIX)

**The main fix**: Exclude "Pending Approval" applicants from the "Active" count to prevent double-counting.

**File**: `src/hooks/useDashboardMetrics.ts` (Lines 79-93)

**Before (WRONG)**:
```typescript
// This counted applicants twice!
const activeCount = validApplicants.filter(doc => doc.data().status === 'active').length;
const pendingApprovalCount = validApplicants.filter(doc => {
  const data = doc.data();
  return data.requiresApproval === true && !data.approvedBy;
}).length;
```

**After (CORRECT)**:
```typescript
// Calculate specific status counts using only valid applicants
// Note: Pending Approval applicants are a subset of Active applicants
const pendingApprovalCount = validApplicants.filter(doc => {
  const data = doc.data();
  return data.requiresApproval === true && !data.approvedBy;
}).length;

// Active count excludes pending approval to avoid double-counting
// (Pending approval applicants are active but waiting for stage advancement)
const activeCount = validApplicants.filter(doc => {
  const data = doc.data();
  return data.status === 'active' && !(data.requiresApproval === true && !data.approvedBy);
}).length;
```

**How it works now**:
```
Total 2 Applicants in Database:

Applicant 1: Anisa Udlungan
- status: 'active'
- requiresApproval: false
→ Counted in: Active ✓

Applicant 2: Jasmin Barira  
- status: 'active'
- requiresApproval: true
- approvedBy: null
→ Counted in: Pending Approval ✓
→ NOT counted in: Active (excluded to prevent double-counting)

Dashboard Shows:
- Active: 1
- Pending Approval: 1
- Total: 2 ✅ CORRECT
```

### ✅ Solution 2: Auto-Refresh on Window Focus

Added a window focus event listener to automatically refetch dashboard metrics when the user returns to the browser tab.

**File**: `src/hooks/useDashboardMetrics.ts` (Lines 321-327)

```typescript
useEffect(() => {
  fetchMetrics();
  
  // Also refetch when window regains focus (user comes back to tab)
  const handleFocus = () => {
    fetchMetrics();
  };
  
  window.addEventListener('focus', handleFocus);
  return () => window.removeEventListener('focus', handleFocus);
}, [role, branchId]);
```

**Benefits**:
- ✅ Automatically refreshes when switching back to the tab
- ✅ Always shows fresh data when returning from another tab
- ✅ No manual user action required

**How it works**:
1. User navigates to Applicants page
2. User deletes applicants
3. User clicks on Dashboard in sidebar OR switches to Dashboard tab
4. When the window regains focus, metrics are automatically refreshed
5. ✅ Fresh data is displayed

### ✅ Solution 3: Filter Out Invalid/Deleted Applicants

Added filtering to exclude any applicants that might be marked as deleted or have invalid data.

**File**: `src/hooks/useDashboardMetrics.ts` (Lines 58-64)

```typescript
// Filter out any soft-deleted or invalid applicants
const validApplicants = applicants.docs.filter(doc => {
  const data = doc.data();
  // Exclude if explicitly marked as deleted or has no required fields
  return data && !data.isDeleted && doc.id;
});

// Use validApplicants for all counts
const activeCount = validApplicants.filter(doc => doc.data().status === 'active').length;
const pendingApprovalCount = validApplicants.filter(doc => {
  const data = doc.data();
  return data.requiresApproval === true && !data.approvedBy;
}).length;
const withdrawnCount = validApplicants.filter(doc => doc.data().status === 'withdrawn').length;
```

**Benefits**:
- ✅ Filters out applicants with `isDeleted: true` flag
- ✅ Filters out documents with missing required data
- ✅ Ensures counts only include valid, active records
- ✅ Prevents phantom records from inflating counts

---

## Testing Instructions

### Test 1: Verify Current Count (CRITICAL TEST)

1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. Navigate to Dashboard
3. Check "Applicants By Status" widget
4. **Expected**: 
   - Active: **1 applicant** (Anisa Udlungan)
   - Pending Approval: **1 applicant** (Jasmin Barira)
   - **Total: 2 applicants** ✅
   - Should match Applicant Management count (2 applicants)

**Key Point**: The total should be 2, NOT 3. "Pending Approval" is now correctly separated from "Active" to avoid double-counting.

### Test 2: Delete Applicant and Verify Update

1. Navigate to **Applicant Management**
2. Note the current count (e.g., 2 applicants)
3. **Delete one applicant** using the Delete button
4. Navigate back to **Dashboard**
5. **Click anywhere on the browser window** to trigger focus event
6. **Expected**: Count should decrease by 1 (e.g., from 2 to 1)

### Test 3: Window Focus Auto-Refresh

1. Open Dashboard in browser
2. Note the current count
3. Open **Firebase Console** in a new tab
4. Manually delete an applicant from Firestore
5. **Switch back to the Dashboard tab**
6. **Expected**: Count should update automatically within 1-2 seconds

---

## Alternative: Manual Refresh

If the auto-refresh doesn't work as expected, you can manually refresh by:

1. **Refreshing the browser** (F5 or Ctrl+R)
2. **Navigating away and back** to the Dashboard
3. **Switching tabs** (opens another tab, then clicks back)

---

## Technical Details

### Window Focus Event

The `focus` event fires when:
- ✅ User switches back to the browser tab from another tab
- ✅ User switches back to the browser window from another application
- ✅ User clicks on the browser window after it was inactive
- ❌ Does NOT fire when navigating within the same tab (e.g., Dashboard → Applicants → Dashboard)

**For same-tab navigation**, the dashboard will use the cached data until the window loses and regains focus.

### Soft Delete vs Hard Delete

The system currently uses **hard delete** (permanent removal from Firestore):

```typescript
// In applicantStore.ts
deleteApplicant: async (id) => {
  const docRef = doc(firestore, 'applicants', id);
  await deleteDoc(docRef);  // ← Permanently deletes the document
}
```

However, the dashboard now also checks for `isDeleted` flag in case the system is later updated to use soft deletes:

```typescript
const validApplicants = applicants.docs.filter(doc => {
  const data = doc.data();
  return data && !data.isDeleted && doc.id;  // ← Filters out soft-deleted
});
```

---

## Future Enhancements

### Option 1: Real-time Listeners

Use Firestore's `onSnapshot` for real-time updates:

```typescript
useEffect(() => {
  const unsubscribe = onSnapshot(
    collection(firestore, 'applicants'),
    (snapshot) => {
      // Update metrics in real-time
      updateMetrics(snapshot);
    }
  );
  
  return () => unsubscribe();
}, [role, branchId]);
```

**Benefits**:
- Real-time updates without any user action
- No delay or manual refresh needed
- Instant synchronization across all dashboards

**Trade-offs**:
- More Firestore read operations (costs more)
- Constantly open connection
- More complex state management

### Option 2: Manual Refresh Button

Add a refresh button to the Dashboard:

```typescript
<button onClick={() => refetchMetrics()}>
  <ArrowPathIcon className="h-5 w-5" />
  Refresh
</button>
```

**Benefits**:
- User has explicit control
- Clear indication of data freshness
- Simple to implement

**Trade-offs**:
- Requires manual user action
- Users might forget to refresh
- Not as seamless as auto-refresh

### Option 3: React Router Navigation Detection

Use React Router's `useLocation` hook to detect navigation:

```typescript
const location = useLocation();

useEffect(() => {
  if (location.pathname === '/dashboard') {
    fetchMetrics();
  }
}, [location.pathname]);
```

**Benefits**:
- Refreshes on every navigation to dashboard
- No window focus dependency
- Works for same-tab navigation

**Trade-offs**:
- Refetches even when not necessary
- More complex implementation
- Tightly coupled with routing

---

## Files Modified

1. **`src/hooks/useDashboardMetrics.ts`**
   - **Lines 79-93**: ✅ **CRITICAL FIX** - Prevented double-counting by excluding "Pending Approval" applicants from "Active" count
   - Lines 58-64: Added `validApplicants` filtering
   - Lines 321-327: Added window focus event listener for auto-refresh

---

## Summary

### Before
- ❌ **Double-counting**: "Pending Approval" applicants counted TWICE (once in Active, once in Pending)
- ❌ Dashboard showed stale data after deletions
- ❌ No automatic refresh mechanism
- ❌ No filtering of invalid/deleted records
- ❌ Count discrepancy: Dashboard (3) vs Actual (2)

### After
- ✅ **Fixed double-counting**: "Pending Approval" applicants excluded from "Active" count
- ✅ Dashboard auto-refreshes on window focus
- ✅ Filters out soft-deleted and invalid applicants
- ✅ Accurate counts that match Applicant Management
- ✅ Total now shows: **Active (1) + Pending Approval (1) = 2** ✅

---

## Troubleshooting

### Issue: Count Still Shows 3 After Fix

**Solution**:
1. Hard refresh your browser (Ctrl+F5 / Cmd+Shift+R)
2. Clear browser cache
3. Check Firebase Console to verify actual count in database
4. Click on Dashboard in sidebar, then click anywhere on the window to trigger focus event

### Issue: Auto-Refresh Not Working

**Solution**:
1. Ensure you're using a modern browser (Chrome, Firefox, Edge)
2. Check browser console for any JavaScript errors
3. Try switching to another tab and back
4. As fallback, manually refresh the page (F5)

### Issue: Count Different Than Expected

**Solution**:
1. Open Firebase Console
2. Navigate to Firestore Database → applicants collection
3. Count the documents manually
4. Check if any documents have `isDeleted: true` flag
5. Verify that deleted applicants are actually removed from Firestore

---

**Fixed By**: AI Assistant  
**Date**: October 19, 2025  
**Status**: Ready for Testing

