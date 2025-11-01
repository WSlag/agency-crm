import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ReportDefinition, ReportType, ReportFilter, ReportMetric, reportService } from '../../services/reports/reportService';
import { useReportStore } from '../../stores/reportStore';
import { useAuthStore } from '../../stores/authStore';
import {
  SparklesIcon,
  DocumentTextIcon,
  FunnelIcon,
  ChartBarIcon,
  ClockIcon,
  PlusIcon,
  TrashIcon,
  ArrowLeftIcon,
  QuestionMarkCircleIcon,
  FolderOpenIcon,
  EyeIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

// Import new enhanced components
import { SmartFieldSelector } from '../../components/reports/SmartFieldSelector';
import { OnboardingTour, useOnboardingTour, markTourCompleted } from '../../components/reports/OnboardingTour';
import { HelpCenter } from '../../components/reports/HelpCenter';
import { LivePreview } from '../../components/reports/LivePreview';
import { TemplateLibrary, SaveTemplateModal } from '../../components/reports/TemplateLibrary';
import { ReportIntroCard } from '../../components/reports/ReportIntroCard';
import { MetricTooltip } from '../../components/reports/MetricTooltip';
import { DatePresetSelector } from '../../components/reports/DatePresetSelector';
import { Toast } from '../../components/reports/Toast';
import { getFieldsForReportType } from '../../config/reportFieldSchemas';
import { createTemplate } from '../../services/reports/templateService';
import type { ReportTemplate } from '../../services/reports/templateService';

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
  const { user } = useAuthStore();
  const { generateReport: saveReport } = useReportStore();

  // Form state
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // New UI state for enhanced features
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: '',
      type: 'applicant_status',
      description: '',
      filters: [],
      metrics: [],
      groupBy: [],
      sortBy: []
    }
  });

  const reportType = watch('type');

  // Get available fields for current report type
  const availableFields = getFieldsForReportType(reportType);

  // Calculate progress
  const formData = watch();
  const progress = React.useMemo(() => {
    const steps = [
      formData.name.length > 0, // Basic info filled
      filters.length > 0, // At least one filter
      metrics.length > 0, // At least one metric
    ];
    const completed = steps.filter(Boolean).length;
    return { completed, total: steps.length, percentage: (completed / steps.length) * 100 };
  }, [formData.name, filters.length, metrics.length]);

  // Initialize onboarding tour
  const { startTour } = useOnboardingTour({ onComplete: markTourCompleted });

  // Sync filters and metrics with form state
  useEffect(() => {
    setValue('filters', filters);
  }, [filters, setValue]);

  useEffect(() => {
    setValue('metrics', metrics);
  }, [metrics, setValue]);

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

  // New helper functions for enhanced features
  const handleUpdateFilter = (index: number, field: keyof ReportFilter, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const handleUpdateMetric = (index: number, field: keyof ReportMetric, value: any) => {
    const newMetrics = [...metrics];
    newMetrics[index] = { ...newMetrics[index], [field]: value };
    setMetrics(newMetrics);
  };

  const handleLoadTemplate = (template: ReportTemplate) => {
    setValue('name', template.name);
    setValue('type', template.reportType as any);
    setValue('description', template.description);
    setFilters(template.filters || []);
    setMetrics(template.metrics || []);
    setShowTemplateLibrary(false);

    // Show success toast
    setToastMessage(`✓ Template loaded: ${template.name}`);
  };

  const handleSaveAsTemplate = async (
    name: string,
    description: string,
    isPublic: boolean,
    tags: string[]
  ) => {
    if (!user) return;

    try {
      const formData = watch();
      await createTemplate({
        name,
        description,
        reportType: formData.type,
        filters,
        metrics,
        createdBy: user.uid,
        organizationId: user.organizationId,
        isPublic,
        tags,
      });
      alert('Template saved successfully!');
      setShowSaveTemplateModal(false);
    } catch (err) {
      console.error('Error saving template:', err);
      alert('Failed to save template');
    }
  };

  const onSubmit = async (data: ReportFormData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      if (!user) {
        throw new Error('User not authenticated');
      }

      // Build report definition
      const definition: ReportDefinition = {
        id: '', // Will be set by Firestore
        name: data.name,
        type: data.type,
        description: data.description || '',
        filters: filters,
        metrics: metrics,
        groupBy: data.groupBy,
        sortBy: data.sortBy,
        schedule: data.schedule,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      console.log('Generating report with definition:', definition);

      // Generate the report using ReportService
      const result = await reportService.generateReport(definition);

      console.log('Report generated successfully:', result);

      // Save report metadata to Firestore via store
      const reportId = await saveReport(
        data.name,
        data.type,
        data.schedule?.format || 'pdf',
        {
          startDate: filters.find(f => f.field === 'startDate')?.value,
          endDate: filters.find(f => f.field === 'endDate')?.value,
        }
      );

      setSuccess('Report generated successfully!');

      // Navigate to reports list after a short delay
      setTimeout(() => {
        navigate('/reports/list');
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create report');
      console.error('Error creating report:', err);
    } finally {
      setLoading(false);
    }
  };

  const onError = (errors: any) => {
    console.error('Form validation errors:', errors);
    console.log('Detailed errors:', JSON.stringify(errors, null, 2));

    // Create user-friendly error messages
    const errorMessages: string[] = [];

    if (errors.name) {
      errorMessages.push('Report name is required');
    }
    if (errors.filters) {
      errorMessages.push(`Please check your filters: ${errors.filters.message || 'At least one filter is required'}`);
    }
    if (errors.metrics) {
      errorMessages.push(`Please check your metrics: ${errors.metrics.message || 'At least one metric is required'}`);
    }

    const finalMessage = errorMessages.length > 0
      ? errorMessages.join('. ')
      : 'Please check all required fields';

    setError(finalMessage);

    // Scroll to the first error section
    if (errors.name) {
      // Scroll to basic info section (top of form)
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (errors.filters) {
      // Scroll to filters section
      const filtersSection = document.getElementById('filters-section');
      if (filtersSection) {
        filtersSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the section briefly
        filtersSection.classList.add('ring-4', 'ring-red-500', 'ring-opacity-50');
        setTimeout(() => {
          filtersSection.classList.remove('ring-4', 'ring-red-500', 'ring-opacity-50');
        }, 2000);
      }
    } else if (errors.metrics) {
      // Scroll to metrics section
      const metricsSection = document.getElementById('metrics-section');
      if (metricsSection) {
        metricsSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Highlight the section briefly
        metricsSection.classList.add('ring-4', 'ring-red-500', 'ring-opacity-50');
        setTimeout(() => {
          metricsSection.classList.remove('ring-4', 'ring-red-500', 'ring-opacity-50');
        }, 2000);
      }
    } else {
      // Default: scroll to top
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Onboarding Tour */}
      <OnboardingTour onComplete={markTourCompleted} />

      {/* Header with gradient background */}
      <div id="report-builder-header" className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-end mb-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <FolderOpenIcon className="h-4 w-4 mr-2" />
                Templates
              </button>
              <button
                id="help-button"
                onClick={() => setShowHelpCenter(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
              >
                <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                Help
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Report Builder</h1>
          </div>
          <p className="mt-2 text-indigo-100">
            Create custom reports with filters, metrics, and schedules
          </p>

          {/* Progress Indicator */}
          <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-white">
                Progress: {progress.completed} of {progress.total} steps completed
              </span>
              <span className="text-sm font-semibold text-white">
                {Math.round(progress.percentage)}%
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2.5">
              <div
                className="bg-gradient-to-r from-green-400 to-emerald-500 h-2.5 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress.percentage}%` }}
              />
            </div>
            <div className="mt-2 flex items-center gap-4 text-xs text-white/90">
              <span className={formData.name.length > 0 ? 'text-green-200' : 'text-white/70'}>
                {formData.name.length > 0 ? '✓' : '○'} Basic Info
              </span>
              <span className={filters.length > 0 ? 'text-green-200' : 'text-white/70'}>
                {filters.length > 0 ? '✓' : '○'} Filters ({filters.length})
              </span>
              <span className={metrics.length > 0 ? 'text-green-200' : 'text-white/70'}>
                {metrics.length > 0 ? '✓' : '○'} Metrics ({metrics.length})
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Intro Card */}
          <ReportIntroCard
            title="How to Build a Custom Report"
            description="Follow these simple steps to create a powerful custom report tailored to your needs."
            whatYouWillSee={[
              'Choose what type of data to report on',
              'Filter the data to show only what you need',
              'Add metrics to calculate totals, averages, counts, etc.',
              'Preview your report before generating it',
              'Save your configuration as a template for reuse',
            ]}
            whenToUse="Use the custom report builder when the quick reports don't meet your specific needs, or when you want to combine filters and metrics in unique ways."
            keyMetrics={[
              {
                name: 'Filters',
                description: 'Narrow down which data to include (e.g., only this month, only Main branch)',
              },
              {
                name: 'Metrics',
                description: 'What to calculate from the data (e.g., count applicants, sum expenses)',
              },
            ]}
          />

          {/* Quick Reports */}
          <div id="quick-reports-section" className="mb-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
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

          {success && (
            <div className="mb-6 rounded-xl bg-green-50 border-2 border-green-200 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
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
            <div id="filters-section" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Filters (What data to include)</h3>
                  <MetricTooltip
                    title="Filters"
                    description="Filters narrow down which records to include in your report. Think of it as answering 'Which data do I want to see?'"
                    example='Status equals "Approved" OR Date between Jan 1 and Mar 31'
                  />
                </div>
                <button
                  id="add-filter-button"
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
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No filters added yet.</p>
                    <p className="text-sm text-gray-400">Click "Add Filter" to narrow down your data by date, branch, status, etc.</p>
                  </div>
                ) : (
                  filters.map((filter, index) => (
                    <div key={index} className="flex space-x-4 items-start bg-gray-50 rounded-lg p-4">
                      <div className="flex-1">
                        <SmartFieldSelector
                          value={filters[index]?.field || ''}
                          onChange={(value) => handleUpdateFilter(index, 'field', value)}
                          reportType={reportType}
                          availableFields={availableFields}
                          placeholder="Select or type a field..."
                          label="Field"
                        />
                      </div>
                      <div className="w-48">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Operator</label>
                        <select
                          value={filters[index]?.operator || 'eq'}
                          onChange={(e) => handleUpdateFilter(index, 'operator', e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                        >
                          {(() => {
                            const selectedField = availableFields.find(f => f.value === filters[index]?.field);
                            const fieldType = selectedField?.type;

                            // All fields support equals
                            const operators = [
                              <option key="eq" value="eq">Equals</option>
                            ];

                            // Numeric, currency, and date fields support comparisons
                            if (fieldType === 'number' || fieldType === 'currency' || fieldType === 'date' || fieldType === 'percentage') {
                              operators.push(
                                <option key="gt" value="gt">Greater Than</option>,
                                <option key="lt" value="lt">Less Than</option>,
                                <option key="gte" value="gte">Greater or Equal</option>,
                                <option key="lte" value="lte">Less or Equal</option>,
                                <option key="between" value="between">Between</option>
                              );
                            }

                            // Text fields support "in" (multiple values)
                            if (fieldType === 'text') {
                              operators.push(
                                <option key="in" value="in">In List</option>
                              );
                            }

                            return operators;
                          })()}
                        </select>
                        {(() => {
                          const selectedField = availableFields.find(f => f.value === filters[index]?.field);
                          const fieldType = selectedField?.type;

                          if (fieldType === 'date') {
                            return (
                              <p className="mt-1 text-xs text-indigo-600">
                                💡 Tip: Use "Between" for date ranges
                              </p>
                            );
                          }
                          return null;
                        })()}
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
                        {(() => {
                          const selectedField = availableFields.find(f => f.value === filters[index]?.field);
                          const isDateField = selectedField?.type === 'date';

                          return isDateField ? (
                            <DatePresetSelector
                              value={filters[index]?.value || ''}
                              onChange={(value) => handleUpdateFilter(index, 'value', value)}
                              placeholder="Select date preset or type date..."
                            />
                          ) : (
                            <input
                              value={filters[index]?.value || ''}
                              onChange={(e) => handleUpdateFilter(index, 'value', e.target.value)}
                              placeholder="Enter value..."
                              className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                            />
                          );
                        })()}
                      </div>
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={() => handleRemoveFilter(index)}
                          className="inline-flex items-center p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Remove filter"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Metrics */}
            <div id="metrics-section" className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-2">
                  <ChartBarIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Metrics (What to calculate)</h3>
                  <MetricTooltip
                    title="Metrics"
                    description="Metrics are the calculations you want to see in your report. Think of it as answering 'What do I want to measure?'"
                    example='Count of Applicants = 150, Sum of Expenses = $45,230'
                  />
                </div>
                <button
                  id="add-metric-button"
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
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-2">No metrics added yet.</p>
                    <p className="text-sm text-gray-400">Click "Add Metric" to calculate totals, averages, counts, etc.</p>
                  </div>
                ) : (
                  metrics.map((metric, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 items-start bg-gray-50 rounded-lg p-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Metric Name</label>
                        <input
                          value={metrics[index]?.name || ''}
                          onChange={(e) => handleUpdateMetric(index, 'name', e.target.value)}
                          placeholder="e.g., Total Revenue"
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                          Calculation
                          <MetricTooltip
                            title="Calculation Types"
                            description="Choose how to summarize your data"
                            formula="Count: Total number | Sum: Add all values | Average: Mean value"
                          />
                        </label>
                        <select
                          value={metrics[index]?.calculation || 'count'}
                          onChange={(e) => handleUpdateMetric(index, 'calculation', e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                        >
                          <option value="count">Count</option>
                          <option value="sum">Sum</option>
                          <option value="average">Average</option>
                          <option value="min">Minimum</option>
                          <option value="max">Maximum</option>
                        </select>
                      </div>
                      <div>
                        {(() => {
                          const calculationType = metrics[index]?.calculation || 'count';
                          const isCountCalculation = calculationType === 'count';

                          // Filter fields for sum/average - only numeric/currency
                          const filteredFields = ['sum', 'average'].includes(calculationType)
                            ? availableFields.filter(f =>
                                f.type === 'number' || f.type === 'currency' || f.type === 'percentage'
                              )
                            : availableFields;

                          return isCountCalculation ? (
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Field</label>
                              <div className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 italic">
                                Not needed for Count
                              </div>
                              <p className="mt-1 text-xs text-gray-500">
                                💡 Count doesn't require a field - it counts all matching records
                              </p>
                            </div>
                          ) : (
                            <SmartFieldSelector
                              value={metrics[index]?.field || ''}
                              onChange={(value) => handleUpdateMetric(index, 'field', value)}
                              reportType={reportType}
                              availableFields={filteredFields}
                              placeholder={`Select ${calculationType === 'sum' ? 'numeric' : calculationType === 'average' ? 'numeric' : ''} field...`}
                              label={`Field ${['sum', 'average'].includes(calculationType) ? '(Numeric only)' : ''}`}
                            />
                          );
                        })()}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                        <select
                          value={metrics[index]?.format || 'number'}
                          onChange={(e) => handleUpdateMetric(index, 'format', e.target.value)}
                          className="w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm bg-white"
                        >
                          <option value="number">Number</option>
                          <option value="currency">Currency</option>
                          <option value="percentage">Percentage</option>
                          <option value="date">Date</option>
                        </select>
                      </div>
                      <div className="pt-6">
                        <button
                          type="button"
                          onClick={() => handleRemoveMetric(index)}
                          className="inline-flex items-center p-2.5 text-red-600 hover:text-white bg-red-50 hover:bg-red-600 rounded-lg transition-all duration-200 hover:scale-105"
                          title="Remove metric"
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

            {/* Live Preview */}
            <div id="preview-section">
              <LivePreview
                reportType={reportType}
                filters={filters}
                metrics={metrics}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-between items-center space-x-4">
              <button
                type="button"
                onClick={() => setShowSaveTemplateModal(true)}
                disabled={metrics.length === 0}
                className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-indigo-600 bg-indigo-50 border-2 border-indigo-200 rounded-lg shadow-sm hover:bg-indigo-100 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <BookmarkIcon className="h-4 w-4 mr-2" />
                Save as Template
              </button>
              <div className="flex space-x-4">
                <button
                  type="button"
                  onClick={() => navigate('/reports')}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200"
                >
                  Cancel
                </button>
                <button
                  id="create-report-button"
                  type="submit"
                  disabled={loading}
                  onClick={() => console.log('Create Report button clicked', { reportType, filters, metrics })}
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
            </div>
          </form>
        </div>
      </div>

      {/* Modals */}
      <HelpCenter
        isOpen={showHelpCenter}
        onClose={() => setShowHelpCenter(false)}
        onRestartTour={startTour}
      />

      <TemplateLibrary
        isOpen={showTemplateLibrary}
        onClose={() => setShowTemplateLibrary(false)}
        onLoadTemplate={handleLoadTemplate}
      />

      <SaveTemplateModal
        isOpen={showSaveTemplateModal}
        onClose={() => setShowSaveTemplateModal(false)}
        onSave={handleSaveAsTemplate}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="success"
          onClose={() => setToastMessage(null)}
        />
      )}
    </div>
  );
};
