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
  DocumentTextIcon
} from '@heroicons/react/24/outline';
import { useStageStore } from '../../stores/stageStore';
import { useAuth } from '../../contexts/AuthContext';
import { STAGE_LABELS } from '../../config/stageConfig';
import { ApplicantStage } from '../../types/applicant';
import { format } from 'date-fns';

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
  
  const [selectedApproval, setSelectedApproval] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
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
  }, [user, customClaims, fetchPendingApprovals]);
  
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
        <h3 className="text-xl font-bold text-gray-900 mb-2">All Caught Up!</h3>
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
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-start gap-3 mb-3">
                    <UserIcon className="w-5 h-5 text-gray-400 flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">
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
                    <span>
                      Requested: {format(changedAt, 'MMM dd, yyyy HH:mm')}
                    </span>
                  </div>
                  
                  {approval.notes && (
                    <div className="mt-2 p-2 bg-gray-50 rounded text-sm text-gray-700">
                      <span className="font-medium">Notes:</span> {approval.notes}
                    </div>
                  )}
                  
                  {/* Applicant details */}
                  <div className="mt-3 pt-3 border-t border-gray-100 flex gap-4 text-xs text-gray-600">
                    <div>
                      <span className="font-medium">Branch:</span>{' '}
                      {approval.applicant.branchId || 'N/A'}
                    </div>
                    {approval.applicant.agentId && (
                      <div>
                        <span className="font-medium">Agent:</span>{' '}
                        {approval.applicant.agentId}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {/* View Documents Button */}
                  <Link
                    to={`/applicants/${approval.applicantId}?tab=documents`}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2 text-sm font-medium transition-colors"
                    title="View uploaded documents"
                  >
                    <DocumentTextIcon className="w-4 h-4" />
                    View Documents
                  </Link>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleApprove(approval)}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <CheckCircleIcon className="w-4 h-4" />
                      {isProcessing ? 'Processing...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => setSelectedApproval(approval)}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <XCircleIcon className="w-4 h-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      
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

