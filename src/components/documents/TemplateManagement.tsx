import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageTransition } from '../animation/PageTransition';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { AsyncBoundary } from '../performance/AsyncBoundary';
import { TemplateForm } from './TemplateForm';
import { templateService, Template } from '../../services/TemplateService';
import { useAnnouncer } from '../../hooks/useAnnouncer';
import { withPerformanceOptimizations } from '../../hocs/withPerformanceOptimizations';

const TemplateList: React.FC<{
  templates: Template[];
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
}> = withPerformanceOptimizations(
  ({ templates, onEdit, onDelete }) => {
    return (
      <ul className="divide-y divide-gray-200">
        {templates.map((template) => (
          <li
            key={template.id}
            className="py-4 flex items-center justify-between"
          >
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                {template.name}
              </h3>
              {template.description && (
                <p className="mt-1 text-sm text-gray-500">
                  {template.description}
                </p>
              )}
              <div className="mt-1 flex items-center space-x-2">
                <span className="text-sm text-gray-500">
                  {template.documentType}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    template.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {template.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => onEdit(template)}
                className="text-primary-600 hover:text-primary-900"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(template.id)}
                className="text-red-600 hover:text-red-900"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    );
  },
  { name: 'TemplateList', trackRenders: true }
);

export const TemplateManagement: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const { customClaims } = useAuth();
  const { announce } = useAnnouncer();

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsLoading(true);
        const data = await templateService.getTemplates();
        setTemplates(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load templates'));
      } finally {
        setIsLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleCreateTemplate = async (data: any) => {
    try {
      const newTemplate = await templateService.createTemplate(data);
      setTemplates((prev) => [...prev, newTemplate]);
      setIsFormOpen(false);
      announce('Template created successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to create template'));
    }
  };

  const handleUpdateTemplate = async (data: any) => {
    if (!selectedTemplate) return;

    try {
      await templateService.updateTemplate(selectedTemplate.id, data);
      setTemplates((prev) =>
        prev.map((t) =>
          t.id === selectedTemplate.id ? { ...t, ...data } : t
        )
      );
      setSelectedTemplate(null);
      setIsFormOpen(false);
      announce('Template updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update template'));
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await templateService.deleteTemplate(id);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
      announce('Template deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete template'));
    }
  };

  if (customClaims?.role !== 'admin') {
    return (
      <div className="text-center py-10">
        <h2 className="text-2xl font-bold text-gray-900">Access Denied</h2>
        <p className="mt-2 text-gray-600">
          You do not have permission to manage templates.
        </p>
      </div>
    );
  }

  return (
    <AsyncBoundary>
      <PageTransition isLoading={isLoading}>
        <div className="space-y-6">
          <Breadcrumbs />

          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">
                Document Templates
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage document templates for various application processes.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <button
                type="button"
                onClick={() => {
                  setSelectedTemplate(null);
                  setIsFormOpen(true);
                }}
                className="inline-flex items-center justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto"
              >
                Add template
              </button>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error.message}</div>
                </div>
              </div>
            </div>
          )}

          {isFormOpen ? (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <TemplateForm
                  initialData={selectedTemplate || undefined}
                  onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
                  onCancel={() => {
                    setSelectedTemplate(null);
                    setIsFormOpen(false);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <TemplateList
                  templates={templates}
                  onEdit={(template) => {
                    setSelectedTemplate(template);
                    setIsFormOpen(true);
                  }}
                  onDelete={handleDeleteTemplate}
                />
              </div>
            </div>
          )}
        </div>
      </PageTransition>
    </AsyncBoundary>
  );
};