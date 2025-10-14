# 🎯 UI Location Quick Reference Guide

## Quick Navigation Map for All Features

### 📱 **Dashboard & Overview**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| Main Dashboard | All | `/` | `src/pages/dashboard/Dashboard.tsx` |
| Financial Dashboard | Admin, President, Accountant | `/financial-dashboard` | `src/pages/dashboard/FinancialDashboard.tsx` |
| Pending Tasks Widget | Admin, President, Accountant | `/` (Dashboard) | `PendingTasksWidget` in Dashboard |

---

### 👥 **Applicants Management**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| All Applicants List | Admin, President, HO Officer, Branch Manager | `/applicants` | `src/pages/applicants/ApplicantList.tsx` |
| Applicant Profile | Admin, President, HO Officer, Branch Manager | `/applicants/:id` | `src/pages/applicants/ApplicantProfile.tsx` |
| Register Applicant | Branch Manager | `/applicants/register` | `src/pages/applicants/ApplicantRegistration.tsx` |
| Pipeline Management | Admin, President, HO Officer, Branch Manager | `/applicants/:id/pipeline` | `src/components/applicants/PipelineManagement.tsx` |

---

### 🔄 **Transfer Management**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| All Transfers | Admin, President, HO Officer, Branch Manager | `/applicants/transfers` | `src/pages/applicants/TransfersList.tsx` |
| Pending Transfers | Admin, President | `/applicants/transfers/pending` | `src/pages/applicants/TransfersList.tsx` |
| Transfer Management (Single) | Admin, President, Branch Manager | `/applicants/:id/transfer` | `src/pages/applicants/TransferManagement.tsx` |
| Transfer Approval | Admin, President | Component in TransferManagement | `src/components/applicants/transfer/TransferApproval.tsx` |

---

### 👨‍💼 **HO Recruitment Officers**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| My Dashboard (Officer) | HO Recruitment Officer | `/officers` | `src/components/officers/OfficerDashboard.tsx` |
| My Assigned Applicants | HO Recruitment Officer | `/officers` | Shows filtered applicants |
| All Officers (Admin View) | Admin, President | `/officers` | `src/pages/officers/OfficerManagement.tsx` |
| Officer Assignment | Admin, President | Component | `src/components/officers/OfficerAssignment.tsx` |

**Quick Access:**
- Dashboard → "My Applicants" quick action → Officer Dashboard

---

### 📄 **Documents**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| Documents Dashboard | Admin, President, HO Officer, Branch Manager | `/applicants/documents` | `src/pages/applicants/DocumentsDashboard.tsx` |
| Document List (Per Applicant) | Admin, President, HO Officer, Branch Manager | `/applicants/:id` → Documents Tab | `src/components/documents/DocumentList.tsx` |
| Document Upload | Admin, President, HO Officer, Branch Manager | Component in Document List | `src/components/documents/DocumentUpload.tsx` |
| Document Verification | HO Officer | `/applicants/documents/verify` | `src/components/documents/DocumentVerification.tsx` |
| Document Templates | Admin, HO Officer | `/applicants/documents/templates` | `src/components/documents/TemplateManagement.tsx` |
| Expiry Dashboard | Admin, President, HO Officer | Component | `src/components/documents/ExpiryDashboard.tsx` |

**Quick Access:**
- Dashboard → "Documents" quick action (HO Officer) → Documents Dashboard

---

### 💰 **Expenses**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| All Expenses | Admin, President, Accountant, Branch Manager | `/expenses` | `src/pages/expenses/ExpensesPage.tsx` |
| Expense Form (Create/Edit) | Admin, Branch Manager, Accountant | `/expenses/new` or `/expenses/:id/edit` | `src/components/expenses/ExpenseForm.tsx` |
| Expense Approval | Admin, President, Accountant | Component in Expense Detail | `src/components/expenses/ExpenseApproval.tsx` |
| Expense List | All authorized | Component | `src/components/expenses/ExpenseList.tsx` |
| Expense per Applicant | Admin, President, HO Officer, Branch Manager | `/applicants/:id` → Expenses Section | Filtered ExpenseList |

**Quick Access:**
- Dashboard → "Pending Expenses" (Accountant) → Expenses Page
- Dashboard → "Submit Expense" (Branch Manager) → New Expense Form

---

### 💵 **Commissions**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| All Commissions | Admin, President, Accountant, Branch Manager | `/commissions` | `src/pages/commissions/CommissionsPage.tsx` |
| Commission Request | Branch Manager, Admin | `/commissions/new` | `src/components/commissions/CommissionRequestForm.tsx` |
| Commission Approval | Admin, President, Accountant | Component | `src/components/commissions/CommissionApproval.tsx` |
| Commission Calculator | All authorized | Component | `src/components/commissions/CommissionCalculator.tsx` |
| Commission Statement | All authorized | Component | `src/components/commissions/CommissionStatement.tsx` |

**Quick Access:**
- Dashboard → "Pending Commissions" (Accountant) → Commissions Page
- Dashboard → "Commissions" (Branch Manager) → Commissions Page

---

### 🏢 **Agents**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| Agent Management | Admin, President, Branch Manager, Accountant | `/agents` | `src/pages/agents/AgentManagement.tsx` |
| Agent Detail | Admin, President, Branch Manager, Accountant | `/agents/:id` | `src/pages/agents/AgentDetail.tsx` |
| Agent Form (Create/Edit) | Admin, Branch Manager | `/agents/new` or `/agents/:id/edit` | `src/pages/agents/AgentForm.tsx` |

**Tabs in Agent Detail:**
- Profile
- Performance (metrics, charts)
- Applicants (sourced applicants)
- Commissions (commission history)

**Quick Access:**
- Dashboard → "Manage Agents" (Admin) → Agent Management
- Dashboard → "My Agents" (Branch Manager) → Agent Management

---

### 💼 **Jobs**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| Job Management | Admin, President, HO Officer, Branch Manager | `/jobs` | `src/pages/jobs/JobManagement.tsx` |
| Job Detail | Admin, President, HO Officer, Branch Manager | `/jobs/:id` | `src/pages/jobs/JobDetail.tsx` |
| Job Form (Create/Edit) | Admin, President, HO Officer | `/jobs/new` or `/jobs/:id/edit` | `src/pages/jobs/JobForm.tsx` |

**Tabs in Job Detail:**
- Overview
- Applicants (assigned applicants)
- Requirements
- Analytics

**Quick Access:**
- Dashboard → "Job Postings" (Admin/President/HO Officer) → Job Management
- Dashboard → "Available Jobs" (Branch Manager) → Job Management

---

### 📊 **Reports**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| Report Builder | Admin, President, Accountant | `/reports` | `src/pages/reports/ReportBuilder.tsx` |
| Financial Reports | Admin, President, Accountant | `/reports/financial` | `src/pages/reports/FinancialReports.tsx` |
| Branch Performance | Admin, President | `/reports/branch-performance` | `src/pages/reports/BranchPerformance.tsx` |
| Agent Performance | Admin, President | `/reports/agent-performance` | `src/pages/reports/AgentPerformance.tsx` |
| Transfer Analytics | Admin, President | `/reports/transfer-analytics` | `src/pages/reports/TransferAnalytics.tsx` |
| Officer Performance | Admin, President | `/reports/officer-performance` | `src/pages/reports/OfficerPerformance.tsx` |
| Deployment Reports | Admin, President | `/reports/deployment` | `src/pages/reports/DeploymentReports.tsx` |

**Quick Access:**
- Dashboard → "View Reports" → Report Builder (with quick links to all reports)

---

### 🏢 **Branches**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| Branch List | Admin, President | `/branches` | `src/pages/admin/branches/BranchList.tsx` |
| Branch Detail | Admin, President | `/branches/:id` | `src/pages/admin/branches/BranchDetail.tsx` |
| Branch Form (Create/Edit) | Admin | `/branches/new` or `/branches/:id/edit` | Component in BranchDetail |

**Quick Access:**
- Dashboard → "Add Branch" (Admin) → Branch Form
- Dashboard → "Branches" (President) → Branch List

---

### 👤 **Users**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| User Management | Admin | `/users` | `src/pages/admin/users/UserManagement.tsx` |
| User Form (Create/Edit) | Admin | `/users/new` or `/users/:id/edit` | Component in UserManagement |

**Quick Access:**
- Dashboard → "Add User" (Admin) → User Form

---

### ⚙️ **Settings**

| Feature | Role | Path | Component |
|---------|------|------|-----------|
| System Settings | Admin | `/settings/system` | `src/pages/settings/SystemSettings.tsx` |
| Profile Settings | All | `/settings/profile` | `src/pages/settings/ProfileSettings.tsx` |
| Notification Settings | All | `/settings/notifications` | `src/pages/settings/NotificationSettings.tsx` |

---

### 🔐 **Authentication & Authorization**

| Component | Location | Purpose |
|-----------|----------|---------|
| Login Page | `src/pages/auth/Login.tsx` | User authentication |
| Role Guard | `src/components/auth/RoleGuard.tsx` | Route protection |
| Protected Route | `src/components/auth/ProtectedRoute.tsx` | Auth check |
| Auth Context | `src/contexts/AuthContext.tsx` | Auth state management |

---

## 🎨 **Component Architecture**

### Reusable Components

| Component | Location | Used For |
|-----------|----------|----------|
| OfficerDashboard | `src/components/officers/OfficerDashboard.tsx` | HO Officer's assigned applicants view |
| OfficerAssignment | `src/components/officers/OfficerAssignment.tsx` | Assigning officers to transfers |
| DocumentList | `src/components/documents/DocumentList.tsx` | List documents per applicant |
| DocumentUpload | `src/components/documents/DocumentUpload.tsx` | Upload documents with drag-drop |
| DocumentVerification | `src/components/documents/DocumentVerification.tsx` | Verify uploaded documents |
| ExpenseApproval | `src/components/expenses/ExpenseApproval.tsx` | Approve/reject expenses |
| CommissionRequestForm | `src/components/commissions/CommissionRequestForm.tsx` | Request new commission |
| CommissionApproval | `src/components/commissions/CommissionApproval.tsx` | Approve/reject commissions |
| PipelineManagement | `src/components/applicants/PipelineManagement.tsx` | Manage applicant stages |
| TransferApproval | `src/components/applicants/transfer/TransferApproval.tsx` | Approve transfer requests |

---

## 📱 **Role-Based Quick Actions**

### Admin
- Add User → `/users/new`
- Add Branch → `/branches/new`
- Manage Agents → `/agents`
- Job Postings → `/jobs`
- View Transfers → `/applicants/transfers`
- View Reports → `/reports`
- Financial → `/financial-dashboard`

### President
- View Agents → `/agents`
- Job Postings → `/jobs`
- View Transfers → `/applicants/transfers`
- View Reports → `/reports`
- Financial → `/financial-dashboard`
- Officers → `/officers`
- Branches → `/branches`

### HO Recruitment Officer
- My Applicants → `/officers` (OfficerDashboard)
- All Applicants → `/applicants`
- Job Postings → `/jobs`
- Documents → `/applicants/documents`
- Reports → `/reports`

### Branch Manager
- New Applicant → `/applicants/register`
- My Agents → `/agents`
- Available Jobs → `/jobs`
- Submit Expense → `/expenses/new`
- View Pipeline → `/applicants`
- Commissions → `/commissions`

### HO Accountant
- Pending Expenses → `/expenses?status=pending`
- Pending Commissions → `/commissions?status=pending`
- Financial Reports → `/reports/financial`
- Financial Dashboard → `/financial-dashboard`

---

## 🔍 **How to Find Features**

1. **Use Navigation Sidebar:** Most features accessible via sidebar menu
2. **Dashboard Quick Actions:** Role-specific shortcuts on main dashboard
3. **Context Menus:** Right-click or action buttons on list items
4. **Breadcrumbs:** Navigate back through hierarchy
5. **Search:** Use applicant/agent/document search features

---

**Last Updated:** October 14, 2025
**Purpose:** Quick reference for developers and users to find UI components

