# Resume Approval System - Quick Start Guide

## What Changed?

Your recruitment agency system now has a **semi-automatic resume approval workflow**. Applicants who pass medical and upload photos automatically enter a pending approval queue for admin review.

---

## For Admins

### First Time Setup

1. **Deploy the changes** (if not already done):
   ```bash
   firebase deploy --only firestore:rules,firestore:indexes
   ```

2. **Process existing applicants**:
   - Navigate to: `http://localhost:3000/admin/bulk-resume-processor`
   - Click "Start Bulk Processing"
   - Wait for completion (this processes all existing medical-passed applicants)

### Daily Workflow

1. **Navigate to Resume Management**:
   ```
   http://localhost:3000/admin/resume-management
   ```

2. **Check "Pending Approval" tab**:
   - Shows applicants ready for the portal
   - Badge shows count of pending applicants

3. **Review each applicant**:
   - Check 2x2 photo, full body photo, passport copy
   - View position and country destination
   - Click "View Profile" for full details

4. **Approve or Reject**:
   - **Approve**: Sets `resumeApprovalStatus: 'approved'` and makes visible on portal
   - **Reject**: Enter rejection reason (e.g., "Poor photo quality", "Incomplete documents")

5. **Bulk Approve** (optional):
   - Select multiple applicants using checkboxes
   - Click "Approve Selected (X)" button

6. **Check "Needs Photos" tab**:
   - Shows applicants who passed medical but are missing photos
   - Upload missing photos directly from this interface

---

## For Branch Officers / HO Officers

### Workflow

1. **Register applicant** (if not already registered)

2. **Upload photos** (can be before or after medical):
   - 2x2 ID Photo
   - Full Body Photo
   - Passport Copy

3. **Update medical status to "passed"**

4. **System automatically**:
   - Checks if all photos are uploaded
   - If yes: Sets `resumeApprovalStatus: 'pending'` and notifies admins
   - If no: Sends notification to admin to upload missing photos

### What You'll See

- **Before**: Manual toggle for resume visibility
- **After**: Applicant enters "pending approval" queue automatically

---

## Key URLs

| Page | URL | Purpose |
|------|-----|---------|
| Resume Management | `/admin/resume-management` | Main approval interface |
| Bulk Processor | `/admin/bulk-resume-processor` | Process existing applicants |
| Public Portal | `/employer-portal` | Where approved resumes appear |

---

## Approval States

| State | Meaning | Action Needed |
|-------|---------|---------------|
| **Pending** | Ready for review | Admin reviews & approves/rejects |
| **Approved** | Visible on portal | None |
| **Rejected** | Not visible, with reason | Can re-review if needed |
| **Needs Photos** | Missing photos | Upload missing photos |

---

## Notifications

You'll receive notifications for:
- ✅ **New applicant ready for approval** (has medical + all photos)
- ⚠️ **Applicant needs photos** (has medical, missing photos)
- 🎉 **Resume approved** (confirmation)
- ❌ **Resume rejected** (with reason)

---

## FAQs

### Q: What happens to existing applicants?
**A:** Run the bulk processor once to evaluate all existing applicants. They'll be sorted into pending, approved, or needs photos.

### Q: Can I still manually control visibility?
**A:** Yes! You can approve/reject at any time. The system suggests but doesn't force approval.

### Q: What if photos are uploaded after medical passes?
**A:** System auto-detects when the last photo is uploaded and sets to pending approval automatically.

### Q: Can I re-review rejected applicants?
**A:** Yes! Go to "Rejected" tab and click "Re-review" to move back to pending.

### Q: Do I have to approve all at once?
**A:** No. You can approve one-by-one or use bulk approve for multiple at once.

### Q: What if medical expires?
**A:** Currently, you would manually reject. Future enhancement: auto-hide when medical expires.

---

## Common Issues

### Issue: Applicant not showing in pending approval
**Solution:**
- Check if all 3 photos are uploaded
- Check if medical status is "passed"
- Check if status is "active"

### Issue: Can't approve applicant
**Solution:**
- Ensure you're logged in as admin
- Check if applicant has all required photos

### Issue: Approved applicant not showing on public portal
**Solution:**
- Check if `resumeApprovalStatus === 'approved'`
- Check if `medicalStatus.examination.result === 'passed'`
- Check if `status === 'active'`

---

## Testing Checklist

Before going live, test:
- [ ] Upload photos → pass medical → appears in pending
- [ ] Pass medical → upload photos → appears in pending
- [ ] Approve applicant → appears on public portal
- [ ] Reject applicant → does NOT appear on public portal
- [ ] Bulk approve 3+ applicants → all appear on portal
- [ ] Check needs photos tab → shows missing photos correctly

---

## Need Help?

Refer to:
- **Full Documentation**: [RESUME_APPROVAL_IMPLEMENTATION.md](RESUME_APPROVAL_IMPLEMENTATION.md)
- **Code Reference**:
  - Auto-detection: [src/stores/applicantStore.ts:462-513](src/stores/applicantStore.ts#L462-L513)
  - Utility functions: [src/utils/resumeApprovalHelpers.ts](src/utils/resumeApprovalHelpers.ts)
  - UI Components: [src/pages/admin/ResumeManagementEnhanced.tsx](src/pages/admin/ResumeManagementEnhanced.tsx)

---

**That's it! Your resume approval system is now semi-automatic. 🎉**
