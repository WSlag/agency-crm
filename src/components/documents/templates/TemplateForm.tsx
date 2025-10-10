import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { documentTemplateSchema } from '../../../schemas/document';
import { DocumentType, DOCUMENT_CONFIG } from '../../../types/document';

interface TemplateFormProps {
  onSubmit: (data: any) => Promise<void>;
  onCancel?: () => void;
  initialData?: any;
}

export const TemplateForm = ({
  onSubmit,
  onCancel,
  initialData,
}: TemplateFormProps) => {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(documentTemplateSchema),
    defaultValues: initialData || {
      name: '',
      description: '',
      documentType: '',
      isActive: true,
      requiredFields: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'requiredFields',
  });

  const handleAddField = () => {
    append({
      name: '',
      type: 'text',
      required: true,
      options: [],
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div>
        <label
          htmlFor="name"
          className="block text-sm font-medium text-gray-700"
        >
          Template Name
        </label>
        <div className="mt-1">
          <input
            type="text"
            {...register('name')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="description"
          className="block text-sm font-medium text-gray-700"
        >
          Description
        </label>
        <div className="mt-1">
          <textarea
            {...register('description')}
            rows={3}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">
              {errors.description.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label
          htmlFor="documentType"
          className="block text-sm font-medium text-gray-700"
        >
          Document Type
        </label>
        <div className="mt-1">
          <select
            {...register('documentType')}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
          >
            <option value="">Select document type</option>
            {Object.entries(DOCUMENT_CONFIG).map(([type, config]) => (
              <option key={type} value={type}>
                {config.name}
              </option>
            ))}
          </select>
          {errors.documentType && (
            <p className="mt-1 text-sm text-red-600">
              {errors.documentType.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">Required Fields</h3>
          <button
            type="button"
            onClick={handleAddField}
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-3 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <PlusIcon className="h-4 w-4 mr-1.5" />
            Add Field
          </button>
        </div>

        <div className="mt-4 space-y-4">
          {fields.map((field, index) => (
            <div
              key={field.id}
              className="flex items-start space-x-4 border-b border-gray-200 pb-4"
            >
              <div className="flex-grow grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field Name
                  </label>
                  <input
                    type="text"
                    {...register(`requiredFields.${index}.name`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Field Type
                  </label>
                  <select
                    {...register(`requiredFields.${index}.type`)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="text">Text</option>
                    <option value="date">Date</option>
                    <option value="number">Number</option>
                    <option value="select">Select</option>
                  </select>
                </div>

                {/* Options for select type */}
                {field.type === 'select' && (
                  <div className="sm:col-span-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Options (comma-separated)
                    </label>
                    <input
                      type="text"
                      {...register(`requiredFields.${index}.options`)}
                      placeholder="Option 1, Option 2, Option 3"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                )}

                <div className="sm:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`requiredFields.${index}.required`)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Required field
                    </label>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => remove(index)}
                className="mt-1 text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          ))}

          {fields.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No fields added yet. Click "Add Field" to start adding form fields.
            </p>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center">
          <input
            type="checkbox"
            {...register('isActive')}
            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
          />
          <label className="ml-2 block text-sm text-gray-900">
            Template is active
          </label>
        </div>
      </div>

      <div className="flex justify-end space-x-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isSubmitting ? 'Saving...' : 'Save Template'}
        </button>
      </div>
    </form>
  );
};
