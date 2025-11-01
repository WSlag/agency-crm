import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
} from '@heroicons/react/24/outline';

export const ReportBuilder: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white">
              Reports
            </h1>
            <p className="mt-2 text-sm sm:text-base text-indigo-100">
              Access comprehensive analytics and performance reports
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="max-w-7xl mx-auto">
          {/* Quick Reports Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 lg:p-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Quick Reports
              </h2>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                Select a report to view detailed analytics
              </p>
            </div>

            {/* Reports Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Transfer Analytics */}
              <button
                onClick={() => navigate('/reports/transfer-analytics')}
                className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Transfer Analytics
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Branch to HO transfers
                    </p>
                  </div>
                </div>
              </button>

              {/* Officer Performance */}
              <button
                onClick={() => navigate('/reports/officer-performance')}
                className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Officer Performance
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      HO Recruitment Officers
                    </p>
                  </div>
                </div>
              </button>

              {/* Deployment Reports */}
              <button
                onClick={() => navigate('/reports/deployment')}
                className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-green-500 hover:bg-green-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Deployment Reports
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Overseas deployments
                    </p>
                  </div>
                </div>
              </button>

              {/* Financial Reports */}
              <button
                onClick={() => navigate('/reports/financial')}
                className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-orange-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Financial Reports
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Expenses & Commissions
                    </p>
                  </div>
                </div>
              </button>

              {/* Branch Performance */}
              <button
                onClick={() => navigate('/reports/branch-performance')}
                className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Branch Performance
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      All branches
                    </p>
                  </div>
                </div>
              </button>

              {/* Agent Performance */}
              <button
                onClick={() => navigate('/reports/agent-performance')}
                className="p-4 sm:p-6 border-2 border-gray-200 rounded-xl hover:border-teal-500 hover:bg-teal-50 transition-all text-left group focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                    <ChartBarIcon className="h-6 w-6 sm:h-8 sm:w-8 text-teal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1">
                      Agent Performance
                    </h3>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Agent metrics
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
