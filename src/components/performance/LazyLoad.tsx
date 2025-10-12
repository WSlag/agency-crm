import React, { Suspense, lazy, ComponentType } from 'react';
import { PageLoader } from '../common/PageLoader';

interface LazyLoadProps {
  importFn: () => Promise<{ default: ComponentType<any> }>;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  importFn,
  fallback = <PageLoader />,
  props = {}
}) => {
  const LazyComponent = lazy(importFn);

  return (
    <Suspense fallback={fallback}>
      <LazyComponent {...props} />
    </Suspense>
  );
};