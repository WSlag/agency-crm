import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  UserGroupIcon,
  ArrowLeftIcon,
  TrophyIcon,
  ClockIcon,
  CheckCircleIcon,
  ChartBarIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useReportExporter } from '../../hooks/useReportExporter';

interface OfficerPerformance {
  officerId: string;
  officerName: string;
  email: string;
  assignedCount: number;
  completedCount: number;
  avgProcessingTime: number;
  byStage: Record<string, number>;
  activeApplicants: number;
  deployedApplicants: number;
  completionRate: number;
}

export const OfficerPerformance = () => {
  const [loading, setLoading] = useState(true);
  const [officers, setOfficers] = useState<OfficerPerformance[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [sortBy, setSortBy] = useState<'assignedCount' | 'completedCount' | 'completionRate' | 'avgProcessingTime'>('completedCount');
  
  const { exportToPDF, exportToExcel, exporting } = useReportExporter();

  useEffect(() => {
    fetchOfficerPerformance();
  }, [dateRange]);

  const fetchOfficerPerformance = async () => {
    try {
      setLoading(true);

      // Fetch all HO Recruitment Officers
      const usersQuery = query(
        collection(firestore, 'users'),
        where('role', '==', 'ho_recruitment_officer')
      );
      const usersSnap = await getDocs(usersQuery);

      const performanceData: OfficerPerformance[] = [];

      // For each officer, fetch their assigned applicants
      for (const userDoc of usersSnap.docs) {
        const userData = userDoc.data();
        
        // Query applicants assigned to this officer
        const applicantsQuery = query(
          collection(firestore, 'applicants'),
          where('assignedRecruitmentOfficerId', '==', userDoc.id)
        );
        const applicantsSnap = await getDocs(applicantsQuery);

        const applicants = applicantsSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          transferredDate: doc.data().transferredDate?.toDate(),
        }));

        // Apply date filter if not 'all'
        let filteredApplicants = applicants;
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
          
          filteredApplicants = applicants.filter(a => 
            a.transferredDate && a.transferredDate >= startDate
          );
        }

        // Calculate statistics
        const byStage: Record<string, number> = {};
        filteredApplicants.forEach(a => {
          byStage[a.currentStage] = (byStage[a.currentStage] || 0) + 1;
        });

        const completedApplicants = filteredApplicants.filter(a => a.currentStage === 'deployed');
        const activeApplicants = filteredApplicants.filter(a => a.currentStage !== 'deployed');

        // Calculate average processing time (days from transfer to deployment)
        let avgProcessingTime = 0;
        if (completedApplicants.length > 0) {
          const totalTime = completedApplicants.reduce((sum, a) => {
            if (a.transferredDate && a.deployment?.startDate) {
              const time = new Date(a.deployment.startDate).getTime() - a.transferredDate.getTime();
              return sum + time;
            }
            return sum;
          }, 0);
          avgProcessingTime = totalTime / completedApplicants.length / (1000 * 60 * 60 * 24);
        }

        const completionRate = filteredApplicants.length > 0
          ? (completedApplicants.length / filteredApplicants.length) * 100
          : 0;

        performanceData.push({
          officerId: userDoc.id,
          officerName: userData.fullName || userData.email || 'Unknown',
          email: userData.email,
          assignedCount: filteredApplicants.length,
          completedCount: completedApplicants.length,
          avgProcessingTime,
          byStage,
          activeApplicants: activeApplicants.length,
          deployedApplicants: completedApplicants.length,
          completionRate,
        });
      }

      setOfficers(performanceData);
    } catch (error) {
      console.error('Error fetching officer performance:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortedOfficers = [...officers].sort((a, b) => {
    switch (sortBy) {
      case 'assignedCount':
        return b.assignedCount - a.assignedCount;
      case 'completedCount':
        return b.completedCount - a.completedCount;
      case 'completionRate':
        return b.completionRate - a.completionRate;
      case 'avgProcessingTime':
        return a.avgProcessingTime - b.avgProcessingTime;
      default:
        return 0;
    }
  });

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Officer Performance Report',
      data: officers,
      columns: ['officerName', 'assignedCount', 'completedCount', 'completionRate', 'avgProcessingTime'],
    });
  };

  const handleExportExcel = () => {
    exportToExcel({
      title: 'Officer Performance Report',
      data: officers,
      columns: ['officerName', 'email', 'assignedCount', 'completedCount', 'activeApplicants', 'deployedApplicants', 'completionRate', 'avgProcessingTime'],
    });
  };

  const totalStats = {
    totalOfficers: officers.length,
    totalAssigned: officers.reduce((sum, o) => sum + o.assignedCount, 0),
    totalCompleted: officers.reduce((sum, o) => sum + o.completedCount, 0),
    avgCompletionRate: officers.length > 0
      ? officers.reduce((sum, o) => sum + o.completionRate, 0) / officers.length
      : 0,
  };

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
      <div className="bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link to="/reports" className="inline-flex items-center text-white hover:text-indigo-100">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Reports
            </Link>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <UserGroupIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Officer Performance</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Performance metrics for HO Recruitment Officers
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportPDF}
                disabled={exporting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 disabled:opacity-50"
              >
                Export PDF
              </button>
              <button
                onClick={handleExportExcel}
                disabled={exporting}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-indigo-600 bg-white hover:bg-indigo-50 disabled:opacity-50"
              >
                Export Excel
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Officers</div>
              <div className="text-white text-2xl font-bold mt-1">{totalStats.totalOfficers}</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Assigned</div>
              <div className="text-white text-2xl font-bold mt-1">{totalStats.totalAssigned}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Deployed</div>
              <div className="text-white text-2xl font-bold mt-1">{totalStats.totalCompleted}</div>
            </div>
            <div className="bg-cyan-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Avg. Completion</div>
              <div className="text-white text-2xl font-bold mt-1">{totalStats.avgCompletionRate.toFixed(1)}%</div>
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
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="completedCount">Most Deployed</option>
                  <option value="assignedCount">Most Assigned</option>
                  <option value="completionRate">Highest Completion Rate</option>
                  <option value="avgProcessingTime">Fastest Processing</option>
                </select>
              </div>
            </div>
          </div>

          {/* Officer Performance Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedOfficers.map((officer) => (
              <div key={officer.officerId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{officer.officerName}</h3>
                      <p className="text-sm text-gray-500">{officer.email}</p>
                    </div>
                    {officer.completionRate >= 75 && (
                      <TrophyIcon className="h-8 w-8 text-yellow-500" />
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="bg-blue-50 rounded-lg p-3">
                      <div className="text-xs text-blue-600 font-medium">Assigned</div>
                      <div className="text-2xl font-bold text-blue-900 mt-1">{officer.assignedCount}</div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <div className="text-xs text-green-600 font-medium">Deployed</div>
                      <div className="text-2xl font-bold text-green-900 mt-1">{officer.deployedApplicants}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">Completion Rate</span>
                        <span className="font-semibold text-gray-900">{officer.completionRate.toFixed(1)}%</span>
                      </div>
                      <div className="bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            officer.completionRate >= 75 ? 'bg-green-500' :
                            officer.completionRate >= 50 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${officer.completionRate}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <ClockIcon className="h-4 w-4 mr-1" />
                        <span>Avg. Processing</span>
                      </div>
                      <span className="font-semibold text-gray-900">
                        {officer.avgProcessingTime > 0 ? `${officer.avgProcessingTime.toFixed(0)}d` : 'N/A'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-600">
                        <CheckCircleIcon className="h-4 w-4 mr-1" />
                        <span>Active</span>
                      </div>
                      <span className="font-semibold text-gray-900">{officer.activeApplicants}</span>
                    </div>
                  </div>

                  {/* Stage Breakdown */}
                  {Object.keys(officer.byStage).length > 0 && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="text-xs font-medium text-gray-700 mb-2">By Stage</div>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(officer.byStage).map(([stage, count]) => (
                          <span key={stage} className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {stage}: {count}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {officers.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No officers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                No HO Recruitment Officers with assigned applicants.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

