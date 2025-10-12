import React, { useEffect, useRef } from 'react';
import { focusManagement } from '../../utils/focusManagement';

interface FocusTrapProps {
  children: React.ReactNode;
  active?: boolean;
  returnFocusOnDeactivate?: boolean;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  active = true,
  returnFocusOnDeactivate = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cleanup = useRef<(() => void) | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !active) return;

    // Set up focus trap
    const removeTrap = focusManagement.trapFocus(container);

    // Create focus scope if returnFocusOnDeactivate is true
    const removeScope = returnFocusOnDeactivate
      ? focusManagement.createFocusScope(container)
      : undefined;

    cleanup.current = () => {
      removeTrap();
      removeScope?.();
    };

    return () => cleanup.current?.();
  }, [active, returnFocusOnDeactivate]);

  return (
    <div ref={containerRef} tabIndex={-1}>
      {children}
    </div>
  );
};
