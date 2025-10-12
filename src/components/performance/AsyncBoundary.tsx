import React, { Suspense } from 'react';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { PageLoader } from '../common/PageLoader';

interface AsyncBoundaryProps {
  children: React.ReactNode;
  errorFallback?: React.ReactNode;
  loadingFallback?: React.ReactNode;
}

export const AsyncBoundary: React.FC<AsyncBoundaryProps> = ({
  children,
  errorFallback,
  loadingFallback = <PageLoader />
}) => {
  return (
    <ErrorBoundary fallback={errorFallback}>
      <Suspense fallback={loadingFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  );
};