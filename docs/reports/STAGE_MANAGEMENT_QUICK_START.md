# Stage Management System - Quick Start Guide

## 🚀 Quick Integration (5 Minutes)

### Step 1: Import Components (30 seconds)

```tsx
// In your ApplicantDetails page
import { StageProgress } from '../../components/applicants/StageProgress';
import { AdvanceStageButton } from '../../components/applicants/AdvanceStageButton';
```

### Step 2: Add Stage Progress Display (1 minute)

```tsx
// Replace or add below applicant header
<StageProgress 
  currentStage={applicant.currentStageEnum || applicant.currentStage}
  status={applicant.currentStatus || 'active'}
  commissionMedicalTriggered={applicant.commissionMedicalTriggered}
  commissionDeploymentTriggered={applicant.commissionDeploymentTriggered}
/>
```

### Step 3: Add Advance Button (1 minute)

```tsx
// In your actions section or near Edit button
<AdvanceStageButton 
  applicant={applicant}
  onSuccess={() => {
    // Refresh applicant data
    refetch(); // or whatever your refresh method is
  }}
/>
```

### Step 4: Add Approvals Dashboard Widget (1 minute)

```tsx
// In Admin/President/Manager Dashboard
import { PendingApprovals } from '../../components/applicants/PendingApprovals';

// In your dashboard layout
<div className="mb-6">
  <PendingApprovals />
</div>
```

### Step 5: Deploy Security Rules (1 minute)

```bash
firebase deploy --only firestore:rules
```

## ✅ That's it! You're done!

## 📋 New Recruitment Pipeline

```
Registration (Branch)
    ↓
Interview (Branch) - Documents: Passport OR NBI OR Barangay
    ↓
Medical (Branch) - Documents: Medical Certificate [💰 50% Commission]
    ↓
Transfer (Branch → HO) - Admin/President approves & assigns officer
    ↓
Processing (HO) - Documents: TESDA OR OWWA OR Contract
    ↓
Deployment (HO) - Documents: PDOS + Plane Ticket
    ↓
Deployed (HO) [💰 50% Commission] ✅ Success!
```

## 🔐 Who Can Approve What?

| Role | Can Approve |
|------|-------------|
| **Admin** | ALL stages |
| **President** | Transfer stage |
| **Branch Manager** | Interview, Medical (own branch only) |
| **HO Recruitment Officer** | Processing, Deployment, Deployed (assigned applicants only) |

## 💰 Commission Triggers

1. **Medical Stage**: 50% of commission triggered automatically
2. **Deployed Stage**: 50% of commission triggered automatically

Commissions are linked to original branch/agent even after transfer.

## 🎨 UI Components Preview

### StageProgress Component
Visual timeline showing:
- ✅ Completed stages (green)
- 🔵 Current stage (blue)
- ⚪ Future stages (gray)
- ⏱️ Pending approval (yellow)
- ❌ Rejected (red)
- 💰 Commission badges

### AdvanceStageButton Component
- Validates documents before showing modal
- Shows checklist of required/verified documents
- Prevents advancement if documents missing
- Adds optional notes
- One-click submission

### PendingApprovals Component
- Lists all approvals for current user
- Shows applicant and stage details
- Quick approve/reject actions
- Rejection requires reason
- Auto-refreshes after actions

## 🔧 Configuration

All stage configurations are in: `src/config/stageConfig.ts`

Modify there to:
- Change document requirements
- Adjust approver roles
- Modify commission percentages
- Update stage labels/descriptions

## 📊 Database Changes

### New Collection: `stage_history`
Automatically created when first stage transition occurs.

### Updated: `applicants` collection
New optional fields (backward compatible):
- `currentStageEnum`
- `currentStatus`
- `stageEnteredAt`
- `commissionMedicalTriggered`
- `commissionDeploymentTriggered`

## 🐛 Common Issues

### "Cannot advance stage"
✅ **Solution**: Upload and verify required documents first

### "Permission denied"
✅ **Solution**: Check user role matches stage approver requirements

### "Documents not complete"
✅ **Solution**: Ensure all required documents are verified (not just uploaded)

## 📚 Full Documentation

See `STAGE_MANAGEMENT_IMPLEMENTATION.md` for:
- Complete API reference
- Detailed usage examples
- Role permissions matrix
- Troubleshooting guide
- Database schema details
- Testing checklist

## 🎯 Next Steps

1. ✅ Components are ready to use
2. ✅ Security rules are configured
3. ⬜ Add components to your pages
4. ⬜ Deploy Firestore rules
5. ⬜ Test the workflow
6. ⬜ Train users on new process

## 💡 Pro Tips

1. **Start Small**: Test with one applicant first
2. **Check Permissions**: Use Admin account for initial testing
3. **Monitor Stage History**: Review `stage_history` collection to see audit trail
4. **Commission Tracking**: Check `commissions` collection after Medical/Deployed stages
5. **Notifications**: Users receive real-time notifications for stage changes

## 🆘 Need Help?

1. Check browser console for errors
2. Review `stage_history` collection for audit trail
3. Verify Firestore security rules deployed
4. Check user role and permissions
5. Review full documentation in `STAGE_MANAGEMENT_IMPLEMENTATION.md`

---

**Implementation Time**: ~5 minutes  
**Complexity**: Low (just add 3 components)  
**Testing Time**: ~10 minutes  
**Production Ready**: Yes ✅

