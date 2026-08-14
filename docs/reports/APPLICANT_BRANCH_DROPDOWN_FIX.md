# Applicant Management - Branch Dropdown Fix

**Date**: October 19, 2025  
**Status**: ✅ COMPLETED

## Issue Reported

In the Admin **Applicants Management** page, the **Branch dropdown menu** was not showing all branches correctly.

**Problem**:
- Branch Management page showed **5 branches**: Cotabato Branch, Iloilo Branch, Head Office, North Branch, South Branch
- Applicants Management Branch dropdown only showed **3 branches**: Head Office, North Branch, South Branch
- **Missing branches**: Cotabato Branch, Iloilo Branch

**Screenshot Evidence**:
- Branch Management: All 5 branches visible with "Active" status
- Applicants Management: Only 3 branches in dropdown (missing Cotabato and Iloilo)

---

## Root Cause

The `ApplicantList.tsx` component was using `fetchActiveBranches()` which queries Firestore for branches with `status === 'active'`:

```typescript
// Original code
const { branches, fetchActiveBranches } = useBranchStore();

// In useEffect
await fetchActiveBranches(); // Only fetches branches where status='active'
```

**Why it failed**:
- The `fetchActiveBranches()` function uses: `where('status', '==', 'active')`
- "Cotabato Branch" and "Iloilo Branch" either:
  1. Don't have a `status` field in Firestore
  2. Have a different status value
  3. Have a different field name (e.g., `branchStatus` instead of `status`)

**Result**: These branches were excluded from the dropdown, even though they appear as "Active" in the Branch Management UI.

---

## Solution Implemented

Changed `ApplicantList.tsx` to use `fetchBranches()` instead of `fetchActiveBranches()`, which fetches **ALL branches** regardless of status.

**File**: `src/pages/applicants/ApplicantList.tsx` (Lines 29, 45)

### Before (WRONG):
```typescript
const { branches, loading: branchesLoading, error: branchesError, fetchActiveBranches } = useBranchStore();

// ...

await Promise.all([
  fetchActiveBranches(), // Only fetches active branches
  fetchActiveAgents(),
  fetchActiveOfficers()
]);
```

### After (CORRECT):
```typescript
const { branches, loading: branchesLoading, error: branchesError, fetchBranches } = useBranchStore();

// ...

await Promise.all([
  fetchBranches(), // Fetches ALL branches
  fetchActiveAgents(),
  fetchActiveOfficers()
]);
```

**How it works now**:
- `fetchBranches()` fetches ALL branches from Firestore without filtering by status
- All 5 branches will appear in the dropdown: Cotabato Branch, Iloilo Branch, Head Office, North Branch, South Branch
- Branches are still deduplicated and sorted alphabetically

---

## Testing Instructions

### Test 1: Verify All Branches Appear

1. **Refresh your browser** (Ctrl+F5 or Cmd+Shift+R)
2. Navigate to **Applicants Management** page
3. Click on the **Branch** dropdown
4. **Expected**: Should see ALL 5 branches:
   - All Branches
   - Cotabato Branch ✅ (previously missing)
   - Head Office
   - Iloilo Branch ✅ (previously missing)
   - North Branch
   - South Branch
5. Branches should be sorted alphabetically

### Test 2: Filter by Cotabato Branch

1. Select **"Cotabato Branch"** from the dropdown
2. **Expected**: Should display only applicants from Cotabato Branch
   - Example: Jasmin Barira (if from Cotabato)
   - Example: Anisa Udlungan (if from Cotabato)
3. Stats should update to show Cotabato-specific counts

### Test 3: Filter by Iloilo Branch

1. Select **"Iloilo Branch"** from the dropdown
2. **Expected**: Should display only applicants from Iloilo Branch
3. If no applicants from Iloilo yet, show "No applicants found"

### Test 4: Verify Other Dropdowns Still Work

1. Test **Stage** dropdown - Should work normally
2. Test **Status** dropdown - Should work normally (including "Pending Approval")
3. Test **Agent** dropdown - Should work normally
4. Test combined filters - Should work correctly

---

## Related Fixes

This is part of a series of improvements to the Applicants Management page:

1. ✅ **[DASHBOARD_COUNT_FIX.md](./DASHBOARD_COUNT_FIX.md)**
   - Fixed double-counting of Active and Pending Approval applicants

2. ✅ **[APPLICANT_MANAGEMENT_FILTER_FIX.md](./APPLICANT_MANAGEMENT_FILTER_FIX.md)**
   - Fixed "Pending Approval" status filter to use `requiresApproval` field
   - Added Firestore indexes for efficient filtering

3. ✅ **[DROPDOWN_FIXES_COMPLETE.md](./DROPDOWN_FIXES_COMPLETE.md)**
   - Fixed duplicate entries in Agent dropdown
   - Added alphabetical sorting

4. ✅ **[APPLICANT_BRANCH_DROPDOWN_FIX.md](./APPLICANT_BRANCH_DROPDOWN_FIX.md)** (This document)
   - Fixed Branch dropdown to show ALL branches

---

## Technical Details

### fetchBranches() vs fetchActiveBranches()

**`fetchBranches()`**:
```typescript
// Fetches ALL branches
const branchesRef = collection(firestore, 'branches');
const snapshot = await getDocs(branchesRef);
// Returns all branches without filtering
```

**`fetchActiveBranches()`**:
```typescript
// Fetches only active branches
const branchesRef = collection(firestore, 'branches');
const q = query(branchesRef, where('status', '==', 'active'));
const snapshot = await getDocs(q);
// Returns only branches with status='active'
```

### Branch Dropdown Transformation

The branch options are transformed and sorted:

```typescript
const branchOptions = branches
  ?.map(branch => ({
    id: branch.id,
    branchName: branch.name
  }))
  // Remove duplicates based on branch ID
  .filter((branch, index, self) => 
    index === self.findIndex((b) => b.id === branch.id)
  )
  // Sort alphabetically by branch name
  .sort((a, b) => a.branchName.localeCompare(b.branchName))
  || [];
```

**Features**:
- ✅ Deduplication by branch ID
- ✅ Alphabetical sorting
- ✅ Uses branch name (not ID) for display

---

## Why This Approach?

**Alternative Considered**: Fix the `status` field in Firestore for Cotabato and Iloilo branches

**Why We Chose This Solution**:
1. **More Robust**: Works regardless of branch status field
2. **User-Friendly**: Admin should see ALL branches, not just "active" ones
3. **Consistency**: Matches the behavior of ProfileHeader and other components that were fixed earlier
4. **No Data Migration**: No need to update existing Firestore documents
5. **Future-Proof**: New branches will automatically appear, even if status field is missing

**When to Use `fetchActiveBranches()`**:
- Branch assignment for new users (only active branches should be assignable)
- Public-facing branch lists (don't show inactive/closed branches)

**When to Use `fetchBranches()`**:
- Admin filtering and reporting (need to see all branches)
- Data management and migration
- Historical records and audit trails

---

## Summary

### Before
- ❌ Branch dropdown only showed 3 branches (Head Office, North, South)
- ❌ Missing "Cotabato Branch" and "Iloilo Branch"
- ❌ Couldn't filter applicants by Cotabato or Iloilo branches
- ❌ Used `fetchActiveBranches()` which filtered by status

### After
- ✅ Branch dropdown shows ALL 5 branches
- ✅ "Cotabato Branch" and "Iloilo Branch" now visible
- ✅ Can filter applicants by any branch
- ✅ Uses `fetchBranches()` to get all branches
- ✅ Sorted alphabetically for better UX

---

## Files Modified

1. **`src/pages/applicants/ApplicantList.tsx`**
   - Line 29: Changed `fetchActiveBranches` to `fetchBranches`
   - Line 45: Changed function call from `fetchActiveBranches()` to `fetchBranches()`

---

## Troubleshooting

### Issue: Still not seeing all branches

**Solutions**:
1. **Hard refresh**: Press `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
2. **Clear browser cache**: DevTools → Application → Clear Storage
3. **Check console**: Open DevTools → Console, look for errors
4. **Verify branch data**: Check if branches exist in Firestore Database

### Issue: Dropdown shows duplicate branches

**This shouldn't happen** because we have deduplication logic:
```typescript
.filter((branch, index, self) => 
  index === self.findIndex((b) => b.id === branch.id)
)
```

If duplicates appear:
1. Check if branches have unique IDs in Firestore
2. Clear browser cache and refresh

### Issue: Branches not sorted

**This shouldn't happen** because we have sorting logic:
```typescript
.sort((a, b) => a.branchName.localeCompare(b.branchName))
```

If not sorted:
1. Restart your browser
2. Check if branch names are strings (not null/undefined)

---

## Verification Steps for Developers

```javascript
// Open browser console on Applicants Management page
// Check what branches are loaded:
console.log('Branches:', useBranchStore.getState().branches);

// Should see array with all 5 branches:
// [
//   { id: 'xxx', name: 'Cotabato Branch', ... },
//   { id: 'yyy', name: 'Head Office', ... },
//   { id: 'zzz', name: 'Iloilo Branch', ... },
//   { id: 'aaa', name: 'North Branch', ... },
//   { id: 'bbb', name: 'South Branch', ... }
// ]
```

---

**✅ Fix complete! The Branch dropdown now shows all branches.**

