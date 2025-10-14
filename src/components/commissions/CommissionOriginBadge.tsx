import { InformationCircleIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';
import type { Commission } from '../../types/commission';

interface CommissionOriginBadgeProps {
  commission: Commission;
  applicantTransferred?: boolean;
  transferDate?: Date;
  originalBranchName?: string;
  originalAgentName?: string;
}

export const CommissionOriginBadge: React.FC<CommissionOriginBadgeProps> = ({
  commission,
  applicantTransferred = false,
  transferDate,
  originalBranchName,
  originalAgentName,
}) => {
  if (!applicantTransferred) {
    return null;
  }

  return (
    <div className="inline-flex items-center space-x-2">
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
        <InformationCircleIcon className="h-4 w-4 mr-1" />
        Transferred Applicant
      </span>
      
      <div className="group relative">
        <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200 cursor-help">
          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
          Original: {originalBranchName || 'Branch'}
        </div>
        
        {/* Tooltip */}
        <div className="hidden group-hover:block absolute z-10 w-64 p-3 mt-2 text-sm bg-gray-900 text-white rounded-lg shadow-lg -left-24">
          <div className="space-y-2">
            <div className="flex items-start space-x-2">
              <BuildingOfficeIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-semibold">Original Branch</p>
                <p className="text-gray-300">{originalBranchName}</p>
              </div>
            </div>
            
            {originalAgentName && (
              <div className="flex items-start space-x-2">
                <UserIcon className="h-4 w-4 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold">Original Agent</p>
                  <p className="text-gray-300">{originalAgentName}</p>
                </div>
              </div>
            )}
            
            {transferDate && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-xs text-gray-400">
                  Transferred on {new Date(transferDate).toLocaleDateString()}
                </p>
              </div>
            )}
            
            <p className="text-xs text-gray-400 italic">
              Commission credited to original branch/agent as per policy
            </p>
          </div>
          
          {/* Arrow */}
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 rotate-45 w-2 h-2 bg-gray-900"></div>
        </div>
      </div>
    </div>
  );
};

