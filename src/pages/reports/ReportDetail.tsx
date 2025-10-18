import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useReportStore } from '../../stores/reportStore';
import { exportService, ExportFormat } from '../../services/reports/exportService';
import { reportService } from '../../services/reports/reportService';
import {
  SparklesIcon,
  ArrowLeftIcon,
  ArrowDownTrayIcon,
  ChartBarIcon,
  CalendarIcon,
  DocumentTextIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';

export const ReportDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reports, loading, error, fetchReports, deleteReport } = useReportStore();
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);

  const report = reports.find(r => r.id === id);

  useEffect(() => {
    if (!reports.length) {
      fetchReports();
    }
  }, [reports.length, fetchReports]);

  const handleExport = async (format: ExportFormat) => {
    if (!report) return;

    try {
      setExporting(true);
      setExportError(null);

      // Re-generate the report data
      const result = await reportService.generateReport({
        id: report.id,
        name: report.name,
        type: report.type,
        description: report.description || '',
        filters: report.filters || [],
        metrics: report.metrics || [],
        groupBy: report.groupBy || [],
        sortBy: report.sortBy || [],
        createdAt: new Date(report.createdAt),
        updatedAt: new Date(report.updatedAt),
      });

      // Export the result
      await exportService.exportReport(result, format);
    } catch (err) {
      console.error('Export failed:', err);
      setExportError(err instanceof Error ? err.message : 'Export failed');
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (!report) return;
    
    if (window.confirm(`Are you sure you want to delete "${report.name}"?`)) {
      try {
        await deleteReport(report.id);
        navigate('/reports/list');
      } catch (err) {
        console.error('Failed to delete report:', err);
      }
    }
  };

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

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Report Not Found</h3>
            <p className="text-gray-600 mb-6">{error || 'The report you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/reports/list')}
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Reports
            </button>
          </div>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/reports/list')}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all transform hover:scale-110"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-white" />
                </button>
                <div>
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                    <h1 className="text-3xl font-bold text-white">{report.name}</h1>
                  </div>
                  <p className="text-indigo-100 mt-1">{getReportTypeLabel(report.type)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <div className="relative group">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={exporting}
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white font-medium hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    {exporting ? 'Exporting...' : 'Export CSV'}
                  </button>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => handleExport('pdf')}
                    disabled={exporting}
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white font-medium hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg disabled:opacity-50"
                  >
                    <ArrowDownTrayIcon className="h-5 w-5 mr-2" />
                    {exporting ? 'Exporting...' : 'Export PDF'}
                  </button>
                </div>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-6 py-3 bg-red-500/90 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white font-medium hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg"
                >
                  <TrashIcon className="h-5 w-5 mr-2" />
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>

        {exportError && (
          <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <p className="text-sm text-red-800">{exportError}</p>
          </div>
        )}

        {/* Report Details */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Report Information</h3>
          </div>
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Report Type</dt>
                <dd className="text-sm font-medium text-gray-900">{getReportTypeLabel(report.type)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Format</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {report.format ? report.format.toUpperCase() : 'PDF'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Created At</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{new Date(report.createdAt).toLocaleString()}</span>
                  </div>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500 mb-1">Last Updated</dt>
                <dd className="text-sm font-medium text-gray-900">
                  <div className="flex items-center space-x-2">
                    <CalendarIcon className="h-4 w-4 text-gray-400" />
                    <span>{new Date(report.updatedAt).toLocaleString()}</span>
                  </div>
                </dd>
              </div>
              {report.description && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Description</dt>
                  <dd className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {report.description}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Filters */}
        {report.filters && report.filters.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-5 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Applied Filters</h3>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-3">
                {report.filters.map((filter, index) => (
                  <div key={index} className="flex items-center space-x-3 bg-purple-50 rounded-lg p-3 border border-purple-200">
                    <div className="flex-1">
                      <span className="font-medium text-gray-900">{filter.field}</span>
                      <span className="text-gray-500 mx-2">{filter.operator}</span>
                      <span className="text-gray-700">{String(filter.value)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Metrics */}
        {report.metrics && report.metrics.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-5 border-b border-gray-200">
              <div className="flex items-center space-x-2">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Metrics</h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {report.metrics.map((metric, index) => (
                  <div key={index} className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="text-sm font-medium text-gray-500 mb-1">{metric.name}</div>
                    <div className="text-xs text-gray-600">
                      {metric.calculation} of {metric.field}
                    </div>
                    {metric.format && (
                      <div className="mt-2">
                        <span className="px-2 py-1 bg-green-200 text-green-800 text-xs font-semibold rounded">
                          {metric.format}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Export Instructions */}
        <div className="bg-gradient-to-r from-indigo-100 to-purple-100 rounded-2xl border-2 border-indigo-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Export Options</h3>
          <p className="text-sm text-gray-700 mb-4">
            Click the export buttons above to download this report in your preferred format:
          </p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
              <span><strong>CSV:</strong> Spreadsheet format for data analysis in Excel or Google Sheets</span>
            </li>
            <li className="flex items-center space-x-2">
              <span className="flex-shrink-0 w-1.5 h-1.5 bg-indigo-600 rounded-full"></span>
              <span><strong>PDF:</strong> Document format for printing or sharing</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

