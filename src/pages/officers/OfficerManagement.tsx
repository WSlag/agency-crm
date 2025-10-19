import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { OfficerDashboard } from '../../components/officers/OfficerDashboard';
import { OfficerAssignment } from '../../components/officers/OfficerAssignment';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { 
  SparklesIcon, 
  UserGroupIcon,
  ChartBarIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';

// Interface for officer statistics
interface OfficerStats {
  uid: string;
  totalApplicants: number;
  activeCases: number;
  pendingDocuments: number;
  completedApplicants: number;
  successRate: number;
}

export const OfficerManagement = () => {
  const { user, customClaims } = useAuth();
  const [officers, setOfficers] = useState<User[]>([]);
  const [officerStats, setOfficerStats] = useState<Record<string, OfficerStats>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOfficersAndStats = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch recruitment officers from Firebase
        const officersQuery = query(
          collection(firestore, 'users'),
          where('role', '==', 'ho_recruitment_officer')
        );
        
        const snapshot = await getDocs(officersQuery);
        const officersData = snapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as User));
        
        setOfficers(officersData);

        // Fetch applicants data to calculate real statistics
        const applicantsQuery = query(collection(firestore, 'applicants'));
        const applicantsSnapshot = await getDocs(applicantsQuery);
        const applicantsData = applicantsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        // Calculate statistics for each officer
        const stats: Record<string, OfficerStats> = {};
        
        for (const officer of officersData) {
          const assignedApplicants = applicantsData.filter(
            (a: any) => a.assignedRecruitmentOfficerId === officer.uid
          );
          
          const activeCases = assignedApplicants.filter(
            (a: any) => a.status === 'active' && a.currentStage !== 'deployed'
          ).length;
          
          const completedApplicants = assignedApplicants.filter(
            (a: any) => a.currentStage === 'deployed'
          ).length;
          
          const successRate = assignedApplicants.length > 0
            ? Math.round((completedApplicants / assignedApplicants.length) * 100)
            : 0;

          // Count pending documents (simplified - in production, query documents collection)
          const pendingDocuments = assignedApplicants.reduce((count: number, applicant: any) => {
            // Estimate: applicants in early stages likely have pending docs
            if (['transfer', 'processing', 'deployment'].includes(applicant.currentStage)) {
              return count + 1;
            }
            return count;
          }, 0);

          stats[officer.uid] = {
            uid: officer.uid,
            totalApplicants: assignedApplicants.length,
            activeCases,
            pendingDocuments,
            completedApplicants,
            successRate
          };
        }
        
        setOfficerStats(stats);
      } catch (err) {
        console.error('Error fetching officers:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch officers');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficersAndStats();
  }, []);

  const handleAssignOfficer = async (officerId: string) => {
    try {
      // In a real application, update the assignment in Firebase
      console.log('Assigning officer:', officerId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign officer');
    }
  };

  // Calculate aggregate stats across all officers
  const activeOfficers = officers.filter(o => o.status === 'active').length;
  
  const totalWorkload = Object.values(officerStats).reduce((sum, stat) => sum + stat.totalApplicants, 0);
  const avgWorkload = officers.length > 0 ? Math.floor(totalWorkload / officers.length) : 0;
  
  const totalSuccessRates = Object.values(officerStats).reduce((sum, stat) => sum + stat.successRate, 0);
  const avgSuccessRate = officers.length > 0 ? Math.floor(totalSuccessRates / officers.length) : 0;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
            </div>
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading recruitment officers...</p>
        </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
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
    );
  }

  // If the current user is a recruitment officer, show their dashboard
  if (customClaims?.role === 'ho_recruitment_officer') {
    return (
      <div className="min-h-full">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">My Dashboard</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Track your assigned applicants and performance metrics
              </p>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
            <OfficerDashboard />
          </div>
        </div>
    );
  }

  // Admin/Manager view - show all officers
  return (
    <div className="min-h-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">
                Recruitment Officer Management
              </h1>
            </div>
            <p className="mt-2 text-indigo-100">
              Monitor performance and manage recruitment officer assignments
            </p>

            {/* Stats Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Total Officers</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {officers.length}
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Active Officers</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {activeOfficers}
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <ClockIcon className="h-5 w-5" />
                  <span>Avg. Workload</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {avgWorkload}
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <TrophyIcon className="h-5 w-5" />
                  <span>Avg. Success Rate</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {avgSuccessRate}%
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-20 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Officer Performance Table */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">
                  Officer Performance Overview
                </h3>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th
                      scope="col"
                      className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      Officer
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      Total Applicants
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      Active Cases
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      Success Rate
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {officers.map((officer) => {
                    const stats = officerStats[officer.uid] || {
                      totalApplicants: 0,
                      activeCases: 0,
                      successRate: 0
                    };

                    return (
                      <tr
                        key={officer.uid}
                        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                      >
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0">
                              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                                <span className="text-white font-semibold text-sm">
                                  {officer.displayName?.charAt(0).toUpperCase() || '?'}
                                </span>
                              </div>
                            </div>
                            <div className="ml-4">
                              <div className="font-semibold text-gray-900">
                                {officer.displayName || 'Unknown Officer'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {officer.email || 'No email'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                          {stats.totalApplicants}
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {stats.activeCases}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              stats.successRate >= 80
                                ? 'bg-green-100 text-green-800'
                                : stats.successRate >= 70
                                ? 'bg-yellow-100 text-yellow-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {stats.successRate}%
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              officer.status === 'active'
                                ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                                : 'bg-gradient-to-r from-gray-500 to-gray-600 text-white'
                            }`}
                          >
                            {officer.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {officers.length === 0 && (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No officers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No recruitment officers are currently registered.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Officer Assignment - Pass real stats */}
          <OfficerAssignment 
            officers={officers} 
            officerStats={officerStats}
            onAssign={handleAssignOfficer} 
          />
        </div>
      </div>
  );
};
