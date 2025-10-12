import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageTransition } from '../animation/PageTransition';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { TextField } from '../forms/fields/TextField';
import { SelectField } from '../forms/fields/SelectField';
import { useFormHelper } from '../../utils/formHelpers';
import { z } from 'zod';
import { templateService, Template, TemplateField } from '../../services/TemplateService';
import { LazyLoad } from '../performance/LazyLoad';
import { FocusTrap } from '../accessibility/FocusTrap';
import { useKeyboardNavigation } from '../../hooks/useKeyboardNavigation';
import { notificationService } from '../../services/NotificationService';

const templateFieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1, 'Field name is required'),
  type: z.enum(['text', 'number', 'date', 'select', 'file']),
  required: z.boolean(),
  options: z.array(z.string()).optional(),
  validation: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
    pattern: z.string().optional(),
    allowedTypes: z.array(z.string()).optional()
  }).optional()
});

const templateSchema = z.object({
  name: z.string().min(3, 'Template name must be at least 3 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  documentType: z.string().min(1, 'Document type is required'),
  fields: z.array(templateFieldSchema),
  isActive: z.boolean(),
  isShared: z.boolean().default(false)
});

type TemplateFormData = z.infer<typeof templateSchema>;

const documentTypes = [
  { value: 'passport', label: 'Passport' },
  { value: 'visa', label: 'Visa' },
  { value: 'medical', label: 'Medical Certificate' },
  { value: 'contract', label: 'Employment Contract' }
];

const fieldTypes = [
  { value: 'text', label: 'Text' },
  { value: 'number', label: 'Number' },
  { value: 'date', label: 'Date' },
  { value: 'select', label: 'Select' },
  { value: 'file', label: 'File Upload' }
];

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const { user, customClaims } = useAuth();

  useEffect(() => {
    loadTemplates();
  }, []);

  useKeyboardNavigation({
    'Escape': () => setSelectedTemplate(null),
    'n': (e) => {
      if (e.ctrlKey) {
        e.preventDefault();
        setSelectedTemplate('new');
      }
    }
  });

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const loadedTemplates = await templateService.getTemplates();
      setTemplates(loadedTemplates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setIsLoading(false);
    }
  };

  const {
    data,
    errors,
    isSubmitting,
    setValue,
    setValues,
    handleSubmit,
    reset
  } = useFormHelper<TemplateFormData>({
    initialData: {
      name: '',
      description: '',
      documentType: '',
      fields: [],
      isActive: true,
      isShared: false
    },
    validationSchema: templateSchema,
    onSubmit: async (formData) => {
      try {
        setIsLoading(true);
        setError(null);

        if (selectedTemplate === 'new') {
          // Create new template
          const templateId = await templateService.createTemplate({
            ...formData,
            createdBy: user!.uid
          });

          // Upload preview if exists
          if (previewFile) {
            await templateService.uploadPreview(templateId, previewFile);
          }

          // Notify success
          await notificationService.sendNotification({
            userId: user!.uid,
            title: 'Template Created',
            message: `Template "${formData.name}" has been created successfully.`,
            type: 'system',
            priority: 'low',
            channels: ['in-app']
          });
        } else if (selectedTemplate) {
          // Update existing template
          await templateService.updateTemplate(selectedTemplate, formData);

          // Upload new preview if exists
          if (previewFile) {
            await templateService.uploadPreview(selectedTemplate, previewFile);
          }

          // Notify success
          await notificationService.sendNotification({
            userId: user!.uid,
            title: 'Template Updated',
            message: `Template "${formData.name}" has been updated successfully.`,
            type: 'system',
            priority: 'low',
            channels: ['in-app']
          });
        }

        // Refresh templates
        await loadTemplates();
        setSelectedTemplate(null);
        reset();
        setPreviewFile(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save template');
      } finally {
        setIsLoading(false);
      }
    }
  });

  const handleAddField = () => {
    const newField: TemplateField = {
      id: crypto.randomUUID(),
      name: '',
      type: 'text',
      required: false
    };
    setValue('fields', [...(data.fields || []), newField]);
  };

  const handleRemoveField = (fieldId: string) => {
    setValue('fields', (data.fields || []).filter(field => field.id !== fieldId));
  };

  const handleFieldChange = (fieldId: string, updates: Partial<TemplateField>) => {
    setValue('fields', (data.fields || []).map(field =>
      field.id === fieldId ? { ...field, ...updates } : field
    ));
  };

  const handlePreviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPreviewFile(file);
    }
  };

  const handleShare = async (templateId: string, userIds: string[]) => {
    try {
      await templateService.shareTemplate(templateId, userIds);
      await loadTemplates();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share template');
    }
  };

  return (
    <ErrorBoundary>
      <PageTransition isLoading={isLoading}>
        <div className="space-y-6">
          <Breadcrumbs />
          
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Document Templates</h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage document templates for various application processes.
              </p>
            </div>
            {customClaims?.role === 'admin' && (
              <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setSelectedTemplate('new')}
                  className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
                >
                  Add template
                </button>
              </div>
            )}
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {/* Template List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul role="list" className="divide-y divide-gray-200">
              {templates.map((template) => (
                <LazyLoad key={template.id}>
                  <li>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {template.name}
                          </h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {template.description}
                          </p>
                        </div>
                        <div className="ml-4 flex-shrink-0 flex space-x-2">
                          <button
                            type="button"
                            onClick={() => setSelectedTemplate(template.id)}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleShare(template.id!, [])}
                            className="inline-flex items-center px-3 py-1 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            Share
                          </button>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          template.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="ml-2">Version {template.version}</span>
                        <span className="ml-2">
                          Updated {new Date(template.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </li>
                </LazyLoad>
              ))}
            </ul>
          </div>

          {/* Template Form Modal */}
          {selectedTemplate && (
            <FocusTrap>
              <div className="fixed inset-0 z-10 overflow-y-auto">
                <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                  <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
                  <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                          {selectedTemplate === 'new' ? 'Create Template' : 'Edit Template'}
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          Define the template structure and fields.
                        </p>
                      </div>

                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <TextField
                          name="name"
                          label="Template Name"
                          value={data.name}
                          onChange={(value) => setValue('name', value)}
                          error={errors.name}
                          required
                        />

                        <SelectField
                          name="documentType"
                          label="Document Type"
                          value={data.documentType}
                          onChange={(value) => setValue('documentType', value)}
                          options={documentTypes}
                          error={errors.documentType}
                          required
                        />

                        <div className="sm:col-span-2">
                          <TextField
                            name="description"
                            label="Description"
                            value={data.description}
                            onChange={(value) => setValue('description', value)}
                            error={errors.description}
                            required
                          />
                        </div>

                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Preview Image
                          </label>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handlePreviewChange}
                            className="mt-1 block w-full text-sm text-gray-500
                              file:mr-4 file:py-2 file:px-4
                              file:rounded-md file:border-0
                              file:text-sm file:font-medium
                              file:bg-primary-50 file:text-primary-700
                              hover:file:bg-primary-100"
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h4 className="text-lg font-medium text-gray-900">Fields</h4>
                          <button
                            type="button"
                            onClick={handleAddField}
                            className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-primary-700 bg-primary-100 hover:bg-primary-200"
                          >
                            Add Field
                          </button>
                        </div>

                        <div className="space-y-4">
                          {data.fields?.map((field) => (
                            <div
                              key={field.id}
                              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg"
                            >
                              <div className="flex-1 grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <TextField
                                  name={`field-${field.id}-name`}
                                  label="Field Name"
                                  value={field.name}
                                  onChange={(value) => handleFieldChange(field.id, { name: value })}
                                  error={errors[`fields.${field.id}.name`]}
                                  required
                                />

                                <SelectField
                                  name={`field-${field.id}-type`}
                                  label="Field Type"
                                  value={field.type}
                                  onChange={(value) => handleFieldChange(field.id, { 
                                    type: value as TemplateField['type']
                                  })}
                                  options={fieldTypes}
                                  error={errors[`fields.${field.id}.type`]}
                                  required
                                />

                                {field.type === 'select' && (
                                  <div className="sm:col-span-2">
                                    <TextField
                                      name={`field-${field.id}-options`}
                                      label="Options (comma-separated)"
                                      value={field.options?.join(', ') || ''}
                                      onChange={(value) => handleFieldChange(field.id, {
                                        options: value.split(',').map(v => v.trim())
                                      })}
                                      error={errors[`fields.${field.id}.options`]}
                                    />
                                  </div>
                                )}

                                <div className="sm:col-span-2 flex items-center space-x-4">
                                  <label className="flex items-center space-x-2">
                                    <input
                                      type="checkbox"
                                      checked={field.required}
                                      onChange={(e) => handleFieldChange(field.id, {
                                        required: e.target.checked
                                      })}
                                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                    />
                                    <span className="text-sm text-gray-700">Required</span>
                                  </label>
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleRemoveField(field.id)}
                                className="text-red-600 hover:text-red-800"
                              >
                                Remove
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm"
                        >
                          {isSubmitting ? 'Saving...' : 'Save Template'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate(null)}
                          className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </FocusTrap>
          )}
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};