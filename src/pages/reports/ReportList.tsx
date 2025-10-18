import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReportStore } from '../../stores/reportStore';
import { useAuthStore } from '../../stores/authStore';
import { exportService } from '../../services/reports/exportService';
import {
  SparklesIcon,
  DocumentTextIcon,
  PlusIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  TrashIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';

export const ReportList: React.FC = () => {
  const navigate = useNavigate();
  const { customClaims } = useAuthStore();
  const { reports, loading, error, fetchReports, deleteReport } = useReportStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'name'>('date');

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the report "${name}"?`)) {
      try {
        await deleteReport(id);
        await fetchReports();
      } catch (err) {
        console.error('Failed to delete report:', err);
      }
    }
  };

  const filteredReports = reports
    .filter(report => {
      const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (report.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || report.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      }
      return a.name.localeCompare(b.name);
    });

  const getReportTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'applicant_status': 'Applicant Status',
      'transfer_analytics': 'Transfer Analytics',
      'financial_summary': 'Financial Summary',
      'commission_report': 'Commission Report',
      'document_verification': 'Document Verification',
      'branch_performance': 'Branch Performance',
      'agent_performance': 'Agent Performance',
    };
    return labels[type] || type;
  };

  const getReportTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'applicant_status': 'from-blue-400 to-indigo-500',
      'transfer_analytics': 'from-purple-400 to-pink-500',
      'financial_summary': 'from-green-400 to-emerald-500',
      'commission_report': 'from-yellow-400 to-orange-500',
      'document_verification': 'from-red-400 to-rose-500',
      'branch_performance': 'from-cyan-400 to-blue-500',
      'agent_performance': 'from-teal-400 to-green-500',
    };
    return colors[type] || 'from-gray-400 to-gray-500';
  };

  const canCreateReports = ['admin', 'president', 'ho_accountant'].includes(customClaims?.role || '');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
                  <DocumentTextIcon className="h-10 w-10 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold text-white">Reports</h1>
                  <p className="text-indigo-100 mt-1">View and manage your generated reports</p>
                </div>
              </div>
              {canCreateReports && (
                <button
                  onClick={() => navigate('/reports/builder')}
                  className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white font-medium hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Create Report
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search reports..."
                className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FunnelIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
              >
                <option value="all">All Types</option>
                <option value="applicant_status">Applicant Status</option>
                <option value="transfer_analytics">Transfer Analytics</option>
                <option value="financial_summary">Financial Summary</option>
                <option value="commission_report">Commission Report</option>
                <option value="document_verification">Document Verification</option>
                <option value="branch_performance">Branch Performance</option>
                <option value="agent_performance">Agent Performance</option>
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <CalendarIcon className="h-5 w-5 text-gray-400" />
              </div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'name')}
                className="block w-full pl-10 pr-3 py-2.5 border-2 border-gray-300 rounded-lg focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
              >
                <option value="date">Sort by Date</option>
                <option value="name">Sort by Name</option>
              </select>
            </div>
          </div>
        </div>

        {/* Reports List */}
        {filteredReports.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-12 text-center">
            <DocumentTextIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || filterType !== 'all'
                ? 'Try adjusting your search or filter criteria.'
                : 'Get started by creating your first report.'}
            </p>
            {canCreateReports && !searchTerm && filterType === 'all' && (
              <button
                onClick={() => navigate('/reports/builder')}
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Report
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {filteredReports.map((report) => (
              <div
                key={report.id}
                className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className={`h-2 bg-gradient-to-r ${getReportTypeColor(report.type)}`}></div>
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-xl font-bold text-gray-900">{report.name}</h3>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getReportTypeColor(report.type)} text-white`}>
                          {getReportTypeLabel(report.type)}
                        </span>
                      </div>
                      {report.description && (
                        <p className="text-sm text-gray-600 mb-3">{report.description}</p>
                      )}
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <CalendarIcon className="h-4 w-4" />
                          <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                        </div>
                        {report.format && (
                          <div className="flex items-center space-x-1">
                            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
                              {report.format.toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => navigate(`/reports/${report.id}`)}
                        className="p-2 text-indigo-600 hover:text-white hover:bg-indigo-600 rounded-lg transition-all"
                        title="View Report"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          // Export functionality - to be implemented
                          console.log('Export report:', report.id);
                        }}
                        className="p-2 text-green-600 hover:text-white hover:bg-green-600 rounded-lg transition-all"
                        title="Export Report"
                      >
                        <ArrowDownTrayIcon className="h-5 w-5" />
                      </button>
                      {canCreateReports && (
                        <button
                          onClick={() => handleDelete(report.id, report.name)}
                          className="p-2 text-red-600 hover:text-white hover:bg-red-600 rounded-lg transition-all"
                          title="Delete Report"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

