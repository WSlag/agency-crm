import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReportDefinition, ReportType, ReportFilter, ReportMetric } from '../../services/reports/reportService';
import { 
  SparklesIcon, 
  DocumentTextIcon, 
  FunnelIcon, 
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const reportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  type: z.enum([
    'applicant_status',
    'transfer_analytics',
    'financial_summary',
    'commission_report',
    'document_verification',
    'branch_performance',
    'agent_performance'
  ]),
  description: z.string(),
  filters: z.array(z.object({
    field: z.string(),
    operator: z.enum(['eq', 'gt', 'lt', 'gte', 'lte', 'in', 'between']),
    value: z.any()
  })),
  metrics: z.array(z.object({
    name: z.string(),
    calculation: z.enum(['count', 'sum', 'average', 'min', 'max']),
    field: z.string().optional(),
    format: z.enum(['number', 'currency', 'percentage', 'date']).optional()
  })),
  groupBy: z.array(z.string()).optional(),
  sortBy: z.array(z.object({
    field: z.string(),
    order: z.enum(['asc', 'desc'])
  })).optional(),
  schedule: z.object({
    frequency: z.enum(['daily', 'weekly', 'monthly']),
    recipients: z.array(z.string()),
    format: z.enum(['pdf', 'excel'])
  }).optional()
});

type ReportFormData = z.infer<typeof reportSchema>;

export const ReportBuilder: React.FC = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema)
  });

  const reportType = watch('type');

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: 'eq', value: '' }]);
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleAddMetric = () => {
    setMetrics([...metrics, { name: '', calculation: 'count', field: '', format: 'number' }]);
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      setLoading(true);
      setError(null);
      
      // TODO: Implement report creation logic
      console.log('Creating report:', data);
      
      // Navigate to reports list
      navigate('/reports');
    } catch (err) {
      setError('Failed to create report');
      console.error('Error creating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/reports')}
            className="group mb-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Reports
          </button>
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Report Builder</h1>
          </div>
          <p className="mt-2 text-indigo-100">
            Create custom reports with filters, metrics, and schedules
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Quick Reports */}
          <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Reports</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <button
                onClick={() => navigate('/reports/transfer-analytics')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200">
                    <ChartBarIcon className="h-6 w-6 text-purple-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Transfer Analytics</div>
                    <div className="text-xs text-gray-500">Branch to HO transfers</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reports/officer-performance')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-indigo-100 rounded-lg group-hover:bg-indigo-200">
                    <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Officer Performance</div>
                    <div className="text-xs text-gray-500">HO Recruitment Officers</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reports/deployment')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200">
                    <ChartBarIcon className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Deployment Reports</div>
                    <div className="text-xs text-gray-500">Overseas deployments</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reports/financial')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg group-hover:bg-orange-200">
                    <ChartBarIcon className="h-6 w-6 text-orange-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Financial Reports</div>
                    <div className="text-xs text-gray-500">Expenses & Commissions</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reports/branch-performance')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200">
                    <ChartBarIcon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Branch Performance</div>
                    <div className="text-xs text-gray-500">All branches</div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => navigate('/reports/agent-performance')}
                className="p-4 border-2 border-gray-200 rounded-lg hover:border-teal-500 hover:bg-teal-50 transition-all text-left group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-teal-100 rounded-lg group-hover:bg-teal-200">
                    <ChartBarIcon className="h-6 w-6 text-teal-600" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900">Agent Performance</div>
                    <div className="text-xs text-gray-500">Agent metrics</div>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
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
          )}
          
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Report Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                    placeholder="Enter report name"
                  />
                  {errors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Report Type</label>
                  <select
                    {...register('type')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                  >
                    <option value="applicant_status">Applicant Status</option>
                    <option value="transfer_analytics">Transfer Analytics</option>
                    <option value="financial_summary">Financial Summary</option>
                    <option value="commission_report">Commission Report</option>
                    <option value="document_verification">Document Verification</option>
                    <option value="branch_performance">Branch Performance</option>
                    <option value="agent_performance">Agent Performance</option>
                  </select>
                  {errors.type && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                    placeholder="Describe what this report will show..."
                  />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Filters</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddFilter}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Filter
                </button>
              </div>
              
              <div className="space-y-4">
                {filters.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No filters added yet. Click "Add Filter" to get started.</p>
                ) : (
                  filters.map((filter, index) => (
                    <div key={index} className="flex space-x-4 items-start bg-gray-50 rounded-lg p-4">
                      <input
                        {...register(`filters.${index}.field`)}
                        placeholder="Field name"
                        className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <select
                        {...register(`filters.${index}.operator`)}
                        className="w-40 rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                      >
                        <option value="eq">Equals</option>
                        <option value="gt">Greater Than</option>
                        <option value="lt">Less Than</option>
                        <option value="between">Between</option>
                      </select>
                      <input
                        {...register(`filters.${index}.value`)}
                        placeholder="Value"
                        className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFilter(index)}
                        className="inline-flex items-center p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-105"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Metrics */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Metrics</h3>
                </div>
                <button
                  type="button"
                  onClick={handleAddMetric}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-lg"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Metric
                </button>
              </div>
              
              <div className="space-y-4">
                {metrics.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No metrics added yet. Click "Add Metric" to get started.</p>
                ) : (
                  metrics.map((metric, index) => (
                    <div key={index} className="grid grid-cols-4 gap-4 items-start bg-gray-50 rounded-lg p-4">
                      <input
                        {...register(`metrics.${index}.name`)}
                        placeholder="Metric Name"
                        className="rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <select
                        {...register(`metrics.${index}.calculation`)}
                        className="rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                      >
                        <option value="count">Count</option>
                        <option value="sum">Sum</option>
                        <option value="average">Average</option>
                        <option value="min">Minimum</option>
                        <option value="max">Maximum</option>
                      </select>
                      <input
                        {...register(`metrics.${index}.field`)}
                        placeholder="Field"
                        className="rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                      <div className="flex space-x-2">
                        <select
                          {...register(`metrics.${index}.format`)}
                          className="flex-1 rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                        >
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="percentage">Percentage</option>
                          <option value="date">Date</option>
                        </select>
                        <button
                          type="button"
                          onClick={() => handleRemoveMetric(index)}
                          className="inline-flex items-center p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-105"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Schedule */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ClockIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Schedule (Optional)</h3>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Frequency</label>
                  <select
                    {...register('schedule.frequency')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Export Format</label>
                  <select
                    {...register('schedule.format')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                  >
                    <option value="pdf">PDF</option>
                    <option value="excel">Excel</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate('/reports')}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-transparent rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Report'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
