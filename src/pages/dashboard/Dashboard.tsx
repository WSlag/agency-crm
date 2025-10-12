import { useAuth } from '../../contexts/AuthContext';
import { useDashboardMetrics } from '../../hooks/useDashboardMetrics';
import { MetricCard } from '../../components/dashboard/MetricCard';
import { DashboardSkeleton } from '../../components/dashboard/DashboardSkeleton';
import { DashboardError } from '../../components/dashboard/DashboardError';

// Role-specific dashboard components
const AdminDashboard = () => {
  const { metrics, isLoading, error } = useDashboardMetrics('admin');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map(metric => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
};

const BranchManagerDashboard = ({ branchId }: { branchId: string | null }) => {
  const { metrics, isLoading, error } = useDashboardMetrics('branch_manager', branchId);
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map(metric => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
};

const RecruitmentOfficerDashboard = () => {
  const { metrics, isLoading, error } = useDashboardMetrics('ho_recruitment_officer');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map(metric => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
};

const AccountantDashboard = () => {
  const { metrics, isLoading, error } = useDashboardMetrics('ho_accountant');
  
  if (isLoading) return <DashboardSkeleton />;
  if (error) return <DashboardError error={error} />;
  
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map(metric => (
        <MetricCard key={metric.label} {...metric} />
      ))}
    </div>
  );
};

const DefaultDashboard = () => (
  <div className="text-center text-gray-600">
    <p>Welcome to the Agency CRM system.</p>
  </div>
);

export const Dashboard = () => {
  const { user, customClaims, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const renderRoleSpecificContent = () => {
    switch (customClaims?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'branch_manager':
        return <BranchManagerDashboard branchId={customClaims.branchId || null} />;
      case 'ho_recruitment_officer':
        return <RecruitmentOfficerDashboard />;
      case 'ho_accountant':
        return <AccountantDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome, {user?.displayName}
        </h1>
        {renderRoleSpecificContent()}
      </div>
    </div>
  );
};