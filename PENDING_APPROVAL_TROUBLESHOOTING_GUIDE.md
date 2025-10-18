# Pending Approval Troubleshooting Guide

**Date:** October 19, 2025  
**Issue:** Applicant shows "Waiting for approval" but HO Officer doesn't see pending approval  
**Status:** 🔍 **DIAGNOSTIC GUIDE**

---

## 🎯 **Understanding the Problem**

### Two Different Things:

1. **UI Message:** "Waiting for approval to advance to next stage"
   - This is just a visual indicator on the applicant profile
   - Shows when `applicant.currentStatus = 'pending_approval'`
   - Does NOT mean there's an actual pending request

2. **Actual Pending Approval:** Request in database
   - Requires a `stage_history` record with `status: 'pending'`
   - Created when Branch Manager clicks "Advance to [Next Stage]" button
   - This is what appears in HO Officer dashboard

---

## 🔍 **Diagnostic Steps**

### Step 1: Check Applicant Current Status

**Where:** Applicant Profile Page

**Look for:**
- Current Stage: **Medical** ✅
- Status message: "Waiting for approval to advance to next stage"
- **"Advance to Transfer" button** - Is it visible or hidden?

**What it means:**
- ✅ **Button VISIBLE** = No pending request yet, Branch Manager can request advancement
- ❌ **Button HIDDEN** = Request already submitted, should appear in approver dashboard

---

### Step 2: Check Browser Console Logs

**How:** Open browser DevTools (F12) → Console tab

**Look for logs:**
```
[StageService] getPendingApprovals: { userId: "...", userRole: "ho_recruitment_officer", totalPendingInDB: 0 }
```

**What the numbers mean:**
- `totalPendingInDB: 0` = No pending approvals in entire database
- `totalPendingInDB: 1+` = Pending approvals exist, check if they're filtered correctly

**Additional logs to check:**
```
[StageService] Checking pending approval: { id: "...", applicantId: "...", toStage: "transfer", status: "pending" }
[StageService] Can user approve? { historyId: "...", toStage: "transfer", userRole: "ho_recruitment_officer", canApprove: true/false }
[StageService] Final approvals for user: { count: 0, approvals: [] }
```

**What `canApprove: false` means:**
- User doesn't have permission to approve this stage
- Check firestore rules and stageConfig approvers

---

### Step 3: Check if Request Was Actually Created

**Option A: Check Firestore Database**

1. Go to Firebase Console
2. Navigate to Firestore Database
3. Open `stage_history` collection
4. Look for records where:
   - `applicantId` matches the applicant
   - `status` = `"pending"`
   - `toStage` = `"transfer"`

**Option B: Check Console Network Tab**

1. Open DevTools → Network tab
2. Filter by "firestore"
3. Refresh the HO Officer dashboard
4. Look for query to `stage_history` collection
5. Check response - are there any documents returned?

---

## 🐛 **Common Issues & Solutions**

### Issue 1: "Advance to Transfer" Button is Visible

**Problem:** Branch Manager hasn't clicked the button yet

**Solution:**
1. Log in as **Branch Manager** (Cotabato Branch)
2. Go to applicant "Jasmin Atamol" profile
3. You should see green button: **"Advance to Transfer"**
4. Click the button
5. Review document requirements modal
6. Click **"Submit for Approval"**
7. Now log back in as HO Recruitment Officer
8. The approval should appear!

---

### Issue 2: Button is Hidden but No Approval Showing

**Problem:** Applicant status is `pending_approval` but no `stage_history` record

**Possible Causes:**
1. Request creation failed silently
2. Database permission issue
3. Status was set manually without creating request

**Solution:**
```typescript
// Need to create the stage_history record manually or reset applicant status

// Option 1: Reset applicant status (as Branch Manager, click button again)
// Update applicant in Firestore:
{
  currentStatus: 'active',  // Reset from pending_approval
  requiresApproval: false
}

// Then Branch Manager can click "Advance to Transfer" button again
```

---

### Issue 3: Request Exists but Not Showing in Dashboard

**Problem:** Request exists in database but filtered out

**Check Console Logs:**
```
[StageService] Can user approve? { canApprove: false }
```

**Possible Causes:**
1. Firestore security rules blocking read
2. Application logic filtering out the request
3. User role doesn't match stage approvers

**Solution:**
Already fixed in our recent deployment! ✅
- Updated `firestore.rules` line 463
- Updated `stageConfig.ts` Transfer approvers
- Updated `stageService.ts` canApproveStage logic

**Verify Fix:**
```typescript
// In firestore.rules line 463:
(isHORecruitmentOfficer() && resource.data.toStage in ['interview', 'medical', 'transfer'])

// In stageConfig.ts line 86:
approvers: ['admin', 'president', 'ho_recruitment_officer']

// In stageService.ts lines 76-82:
if (user.role === 'ho_recruitment_officer') {
  return (
    stage === ApplicantStage.INTERVIEW ||
    stage === ApplicantStage.MEDICAL ||
    stage === ApplicantStage.TRANSFER
  );
}
```

---

## ✅ **Step-by-Step Fix Procedure**

### Scenario: HO Officer Can't See Pending Approval

**Step 1: Verify Applicant Status**

As HO Recruitment Officer:
1. Go to Applicants page
2. Find "Jasmin Atamol"
3. Click to open profile
4. Check pipeline progress section

**Look for:**
- Current stage: Medical
- Message: "Waiting for approval to advance to next stage"
- Button: "Advance to Transfer" - **IS IT VISIBLE?**

---

**Step 2A: If Button IS Visible** (Most Likely Case)

**This means:** No pending request exists yet

**Fix:**
1. Switch to **Branch Manager** account (Cotabato Branch)
2. Navigate to applicant "Jasmin Atamol"
3. Verify documents are verified (Medical Certificate should be green ✓)
4. Click **"Advance to Transfer"** button
5. Review modal showing:
   - Current Stage: Medical
   - Next Stage: Transfer to HO
   - Document Requirements: All verified ✓
   - Commission trigger: Yes, 50% commission will be triggered
6. Add optional notes if needed
7. Click **"Submit for Approval"**
8. You should see success message
9. Applicant status changes to "Waiting for approval"
10. "Advance to Transfer" button disappears

**Verify:**
1. Switch back to **HO Recruitment Officer** account
2. Go to Dashboard
3. Refresh page (Ctrl + Shift + R)
4. You should now see: **"Pending Stage Approvals (1)"**
5. Card showing "Jasmin Atamol | Medical → Transfer"
6. Click **"Approve"** to advance the applicant

---

**Step 2B: If Button IS NOT Visible**

**This means:** Request was already submitted

**Verify in Browser Console:**
1. Press F12 to open DevTools
2. Go to Console tab
3. Refresh the HO Officer Dashboard
4. Look for log: `[StageService] getPendingApprovals`
5. Check `totalPendingInDB` value

**If totalPendingInDB = 0:**
- No requests in database at all
- Status was set manually without creating request
- **Fix:** Reset applicant status and resubmit request

**Reset Steps:**
1. Go to Firebase Console
2. Open Firestore Database
3. Find applicant "csCXHNPxb98e4YgoPiyn"
4. Edit document:
   ```json
   {
     "currentStatus": "active",
     "requiresApproval": false
   }
   ```
5. Save changes
6. Refresh applicant profile in CRM
7. "Advance to Transfer" button should now appear
8. Follow Step 2A to submit request properly

**If totalPendingInDB > 0:**
- Request exists but being filtered out
- Check console for: `[StageService] Can user approve?`
- If `canApprove: false` - permissions issue (should be fixed)
- **Fix:** Already deployed! Refresh browser (Ctrl + Shift + R)

---

## 🔧 **Quick Diagnostic Checklist**

Run through this checklist to identify the issue:

- [ ] **Firestore Rules Deployed?** (Should be YES ✅ from our fix)
- [ ] **stageConfig.ts Updated?** (Transfer approvers include HO Officer ✅)
- [ ] **stageService.ts Updated?** (canApproveStage includes Transfer ✅)
- [ ] **Branch Manager Clicked Button?** (This is the most likely issue ❓)
- [ ] **stage_history Record Exists?** (Check Firebase Console)
- [ ] **Browser Cache Cleared?** (Press Ctrl + Shift + R)
- [ ] **Console Shows Errors?** (Check F12 Console tab)

---

## 📋 **Expected Console Output (Working System)**

When everything is working correctly, you should see:

```javascript
// When HO Officer views Dashboard:
[StageStore] Fetching pending approvals for user: {
  userId: "YR1kGHT...",
  userRole: "ho_recruitment_officer"
}

[StageService] getPendingApprovals: {
  userId: "YR1kGHT...",
  userRole: "ho_recruitment_officer",
  totalPendingInDB: 1  // ✅ Should be 1 or more
}

[StageService] Checking pending approval: {
  id: "abc123",
  applicantId: "csCXHNPxb98e4YgoPiyn",
  toStage: "transfer",
  status: "pending"
}

[StageService] Can user approve? {
  historyId: "abc123",
  toStage: "transfer",
  userRole: "ho_recruitment_officer",
  canApprove: true  // ✅ Should be true
}

[StageService] Final approvals for user: {
  count: 1,  // ✅ Should be 1 or more
  approvals: [
    {
      id: "abc123",
      applicant: "Jasmin Atamol",
      toStage: "transfer"
    }
  ]
}

[StageStore] Fetched approvals: {
  count: 1,  // ✅ Success!
  approvals: [ ... ]
}
```

---

## 🎯 **Most Likely Solution**

Based on the screenshots and symptoms, **the most likely cause is:**

**Branch Manager has NOT clicked "Advance to Transfer" button yet!**

The applicant is showing "Waiting for approval" message, but this might be:
1. An old status from a previous rejection
2. Status set manually
3. A failed request submission

**To Fix:**
1. Log in as **Branch Manager (Cotabato Branch)**
2. Go to applicant profile
3. Check if **"Advance to Transfer"** button is visible
4. If YES: Click it and submit the request
5. If NO: Reset applicant status in Firestore (see Step 2B above)
6. Then log in as **HO Recruitment Officer**
7. Refresh dashboard - approval should now appear!

---

## 📞 **Still Not Working?**

If you've tried all steps above and it's still not working:

1. **Check Firebase Console:**
   - Open `stage_history` collection
   - Look for ANY records with `status: "pending"`
   - If none exist, problem is request creation
   - If they exist but wrong `toStage`, check Branch Manager workflow

2. **Check Browser Console:**
   - Open F12 DevTools
   - Go to Console tab
   - Refresh HO Officer Dashboard
   - Screenshot all `[StageService]` and `[StageStore]` logs
   - Review logs for errors

3. **Check Firestore Security Rules:**
   ```bash
   firebase deploy --only firestore:rules
   ```
   - Ensure latest rules are deployed
   - Check Firebase Console → Firestore → Rules tab
   - Verify rules match our fix

---

**Next Steps:** Please check if the "Advance to Transfer" button is visible on the applicant profile when logged in as Branch Manager. That's the most likely issue!

