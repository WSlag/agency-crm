# HO Recruitment Officer Assignment Guide

**Date:** October 19, 2025  
**Status:** ✅ **COMPLETE WORKFLOW GUIDE**

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Who Assigns Applicants](#who-assigns-applicants)
3. [When Assignment Happens](#when-assignment-happens)
4. [How to Assign Applicants](#how-to-assign-applicants)
5. [Assignment Workflow](#assignment-workflow)
6. [After Assignment](#after-assignment)
7. [Permissions Matrix](#permissions-matrix)
8. [Troubleshooting](#troubleshooting)

---

## 📖 Overview

HO (Head Office) Recruitment Officers are assigned to applicants when the applicant is **transferred from a branch to the Head Office**. This assignment determines which HO Recruitment Officer will be responsible for managing that applicant through the remaining stages (Processing, Deployment, and Deployed).

### Key Points:
- ✅ Assignment happens **during transfer approval**
- ✅ Only **Admin and President** can assign (HO Officers CANNOT assign)
- ✅ Assignment is **required** to approve a transfer
- ✅ Once assigned, the HO Officer manages the applicant through all HO stages

---

## 👥 Who Assigns Applicants

### Users Who Can Assign HO Recruitment Officers:

| Role | Can Assign? | When? |
|------|------------|-------|
| **Admin** | ✅ Yes | During transfer approval |
| **President** | ✅ Yes | During transfer approval |
| **HO Recruitment Officer** | ❌ No | Cannot assign (only Admin/President) |
| **Branch Manager** | ❌ No | Cannot assign HO officers |
| **HO Accountant** | ❌ No | Cannot assign HO officers |

### Important Notes:

1. **ONLY Admin and President** have full authority to assign any HO Recruitment Officer
2. **HO Recruitment Officers CANNOT**:
   - Assign themselves to applicants
   - Assign applicants to other HO Recruitment Officers
   - Approve transfer requests
3. **Branch Managers** request the transfer but **cannot** choose which HO Officer gets assigned
4. **Assignment is restricted** to ensure proper oversight and workload management by administrators

---

## ⏰ When Assignment Happens

### Assignment Occurs During the Transfer Stage

**Stage Flow:**
```
Branch Stages (Branch Manager manages)
↓
Registration → Interview → Medical
↓
[TRANSFER REQUEST]
↓
Admin/President/HO Officer Approves & Assigns
↓
Head Office Stages (HO Recruitment Officer manages)
↓
Transfer → Processing → Deployment → Deployed
```

### Trigger Points:

1. **Branch Manager** completes Medical stage
2. **Branch Manager** requests transfer to Head Office
3. **System** creates a pending transfer approval
4. **Admin/President/HO Officer** reviews the transfer request
5. **During approval**, they **MUST** select an HO Recruitment Officer
6. **System** assigns the applicant to the selected officer
7. **HO Officer** takes over management from that point

---

## 🔧 How to Assign Applicants

### Step-by-Step Assignment Process

#### **For Admin/President:**

### Step 1: Access Pending Transfers

**Navigation:**
1. Log in as Admin or President
2. Go to **Dashboard**
3. Look for **"Pending Stage Approvals"** section
4. Or navigate to **Applicants** → Click on applicant → **Transfer Management**

**What You'll See:**
- List of applicants waiting for transfer approval
- Applicant name, branch, and request date
- Transfer reason and notes from Branch Manager

---

### Step 2: Review Transfer Request

**Transfer Request Details:**

```
┌─────────────────────────────────────────────────┐
│  Transfer Request Details                       │
├─────────────────────────────────────────────────┤
│  Request Date:     Oct 19, 2025                 │
│  Requested By:     [Branch Manager Name]        │
│  From Branch:      Cotabato Branch              │
│  Reason:           Medical completed, ready for │
│                    processing                    │
│  Notes:            All documents verified and   │
│                    complete                      │
└─────────────────────────────────────────────────┘
```

**Review Checklist:**
- ✅ Applicant has completed Medical stage
- ✅ All required documents are uploaded
- ✅ Medical examination passed
- ✅ Transfer reason is valid
- ✅ Branch Manager notes are clear

---

### Step 3: Select HO Recruitment Officer

**Assignment Dropdown:**

```
┌─────────────────────────────────────────────────┐
│  Assign Recruitment Officer                     │
├─────────────────────────────────────────────────┤
│  [Select an officer ▼]                          │
│    - John Doe (HO Recruitment Officer)          │
│    - Maria Santos (HO Recruitment Officer)      │
│    - Pedro Cruz (HO Recruitment Officer)        │
│    - [Your name] (Self-assign)                  │
└─────────────────────────────────────────────────┘
```

**Selection Criteria:**

Consider the following when assigning:

1. **Officer Workload**
   - Check how many applicants each officer is currently managing
   - Distribute applicants evenly to avoid overloading

2. **Officer Expertise**
   - Some officers may specialize in certain countries or positions
   - Match applicant's destination with officer's expertise

3. **Officer Availability**
   - Check if officer is on leave or has limited availability
   - Ensure officer can actively manage the applicant

4. **Fair Distribution**
   - Rotate assignments among available officers
   - Consider officer performance and capacity

---

### Step 4: Approve Transfer and Assign

**Approval Process:**

1. Select the HO Recruitment Officer from dropdown
2. Click **"Approve Transfer"** button
3. System will:
   - Update applicant status to "Transfer" stage
   - Assign applicant to selected HO Officer
   - Set `assignedRecruitmentOfficerId` field
   - Set `transferredToHO` flag to `true`
   - Record transfer date
   - Send notifications

**Confirmation Message:**
```
✅ Transfer approved successfully!
   Applicant assigned to [Officer Name]
```

---

### Alternative: Reject Transfer

If the transfer request is not ready:

1. Click **"Reject Transfer"** button
2. Enter a clear rejection reason:
   - "Medical documents incomplete"
   - "Waiting for additional verification"
   - "Applicant needs to complete X before transfer"
3. Click **"Confirm Rejection"**
4. System sends notification to Branch Manager with reason

---

## 🔄 Assignment Workflow

### Complete Workflow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│  Branch Manager (Cotabato Branch)                           │
├─────────────────────────────────────────────────────────────┤
│  1. Creates applicant                                       │
│  2. Manages through Registration → Interview → Medical      │
│  3. Completes Medical stage documents                       │
│  4. Clicks "Advance to Transfer"                            │
│  5. System creates transfer request (status: pending)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Admin / President ONLY                                     │
├─────────────────────────────────────────────────────────────┤
│  1. Sees "Pending Stage Approvals" notification             │
│  2. Reviews transfer request details                        │
│  3. Checks applicant documents and Medical status           │
│  4. Selects HO Recruitment Officer from dropdown            │
│  5. Clicks "Approve Transfer"                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  System Actions (Automatic)                                 │
├─────────────────────────────────────────────────────────────┤
│  1. Updates applicant:                                      │
│     - currentStage: 'transfer'                              │
│     - assignedRecruitmentOfficerId: [selected officer ID]   │
│     - transferredToHO: true                                 │
│     - transferredDate: [current timestamp]                  │
│  2. Updates transfer status: 'approved'                     │
│  3. Creates stage history record                            │
│  4. Triggers 1st commission payment (Medical stage)         │
│  5. Sends notifications:                                    │
│     - To Branch Manager: "Transfer approved"                │
│     - To assigned HO Officer: "New applicant assigned"      │
│     - To Admin: "Transfer completed"                        │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│  Assigned HO Recruitment Officer                            │
├─────────────────────────────────────────────────────────────┤
│  1. Receives notification of new assignment                 │
│  2. Sees applicant in their dashboard                       │
│  3. Takes over management from Transfer stage onwards       │
│  4. Manages: Transfer → Processing → Deployment → Deployed  │
│  5. Uploads and verifies documents for each stage           │
│  6. Cannot approve Processing/Deployment (Admin/President)  │
└─────────────────────────────────────────────────────────────┘
```

---

## ✅ After Assignment

### What Happens After Assignment?

#### For the Assigned HO Recruitment Officer:

1. **Dashboard Updates:**
   - Applicant appears in "My Applicants" list
   - Applicant shows in "Assigned to Me" filter
   - Workload count increases

2. **Responsibilities:**
   - Manage applicant through Transfer, Processing, Deployment stages
   - Upload and verify required documents
   - Coordinate with employers and agencies
   - Keep applicant status updated

3. **Access Permissions:**
   - ✅ Can view full applicant profile
   - ✅ Can upload documents
   - ✅ Can verify documents
   - ✅ Can update applicant information
   - ✅ Can request stage advancement (but only Admin/President approve Processing/Deployment)
   - ❌ Cannot approve their own stage advancement requests

#### For the Branch Manager:

1. **Access Level Changes:**
   - ✅ Can still view applicant profile (read-only)
   - ✅ Can see stage progress
   - ❌ Can no longer edit applicant information
   - ❌ Can no longer upload documents
   - ❌ Can no longer manage stages

2. **Notifications Received:**
   - Transfer approval confirmation
   - Assigned officer name
   - Future stage milestone updates

#### For the Applicant Record:

**Before Assignment:**
```json
{
  "id": "applicant-123",
  "fullName": "Juan Dela Cruz",
  "currentStage": "medical",
  "transferredToHO": false,
  "assignedRecruitmentOfficerId": null,
  "branchId": "cotabato-branch"
}
```

**After Assignment:**
```json
{
  "id": "applicant-123",
  "fullName": "Juan Dela Cruz",
  "currentStage": "transfer",
  "transferredToHO": true,
  "transferredDate": "2025-10-19T10:30:00Z",
  "assignedRecruitmentOfficerId": "officer-456",
  "branchId": "cotabato-branch"
}
```

---

## 🔐 Permissions Matrix

### Stage Management After Assignment

| Stage | Managed By | Can Approve | Assigned HO Officer Role |
|-------|-----------|-------------|------------------------|
| **Registration** | Branch Manager | Branch Manager, Admin | Not involved |
| **Interview** | Branch Manager | HO Officer, Admin | Can approve if requested |
| **Medical** | Branch Manager | HO Officer, Admin | Can approve if requested |
| **Transfer** | Admin/President/HO Officer | Admin, President, HO Officer | **Assigns during approval** |
| **Processing** | HO Officer | Admin, President | Manages, requests approval |
| **Deployment** | HO Officer | Admin, President | Manages, requests approval |
| **Deployed** | HO Officer | Admin, President | Final stage management |

### Access Permissions After Assignment

| Action | Admin | President | HO Officer (Assigned) | HO Officer (Not Assigned) | Branch Manager |
|--------|-------|-----------|---------------------|------------------------|----------------|
| View Applicant | ✅ | ✅ | ✅ | ✅ | ✅ (read-only) |
| Edit Applicant | ✅ | ✅ | ✅ | ❌ | ❌ |
| Upload Documents | ✅ | ✅ | ✅ | ❌ | ❌ |
| Verify Documents | ✅ | ✅ | ✅ | ✅ | ❌ |
| Request Stage Advancement | ✅ | ✅ | ✅ | ❌ | ❌ |
| Approve Stage Advancement | ✅ | ✅ | ❌ (Transfer only) | ❌ | ❌ |
| Re-assign Officer | ✅ | ✅ | ❌ | ❌ | ❌ |

---

## 🔍 How to View Assigned Applicants

### For HO Recruitment Officers:

#### Method 1: Dashboard View

1. Log in as HO Recruitment Officer
2. Go to **Dashboard**
3. View **"My Applicants"** section
4. See count and list of assigned applicants

**Dashboard Display:**
```
┌─────────────────────────────────────────────────┐
│  My Applicants (12)                             │
├─────────────────────────────────────────────────┤
│  • Juan Dela Cruz     - Transfer    - Oct 19    │
│  • Maria Santos       - Processing  - Oct 18    │
│  • Pedro Reyes        - Deployment  - Oct 17    │
│  • [View All →]                                 │
└─────────────────────────────────────────────────┘
```

#### Method 2: Applicants List with Filter

1. Navigate to **Applicants** page
2. Click **"Assigned Officer"** filter dropdown
3. Select **"[Your Name]"**
4. See all applicants assigned to you

**Filter Display:**
```
Filters: [All Branches ▼] [All Stages ▼] [Assigned to Me ▼]
```

#### Method 3: Reports

1. Navigate to **Reports** → **Officer Performance**
2. Select your name from officer dropdown
3. View detailed performance metrics:
   - Total assigned applicants
   - Applicants by stage
   - Pending documents
   - Completion rate

---

## 🛠️ Troubleshooting

### Common Issues and Solutions

#### Issue 1: Cannot See Transfer Request

**Problem:** Admin/President doesn't see pending transfer requests

**Possible Causes:**
1. Transfer status is not "pending"
2. Firestore permissions blocking read access
3. Browser cache issue

**Solution:**
```bash
# 1. Check transfer status in Firestore
# Should be: { transferStatus: 'pending' }

# 2. Refresh browser (hard refresh)
Ctrl + Shift + R (Windows)
Cmd + Shift + R (Mac)

# 3. Check Firestore console for pending transfers
# Collection: transfers
# Filter: transferStatus == 'pending'
```

---

#### Issue 2: No HO Officers in Dropdown

**Problem:** Officer dropdown is empty when approving transfer

**Possible Causes:**
1. No HO Recruitment Officers created in system
2. All HO Officers are set to "inactive" status
3. Firestore query not returning results

**Solution:**
1. **Check Users Collection:**
   ```
   Navigate to: Admin Panel → Users
   Filter by: role == 'ho_recruitment_officer'
   Status: Active
   ```

2. **Create HO Recruitment Officer if needed:**
   ```
   1. Go to Admin Panel → Users → Add User
   2. Fill in details:
      - Name: [Officer Name]
      - Email: [officer@example.com]
      - Role: HO Recruitment Officer
      - Status: Active
   3. Click "Create User"
   ```

3. **Activate Inactive Officers:**
   ```
   1. Find officer in Users list
   2. Click "Edit"
   3. Change Status to "Active"
   4. Click "Save"
   ```

---

#### Issue 3: Cannot Approve Transfer

**Problem:** "Approve Transfer" button is disabled or shows error

**Possible Causes:**
1. No officer selected in dropdown
2. Insufficient permissions
3. Applicant not at correct stage
4. Firestore rules blocking update

**Solution:**
1. **Select an officer first** - Button only enables after selection
2. **Check your role** - Must be Admin, President, or HO Officer
3. **Verify applicant stage** - Must be at Medical stage
4. **Check Firestore rules:**
   ```typescript
   // firestore.rules - should allow transfer approval
   allow update: if isAdmin() || 
                    isPresident() || 
                    isHORecruitmentOfficer();
   ```

---

#### Issue 4: Assignment Not Saving

**Problem:** Officer is selected and approved, but assignment doesn't save

**Possible Causes:**
1. Firestore security rules blocking update
2. Network connectivity issue
3. Missing `assignedRecruitmentOfficerId` field

**Solution:**
1. **Check browser console for errors:**
   ```
   F12 → Console tab
   Look for: "FirebaseError" or "Permission denied"
   ```

2. **Verify Firestore rules:**
   ```typescript
   // firestore.rules
   match /applicants/{applicantId} {
     allow update: if isAdmin() || 
                     isPresident() || 
                     isHORecruitmentOfficer();
   }
   ```

3. **Check network connectivity:**
   ```
   Network tab in browser DevTools
   Look for failed requests to Firestore
   ```

---

#### Issue 5: HO Officer Can't See Assigned Applicants

**Problem:** After assignment, HO Officer doesn't see applicant in their list

**Possible Causes:**
1. Assignment didn't save properly
2. Filter is set incorrectly
3. Dashboard not refreshed
4. Firestore query issue

**Solution:**
1. **Check Applicant Record in Firestore:**
   ```
   Collection: applicants
   Document: [applicant-id]
   Field: assignedRecruitmentOfficerId
   Value: Should match HO Officer's UID
   ```

2. **Refresh Dashboard:**
   ```
   Hard refresh: Ctrl + Shift + R
   Or click "Refresh" button on dashboard
   ```

3. **Check Filters:**
   ```
   Navigate to: Applicants page
   Filters: Remove all filters
   Then apply: "Assigned to Me"
   ```

4. **Verify Query in Code:**
   ```typescript
   // Should query by assignedRecruitmentOfficerId
   where('assignedRecruitmentOfficerId', '==', currentUser.uid)
   ```

---

## 📊 Best Practices

### Assignment Best Practices

1. **Balanced Workload Distribution**
   - Check officer workloads before assigning
   - Aim for even distribution across all HO officers
   - Don't overload a single officer

2. **Match Expertise**
   - Assign based on destination country expertise
   - Consider officer's language skills
   - Match position specialization

3. **Clear Communication**
   - Add notes during assignment explaining any special considerations
   - Notify officer directly if urgent
   - Keep records of assignment decisions

4. **Quick Assignment**
   - Process transfer requests within 24-48 hours
   - Don't let applicants wait too long at Transfer stage
   - Set up daily review routine

5. **Documentation**
   - Keep track of why certain officers were assigned
   - Document any workload balancing decisions
   - Note any special circumstances

---

## 📈 Monitoring Assignments

### For Admins/Presidents: Track Assignment Distribution

**Steps to Monitor:**

1. **Navigate to Reports:**
   ```
   Reports → Officer Performance
   ```

2. **View Metrics:**
   - Total applicants per officer
   - Active applicants per officer
   - Completion rates
   - Average processing time

3. **Identify Imbalances:**
   ```
   Officer A: 20 applicants (overloaded)
   Officer B: 15 applicants (balanced)
   Officer C: 5 applicants (underutilized)
   
   Action: Assign new applicants to Officer C
   ```

4. **Regular Reviews:**
   - Weekly review of officer workloads
   - Monthly performance analysis
   - Quarterly capacity planning

---

## 🎯 Quick Reference

### Assignment Checklist

**Before Approving Transfer:**
- [ ] Review applicant's Medical stage completion
- [ ] Verify all required documents uploaded
- [ ] Check document verification status
- [ ] Review Branch Manager's transfer notes
- [ ] Check HO officer availability and workload

**During Transfer Approval:**
- [ ] Select appropriate HO Recruitment Officer
- [ ] Consider officer expertise and workload
- [ ] Add any special notes for the officer
- [ ] Click "Approve Transfer"
- [ ] Confirm assignment success message

**After Assignment:**
- [ ] Verify officer received notification
- [ ] Check applicant appears in officer's list
- [ ] Confirm `assignedRecruitmentOfficerId` is set
- [ ] Monitor officer follows up with applicant
- [ ] Track stage progression

---

## 📞 Support

### Need Help?

**For Assignment Issues:**
- Contact: System Administrator
- Email: admin@agency.com
- Check: Firestore console for data verification

**For Training:**
- Request: Assignment workflow training
- Access: User guides and documentation
- Practice: Use test environment first

---

## 🔗 Related Documentation

- [HO Recruitment Officer Complete Fix Report](HO_RECRUITMENT_OFFICER_COMPLETE_FIX_REPORT.md)
- [HO Officer Stage Approval Clarification](HO_OFFICER_STAGE_APPROVAL_CLARIFICATION.md)
- [Stage Approval Workflow Implementation](STAGE_APPROVAL_WORKFLOW_IMPLEMENTATION.md)
- [Stage Management Quick Start](STAGE_MANAGEMENT_QUICK_START.md)

---

## 📝 Summary

### Key Takeaways:

1. ✅ **Who Assigns:** Admin, President, or HO Recruitment Officer
2. ✅ **When:** During transfer approval (Medical → Transfer stage)
3. ✅ **How:** Select officer from dropdown when approving transfer
4. ✅ **Required:** Must select an officer to complete transfer approval
5. ✅ **Result:** Applicant is assigned and officer takes over management

### Assignment Flow:
```
Branch Manager Requests Transfer 
    ↓
Admin/President/HO Officer Reviews
    ↓
Selects HO Recruitment Officer
    ↓
Approves Transfer
    ↓
System Assigns Applicant
    ↓
HO Officer Manages Through HO Stages
```

---

**Document Status:** ✅ **COMPLETE**  
**Last Updated:** October 19, 2025  
**Version:** 1.0


