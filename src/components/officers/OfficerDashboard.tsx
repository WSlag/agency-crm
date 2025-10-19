import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApplicantStore } from '../../stores/applicantStore';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  EyeIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const { applicants, loading, error, fetchApplicants } = useApplicantStore();
  const [stats, setStats] = useState({
    totalAssigned: 0,
    activeApplicants: 0,
    pendingDocuments: 0,
    deploymentReady: 0,
  });

  useEffect(() => {
    if (user) {
      fetchApplicants();
    }
  }, [user, fetchApplicants]);

  useEffect(() => {
    if (applicants.length > 0) {
      const assignedApplicants = applicants.filter(
        (a) => a.assignedRecruitmentOfficerId === user?.uid
      );

      setStats({
        totalAssigned: assignedApplicants.length,
        activeApplicants: assignedApplicants.filter((a) => a.status === 'active')
          .length,
        pendingDocuments: assignedApplicants.filter(
          (a) =>
            a.currentStage !== 'deployed' &&
            a.documents?.some((d) => d.status === 'pending')
        ).length,
        deploymentReady: assignedApplicants.filter(
          (a) => a.currentStage === 'deployment'
        ).length,
      });
    }
  }, [applicants, user]);

  const statCards = [
    {
      name: 'Total Assigned',
      stat: stats.totalAssigned,
      icon: UserGroupIcon,
      color: 'from-blue-500 to-blue-600',
    },
    {
      name: 'Active Applicants',
      stat: stats.activeApplicants,
      icon: ChartBarIcon,
      color: 'from-green-500 to-green-600',
    },
    {
      name: 'Pending Documents',
      stat: stats.pendingDocuments,
      icon: ClipboardDocumentListIcon,
      color: 'from-yellow-500 to-yellow-600',
    },
    {
      name: 'Ready for Deployment',
      stat: stats.deploymentReady,
      icon: ArrowTrendingUpIcon,
      color: 'from-purple-500 to-purple-600',
    },
  ];

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'interview':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'medical':
        return 'bg-gradient-to-r from-cyan-500 to-cyan-600 text-white';
      case 'processing':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white';
      case 'deployment':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'deployed':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading your dashboard...</p>
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

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.name}
              className="relative overflow-hidden rounded-xl bg-white border-2 border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-200 hover:scale-105"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div
                    className={`flex-shrink-0 rounded-lg p-3 bg-gradient-to-r ${card.color}`}
                  >
                    <Icon
                      className="h-6 w-6 text-white"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {card.name}
                      </dt>
                      <dd className="text-2xl font-bold text-gray-900">
                        {card.stat}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br opacity-10 blur-2xl"></div>
            </div>
          );
        })}
      </div>

      {/* Quick Menu - Access to Shared Applicant Pool */}
      <div className="bg-white rounded-xl shadow-lg border-2 border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-lg font-bold text-gray-900 flex items-center">
            <SparklesIcon className="h-5 w-5 mr-2 text-indigo-600" />
            Quick Menu
          </h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link
              to="/ho-applicants/all"
              className="group relative overflow-hidden rounded-lg border-2 border-gray-200 bg-white p-4 hover:border-indigo-500 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 p-3 group-hover:scale-110 transition-transform">
                    <UserGroupIcon className="h-6 w-6 text-white" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-4">
                  <h4 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600">
                    All Applicants
                  </h4>
                  <p className="text-sm text-gray-500">Shared work pool (unassigned)</p>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Assigned Applicants */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <h3 className="text-lg font-bold text-gray-900">
            My Recent Assigned Applicants
          </h3>
          <p className="text-sm text-gray-600 mt-1">Applicants assigned specifically to you</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
              <tr>
                <th
                  scope="col"
                  className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Stage
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                >
                  Pending Documents
                </th>
                <th scope="col" className="px-3 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {applicants
                .filter((a) => a.assignedRecruitmentOfficerId === user?.uid)
                .slice(0, 5)
                .map((applicant) => (
                  <tr
                    key={applicant.id}
                    className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200"
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-gray-900">
                      {applicant.fullName}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getStageBadgeColor(applicant.currentStage)}`}>
                        {applicant.currentStage}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          applicant.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {applicant.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600 text-center">
                      {applicant.documents?.filter(
                        (d) => d.status === 'pending'
                      ).length || 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                      <Link
                        to={`/my-applicants/${applicant.id}`}
                        className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                      >
                        <EyeIcon className="h-4 w-4 mr-1" />
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <Link
            to="/my-applicants"
            className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
          >
            View all my assigned applicants →
          </Link>
        </div>
      </div>
    </div>
  );
};
