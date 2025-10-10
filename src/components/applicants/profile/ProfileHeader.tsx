import { useState } from 'react';
import { UserCircleIcon } from '@heroicons/react/24/solid';
import { Applicant } from '../../../types/applicant';
import { useAuth } from '../../../contexts/AuthContext';

interface ProfileHeaderProps {
  applicant: Applicant;
  onStatusChange: (status: 'active' | 'inactive') => void;
  onEdit: () => void;
}

export const ProfileHeader = ({ applicant, onStatusChange, onEdit }: ProfileHeaderProps) => {
  const { user } = useAuth();
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    try {
      setIsChangingStatus(true);
      await onStatusChange(newStatus);
    } finally {
      setIsChangingStatus(false);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = user?.role === 'admin' || 
    (user?.role === 'branch_manager' && user.branchId === applicant.branchId) ||
    (user?.role === 'ho_recruitment_officer' && user.uid === applicant.assignedRecruitmentOfficerId);

  return (
    <div className="bg-white shadow">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex items-center">
              <div className="h-16 w-16 flex-shrink-0">
                <UserCircleIcon className="h-16 w-16 text-gray-300" />
              </div>
              <div className="ml-4">
                <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:leading-9">
                  {applicant.fullName}
                </h1>
                <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="font-medium">ID:</span>
                    <span className="ml-1">{applicant.id}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="font-medium">Application Type:</span>
                    <span className="ml-1 capitalize">{applicant.applicationType.replace('_', ' ')}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="font-medium">Current Stage:</span>
                    <span className="ml-1 capitalize">{applicant.currentStage}</span>
                  </div>
                  <div className="mt-2 flex items-center text-sm">
                    <span className="font-medium">Status:</span>
                    <span className={`ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(applicant.status)}`}>
                      {applicant.status}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="mt-6 flex space-x-3 md:ml-4 md:mt-0">
              <select
                value={applicant.status}
                onChange={(e) => handleStatusChange(e.target.value as 'active' | 'inactive')}
                disabled={isChangingStatus}
                className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
              >
                Edit
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.email}</dd>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Contact Info</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.contactInfo}</dd>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Branch</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {applicant.transferredToHO ? 'Head Office' : 'Branch Office'}
            </dd>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Registration Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {new Date(applicant.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </div>
      </div>
    </div>
  );
};
