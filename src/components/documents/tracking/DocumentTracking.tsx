import { useState, useEffect } from 'react';
import {
  DocumentIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { Document, DOCUMENT_CONFIG } from '../../../types/document';
import { DocumentHistory } from '../history/DocumentHistory';

interface DocumentTrackingProps {
  document: Document;
}

export const DocumentTracking = ({ document }: DocumentTrackingProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = DOCUMENT_CONFIG[document.documentType];

  const getStatusIcon = () => {
    switch (document.status) {
      case 'verified':
        return (
          <CheckCircleIcon
            className="h-5 w-5 text-green-500"
            aria-hidden="true"
          />
        );
      case 'rejected':
        return (
          <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        );
      case 'expired':
        return (
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-500"
            aria-hidden="true"
          />
        );
      default:
        return (
          <ClockIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
        );
    }
  };

  const getStatusColor = () => {
    switch (document.status) {
      case 'verified':
        return 'bg-green-50 text-green-700 ring-green-600/20';
      case 'rejected':
        return 'bg-red-50 text-red-700 ring-red-600/20';
      case 'expired':
        return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20';
      default:
        return 'bg-gray-50 text-gray-600 ring-gray-500/10';
    }
  };

  const isExpired = document.expiryDate && new Date(document.expiryDate) < new Date();

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <DocumentIcon
              className="h-8 w-8 text-gray-400"
              aria-hidden="true"
            />
            <div className="ml-4">
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {config.name}
              </h3>
              <div className="mt-1 flex items-center space-x-4">
                <p className="text-sm text-gray-500">
                  Required for {config.stage} stage
                </p>
                <span
                  className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${getStatusColor()}`}
                >
                  {getStatusIcon()}
                  <span className="ml-1 capitalize">{document.status}</span>
                </span>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
          >
            {isExpanded ? 'Show Less' : 'Show More'}
          </button>
        </div>

        {isExpanded && (
          <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">File Name</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {document.fileName}
                </dd>
              </div>

              <div>
                <dt className="text-sm font-medium text-gray-500">Upload Date</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(document.uploadDate).toLocaleString()}
                </dd>
              </div>

              {document.expiryDate && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Expiry Date
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <span
                      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                        isExpired
                          ? 'bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/20'
                          : 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20'
                      }`}
                    >
                      {new Date(document.expiryDate).toLocaleDateString()}
                      {isExpired && (
                        <ExclamationTriangleIcon
                          className="ml-1 h-4 w-4"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </dd>
                </div>
              )}

              {document.verifiedBy && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">
                    Verified By
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {document.verifiedBy}
                    {document.verifiedAt && (
                      <span className="text-gray-500">
                        {' '}
                        on{' '}
                        {new Date(document.verifiedAt).toLocaleDateString()}
                      </span>
                    )}
                  </dd>
                </div>
              )}

              {document.metadata && Object.keys(document.metadata).length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Metadata</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(document.metadata).map(
                        ([key, value]) =>
                          value && (
                            <div key={key}>
                              <span className="font-medium">
                                {key
                                  .split(/(?=[A-Z])/)
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() +
                                      word.slice(1)
                                  )
                                  .join(' ')}
                                :{' '}
                              </span>
                              {value instanceof Date
                                ? value.toLocaleDateString()
                                : value.toString()}
                            </div>
                          )
                      )}
                    </div>
                  </dd>
                </div>
              )}

              {document.tags && document.tags.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1">
                    <div className="flex flex-wrap gap-2">
                      {document.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}

              {document.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {document.notes}
                  </dd>
                </div>
              )}
            </dl>

            <div className="mt-6 border-t border-gray-200 pt-6">
              <h4 className="text-sm font-medium text-gray-900">
                Document History
              </h4>
              <div className="mt-4">
                <DocumentHistory documentId={document.id} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
