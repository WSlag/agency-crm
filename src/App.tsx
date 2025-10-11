import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './config/firebase';
import { useAuthStore } from './stores/authStore';

// Auth Components
import Login from './components/auth/Login';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { RoleGuard } from './components/auth/RoleGuard';

// Layout
import { DashboardLayout } from './components/layout/DashboardLayout';

// Dashboard Components
import { Dashboard } from './pages/dashboard/Dashboard';
import { FinancialDashboard } from './pages/dashboard/FinancialDashboard';

// Document Management
import { DocumentList } from './pages/documents/DocumentList';
import { DocumentUpload } from './pages/documents/DocumentUpload';
import { DocumentVerification } from './pages/documents/DocumentVerification';
import { TemplateManagement } from './pages/documents/TemplateManagement';
import { ExpiryDashboard } from './pages/documents/ExpiryDashboard';

// Financial Management
import { ExpenseEntry } from './pages/expenses/ExpenseEntry';
import { ExpenseDetail } from './pages/expenses/ExpenseDetail';
import { ExpensesPage } from './pages/expenses/ExpensesPage';
import { CommissionRequest } from './pages/commissions/CommissionRequest';
import { CommissionsPage } from './pages/commissions/CommissionsPage';

// Branch Management
import { BranchList } from './pages/admin/branches/BranchList';
import { BranchDetail } from './pages/admin/branches/BranchDetail';
import { BranchDashboard } from './components/branch/BranchDashboard';
import { BranchMetrics } from './components/branch/BranchMetrics';

// Reports
import { FinancialReports } from './pages/reports/FinancialReports';
import { BranchPerformance } from './pages/reports/BranchPerformance';
import { AgentPerformance } from './pages/reports/AgentPerformance';
import { TransferAnalytics } from './pages/reports/TransferAnalytics';
import { ReportBuilder } from './pages/reports/ReportBuilder';

// Settings
import { SystemSettings } from './pages/settings/SystemSettings';
import { NotificationSettings } from './pages/settings/NotificationSettings';
import { RolePermissions } from './pages/settings/RolePermissions';
import { BranchConfiguration } from './pages/settings/BranchConfiguration';

const App: React.FC = () => {
  const { setUser, setLoading } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [setUser, setLoading]);

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />

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

        {/* Document Management */}
        <Route path="/documents">
          <Route index element={<DocumentList />} />
          <Route path="upload" element={<DocumentUpload />} />
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
              <Routes>
                <Route index element={<ExpensesPage />} />
                <Route path="new" element={<ExpenseEntry />} />
                <Route path=":id" element={<ExpenseDetail />} />
              </Routes>
            </RoleGuard>
          }
        />

        <Route
          path="/commissions"
          element={
            <RoleGuard allowedRoles={['admin', 'president', 'ho_accountant', 'branch_manager']}>
              <Routes>
                <Route index element={<CommissionsPage />} />
                <Route path="request" element={<CommissionRequest />} />
              </Routes>
            </RoleGuard>
          }
        />

        {/* Branch Management */}
        <Route
          path="/branches"
          element={
            <RoleGuard allowedRoles={['admin', 'president']}>
              <Routes>
                <Route index element={<BranchList />} />
                <Route path=":id" element={<BranchDetail />} />
                <Route path=":id/dashboard" element={<BranchDashboard />} />
                <Route path=":id/metrics" element={<BranchMetrics />} />
              </Routes>
            </RoleGuard>
          }
        />

        {/* Reports */}
        <Route
          path="/reports"
          element={
            <RoleGuard allowedRoles={['admin', 'president', 'ho_accountant']}>
              <Routes>
                <Route index element={<ReportBuilder />} />
                <Route path="financial" element={<FinancialReports />} />
                <Route path="branch-performance" element={<BranchPerformance />} />
                <Route path="agent-performance" element={<AgentPerformance />} />
                <Route path="transfer-analytics" element={<TransferAnalytics />} />
              </Routes>
            </RoleGuard>
          }
        />

        {/* Settings */}
        <Route
          path="/settings"
          element={
            <RoleGuard allowedRoles={['admin']}>
              <Routes>
                <Route path="system" element={<SystemSettings />} />
                <Route path="notifications" element={<NotificationSettings />} />
                <Route path="roles" element={<RolePermissions />} />
                <Route path="branches" element={<BranchConfiguration />} />
              </Routes>
            </RoleGuard>
          }
        />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;