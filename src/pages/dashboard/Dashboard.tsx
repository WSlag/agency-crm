import { useAuth } from '../../contexts/AuthContext';

// Role-specific dashboard components
const AdminDashboard = () => (
  <div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Total Users</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Active Branches</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">System Health</dt>
          <dd className="mt-1 text-3xl font-semibold text-green-600">Good</dd>
        </div>
      </div>
    </div>
  </div>
);

const BranchManagerDashboard = ({ branchId }: { branchId: string | null }) => {
  console.log('Branch Manager Dashboard for branch:', branchId);
  return (
    <div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Branch Applicants</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Pending Approvals</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <dt className="text-sm font-medium text-gray-500 truncate">Monthly Target</dt>
            <dd className="mt-1 text-3xl font-semibold text-gray-900">0%</dd>
          </div>
        </div>
      </div>
    </div>
  );
};

const RecruitmentOfficerDashboard = () => (
  <div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Assigned Cases</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending Reviews</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Processing Time</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0d</dd>
        </div>
      </div>
    </div>
  </div>
);

const AccountantDashboard = () => (
  <div>
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Pending Expenses</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">0</dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Monthly Revenue</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">$0</dd>
        </div>
      </div>
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <dt className="text-sm font-medium text-gray-500 truncate">Outstanding Commissions</dt>
          <dd className="mt-1 text-3xl font-semibold text-gray-900">$0</dd>
        </div>
      </div>
    </div>
  </div>
);

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