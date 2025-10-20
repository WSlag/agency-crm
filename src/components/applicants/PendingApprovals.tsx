/**
 * PendingApprovals Component
 * 
 * Displays and manages pending stage advancement approvals
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon,
  CalendarIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  UsersIcon
} from '@heroicons/react/24/outline';
import { useStageStore } from '../../stores/stageStore';
import { useAuth } from '../../contexts/AuthContext';
import { useBranchStore } from '../../stores/branchStore';
import { useAgentStore } from '../../stores/agentStore';
import { STAGE_LABELS } from '../../config/stageConfig';
import { ApplicantStage } from '../../types/applicant';
import { format } from 'date-fns';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

interface PendingApprovalsProps {
  className?: string;
}

export const PendingApprovals: React.FC<PendingApprovalsProps> = ({ 
  className = '' 
}) => {
  const { user, customClaims } = useAuth();
  const { 
    pendingApprovals, 
    fetchPendingApprovals, 
    approveStage, 
    loading 
  } = useStageStore();
  const { branches, fetchBranches } = useBranchStore();
  const { agents, fetchAllAgents } = useAgentStore();
  
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showOfficerModal, setShowOfficerModal] = useState(false);
  const [pendingTransferApproval, setPendingTransferApproval] = useState<any>(null);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [hoOfficers, setHoOfficers] = useState<any[]>([]);
  const [loadingOfficers, setLoadingOfficers] = useState(false);
  
  // Construct a proper User object with role from customClaims
  const userWithRole = user && customClaims ? {
    uid: user.uid,
    email: user.email || '',
    displayName: user.displayName || '',
    role: customClaims.role as any,
    branchId: customClaims.branchId || null,
    status: 'active' as const,
    createdAt: new Date(),
    updatedAt: new Date()
  } : null;
  
  useEffect(() => {
    if (userWithRole) {
      fetchPendingApprovals(userWithRole);
    }
    // Fetch branches and agents for display names
    if (branches.length === 0) {
      fetchBranches();
    }
    if (agents.length === 0) {
      fetchAllAgents();
    }
    // Fetch HO Recruitment Officers
    fetchHOOfficers();
  }, [user, customClaims, fetchPendingApprovals, branches.length, agents.length, fetchBranches, fetchAllAgents]);
  
  // Fetch HO Recruitment Officers
  const fetchHOOfficers = async () => {
    try {
      setLoadingOfficers(true);
      const usersRef = collection(firestore, 'users');
      const q = query(
        usersRef,
        where('role', '==', 'ho_recruitment_officer'),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      const officers = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        displayName: doc.data().displayName || doc.data().name || doc.data().email || `Officer ${doc.id.substring(0, 8)}`
      }));
      console.log('Fetched HO Recruitment Officers:', officers);
      setHoOfficers(officers);
    } catch (err) {
      console.error('Error fetching HO officers:', err);
      setError('Failed to load HO Recruitment Officers');
    } finally {
      setLoadingOfficers(false);
    }
  };
  
  // Auto-refresh approvals every 30 seconds
  useEffect(() => {
    if (!userWithRole) return;
    
    const interval = setInterval(() => {
      fetchPendingApprovals(userWithRole);
    }, 30000); // 30 seconds
    
    return () => clearInterval(interval);
  }, [userWithRole, fetchPendingApprovals]);
  
  const handleApprove = async (approval: any) => {
    if (!userWithRole) return;
    
    // Check if this is a transfer to HO stage - requires officer assignment
    if (approval.toStage === ApplicantStage.TRANSFER) {
      // Show officer selection modal
      setPendingTransferApproval(approval);
      setShowOfficerModal(true);
      setSelectedOfficer('');
      setError(null);
      return;
    }
    
    // For non-transfer stages, proceed with normal approval
    if (!window.confirm(
      `Approve advancement to ${STAGE_LABELS[approval.toStage as ApplicantStage]} stage for ${approval.applicant.fullName}?`
    )) {
      return;
    }
    
    setProcessingId(approval.id);
    setError(null);
    
    try {
      await approveStage(
        {
          applicantId: approval.applicantId,
          stage: approval.toStage as ApplicantStage,
          approvedBy: userWithRole.uid,
          approved: true
        },
        userWithRole
      );
      // Refresh the list after approval
      await fetchPendingApprovals(userWithRole);
    } catch (err: any) {
      setError(err.message || 'Failed to approve stage');
    } finally {
      setProcessingId(null);
    }
  };
  
  // Handle transfer approval with officer assignment
  const handleTransferApproval = async () => {
    if (!userWithRole || !pendingTransferApproval || !selectedOfficer) {
      setError('Please select an HO Recruitment Officer');
      return;
    }
    
    setProcessingId(pendingTransferApproval.id);
    setError(null);
    
    try {
      await approveStage(
        {
          applicantId: pendingTransferApproval.applicantId,
          stage: pendingTransferApproval.toStage as ApplicantStage,
          approvedBy: userWithRole.uid,
          approved: true,
          assignedOfficerId: selectedOfficer // Pass officer ID for transfer
        },
        userWithRole
      );
      
      // Close modal and refresh
      setShowOfficerModal(false);
      setPendingTransferApproval(null);
      setSelectedOfficer('');
      await fetchPendingApprovals(userWithRole);
    } catch (err: any) {
      setError(err.message || 'Failed to approve transfer');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (approval: any) => {
    if (!userWithRole) return;
    
    if (!rejectionReason.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    
    setProcessingId(approval.id);
    setError(null);
    
    try {
      await approveStage(
        {
          applicantId: approval.applicantId,
          stage: approval.toStage as ApplicantStage,
          approvedBy: userWithRole.uid,
          approved: false,
          rejectionReason
        },
        userWithRole
      );
      
      setSelectedApproval(null);
      setRejectionReason('');
      // Refresh the list after rejection
      await fetchPendingApprovals(userWithRole);
    } catch (err: any) {
      setError(err.message || 'Failed to reject stage');
    } finally {
      setProcessingId(null);
    }
  };
  
  if (!user) {
    return null;
  }
  
  if (loading && pendingApprovals.length === 0) {
    return (
      <div className={`p-6 ${className}`}>
        <div className="animate-pulse flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full" />
          <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-2" />
            <div className="h-3 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }
  
  if (pendingApprovals.length === 0) {
    return (
      <div className={`bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-lg border-2 border-green-200 p-8 text-center ${className}`}>
        <div className="relative inline-block">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-4 animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping" />
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">You're All Set!</h3>
        <p className="text-gray-600 mb-4">No pending approvals at the moment</p>
        <div className="inline-flex items-center space-x-2 text-sm text-green-700 bg-green-100 px-4 py-2 rounded-full">
          <span>✨</span>
          <span className="font-medium">Everything is up to date</span>
        </div>
      </div>
    );
  }
  
  const handleRefresh = async () => {
    if (userWithRole) {
      await fetchPendingApprovals(userWithRole);
    }
  };
  
  // Helper function to get branch name from ID
  const getBranchName = (branchId: string | null | undefined) => {
    if (!branchId) return null;
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  // Helper function to get agent name from ID
  const getAgentName = (agentId: string | null | undefined) => {
    if (!agentId) return null;
    const agent = agents.find(a => a.id === agentId);
    return agent?.agentName || agentId;
  };

  // SECURITY: Hide agent info from HO Recruitment Officers
  const shouldHideAgentInfo = customClaims?.role === 'ho_recruitment_officer';
  
  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <ClockIcon className="w-6 h-6 text-yellow-600" />
          Pending Stage Approvals
          <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
            {pendingApprovals.length}
          </span>
        </h2>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          title="Refresh approvals"
        >
          <ArrowPathIcon className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>
      
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}
      
      <div className="space-y-3">
        {pendingApprovals.map((approval) => {
          const isProcessing = processingId === approval.id;
          const changedAt = approval.changedAt?.toDate?.() || new Date(approval.changedAt);
          
          return (
            <div
              key={approval.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-white"
            >
              {/* Mobile-first: Stack everything vertically, then side-by-side on larger screens */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                {/* Left side: Applicant information */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {approval.applicant.fullName}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {STAGE_LABELS[approval.fromStage as ApplicantStage]}
                        {' → '}
                        <span className="font-medium text-blue-600">
                          {STAGE_LABELS[approval.toStage as ApplicantStage]}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-xs">
                      Requested: {format(changedAt, 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  {approval.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {approval.notes}
                    </div>
                  )}
                  
                  {/* Applicant details */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
                    {approval.applicant.branchId && (
                      <div className="flex items-center gap-1">
                        <BuildingOfficeIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">Branch:</span>{' '}
                        <span className="text-gray-900">{getBranchName(approval.applicant.branchId) || 'N/A'}</span>
                      </div>
                    )}
                    {/* SECURITY: Hide agent info from HO Recruitment Officers */}
                    {approval.applicant.agentId && !shouldHideAgentInfo && (
                      <div className="flex items-center gap-1">
                        <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-medium">Agent:</span>{' '}
                        <span className="text-gray-900">{getAgentName(approval.applicant.agentId)}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Right side: Action buttons - Stack on mobile, column on tablet+ */}
                <div className="flex flex-col gap-2 w-full sm:w-auto sm:min-w-[160px]">
                  {/* View Documents Button */}
                  <Link
                    to={`${customClaims?.role === 'ho_recruitment_officer' ? '/my-applicants' : '/applicants'}/${approval.applicantId}?tab=documents`}
                    className="px-3 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors shadow-sm hover:shadow-md"
                    title="View uploaded documents"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    <span>View Documents</span>
                  </Link>
                  
                  {/* Approve/Reject Buttons - Full width on mobile, side-by-side on larger screens */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => handleApprove(approval)}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      <span>{isProcessing ? 'Processing...' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      disabled={isProcessing}
                      className="flex-1 px-3 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm hover:shadow-md"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Officer Selection Modal for Transfer Approval */}
      {showOfficerModal && pendingTransferApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
                <UsersIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Approve Transfer to Head Office</h3>
                <p className="text-sm text-gray-600">Assign HO Recruitment Officer</p>
              </div>
            </div>
            
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-gray-800">
                <span className="font-semibold">{pendingTransferApproval.applicant.fullName}</span> will be transferred to Head Office.
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Branch: {getBranchName(pendingTransferApproval.applicant.branchId) || 'N/A'}
              </p>
            </div>
            
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Select HO Recruitment Officer <span className="text-red-600">*</span>
            </label>
            
            {loadingOfficers ? (
              <div className="p-4 text-center">
                <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
                <p className="text-sm text-gray-600 mt-2">Loading officers...</p>
              </div>
            ) : hoOfficers.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ No active HO Recruitment Officers found. Please create an HO officer account first.
                </p>
              </div>
            ) : (
              <select
                value={selectedOfficer}
                onChange={(e) => setSelectedOfficer(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              >
                <option value="">-- Select an Officer --</option>
                {hoOfficers.map((officer) => (
                  <option key={officer.id} value={officer.id}>
                    {officer.displayName} ({officer.email})
                  </option>
                ))}
              </select>
            )}
            
            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {error}
              </div>
            )}
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowOfficerModal(false);
                  setPendingTransferApproval(null);
                  setSelectedOfficer('');
                  setError(null);
                }}
                disabled={processingId === pendingTransferApproval.id}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleTransferApproval}
                disabled={!selectedOfficer || processingId === pendingTransferApproval.id || hoOfficers.length === 0}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {processingId === pendingTransferApproval.id ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Processing...
                  </span>
                ) : (
                  'Approve & Assign'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Rejection Modal */}
      {selectedApproval && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Stage Advancement</h3>
            <p className="text-sm mb-4 text-gray-700">
              Rejecting advancement to{' '}
              <span className="font-semibold">
                {STAGE_LABELS[selectedApproval.toStage as ApplicantStage]}
              </span>
              {' '}for{' '}
              <span className="font-semibold">
                {selectedApproval.applicant.fullName}
              </span>
            </p>
            
            <label className="block text-sm font-medium mb-2 text-gray-700">
              Rejection Reason <span className="text-red-600">*</span>
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-red-500 focus:border-transparent"
              rows={4}
              placeholder="Explain why this advancement is being rejected..."
              required
            />
            
            {error && (
              <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-800">
                {error}
              </div>
            )}
            
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setSelectedApproval(null);
                  setRejectionReason('');
                  setError(null);
                }}
                disabled={processingId === selectedApproval.id}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleReject(selectedApproval)}
                disabled={!rejectionReason.trim() || processingId === selectedApproval.id}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {processingId === selectedApproval.id ? 'Processing...' : 'Confirm Rejection'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

