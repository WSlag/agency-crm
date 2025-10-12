import { useCallback, useEffect, useRef } from 'react';

type AriaLive = 'off' | 'polite' | 'assertive';

interface AnnouncerOptions {
  politeness?: AriaLive;
  timeout?: number;
}

export const useAnnouncer = (options: AnnouncerOptions = {}) => {
  const {
    politeness = 'polite',
    timeout = 7000 // Clear after 7 seconds by default
  } = options;

  const timeoutRef = useRef<number>();
  const regionRef = useRef<HTMLDivElement | null>(null);

  const announce = useCallback((message: string) => {
    if (!regionRef.current) {
      regionRef.current = document.createElement('div');
      regionRef.current.setAttribute('aria-live', politeness);
      regionRef.current.setAttribute('aria-atomic', 'true');
      regionRef.current.className = 'sr-only';
      document.body.appendChild(regionRef.current);
    }

    // Clear any existing timeout
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
    }

    // Update the announcement
    regionRef.current.textContent = message;

    // Clear the announcement after timeout
    timeoutRef.current = window.setTimeout(() => {
      if (regionRef.current) {
        regionRef.current.textContent = '';
      }
    }, timeout);
  }, [politeness, timeout]);

  useEffect(() => {
    return () => {
      // Clean up on unmount
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
      if (regionRef.current) {
        document.body.removeChild(regionRef.current);
      }
    };
  }, []);

  return announce;
};
