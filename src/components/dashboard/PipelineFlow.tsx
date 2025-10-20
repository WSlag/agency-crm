import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface PipelineStage {
  id: string;
  name: string;
  count: number;
  color: string;
  icon: string;
}

interface PipelineFlowProps {
  stages: PipelineStage[];
  onStageClick?: (stageId: string) => void;
}

export const PipelineFlow: React.FC<PipelineFlowProps> = ({ stages, onStageClick }) => {
  const totalApplicants = stages.reduce((sum, stage) => sum + stage.count, 0);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Recruitment Pipeline</h3>
            <p className="text-xs sm:text-sm text-blue-100">
              {totalApplicants} total applicant{totalApplicants !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Pipeline Flow - Mobile Scrollable */}
      <div className="p-4 sm:p-6">
        <div className="overflow-x-auto -mx-2 px-2">
          <div className="inline-flex space-x-2 sm:space-x-4 min-w-full pb-2">
            {stages.map((stage, index) => {
              const percentage = totalApplicants > 0 
                ? (stage.count / totalApplicants) * 100
                : 0;

              return (
                <React.Fragment key={stage.id}>
                  {/* Stage Card */}
                  <Link
                    to={`/applicants?stage=${stage.id}`}
                    onClick={() => onStageClick?.(stage.id)}
                    className={`
                      group relative flex-shrink-0 w-32 sm:w-40 md:w-48
                      bg-gradient-to-br ${stage.color} rounded-xl p-3 sm:p-4
                      border-2 border-transparent hover:border-white
                      shadow-lg hover:shadow-2xl
                      transition-all duration-300 transform hover:scale-105
                      cursor-pointer
                    `}
                  >
                    {/* Stage Icon */}
                    <div className="text-2xl sm:text-3xl mb-2">{stage.icon}</div>

                    {/* Stage Name */}
                    <h4 className="text-xs sm:text-sm font-bold text-white mb-1 line-clamp-1">
                      {stage.name}
                    </h4>

                    {/* Count */}
                    <div className="text-2xl sm:text-3xl font-bold text-white mb-2">
                      {stage.count}
                    </div>

                    {/* Percentage Bar */}
                    <div className="relative h-1.5 sm:h-2 bg-white/30 rounded-full overflow-hidden mb-1">
                      <div
                        className="absolute inset-y-0 left-0 bg-white rounded-full transition-all duration-500"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>

                    {/* Percentage Text */}
                    <div className="text-xs text-white/90">
                      {percentage.toFixed(1)}% of total
                    </div>

                    {/* Hover Indicator */}
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>

                    {/* Bottleneck Indicator */}
                    {stage.count > totalApplicants * 0.3 && (
                      <div className="absolute -top-2 -right-2 bg-yellow-400 text-yellow-900 text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-lg animate-pulse">
                        !
                      </div>
                    )}
                  </Link>

                  {/* Arrow Connector */}
                  {index < stages.length - 1 && (
                    <div className="flex items-center justify-center flex-shrink-0">
                      <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-gray-300" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Mobile Scroll Hint */}
        <div className="sm:hidden mt-3 text-center text-xs text-gray-500">
          ← Scroll to see all stages →
        </div>

        {/* Legend */}
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2 sm:gap-3 justify-center">
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <span>Bottleneck</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-600">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Normal flow</span>
          </div>
        </div>
      </div>
    </div>
  );
};

