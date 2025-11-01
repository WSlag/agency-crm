import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, where, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuthStore } from '../../stores/authStore';
import { Agent } from '../../types';
import {
  SparklesIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckBadgeIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { ReportIntroCard } from '../../components/reports';
import * as XLSX from 'xlsx';
import { ArrowDownTrayIcon, DocumentChartBarIcon } from '@heroicons/react/24/outline';

interface AgentMetrics {
  totalApplicants: number;
  successfulApplicants: number;
  commissionEarned: number;
  averageProcessingTime: number;
  activeApplications: number;
}

interface AgentPerformanceData {
  agent: Agent;
  metrics: AgentMetrics;
}

export const AgentPerformance: React.FC = () => {
  const navigate = useNavigate();
  const { user, customClaims } = useAuthStore();
  const [performanceData, setPerformanceData] = useState<AgentPerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
    endDate: new Date()
  });

  const calculateSuccessRate = (total: number, successful: number) => {
    return total > 0 ? (successful / total) * 100 : 0;
  };

  useEffect(() => {
    const fetchPerformanceData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Role-based access: Only admins and presidents can view agent performance
        const userRole = customClaims?.role?.toLowerCase();
        if (userRole !== 'admin' && userRole !== 'president') {
          setError('You do not have permission to view this report');
          setLoading(false);
          return;
        }

        // Fetch active agents
        const agentsQuery = query(
          collection(firestore, 'agents'),
          where('status', '==', 'active')
        );
        const agentsSnapshot = await getDocs(agentsQuery);

        const agentData = await Promise.all(
          agentsSnapshot.docs.map(async (doc) => {
            const agent = { id: doc.id, ...doc.data() } as Agent;

            // Fetch applicants for this agent
            const applicantsQuery = query(
              collection(firestore, 'applicants'),
              where('agentId', '==', agent.id)
            );
            const applicantsSnap = await getDocs(applicantsQuery);

            const applicants = applicantsSnap.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              createdAt: doc.data().createdAt?.toDate(),
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

            const totalApplicants = filteredApplicants.length;
            const successfulApplicants = filteredApplicants.filter(a => a.currentStage === 'deployed').length;
            const activeApplications = filteredApplicants.filter(a =>
              a.currentStage !== 'deployed' && a.currentStage !== 'withdrawn'
            ).length;

            // Calculate average processing time
            const deployedWithDates = filteredApplicants.filter(a =>
              a.currentStage === 'deployed' &&
              a.deployment?.startDate &&
              a.createdAt
            );
            const averageProcessingTime = deployedWithDates.length > 0
              ? deployedWithDates.reduce((sum, a) => {
                  const start = a.createdAt!.getTime();
                  const end = (a.deployment.startDate instanceof Date
                    ? a.deployment.startDate
                    : a.deployment.startDate.toDate()).getTime();
                  const days = (end - start) / (1000 * 60 * 60 * 24);
                  return sum + days;
                }, 0) / deployedWithDates.length
              : 0;

            // Fetch commission for this agent
            const commissionsQuery = query(
              collection(firestore, 'commissions'),
              where('agentId', '==', agent.id),
              where('createdAt', '>=', Timestamp.fromDate(dateRange.startDate)),
              where('createdAt', '<=', Timestamp.fromDate(dateRange.endDate))
            );
            const commissionsSnap = await getDocs(commissionsQuery);
            const commissionEarned = commissionsSnap.docs.reduce((sum, doc) => {
              const amount = doc.data().amount || 0;
              return sum + amount;
            }, 0);

            const metrics: AgentMetrics = {
              totalApplicants,
              successfulApplicants,
              commissionEarned,
              averageProcessingTime,
              activeApplications,
            };

            return { agent, metrics };
          })
        );

        setPerformanceData(agentData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching agent performance data:', err);
        setError('Failed to fetch performance data');
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [dateRange, customClaims]);

  const handleExportExcel = () => {
    // Format data for Excel export
    const excelData = performanceData.map(({ agent, metrics }) => ({
      'Agent Name': agent.agentName,
      'Contact': agent.contactInfo || '-',
      'Total Applicants': metrics.totalApplicants,
      'Successful Applicants': metrics.successfulApplicants,
      'Success Rate (%)': calculateSuccessRate(metrics.totalApplicants, metrics.successfulApplicants).toFixed(1),
      'Commission Earned (PHP)': metrics.commissionEarned.toFixed(2),
      'Active Applications': metrics.activeApplications,
      'Avg Processing Time (days)': metrics.averageProcessingTime.toFixed(1)
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agent Performance');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `agent_performance_${timestamp}.xlsx`);
  };

  const handleExportCSV = () => {
    // Format data for CSV export
    const csvData = performanceData.map(({ agent, metrics }) => ({
      'Agent Name': agent.agentName,
      'Contact': agent.contactInfo || '-',
      'Total Applicants': metrics.totalApplicants,
      'Successful Applicants': metrics.successfulApplicants,
      'Success Rate (%)': calculateSuccessRate(metrics.totalApplicants, metrics.successfulApplicants).toFixed(1),
      'Commission Earned (PHP)': metrics.commissionEarned.toFixed(2),
      'Active Applications': metrics.activeApplications,
      'Avg Processing Time (days)': metrics.averageProcessingTime.toFixed(1)
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(csvData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Agent Performance');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `agent_performance_${timestamp}.csv`, { bookType: 'csv' });
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
        <p className="mt-4 text-gray-600 font-medium">Loading agent performance data...</p>
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
  const totalCommission = performanceData.reduce((sum, { metrics }) => sum + metrics.commissionEarned, 0);
  const avgSuccessRate = performanceData.reduce((sum, { metrics }) =>
    sum + calculateSuccessRate(metrics.totalApplicants, metrics.successfulApplicants),
    0
  ) / performanceData.length;

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
                <h1 className="text-3xl font-bold text-white">Agent Performance</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Detailed performance metrics for all agents
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
          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <UserGroupIcon className="h-5 w-5" />
                <span>Total Agents</span>
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {performanceData.length}
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <CurrencyDollarIcon className="h-5 w-5" />
                <span>Total Commission</span>
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                ₱{totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 opacity-20 blur-2xl"></div>
            </div>

            <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
              <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                <CheckBadgeIcon className="h-5 w-5" />
                <span>Avg. Success Rate</span>
              </dt>
              <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                {avgSuccessRate.toFixed(1)}%
              </dd>
              <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-20 blur-2xl"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Help Card */}
          <ReportIntroCard
            title="Agent Performance Report"
            description="Track and analyze the performance of recruitment agents, monitoring their applicant conversion rates, commission earnings, and overall effectiveness."
            whatYouWillSee={[
              'Agent-wise performance metrics and rankings',
              'Commission earnings and success rates',
              'Active applications and processing times',
              'Top-performing agents by commission'
            ]}
            whenToUse="Use this report to identify high-performing agents, track commission payments, and evaluate agent effectiveness in recruiting applicants."
            keyMetrics={[
              { name: 'Success Rate', description: 'Percentage of agent applicants successfully deployed' },
              { name: 'Commission Earned', description: 'Total commission earned by each agent in the selected period' },
              { name: 'Active Applications', description: 'Number of applicants currently being processed' }
            ]}
          />

          {/* Performance Table */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Agent Name
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Total Applicants
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Success Rate
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Commission Earned
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Avg. Processing Time
                  </th>
                  <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                    Active Applications
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 bg-white">
                {performanceData.map(({ agent, metrics }) => (
                  <tr key={agent.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-semibold text-gray-900">
                      <div className="flex items-center">
                        <UserGroupIcon className="h-5 w-5 text-indigo-600 mr-2" />
                        {agent.agentName}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      {metrics.totalApplicants}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        calculateSuccessRate(metrics.totalApplicants, metrics.successfulApplicants) > 70 
                          ? 'bg-green-100 text-green-800' 
                          : calculateSuccessRate(metrics.totalApplicants, metrics.successfulApplicants) > 50 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {calculateSuccessRate(metrics.totalApplicants, metrics.successfulApplicants).toFixed(1)}%
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">
                      ₱{metrics.commissionEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      {metrics.averageProcessingTime.toFixed(1)} days
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {metrics.activeApplications}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};
