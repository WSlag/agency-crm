import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useApplicantStore } from '../../stores/applicantStore';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
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
      color: 'bg-blue-500',
    },
    {
      name: 'Active Applicants',
      stat: stats.activeApplicants,
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Pending Documents',
      stat: stats.pendingDocuments,
      icon: ClipboardDocumentListIcon,
      color: 'bg-yellow-500',
    },
    {
      name: 'Ready for Deployment',
      stat: stats.deploymentReady,
      icon: ArrowTrendingUpIcon,
      color: 'bg-purple-500',
    },
  ];

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white overflow-hidden shadow rounded-lg h-32"
            >
              <div className="p-5">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-4 h-8 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
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
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.name}
            className="bg-white overflow-hidden shadow rounded-lg"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div
                  className={`flex-shrink-0 rounded-md p-3 ${card.color}`}
                >
                  <card.icon
                    className="h-6 w-6 text-white"
                    aria-hidden="true"
                  />
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {card.name}
                    </dt>
                    <dd className="text-lg font-semibold text-gray-900">
                      {card.stat}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Applicants */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Recent Applicants
          </h3>
          <div className="mt-4 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead>
                    <tr>
                      <th
                        scope="col"
                        className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                      >
                        Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Stage
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Status
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                      >
                        Pending Documents
                      </th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {applicants
                      .filter((a) => a.assignedRecruitmentOfficerId === user?.uid)
                      .slice(0, 5)
                      .map((applicant) => (
                        <tr key={applicant.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                            {applicant.fullName}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize">
                              {applicant.currentStage}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            <span
                              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                applicant.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {applicant.status}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                            {applicant.documents?.filter(
                              (d) => d.status === 'pending'
                            ).length || 0}
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                            <Link
                              to={`/applicants/${applicant.id}`}
                              className="text-primary-600 hover:text-primary-900"
                            >
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-4 text-right">
            <Link
              to="/applicants"
              className="text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              View all applicants →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
