# Resume Approval Workflow Implementation

## Overview

This document describes the semi-automatic resume visibility system with pending approval workflow that was implemented for the recruitment agency management system.

## Problem Statement

Previously, the system required manual intervention for applicants who passed their medical examination to appear on the public employer portal. Admins had to:
1. Navigate to the Resume Management page
2. Manually verify photos were uploaded
3. Manually toggle visibility for each applicant

This was inefficient and prone to delays.

## Solution

A **semi-automatic workflow** with pending approval state that:
1. **Auto-detects** when applicants are ready for the portal (medical passed + all photos uploaded)
2. **Automatically sets** `resumeApprovalStatus` to `'pending'` when ready
3. **Sends notifications** to admins for approval or photo upload
4. **Provides approval interface** with tabs for pending, approved, rejected, and needs photos
5. **Supports bulk actions** for approving multiple applicants at once
6. **Maintains admin control** with manual override capability

---

## Implementation Details

### 1. Database Schema Changes

#### New Fields Added to Applicant Type

[src/types/applicant.ts:204-210](src/types/applicant.ts#L204-L210)

```typescript
resumeApprovalStatus?: 'pending' | 'approved' | 'rejected' | null;
resumeApprovedBy?: string | null;  // User ID who approved/rejected
resumeApprovedAt?: Date | null;    // Timestamp of approval/rejection
resumeRejectionReason?: string;    // Reason for rejection (if rejected)
```

### 2. Utility Functions

Created [src/utils/resumeApprovalHelpers.ts](src/utils/resumeApprovalHelpers.ts) with:

- **`isApplicantReadyForPortal(applicant)`** - Checks if applicant has:
  - Medical status: `'passed'`
  - All 3 photos uploaded (2x2 ID, full body, passport)
  - Status: `'active'`

- **`getMissingPhotos(applicant)`** - Returns array of missing photo types

- **`needsPhotoUpload(applicant)`** - Checks if medical passed but photos missing

- **`notifyReadyForApproval(applicant)`** - Sends notifications to admins when applicant is ready

- **`notifyMissingPhotos(applicant)`** - Sends notifications when photos are missing

- **`notifyResumeApproved(applicant, approvedBy)`** - Sends approval notifications

- **`notifyResumeRejected(applicant, rejectedBy, reason)`** - Sends rejection notifications

### 3. Auto-Detection Logic

Modified [src/stores/applicantStore.ts:462-513](src/stores/applicantStore.ts#L462-L513)

The `updateApplicant` function now:
1. Fetches current applicant data
2. Checks if applicant **just became ready** for portal
3. Auto-sets `resumeApprovalStatus: 'pending'` if:
   - Wasn't ready before
   - Is ready now
   - Doesn't already have an approval status
4. Sends appropriate notifications

**Triggers:**
- When medical status changes to `'passed'` (if photos already uploaded)
- When photo is uploaded (if medical already passed and all photos complete)

### 4. Enhanced Resume Management UI

Created [src/pages/admin/ResumeManagementEnhanced.tsx](src/pages/admin/ResumeManagementEnhanced.tsx)

**Features:**
- **Tab-based interface:**
  - Pending Approval (with badge count)
  - Approved
  - Rejected
  - Needs Photos (with badge count)

- **Actions:**
  - Approve button (sets `resumeApprovalStatus: 'approved'`, `resumeVisible: true`)
  - Reject button (opens modal for rejection reason)
  - Bulk approval (select multiple, approve all at once)
  - Re-review for rejected applicants

- **Photo Management:**
  - Shows photo upload status
  - Upload capability in "Needs Photos" tab
  - Visual indicators (✓ Uploaded, ✗ Missing)

### 5. Bulk Processing Tool

Created [src/pages/admin/BulkResumeProcessor.tsx](src/pages/admin/BulkResumeProcessor.tsx)

**Purpose:** Process existing applicants who already passed medical

**Process:**
1. Scans all medical-passed, active applicants
2. For each applicant without `resumeApprovalStatus`:
   - If ready (has all photos): Set to `'pending'`, send approval notification
   - If missing photos: Send photo upload notification
3. Shows real-time processing logs
4. Displays summary statistics

**Access:** `/admin/bulk-resume-processor`

### 6. Public Portal Query Update

Modified [src/stores/resumeStore.ts:48-60](src/stores/resumeStore.ts#L48-L60)

Changed query from:
```typescript
where('resumeVisible', '==', true)
```

To:
```typescript
where('resumeApprovalStatus', '==', 'approved')
```

**Effect:** Only approved applicants appear on public portal (not just those with `resumeVisible: true`)

### 7. Firestore Security Rules

Updated [firestore.rules:150-155](firestore.rules#L150-L155)

```javascript
allow read: if isAuthenticated() ||
  (resource.data.resumeApprovalStatus == 'approved' &&
   resource.data.medicalStatus.examination.result == 'passed' &&
   resource.data.status == 'active');
```

**Effect:** Public (unauthenticated) access only to approved applicants

### 8. Firestore Indexes

Added to [firestore.indexes.json:510-526](firestore.indexes.json#L510-L526):

```json
{
  "collectionGroup": "applicants",
  "queryScope": "COLLECTION",
  "fields": [
    { "fieldPath": "resumeApprovalStatus", "order": "ASCENDING" },
    { "fieldPath": "medicalStatus.examination.result", "order": "ASCENDING" },
    { "fieldPath": "status", "order": "ASCENDING" }
  ]
}
```

### 9. Routing

Updated [src/App.tsx:470-493](src/App.tsx#L470-L493):

- `/admin/resume-management` → `ResumeManagementEnhanced` (new workflow)
- `/admin/resume-management-legacy` → `ResumeManagement` (old interface, kept for reference)
- `/admin/bulk-resume-processor` → `BulkResumeProcessor` (bulk processing tool)

---

## User Workflow

### For Branch Officers/HO Officers

1. **Upload Photos** (before or after medical)
   - 2x2 ID Photo
   - Full Body Photo
   - Passport Copy

2. **Update Medical Status** to `'passed'`
   - System auto-detects readiness
   - If all photos uploaded: Sets `resumeApprovalStatus: 'pending'`
   - If photos missing: Sends notification to upload photos

### For Admins

#### Regular Workflow

1. **Receive Notification** when applicants are ready for approval
2. **Navigate to** `/admin/resume-management`
3. **View "Pending Approval" tab** (shows count badge)
4. **Review applicant photos and details**
5. **Approve** (makes visible on portal) or **Reject** (with reason)

#### Bulk Processing

1. **Navigate to** `/admin/bulk-resume-processor`
2. **Click "Start Bulk Processing"**
3. **Review logs** showing:
   - Applicants set to pending
   - Applicants needing photos
   - Errors (if any)
4. **View results summary**

#### Needs Photos

1. **View "Needs Photos" tab**
2. **See which photos are missing** for each applicant
3. **Upload missing photos** directly from this interface
4. **System auto-sets to pending** once all photos uploaded

### For Employers (Public Portal)

- Only see **approved** applicants
- No change to user experience
- Better quality control (admin-reviewed profiles only)

---

## Notification Types

### 1. Resume Pending Approval
- **Trigger:** Applicant becomes ready (medical passed + all photos)
- **Recipients:** Admins, Presidents
- **Icon:** ✅
- **Priority:** Medium

### 2. Missing Photos
- **Trigger:** Medical passed but photos missing
- **Recipients:** Admins, Presidents
- **Icon:** ⚠️
- **Priority:** High

### 3. Resume Approved
- **Trigger:** Admin approves applicant
- **Recipients:** Admins, Presidents
- **Icon:** 🎉
- **Priority:** Low

### 4. Resume Rejected
- **Trigger:** Admin rejects applicant
- **Recipients:** Admins, Presidents
- **Icon:** ❌
- **Priority:** Medium

---

## Data States

### resumeApprovalStatus Values

| Value | Meaning | resumeVisible | Public Portal |
|-------|---------|---------------|---------------|
| `null` | Not yet evaluated | `false` | Not visible |
| `'pending'` | Ready, awaiting admin approval | `false` | Not visible |
| `'approved'` | Admin approved | `true` | **Visible** |
| `'rejected'` | Admin rejected (with reason) | `false` | Not visible |

---

## Testing Checklist

### Auto-Detection

- [ ] Upload photos first, then pass medical → Should auto-set to pending
- [ ] Pass medical first, then upload photos → Should auto-set to pending when last photo uploaded
- [ ] Pass medical without photos → Should send "missing photos" notification
- [ ] Upload photos without medical passed → Should not auto-set to pending

### Approval Workflow

- [ ] Approve applicant → Should set `resumeApprovalStatus: 'approved'`, `resumeVisible: true`
- [ ] Reject applicant → Should prompt for reason, set `resumeApprovalStatus: 'rejected'`
- [ ] Re-review rejected applicant → Should reset to `'pending'`
- [ ] Bulk approve multiple applicants → All should be approved

### Public Portal

- [ ] Only approved applicants visible
- [ ] Pending applicants NOT visible
- [ ] Rejected applicants NOT visible
- [ ] Security rules enforce public access

### Bulk Processor

- [ ] Scans all medical-passed applicants
- [ ] Sets pending for those with all photos
- [ ] Sends notifications for those missing photos
- [ ] Skips applicants already processed
- [ ] Shows accurate summary

### Notifications

- [ ] "Ready for approval" sent when applicant becomes ready
- [ ] "Missing photos" sent when medical passes without photos
- [ ] "Approved" sent when admin approves
- [ ] "Rejected" sent when admin rejects

---

## Deployment Steps

### 1. Deploy Firestore Rules and Indexes
```bash
firebase deploy --only firestore:rules,firestore:indexes
```

### 2. Run Bulk Processor (One-Time)
1. Navigate to `/admin/bulk-resume-processor`
2. Click "Start Bulk Processing"
3. Review results

### 3. Verify Setup
1. Check "Pending Approval" tab has applicants (if any ready)
2. Check "Needs Photos" tab shows those missing photos
3. Test approval/rejection workflow
4. Verify public portal only shows approved applicants

---

## Migration Notes

### Existing Applicants

Use the **Bulk Resume Processor** to migrate existing data:
- Applicants with medical passed + all photos → Set to `'pending'`
- Applicants with medical passed but missing photos → Send notification

### Backward Compatibility

- Old `ResumeManagement` component kept at `/admin/resume-management-legacy`
- `resumeVisible` field still set on approval for backward compatibility
- Old queries will continue to work (though encouraged to migrate)

---

## Future Enhancements

### Potential Improvements

1. **Auto-approval rules** - Option to auto-approve based on criteria
2. **Approval history** - Track all approval/rejection changes
3. **Batch photo upload** - Upload all 3 photos at once
4. **Photo quality check** - Validate photo dimensions/quality
5. **Expiration dates** - Auto-hide if medical expires
6. **Email notifications** - Send emails in addition to in-app notifications

---

## Technical Notes

### Performance Considerations

- Queries use composite indexes for optimal performance
- Bulk processor handles errors gracefully
- Notifications sent asynchronously (don't block main operation)

### Error Handling

- Missing photo notifications sent even if notification fails
- Auto-detection continues even if notification fails
- Bulk processor logs errors but continues processing

### Security

- Only admins can approve/reject
- Public portal restricted by security rules
- Photos uploaded to Firebase Storage with proper access controls

---

## Support

For questions or issues with this implementation, please refer to:
- [applicantStore.ts:462-513](src/stores/applicantStore.ts#L462-L513) - Auto-detection logic
- [resumeApprovalHelpers.ts](src/utils/resumeApprovalHelpers.ts) - Utility functions
- [ResumeManagementEnhanced.tsx](src/pages/admin/ResumeManagementEnhanced.tsx) - Main UI

---

## Summary

This implementation provides a **semi-automatic** workflow that:
- ✅ Auto-detects when applicants are ready
- ✅ Notifies admins for approval or photo upload
- ✅ Provides intuitive approval interface
- ✅ Supports bulk operations
- ✅ Maintains admin control
- ✅ Improves quality control for public portal

**Result:** Applicants who pass medical and upload photos automatically enter pending approval queue, admins review and approve, then they appear on the public employer portal.
