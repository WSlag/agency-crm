import { useState, useEffect } from 'react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { OfficerDashboard } from '../../components/officers/OfficerDashboard';
import { OfficerAssignment } from '../../components/officers/OfficerAssignment';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

export const OfficerManagement = () => {
  const { user } = useAuth();
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfficers = async () => {
      try {
        setLoading(true);
        // In a real application, fetch officers from Firebase
        // For now, we'll use mock data
        const mockOfficers: User[] = [
          {
            uid: '1',
            email: 'officer1@example.com',
            displayName: 'John Smith',
            role: 'ho_recruitment_officer',
            branchId: null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            uid: '2',
            email: 'officer2@example.com',
            displayName: 'Jane Doe',
            role: 'ho_recruitment_officer',
            branchId: null,
            status: 'active',
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];
        setOfficers(mockOfficers);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch officers');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, []);

  const handleAssignOfficer = async (officerId: string) => {
    try {
      // In a real application, update the assignment in Firebase
      console.log('Assigning officer:', officerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign officer');
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Recruitment Officer Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage recruitment officers and their assignments
          </p>
        </div>

        <div className="space-y-6">
          {user?.role === 'ho_recruitment_officer' ? (
            <OfficerDashboard />
          ) : (
            <>
              {/* Officer Performance Overview */}
              <div className="bg-white shadow sm:rounded-lg">
                <div className="px-4 py-5 sm:p-6">
                  <h3 className="text-lg font-medium leading-6 text-gray-900">
                    Officer Performance Overview
                  </h3>
                  <div className="mt-6">
                    <div className="overflow-hidden bg-white shadow sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Officer
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Total Applicants
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Active Cases
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Success Rate
                            </th>
                            <th
                              scope="col"
                              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                            >
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {officers.map((officer) => (
                            <tr key={officer.uid}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">
                                      {officer.displayName}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {officer.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.floor(Math.random() * 50)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.floor(Math.random() * 20)}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {Math.floor(Math.random() * 100)}%
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    officer.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {officer.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>

              {/* Officer Assignment */}
              <OfficerAssignment
                officers={officers}
                onAssign={handleAssignOfficer}
              />
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
