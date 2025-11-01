import React, { useState } from 'react';
import {
  InformationCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '@heroicons/react/24/outline';

interface ReportIntroCardProps {
  title: string;
  description: string;
  whatYouWillSee: string[];
  whenToUse: string;
  keyMetrics?: { name: string; description: string }[];
}

export const ReportIntroCard: React.FC<ReportIntroCardProps> = ({
  title,
  description,
  whatYouWillSee,
  whenToUse,
  keyMetrics,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-sm border-2 border-blue-200 p-6 mb-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <InformationCircleIcon className="h-8 w-8 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
            <p className="text-sm text-gray-700">{description}</p>
          </div>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-shrink-0 ml-4 p-2 text-indigo-600 hover:bg-indigo-100 rounded-lg transition-colors"
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? (
            <ChevronUpIcon className="h-5 w-5" />
          ) : (
            <ChevronDownIcon className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-indigo-200 space-y-4">
          {/* What You'll See */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              📊 What You'll See:
            </h4>
            <ul className="space-y-1">
              {whatYouWillSee.map((item, index) => (
                <li key={index} className="text-sm text-gray-700 flex items-start">
                  <span className="text-indigo-600 mr-2">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* When to Use */}
          <div>
            <h4 className="text-sm font-semibold text-gray-900 mb-2">
              💡 When to Use This Report:
            </h4>
            <p className="text-sm text-gray-700">{whenToUse}</p>
          </div>

          {/* Key Metrics (if provided) */}
          {keyMetrics && keyMetrics.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-2">
                📈 Key Metrics Explained:
              </h4>
              <div className="space-y-2">
                {keyMetrics.map((metric, index) => (
                  <div key={index} className="bg-white rounded-lg p-3 border border-indigo-100">
                    <div className="text-sm font-semibold text-indigo-900">
                      {metric.name}
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {metric.description}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
