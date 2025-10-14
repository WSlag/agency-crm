# Stage Management Migration Guide

## Overview

This guide explains how to migrate existing applicants to the new stage management system.

## What This Migration Does

The migration script (`src/migrations/init-stage-fields.ts`) will:

1. ✅ Add new stage management fields to all existing applicants
2. ✅ Map legacy stage values to new enum values
3. ✅ Initialize commission tracking fields
4. ✅ Set appropriate status for each applicant
5. ✅ Create initial stage history records (optional)

## Prerequisites

- ✅ Firestore rules deployed (already done)
- ✅ Firebase Admin SDK service account file (`service-account.json`)
- ✅ Backup of Firestore data (recommended)

## Stage Mapping

The migration will map existing stages as follows:

| Legacy Stage | New Stage Enum |
|-------------|---------------|
| `registration` | `REGISTRATION` |
| `interview` | `INTERVIEW` |
| `medical` | `MEDICAL` |
| `transfer` | `TRANSFER` |
| `processing` | `PROCESSING` |
| `deployment` | `DEPLOYMENT` |
| `deployed` | `DEPLOYED` |

If no stage exists, defaults to `REGISTRATION`.

## Status Mapping

| Legacy Status | New Status Enum |
|--------------|----------------|
| `active` | `ACTIVE` |
| `inactive` | `WITHDRAWN` |
| `deployed` | `DEPLOYED` |

## Before Running Migration

### 1. Create Backup (Recommended)

```bash
npm run migrate:backup
```

This creates a backup in `./backup/firestore`

### 2. Review Current Data

Check your Firestore console to see how many applicants will be affected.

## Running the Migration

### Option 1: Run with npm script (Recommended)

```bash
npm run migrate:stage-fields
```

### Option 2: Run directly with tsx

```bash
npx tsx src/migrations/init-stage-fields.ts
```

## What Happens During Migration

### For Each Applicant

```typescript
{
  // New fields added:
  currentStageEnum: ApplicantStage,        // Mapped from currentStage
  currentStatus: ApplicantStatus,          // Mapped from status
  stageEnteredAt: Timestamp,               // From updatedAt or createdAt
  stageCompletedAt: null,
  requiresApproval: false,
  approvedBy: null,
  approvedAt: null,
  rejectionReason: null,
  commissionMedicalTriggered: false,       // true if already deployed
  commissionMedicalTriggeredAt: null,
  commissionDeploymentTriggered: false,    // true if already deployed
  commissionDeploymentTriggeredAt: null
}
```

### For Deployed Applicants

If an applicant's stage is `DEPLOYED`, the migration will:
- Set `commissionMedicalTriggered: true`
- Set `commissionDeploymentTriggered: true`
- Set timestamps to creation/update dates
- This assumes commissions were already processed manually

### Stage History Records

The migration creates an initial stage history record for each applicant:

```typescript
{
  applicantId: string,
  fromStage: null,                        // First entry
  toStage: currentStageEnum,
  changedBy: 'admin',                     // First admin user or 'system'
  changedAt: createdAt,
  approvalRequired: false,
  approvedBy: 'admin',
  approvedAt: createdAt,
  status: 'approved',
  notes: 'Initial migration - created from existing data'
}
```

## Migration Output

The script provides detailed console output:

```
🚀 Starting Stage Management Migration
==========================================

📋 Starting migration: Initialize Stage Fields
==========================================

📊 Found 50 applicant(s) to migrate

✅ [1/50] Updated: John Doe (interview → INTERVIEW)
✅ [2/50] Updated: Jane Smith (medical → MEDICAL)
...
✅ [50/50] Updated: Bob Johnson (deployed → DEPLOYED)

==========================================
📊 Migration Summary
==========================================
✅ Successfully migrated: 50
❌ Failed: 0
📋 Total processed: 50

📋 Creating initial stage history records
==========================================

📊 Creating history for 50 applicant(s)

✅ [1/50] Created history for: John Doe
...
✅ [50/50] Created history for: Bob Johnson

✅ Created 50 stage history records

🎉 All migration tasks completed successfully!
```

## After Migration

### 1. Verify in Firestore Console

Check a few applicants in Firestore to ensure new fields are present:
- Navigate to Firestore Console
- Open `applicants` collection
- Check that new fields exist (`currentStageEnum`, `currentStatus`, etc.)

### 2. Check Stage History

- Open `stage_history` collection
- Verify initial records were created

### 3. Test the UI

- View an applicant detail page
- The `StageProgress` component should display correctly
- The `AdvanceStageButton` should be functional

## Rollback (If Needed)

If you need to rollback the migration:

1. **From Backup:**
   ```bash
   # Restore from backup (requires Firebase CLI)
   firebase firestore:import ./backup/firestore
   ```

2. **Manual Cleanup:**
   - Delete the `stage_history` collection
   - Remove new fields from `applicants` collection using Firestore Console

## Troubleshooting

### Error: "service-account.json not found"

**Solution:** Ensure `service-account.json` exists in the project root.

```bash
# Check if file exists
ls service-account.json
```

### Error: "Permission denied"

**Solution:** Verify service account has Firestore admin permissions.

### Migration Completes with Errors

Check the error output. Common issues:
- Invalid data types in existing records
- Missing required fields
- Network connectivity issues

Re-run the migration - it will skip already migrated records.

## Optional: Disable Stage History Creation

If you don't want to create initial stage history records, edit the migration file:

```typescript
// In src/migrations/init-stage-fields.ts
// Comment out this line:
// await createInitialStageHistory();
```

## Running in Production

### Recommended Approach

1. **Test in Staging First:**
   ```bash
   # Switch to staging project
   firebase use agency-crm-staging
   
   # Run migration
   npm run migrate:stage-fields
   
   # Verify results
   # Test UI
   ```

2. **Backup Production:**
   ```bash
   # Switch to production
   firebase use crm-agency-22f30
   
   # Create backup
   npm run migrate:backup
   ```

3. **Run in Production:**
   ```bash
   npm run migrate:stage-fields
   ```

4. **Monitor:**
   - Watch console output
   - Check for errors
   - Verify in Firestore Console

## Estimated Time

- **Small databases** (< 100 applicants): ~10 seconds
- **Medium databases** (100-1000 applicants): ~1-2 minutes
- **Large databases** (1000+ applicants): ~5-10 minutes

## Support

If you encounter issues:

1. Check the error message in console output
2. Verify Firebase Admin SDK is properly configured
3. Check service account permissions
4. Review Firestore security rules
5. Ensure adequate Firestore quota

## Next Steps After Migration

Once migration is complete:

1. ✅ Update applicant detail pages to use new components
2. ✅ Add `PendingApprovals` to dashboards
3. ✅ Train users on new stage advancement workflow
4. ✅ Monitor commission triggers
5. ✅ Test approval workflows

See `STAGE_MANAGEMENT_QUICK_START.md` for integration steps.

---

**Migration Status:** Ready to run ✅  
**Backup Required:** Yes (recommended)  
**Reversible:** Yes (with backup)  
**Safe to Re-run:** Yes (idempotent for most operations)

