/**
 * PendingApprovals Component
 * 
 * Displays and manages pending stage advancement approvals
 */

import React, { useEffect, useState } from 'react';
import { 
  CheckCircleIcon, 
  XCircleIcon, 
  ClockIcon,
  UserIcon,
  CalendarIcon
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
  const { user } = useAuth();
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
  
  useEffect(() => {
    if (user) {
      fetchPendingApprovals(user);
    }
  }, [user]);
  
  const handleApprove = async (approval: any) => {
    if (!user) return;
    
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
          approvedBy: user.uid,
          approved: true
        },
        user
      );
    } catch (err: any) {
      setError(err.message || 'Failed to approve stage');
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleReject = async (approval: any) => {
    if (!user) return;
    
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
          approvedBy: user.uid,
          approved: false,
          rejectionReason
        },
        user
      );
      
      setSelectedApproval(null);
      setRejectionReason('');
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
      <div className={`p-6 text-center ${className}`}>
        <CheckCircleIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No pending approvals</p>
      </div>
    );
  }
  
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
                
                <div className="flex gap-2 flex-shrink-0">
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

