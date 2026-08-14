# Commission Management Dropdown Fix

## Issue
The dropdown filters (Commission Type, Status, Start Date, End Date) in the Commission Management page were not working. Users could select different options, but the commission list was not being updated based on the selected filters.

## Root Cause
The `CommissionsPage` component had a missing reactivity issue:
- The dropdown filters were correctly calling `handleFilterChange()` which updated the `filter` state via `setFilter()`
- However, there was no `useEffect` hook that watched the `filter` state changes and triggered a re-fetch of commissions
- The `fetchCommissions()` function was only called once on component mount, never again when filters changed

## Solution
Added a `useEffect` hook that watches both `filter` and `sort` state changes and automatically re-fetches commissions:

```typescript
// Fetch commissions on mount and when filters or sort changes
useEffect(() => {
  fetchCommissions();
}, [filter, sort, fetchCommissions]);
```

This ensures that:
1. Commissions are fetched on initial page load
2. Commissions are re-fetched whenever any filter changes (Commission Type, Status, Date Range)
3. Commissions are re-fetched whenever sorting changes
4. The commission store's `fetchCommissions()` function properly applies the filters to the Firestore query

## Files Modified
- `src/pages/commissions/CommissionsPage.tsx` - Added useEffect hook to watch filter and sort changes

## Testing
To verify the fix works:
1. Go to the Commission Management page (localhost:3000/commissions)
2. Try changing the "Commission Type" dropdown - the list should update
3. Try changing the "Status" dropdown - the list should filter accordingly
4. Try setting date ranges - the list should show only commissions within that range
5. Try clicking on column headers to sort - the list should re-order

All dropdown filters and sorting should now work as expected!

