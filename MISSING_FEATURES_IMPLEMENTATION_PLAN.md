# Missing Features Implementation Plan

## 📋 Overview
This document provides a comprehensive implementation plan for missing and partial features identified in the codebase analysis against `implementationPlan.md` Section 7 (Key Features by Module).

---

## ✅ EXISTING FEATURES - UI LOCATIONS

### 1. **HO Recruitment Officer: Assigned Applicants Overview**
**Status:** ✅ COMPLETE

**UI Location:**
- **Path:** `/officers` (when logged in as HO Recruitment Officer)
- **Component:** `src/components/officers/OfficerDashboard.tsx`
- **Features:**
  - Statistics cards (Total Assigned, Active Applicants, Pending Documents, Deployment Ready)
  - List of assigned applicants with stage and status
  - Quick links to applicant profiles
  - Performance metrics

**Access:**
- Role: `ho_recruitment_officer`
- Navigate to: Main Dashboard → "My Applicants" Quick Action → Shows OfficerDashboard

---

### 2. **Transfer Requests Pending (Admin/President)**
**Status:** ✅ COMPLETE

**UI Location:**
- **Path:** `/` (Dashboard - visible to Admin/President)
- **Component:** `src/pages/dashboard/Dashboard.tsx` (PendingTasksWidget)
- **Features:**
  - Shows count of pending transfers
  - Click navigates to `/applicants/transfers`
  - Displays pending expenses and commissions too

**Access:**
- Role: `admin`, `president`
- Navigate to: Main Dashboard → "Pending Tasks" widget → Click "Transfers"

**Full Transfer Management:**
- **Path:** `/applicants/transfers`
- **Component:** `src/pages/applicants/TransfersList.tsx`
- Filterable by status (pending, approved, completed)

---

### 3. **My Assigned Applicants (HO Recruitment Officer)**
**Status:** ✅ COMPLETE

**UI Location:**
- **Primary Path:** `/officers`
- **Component:** `src/pages/officers/OfficerManagement.tsx`
- **Features:**
  - Shows HO Recruitment Officer's own dashboard when logged in as officer
  - Displays `OfficerDashboard` component
  - Lists all assigned applicants with filtering
  - Performance metrics

**Secondary Access:**
- **Path:** `/applicants` (filtered view)
- Can see all applicants where `assignedRecruitmentOfficerId === user.uid`

---

### 4. **Document Checklist**
**Status:** ✅ COMPLETE

**UI Location:**
- **Path:** `/applicants/:id` (Applicant Profile)
- **Component:** `src/components/documents/DocumentList.tsx`
- **Features:**
  - List of all required documents by stage
  - Upload status (pending, verified, expired)
  - Document verification interface
  - Expiry tracking

**Access:**
- Navigate to: Applicants → Select Applicant → Documents Tab

**Additional Document Views:**
- **Documents Dashboard:** `/applicants/documents`
- **Component:** `src/pages/applicants/DocumentsDashboard.tsx`
- Shows all documents across all applicants with filtering

---

### 5. **Expense Tracking Per Applicant**
**Status:** ✅ COMPLETE

**UI Location:**
- **Path:** `/applicants/:id` (Applicant Profile - Expenses tab)
- **Store:** `src/stores/expenseStore.ts`
- **Features:**
  - Filter expenses by `applicantId`
  - View all expenses related to specific applicant
  - Track expense status (pending, verified, approved)

**Access:**
- Navigate to: Applicants → Select Applicant → Expenses Section

**Global Expense View:**
- **Path:** `/expenses`
- **Component:** `src/pages/expenses/ExpensesPage.tsx`
- Can filter by applicant

---

### 6. **Permission Management**
**Status:** ✅ COMPLETE

**UI Location:**
- **Component:** `src/components/auth/RoleGuard.tsx`
- **Implementation:** Role-based access control throughout the app
- **Features:**
  - Route-level protection
  - Component-level guards
  - Action-level permissions

**User Role Management:**
- **Path:** `/users` (Admin only)
- **Component:** `src/pages/admin/users/UserManagement.tsx`
- Assign roles, branches, and permissions

**Configuration:**
- **File:** `src/config/routes.ts`
- Defines role requirements for each route

---

### 7. **Approval Workflow Interface (Expenses)**
**Status:** ✅ COMPLETE

**UI Location:**
- **Component:** `src/components/expenses/ExpenseApproval.tsx`
- **Access Path:** `/expenses` → Select Expense → Approve/Reject
- **Features:**
  - Approval/rejection interface
  - Notes and comments
  - Amount verification
  - Receipt review
  - Approval history

**Workflow:**
1. Branch Manager submits expense
2. HO Accountant verifies
3. Admin/President approves
4. Payment recorded

---

### 8. **Commission Request Interface**
**Status:** ✅ COMPLETE

**UI Location:**
- **Component:** `src/components/commissions/CommissionRequestForm.tsx`
- **Access Path:** `/commissions/new`
- **Features:**
  - Commission calculation
  - Agent selection
  - Applicant linking
  - Rate configuration
  - Amount calculation

**Access:**
- Navigate to: Commissions → "Request Commission" button

---

### 9. **Approval Workflow (Commissions)**
**Status:** ✅ COMPLETE

**UI Location:**
- **Path:** `/commissions`
- **Component:** `src/components/commissions/CommissionApproval.tsx`
- **Store:** `src/stores/commissionStore.ts`
- **Features:**
  - Three-stage approval (Request → Verify → Approve)
  - Status tracking (pending, verified, approved, paid)
  - Payment recording

**Workflow:**
1. Branch/Agent requests commission
2. HO Accountant verifies
3. Admin/President approves
4. HO Accountant marks as paid

---

### 10. **Original Branch/Agent Commission Tracking After Transfer**
**Status:** ⚠️ PARTIAL - Data exists, UI indicator needed

**Current Implementation:**
- **Data:** Commissions table has `branchId` and `agentId` fields
- **Schema:** `src/types/commission.ts`
- **Preservation:** Original branch/agent IDs are preserved even after applicant transfer

**Missing:** Visual UI indicator showing commission belongs to original branch/agent

---

## ❌ MISSING FEATURES - IMPLEMENTATION REQUIRED

### 1. **Communication History (7.2 Applicants Module)**
**Priority:** HIGH

**Description:**
Track all communication with applicants (emails, SMS, calls, notes)

**Implementation Plan:**

#### A. Create Communication Types
```typescript
// File: src/types/communication.ts
export interface Communication {
  id: string;
  applicantId: string;
  type: 'email' | 'sms' | 'call' | 'note' | 'in-app';
  subject?: string;
  content: string;
  direction: 'inbound' | 'outbound';
  status: 'sent' | 'delivered' | 'failed' | 'read';
  createdBy: string;
  createdAt: Date;
  metadata: {
    recipient?: string;
    sender?: string;
    phoneNumber?: string;
    emailAddress?: string;
    attachments?: string[];
  };
}
```

#### B. Create Communication Store
```typescript
// File: src/stores/communicationStore.ts
- Actions: createCommunication, fetchByApplicant, updateStatus
- Firestore collection: 'communications'
```

#### C. Create UI Components
```typescript
// File: src/components/applicants/CommunicationHistory.tsx
- Timeline view of all communications
- Filter by type
- Add new communication (email, SMS, note)
- View communication details
```

#### D. Integration
- Add to Applicant Profile page as a new tab
- Add quick note feature to applicant list

**Files to Create:**
1. `src/types/communication.ts`
2. `src/stores/communicationStore.ts`
3. `src/components/applicants/CommunicationHistory.tsx`
4. `src/components/applicants/AddCommunication.tsx`

**Files to Modify:**
1. `src/pages/applicants/ApplicantProfile.tsx` - Add Communication tab
2. `src/App.tsx` - Add routes if needed

---

### 2. **Report Sharing Functionality (7.5 Reports Module)**
**Priority:** MEDIUM

**Description:**
Allow users to share generated reports with other users via email or in-app

**Implementation Plan:**

#### A. Extend Report Types
```typescript
// File: src/types/report.ts (modify)
export interface ReportShare {
  id: string;
  reportId: string;
  sharedBy: string;
  sharedWith: string[]; // user IDs or emails
  accessLevel: 'view' | 'download';
  expiresAt?: Date;
  createdAt: Date;
}
```

#### B. Create Report Sharing Store
```typescript
// File: src/stores/reportStore.ts (modify)
- Add action: shareReport(reportId, recipients, accessLevel)
- Add action: fetchSharedReports()
- Add action: revokeShare(shareId)
```

#### C. Create UI Components
```typescript
// File: src/components/reports/ReportShareDialog.tsx
- User/email selector
- Access level dropdown
- Expiry date picker
- Share button
```

#### D. Add Shared Reports View
```typescript
// File: src/pages/reports/SharedReports.tsx
- List of reports shared with current user
- Download/view shared reports
```

**Files to Create:**
1. `src/components/reports/ReportShareDialog.tsx`
2. `src/pages/reports/SharedReports.tsx`

**Files to Modify:**
1. `src/types/report.ts` - Add ReportShare interface
2. `src/stores/reportStore.ts` - Add sharing actions
3. `src/pages/reports/ReportBuilder.tsx` - Add share button
4. `src/config/navigation.ts` - Add "Shared Reports" menu item

---

### 3. **Budget Tracking (7.6 Expenses Module)**
**Priority:** MEDIUM

**Description:**
Track and monitor expenses against allocated budgets by branch, department, or project

**Implementation Plan:**

#### A. Create Budget Types
```typescript
// File: src/types/budget.ts
export interface Budget {
  id: string;
  name: string;
  branchId: string;
  category: 'branch' | 'department' | 'project' | 'applicant';
  period: 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate: Date;
  allocatedAmount: number;
  spentAmount: number;
  remainingAmount: number;
  currency: Currency;
  status: 'active' | 'depleted' | 'expired';
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BudgetAlert {
  budgetId: string;
  threshold: number; // percentage
  triggered: boolean;
  notifiedAt?: Date;
}
```

#### B. Create Budget Store
```typescript
// File: src/stores/budgetStore.ts
- Actions: createBudget, updateBudget, fetchBudgets
- Auto-update spentAmount when expenses approved
- Trigger alerts at thresholds (75%, 90%, 100%)
```

#### C. Create UI Components
```typescript
// File: src/pages/expenses/BudgetManagement.tsx
- Budget list with progress bars
- Create/edit budget form
- Budget analytics (spending trends)
- Alert configuration

// File: src/components/expenses/BudgetIndicator.tsx
- Show budget status when creating expense
- Warning if expense exceeds budget
```

#### D. Integration
- Link budgets to expenses via category/branchId
- Show budget status in expense forms
- Budget alerts in dashboard

**Files to Create:**
1. `src/types/budget.ts`
2. `src/stores/budgetStore.ts`
3. `src/pages/expenses/BudgetManagement.tsx`
4. `src/components/expenses/BudgetIndicator.tsx`
5. `src/components/expenses/BudgetForm.tsx`

**Files to Modify:**
1. `src/components/expenses/ExpenseForm.tsx` - Add budget indicator
2. `src/pages/dashboard/FinancialDashboard.tsx` - Add budget widgets
3. `src/config/navigation.ts` - Add budget menu item
4. `src/App.tsx` - Add budget routes

---

### 4. **Scheduled Reports UI (7.5 Reports Module)**
**Priority:** LOW

**Description:**
UI for creating and managing scheduled reports (backend schema exists)

**Implementation Plan:**

#### A. Create UI Components
```typescript
// File: src/pages/reports/ScheduledReports.tsx
- List of scheduled reports
- Status (enabled/disabled)
- Next run time
- Last run time
- Recipients list

// File: src/components/reports/ScheduleReportForm.tsx
- Report template selector
- Frequency selector (daily, weekly, monthly)
- Recipients (multi-email input)
- Format selector (PDF, Excel)
- Enable/disable toggle
```

#### B. Integration
- Use existing `src/stores/reportStore.ts` (schedule actions already exist)
- Add to Reports navigation menu

**Files to Create:**
1. `src/pages/reports/ScheduledReports.tsx`
2. `src/components/reports/ScheduleReportForm.tsx`

**Files to Modify:**
1. `src/config/navigation.ts` - Add "Scheduled Reports" menu
2. `src/App.tsx` - Add scheduled reports routes
3. `src/pages/reports/ReportBuilder.tsx` - Add "Schedule" button

---

### 5. **Branch Manager Historical View (7.2 Applicants Module)**
**Priority:** LOW

**Description:**
Dedicated read-only view for branch managers to see their transferred applicants

**Implementation Plan:**

#### A. Create UI Component
```typescript
// File: src/pages/applicants/TransferredApplicants.tsx
- List of applicants transferred from branch manager's branch
- Read-only mode (view profile, documents, history)
- Filter by transfer date
- Shows current HO officer assigned
- Transfer status
```

#### B. Add to Navigation
- Add menu item for Branch Managers: "Transferred Applicants"

**Files to Create:**
1. `src/pages/applicants/TransferredApplicants.tsx`

**Files to Modify:**
1. `src/config/navigation.ts` - Add menu item for branch managers
2. `src/App.tsx` - Add route
3. `src/stores/applicantStore.ts` - Add action: fetchTransferredApplicants(branchId)

---

### 6. **Transfer-Expense Relationship View (7.6 Expenses Module)**
**Priority:** LOW

**Description:**
Show expenses across transfer lifecycle (before and after transfer)

**Implementation Plan:**

#### A. Create UI Component
```typescript
// File: src/components/expenses/TransferExpenseTimeline.tsx
- Timeline showing expenses before transfer
- Expenses after transfer
- Total expense summary
- Branch attribution
```

#### B. Integration
- Add to Applicant Profile → Expenses section
- Add filter in Expense reports: "Transfer Related"

**Files to Create:**
1. `src/components/expenses/TransferExpenseTimeline.tsx`

**Files to Modify:**
1. `src/pages/applicants/ApplicantProfile.tsx` - Add expense timeline
2. `src/pages/reports/FinancialReports.tsx` - Add transfer expense filter

---

### 7. **Commission Attribution UI Indicator (7.7 & 7.10 Agents/Commissions Module)**
**Priority:** MEDIUM

**Description:**
Visual indicator showing commission belongs to original agent/branch after applicant transfer

**Implementation Plan:**

#### A. Create UI Component
```typescript
// File: src/components/commissions/CommissionOriginBadge.tsx
- Badge showing "Original: [Branch Name] / [Agent Name]"
- Shown when applicant.transferredToHO === true
- Tooltip with transfer date
```

#### B. Integration Points
- Commission list view
- Commission detail view
- Agent performance dashboard
- Commission statements

**Files to Create:**
1. `src/components/commissions/CommissionOriginBadge.tsx`

**Files to Modify:**
1. `src/components/commissions/CommissionList.tsx` - Add origin badge
2. `src/pages/agents/AgentDetail.tsx` - Show transferred commissions
3. `src/pages/reports/FinancialReports.tsx` - Add transfer indicator

---

### 8. **Transfer Statistics on Branch Detail Page (7.9 Branch Module)**
**Priority:** LOW

**Description:**
Add transfer statistics widget to branch detail page

**Implementation Plan:**

#### A. Modify Branch Detail
```typescript
// File: src/pages/admin/branches/BranchDetail.tsx (modify)
- Add "Transfer Statistics" section
- Show: Total Transfers, Pending, Approved, Rejected
- Chart: Transfers over time
- Link to full transfer analytics
```

**Files to Modify:**
1. `src/pages/admin/branches/BranchDetail.tsx` - Add transfer stats widget

---

## 📊 IMPLEMENTATION PRIORITY

### Phase 1 (HIGH PRIORITY - Week 1-2)
1. ✅ Communication History
2. ✅ Budget Tracking
3. ✅ Commission Attribution UI Indicator

### Phase 2 (MEDIUM PRIORITY - Week 3)
1. ✅ Report Sharing Functionality
2. ✅ Transfer-Expense Relationship View

### Phase 3 (LOW PRIORITY - Week 4)
1. ✅ Scheduled Reports UI
2. ✅ Branch Manager Historical View
3. ✅ Transfer Statistics on Branch Detail

---

## 🎯 SUCCESS CRITERIA

Each feature should meet these criteria:
- ✅ Fully functional UI
- ✅ Proper role-based access control
- ✅ Mobile-responsive design
- ✅ Error handling
- ✅ Loading states
- ✅ Integration with existing stores/services
- ✅ Audit logging (where applicable)
- ✅ No TypeScript errors
- ✅ Follows existing code architecture

---

## 📝 NOTES

- All existing features listed above are **COMPLETE** and **FUNCTIONAL**
- UI locations are documented for easy access
- Missing features have detailed implementation plans
- Priority is based on business impact and user needs
- Estimated timeline: 4 weeks for all missing features

---

**Last Updated:** October 14, 2025
**Status:** Ready for Implementation

