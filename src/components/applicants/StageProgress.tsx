/**
 * StageProgress Component
 * 
 * Displays visual progress of applicant through recruitment pipeline stages
 */

import React from 'react';
import { 
  CheckCircleIcon, 
  ClockIcon, 
  XCircleIcon,
  MinusCircleIcon 
} from '@heroicons/react/24/solid';
import { ApplicantStage, ApplicantStatus } from '../../types/applicant';
import { 
  STAGE_LABELS, 
  getAllStagesInOrder 
} from '../../config/stageConfig';

interface StageProgressProps {
  currentStage: ApplicantStage | string;
  status?: ApplicantStatus | string;
  commissionMedicalTriggered?: boolean;
  commissionDeploymentTriggered?: boolean;
  rejectionReason?: string;
  className?: string;
}

export const StageProgress: React.FC<StageProgressProps> = ({
  currentStage,
  status = 'active',
  commissionMedicalTriggered = false,
  commissionDeploymentTriggered = false,
  rejectionReason,
  className = ''
}) => {
  const STAGE_ORDER = getAllStagesInOrder();
  
  // Convert string stage to enum if needed, with fallback to REGISTRATION
  const currentStageEnum = (currentStage || ApplicantStage.REGISTRATION) as ApplicantStage;
  const currentIndex = STAGE_ORDER.indexOf(currentStageEnum);
  
  const getStageIcon = (stage: ApplicantStage, index: number) => {
    const iconClass = "w-6 h-6";
    
    if (index < currentIndex) {
      return <CheckCircleIcon className={`${iconClass} text-green-600`} />;
    } else if (index === currentIndex) {
      if (status === 'pending_approval' || status === ApplicantStatus.PENDING_APPROVAL) {
        return <ClockIcon className={`${iconClass} text-yellow-600`} />;
      } else if (status === 'rejected' || status === ApplicantStatus.REJECTED) {
        return <XCircleIcon className={`${iconClass} text-red-600`} />;
      } else if (status === 'on_hold' || status === ApplicantStatus.ON_HOLD) {
        return <MinusCircleIcon className={`${iconClass} text-orange-600`} />;
      }
      return <CheckCircleIcon className={`${iconClass} text-blue-600`} />;
    }
    return (
      <div className={`${iconClass} rounded-full border-2 border-gray-300 bg-white`} />
    );
  };
  
  const getStageColor = (stage: ApplicantStage, index: number) => {
    if (index < currentIndex) return 'text-green-600 font-semibold';
    if (index === currentIndex) {
      if (status === 'rejected' || status === ApplicantStatus.REJECTED) {
        return 'text-red-600 font-bold';
      }
      return 'text-blue-600 font-bold';
    }
    return 'text-gray-400';
  };
  
  const getConnectorColor = (index: number) => {
    return index < currentIndex ? 'bg-green-600' : 'bg-gray-300';
  };
  
  return (
    <div className={`py-6 ${className}`}>
      {/* Mobile: Vertical Layout (< 768px) */}
      <div className="md:hidden space-y-3">
        {STAGE_ORDER.map((stage, index) => (
          <div key={stage} className="flex items-center gap-3">
            {/* Icon */}
            <div className="relative flex-shrink-0">
              {getStageIcon(stage, index)}
              
              {/* Commission badges */}
              {stage === ApplicantStage.TRANSFER && commissionMedicalTriggered && (
                <span 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center"
                  title="1st Commission triggered"
                >
                  💰
                </span>
              )}
              {stage === ApplicantStage.DEPLOYED && commissionDeploymentTriggered && (
                <span 
                  className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center"
                  title="2nd Commission triggered"
                >
                  💰
                </span>
              )}
            </div>
            
            {/* Stage label and status */}
            <div className="flex-1">
              <div className={`text-sm font-medium ${getStageColor(stage, index)}`}>
                {STAGE_LABELS[stage]}
              </div>
              {index === currentIndex && (status === 'pending_approval' || status === ApplicantStatus.PENDING_APPROVAL) && (
                <div className="text-xs text-yellow-600 mt-1">Pending approval</div>
              )}
              {index === currentIndex && (status === 'rejected' || status === ApplicantStatus.REJECTED) && (
                <div className="text-xs text-red-600 mt-1">Rejected</div>
              )}
            </div>
            
            {/* Connector line (except for last item) */}
            {index < STAGE_ORDER.length - 1 && (
              <div className="absolute left-[11px] mt-8 w-0.5 h-8 bg-gray-300" />
            )}
          </div>
        ))}
      </div>

      {/* Desktop: Horizontal Layout (≥ 768px) */}
      <div className="hidden md:block relative">
        {/* Progress line */}
        <div className="absolute top-3 left-0 right-0 h-0.5 bg-gray-300 -z-10" />
        
        {/* Stage items */}
        <div className="flex items-start justify-between">
          {STAGE_ORDER.map((stage, index) => (
            <div key={stage} className="flex flex-col items-center flex-1 relative">
              {/* Icon container with commission badge */}
              <div className="relative bg-white px-2">
                {getStageIcon(stage, index)}
                
                {/* Commission badges */}
                {stage === ApplicantStage.TRANSFER && commissionMedicalTriggered && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center"
                    title="1st Commission triggered"
                  >
                    💰
                  </span>
                )}
                {stage === ApplicantStage.DEPLOYED && commissionDeploymentTriggered && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center"
                    title="2nd Commission triggered"
                  >
                    💰
                  </span>
                )}
              </div>
              
              {/* Stage label */}
              <span 
                className={`mt-2 text-xs text-center max-w-[80px] ${getStageColor(stage, index)}`}
              >
                {STAGE_LABELS[stage]}
              </span>
              
              {/* Connector line (except for last item) */}
              {index < STAGE_ORDER.length - 1 && (
                <div
                  className={`absolute top-3 left-1/2 w-full h-0.5 ${getConnectorColor(index)}`}
                  style={{ zIndex: -1 }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
      
      {/* Status message */}
      {(status === 'pending_approval' || status === ApplicantStatus.PENDING_APPROVAL) && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 flex items-center gap-2">
            <ClockIcon className="w-5 h-5" />
            Waiting for approval to advance to next stage
          </p>
        </div>
      )}
      
      {(status === 'rejected' || status === ApplicantStatus.REJECTED) && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-2">
            <XCircleIcon className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800">
                Stage advancement was rejected
              </p>
              {rejectionReason && (
                <p className="text-sm text-red-700 mt-1">
                  <span className="font-medium">Reason:</span> {rejectionReason}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      {(status === 'on_hold' || status === ApplicantStatus.ON_HOLD) && (
        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-sm text-orange-800 flex items-center gap-2">
            <MinusCircleIcon className="w-5 h-5" />
            Application is currently on hold
          </p>
        </div>
      )}
      
      {(status === 'deployed' || status === ApplicantStatus.DEPLOYED) && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800 flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5" />
            Successfully deployed!
          </p>
        </div>
      )}
    </div>
  );
};

