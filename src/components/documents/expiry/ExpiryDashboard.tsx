import { useState, useEffect } from 'react';
import {
  DocumentIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { Document, DOCUMENT_CONFIG } from '../../../types/document';
import { DocumentUploadModal } from '../upload/DocumentUploadModal';

interface ExpiryDashboardProps {
  documents: Document[];
  applicantId: string;
  onDocumentUpdate?: () => void;
}

export const ExpiryDashboard = ({
  documents,
  applicantId,
  onDocumentUpdate,
}: ExpiryDashboardProps) => {
  const [uploadType, setUploadType] = useState<keyof typeof DOCUMENT_CONFIG | null>(
    null
  );

  const getExpiringDocuments = () => {
    const now = new Date();
    return documents
      .filter((doc) => doc.expiryDate)
      .map((doc) => ({
        ...doc,
        daysUntilExpiry: Math.ceil(
          (new Date(doc.expiryDate!).getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
      }))
      .sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  };

  const expiringDocs = getExpiringDocuments();
  const expiredDocs = expiringDocs.filter((doc) => doc.daysUntilExpiry <= 0);
  const expiringWithin30Days = expiringDocs.filter(
    (doc) => doc.daysUntilExpiry > 0 && doc.daysUntilExpiry <= 30
  );
  const expiringWithin90Days = expiringDocs.filter(
    (doc) => doc.daysUntilExpiry > 30 && doc.daysUntilExpiry <= 90
  );

  const handleUploadSuccess = () => {
    setUploadType(null);
    onDocumentUpdate?.();
  };

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-red-50 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon
                  className="h-6 w-6 text-red-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-red-800 truncate">
                    Expired Documents
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-red-900">
                      {expiredDocs.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon
                  className="h-6 w-6 text-yellow-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-yellow-800 truncate">
                    Expiring within 30 days
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-yellow-900">
                      {expiringWithin30Days.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ArrowPathIcon
                  className="h-6 w-6 text-blue-400"
                  aria-hidden="true"
                />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-blue-800 truncate">
                    Expiring within 90 days
                  </dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-semibold text-blue-900">
                      {expiringWithin90Days.length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expired Documents */}
      {expiredDocs.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Expired Documents
          </h3>
          <div className="mt-4 divide-y divide-gray-200">
            {expiredDocs.map((doc) => (
              <div key={doc.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentIcon
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {DOCUMENT_CONFIG[doc.documentType].name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expired {Math.abs(doc.daysUntilExpiry)} days ago
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadType(doc.documentType)}
                    className="inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                  >
                    Renew Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Expiring Soon */}
      {expiringWithin30Days.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Documents Expiring Soon
          </h3>
          <div className="mt-4 divide-y divide-gray-200">
            {expiringWithin30Days.map((doc) => (
              <div key={doc.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentIcon
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {DOCUMENT_CONFIG[doc.documentType].name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires in {doc.daysUntilExpiry} days
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadType(doc.documentType)}
                    className="inline-flex items-center rounded-md bg-yellow-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-yellow-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-yellow-600"
                  >
                    Renew
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Documents Expiring in 90 Days */}
      {expiringWithin90Days.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Documents Expiring in 90 Days
          </h3>
          <div className="mt-4 divide-y divide-gray-200">
            {expiringWithin90Days.map((doc) => (
              <div key={doc.id} className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DocumentIcon
                      className="h-6 w-6 text-gray-400"
                      aria-hidden="true"
                    />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {DOCUMENT_CONFIG[doc.documentType].name}
                      </p>
                      <p className="text-sm text-gray-500">
                        Expires in {doc.daysUntilExpiry} days
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setUploadType(doc.documentType)}
                    className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Renew Early
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Expiring Documents */}
      {expiringDocs.length === 0 && (
        <div className="text-center py-6">
          <DocumentIcon
            className="mx-auto h-12 w-12 text-gray-400"
            aria-hidden="true"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No Expiring Documents
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            All documents are up to date.
          </p>
        </div>
      )}

      {/* Document Upload Modal */}
      {uploadType && (
        <DocumentUploadModal
          isOpen={!!uploadType}
          onClose={() => setUploadType(null)}
          applicantId={applicantId}
          documentType={uploadType}
          onSuccess={handleUploadSuccess}
        />
      )}
    </div>
  );
};
