/**
 * DocumentsTab Component
 * 
 * Displays and manages documents for an applicant, showing:
 * - Required documents for current stage
 * - Upload functionality
 * - Document verification status
 */

import { useState, useEffect } from 'react';
import { 
  DocumentTextIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ClockIcon,
  CloudArrowUpIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { Applicant, ApplicantStage } from '../../../types/applicant';
import { DocumentType } from '../../../types/document';
import { STAGE_CONFIGURATION, STAGE_LABELS } from '../../../config/stageConfig';
import { useDocumentStore } from '../../../stores/documentStore';
import { DocumentUploadModal } from '../../documents/upload/DocumentUploadModal';

interface DocumentsTabProps {
  applicant: Applicant;
}

export const DocumentsTab = ({ applicant }: DocumentsTabProps) => {
  const { documents, fetchDocuments, setFilter } = useDocumentStore();
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<DocumentType | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Get current stage with fallback to REGISTRATION
  const currentStage = (applicant.currentStageEnum || applicant.currentStage || ApplicantStage.REGISTRATION) as ApplicantStage;
  const stageConfig = STAGE_CONFIGURATION[currentStage] || STAGE_CONFIGURATION[ApplicantStage.REGISTRATION];
  
  // Load documents on mount
  useEffect(() => {
    loadDocuments();
  }, [applicant.id]);
  
  const loadDocuments = async () => {
    try {
      setLoading(true);
      setFilter({ applicantId: applicant.id });
      await fetchDocuments();
    } catch (error) {
      console.error('Failed to load documents:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleUploadClick = (docType: string) => {
    setSelectedDocType(docType as DocumentType);
    setUploadModalOpen(true);
  };
  
  const handleUploadSuccess = () => {
    loadDocuments(); // Refresh documents after upload
  };
  
  const getDocumentStatus = (docType: string) => {
    const doc = documents.find(d => 
      d.type === docType && 
      d.applicantId === applicant.id
    );
    return doc;
  };
  
  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircleIcon className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <XCircleIcon className="w-5 h-5 text-red-600" />;
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-600" />;
      default:
        return <DocumentTextIcon className="w-5 h-5 text-gray-400" />;
    }
  };
  
  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Rejected
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            Pending Review
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Not Uploaded
          </span>
        );
    }
  };
  
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-indigo-600"></div>
        <p className="mt-4 text-gray-600">Loading documents...</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {/* Upload Document Button - Always visible */}
      <div className="flex justify-end">
        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <CloudArrowUpIcon className="w-5 h-5 mr-2" />
          Upload Document
        </button>
      </div>
      
      {/* Current Stage Requirements */}
      {stageConfig.documents.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <DocumentTextIcon className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-semibold text-blue-900">
              Required Documents for {STAGE_LABELS[currentStage]} Stage
            </h3>
          </div>
          <p className="text-xs text-blue-700 mb-4">
            These documents must be uploaded and verified before advancing to the next stage
          </p>
          
          <div className="space-y-3">
            {stageConfig.documents.map((req, idx) => {
              const doc = getDocumentStatus(req.type);
              const hasAlternative = req.alternatives && req.alternatives.length > 0 
                ? req.alternatives.some(alt => {
                    const altDoc = getDocumentStatus(alt);
                    return altDoc && altDoc.status === 'verified';
                  })
                : false;
              
              const isVerified = doc?.status === 'verified' || hasAlternative;
              
              return (
                <div 
                  key={idx}
                  className={`p-4 rounded-lg border-2 ${
                    isVerified 
                      ? 'bg-green-50 border-green-200' 
                      : doc
                      ? 'bg-yellow-50 border-yellow-200'
                      : 'bg-white border-gray-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(doc?.status)}
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">
                          {req.description}
                        </p>
                        {req.required && (
                          <span className="text-xs text-red-600 font-medium">
                            (Required)
                          </span>
                        )}
                        {doc && (
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-gray-600">
                              File: {doc.fileName}
                            </p>
                            <p className="text-xs text-gray-500">
                              Uploaded: {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {getStatusBadge(doc?.status)}
                      
                      {!isVerified && (
                        <button
                          onClick={() => handleUploadClick(req.type)}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 transition-colors"
                        >
                          <CloudArrowUpIcon className="w-4 h-4 mr-1" />
                          {doc ? 'Re-upload' : 'Upload'}
                        </button>
                      )}
                      
                      {doc?.fileUrl && (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                        >
                          <EyeIcon className="w-4 h-4 mr-1" />
                          View
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
      
      {/* All Uploaded Documents */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DocumentTextIcon className="w-5 h-5" />
          All Documents
        </h3>
        
        {documents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
            <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents</h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload required documents to proceed with the recruitment pipeline
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                    {getStatusIcon(doc.status)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {doc.type}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {doc.fileName}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        {doc.uploadedAt ? new Date(doc.uploadedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(doc.status)}
                    {doc.fileUrl && (
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        View →
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Upload Modal */}
      <DocumentUploadModal
        isOpen={uploadModalOpen}
        onClose={() => {
          setUploadModalOpen(false);
          setSelectedDocType(null);
        }}
        applicantId={applicant.id}
        documentType={selectedDocType || undefined} // Pass undefined if no type selected
        onSuccess={() => {
          handleUploadSuccess();
          setUploadModalOpen(false);
          setSelectedDocType(null);
        }}
      />
    </div>
  );
};

