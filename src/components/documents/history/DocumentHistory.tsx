import { useEffect } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  DocumentIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import { DocumentHistory } from '../../../types/document';
import { useDocumentStore } from '../../../stores/documentStore';

interface DocumentHistoryProps {
  documentId: string;
}

export const DocumentHistory = ({ documentId }: DocumentHistoryProps) => {
  const { documentHistory, loading, error, fetchDocumentHistory } = useDocumentStore();

  useEffect(() => {
    fetchDocumentHistory(documentId);
  }, [documentId, fetchDocumentHistory]);

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'created':
        return (
          <DocumentIcon
            className="h-5 w-5 text-blue-500"
            aria-hidden="true"
          />
        );
      case 'verified':
        return (
          <CheckCircleIcon
            className="h-5 w-5 text-green-500"
            aria-hidden="true"
          />
        );
      case 'rejected':
        return (
          <XCircleIcon
            className="h-5 w-5 text-red-500"
            aria-hidden="true"
          />
        );
      case 'expired':
        return (
          <ExclamationTriangleIcon
            className="h-5 w-5 text-yellow-500"
            aria-hidden="true"
          />
        );
      case 'updated':
        return (
          <ArrowPathIcon
            className="h-5 w-5 text-gray-500"
            aria-hidden="true"
          />
        );
      default:
        return (
          <ClockIcon
            className="h-5 w-5 text-gray-400"
            aria-hidden="true"
          />
        );
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'created':
        return 'bg-blue-100';
      case 'verified':
        return 'bg-green-100';
      case 'rejected':
        return 'bg-red-100';
      case 'expired':
        return 'bg-yellow-100';
      case 'updated':
        return 'bg-gray-100';
      default:
        return 'bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center space-x-4">
              <div className="h-8 w-8 rounded-full bg-gray-200"></div>
              <div className="flex-1">
                <div className="h-4 w-1/4 bg-gray-200 rounded"></div>
                <div className="mt-2 h-3 w-3/4 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <XCircleIcon
              className="h-5 w-5 text-red-400"
              aria-hidden="true"
            />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading document history
            </h3>
            <div className="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {documentHistory.map((event, eventIdx) => (
          <li key={event.id}>
            <div className="relative pb-8">
              {eventIdx !== documentHistory.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  <span
                    className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${getActionColor(
                      event.action
                    )}`}
                  >
                    {getActionIcon(event.action)}
                  </span>
                </div>
                <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p className="text-sm text-gray-500">
                      <span className="font-medium text-gray-900 capitalize">
                        {event.action}
                      </span>{' '}
                      by{' '}
                      <span className="font-medium text-gray-900">
                        {event.performedBy}
                      </span>
                    </p>
                    {event.details.changes?.length > 0 && (
                      <div className="mt-2 text-sm text-gray-500">
                        <ul className="list-disc pl-5 space-y-1">
                          {event.details.changes.map((change, index) => (
                            <li key={index}>
                              Changed {change.field} from{' '}
                              <span className="font-medium">
                                {change.oldValue?.toString() || 'empty'}
                              </span>{' '}
                              to{' '}
                              <span className="font-medium">
                                {change.newValue?.toString()}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {event.details.notes && (
                      <p className="mt-2 text-sm text-gray-500">
                        Note: {event.details.notes}
                      </p>
                    )}
                  </div>
                  <div className="whitespace-nowrap text-right text-sm text-gray-500">
                    <time dateTime={event.performedAt.toISOString()}>
                      {new Date(event.performedAt).toLocaleString()}
                    </time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {documentHistory.length === 0 && (
        <div className="text-center py-6">
          <DocumentIcon
            className="mx-auto h-12 w-12 text-gray-400"
            aria-hidden="true"
          />
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No history found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            This document has no recorded history yet.
          </p>
        </div>
      )}
    </div>
  );
};
