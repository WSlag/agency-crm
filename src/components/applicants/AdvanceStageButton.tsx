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
  STAGE_LABELS 
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
  const { user } = useAuth();
  const { requestStageAdvancement, checkDocumentRequirements } = useStageStore();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [docCheck, setDocCheck] = useState<any>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  
  // Convert current stage to enum
  const currentStage = (applicant.currentStageEnum || applicant.currentStage) as ApplicantStage;
  const nextStages = VALID_STAGE_TRANSITIONS[currentStage];
  const nextStage = nextStages && nextStages.length > 0 ? nextStages[0] : null;
  
  // Don't show button if no next stage or already pending approval
  if (!nextStage || 
      applicant.currentStatus === ApplicantStatus.PENDING_APPROVAL || 
      applicant.currentStatus === 'pending_approval' ||
      applicant.status === 'inactive') {
    return null;
  }
  
  const handleCheckDocuments = async () => {
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await checkDocumentRequirements(applicant.id, currentStage);
      setDocCheck(result);
      setShowModal(true);
    } catch (err: any) {
      setError(err.message || 'Failed to check documents');
    } finally {
      setLoading(false);
    }
  };
  
  const handleAdvance = async () => {
    if (!user) {
      setError('You must be logged in');
      return;
    }
    
    if (!docCheck?.complete) {
      setError('Please upload and verify all required documents first');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      await requestStageAdvancement(
        {
          applicantId: applicant.id,
          fromStage: currentStage,
          toStage: nextStage,
          initiatedBy: user.uid,
          requiresApproval: true,
          notes
        },
        user
      );
      
      setShowModal(false);
      setNotes('');
      onSuccess?.();
    } catch (err: any) {
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

