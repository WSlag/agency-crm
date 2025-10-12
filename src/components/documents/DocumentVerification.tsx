import React, { useState } from 'react';
import { useDocumentVerification } from '../../hooks/useDocumentVerification';
import { PageTransition } from '../animation/PageTransition';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { AsyncBoundary } from '../performance/AsyncBoundary';
import { DocumentPreview } from './DocumentPreview';
import { useAnnouncer } from '../../hooks/useAnnouncer';
import { TextAreaField } from '../forms/fields/TextAreaField';
import { withPerformanceOptimizations } from '../../hocs/withPerformanceOptimizations';

const DocumentList = withPerformanceOptimizations(
  ({ documents, onSelect, selectedId }: any) => (
    <ul role="list" className="divide-y divide-gray-200">
      {documents.map((doc: any) => (
        <li
          key={doc.id}
          className={`
            flex justify-between gap-x-6 py-5 cursor-pointer hover:bg-gray-50
            ${selectedId === doc.id ? 'bg-gray-100' : ''}
          `}
          onClick={() => onSelect(doc)}
        >
          <div className="flex min-w-0 gap-x-4">
            <div className="min-w-0 flex-auto">
              <p className="text-sm font-semibold leading-6 text-gray-900">
                {doc.applicantName}
              </p>
              <p className="mt-1 truncate text-xs leading-5 text-gray-500">
                {doc.type}
              </p>
            </div>
          </div>
          <div className="hidden shrink-0 sm:flex sm:flex-col sm:items-end">
            <p className="text-sm leading-6 text-gray-900">Uploaded</p>
            <p className="mt-1 text-xs leading-5 text-gray-500">
              <time dateTime={doc.uploadedAt.toISOString()}>
                {doc.uploadedAt.toLocaleDateString()}
              </time>
            </p>
          </div>
        </li>
      ))}
    </ul>
  ),
  { name: 'DocumentList' }
);

export const DocumentVerification: React.FC = () => {
  const {
    documents,
    selectedDocument,
    setSelectedDocument,
    loading,
    error,
    verifyDocument
  } = useDocumentVerification();

  const [rejectionReason, setRejectionReason] = useState('');
  const { announce } = useAnnouncer();

  const handleVerify = async (approved: boolean) => {
    if (!selectedDocument) return;

    try {
      await verifyDocument(
        selectedDocument.id,
        approved,
        approved ? undefined : rejectionReason
      );
      announce(
        approved
          ? 'Document verified successfully'
          : 'Document rejected successfully'
      );
      setRejectionReason('');
    } catch (err) {
      announce(
        `Failed to ${approved ? 'verify' : 'reject'} document`,
        'assertive'
      );
    }
  };

  return (
    <AsyncBoundary>
      <PageTransition isLoading={loading}>
        <div className="space-y-6">
          <Breadcrumbs />

          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">
                Document Verification
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Review and verify pending applicant documents.
              </p>
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

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Document List */}
            <div className="lg:col-span-1 bg-white shadow rounded-lg p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Pending Documents ({documents.length})
              </h2>
              {documents.length === 0 ? (
                <p className="text-sm text-gray-500">No pending documents.</p>
              ) : (
                <DocumentList
                  documents={documents}
                  onSelect={setSelectedDocument}
                  selectedId={selectedDocument?.id}
                />
              )}
            </div>

            {/* Document Preview and Actions */}
            <div className="lg:col-span-2 bg-white shadow rounded-lg p-6">
              {selectedDocument ? (
                <div className="space-y-6">
                  <h2 className="text-lg font-medium text-gray-900">
                    Verify Document: {selectedDocument.type} for{' '}
                    {selectedDocument.applicantName}
                  </h2>

                  <DocumentPreview
                    url={selectedDocument.url}
                    type={selectedDocument.type}
                    className="rounded-lg overflow-hidden"
                  />

                  <div className="space-y-4">
                    <TextAreaField
                      label="Rejection Reason"
                      name="rejectionReason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Required if rejecting the document"
                      register={() => ({})}
                    />

                    <div className="flex justify-end space-x-4">
                      <button
                        type="button"
                        onClick={() => handleVerify(true)}
                        className="inline-flex justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
                      >
                        Verify
                      </button>
                      <button
                        type="button"
                        onClick={() => handleVerify(false)}
                        disabled={!rejectionReason.trim()}
                        className="inline-flex justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">
                  Select a document from the list to verify.
                </p>
              )}
            </div>
          </div>
        </div>
      </PageTransition>
    </AsyncBoundary>
  );
};