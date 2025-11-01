import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuthStore } from '../../stores/authStore';
import { Branch } from '../../types';
import {
  SparklesIcon,
  BuildingOfficeIcon,
  ChartBarIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowDownTrayIcon,
  DocumentChartBarIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

interface BranchMetrics {
  totalApplicants: number;
  deployedApplicants: number;
  activeApplicants: number;
  successRate: number;
  avgProcessingTime: number;
  totalCommissions: number;
}

interface BranchPerformanceData {
  branch: Branch;
  metrics: BranchMetrics;
}

export const BranchPerformance: React.FC = () => {
  const navigate = useNavigate();
  const { user, customClaims } = useAuthStore();
  const [performanceData, setPerformanceData] = useState<BranchPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Role-based filtering: Branch Managers only see their own branch
        let branchesQuery;
        if (customClaims?.role?.toLowerCase() === 'branch_manager' && customClaims?.branchId) {
          branchesQuery = query(
            collection(firestore, 'branches'),
            where('__name__', '==', customClaims.branchId)
          );
        } else {
          // Admins and Presidents see all branches
          branchesQuery = query(collection(firestore, 'branches'));
        }

        const branchesSnapshot = await getDocs(branchesQuery);

        const branchData = await Promise.all(
          branchesSnapshot.docs.map(async (doc) => {
            const branchData = doc.data();
            console.log('Branch data:', { id: doc.id, ...branchData }); // Debug log
            const branch = { id: doc.id, ...branchData } as Branch;

            // Fetch applicants for this branch
            const applicantsQuery = query(
              collection(firestore, 'applicants'),
              where('branchId', '==', branch.id)
            );
            const applicantsSnap = await getDocs(applicantsQuery);

            const applicants = applicantsSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
              transferredDate: doc.data().transferredDate?.toDate(),
              deployment: doc.data().deployment,
              currentStage: doc.data().currentStage,
            }));

            // Filter by date range
            const filteredApplicants = applicants.filter(a => {
              const createdAt = a.createdAt;
              return createdAt &&
                createdAt >= dateRange.startDate &&
                createdAt <= dateRange.endDate;
            });

            // Calculate metrics
            const totalApplicants = filteredApplicants.length;
            const deployedApplicants = filteredApplicants.filter(a => a.currentStage === 'deployed').length;
            const activeApplicants = filteredApplicants.filter(a =>
              a.currentStage !== 'deployed' && a.currentStage !== 'withdrawn'
            ).length;
            const successRate = totalApplicants > 0 ? (deployedApplicants / totalApplicants) * 100 : 0;

            // Calculate average processing time (days from creation to deployment)
            const deployedWithDates = filteredApplicants.filter(a =>
              a.currentStage === 'deployed' &&
              a.deployment?.startDate &&
              a.createdAt
            );
            const avgProcessingTime = deployedWithDates.length > 0
              ? deployedWithDates.reduce((sum, a) => {
                  const start = a.createdAt!.getTime();
                  const end = (a.deployment.startDate instanceof Date
                    ? a.deployment.startDate
                    : a.deployment.startDate.toDate()).getTime();
                  const days = (end - start) / (1000 * 60 * 60 * 24);
                  return sum + days;
                }, 0) / deployedWithDates.length
              : 0;

            // Fetch commissions for this branch
            const commissionsQuery = query(
              collection(firestore, 'commissions'),
              where('branchId', '==', branch.id),
              where('createdAt', '>=', Timestamp.fromDate(dateRange.startDate)),
              where('createdAt', '<=', Timestamp.fromDate(dateRange.endDate))
            );
            const commissionsSnap = await getDocs(commissionsQuery);
            const totalCommissions = commissionsSnap.docs.reduce((sum, doc) => {
              const amount = doc.data().amount || 0;
              return sum + amount;
            }, 0);

            const metrics: BranchMetrics = {
              totalApplicants,
              deployedApplicants,
              activeApplicants,
              successRate,
              avgProcessingTime,
              totalCommissions,
            };

            return { branch, metrics };
          })
        );

        setPerformanceData(branchData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Failed to fetch performance data');
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [dateRange, customClaims]);

  const handleExportExcel = () => {
    // Format data for Excel export
    const excelData = performanceData.map(({ branch, metrics }) => ({
      'Branch Name': branch.branchName,
      'Location': branch.location || '-',
      'Total Applicants': metrics.totalApplicants,
      'Deployed Applicants': metrics.deployedApplicants,
      'Active Applicants': metrics.activeApplicants,
      'Success Rate (%)': metrics.successRate.toFixed(1),
      'Avg Processing Time (days)': metrics.avgProcessingTime.toFixed(0),
      'Total Commissions (PHP)': metrics.totalCommissions.toFixed(2)
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Branch Performance');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `branch_performance_${timestamp}.xlsx`);
  };

  const handleExportCSV = () => {
    // Format data for CSV export
    const csvData = performanceData.map(({ branch, metrics }) => ({
      'Branch Name': branch.branchName,
      'Location': branch.location || '-',
      'Total Applicants': metrics.totalApplicants,
      'Deployed Applicants': metrics.deployedApplicants,
      'Active Applicants': metrics.activeApplicants,
      'Success Rate (%)': metrics.successRate.toFixed(1),
      'Avg Processing Time (days)': metrics.avgProcessingTime.toFixed(0),
      'Total Commissions (PHP)': metrics.totalCommissions.toFixed(2)
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(csvData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Branch Performance');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `branch_performance_${timestamp}.csv`, { bookType: 'csv' });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading branch performance data...</p>
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

  // Calculate summary stats
  const totalApplicants = performanceData.reduce((sum, { metrics }) => sum + metrics.totalApplicants, 0);
  const totalDeployed = performanceData.reduce((sum, { metrics }) => sum + metrics.deployedApplicants, 0);
  const avgSuccessRate = performanceData.length > 0
    ? performanceData.reduce((sum, { metrics }) => sum + metrics.successRate, 0) / performanceData.length
    : 0;
  const avgProcessingTime = performanceData.length > 0
    ? performanceData.reduce((sum, { metrics }) => sum + metrics.avgProcessingTime, 0) / performanceData.length
    : 0;
  const totalCommissions = performanceData.reduce((sum, { metrics }) => sum + metrics.totalCommissions, 0);

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <button
              onClick={() => navigate('/reports')}
              className="inline-flex items-center text-white hover:text-indigo-100"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back
            </button>
          </div>
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Branch Performance</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Detailed performance metrics for all branches
              </p>
            </div>
            <div className="mt-4 sm:mt-0">
              <div className="flex flex-col sm:flex-row gap-3">
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
                <div className="flex space-x-3">
                  <button
                    onClick={handleExportExcel}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                  >
                    <DocumentChartBarIcon className="h-5 w-5 mr-2" />
                    Export Excel
                  </button>
                  <button
                    onClick={handleExportCSV}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <UserGroupIcon className="h-5 w-5" />
                <span>Total Applicants</span>
              </dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {totalApplicants}
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <ArrowTrendingUpIcon className="h-5 w-5" />
                <span>Deployed</span>
              </dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {totalDeployed}
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <ChartBarIcon className="h-5 w-5" />
                <span>Success Rate</span>
              </dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {avgSuccessRate.toFixed(1)}%
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <ClockIcon className="h-5 w-5" />
                <span>Avg. Time</span>
              </dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                {avgProcessingTime.toFixed(0)} days
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <BuildingOfficeIcon className="h-5 w-5" />
                <span>Commissions</span>
              </dt>
              <dd className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">
                ₱{totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-yellow-500 to-yellow-600 opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {/* Performance Table */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">

          {/* Mobile Card View */}
          <div className="md:hidden divide-y divide-gray-200">
            {performanceData.map(({ branch, metrics }) => (
              <div key={branch.id} className="p-4 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50">
                <div className="flex items-center mb-3">
                  <BuildingOfficeIcon className="h-5 w-5 text-indigo-600 mr-2" />
                  <h4 className="text-sm font-semibold text-gray-900">
                    {branch.branchName || branch.name || branch.id || 'Unnamed Branch'}
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Total Applicants:</span>
                    <p className="text-gray-900 font-medium">{metrics.totalApplicants}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Deployed:</span>
                    <p className="mt-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {metrics.deployedApplicants}
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Success Rate:</span>
                    <p className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metrics.successRate > 50
                          ? 'bg-green-100 text-green-800'
                          : metrics.successRate > 25
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {metrics.successRate.toFixed(1)}%
                      </span>
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-500">Avg. Time:</span>
                    <p className="text-gray-900">{metrics.avgProcessingTime.toFixed(0)} days</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-500">Commissions:</span>
                    <p className="text-gray-900 font-medium">
                      ₱{metrics.totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Branch Name
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Total Applicants
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Deployed
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Avg. Processing Time
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Commissions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {performanceData.map(({ branch, metrics }) => (
                  <tr key={branch.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-gray-900">
                      <div className="flex items-center">
                        <BuildingOfficeIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        {branch.branchName || branch.name || branch.id || 'Unnamed Branch'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {metrics.totalApplicants}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        {metrics.deployedApplicants}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        metrics.successRate > 50
                          ? 'bg-green-100 text-green-800'
                          : metrics.successRate > 25
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {metrics.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      {metrics.avgProcessingTime.toFixed(0)} days
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      ₱{metrics.totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
