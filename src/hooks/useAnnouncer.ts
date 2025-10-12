import { useCallback } from 'react';

let announcer: HTMLElement | null = null;

const getAnnouncer = () => {
  if (!announcer) {
    announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.setAttribute('class', 'sr-only');
    document.body.appendChild(announcer);
  }
  return announcer;
};

export const useAnnouncer = () => {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = getAnnouncer();
    announcer.setAttribute('aria-live', priority);
    // Clear previous message
    announcer.textContent = '';
    // Set new message after a brief delay to ensure screen readers catch the change
    setTimeout(() => {
      announcer.textContent = message;
    }, 50);
  }, []);

  return { announce };
};