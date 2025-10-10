import { useState, useEffect } from 'react';
import { User } from '../../types';
import {
  ChartBarIcon,
  UserGroupIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

interface OfficerAssignmentProps {
  officers: User[];
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
  onAssign,
  currentOfficerId,
}: OfficerAssignmentProps) => {
  const [selectedOfficer, setSelectedOfficer] = useState(currentOfficerId || '');
  const [isAssigning, setIsAssigning] = useState(false);
  const [workloads, setWorkloads] = useState<{ [key: string]: OfficerWorkload }>(
    {}
  );

  useEffect(() => {
    // In a real application, fetch workload data for each officer
    // For now, we'll use mock data
    const mockWorkloads: { [key: string]: OfficerWorkload } = {};
    officers.forEach((officer) => {
      mockWorkloads[officer.uid] = {
        totalApplicants: Math.floor(Math.random() * 20),
        activeApplicants: Math.floor(Math.random() * 15),
        pendingDocuments: Math.floor(Math.random() * 10),
      };
    });
    setWorkloads(mockWorkloads);
  }, [officers]);

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
    if (total <= 5) return 'text-green-500';
    if (total <= 10) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Assign Recruitment Officer
        </h3>
        <div className="mt-2 max-w-xl text-sm text-gray-500">
          <p>
            Select a recruitment officer to handle this applicant. Consider the
            current workload when making the assignment.
          </p>
        </div>

        <div className="mt-5 space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {officers.map((officer) => {
              const workload = workloads[officer.uid] || {
                totalApplicants: 0,
                activeApplicants: 0,
                pendingDocuments: 0,
              };

              return (
                <div
                  key={officer.uid}
                  className={`relative rounded-lg border p-4 ${
                    selectedOfficer === officer.uid
                      ? 'border-primary-500 ring-2 ring-primary-500'
                      : 'border-gray-300'
                  }`}
                >
                  <div className="flex items-start">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                      <UserGroupIcon
                        className="h-6 w-6 text-gray-600"
                        aria-hidden="true"
                      />
                    </div>
                    <div className="ml-4">
                      <h4 className="text-base font-medium text-gray-900">
                        {officer.displayName}
                      </h4>
                      <div className="mt-1">
                        <div className="flex items-center text-sm text-gray-500">
                          <ChartBarIcon
                            className={`mr-1.5 h-4 w-4 flex-shrink-0 ${getWorkloadColor(
                              workload.totalApplicants
                            )}`}
                            aria-hidden="true"
                          />
                          {workload.totalApplicants} total applicants
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <UserGroupIcon
                            className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                          />
                          {workload.activeApplicants} active cases
                        </div>
                        <div className="mt-1 flex items-center text-sm text-gray-500">
                          <ArrowPathIcon
                            className="mr-1.5 h-4 w-4 flex-shrink-0 text-gray-400"
                            aria-hidden="true"
                          />
                          {workload.pendingDocuments} pending documents
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button
                      type="button"
                      onClick={() => setSelectedOfficer(officer.uid)}
                      className={`relative inline-flex w-full items-center justify-center rounded-md px-3 py-2 text-sm font-semibold ${
                        selectedOfficer === officer.uid
                          ? 'bg-primary-600 text-white hover:bg-primary-500'
                          : 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {selectedOfficer === officer.uid ? 'Selected' : 'Select'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleAssign}
              disabled={!selectedOfficer || isAssigning}
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:opacity-50"
            >
              {isAssigning ? 'Assigning...' : 'Assign Officer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
