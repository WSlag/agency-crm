# Branch Manager Count Display Fix

## Issue
The Branch Management page was displaying "0" in the Managers column for all branches, even when Branch Managers were successfully assigned to those branches.

## Root Cause
The `BranchList.tsx` component was trying to access `branch?.managers?.length` to display the count. However:
1. The `managers` field in the Branch document is not automatically populated with current manager data
2. The system stores Branch Manager assignments in the `users` collection with a `branchId` field, not in the branch document itself
3. The Branch Detail page correctly counted managers by querying the `users` collection, but the list page did not

## Solution
Modified `src/pages/admin/branches/BranchList.tsx` to:

1. **Added Manager Count State**:
   ```typescript
   const [managerCounts, setManagerCounts] = useState<Record<string, number>>({});
   ```

2. **Added useEffect to Fetch Manager Counts**:
   - Queries the `users` collection for all users with `role === 'branch_manager'`
   - Groups and counts managers by their `branchId`
   - Stores the counts in state indexed by branch ID
   ```typescript
   useEffect(() => {
     const fetchManagerCounts = async () => {
       if (!branches || branches.length === 0) return;

       try {
         const usersRef = collection(firestore, 'users');
         const managersQuery = query(
           usersRef,
           where('role', '==', 'branch_manager')
         );
         
         const managersSnapshot = await getDocs(managersQuery);
         
         const counts: Record<string, number> = {};
         branches.forEach(branch => {
           counts[branch.id] = 0;
         });

         managersSnapshot.docs.forEach(doc => {
           const branchId = doc.data().branchId;
           if (branchId && counts[branchId] !== undefined) {
             counts[branchId]++;
           }
         });

         setManagerCounts(counts);
       } catch (err) {
         console.error('Error fetching manager counts:', err);
       }
     };

     fetchManagerCounts();
   }, [branches]);
   ```

3. **Updated Display Logic**:
   Changed from:
   ```typescript
   {branch?.managers?.length || 0}
   ```
   
   To:
   ```typescript
   {managerCounts[branch?.id] || 0}
   ```

## Benefits
- **Accurate Counts**: Manager counts now reflect the actual number of assigned Branch Managers
- **Efficient**: Single query fetches all branch managers at once, rather than querying per branch
- **Consistent**: Uses the same data source (users collection) as the Branch Detail page
- **Real-time**: Updates when branches change or component remounts

## Testing
1. Navigate to Branch Management page (`/branches`)
2. Verify the Managers column shows the correct count for each branch
3. Assign a new Branch Manager to a branch
4. Refresh the Branch Management page
5. Verify the count increments correctly

## Files Modified
- `src/pages/admin/branches/BranchList.tsx`

## Related Components
- `src/pages/admin/branches/BranchDetail.tsx` - Uses similar logic to count managers
- `src/stores/branchStore.ts` - Could be enhanced in the future to include manager counts

