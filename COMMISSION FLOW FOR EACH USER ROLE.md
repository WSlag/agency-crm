# Commission Flow for Each User Role

## 📋 Overview

This document explains the complete commission workflow system, role-based permissions, and the automatic commission triggering mechanism in the Agency CRM.

---

## 🎯 Commission Split System

The system uses a **two-stage commission model** to incentivize agents throughout the recruitment pipeline:

### 1. Medical Placement Commission (50%)
- **Triggered when:** Applicant advances to **TRANSFER stage**
- **Amount:** 50% of agent's commission (₱25,000 if agent commission is ₱50,000)
- **Type:** `medical`
- **Status:** Starts as `pending`
- **Creator:** `system_auto_trigger`

### 2. Deployment Success Commission (50%)
- **Triggered when:** Applicant reaches **DEPLOYED stage**
- **Amount:** 50% of agent's commission (₱25,000 if agent commission is ₱50,000)
- **Type:** `deployed`
- **Status:** Starts as `pending`
- **Creator:** `system_auto_trigger`

### Why Two Commissions?
This split structure:
- ✅ Rewards early-stage progress (getting applicant to medical/transfer)
- ✅ Incentivizes completion (successful deployment)
- ✅ Provides cash flow to agents during long recruitment cycles
- ✅ Reduces risk for the agency (pay as milestones are achieved)

---

## 👥 Role-Based Commission Workflows

### 🔴 ADMIN (Full Control)

#### Capabilities
| Action | Permission |
|--------|-----------|
| Create Manual Commission Requests | ✅ Yes |
| Approve Commissions | ✅ Yes |
| Record Payments | ✅ Yes |
| View All Commissions | ✅ Yes |
| Edit/Delete Commissions | ✅ Yes |
| Override Any Action | ✅ Yes |

#### Workflow
VIEW COMMISSIONS
└─ Navigate to /commissions
└─ See all commissions across all branches
└─ Filter by type, status, date range
REVIEW COMMISSION DETAILS
└─ Click "View" on any commission
└─ See applicant information
└─ Review agent details
└─ Check commission calculation
PROCESS AUTO-TRIGGERED COMMISSIONS
└─ Commission status: pending
└─ requestedBy: system_auto_trigger
└─ Click "Record Payment" (no approval needed)
└─ Enter:
Payment amount (full or partial)
Payment date
Payment reference number
Notes (optional)
└─ Submit → Status changes to "paid" or "partially_paid"
PROCESS MANUAL COMMISSION REQUESTS
└─ Commission status: pending
└─ requestedBy: user_id (Branch Manager/HO Accountant)
└─ Click "Approve" first
└─ Status changes to: approved
└─ Then click "Record Payment"
└─ Enter payment details
└─ Submit → Status changes to "paid"
HANDLE PARTIAL PAYMENTS
└─ Click "Record Payment" on partially_paid commission
└─ Enter remaining balance payment
└─ View complete payment history
└─ Track installments


#### Access Levels
- 🌐 **View:** All commissions system-wide
- 📝 **Create:** Manual commission requests
- ✅ **Approve:** All pending commissions
- 💰 **Pay:** All approved/pending auto commissions
- 🔧 **Override:** Can modify any commission

---

### 🟣 PRESIDENT (Approval Authority)

#### Capabilities
| Action | Permission |
|--------|-----------|
| Create Manual Commission Requests | ❌ No |
| Approve Commissions | ✅ Yes |
| Record Payments | ✅ Yes |
| View All Commissions | ✅ Yes |
| Approve Transfer Stage | ✅ Yes (triggers Medical commission) |


#### Access Levels
- 🌐 **View:** All commissions system-wide
- 📝 **Create:** Manual commission requests
- ✅ **Approve:** All pending commissions
- 💰 **Pay:** All approved/pending auto commissions
- 🔧 **Override:** Can modify any commission

---

### 🟣 PRESIDENT (Approval Authority)

#### Capabilities
| Action | Permission |
|--------|-----------|
| Create Manual Commission Requests | ❌ No |
| Approve Commissions | ✅ Yes |
| Record Payments | ✅ Yes |
| View All Commissions | ✅ Yes |
| Approve Transfer Stage | ✅ Yes (triggers Medical commission) |

#### Workflow
DASHBOARD OVERVIEW
└─ See "Pending Commissions" widget
└─ Shows count of commissions awaiting action
└─ Click to navigate to commission list
REVIEW COMMISSIONS
└─ Navigate to /commissions
└─ Filter by status: "Pending"
└─ Review commission details
APPROVE TRANSFER STAGE (Triggers Commission)
└─ Applicant advances from Medical → Transfer
└─ President approves transfer
└─ System auto-creates Medical Commission (20%)
└─ Commission appears in pending list
PROCESS AUTO-TRIGGERED COMMISSIONS
└─ Open commission detail
└─ Verify applicant reached milestone
└─ Click "Record Payment" (no approval needed)
└─ Enter payment details
└─ Submit
APPROVE MANUAL REQUESTS
└─ Review commission request
└─ Check supporting documents
└─ Click "Approve" or "Reject"
└─ If approved, HO Accountant processes payment


#### Special Responsibilities
- **Transfer Approval:** Approves applicant transfers to Head Office
- **Commission Trigger:** Transfer approval automatically triggers 20% Medical commission
- **Strategic Oversight:** Reviews commission patterns and trends
- **Final Authority:** Can approve high-value commissions

---

### 🔵 HO ACCOUNTANT (Financial Processing)

#### Capabilities
| Action | Permission |
|--------|-----------|
| Create Manual Commission Requests | ✅ Yes (for HO agents) |
| Verify Commissions | ✅ Yes |
| Approve Commissions | ✅ Yes |
| Record Payments | ✅ Yes |
| View Financial Reports | ✅ Yes |
| Manage Partial Payments | ✅ Yes |

#### Workflow

##### PRIMARY COMMISSION PROCESSOR
STEP 1: RECEIVE NOTIFICATION
├─ System auto-creates commission when:
│ • Applicant reaches Transfer stage (Medical commission)
│ • Applicant reaches Deployed stage (Deployment commission)
├─ Dashboard shows notification badge
├─ Email notification sent (if configured)
└─ Commission appears in "Pending" list
STEP 2: VERIFY COMMISSION
├─ Open commission detail page
├─ Verify applicant information:
│ • Check applicant reached correct stage
│ • Confirm stage completion date
│ • Verify applicant ID and name
├─ Verify agent information:
│ • Confirm agent ID and name
│ • Check agent is active
│ • Verify branch assignment
├─ Review commission calculation:
│ • Base commission amount
│ • Commission percentage (20% or 80%)
│ • Final calculated amount
└─ Check for any discrepancies
STEP 3: PROCESS PAYMENT
├─ Click "Record Payment" button
├─ Choose payment type:
│ ┌─────────────────────────┐
│ │ ○ Full Payment │
│ │ Pay entire amount │
│ │ │
│ │ ○ Partial Payment │
│ │ Pay installment │
│ └─────────────────────────┘
├─ Enter payment details:
│ • Amount: ₱
│ • Payment Date: [Calendar]
│ • Reference Number: _
│ • Payment Method: [Dropdown]
│ • Notes: (Optional)
└─ Submit → Commission status updates
STEP 4: TRACK PAYMENTS
├─ For Full Payments:
│ └─ Status changes to: "Paid"
│ └─ Payment history recorded
│ └─ Commission closed
│
└─ For Partial Payments:
├─ Status changes to: "Partially Paid"
├─ Remaining balance calculated
├─ View payment history:
│ • Installment 1: ₱10,000 - Oct 17, 2025
│ • Installment 2: ₱15,000 - Oct 20, 2025
│ • Remaining: ₱25,000
└─ Can record subsequent payments


##### MANUAL COMMISSION CREATION
CREATE REQUEST FOR HO AGENT
└─ Navigate to /commissions
└─ Click "New Commission"
└─ Fill out form:
┌─────────────────────────────┐
│ Commission Type: [Dropdown] │
│ Agent: [Select HO Agent] │
│ Applicant: [Select] │
│ Amount: ₱ │
│ Reason: __ │
└─────────────────────────────┘
└─ Submit for Admin/President approval
TRACK STATUS
└─ Monitor approval status
└─ Process payment once approved


#### Best Practices
- ✅ Verify all commission details before payment
- ✅ Keep payment references organized
- ✅ Document any discrepancies
- ✅ Maintain regular payment schedules for partial payments
- ✅ Communicate payment status to agents
- ✅ Generate monthly commission reports

---

### 🟢 BRANCH MANAGER (Request Only)

#### Capabilities
| Action | Permission |
|--------|-----------|
| Create Manual Commission Requests | ✅ Yes (for branch agents only) |
| View Branch Commissions | ✅ Yes (branch scope) |
| Approve Commissions | ❌ No |
| Record Payments | ❌ No |
| Verify Commissions | ❌ No |

#### Workflow
REQUEST COMMISSION
├─ Navigate to /commissions
├─ Click "New Commission"
├─ Fill out request form:
│ ┌──────────────────────────────┐
│ │ Agent: [Branch Agent Only] │
│ │ Applicant: [Select] │
│ │ Commission Type: [Dropdown] │
│ │ Amount: ₱ │
│ │ Justification: │
│ │ Supporting Docs: [Upload] │
│ └──────────────────────────────┘
└─ Submit → Sends to Admin/President for approval
VIEW BRANCH COMMISSIONS
├─ See commissions for branch agents only
├─ Filter by:
│ • Agent name
│ • Status (pending, approved, paid)
│ • Date range
└─ Read-only access to commission details
MONITOR STATUS
├─ Check approval status
├─ View payment history (read-only)
├─ Cannot modify or approve
└─ Receive notifications when:
Commission approved
Payment processed
Commission rejected
STAGE APPROVALS (Auto-trigger commissions)
├─ Can approve INTERVIEW stage
├─ Can approve MEDICAL stage
├─ These approvals may trigger commissions
└─ But cannot process the commission payments


#### Limitations
- 🚫 **Cannot approve** commission requests
- 🚫 **Cannot record** payments
- 🚫 **Cannot view** other branch commissions
- 🚫 **Cannot edit** submitted requests
- ✅ **Can request** commissions for branch agents
- ✅ **Can view** status and payment history for own branch

#### Request Tips
- 📄 Attach supporting documentation
- 📝 Provide clear justification
- 💰 Ensure amount is reasonable
- 📅 Submit requests promptly
- 🔄 Follow up on pending approvals

---

## 🔄 Complete Commission Lifecycle

### Automatic Commission Flow (System-Triggered)
┌─────────────────────────────────────────────────────────────┐
│ AUTOMATIC COMMISSION FLOW │
└─────────────────────────────────────────────────────────────┘
STAGE 1: TRIGGER
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Applicant reaches TRANSFER stage
│ └─ System automatically creates:
│ ┌────────────────────────────────────┐
│ │ Medical Placement Commission │
│ │ • Type: medical │
│ │ • Amount: ₱25,000 (20%) │
│ │ • Status: pending │
│ │ • requestedBy: system_auto_trigger │
│ │ • Timestamp: [Auto] │
│ └────────────────────────────────────┘
│
└─ Applicant reaches DEPLOYED stage
└─ System automatically creates:
┌────────────────────────────────────┐
│ Deployment Success Commission │
│ • Type: deployed │
│ • Amount: ₱50,000 (80%) │
│ • Status: pending │
│ • requestedBy: system_auto_trigger │
│ • Timestamp: [Auto] │
└────────────────────────────────────┘
⬇️
STAGE 2: NOTIFICATION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ HO Accountant receives notification
├─ Dashboard shows pending count badge
├─ Commission appears in /commissions list
└─ Filtered by status: "Pending"
⬇️
STAGE 3: PAYMENT (No Approval Needed)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Admin / President / HO Accountant
├─ Opens commission detail
├─ Reviews and verifies
└─ Clicks "Record Payment"
├─ Option A: FULL PAYMENT
│ └─ Enter full amount → Status: paid ✅
│
└─ Option B: PARTIAL PAYMENT
├─ Enter partial amount
├─ Status: partially_paid 🟡
├─ Balance tracked
└─ Can record subsequent payments
⬇️
STAGE 4: COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Status: paid ✅
├─ Payment history recorded
├─ Agent receives commission
└─ Workflow complete


### Manual Commission Flow (User-Requested)
┌─────────────────────────────────────────────────────────────┐
│ MANUAL COMMISSION FLOW │
└─────────────────────────────────────────────────────────────┘
STAGE 1: REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Branch Manager / HO Accountant / Admin
├─ Navigates to /commissions/request
├─ Fills out commission request form
└─ Submits → Status: pending
┌────────────────────────────────────┐
│ Manual Commission Request │
│ • requestedBy: [user_id] │
│ • Status: pending │
│ • Requires approval ⏳ │
└────────────────────────────────────┘
⬇️
STAGE 2: VERIFY (Optional)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ HO Accountant reviews
├─ Checks documentation
├─ Verifies calculations
└─ Status: verified (optional step)
⬇️
STAGE 3: APPROVE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ Admin or President reviews
├─ Clicks "Approve" or "Reject"
└─ If approved:
├─ Status: approved ✅
└─ Ready for payment
If rejected:
├─ Status: rejected ❌
└─ Reason recorded
⬇️
STAGE 4: PAYMENT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
├─ HO Accountant / Admin / President
├─ Clicks "Record Payment"
└─ Enters payment details
└─ Status: paid or partially_paid
⬇️
STAGE 5: COMPLETION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
└─ Status: paid ✅
├─ Workflow complete
├─ Payment history recorded
└─ Agent notified


---

## 📊 Permission Matrix

| Role | Create Request | Verify | Approve | Record Payment | View All | Edit/Delete |
|------|----------------|--------|---------|----------------|----------|-------------|
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes |
| **President** | ❌ No | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **HO Accountant** | ✅ Yes* | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Branch Manager** | ✅ Yes** | ❌ No | ❌ No | ❌ No | 🟡 Branch Only | ❌ No |
| **HO Recruitment Officer** | ❌ No | ❌ No | ❌ No | ❌ No | 🟡 View Only | ❌ No |

\* HO Accountant can create requests for HO agents only  
\** Branch Manager can create requests for branch agents only

---

## 🎯 Commission Status Flow
─────────┐
│ PENDING │ ← Commission created (auto or manual)
└────┬─────┘
│
├─→ [Auto-triggered] ─→ Record Payment ─→ PAID/PARTIALLY_PAID
│
└─→ [Manual request] ─→ Approve/Reject
│
├─→ APPROVED → Record Payment → PAID
│
└─→ REJECTED (Terminal)
Status Definitions:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PENDING - Awaiting approval or payment
VERIFIED - Verified by HO Accountant (optional)
APPROVED - Approved for payment
REJECTED - Request denied (terminal)
PARTIALLY_PAID - Partial payment made, balance remaining
PAID - Fully paid (terminal)


---

## 💡 Common Scenarios

### Scenario 1: Auto-Triggered Medical Commission
Applicant: Marie Fe Kalim
Agent: Dora Dalton
Event: Advanced to Transfer stage
Action:
System creates Medical commission (₱25,000)
HO Accountant receives notification
HO Accountant verifies details
HO Accountant clicks "Record Payment"
Enters full amount ₱25,000
Status changes to: paid ✅


### Scenario 2: Auto-Triggered Deployment Commission
Applicant: Marie Fe Kalim
Agent: Dora Dalton
Event: Reached Deployed stage
Action:
System creates Deployment commission (₱50,000)
President reviews commission
President clicks "Record Payment"
Chooses "Partial Payment"
Pays ₱30,000 first
Status: partially_paid (₱20,000 remaining)
Later, records second payment ₱20,000
Status changes to: paid ✅


### Scenario 3: Manual Commission Request
Requester: Branch Manager
Agent: Sara Recto (branch agent)
Reason: Special referral bonus
Action:
Branch Manager creates commission request
Enters amount: ₱10,000
Provides justification
Submits for approval
Admin reviews and approves
HO Accountant records payment
Status: paid ✅


---

## 🚀 Quick Reference Guide

### For HO Accountants (Daily Tasks)
MORNING ROUTINE:
Login to dashboard
Check "Pending Commissions" count
Navigate to /commissions
Filter: Status = "Pending"
Process each commission:
Click "View"
Verify details
Click "Record Payment"
Enter payment info
Submit
WEEKLY TASKS:
Review partially paid commissions
Follow up on remaining balances
Generate commission reports
Communicate with agents
MONTHLY TASKS:
Reconcile all payments
Generate monthly commission report
Review commission trends
Report to Admin/President


### For Branch Managers
WHEN TO REQUEST COMMISSION:
Special agent achievements
Referral bonuses
Performance incentives
Exceptional service
HOW TO REQUEST:
Go to /commissions
Click "New Commission"
Select your branch agent
Enter amount and reason
Attach supporting docs
Submit
Monitor status
WHAT TO TRACK:
Request approval status
Payment processing
Agent notifications
Commission history


### For Admins/Presidents
APPROVAL WORKFLOW:
Review pending manual requests
Check justification
Verify documentation
Approve or reject with reason
Monitor payment processing
PAYMENT WORKFLOW:
Can pay any approved commission
Can pay pending auto-triggered commissions
Choose full or partial payment
Record payment details
Track payment history
OVERSIGHT:
Monitor commission patterns
Review rejection reasons
Ensure timely payments
Generate analytics


---

## 🔐 Security & Compliance

### Access Control
- ✅ Role-based permissions enforced at API level
- ✅ Firestore security rules validate user roles
- ✅ UI buttons hidden based on permissions
- ✅ Audit trail for all commission actions

### Audit Trail
Every commission action is logged:
```typescript
{
  action: 'payment_recorded',
  commissionId: 'abc123',
  performedBy: 'user_id',
  timestamp: '2025-10-18T10:30:00Z',
  details: {
    amount: 25000,
    paymentType: 'full',
    reference: 'REF-001'
  }
}
```

### Data Integrity
- ✅ Commission amounts validated
- ✅ Payment dates verified
- ✅ Balance calculations automatic
- ✅ Status transitions validated
- ✅ Original branch/agent preserved after transfers

---

## 📞 Support

### Common Issues

**Q: Why are there 2 commissions for one applicant?**  
A: The system splits commissions into Medical (20%) and Deployment (80%) to reward progress at different stages.

**Q: Can I approve my own commission request?**  
A: No, Branch Managers cannot approve their own requests. Admin or President must approve.

**Q: What's the difference between "Approve" and "Record Payment"?**  
A: "Approve" authorizes the commission. "Record Payment" marks it as paid. Auto-triggered commissions can be paid directly without approval.

**Q: Can I modify a commission after approval?**  
A: Only Admins can modify commissions. Contact your system administrator for changes.

**Q: How do partial payments work?**  
A: You can pay commissions in installments. The system tracks each payment and calculates the remaining balance automatically.

---

## 📝 Document Version

- **Version:** 1.0
- **Last Updated:** October 18, 2025
- **Maintained By:** System Administrator
- **Related Docs:** 
  - STAGE_MANAGEMENT_IMPLEMENTATION.md
  - COMMISSION_PAYMENT_BUTTON_FIX.md
  - PARTIAL_PAYMENT_FEATURE_IMPLEMENTATION.md

---

## ✅ Checklist for New Users

### For HO Accountants
- [ ] Understand commission types (medical vs deployed)
- [ ] Know how to verify commission details
- [ ] Practice recording full payments
- [ ] Practice recording partial payments
- [ ] Learn to view payment history
- [ ] Understand notification system

### For Branch Managers
- [ ] Know when to request commissions
- [ ] Understand approval requirements
- [ ] Learn to track request status
- [ ] Know limitations (cannot approve/pay)
- [ ] Understand branch scope restrictions

### For Admins/Presidents
- [ ] Understand full system capabilities
- [ ] Know approval workflows
- [ ] Learn payment processing
- [ ] Understand override capabilities
- [ ] Review audit trails regularly

---

*End of Commission Flow Documentation*

Data Integrity
✅ Commission amounts validated
✅ Payment dates verified
✅ Balance calculations automatic
✅ Status transitions validated
✅ Original branch/agent preserved after transfers
📞 Support
Common Issues
Q: Why are there 2 commissions for one applicant?
A: The system splits commissions into Medical (20%) and Deployment (80%) to reward progress at different stages.
Q: Can I approve my own commission request?
A: No, Branch Managers cannot approve their own requests. Admin or President must approve.
Q: What's the difference between "Approve" and "Record Payment"?
A: "Approve" authorizes the commission. "Record Payment" marks it as paid. Auto-triggered commissions can be paid directly without approval.
Q: Can I modify a commission after approval?
A: Only Admins can modify commissions. Contact your system administrator for changes.
Q: How do partial payments work?
A: You can pay commissions in installments. The system tracks each payment and calculates the remaining balance automatically.
📝 Document Version
Version: 1.0
Last Updated: October 18, 2025
Maintained By: System Administrator
Related Docs:
STAGE_MANAGEMENT_IMPLEMENTATION.md
COMMISSION_PAYMENT_BUTTON_FIX.md
PARTIAL_PAYMENT_FEATURE_IMPLEMENTATION.md
✅ Checklist for New Users
For HO Accountants
[ ] Understand commission types (medical vs deployed)
[ ] Know how to verify commission details
[ ] Practice recording full payments
[ ] Practice recording partial payments
[ ] Learn to view payment history
[ ] Understand notification system
For Branch Managers
[ ] Know when to request commissions
[ ] Understand approval requirements
[ ] Learn to track request status
[ ] Know limitations (cannot approve/pay)
[ ] Understand branch scope restrictions
For Admins/Presidents
[ ] Understand full system capabilities
[ ] Know approval workflows
[ ] Learn payment processing
[ ] Understand override capabilities
[ ] Review audit trails regularly
End of Commission Flow Documentation