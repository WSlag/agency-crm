import React, { ComponentType, memo } from 'react';
import { performanceMonitoring } from '../utils/performanceMonitoring';

interface WithPerformanceOptimizationsOptions {
  name?: string;
  memoize?: boolean;
  trackRenders?: boolean;
}

export function withPerformanceOptimizations<P extends object>(
  WrappedComponent: ComponentType<P>,
  options: WithPerformanceOptimizationsOptions = {}
) {
  const {
    name = WrappedComponent.displayName || WrappedComponent.name,
    memoize = true,
    trackRenders = true
  } = options;

  const PerformanceOptimizedComponent: React.FC<P> = (props) => {
    if (trackRenders) {
      performanceMonitoring.startMeasure(`render-${name}`);
    }

    const result = <WrappedComponent {...props} />;

    if (trackRenders) {
      performanceMonitoring.endMeasure(`render-${name}`);
    }

    return result;
  };

  PerformanceOptimizedComponent.displayName = `withPerformanceOptimizations(${name})`;

  return memoize ? memo(PerformanceOptimizedComponent) : PerformanceOptimizedComponent;
}
