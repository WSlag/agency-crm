import React, { Suspense } from 'react';
import { ErrorBoundary } from '../error/ErrorBoundary';
import LoadingSpinner from '../common/LoadingSpinner';

interface AsyncBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  fallback = <LoadingSpinner size="large" />,
  errorFallback
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};
