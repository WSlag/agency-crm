import React, { useState, useEffect } from 'react';
import { 
  SparklesIcon, 
  ArrowsRightLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  ChartBarIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';

interface TransferMetrics {
  totalTransfers: number;
  successfulTransfers: number;
  averageProcessingTime: number;
  regionalDistribution: {
    [key: string]: number;
  };
  statusDistribution: {
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

export const TransferAnalytics: React.FC = () => {
  const [metrics, setMetrics] = useState<TransferMetrics>({
    totalTransfers: 0,
    successfulTransfers: 0,
    averageProcessingTime: 0,
    regionalDistribution: {},
    statusDistribution: {
      pending: 0,
      processing: 0,
      completed: 0,
      failed: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });

  useEffect(() => {
    const fetchTransferAnalytics = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock data for demonstration (replace with actual Firestore queries)
        const mockMetrics: TransferMetrics = {
          totalTransfers: 150,
          successfulTransfers: 120,
          averageProcessingTime: 3.5,
          regionalDistribution: {
            'North Region': 45,
            'South Region': 35,
            'East Region': 40,
            'West Region': 30
          },
          statusDistribution: {
            pending: 20,
            processing: 40,
            completed: 80,
            failed: 10
          }
        };

        setMetrics(mockMetrics);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch transfer analytics');
        setLoading(false);
      }
    };

    fetchTransferAnalytics();
  }, [dateRange]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading transfer analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Transfer Analytics</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Detailed analysis of transfer operations and performance
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex space-x-3">
                <input
                  type="date"
                  value={dateRange.startDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    startDate: new Date(e.target.value)
                  }))}
                  className="rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 text-white placeholder-white/60 focus:border-white focus:ring-white sm:text-sm"
                />
                <input
                  type="date"
                  value={dateRange.endDate.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    endDate: new Date(e.target.value)
                  }))}
                  className="rounded-lg border-2 border-white/30 bg-white/10 backdrop-blur-sm px-4 py-2 text-white placeholder-white/60 focus:border-white focus:ring-white sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <ArrowsRightLeftIcon className="h-5 w-5" />
                <span>Total Transfers</span>
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {metrics.totalTransfers}
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <CheckCircleIcon className="h-5 w-5" />
                <span>Success Rate</span>
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {((metrics.successfulTransfers / metrics.totalTransfers) * 100).toFixed(1)}%
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <ClockIcon className="h-5 w-5" />
                <span>Avg. Processing Time</span>
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {metrics.averageProcessingTime.toFixed(1)} days
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <ChartBarIcon className="h-5 w-5" />
                <span>Active Transfers</span>
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {metrics.statusDistribution.processing}
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Status Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 text-indigo-600 mr-2" />
              Status Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(metrics.statusDistribution).map(([status, count]) => (
                <div key={status} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-700 capitalize">
                      {status}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {count} transfers
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${(count / metrics.totalTransfers) * 100}%` }}
                        className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                          status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                          status === 'processing' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                          status === 'pending' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                          'bg-gradient-to-r from-red-500 to-red-600'
                        }`}
                      />
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {((count / metrics.totalTransfers) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Regional Distribution */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center">
              <MapPinIcon className="h-6 w-6 text-indigo-600 mr-2" />
              Regional Distribution
            </h3>
            <div className="space-y-4">
              {Object.entries(metrics.regionalDistribution).map(([region, count]) => (
                <div key={region} className="bg-gray-50 rounded-lg p-4 hover:shadow-md transition-all duration-200">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-sm font-semibold text-gray-700">
                      {region}
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      {count} transfers
                    </div>
                  </div>
                  <div className="relative pt-1">
                    <div className="overflow-hidden h-3 text-xs flex rounded-full bg-gray-200">
                      <div
                        style={{ width: `${(count / metrics.totalTransfers) * 100}%` }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-gradient-to-r from-indigo-500 to-purple-500"
                      />
                    </div>
                  </div>
                  <div className="mt-1 text-xs text-gray-500">
                    {((count / metrics.totalTransfers) * 100).toFixed(1)}% of total
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
