import React from 'react';
import { useOffline } from '../../hooks/useOffline';
import { WifiIcon, XMarkIcon, ArrowPathIcon } from '@heroicons/react/24/outline';

export const OfflineIndicator: React.FC = () => {
  const { isOnline, syncStatus, error, syncData, retryFailedSync } = useOffline();

  const handleSync = async () => {
    if (!isOnline) return;
    await syncData();
  };

  const handleRetry = async () => {
    if (!isOnline) return;
    await retryFailedSync();
  };

  if (isOnline && !syncStatus?.pending && !syncStatus?.failed) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white rounded-lg shadow-lg p-4 space-y-2">
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <WifiIcon className="h-5 w-5 text-green-500" />
          ) : (
            <XMarkIcon className="h-5 w-5 text-red-500" />
          )}
          <span className="text-sm font-medium text-gray-900">
            {isOnline ? 'Online' : 'Offline'}
          </span>
        </div>

        {syncStatus && (syncStatus.pending > 0 || syncStatus.failed > 0) && (
          <div className="text-sm text-gray-600">
            {syncStatus.pending > 0 && (
              <div className="flex items-center justify-between">
                <span>Pending sync:</span>
                <span className="font-medium">{syncStatus.pending}</span>
              </div>
            )}
            {syncStatus.failed > 0 && (
              <div className="flex items-center justify-between text-red-600">
                <span>Failed sync:</span>
                <span className="font-medium">{syncStatus.failed}</span>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="text-sm text-red-600">
            {error}
          </div>
        )}

        {isOnline && (syncStatus?.pending > 0 || syncStatus?.failed > 0) && (
          <div className="flex space-x-2">
            {syncStatus.pending > 0 && (
              <button
                onClick={handleSync}
                className="flex items-center px-3 py-1 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Sync Now
              </button>
            )}
            {syncStatus.failed > 0 && (
              <button
                onClick={handleRetry}
                className="flex items-center px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
              >
                <ArrowPathIcon className="h-4 w-4 mr-1" />
                Retry Failed
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
