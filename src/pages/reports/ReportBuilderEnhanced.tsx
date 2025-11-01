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
  PlayIcon,
  CheckCircleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  BookmarkIcon,
} from '@heroicons/react/24/outline';

// Import new components
import { SmartFieldSelector } from '../../components/reports/SmartFieldSelector';
import { OnboardingTour, useOnboardingTour, markTourCompleted } from '../../components/reports/OnboardingTour';
import { HelpCenter } from '../../components/reports/HelpCenter';
import { LivePreview } from '../../components/reports/LivePreview';
import { TemplateLibrary, SaveTemplateModal } from '../../components/reports/TemplateLibrary';
import { ReportIntroCard } from '../../components/reports/ReportIntroCard';
import { MetricTooltip } from '../../components/reports/MetricTooltip';

// Import schema and helpers
import {
  getFieldsForReportType,
  CALCULATION_TYPES,
  OPERATORS,
  DATE_PRESETS,
  getCalculationsForFieldType,
  getFieldByValue,
} from '../../config/reportFieldSchemas';
import { createTemplate as saveTemplate, createTemplateFromQuickReport } from '../../services/reports/templateService';
import { ReportTemplate } from '../../services/reports/templateService';

const reportSchema = z.object({
  name: z.string().min(1, 'Report name is required'),
  type: z.enum([
    'applicant-status',
    'transfer-analytics',
    'financial',
    'officer-performance',
    'deployment',
    'branch-performance',
    'agent-performance',
  ]),
  description: z.string(),
});

type ReportFormData = z.infer<typeof reportSchema>;

export const ReportBuilderEnhanced: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { generateReport: saveReport } = useReportStore();

  // Form state
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [metrics, setMetrics] = useState<ReportMetric[]>([]);
  const [schedule, setSchedule] = useState<{ frequency: string; format: string } | null>(null);

  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    filters: true,
    metrics: true,
    schedule: false,
    preview: true,
  });

  // Modal states
  const [showHelpCenter, setShowHelpCenter] = useState(false);
  const [showTemplateLibrary, setShowTemplateLibrary] = useState(false);
  const [showSaveTemplateModal, setShowSaveTemplateModal] = useState(false);
  const [showQuickReportMenu, setShowQuickReportMenu] = useState<string | null>(null);

  // Progress tracking
  const [completionStatus, setCompletionStatus] = useState({
    basicInfo: false,
    hasFilters: false,
    hasMetrics: false,
  });

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      name: '',
      type: 'applicant-status',
      description: '',
    },
  });

  const reportType = watch('type');
  const reportName = watch('name');

  // Get available fields for current report type
  const availableFields = getFieldsForReportType(reportType);

  // Update completion status
  useEffect(() => {
    setCompletionStatus({
      basicInfo: !!reportName && reportName.length > 0,
      hasFilters: filters.length > 0,
      hasMetrics: metrics.length > 0,
    });
  }, [reportName, filters, metrics]);

  // Auto-expand next section
  useEffect(() => {
    if (completionStatus.basicInfo && !expandedSections.filters) {
      setExpandedSections((prev) => ({ ...prev, filters: true }));
    }
  }, [completionStatus.basicInfo]);

  const { startTour } = useOnboardingTour({
    onComplete: markTourCompleted,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleAddFilter = () => {
    setFilters([...filters, { field: '', operator: 'eq', value: '' }]);
    setExpandedSections((prev) => ({ ...prev, filters: true }));
  };

  const handleRemoveFilter = (index: number) => {
    setFilters(filters.filter((_, i) => i !== index));
  };

  const handleUpdateFilter = (index: number, field: keyof ReportFilter, value: any) => {
    const newFilters = [...filters];
    newFilters[index] = { ...newFilters[index], [field]: value };
    setFilters(newFilters);
  };

  const handleAddMetric = () => {
    setMetrics([...metrics, { name: '', calculation: 'count', field: '', format: 'number' }]);
    setExpandedSections((prev) => ({ ...prev, metrics: true }));
  };

  const handleRemoveMetric = (index: number) => {
    setMetrics(metrics.filter((_, i) => i !== index));
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
    if (template.schedule) {
      setSchedule(template.schedule);
    }
    setShowTemplateLibrary(false);
  };

  const handleQuickReportAction = async (reportType: string, action: 'view' | 'template') => {
    if (action === 'view') {
      navigate(`/reports/${reportType}`);
    } else {
      // Load as template
      try {
        if (!user) return;
        const templateId = await createTemplateFromQuickReport(reportType, user.uid, user.organizationId);
        // Load the template
        const { getTemplate } = await import('../../services/reports/templateService');
        const template = await getTemplate(templateId);
        if (template) {
          handleLoadTemplate(template);
        }
      } catch (err) {
        console.error('Error loading quick report as template:', err);
      }
    }
    setShowQuickReportMenu(null);
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
      await saveTemplate({
        name,
        description,
        reportType: formData.type,
        filters,
        metrics,
        schedule,
        createdBy: user.uid,
        organizationId: user.organizationId,
        isPublic,
        tags,
      });
      alert('Template saved successfully!');
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

      if (metrics.length === 0) {
        throw new Error('Please add at least one metric');
      }

      const definition: ReportDefinition = {
        id: '',
        name: data.name,
        type: data.type as ReportType,
        description: data.description || '',
        filters,
        metrics,
        schedule,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = await reportService.generateReport(definition);

      const reportId = await saveReport(
        data.name,
        data.type as ReportType,
        schedule?.format || 'pdf',
        {
          startDate: filters.find((f) => f.field === 'startDate')?.value,
          endDate: filters.find((f) => f.field === 'endDate')?.value,
        }
      );

      setSuccess('Report generated successfully!');

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

  const getProgressPercentage = () => {
    let completed = 0;
    let total = 3;
    if (completionStatus.basicInfo) completed++;
    if (completionStatus.hasFilters) completed++;
    if (completionStatus.hasMetrics) completed++;
    return Math.round((completed / total) * 100);
  };

  return (
    <div className="min-h-full bg-gray-50">
      {/* Onboarding Tour */}
      <OnboardingTour onComplete={markTourCompleted} />

      {/* Header with gradient background */}
      <div id="report-builder-header" className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/reports')}
              className="group inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Reports
            </button>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplateLibrary(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all"
              >
                <FolderOpenIcon className="h-4 w-4 mr-2" />
                Templates
              </button>
              <button
                id="help-button"
                onClick={() => setShowHelpCenter(true)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all"
              >
                <QuestionMarkCircleIcon className="h-4 w-4 mr-2" />
                Help
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Report Builder</h1>
          </div>
          <p className="mt-2 text-indigo-100">
            Create custom reports with filters, metrics, and schedules
          </p>

          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-white/90">Configuration Progress</span>
              <span className="text-sm font-semibold text-white">{getProgressPercentage()}%</span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2">
              <div
                className="bg-white h-2 rounded-full transition-all duration-500"
                style={{ width: `${getProgressPercentage()}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-6xl mx-auto">
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
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <PlayIcon className="w-5 h-5 text-blue-600" />
              Quick Reports
              <MetricTooltip
                title="Quick Reports"
                description="Pre-built reports ready to use immediately, or customize them by using as a template."
              />
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { id: 'transfer-analytics', name: 'Transfer Analytics', desc: 'Branch to HO transfers', color: 'purple' },
                { id: 'officer-performance', name: 'Officer Performance', desc: 'HO Recruitment Officers', color: 'indigo' },
                { id: 'deployment', name: 'Deployment Reports', desc: 'Overseas deployments', color: 'green' },
                { id: 'financial', name: 'Financial Reports', desc: 'Expenses & Commissions', color: 'orange' },
                { id: 'branch-performance', name: 'Branch Performance', desc: 'All branches', color: 'blue' },
                { id: 'agent-performance', name: 'Agent Performance', desc: 'Agent metrics', color: 'teal' },
              ].map((report) => (
                <div key={report.id} className="relative">
                  <div
                    className={`p-4 border-2 border-gray-200 rounded-lg hover:border-${report.color}-500 hover:bg-${report.color}-50 transition-all group`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 bg-${report.color}-100 rounded-lg group-hover:bg-${report.color}-200`}>
                          <ChartBarIcon className={`h-6 w-6 text-${report.color}-600`} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{report.name}</div>
                          <div className="text-xs text-gray-500">{report.desc}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button
                        onClick={() => handleQuickReportAction(report.id, 'view')}
                        className={`flex-1 px-3 py-1.5 text-xs font-medium bg-${report.color}-100 text-${report.color}-700 rounded hover:bg-${report.color}-200 transition-colors flex items-center justify-center gap-1`}
                      >
                        <EyeIcon className="w-3 h-3" />
                        View Report
                      </button>
                      <button
                        onClick={() => handleQuickReportAction(report.id, 'template')}
                        className="flex-1 px-3 py-1.5 text-xs font-medium bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center justify-center gap-1"
                      >
                        <DocumentTextIcon className="w-3 h-3" />
                        Use as Template
                      </button>
                    </div>
                  </div>
                </div>
              ))}
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
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">{success}</h3>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div id="basic-info-section" className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => toggleSection('basic')}
                className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center space-x-3">
                  <DocumentTextIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">Step 1: Basic Information</h3>
                  {completionStatus.basicInfo && (
                    <CheckCircleIcon className="h-5 w-5 text-green-500" />
                  )}
                </div>
                {expandedSections.basic ? (
                  <ChevronUpIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                )}
              </button>

              {expandedSections.basic && (
                <div className="px-6 pb-6 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      Report Name
                      <span className="text-red-500">*</span>
                      <MetricTooltip
                        title="Report Name"
                        description="Give your report a descriptive name that explains what it shows."
                        example='e.g., "Monthly Branch Revenue Summary"'
                      />
                    </label>
                    <input
                      id="report-name-input"
                      type="text"
                      {...register('name')}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                      placeholder="e.g., Monthly Branch Performance Report"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.name.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      Report Type
                      <span className="text-red-500">*</span>
                      <MetricTooltip
                        title="Report Type"
                        description="Select the category of data you want to report on. This determines which fields are available."
                        example="Choose 'Financial' for expenses and commissions, 'Officer Performance' for recruitment metrics"
                      />
                    </label>
                    <select
                      id="report-type-select"
                      {...register('type')}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                    >
                      <option value="applicant-status">Applicant Status</option>
                      <option value="transfer-analytics">Transfer Analytics</option>
                      <option value="financial">Financial Reports</option>
                      <option value="officer-performance">Officer Performance</option>
                      <option value="deployment">Deployment Reports</option>
                      <option value="branch-performance">Branch Performance</option>
                      <option value="agent-performance">Agent Performance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Description (Optional)
                    </label>
                    <textarea
                      {...register('description')}
                      rows={3}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                      placeholder="Describe what this report will show..."
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Filters Section - Continue in next message due to length... */}

            {/* This component is getting too long. Let me create a separate file for the rest */}
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
    </div>
  );
};
