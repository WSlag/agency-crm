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
  className?: string;
}

export const StageProgress: React.FC<StageProgressProps> = ({
  currentStage,
  status = 'active',
  commissionMedicalTriggered = false,
  commissionDeploymentTriggered = false,
  className = ''
}) => {
  const STAGE_ORDER = getAllStagesInOrder();
  
  // Convert string stage to enum if needed
  const currentStageEnum = currentStage as ApplicantStage;
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
      <div className="relative">
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
                {stage === ApplicantStage.MEDICAL && commissionMedicalTriggered && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center"
                    title="Commission triggered"
                  >
                    💰
                  </span>
                )}
                {stage === ApplicantStage.DEPLOYED && commissionDeploymentTriggered && (
                  <span 
                    className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 text-white text-xs rounded-full flex items-center justify-center"
                    title="Commission triggered"
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
          <p className="text-sm text-red-800 flex items-center gap-2">
            <XCircleIcon className="w-5 h-5" />
            Stage advancement was rejected
          </p>
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

