import { useState, useEffect } from 'react';
import { Applicant } from '../../../types/applicant';
import { useAuth } from '../../../contexts/AuthContext';
import { useBranchStore } from '../../../stores/branchStore';
import { useAgentStore } from '../../../stores/agentStore';
import { StatusActions } from './StatusActions';

interface ProfileHeaderProps {
  applicant: Applicant;
  onStatusChange: (status: 'active' | 'inactive') => void;
  onEdit: () => void;
}

export const ProfileHeader = ({ applicant, onStatusChange, onEdit }: ProfileHeaderProps) => {
  const { user, customClaims } = useAuth();
  const { branches, fetchBranches } = useBranchStore();
  const { agents, fetchActiveAgents } = useAgentStore();
  const [isChangingStatus, setIsChangingStatus] = useState(false);

  // Fetch branches and agents on mount
  useEffect(() => {
    if (branches.length === 0) {
      fetchBranches(); // Fetch all branches (not just active ones)
    }
    if (agents.length === 0) {
      fetchActiveAgents();
    }
  }, [branches.length, agents.length, fetchBranches, fetchActiveAgents]);

  // Get branch and agent details
  const branch = branches.find(b => b.id === applicant.branchId);
  const agent = applicant.agentId ? agents.find(a => a.id === applicant.agentId) : null;

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
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      case 'blacklisted':
        return 'bg-red-900 text-white';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const canEdit = customClaims?.role === 'admin' || 
    (customClaims?.role === 'branch_manager' && customClaims?.branchId === applicant.branchId) ||
    (customClaims?.role === 'ho_recruitment_officer' && user?.uid === applicant.assignedRecruitmentOfficerId);

  // SECURITY: Hide agent info from HO Recruitment Officers
  const shouldHideAgentInfo = customClaims?.role === 'ho_recruitment_officer';

  return (
    <div className="bg-white shadow rounded-xl">
      <div className="px-4 py-5 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="min-w-0 flex-1">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:leading-9">
                {applicant.fullName}
              </h1>
              <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-x-6">
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="font-medium">ID:</span>
                  <span className="ml-1">{applicant.id}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="font-medium">Application Type:</span>
                  <span className="ml-1 capitalize">{applicant.applicationType?.replace('_', ' ') || 'N/A'}</span>
                </div>
                <div className="mt-2 flex items-center text-sm text-gray-500">
                  <span className="font-medium">Current Stage:</span>
                  <span className="ml-1 capitalize">{applicant.currentStage || applicant.currentStageEnum || 'N/A'}</span>
                </div>
                {applicant.positionApplied && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="font-medium">Position Applied:</span>
                    <span className="ml-1">{applicant.positionApplied}</span>
                  </div>
                )}
                {applicant.countryDestination && (
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <span className="font-medium">Country Destination:</span>
                    <span className="ml-1">{applicant.countryDestination}</span>
                  </div>
                )}
                <div className="mt-2 flex items-center text-sm">
                  <span className="font-medium">Status:</span>
                  <span className={`ml-1 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(applicant.status || applicant.currentStatus || 'active')}`}>
                    {applicant.status || applicant.currentStatus || 'active'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {canEdit && (
            <div className="mt-4 md:mt-0 flex flex-col sm:flex-row gap-2 sm:gap-3 md:ml-4">
              <select
                value={applicant.status || applicant.currentStatus || 'active'}
                onChange={(e) => handleStatusChange(e.target.value as 'active' | 'inactive' | 'pending' | 'archived' | 'blacklisted')}
                disabled={isChangingStatus}
                className="w-full sm:w-auto rounded-lg border-2 border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="pending">Pending</option>
                <option value="archived">Archived</option>
                <option value="blacklisted">Blacklisted</option>
              </select>

              <StatusActions
                applicant={applicant}
                user={{ uid: user?.uid || '', email: user?.email || null, role: customClaims?.role || '' }}
                onStatusChange={() => window.location.reload()}
              />

              <button
                type="button"
                onClick={onEdit}
                className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:from-indigo-700 hover:to-purple-700 transition-all"
              >
                Edit Profile
              </button>
            </div>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.email || 'N/A'}</dd>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Contact Info</dt>
            <dd className="mt-1 text-sm text-gray-900">{applicant.contactInfo || 'N/A'}</dd>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Branch</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {branch?.name || applicant.branchId || 'N/A'}
              {applicant.transferredToHO && (
                <span className="ml-2 text-xs text-indigo-600 font-semibold">(Transferred to HO)</span>
              )}
            </dd>
          </div>
          
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Registration Date</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : 'N/A'}
            </dd>
          </div>
        </div>
        
        {/* Additional Info Row */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
            <dt className="truncate text-sm font-medium text-gray-500">Application Type</dt>
            <dd className="mt-1 text-sm text-gray-900">
              {applicant.applicationType === 'with_agent' ? (
                <span className="inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                  With Agent
                </span>
              ) : applicant.applicationType === 'direct_hire' ? (
                <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">
                  Direct Hire
                </span>
              ) : (
                'N/A'
              )}
            </dd>
          </div>
          
          {/* SECURITY: Hide agent info from HO Recruitment Officers */}
          {!shouldHideAgentInfo && (
            <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:p-6">
              <dt className="truncate text-sm font-medium text-gray-500">Recruited By</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {agent ? (
                  <span className="font-medium text-indigo-600">{agent.agentName}</span>
                ) : applicant.agentId ? (
                  applicant.agentId
                ) : (
                  <span className="text-gray-400">Direct Hire</span>
                )}
              </dd>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
