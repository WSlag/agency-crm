# Stage Management Implementation Summary

## Overview

This document summarizes the comprehensive recruitment pipeline stage management system that has been implemented. The system provides a structured workflow for managing applicants through the recruitment process with proper approvals, document validation, and commission triggers.

## Implemented Features

### 1. Revised Recruitment Pipeline Flow

The recruitment stages have been reorganized in the following order:

```
Registration → Interview → Medical → Transfer → Processing → Deployment → Deployed
```

**Stage Breakdown:**

1. **Registration** (Branch)
   - Initial applicant registration with agent or direct hire
   - Auto-advances to Interview

2. **Interview** (Branch)
   - Documents Required: Passport OR NBI Clearance OR Barangay Certificate
   - Approvers: Admin, Branch Manager
   - Requires manual approval

3. **Medical** (Branch)
   - Documents Required: Medical Certificate
   - Approvers: Admin, Branch Manager
   - **Commission Trigger: 50% of total commission**
   - Requires manual approval

4. **Transfer** (Branch → Head Office)
   - Branch Manager initiates transfer
   - Admin/President approves transfer
   - Admin/President assigns HO Recruitment Officer
   - Approvers: Admin, President

5. **Processing** (Head Office)
   - Documents Required: TESDA Certificate OR OWWA OR Employment Contract
   - Approvers: Admin, HO Recruitment Officer
   - Requires manual approval

6. **Deployment** (Head Office)
   - Documents Required: PDOS AND Plane Ticket (both required)
   - Approvers: Admin, HO Recruitment Officer
   - Requires manual approval

7. **Deployed** (Head Office - Terminal Stage)
   - **Commission Trigger: 50% of total commission**
   - Final stage - applicant successfully deployed

## Files Created/Modified

### 1. Type Definitions
**File:** `src/types/applicant.ts`

**New Types Added:**
- `ApplicantStage` enum (with 7 stages)
- `ApplicantStatus` enum (active, pending_approval, approved, rejected, withdrawn, on_hold, deployed)
- `DocumentType` enum
- `DocumentRequirement` interface
- `StageRequirement` interface
- `StageTransition` interface
- `StageApproval` interface
- `StageHistory` interface

**Modified Types:**
- Updated `Applicant` interface with new fields:
  - `currentStageEnum?: ApplicantStage`
  - `currentStatus?: ApplicantStatus`
  - `stageEnteredAt?: Date`
  - `stageCompletedAt?: Date`
  - `requiresApproval?: boolean`
  - `approvedBy?: string`
  - `approvedAt?: Date`
  - `rejectionReason?: string`
  - `commissionMedicalTriggered?: boolean`
  - `commissionMedicalTriggeredAt?: Date`
  - `commissionDeploymentTriggered?: boolean`
  - `commissionDeploymentTriggeredAt?: Date`

### 2. Stage Configuration
**File:** `src/config/stageConfig.ts`

**Exports:**
- `STAGE_CONFIGURATION`: Complete configuration for each stage including:
  - Document requirements
  - Approvers
  - Commission triggers
  - Auto-advance settings
- `VALID_STAGE_TRANSITIONS`: Allowed stage transitions
- `BRANCH_STAGES`: Stages managed by branch
- `HEAD_OFFICE_STAGES`: Stages managed by head office
- `STAGE_LABELS`: Human-readable labels
- `STAGE_DESCRIPTIONS`: Stage descriptions
- `STAGE_COLORS`: Tailwind classes for UI

**Helper Functions:**
- `stageRequiresApproval()`
- `stageTriggersCommission()`
- `getCommissionTrigger()`
- `isBranchStage()`
- `isHeadOfficeStage()`
- `isTerminalStage()`
- `getNextStage()`
- `getAllStagesInOrder()`
- `getStageIndex()`
- `calculateProgress()`

### 3. Stage Service
**File:** `src/services/stageService.ts`

**Key Methods:**
- `canApproveStage(user, stage, applicant)`: Check if user can approve a stage
- `canInitiateTransition(user, fromStage, applicant)`: Check if user can initiate transition
- `isValidTransition(fromStage, toStage)`: Validate transition
- `areDocumentsComplete(applicantId, stage)`: Check document requirements
- `requestStageAdvancement(transition, user)`: Request stage advancement
- `approveStageAdvancement(approval, user)`: Approve or reject advancement
- `advanceStage(applicantId, toStage, user)`: Advance to next stage (private)
- `triggerCommission(applicantId, triggerStage, applicant)`: Create commission record (private)
- `createStageNotification(...)`: Create notifications (private)
- `getPendingApprovals(user)`: Get pending approvals for user
- `getStageHistory(applicantId)`: Get stage history

### 4. Stage Store
**File:** `src/stores/stageStore.ts`

**State:**
- `pendingApprovals`: Array of pending approvals
- `stageHistory`: Record of stage history by applicant
- `documentChecks`: Cached document check results
- `loading`: Loading state
- `error`: Error messages

**Actions:**
- `requestStageAdvancement(transition, user)`
- `approveStage(approval, user)`
- `fetchPendingApprovals(user)`
- `checkDocumentRequirements(applicantId, stage)`
- `fetchStageHistory(applicantId)`
- `clearError()`

### 5. UI Components

#### StageProgress Component
**File:** `src/components/applicants/StageProgress.tsx`

Visual progress indicator showing:
- Current stage with icon
- Completed stages (green checkmarks)
- Pending stages (gray circles)
- Status indicators (pending approval, rejected, on hold, deployed)
- Commission badges (💰) on Medical and Deployed stages
- Status messages with color-coded alerts

**Props:**
```typescript
interface StageProgressProps {
  currentStage: ApplicantStage | string;
  status?: ApplicantStatus | string;
  commissionMedicalTriggered?: boolean;
  commissionDeploymentTriggered?: boolean;
  className?: string;
}
```

#### AdvanceStageButton Component
**File:** `src/components/applicants/AdvanceStageButton.tsx`

Button with modal for advancing stages:
- Checks document requirements before showing modal
- Displays document checklist with visual indicators
- Shows next stage requirements
- Indicates commission triggers
- Allows adding notes
- Validates all requirements before submission

**Props:**
```typescript
interface AdvanceStageButtonProps {
  applicant: any;
  onSuccess?: () => void;
  className?: string;
}
```

#### PendingApprovals Component
**File:** `src/components/applicants/PendingApprovals.tsx`

Dashboard widget for approvers:
- Lists all pending approvals for current user
- Shows applicant details and transition info
- One-click approval
- Rejection with reason modal
- Real-time updates after approval/rejection

**Props:**
```typescript
interface PendingApprovalsProps {
  className?: string;
}
```

### 6. Firestore Security Rules
**File:** `firestore.rules`

Added rules for `stage_history` collection:
- **Read**: Any authenticated user
- **Create**: Admin, President, Branch Manager, HO Recruitment Officer, HO Accountant
- **Update**: Only for approvals, role-specific:
  - Admin: All stages
  - President: Transfer stage
  - Branch Manager: Interview, Medical stages
  - HO Recruitment Officer: Processing, Deployment, Deployed stages
- **Delete**: Admin only

## Usage Guide

### 1. Displaying Stage Progress

```tsx
import { StageProgress } from '../components/applicants/StageProgress';

<StageProgress 
  currentStage={applicant.currentStageEnum || applicant.currentStage}
  status={applicant.currentStatus || applicant.status}
  commissionMedicalTriggered={applicant.commissionMedicalTriggered}
  commissionDeploymentTriggered={applicant.commissionDeploymentTriggered}
/>
```

### 2. Adding Stage Advancement Button

```tsx
import { AdvanceStageButton } from '../components/applicants/AdvanceStageButton';

<AdvanceStageButton 
  applicant={applicant}
  onSuccess={() => {
    // Refresh applicant data
    refetchApplicant();
  }}
/>
```

### 3. Displaying Pending Approvals Dashboard

```tsx
import { PendingApprovals } from '../components/applicants/PendingApprovals';

// In Admin/President/Manager Dashboard
<PendingApprovals />
```

### 4. Using Stage Store Programmatically

```tsx
import { useStageStore } from '../stores/stageStore';
import { useAuth } from '../contexts/AuthContext';

const { user } = useAuth();
const { 
  requestStageAdvancement, 
  approveStage, 
  fetchPendingApprovals,
  checkDocumentRequirements 
} = useStageStore();

// Request stage advancement
await requestStageAdvancement({
  applicantId: '123',
  fromStage: ApplicantStage.INTERVIEW,
  toStage: ApplicantStage.MEDICAL,
  initiatedBy: user.uid,
  requiresApproval: true,
  notes: 'Interview passed successfully'
}, user);

// Approve stage
await approveStage({
  applicantId: '123',
  stage: ApplicantStage.MEDICAL,
  approvedBy: user.uid,
  approved: true
}, user);

// Check documents
const result = await checkDocumentRequirements('123', ApplicantStage.INTERVIEW);
if (result.complete) {
  // All documents verified
}
```

## Commission Triggering

### How It Works

1. **Medical Stage Commission (50%)**
   - Triggered automatically when applicant advances to Medical stage
   - Commission calculation: `baseCommission * 50% * (commissionRate / 100)`
   - Creates commission record with status: 'pending'
   - Links to original branch and agent

2. **Deployment Commission (50%)**
   - Triggered automatically when applicant reaches Deployed stage
   - Commission calculation: `baseCommission * 50% * (commissionRate / 100)`
   - Creates commission record with status: 'pending'
   - Links to original branch and agent

### Commission Record Fields

```typescript
{
  agentId: string,
  applicantId: string,
  branchId: string, // Original branch
  amount: number,
  currency: 'PHP',
  triggerStage: 'medical' | 'deployed',
  triggeredAt: Timestamp,
  autoCalculated: true,
  calculationDetails: {
    baseCommission: number,
    commissionRate: number,
    percentage: 0.5,
    stage: string
  },
  status: 'pending',
  requestedBy: null,
  verifiedBy: null,
  approvedBy: null,
  createdAt: Timestamp
}
```

## Approval Workflow

### Process Flow

1. **Stage Advancement Request**
   - User clicks "Advance to [Next Stage]" button
   - System checks document requirements
   - If documents complete, shows modal with details
   - User submits request with optional notes

2. **Pending Approval**
   - Stage history record created with status: 'pending'
   - Applicant status changed to 'pending_approval'
   - Notifications sent to relevant approvers

3. **Approval/Rejection**
   - Approver views pending approvals dashboard
   - Approves: Applicant advances to next stage
   - Rejects: Applicant status set to 'rejected' with reason

4. **Stage Advancement**
   - Applicant's stage updated
   - Commission triggered if applicable
   - Stage entered timestamp recorded
   - Notifications sent to relevant users

## Database Schema

### New Collection: `stage_history`

```typescript
{
  id: string,
  applicantId: string,
  fromStage: ApplicantStage | null,
  toStage: ApplicantStage,
  changedBy: string, // user UID
  changedAt: Timestamp,
  approvalRequired: boolean,
  approvedBy: string | null, // user UID
  approvedAt: Timestamp | null,
  status: 'pending' | 'approved' | 'rejected',
  rejectionReason: string | null,
  notes: string | null
}
```

### Updated Collection: `applicants`

New fields added (all optional for backward compatibility):
- `currentStageEnum`: ApplicantStage
- `currentStatus`: ApplicantStatus
- `stageEnteredAt`: Timestamp
- `stageCompletedAt`: Timestamp
- `requiresApproval`: boolean
- `approvedBy`: string
- `approvedAt`: Timestamp
- `rejectionReason`: string
- `commissionMedicalTriggered`: boolean
- `commissionMedicalTriggeredAt`: Timestamp
- `commissionDeploymentTriggered`: boolean
- `commissionDeploymentTriggeredAt`: Timestamp

### Updated Collection: `commissions`

New fields for auto-triggered commissions:
- `triggerStage`: 'medical' | 'deployed'
- `triggeredAt`: Timestamp
- `autoCalculated`: boolean
- `calculationDetails`: object

## Role-Based Permissions

### Admin
- Can approve any stage
- Can view all pending approvals
- Full access to stage management

### President
- Can approve Transfer stage
- Can assign HO Recruitment Officers
- Views transfer approvals

### Branch Manager
- Can approve Interview and Medical stages
- Only for applicants in their branch
- Can initiate transfer requests
- Views branch-specific approvals

### HO Recruitment Officer
- Can approve Processing, Deployment, and Deployed stages
- Only for assigned applicants
- Manages applicants after transfer
- Views assigned applicant approvals

### HO Accountant
- Can view stage history
- Cannot approve stages
- Receives commission trigger notifications

## Terminal Status: "Can Be Terminal"

A **terminal status** means the applicant has reached a final state in the recruitment process and cannot progress further:

### Terminal Statuses

1. **DEPLOYED** (Success)
   - Applicant successfully deployed
   - Final commission triggered
   - Journey complete

2. **REJECTED** (Failure)
   - Stage advancement rejected
   - Cannot proceed further
   - Rejection reason recorded

3. **WITHDRAWN** (Voluntary)
   - Applicant withdrew from process
   - Journey ended by applicant

### Non-Terminal Statuses

- **ACTIVE**: Currently progressing
- **PENDING_APPROVAL**: Waiting for approval (can be approved or rejected)
- **APPROVED**: Stage approved (transitional, immediately advances)
- **ON_HOLD**: Temporarily paused (can resume)

## Next Steps for Integration

### 1. Update Applicant Pages

Add the stage management components to existing applicant views:

```tsx
// In ApplicantDetails page
import { StageProgress } from '../../components/applicants/StageProgress';
import { AdvanceStageButton } from '../../components/applicants/AdvanceStageButton';

// Display stage progress
<StageProgress 
  currentStage={applicant.currentStageEnum || applicant.currentStage}
  status={applicant.currentStatus}
  commissionMedicalTriggered={applicant.commissionMedicalTriggered}
  commissionDeploymentTriggered={applicant.commissionDeploymentTriggered}
/>

// Add advancement button
<AdvanceStageButton 
  applicant={applicant}
  onSuccess={() => refetch()}
/>
```

### 2. Update Dashboard

Add pending approvals widget to relevant dashboards:

```tsx
// In Admin/President/Manager Dashboard
import { PendingApprovals } from '../../components/applicants/PendingApprovals';

<PendingApprovals />
```

### 3. Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

### 4. Initialize Existing Applicants (Optional)

Create a migration script to initialize the new fields for existing applicants:

```typescript
// migrations/init-stage-fields.ts
import { firestore } from '../config/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { ApplicantStage, ApplicantStatus } from '../types/applicant';

const applicantsRef = collection(firestore, 'applicants');
const snapshot = await getDocs(applicantsRef);

for (const docSnap of snapshot.docs) {
  const applicant = docSnap.data();
  
  // Map legacy stage to new enum
  const stageMap = {
    'interview': ApplicantStage.INTERVIEW,
    'medical': ApplicantStage.MEDICAL,
    'processing': ApplicantStage.PROCESSING,
    'deployment': ApplicantStage.DEPLOYMENT,
    'deployed': ApplicantStage.DEPLOYED
  };
  
  await updateDoc(doc(firestore, 'applicants', docSnap.id), {
    currentStageEnum: stageMap[applicant.currentStage] || ApplicantStage.REGISTRATION,
    currentStatus: ApplicantStatus.ACTIVE,
    stageEnteredAt: applicant.createdAt,
    requiresApproval: false
  });
}
```

## Testing Checklist

- [ ] Stage progression works correctly
- [ ] Document validation prevents advancement
- [ ] Approval workflow functions properly
- [ ] Rejection with reason records correctly
- [ ] Commission triggers at Medical stage
- [ ] Commission triggers at Deployed stage
- [ ] Notifications sent to correct users
- [ ] Role-based approvals enforce correctly
- [ ] Branch Manager can only approve branch stages
- [ ] HO Officer can only approve assigned applicants
- [ ] Stage history records all transitions
- [ ] UI components display correctly
- [ ] Mobile responsive design works
- [ ] Security rules enforce properly

## Troubleshooting

### Issue: Cannot advance stage
- Check document requirements are met
- Verify user has permission to initiate transition
- Check applicant is not already pending approval

### Issue: Cannot approve stage
- Verify user role has approval permissions for that stage
- For Branch Manager: Check applicant belongs to their branch
- For HO Officer: Check applicant is assigned to them

### Issue: Commission not triggered
- Verify applicant has an agent assigned
- Check agent exists and has commission rate
- Review console logs for commission creation

### Issue: Notifications not received
- Check Firestore security rules allow notification creation
- Verify user UID is correct in notifications collection
- Check user's notification preferences

## Support

For questions or issues with the stage management system:
1. Review this documentation
2. Check the implementation files listed above
3. Review Firestore security rules
4. Check browser console for errors
5. Review stage_history collection for audit trail

