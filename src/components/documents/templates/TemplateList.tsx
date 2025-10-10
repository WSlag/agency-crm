import { useState } from 'react';
import {
  DocumentIcon,
  PencilIcon,
  TrashIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';
import { DocumentTemplate, DOCUMENT_CONFIG } from '../../../types/document';
import { useDocumentStore } from '../../../stores/documentStore';
import { TemplateForm } from './TemplateForm';

interface TemplateListProps {
  templates: DocumentTemplate[];
  onTemplateUpdate?: () => void;
}

export const TemplateList = ({
  templates,
  onTemplateUpdate,
}: TemplateListProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTemplate | null>(
    null
  );
  const [showForm, setShowForm] = useState(false);
  const { createTemplate, updateTemplate, deleteTemplate } = useDocumentStore();

  const handleCreateTemplate = async (data: any) => {
    try {
      await createTemplate(data);
      setShowForm(false);
      onTemplateUpdate?.();
    } catch (error) {
      console.error('Failed to create template:', error);
    }
  };

  const handleUpdateTemplate = async (data: any) => {
    if (!selectedTemplate) return;

    try {
      await updateTemplate(selectedTemplate.id, data);
      setSelectedTemplate(null);
      onTemplateUpdate?.();
    } catch (error) {
      console.error('Failed to update template:', error);
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await deleteTemplate(templateId);
      onTemplateUpdate?.();
    } catch (error) {
      console.error('Failed to delete template:', error);
    }
  };

  if (showForm || selectedTemplate) {
    return (
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {selectedTemplate ? 'Edit Template' : 'Create Template'}
              </h3>
            </div>
          </div>

          <div className="mt-6">
            <TemplateForm
              onSubmit={selectedTemplate ? handleUpdateTemplate : handleCreateTemplate}
              onCancel={() => {
                setShowForm(false);
                setSelectedTemplate(null);
              }}
              initialData={selectedTemplate}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Document Templates
            </h3>
            <p className="mt-2 text-sm text-gray-700">
              Manage document templates for different document types
            </p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => setShowForm(true)}
              className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4 mr-1.5" />
              New Template
            </button>
          </div>
        </div>

        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th
                      scope="col"
                      className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                    >
                      Template Name
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Document Type
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Fields
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="relative py-3.5 pl-3 pr-4 sm:pr-0"
                    >
                      <span className="sr-only">Actions</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {templates.map((template) => (
                    <tr key={template.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        <div className="flex items-center">
                          <DocumentIcon
                            className="h-5 w-5 text-gray-400 mr-2"
                            aria-hidden="true"
                          />
                          {template.name}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {DOCUMENT_CONFIG[template.documentType].name}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {template.requiredFields.length} fields
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                            template.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {template.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <button
                          type="button"
                          onClick={() => setSelectedTemplate(template)}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          <PencilIcon className="h-4 w-4" />
                          <span className="sr-only">Edit template</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTemplate(template.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <TrashIcon className="h-4 w-4" />
                          <span className="sr-only">Delete template</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {templates.length === 0 && (
                <div className="text-center py-6">
                  <DocumentIcon
                    className="mx-auto h-12 w-12 text-gray-400"
                    aria-hidden="true"
                  />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No templates
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by creating a new template.
                  </p>
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setShowForm(true)}
                      className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    >
                      <PlusIcon className="h-4 w-4 mr-1.5" />
                      New Template
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
