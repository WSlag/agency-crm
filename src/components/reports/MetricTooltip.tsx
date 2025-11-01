import React, { useState, useRef, useEffect } from 'react';
import { QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { createPortal } from 'react-dom';

interface MetricTooltipProps {
  title: string;
  description: string;
  formula?: string;
  example?: string;
}

export const MetricTooltip: React.FC<MetricTooltipProps> = ({
  title,
  description,
  formula,
  example,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isVisible && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const spacing = 8;

      let left = rect.right + spacing;
      let top = rect.top;

      // Check if tooltip would go off-screen to the right
      if (left + tooltipWidth > window.innerWidth - spacing) {
        left = rect.left - tooltipWidth - spacing;
      }

      // Check if tooltip would go off-screen at the bottom
      if (top + 200 > window.innerHeight - spacing) {
        top = window.innerHeight - 200 - spacing;
      }

      setPosition({ top, left });
    }
  }, [isVisible]);

  const tooltipContent = isVisible && (
    <div
      className="fixed z-50 w-80 bg-white rounded-xl shadow-2xl border-2 border-indigo-200 p-4"
      style={{ top: `${position.top}px`, left: `${position.left}px` }}
    >
      {/* Header */}
      <div className="flex items-start space-x-2 mb-3">
        <QuestionMarkCircleIcon className="h-5 w-5 text-indigo-600 flex-shrink-0 mt-0.5" />
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
      </div>

      {/* Description */}
      <p className="text-xs text-gray-700 leading-relaxed mb-3">
        {description}
      </p>

      {/* Formula (if provided) */}
      {formula && (
        <div className="bg-indigo-50 rounded-lg p-3 mb-3">
          <div className="text-xs font-semibold text-indigo-900 mb-1">
            Formula:
          </div>
          <code className="text-xs text-indigo-700 font-mono">{formula}</code>
        </div>
      )}

      {/* Example (if provided) */}
      {example && (
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs font-semibold text-gray-900 mb-1">
            Example:
          </div>
          <div className="text-xs text-gray-700">{example}</div>
        </div>
      )}

      {/* Arrow indicator */}
      <div
        className="absolute w-3 h-3 bg-white border-l-2 border-t-2 border-indigo-200 transform rotate-[-45deg]"
        style={{
          left: position.left > window.innerWidth / 2 ? 'auto' : '-6px',
          right: position.left > window.innerWidth / 2 ? '-6px' : 'auto',
          top: '20px',
        }}
      />
    </div>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)}
        className="inline-flex items-center justify-center w-5 h-5 rounded-full text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
        aria-label="Show metric description"
      >
        <QuestionMarkCircleIcon className="h-5 w-5" />
      </button>

      {isVisible && createPortal(tooltipContent, document.body)}
    </>
  );
};
