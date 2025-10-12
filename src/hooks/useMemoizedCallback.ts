import { useCallback, useRef } from 'react';

export function useMemoizedCallback<T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T {
  const ref = useRef<T>();

  ref.current = useCallback((...args: Parameters<T>): ReturnType<T> => {
    return callback(...args);
  }, dependencies);

  return useCallback((...args: Parameters<T>): ReturnType<T> => {
    return ref.current!(...args);
  }, []) as T;
}