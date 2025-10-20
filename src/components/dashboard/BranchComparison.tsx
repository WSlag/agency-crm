import React from 'react';
import { Link } from 'react-router-dom';
import {
  BuildingOfficeIcon,
  ChartBarIcon,
  UserGroupIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { useBranchMetrics } from '../../hooks/useBranchMetrics';

export const BranchComparison: React.FC = () => {
  const { branches, loading, error } = useBranchMetrics();

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-24 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <p className="text-red-600 text-sm">Failed to load branch metrics</p>
      </div>
    );
  }

  const maxApplicants = Math.max(...branches.map(b => b.totalApplicants), 1);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-600 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <ChartBarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Branch Performance</h3>
            <p className="text-xs sm:text-sm text-purple-100">Compare metrics across branches</p>
          </div>
        </div>
      </div>

      {/* Branch List */}
      <div className="p-4 sm:p-6">
        {branches.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm sm:text-base font-medium text-gray-900">No branches found</p>
          </div>
        ) : (
          <div className="space-y-4 sm:space-y-6">
            {branches.map((branch, index) => {
              const barWidth = (branch.totalApplicants / maxApplicants) * 100;
              const isTopPerformer = index === 0;

              return (
                <Link
                  key={branch.id}
                  to={`/branches/${branch.id}`}
                  className="block group"
                >
                  {/* Branch Header */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2 sm:space-x-3">
                      {isTopPerformer && (
                        <span className="text-base sm:text-lg">👑</span>
                      )}
                      <div>
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                          {branch.name}
                        </h4>
                        <p className="text-xs text-gray-500">
                          {branch.activeAgents} active agent{branch.activeAgents !== 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg sm:text-2xl font-bold text-purple-600">
                        {branch.totalApplicants}
                      </div>
                      <div className="text-xs text-gray-500">applicants</div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-3 sm:h-4 bg-gray-100 rounded-full overflow-hidden mb-3">
                    <div
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full transition-all duration-500 group-hover:from-purple-600 group-hover:to-pink-600"
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    <div className="bg-green-50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <CheckCircleIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 mr-1" />
                        <span className="text-xs sm:text-sm font-bold text-green-600">
                          {branch.deploymentRate}%
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">Deployment</div>
                    </div>

                    <div className="bg-blue-50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <UserGroupIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 mr-1" />
                        <span className="text-xs sm:text-sm font-bold text-blue-600">
                          {branch.deployedApplicants}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">Deployed</div>
                    </div>

                    <div className="bg-orange-50 rounded-lg p-2 sm:p-3 text-center">
                      <div className="flex items-center justify-center mb-1">
                        <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 text-orange-600 mr-1" />
                        <span className="text-xs sm:text-sm font-bold text-orange-600">
                          {branch.averageProcessingTime || 'N/A'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">Avg Days</div>
                    </div>
                  </div>

                  {/* Divider */}
                  {index < branches.length - 1 && (
                    <div className="mt-4 sm:mt-6 border-t border-gray-100"></div>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* View All Link */}
        {branches.length > 0 && (
          <Link
            to="/branches"
            className="block mt-4 sm:mt-6 text-center py-2 sm:py-3 text-xs sm:text-sm font-medium text-purple-600 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-all"
          >
            View All Branches →
          </Link>
        )}
      </div>
    </div>
  );
};

