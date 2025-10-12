import React, { useEffect, useRef, useState } from 'react';

interface LazyLoadProps {
  children: React.ReactNode;
  threshold?: number;
  rootMargin?: string;
  className?: string;
  onVisible?: () => void;
}

export const LazyLoad: React.FC<LazyLoadProps> = ({
  children,
  threshold = 0.1,
  rootMargin = '50px',
  className = '',
  onVisible
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentElement = containerRef.current;
    if (!currentElement) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          onVisible?.();
          // Disconnect after becoming visible
          observer.disconnect();
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(currentElement);

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, [threshold, rootMargin, onVisible]);

  return (
    <div ref={containerRef} className={className}>
      {isVisible ? children : null}
    </div>
  );
};
