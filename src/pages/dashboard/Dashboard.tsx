import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';

export const Dashboard = () => {
  const { user } = useAuth();

  const renderRoleSpecificContent = () => {
    switch (user?.role) {
      case 'admin':
        return (
          <div>
            <h2 className="text-lg font-semibold">Admin Dashboard</h2>
            <p>Manage users, branches, and system settings</p>
          </div>
        );
      case 'president':
        return (
          <div>
            <h2 className="text-lg font-semibold">President Dashboard</h2>
            <p>Overview of all branches and operations</p>
          </div>
        );
      case 'ho_recruitment_officer':
        return (
          <div>
            <h2 className="text-lg font-semibold">Recruitment Dashboard</h2>
            <p>Manage assigned applicants and recruitment process</p>
          </div>
        );
      case 'ho_accountant':
        return (
          <div>
            <h2 className="text-lg font-semibold">Accounting Dashboard</h2>
            <p>Handle expenses and commissions</p>
          </div>
        );
      case 'branch_manager':
        return (
          <div>
            <h2 className="text-lg font-semibold">Branch Dashboard</h2>
            <p>Manage branch operations and applicants</p>
          </div>
        );
      default:
        return <div>Loading...</div>;
    }
  };

  return (
    <DashboardLayout>
      <div className="bg-white rounded-lg shadow">
        <div className="px-4 py-5 sm:p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Welcome, {user?.displayName}
          </h1>
          
          <div className="mt-6">
            {renderRoleSpecificContent()}
          </div>
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Stats will be added here based on role */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Total Applicants
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  0
                </dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Pending Approvals
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  0
                </dd>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Active Cases
                </dt>
                <dd className="mt-1 text-3xl font-semibold text-gray-900">
                  0
                </dd>
              </div>
            </div>
          </div>
          
          {/* Recent Activity */}
          <div className="mt-8">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Recent Activity
            </h3>
            <div className="mt-2 flex flex-col">
              <div className="align-middle min-w-full overflow-x-auto shadow overflow-hidden sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Activity
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        No recent activity
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        -
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        -
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
