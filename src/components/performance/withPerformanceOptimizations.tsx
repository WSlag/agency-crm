import React, { memo, useCallback, useRef } from 'react';
import { AsyncBoundary } from './AsyncBoundary';

interface WithPerformanceOptimizationsOptions {
  memoize?: boolean;
  asyncBoundary?: boolean;
  propsAreEqual?: (prevProps: any, nextProps: any) => boolean;
  displayName?: string;
}

export function withPerformanceOptimizations<P extends object>(
  WrappedComponent: React.ComponentType<P>,
  {
    memoize = true,
    asyncBoundary = false,
    propsAreEqual,
    displayName
  }: WithPerformanceOptimizationsOptions = {}
) {
  // Create the optimized component
  let OptimizedComponent: React.ComponentType<P> = (props) => {
    // Use ref for stable event handlers
    const eventHandlerRefs = useRef<{ [key: string]: Function }>({});

    // Wrap event handler props in useCallback
    const wrappedProps = Object.entries(props).reduce((acc, [key, value]) => {
      if (typeof value === 'function' && key.startsWith('on')) {
        if (!eventHandlerRefs.current[key]) {
          eventHandlerRefs.current[key] = useCallback(value as Function, [value]);
        }
        return { ...acc, [key]: eventHandlerRefs.current[key] };
      }
      return { ...acc, [key]: value };
    }, {} as P);

    return <WrappedComponent {...wrappedProps} />;
  };

  // Apply memo if requested
  if (memoize) {
    OptimizedComponent = memo(OptimizedComponent, propsAreEqual);
  }

  // Wrap in AsyncBoundary if requested
  if (asyncBoundary) {
    const WithAsyncBoundary: React.FC<P> = (props) => (
      <AsyncBoundary>
        <OptimizedComponent {...props} />
      </AsyncBoundary>
    );
    OptimizedComponent = WithAsyncBoundary;
  }

  // Set display name for better debugging
  const wrappedDisplayName = displayName || WrappedComponent.displayName || WrappedComponent.name || 'Component';
  OptimizedComponent.displayName = `withPerformanceOptimizations(${wrappedDisplayName})`;

  return OptimizedComponent;
}

// Example usage:
// const OptimizedComponent = withPerformanceOptimizations(MyComponent, {
//   memoize: true,
//   asyncBoundary: true,
//   propsAreEqual: (prev, next) => prev.id === next.id
// });
