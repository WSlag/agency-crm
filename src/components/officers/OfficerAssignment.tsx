import { useState, useEffect } from 'react';
import { User } from '../../types';
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowPathIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';

interface OfficerAssignmentProps {
  officers: User[];
  officerStats: Record<string, {
    uid: string;
    totalApplicants: number;
    activeCases: number;
    pendingDocuments: number;
    completedApplicants: number;
    successRate: number;
  }>;
  onAssign: (officerId: string) => Promise<void>;
  currentOfficerId?: string | null;
}

interface OfficerWorkload {
  totalApplicants: number;
  activeApplicants: number;
  pendingDocuments: number;
}

export const OfficerAssignment = ({
  officers,
  officerStats,
  onAssign,
  currentOfficerId,
}: OfficerAssignmentProps) => {
  const [selectedOfficer, setSelectedOfficer] = useState(currentOfficerId || '');
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async () => {
    if (!selectedOfficer) {
      return;
    }

    try {
      setIsAssigning(true);
      await onAssign(selectedOfficer);
    } finally {
      setIsAssigning(false);
    }
  };

  const getWorkloadColor = (total: number) => {
    if (total <= 5) return 'text-green-600';
    if (total <= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getWorkloadBadge = (total: number) => {
    if (total <= 5) return 'bg-green-100 text-green-800';
    if (total <= 10) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <UserGroupIcon className="h-6 w-6 text-indigo-600" />
          <h3 className="text-xl font-bold text-gray-900">
            Assign Recruitment Officer
          </h3>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          Select a recruitment officer to handle this applicant. Consider the
          current workload when making the assignment.
        </p>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {officers.map((officer) => {
            const stats = officerStats[officer.uid] || {
              totalApplicants: 0,
              activeCases: 0,
              pendingDocuments: 0,
              completedApplicants: 0,
              successRate: 0
            };

            return (
              <div
                key={officer.uid}
                onClick={() => setSelectedOfficer(officer.uid)}
                className={`relative rounded-xl border-2 p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  selectedOfficer === officer.uid
                    ? 'border-indigo-500 ring-2 ring-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50'
                    : 'border-gray-300 hover:border-indigo-300'
                }`}
              >
                <div className="flex items-start">
                  <div className="h-12 w-12 flex-shrink-0 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                    <span className="text-white font-semibold text-lg">
                      {officer.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="ml-4 flex-1">
                    <h4 className="text-base font-semibold text-gray-900">
                      {officer.displayName}
                    </h4>
                    <p className="text-xs text-gray-500">{officer.email}</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <ChartBarIcon
                        className={`mr-1.5 h-4 w-4 flex-shrink-0 ${getWorkloadColor(
                          stats.totalApplicants
                        )}`}
                      />
                      Total Applicants
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getWorkloadBadge(stats.totalApplicants)}`}>
                      {stats.totalApplicants}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <UserGroupIcon
                        className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400"
                      />
                      Active Cases
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.activeCases}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600">
                      <ArrowPathIcon
                        className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400"
                      />
                      Pending Docs
                    </div>
                    <span className="text-sm font-medium text-gray-900">
                      {stats.pendingDocuments}
                    </span>
                  </div>
                </div>

                {selectedOfficer === officer.uid && (
                  <div className="absolute top-3 right-3">
                    <CheckCircleIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                )}

                <div className="mt-4">
                  <button
                    type="button"
                    className={`w-full rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-200 ${
                      selectedOfficer === officer.uid
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-indigo-500'
                    }`}
                  >
                    {selectedOfficer === officer.uid ? 'Selected ✓' : 'Select'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleAssign}
            disabled={!selectedOfficer || isAssigning}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-transparent rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isAssigning ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Assigning...
              </span>
            ) : (
              'Assign Officer'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
