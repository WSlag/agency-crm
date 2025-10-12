import { useEffect, useRef, KeyboardEvent as ReactKeyboardEvent } from 'react';

type KeyHandler = (event: KeyboardEvent | ReactKeyboardEvent) => void;

interface KeyboardConfig {
  [key: string]: KeyHandler;
}

export const useKeyboardNavigation = (config: KeyboardConfig) => {
  const handlers = useRef(config);
  handlers.current = config;

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't handle keyboard events when user is typing in an input
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        event.target instanceof HTMLSelectElement
      ) {
        return;
      }

      const handler = handlers.current[event.key];
      if (handler) {
        handler(event);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    handleKeyDown: (event: ReactKeyboardEvent) => {
      const handler = handlers.current[event.key];
      if (handler) {
        handler(event);
      }
    }
  };
};
