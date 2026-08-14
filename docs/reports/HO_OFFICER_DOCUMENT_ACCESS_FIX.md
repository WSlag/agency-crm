# HO Recruitment Officer - Document Access Fix

## Issue Reported
**User:** HO Recruitment Officer  
**Problem:** Could not view documents of applicants on Pending Stage Approval - received "Access Denied" page  
**URL:** `localhost:3000/applicants/cLfD0rLoGt2BgFWnEYTH?tab=documents`

## Root Cause
The "View Documents" button in the Pending Approvals component was using a hardcoded route:
```typescript
/applicants/${approval.applicantId}?tab=documents
```

This route is restricted to only `['admin', 'president', 'branch_manager']` roles. HO Recruitment Officers are NOT included in this allowed roles list.

## Route Structure
HO Recruitment Officers have access to:
- ✅ `/my-applicants/:id` - For assigned applicants
- ✅ `/ho-applicants/all/:id` - For unassigned applicants (shared pool)
- ❌ `/applicants/:id` - Restricted to Admin/President/Branch Manager only

## Solution Implemented

### File: `src/components/applicants/PendingApprovals.tsx`

**Changed Line 380:**

**Before:**
```typescript
<Link
  to={`/applicants/${approval.applicantId}?tab=documents`}
  className="..."
>
```

**After:**
```typescript
<Link
  to={`${customClaims?.role === 'ho_recruitment_officer' ? '/my-applicants' : '/applicants'}/${approval.applicantId}?tab=documents`}
  className="..."
>
```

## How It Works
1. **For HO Recruitment Officers:** Links to `/my-applicants/:id?tab=documents`
2. **For Admin/President/Branch Manager:** Links to `/applicants/:id?tab=documents`

This ensures each role uses the correct route they have access to.

## Testing Instructions

### Test Case 1: HO Officer Views Pending Approval Documents
1. **Log in as:** HO Recruitment Officer (e.g., recruiter@agency.com)
2. Navigate to **Dashboard**
3. Find the **"Pending Stage Approvals"** section
4. Click **"View Documents"** button
5. ✅ Should navigate to `/my-applicants/:id?tab=documents`
6. ✅ Should show the applicant's documents tab
7. ✅ Should NOT show "Access Denied"

### Test Case 2: Admin Views Pending Approval Documents
1. **Log in as:** Admin
2. Navigate to **Dashboard**
3. Find the **"Pending Stage Approvals"** section
4. Click **"View Documents"** button
5. ✅ Should navigate to `/applicants/:id?tab=documents`
6. ✅ Should show the applicant's documents tab

### Test Case 3: HO Officer Approves Stage After Viewing Documents
1. **Log in as:** HO Recruitment Officer
2. View documents via the "View Documents" button
3. Review the uploaded documents
4. Click **Back** to return to dashboard
5. Click **"Approve"** or **"Reject"** button
6. ✅ Should successfully approve/reject the stage

## Impact
- ✅ HO Recruitment Officers can now view documents for pending stage approvals
- ✅ No changes to security model or permissions
- ✅ Each role still uses their designated routes
- ✅ No impact on Admin/President/Branch Manager functionality

## Related Files
- `src/components/applicants/PendingApprovals.tsx` - Fixed hardcoded link
- `src/App.tsx` - Route definitions (no changes needed)
- `src/components/applicants/profile/ApplicantProfile.tsx` - Handles document tab display

## Status
✅ **FIXED** - HO Recruitment Officers can now view applicant documents from pending approvals

---
**Date:** October 19, 2025  
**Fixed By:** AI Assistant

