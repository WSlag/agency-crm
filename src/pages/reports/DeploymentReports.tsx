import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  GlobeAltIcon,
  ArrowLeftIcon,
  MapPinIcon,
  BriefcaseIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  FunnelIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { useReportExporter } from '../../hooks/useReportExporter';

interface DeploymentData {
  id: string;
  applicantId: string;
  applicantName: string;
  branchId: string;
  branchName: string;
  agentId?: string;
  agentName?: string;
  country: string;
  position: string;
  employer: string;
  salary: {
    amount: number;
    currency: string;
  };
  startDate: Date;
  contractPeriod: number;
  currentStage: string;
}

interface DeploymentStats {
  total: number;
  byCountry: Record<string, number>;
  byPosition: Record<string, number>;
  byBranch: Record<string, number>;
  byMonth: Record<string, number>;
  avgSalary: number;
  avgContractPeriod: number;
}

export const DeploymentReports = () => {
  const [loading, setLoading] = useState(true);
  const [deployments, setDeployments] = useState<DeploymentData[]>([]);
  const [stats, setStats] = useState<DeploymentStats>({
    total: 0,
    byCountry: {},
    byPosition: {},
    byBranch: {},
    byMonth: {},
    avgSalary: 0,
    avgContractPeriod: 0,
  });
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [countryFilter, setCountryFilter] = useState<string>('all');
  
  const { exportToPDF, exportToExcel, exporting } = useReportExporter();

  useEffect(() => {
    fetchDeploymentData();
  }, [dateRange, countryFilter]);

  const fetchDeploymentData = async () => {
    try {
      setLoading(true);

      // Fetch deployed applicants
      let q = query(
        collection(firestore, 'applicants'),
        where('currentStage', '==', 'deployed'),
        orderBy('deployment.startDate', 'desc')
      );

      const snapshot = await getDocs(q);
      
      // Fetch branches and agents
      const [branchesSnap, agentsSnap] = await Promise.all([
        getDocs(collection(firestore, 'branches')),
        getDocs(collection(firestore, 'agents')),
      ]);
      
      const branchMap = new Map();
      branchesSnap.forEach(doc => branchMap.set(doc.id, doc.data().branchName));
      
      const agentMap = new Map();
      agentsSnap.forEach(doc => agentMap.set(doc.id, doc.data().agentName));

      const deploymentsData: DeploymentData[] = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.deployment && data.deployment.startDate) {
          deploymentsData.push({
            id: doc.id,
            applicantId: doc.id,
            applicantName: data.fullName,
            branchId: data.branchId,
            branchName: branchMap.get(data.branchId) || 'Unknown Branch',
            agentId: data.agentId,
            agentName: data.agentId ? agentMap.get(data.agentId) : undefined,
            country: data.deployment.country || 'Unknown',
            position: data.deployment.position || 'Unknown',
            employer: data.deployment.employer || 'Unknown',
            salary: {
              amount: data.deployment.salary?.amount || 0,
              currency: data.deployment.salary?.currency || 'USD',
            },
            startDate: data.deployment.startDate?.toDate(),
            contractPeriod: data.deployment.contractPeriod || 0,
            currentStage: data.currentStage,
          });
        }
      });

      // Apply date filter
      let filteredDeployments = deploymentsData;
      if (dateRange !== 'all') {
        const now = new Date();
        let startDate = new Date();
        
        switch (dateRange) {
          case 'week':
            startDate.setDate(now.getDate() - 7);
            break;
          case 'month':
            startDate.setMonth(now.getMonth() - 1);
            break;
          case 'quarter':
            startDate.setMonth(now.getMonth() - 3);
            break;
          case 'year':
            startDate.setFullYear(now.getFullYear() - 1);
            break;
        }
        
        filteredDeployments = deploymentsData.filter(d => d.startDate >= startDate);
      }

      // Apply country filter
      if (countryFilter !== 'all') {
        filteredDeployments = filteredDeployments.filter(d => d.country === countryFilter);
      }

      setDeployments(filteredDeployments);

      // Calculate statistics
      const newStats: DeploymentStats = {
        total: filteredDeployments.length,
        byCountry: {},
        byPosition: {},
        byBranch: {},
        byMonth: {},
        avgSalary: 0,
        avgContractPeriod: 0,
      };

      // Group by country
      filteredDeployments.forEach(d => {
        newStats.byCountry[d.country] = (newStats.byCountry[d.country] || 0) + 1;
      });

      // Group by position
      filteredDeployments.forEach(d => {
        newStats.byPosition[d.position] = (newStats.byPosition[d.position] || 0) + 1;
      });

      // Group by branch
      filteredDeployments.forEach(d => {
        newStats.byBranch[d.branchName] = (newStats.byBranch[d.branchName] || 0) + 1;
      });

      // Group by month
      filteredDeployments.forEach(d => {
        const month = d.startDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        newStats.byMonth[month] = (newStats.byMonth[month] || 0) + 1;
      });

      // Calculate averages
      if (filteredDeployments.length > 0) {
        newStats.avgSalary = filteredDeployments.reduce((sum, d) => sum + d.salary.amount, 0) / filteredDeployments.length;
        newStats.avgContractPeriod = filteredDeployments.reduce((sum, d) => sum + d.contractPeriod, 0) / filteredDeployments.length;
      }

      setStats(newStats);
    } catch (error) {
      console.error('Error fetching deployment data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Deployment Report',
      data: deployments,
      columns: ['applicantName', 'country', 'position', 'employer', 'salary', 'startDate'],
      summary: stats,
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      title: 'Deployment Report',
      data: deployments,
      columns: ['applicantName', 'branchName', 'agentName', 'country', 'position', 'employer', 'salary.amount', 'salary.currency', 'contractPeriod', 'startDate'],
    });
  };

  const uniqueCountries = Array.from(new Set(deployments.map(d => d.country))).filter(Boolean);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 via-teal-600 to-cyan-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link to="/reports" className="inline-flex items-center text-white hover:text-green-100">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Reports
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <GlobeAltIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Deployment Reports</h1>
              </div>
              <p className="mt-2 text-green-100">
                Comprehensive analysis of overseas deployments
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 disabled:opacity-50"
              >
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-green-600 bg-white hover:bg-green-50 disabled:opacity-50"
              >
                Export Excel
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Deployments</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="bg-teal-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Countries</div>
              <div className="text-white text-2xl font-bold mt-1">{Object.keys(stats.byCountry).length}</div>
            </div>
            <div className="bg-cyan-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Avg. Salary</div>
              <div className="text-white text-2xl font-bold mt-1">${(stats.avgSalary / 1000).toFixed(0)}k</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Avg. Contract</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.avgContractPeriod.toFixed(0)}mo</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm font-medium text-gray-700">Filters:</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <MapPinIcon className="h-5 w-5 text-gray-400" />
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* By Country */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-green-600" />
                Deployments by Country
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byCountry)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([country, count]) => (
                    <div key={country} className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{country}</div>
                        <div className="mt-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-sm font-semibold text-gray-900">{count}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* By Position */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BriefcaseIcon className="h-5 w-5 mr-2 text-teal-600" />
                Deployments by Position
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byPosition)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 10)
                  .map(([position, count]) => (
                    <div key={position} className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{position}</div>
                        <div className="mt-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-teal-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-sm font-semibold text-gray-900">{count}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* By Branch */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-cyan-600" />
                Deployments by Branch
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byBranch)
                  .sort(([, a], [, b]) => b - a)
                  .map(([branch, count]) => (
                    <div key={branch} className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{branch}</div>
                        <div className="mt-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-cyan-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-sm font-semibold text-gray-900">{count}</div>
                    </div>
                  ))}
              </div>
            </div>

            {/* Monthly Trend */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CalendarIcon className="h-5 w-5 mr-2 text-blue-600" />
                Monthly Trend
              </h3>
              <div className="space-y-3">
                {Object.entries(stats.byMonth)
                  .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
                  .slice(0, 6)
                  .map(([month, count]) => (
                    <div key={month} className="flex items-center">
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900">{month}</div>
                        <div className="mt-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / stats.total) * 100}%` }}
                          />
                        </div>
                      </div>
                      <div className="ml-4 text-sm font-semibold text-gray-900">{count}</div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Deployment Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Deployment Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Country</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Salary</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Start Date</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {deployments.map((deployment) => (
                    <tr key={deployment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {deployment.applicantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.branchName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.country}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.position}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.employer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.salary.currency} {deployment.salary.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {deployment.startDate.toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {deployments.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <GlobeAltIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No deployments found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No deployments match the selected filters.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

