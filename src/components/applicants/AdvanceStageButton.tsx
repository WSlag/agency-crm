/**
 * AdvanceStageButton Component
 * 
 * Button and modal for advancing applicant to next stage with document validation
 */

import React, { useState } from 'react';
import { 
  ArrowRightIcon, 
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline';
import { useStageStore } from '../../stores/stageStore';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicantStage, ApplicantStatus } from '../../types/applicant';
import { 
  STAGE_CONFIGURATION, 
  VALID_STAGE_TRANSITIONS, 
  STAGE_LABELS,
  BRANCH_STAGES,
  HEAD_OFFICE_STAGES,
  TRANSITION_STAGE
} from '../../config/stageConfig';

interface AdvanceStageButtonProps {
  applicant: any;
  onSuccess?: () => void;
  className?: string;
}

export const AdvanceStageButton: React.FC<AdvanceStageButtonProps> = ({
  applicant,
  onSuccess,
  className = ''
}) => {
  const { user, customClaims } = useAuth();
  const { requestStageAdvancement, checkDocumentRequirements } = useStageStore();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [docCheck, setDocCheck] = useState<any>(null);
  const [notes, setNotes] = useState('');
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
  
  // Convert current stage to enum with fallback to REGISTRATION
  const currentStage = (applicant.currentStageEnum || applicant.currentStage || ApplicantStage.REGISTRATION) as ApplicantStage;
  const nextStages = VALID_STAGE_TRANSITIONS[currentStage] || [];
  const nextStage = nextStages.length > 0 ? nextStages[0] : null;
  
  console.log('[AdvanceStageButton] Render check:', {
    applicantId: applicant.id,
    applicantName: applicant.fullName,
    currentStage,
    currentStageFromApplicant: applicant.currentStageEnum || applicant.currentStage,
    nextStages,
    nextStage,
    currentStatus: applicant.currentStatus,
    status: applicant.status,
    requiresApproval: applicant.requiresApproval,
    rejectionReason: applicant.rejectionReason,
    userRole: customClaims?.role,
    transferredToHO: applicant.transferredToHO,
    assignedOfficerId: applicant.assignedRecruitmentOfficerId,
    willShowButton: !(!nextStage || 
      applicant.currentStatus === ApplicantStatus.PENDING_APPROVAL || 
      applicant.currentStatus === 'pending_approval' ||
      applicant.status === 'inactive')
  });
  
  // Don't show button if no next stage or already pending approval
  if (!nextStage || 
      applicant.currentStatus === ApplicantStatus.PENDING_APPROVAL || 
      applicant.currentStatus === 'pending_approval' ||
      applicant.status === 'inactive') {
    console.log('[AdvanceStageButton] Button hidden - conditions not met');
    return null;
  }
  
  // ==================== PERMISSION CHECKS ====================
  
  // HO Accountant CANNOT advance stages (read-only access)
  if (customClaims?.role === 'ho_accountant') {
    console.log('[AdvanceStageButton] HO Accountant cannot advance stages - read-only access');
    return null;
  }
  
  // Branch Manager can ONLY request stage advancements for branch stages
  if (customClaims?.role === 'branch_manager') {
    // Branch Manager can request:
    // - Registration → Interview
    // - Interview → Medical
    // - Medical → Transfer (to HO)
    // But CANNOT request HO stages (Transfer → Processing, Processing → Deployment, etc.)
    
    const isBranchStageTransition = BRANCH_STAGES.includes(currentStage);
    const isTransferRequest = currentStage === ApplicantStage.MEDICAL && nextStage === TRANSITION_STAGE;
    
    if (!isBranchStageTransition && !isTransferRequest) {
      console.log('[AdvanceStageButton] Branch Manager cannot request HO stage advancement:', {
        currentStage,
        nextStage,
        reason: 'Branch Managers can only manage branch stages (Registration, Interview, Medical)'
      });
      return null;
    }
    
    // Also check if applicant belongs to their branch
    if (customClaims.branchId && applicant.branchId !== customClaims.branchId) {
      console.log('[AdvanceStageButton] Branch Manager cannot manage applicant from different branch');
      return null;
    }
  }
  
  // HO Recruitment Officer can ONLY request stage advancements for HO stages
  if (customClaims?.role === 'ho_recruitment_officer') {
    // HO Officer can request:
    // - Transfer → Processing
    // - Processing → Deployment
    // - Deployment → Deployed
    // But CANNOT request branch stages (they're managed by Branch Manager)
    
    const isHOStageOrTransition = currentStage === TRANSITION_STAGE || HEAD_OFFICE_STAGES.includes(currentStage);
    
    if (!isHOStageOrTransition) {
      console.log('[AdvanceStageButton] HO Officer cannot request branch stage advancement:', {
        currentStage,
        nextStage,
        reason: 'HO Officers can only manage HO stages (Transfer, Processing, Deployment, Deployed)'
      });
      return null;
    }
    
    // Check if applicant is assigned to this officer
    if (applicant.assignedRecruitmentOfficerId && 
        applicant.assignedRecruitmentOfficerId !== user?.uid) {
      console.log('[AdvanceStageButton] HO Officer cannot manage applicant assigned to different officer');
      return null;
    }
    
    // Check if applicant has been transferred to HO
    if (!applicant.transferredToHO && currentStage !== TRANSITION_STAGE) {
      console.log('[AdvanceStageButton] Applicant not yet transferred to HO');
      return null;
    }
  }
  
  // Admin and President can request any stage advancement (no restrictions)
  
  const handleCheckDocuments = async () => {
    console.log('[AdvanceStageButton] Button clicked - checking documents', {
      applicantId: applicant.id,
      applicantName: applicant.fullName,
      currentStage,
      nextStage,
      userWithRole: userWithRole ? { uid: userWithRole.uid, role: userWithRole.role } : null,
      applicantStatus: applicant.status,
      applicantCurrentStatus: applicant.currentStatus
    });
    
    if (!userWithRole) {
      console.error('[AdvanceStageButton] No userWithRole - user not properly authenticated');
      setError('You must be logged in with proper role');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('[AdvanceStageButton] Checking document requirements...');
      const result = await checkDocumentRequirements(applicant.id, currentStage);
      console.log('[AdvanceStageButton] Document check result:', result);
      setDocCheck(result);
      setShowModal(true);
    } catch (err: any) {
      console.error('[AdvanceStageButton] Error checking documents:', err);
      setError(err.message || 'Failed to check documents');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdvance = async () => {
    if (!userWithRole) {
      setError('You must be logged in with proper role');
      return;
    }
    
    if (!docCheck?.complete) {
      setError('Please upload and verify all required documents first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    console.log('[AdvanceStageButton] Submitting stage advancement:', {
      applicantId: applicant.id,
      applicantName: applicant.fullName,
      fromStage: currentStage,
      toStage: nextStage,
      userRole: userWithRole.role,
      notes
    });
    
    try {
      await requestStageAdvancement(
        {
          applicantId: applicant.id,
          fromStage: currentStage,
          toStage: nextStage,
          initiatedBy: userWithRole.uid,
          requiresApproval: true,
          notes
        },
        userWithRole
      );
      
      console.log('[AdvanceStageButton] Stage advancement request submitted successfully');
      
      setShowModal(false);
      setNotes('');
      onSuccess?.();
    } catch (err: any) {
      console.error('[AdvanceStageButton] Failed to submit stage advancement:', err);
      setError(err.message || 'Failed to advance stage');
    } finally {
      setLoading(false);
    }
  };
  
  const stageConfig = STAGE_CONFIGURATION[currentStage];
  const nextStageConfig = STAGE_CONFIGURATION[nextStage];
  
  return (
    <>
      <button
        onClick={handleCheckDocuments}
        disabled={loading}
        className={`flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
      >
        <ArrowRightIcon className="w-4 h-4" />
        Advance to {STAGE_LABELS[nextStage]}
      </button>
      
      {error && !showModal && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
      
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              Advance to {STAGE_LABELS[nextStage]} Stage
            </h3>
            
            {/* Document Checklist */}
            <div className="mb-6">
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5" />
                Document Requirements for {STAGE_LABELS[currentStage]}
              </h4>
              
              {stageConfig.documents.length === 0 ? (
                <p className="text-sm text-gray-600">No documents required for this stage</p>
              ) : (
                <div className="space-y-2">
                  {stageConfig.documents.map((doc, idx) => {
                    const isMissing = docCheck?.missing?.includes(doc.description);
                    
                    return (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-3 p-3 rounded-lg border ${
                          isMissing 
                            ? 'bg-red-50 border-red-200' 
                            : 'bg-green-50 border-green-200'
                        }`}
                      >
                        {isMissing ? (
                          <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        ) : (
                          <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="flex-1">
                          <span className={`text-sm ${isMissing ? 'text-red-800' : 'text-green-800'}`}>
                            {doc.description}
                          </span>
                          {doc.required && (
                            <span className="ml-2 text-xs text-red-600 font-medium">
                              (Required)
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              
              {docCheck && !docCheck.complete && (
                <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">
                    ⚠️ Cannot proceed: Missing required documents
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    Please upload and verify all required documents before advancing to the next stage.
                  </p>
                </div>
              )}
            </div>
            
            {/* Next Stage Info */}
            {nextStageConfig.documents.length > 0 && (
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-2 text-blue-900">
                  Next Stage Requirements: {STAGE_LABELS[nextStage]}
                </h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  {nextStageConfig.documents.map((doc, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 bg-blue-600 rounded-full" />
                      {doc.description}
                      {doc.required && <span className="text-red-600">(Required)</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            {/* Commission info */}
            {nextStageConfig.commissionTrigger && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800 font-medium flex items-center gap-2">
                  💰 Commission Trigger
                </p>
                <p className="text-xs text-green-700 mt-1">
                  Advancing to this stage will trigger agent commission payment
                </p>
              </div>
            )}
            
            {/* Notes */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Add any notes about this stage advancement..."
              />
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            )}
            
            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowModal(false);
                  setError(null);
                  setNotes('');
                }}
                disabled={loading}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAdvance}
                disabled={!docCheck?.complete || loading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Processing...' : 'Submit for Approval'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

