import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReportDefinition, ReportType, ReportFilter, ReportMetric } from '../../services/reports/reportService';
import { DashboardLayout } from '../../components/layout/DashboardLayout';

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
    } catch (err) {
      setError('Failed to create report');
      console.error('Error creating report:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white shadow-lg rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-6">Report Builder</h2>
            
            {error && (
              <div className="mb-4 bg-red-50 p-4 rounded-md">
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
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Name</label>
                  <input
                    type="text"
                    {...register('name')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Report Type</label>
                  <select
                    {...register('type')}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                    <p className="mt-1 text-sm text-red-600">{errors.type.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>

              {/* Filters */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Filters</h3>
                  <button
                    type="button"
                    onClick={handleAddFilter}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Add Filter
                  </button>
                </div>
                
                {filters.map((filter, index) => (
                  <div key={index} className="flex space-x-4">
                    <input
                      {...register(`filters.${index}.field`)}
                      placeholder="Field"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <select
                      {...register(`filters.${index}.operator`)}
                      className="w-32 border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="eq">Equals</option>
                      <option value="gt">Greater Than</option>
                      <option value="lt">Less Than</option>
                      <option value="between">Between</option>
                    </select>
                    <input
                      {...register(`filters.${index}.value`)}
                      placeholder="Value"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFilter(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Metrics */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Metrics</h3>
                  <button
                    type="button"
                    onClick={handleAddMetric}
                    className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Add Metric
                  </button>
                </div>
                
                {metrics.map((metric, index) => (
                  <div key={index} className="flex space-x-4">
                    <input
                      {...register(`metrics.${index}.name`)}
                      placeholder="Metric Name"
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <select
                      {...register(`metrics.${index}.calculation`)}
                      className="w-32 border border-gray-300 rounded-md shadow-sm p-2"
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
                      className="flex-1 border border-gray-300 rounded-md shadow-sm p-2"
                    />
                    <select
                      {...register(`metrics.${index}.format`)}
                      className="w-32 border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="number">Number</option>
                      <option value="currency">Currency</option>
                      <option value="percentage">Percentage</option>
                      <option value="date">Date</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveMetric(index)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              {/* Schedule */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Schedule (Optional)</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Frequency</label>
                    <select
                      {...register('schedule.frequency')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                    >
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Format</label>
                    <select
                      {...register('schedule.format')}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
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
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Report'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
