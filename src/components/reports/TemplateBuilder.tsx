import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { reportTemplateSchema } from '../../schemas/report';
import { useReportStore } from '../../stores/reportStore';
import { useAuthStore } from '../../stores/authStore';
import type { ReportType } from '../../types/report';

interface TemplateBuilderProps {
  onSave?: (templateId: string) => void;
  onCancel?: () => void;
  initialData?: any;
}

export const TemplateBuilder: React.FC<TemplateBuilderProps> = ({
  onSave,
  onCancel,
  initialData,
}) => {
  const { user } = useAuthStore();
  const {
    createTemplate,
    updateTemplate,
    loading,
    error,
  } = useReportStore();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(reportTemplateSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      type: 'applicant' as ReportType,
      filters: {},
      columns: [],
    },
  });

  const reportType = watch('type');

  const getAvailableColumns = (type: ReportType) => {
    switch (type) {
      case 'applicant':
        return [
          'fullName',
          'contactInfo',
          'currentStage',
          'agentId',
          'branchId',
          'assignedOfficerId',
          'status',
          'createdAt',
        ];
      case 'commission':
        return [
          'agentId',
          'applicantId',
          'commissionType',
          'amount',
          'status',
          'createdAt',
        ];
      case 'expense':
        return [
          'expenseType',
          'amount',
          'description',
          'status',
          'createdAt',
        ];
      case 'transfer':
        return [
          'applicantId',
          'fromBranch',
          'toBranch',
          'status',
          'requestedAt',
        ];
      default:
        return [];
    }
  };

  const handleSave = async (data: any) => {
    try {
      if (initialData?.id) {
        await updateTemplate(initialData.id, data);
      } else {
        const templateId = await createTemplate(data);
        onSave?.(templateId);
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
      {/* Template Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Template Name
        </label>
        <Controller
          name="name"
          control={control}
          render={({ field }) => (
            <input
              type="text"
              {...field}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter template name"
            />
          )}
        />
        {errors.name && (
          <p className="mt-1 text-sm text-red-600">
            {errors.name.message as string}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <Controller
          name="description"
          control={control}
          render={({ field }) => (
            <textarea
              {...field}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Enter template description"
            />
          )}
        />
        {errors.description && (
          <p className="mt-1 text-sm text-red-600">
            {errors.description.message as string}
          </p>
        )}
      </div>

      {/* Report Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Report Type
        </label>
        <Controller
          name="type"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="applicant">Applicant Report</option>
              <option value="commission">Commission Report</option>
              <option value="expense">Expense Report</option>
              <option value="deployment">Deployment Report</option>
              <option value="transfer">Transfer Report</option>
              <option value="agent">Agent Report</option>
              <option value="branch">Branch Report</option>
              <option value="officer">Officer Report</option>
            </select>
          )}
        />
        {errors.type && (
          <p className="mt-1 text-sm text-red-600">
            {errors.type.message as string}
          </p>
        )}
      </div>

      {/* Columns */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Columns
        </label>
        <Controller
          name="columns"
          control={control}
          render={({ field }) => (
            <div className="mt-2 space-y-2">
              {getAvailableColumns(reportType).map((column) => (
                <label
                  key={column}
                  className="inline-flex items-center mr-4"
                >
                  <input
                    type="checkbox"
                    value={column}
                    checked={field.value.includes(column)}
                    onChange={(e) => {
                      const newColumns = e.target.checked
                        ? [...field.value, column]
                        : field.value.filter((c: string) => c !== column);
                      field.onChange(newColumns);
                    }}
                    className="form-checkbox h-4 w-4 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">
                    {column}
                  </span>
                </label>
              ))}
            </div>
          )}
        />
        {errors.columns && (
          <p className="mt-1 text-sm text-red-600">
            {errors.columns.message as string}
          </p>
        )}
      </div>

      {/* Sorting */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort By
          </label>
          <Controller
            name="sortBy"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                <option value="">None</option>
                {watch('columns').map((column: string) => (
                  <option key={column} value={column}>
                    {column}
                  </option>
                ))}
              </select>
            )}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Sort Order
          </label>
          <Controller
            name="sortOrder"
            control={control}
            render={({ field }) => (
              <select
                {...field}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                disabled={!watch('sortBy')}
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            )}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Saving...' : initialData ? 'Update Template' : 'Save Template'}
        </button>
      </div>
    </form>
  );
};
