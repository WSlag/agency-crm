import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuthStore } from '../../stores/authStore';
import {
  ArrowsRightLeftIcon,
  ArrowLeftIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowTrendingUpIcon,
  CalendarIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import { useReportExporter } from '../../hooks/useReportExporter';
import { ReportIntroCard } from '../../components/reports';
import * as XLSX from 'xlsx';

interface TransferStats {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  completed: number;
  avgProcessingTime: number;
  byBranch: Record<string, number>;
  byMonth: Record<string, number>;
  byOfficer: Record<string, { count: number; name: string }>;
}

interface Transfer {
  id: string;
  applicantId: string;
  applicantName: string;
  fromBranchId: string;
  fromBranchName: string;
  toBranchId: string;
  assignedOfficerId?: string;
  assignedOfficerName?: string;
  transferStatus: 'pending' | 'approved' | 'rejected' | 'completed';
  requestedDate: Date;
  approvedDate?: Date;
  completedDate?: Date;
  transferReason: string;
}

export const TransferAnalytics = () => {
  const { user, customClaims } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<TransferStats>({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0,
    completed: 0,
    avgProcessingTime: 0,
    byBranch: {},
    byMonth: {},
    byOfficer: {},
  });
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'all'>('month');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'completed'>('all');

  const { exportToPDF, exportToExcel, exporting } = useReportExporter();

  useEffect(() => {
    fetchTransferData();
  }, [dateRange, statusFilter, customClaims]);

  const fetchTransferData = async () => {
    try {
      setLoading(true);
      const transfersRef = collection(firestore, 'transfers');

      // Build query constraints array
      const constraints: any[] = [];

      // Role-based filtering
      // Branch Managers: Only see transfers from their branch
      if (customClaims?.role?.toLowerCase() === 'branch_manager' && customClaims?.branchId) {
        constraints.push(where('fromBranchId', '==', customClaims.branchId));
      }
      // HO Officers and Accountants see all transfers (no restriction)

      // Apply date filter
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

        constraints.push(where('requestedDate', '>=', Timestamp.fromDate(startDate)));
      }

      // Add ordering
      constraints.push(orderBy('requestedDate', 'desc'));

      // Build final query
      const q = query(transfersRef, ...constraints);

      const snapshot = await getDocs(q);
      const transfersData: Transfer[] = [];
      
      // Fetch branch and user names
      const branchesRef = collection(firestore, 'branches');
      const usersRef = collection(firestore, 'users');
      const applicantsRef = collection(firestore, 'applicants');
      
      const [branchesSnap, usersSnap, applicantsSnap] = await Promise.all([
        getDocs(branchesRef),
        getDocs(usersRef),
        getDocs(applicantsRef),
      ]);
      
      const branchMap = new Map();
      branchesSnap.forEach(doc => branchMap.set(doc.id, doc.data().branchName));
      
      const userMap = new Map();
      usersSnap.forEach(doc => userMap.set(doc.id, doc.data().fullName || doc.data().email));
      
      const applicantMap = new Map();
      applicantsSnap.forEach(doc => applicantMap.set(doc.id, doc.data().fullName));

      snapshot.forEach(doc => {
        const data = doc.data();
        transfersData.push({
          id: doc.id,
          applicantId: data.applicantId,
          applicantName: applicantMap.get(data.applicantId) || 'Unknown',
          fromBranchId: data.fromBranchId,
          fromBranchName: branchMap.get(data.fromBranchId) || 'Unknown Branch',
          toBranchId: data.toBranchId,
          assignedOfficerId: data.assignedOfficerId,
          assignedOfficerName: data.assignedOfficerId ? userMap.get(data.assignedOfficerId) : undefined,
          transferStatus: data.transferStatus,
          requestedDate: data.requestedDate?.toDate(),
          approvedDate: data.approvedDate?.toDate(),
          completedDate: data.completedDate?.toDate(),
          transferReason: data.transferReason || '',
        });
      });

      // Apply status filter
      const filteredTransfers = statusFilter === 'all' 
        ? transfersData 
        : transfersData.filter(t => t.transferStatus === statusFilter);
      
      setTransfers(filteredTransfers);
      
      // Calculate statistics
      const newStats: TransferStats = {
        total: transfersData.length,
        pending: transfersData.filter(t => t.transferStatus === 'pending').length,
        approved: transfersData.filter(t => t.transferStatus === 'approved').length,
        rejected: transfersData.filter(t => t.transferStatus === 'rejected').length,
        completed: transfersData.filter(t => t.transferStatus === 'completed').length,
        avgProcessingTime: 0,
        byBranch: {},
        byMonth: {},
        byOfficer: {},
      };

      // Calculate average processing time
      const completedTransfers = transfersData.filter(t => t.completedDate && t.requestedDate);
      if (completedTransfers.length > 0) {
        const totalTime = completedTransfers.reduce((sum, t) => {
          const time = t.completedDate!.getTime() - t.requestedDate!.getTime();
          return sum + time;
        }, 0);
        newStats.avgProcessingTime = totalTime / completedTransfers.length / (1000 * 60 * 60 * 24); // Convert to days
      }

      // Group by branch
      transfersData.forEach(t => {
        newStats.byBranch[t.fromBranchName] = (newStats.byBranch[t.fromBranchName] || 0) + 1;
      });

      // Group by month
      transfersData.forEach(t => {
        const month = t.requestedDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        newStats.byMonth[month] = (newStats.byMonth[month] || 0) + 1;
      });

      // Group by officer
      transfersData.forEach(t => {
        if (t.assignedOfficerId && t.assignedOfficerName) {
          if (!newStats.byOfficer[t.assignedOfficerId]) {
            newStats.byOfficer[t.assignedOfficerId] = { count: 0, name: t.assignedOfficerName };
          }
          newStats.byOfficer[t.assignedOfficerId].count++;
        }
      });

      setStats(newStats);
      setError(null); // Clear any previous errors
    } catch (error: any) {
      console.error('Error fetching transfer data:', error);

      // Provide helpful error messages
      if (error.code === 'failed-precondition' || error.message?.includes('index')) {
        setError('Database indexes are still building. Please wait a few minutes and refresh the page.');
      } else if (error.code === 'permission-denied') {
        setError('You do not have permission to view this data. Please contact your administrator.');
      } else {
        setError('Failed to load transfer data. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    exportToPDF({
      title: 'Transfer Analytics Report',
      data: transfers,
      columns: ['applicantName', 'fromBranchName', 'assignedOfficerName', 'transferStatus', 'requestedDate'],
      summary: stats,
    });
  };

  const handleExportExcel = () => {
    // Format data for Excel export
    const excelData = transfers.map(t => ({
      'Applicant': t.applicantName,
      'From Branch': t.fromBranchName,
      'Assigned Officer': t.assignedOfficerName || '-',
      'Status': t.transferStatus,
      'Requested Date': t.requestedDate.toLocaleDateString(),
      'Approved Date': t.approvedDate?.toLocaleDateString() || '-',
      'Completed Date': t.completedDate?.toLocaleDateString() || '-',
      'Transfer Reason': t.transferReason || '-'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfer Analytics');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `transfer_analytics_${timestamp}.xlsx`);
  };

  const handleExportCSV = () => {
    // Format data for CSV export
    const csvData = transfers.map(t => ({
      'Applicant': t.applicantName,
      'From Branch': t.fromBranchName,
      'Assigned Officer': t.assignedOfficerName || '-',
      'Status': t.transferStatus,
      'Requested Date': t.requestedDate.toLocaleDateString(),
      'Approved Date': t.approvedDate?.toLocaleDateString() || '-',
      'Completed Date': t.completedDate?.toLocaleDateString() || '-',
      'Transfer Reason': t.transferReason || '-'
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(csvData);

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Transfer Analytics');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    XLSX.writeFile(wb, `transfer_analytics_${timestamp}.csv`, { bookType: 'csv' });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex items-center space-x-3">
            <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-semibold text-red-900">Error Loading Data</h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={fetchTransferData}
            className="mt-4 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link to="/reports" className="inline-flex items-center text-white hover:text-purple-100">
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Reports
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <ArrowsRightLeftIcon className="h-8 w-8 text-white" />
                <h1 className="text-2xl sm:text-3xl font-bold text-white">Transfer Analytics</h1>
              </div>
              <p className="mt-2 text-purple-100">
                Comprehensive analysis of applicant transfers from branches to Head Office
              </p>
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleExportExcel}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-purple-50"
              >
                Export Excel
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-purple-600 bg-white hover:bg-purple-50"
              >
                Export CSV
              </button>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Transfers</div>
              <div className="text-white text-xl md:text-2xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Pending</div>
              <div className="text-white text-xl md:text-2xl font-bold mt-1">{stats.pending}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Approved</div>
              <div className="text-white text-xl md:text-2xl font-bold mt-1">{stats.approved}</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Completed</div>
              <div className="text-white text-xl md:text-2xl font-bold mt-1">{stats.completed}</div>
            </div>
            <div className="bg-purple-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Avg. Processing</div>
              <div className="text-white text-xl md:text-2xl font-bold mt-1">{stats.avgProcessingTime.toFixed(1)}d</div>
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
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="quarter">Last Quarter</option>
                  <option value="year">Last Year</option>
                  <option value="all">All Time</option>
                </select>
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>

          {/* Help Card */}
          <ReportIntroCard
            title="Transfer Analytics Report"
            description="Track and analyze applicant transfers from branches to the Head Office, monitoring status, processing times, and officer assignments."
            whatYouWillSee={[
              'Transfer status distribution (pending, approved, rejected, completed)',
              'Monthly transfer trends to identify patterns',
              'Breakdown by branch and officer assignments',
              'Average processing time for completed transfers'
            ]}
            whenToUse="Use this report to monitor transfer efficiency, identify bottlenecks, and ensure timely officer assignments for transferred applicants."
            keyMetrics={[
              { name: 'Total Transfers', description: 'Total number of transfer requests in the selected period' },
              { name: 'Avg. Processing Time', description: 'Average number of days from request to completion' },
              { name: 'Status Distribution', description: 'Breakdown of transfers by current status' }
            ]}
          />

          {/* Transfer Details Table */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Transfer Details</h3>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-200">
              {transfers.map((transfer) => (
                <div key={transfer.id} className="p-4 hover:bg-gray-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">{transfer.applicantName}</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.transferStatus)}`}>
                        {transfer.transferStatus.charAt(0).toUpperCase() + transfer.transferStatus.slice(1)}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">From:</span>
                        <p className="text-gray-900 font-medium">{transfer.fromBranchName}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Officer:</span>
                        <p className="text-gray-900 font-medium">{transfer.assignedOfficerName || '-'}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Requested:</span>
                        <p className="text-gray-900">{transfer.requestedDate.toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Completed:</span>
                        <p className="text-gray-900">{transfer.completedDate?.toLocaleDateString() || '-'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">From Branch</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned Officer</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {transfers.map((transfer) => (
                    <tr key={transfer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {transfer.applicantName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.fromBranchName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.assignedOfficerName || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(transfer.transferStatus)}`}>
                          {transfer.transferStatus.charAt(0).toUpperCase() + transfer.transferStatus.slice(1)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.requestedDate.toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {transfer.completedDate?.toLocaleDateString() || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {transfers.length === 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No transfers found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {dateRange !== 'all' || statusFilter !== 'all'
                  ? 'No transfers match the selected filters. Try adjusting your filters or selecting "All Time".'
                  : 'No transfer requests in the system yet. Transfer requests will appear here when applicants are transferred to the Head Office.'}
              </p>
              {(dateRange !== 'all' || statusFilter !== 'all') && (
                <div className="mt-4 space-x-2">
                  {dateRange !== 'all' && (
                    <button
                      onClick={() => setDateRange('all')}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                    >
                      View All Time
                    </button>
                  )}
                  {statusFilter !== 'all' && (
                    <button
                      onClick={() => setStatusFilter('all')}
                      className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                      View All Statuses
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
