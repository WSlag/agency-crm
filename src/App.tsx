import React, { useEffect } from 'react';
import { Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './stores/authStore';

// Auth Components
import Login from './components/auth/Login';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Dashboard Components
import { Dashboard } from './pages/dashboard/Dashboard';
import { FinancialDashboard } from './pages/dashboard/FinancialDashboard';

// Applicant Management
import { ApplicantList } from './pages/applicants/ApplicantList';
import { MyApplicants } from './pages/applicants/MyApplicants';
import { AllHOApplicants } from './pages/applicants/AllHOApplicants';
import { ApplicantProfile } from './pages/applicants/ApplicantProfile';
import { ApplicantRegistration } from './pages/applicants/ApplicantRegistration';
import { TransfersList } from './pages/applicants/TransfersList';
import { TransferManagement } from './pages/applicants/TransferManagement';
import { DocumentsDashboard } from './pages/applicants/DocumentsDashboard';

// Officer Management
import { OfficerManagement } from './pages/officers/OfficerManagement';

// Agent Management
import { AgentManagement } from './pages/agents/AgentManagement';
import { AgentDetail } from './pages/agents/AgentDetail';
import { AgentForm } from './pages/agents/AgentForm';

// Job Management
import { JobManagement } from './pages/jobs/JobManagement';
import { JobDetail } from './pages/jobs/JobDetail';
import { JobForm } from './pages/jobs/JobForm';

// Document Management
import DocumentList from './components/documents/DocumentList';
import { DocumentUpload } from './components/documents/DocumentUpload';
import { DocumentVerification } from './components/documents/DocumentVerification';
import { TemplateManagement } from './components/documents/TemplateManagement';
import { ExpiryDashboard } from './components/documents/ExpiryDashboard';

// Financial Management
import { ExpenseEntry } from './pages/expenses/ExpenseEntry';
import { ExpenseDetail } from './pages/expenses/ExpenseDetail';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { BudgetManagement } from './pages/expenses/BudgetManagement';
import { CommissionRequest } from './pages/commissions/CommissionRequest';
import { CommissionsPage } from './pages/commissions/CommissionsPage';
import { CommissionDetailPage } from './pages/commissions/CommissionDetailPage';

// Branch Management
import { BranchList } from './pages/admin/branches/BranchList';
import { BranchDetail } from './pages/admin/branches/BranchDetail';
import { BranchForm } from './pages/admin/branches/BranchForm';
import { BranchDashboard } from './components/branch/BranchDashboard';
import { BranchMetrics } from './components/branch/BranchMetrics';

// User Management
import { UserList } from './pages/admin/users/UserList';
import { UserForm } from './pages/admin/users/UserForm';

// Reports
import { FinancialReports } from './pages/reports/FinancialReports';
import { BranchPerformance } from './pages/reports/BranchPerformance';
import { AgentPerformance } from './pages/reports/AgentPerformance';
import { TransferAnalytics } from './pages/reports/TransferAnalytics';
import { OfficerPerformance } from './pages/reports/OfficerPerformance';
import { DeploymentReports } from './pages/reports/DeploymentReports';
import { ReportBuilder } from './pages/reports/ReportBuilder';
import { ReportList } from './pages/reports/ReportList';
import { ReportDetail } from './pages/reports/ReportDetail';
import { SharedReports } from './pages/reports/SharedReports';

// Settings
import { SystemSettings } from './pages/settings/SystemSettings';
import { NotificationSettings } from './pages/settings/NotificationSettings';
import { NotificationsList } from './pages/notifications/NotificationsList';
import { RolePermissions } from './pages/settings/RolePermissions';
import { BranchConfiguration } from './pages/settings/BranchConfiguration';
import { BranchTargets } from './pages/settings/BranchTargets';
import { ProfilePage } from './pages/settings/ProfilePage';

// Public Employer Portal
import { EmployerPortal } from './pages/public/EmployerPortal';

// Admin Resume Management
import { ResumeManagement } from './pages/admin/ResumeManagement';
import { AgencyInfoSettings } from './pages/admin/AgencyInfoSettings';
import { EmployerInquiries } from './pages/admin/EmployerInquiries';

import { AuthProvider } from './contexts/AuthContext';

const App: React.FC = () => {
  const { setUser, setLoading, setCustomClaims } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const idTokenResult = await user.getIdTokenResult();
        setUser(user);
        setCustomClaims({
          role: idTokenResult.claims.role as string,
          branchId: idTokenResult.claims.branchId as string | null
        });
      } else {
        setUser(null);
        setCustomClaims(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading, setCustomClaims]);

  return (
    <AuthProvider>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Public Employer Portal - No authentication required */}
        <Route path="/employer-portal" element={<EmployerPortal />} />

        {/* Protected Routes */}
        <Route
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          {/* Dashboard */}
          <Route path="/" element={<Dashboard />} />
          <Route
            path="/financial-dashboard"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'ho_accountant']}>
                <FinancialDashboard />
              </RoleGuard>
            }
          />

          {/* My Applicants - HO Recruitment Officer (Assigned to them) + Admin/President View */}
          <Route
            path="/my-applicants"
            element={
              <RoleGuard allowedRoles={['ho_recruitment_officer', 'admin', 'president']}>
                <Outlet />
              </RoleGuard>
            }
          >
            <Route index element={<MyApplicants />} />
            <Route path=":id" element={<ApplicantProfile />} />
          </Route>

          {/* All HO Applicants - Shared pool for all HO Officers (Unassigned) */}
          <Route
            path="/ho-applicants/all"
            element={
              <RoleGuard allowedRoles={['ho_recruitment_officer']}>
                <Outlet />
              </RoleGuard>
            }
          >
            <Route index element={<AllHOApplicants />} />
            <Route path=":id" element={<ApplicantProfile />} />
          </Route>

          {/* Applicant Management */}
          <Route
            path="/applicants"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'branch_manager', 'ho_accountant']}>
                <Outlet />
              </RoleGuard>
            }
          >
            <Route index element={<ApplicantList />} />
            <Route path="new" element={<ApplicantRegistration />} />
            <Route path=":id" element={<ApplicantProfile />} />
            <Route path=":id/edit" element={<ApplicantRegistration />} />
            <Route path="transfers" element={<TransfersList />} />
            <Route path="transfers/pending" element={<TransfersList />} />
            <Route path="transfers/active" element={<TransfersList />} />
            <Route path="transfers/completed" element={<TransfersList />} />
            <Route path=":id/transfer" element={<TransferManagement />} />
            
            {/* Document Routes */}
            <Route path="documents" element={<DocumentsDashboard />} />
            <Route path="documents/pending" element={<DocumentsDashboard />} />
            <Route path="documents/expiring" element={<DocumentsDashboard />} />
            <Route path="documents/expired" element={<DocumentsDashboard />} />
            <Route path="documents/verify" element={<DocumentVerification />} />
            <Route path="documents/templates" element={<TemplateManagement />} />
          </Route>

          {/* Officer Management */}
          <Route
            path="/officers"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'ho_recruitment_officer']}>
                <OfficerManagement />
              </RoleGuard>
            }
          />

          {/* Document Management */}
          <Route path="/documents">
            <Route path=":applicantId" element={<DocumentList applicantId="" />} />
            <Route path=":applicantId/upload/:type" element={<DocumentUpload applicantId="" documentType="passport" onUploadComplete={() => {}} />} />
            <Route
              path="verify"
              element={
                <RoleGuard allowedRoles={['admin', 'president', 'ho_recruitment_officer']}>
                  <DocumentVerification />
                </RoleGuard>
              }
            />
            <Route
              path="templates"
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <TemplateManagement />
                </RoleGuard>
              }
            />
            <Route path="expiry" element={<ExpiryDashboard />} />
          </Route>

          {/* Financial Management */}
          <Route
            path="/expenses"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'ho_accountant', 'branch_manager']}>
                <Outlet />
              </RoleGuard>
            }
          />

          <Route
            path="/commissions"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'ho_accountant', 'branch_manager']}>
                <Outlet />
              </RoleGuard>
            }
          />

          {/* User Management */}
          <Route
            path="/users"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <Outlet />
              </RoleGuard>
            }
          >
            <Route index element={<UserList />} />
            <Route path="new" element={<UserForm />} />
            <Route path=":id/edit" element={<UserForm />} />
          </Route>

          {/* Branch Management */}
          <Route
            path="/branches"
            element={
              <RoleGuard allowedRoles={['admin', 'president']}>
                <Outlet />
              </RoleGuard>
            }
          />

          {/* Reports */}
          <Route
            path="/reports"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'ho_accountant']}>
                <Outlet />
              </RoleGuard>
            }
          >
            <Route path="shared" element={<SharedReports />} />
          </Route>

          {/* Profile (accessible to all authenticated users) */}
          <Route path="/profile" element={<ProfilePage />} />
          
          {/* Notifications (accessible to all authenticated users) */}
          <Route path="/notifications/all" element={<NotificationsList />} />

          {/* Settings */}
          <Route path="/settings">
            {/* Admin-only settings */}
            <Route
              element={
                <RoleGuard allowedRoles={['admin']}>
                  <Outlet />
                </RoleGuard>
              }
            >
              <Route index element={<Navigate to="/settings/system" replace />} />
              <Route path="system" element={<SystemSettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="roles" element={<RolePermissions />} />
              <Route path="branches" element={<BranchConfiguration />} />
            </Route>
            
            {/* Branch Targets - Admin and President */}
            <Route
              path="branch-targets"
              element={
                <RoleGuard allowedRoles={['admin', 'president']}>
                  <BranchTargets />
                </RoleGuard>
              }
            />
          </Route>

          {/* Expenses Routes */}
          <Route path="/expenses">
            <Route index element={<ExpensesPage />} />
            <Route path="new" element={<ExpenseEntry />} />
            <Route path=":id" element={<ExpenseDetail />} />
            <Route path=":id/edit" element={<ExpenseEntry />} />
            <Route path="budgets" element={<BudgetManagement />} />
          </Route>

          {/* Commissions Routes */}
          <Route path="/commissions">
            <Route index element={<CommissionsPage />} />
            <Route path="request" element={<CommissionRequest />} />
            <Route path=":id" element={<CommissionDetailPage />} />
          </Route>

          {/* Agent Routes */}
          <Route
            path="/agents"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'branch_manager', 'ho_accountant']}>
                <Outlet />
              </RoleGuard>
            }
          >
            <Route index element={<AgentManagement />} />
            <Route path="new" element={<AgentForm />} />
            <Route path=":id" element={<AgentDetail />} />
            <Route path=":id/edit" element={<AgentForm />} />
          </Route>

          {/* Job Routes */}
          <Route
            path="/jobs"
            element={
              <RoleGuard allowedRoles={['admin', 'president', 'ho_recruitment_officer', 'branch_manager']}>
                <Outlet />
              </RoleGuard>
            }
          >
            <Route index element={<JobManagement />} />
            <Route path="new" element={<JobForm />} />
            <Route path=":id" element={<JobDetail />} />
            <Route path=":id/edit" element={<JobForm />} />
          </Route>

          {/* Branch Routes */}
          <Route path="/branches">
            <Route index element={<BranchList />} />
            <Route path="new" element={<BranchForm />} />
            <Route path=":id" element={<BranchDetail />} />
            <Route path=":id/edit" element={<BranchForm />} />
            <Route path=":id/dashboard" element={<BranchDashboard />} />
            <Route path=":id/metrics" element={<BranchMetrics />} />
          </Route>

          {/* Reports Routes */}
          <Route path="/reports">
            <Route index element={<ReportBuilder />} />
            <Route path="builder" element={<ReportBuilder />} />
            <Route path="list" element={<ReportList />} />
            <Route path=":id" element={<ReportDetail />} />
            <Route path="financial" element={<FinancialReports />} />
            <Route path="branch-performance" element={<BranchPerformance />} />
            <Route path="agent-performance" element={<AgentPerformance />} />
            <Route path="transfer-analytics" element={<TransferAnalytics />} />
            <Route path="officer-performance" element={<OfficerPerformance />} />
            <Route path="deployment" element={<DeploymentReports />} />
          </Route>

          {/* Admin Resume Management Routes */}
          <Route
            path="/admin/resume-management"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <ResumeManagement />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/agency-info"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <AgencyInfoSettings />
              </RoleGuard>
            }
          />
          <Route
            path="/admin/employer-inquiries"
            element={
              <RoleGuard allowedRoles={['admin']}>
                <EmployerInquiries />
              </RoleGuard>
            }
          />
        </Route>

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};

export default App;