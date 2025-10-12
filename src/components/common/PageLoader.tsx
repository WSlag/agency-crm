import React from 'react';
import LoadingSpinner from './LoadingSpinner';

interface PageLoaderProps {
  message?: string;
}

export const PageLoader: React.FC<PageLoaderProps> = ({ message = 'Loading...' }) => (
  <div className="min-h-[400px] flex flex-col items-center justify-center">
    <LoadingSpinner size="large" />
    <p className="mt-4 text-sm text-gray-600">{message}</p>
  </div>
);
