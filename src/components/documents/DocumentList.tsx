import React, { useEffect, useState } from 'react';
import { Document, DOCUMENT_TYPE_LABELS } from '../../types/document';
import { DocumentService } from '../../services/documentService';
import LoadingSpinner from '../common/LoadingSpinner';

interface DocumentListProps {
  applicantId: string;
  onDocumentClick?: (document: Document) => void;
}

const DocumentList: React.FC<DocumentListProps> = ({
  applicantId,
  onDocumentClick
}) => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [applicantId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const docs = await DocumentService.getApplicantDocuments(applicantId);
      setDocuments(docs);
      setError(null);
    } catch (err) {
      setError('Failed to load documents');
      console.error('Error loading documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Document['status']) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'expired':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center p-4">
        <LoadingSpinner size="medium" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 p-4">
        {error}
      </div>
    );
  }

  if (documents.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No documents found
      </div>
    );
  }

  return (
    <div className="overflow-hidden bg-white shadow sm:rounded-md">
      <ul className="divide-y divide-gray-200">
        {documents.map((doc) => (
          <li
            key={doc.id}
            className="hover:bg-gray-50 cursor-pointer"
            onClick={() => onDocumentClick?.(doc)}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate">
                  <div className="flex text-sm">
                    <p className="font-medium text-primary-600 truncate">
                      {DOCUMENT_TYPE_LABELS[doc.type]}
                    </p>
                    <p className="ml-1 flex-shrink-0 font-normal text-gray-500">
                      {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="mt-2 flex">
                    <div className="flex items-center text-sm text-gray-500">
                      <p>{doc.fileName}</p>
                    </div>
                  </div>
                </div>
                <div className="ml-2 flex flex-shrink-0">
                  <span
                    className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(
                      doc.status
                    )}`}
                  >
                    {doc.status}
                  </span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DocumentList;