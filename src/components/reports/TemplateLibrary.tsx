import React, { useState, useEffect } from 'react';
import {
  Save,
  FolderOpen,
  Star,
  Trash2,
  Copy,
  Edit,
  Search,
  Clock,
  Users,
  X,
  Check,
  TrendingUp,
} from 'lucide-react';
import { ReportTemplate } from '../../services/reports/templateService';
import {
  getUserTemplates,
  deleteTemplate,
  duplicateTemplate,
  incrementTemplateUsage,
  getPopularTemplates,
} from '../../services/reports/templateService';
import { useAuthStore } from '../../stores/authStore';

interface TemplateLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onLoadTemplate: (template: ReportTemplate) => void;
}

export const TemplateLibrary: React.FC<TemplateLibraryProps> = ({
  isOpen,
  onClose,
  onLoadTemplate,
}) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [popularTemplates, setPopularTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'my-templates' | 'popular'>('my-templates');
  const { user } = useAuthStore();

  useEffect(() => {
    if (isOpen && user) {
      loadTemplates();
    }
  }, [isOpen, user]);

  const loadTemplates = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const [userTemplates, popular] = await Promise.all([
        getUserTemplates(user.uid, user.organizationId),
        getPopularTemplates(user.organizationId, 5),
      ]);
      setTemplates(userTemplates);
      setPopularTemplates(popular);
    } catch (error) {
      console.error('Error loading templates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadTemplate = async (template: ReportTemplate) => {
    if (template.id) {
      await incrementTemplateUsage(template.id);
    }
    onLoadTemplate(template);
    onClose();
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (window.confirm('Are you sure you want to delete this template?')) {
      try {
        await deleteTemplate(templateId);
        setTemplates((prev) => prev.filter((t) => t.id !== templateId));
      } catch (error) {
        console.error('Error deleting template:', error);
        alert('Failed to delete template');
      }
    }
  };

  const handleDuplicateTemplate = async (templateId: string) => {
    if (!user) return;

    try {
      const newId = await duplicateTemplate(templateId, user.uid);
      await loadTemplates(); // Reload to show the new template
      alert('Template duplicated successfully!');
    } catch (error) {
      console.error('Error duplicating template:', error);
      alert('Failed to duplicate template');
    }
  };

  const filteredTemplates = templates.filter(
    (t) =>
      t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center gap-3">
              <FolderOpen className="w-6 h-6 text-white" />
              <h2 className="text-2xl font-bold text-white">Template Library</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-gray-50">
            <button
              onClick={() => setActiveTab('my-templates')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'my-templates'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Save className="w-4 h-4 inline mr-2" />
              My Templates ({templates.length})
            </button>
            <button
              onClick={() => setActiveTab('popular')}
              className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                activeTab === 'popular'
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline mr-2" />
              Popular Templates
            </button>
          </div>

          {/* Search Bar */}
          {activeTab === 'my-templates' && (
            <div className="p-4 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search templates..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-gray-600">Loading templates...</p>
              </div>
            ) : (
              <>
                {/* My Templates Tab */}
                {activeTab === 'my-templates' && (
                  <>
                    {filteredTemplates.length === 0 ? (
                      <div className="text-center py-12">
                        <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">
                          {searchQuery
                            ? 'No templates found'
                            : 'No templates saved yet'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {searchQuery
                            ? 'Try a different search term'
                            : 'Create a report and click "Save as Template" to start building your library'}
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onLoad={handleLoadTemplate}
                            onDelete={handleDeleteTemplate}
                            onDuplicate={handleDuplicateTemplate}
                            showActions={true}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}

                {/* Popular Templates Tab */}
                {activeTab === 'popular' && (
                  <>
                    {popularTemplates.length === 0 ? (
                      <div className="text-center py-12">
                        <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500">No popular templates yet</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {popularTemplates.map((template) => (
                          <TemplateCard
                            key={template.id}
                            template={template}
                            onLoad={handleLoadTemplate}
                            onDuplicate={handleDuplicateTemplate}
                            showActions={false}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface TemplateCardProps {
  template: ReportTemplate;
  onLoad: (template: ReportTemplate) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  showActions: boolean;
}

const TemplateCard: React.FC<TemplateCardProps> = ({
  template,
  onLoad,
  onDelete,
  onDuplicate,
  showActions,
}) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
            <p className="text-sm text-gray-600">{template.description}</p>
          </div>
          {template.isPublic && (
            <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full flex items-center gap-1">
              <Users className="w-3 h-3" />
              Public
            </span>
          )}
        </div>

        {/* Meta Info */}
        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>
              {template.createdAt?.toDate?.()?.toLocaleDateString() || 'Recently'}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            <span>{template.usageCount} uses</span>
          </div>
        </div>

        {/* Configuration Summary */}
        <div className="space-y-1 text-xs mb-3">
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Type:</span>
            <span className="text-gray-600">{template.reportType}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Filters:</span>
            <span className="text-gray-600">{template.filters?.length || 0}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-700">Metrics:</span>
            <span className="text-gray-600">{template.metrics?.length || 0}</span>
          </div>
        </div>

        {/* Tags */}
        {template.tags && template.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {template.tags.map((tag, index) => (
              <span
                key={index}
                className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onLoad(template)}
            className="flex-1 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Use Template
          </button>
          {showActions && template.id && (
            <>
              {onDuplicate && (
                <button
                  onClick={() => onDuplicate(template.id!)}
                  className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  title="Duplicate"
                >
                  <Copy className="w-4 h-4" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(template.id!)}
                  className="px-3 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          )}
          {!showActions && onDuplicate && template.id && (
            <button
              onClick={() => onDuplicate(template.id!)}
              className="px-3 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center gap-1 text-sm"
              title="Save a copy"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (name: string, description: string, isPublic: boolean, tags: string[]) => void;
}

export const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);
    onSave(name, description, isPublic, tagArray);
    onClose();
    // Reset form
    setName('');
    setDescription('');
    setIsPublic(false);
    setTags('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-2xl w-full max-w-md">
          <form onSubmit={handleSubmit}>
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Save as Template</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Monthly Branch Revenue"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="What does this template help track?"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags (comma-separated)
                </label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., monthly, revenue, branch"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isPublic"
                  checked={isPublic}
                  onChange={(e) => setIsPublic(e.target.checked)}
                  className="w-4 h-4 text-blue-600"
                />
                <label htmlFor="isPublic" className="text-sm text-gray-700">
                  Make this template available to my organization
                </label>
              </div>
            </div>
            <div className="p-6 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!name}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Save Template
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
