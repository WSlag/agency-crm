import { useRef, useEffect, useCallback } from 'react';

interface FocusManagementOptions {
  autoFocus?: boolean;
  focusOnMount?: boolean;
  focusOnUnmount?: boolean;
  returnFocusOnUnmount?: boolean;
  focusElementSelector?: string;
  onFocusChange?: (focused: boolean) => void;
}

export const useFocusManagement = ({
  autoFocus = false,
  focusOnMount = false,
  focusOnUnmount = false,
  returnFocusOnUnmount = true,
  focusElementSelector,
  onFocusChange
}: FocusManagementOptions = {}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const focus = useCallback(() => {
    if (!containerRef.current) return;

    let elementToFocus: HTMLElement | null = null;

    if (focusElementSelector) {
      elementToFocus = containerRef.current.querySelector(focusElementSelector);
    }

    if (!elementToFocus) {
      elementToFocus = containerRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      ) as HTMLElement;
    }

    if (elementToFocus) {
      elementToFocus.focus();
      onFocusChange?.(true);
    }
  }, [focusElementSelector, onFocusChange]);

  const savePreviousFocus = useCallback(() => {
    previousFocusRef.current = document.activeElement as HTMLElement;
  }, []);

  const restorePreviousFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      onFocusChange?.(false);
    }
  }, [onFocusChange]);

  useEffect(() => {
    if (autoFocus || focusOnMount) {
      savePreviousFocus();
      focus();
    }

    return () => {
      if (focusOnUnmount) {
        focus();
      } else if (returnFocusOnUnmount) {
        restorePreviousFocus();
      }
    };
  }, [
    autoFocus,
    focusOnMount,
    focusOnUnmount,
    returnFocusOnUnmount,
    focus,
    savePreviousFocus,
    restorePreviousFocus
  ]);

  return {
    containerRef,
    focus,
    savePreviousFocus,
    restorePreviousFocus
  };
};
