import React, { useEffect } from 'react';
import { CheckCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ToastProps {
  message: string;
  type?: 'success' | 'info' | 'warning' | 'error';
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'success',
  onClose,
  duration = 3000
}) => {
  useEffect(() => {
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const bgColors = {
    success: 'bg-green-50 border-green-500',
    info: 'bg-blue-50 border-blue-500',
    warning: 'bg-yellow-50 border-yellow-500',
    error: 'bg-red-50 border-red-500'
  };

  const textColors = {
    success: 'text-green-900',
    info: 'text-blue-900',
    warning: 'text-yellow-900',
    error: 'text-red-900'
  };

  const iconColors = {
    success: 'text-green-500',
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    error: 'text-red-500'
  };

  return (
    <div
      className="fixed top-4 right-4 z-50"
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
      <div className={`${bgColors[type]} border-l-4 rounded-lg shadow-lg p-4 max-w-md flex items-start gap-3`}>
        <CheckCircleIcon className={`h-6 w-6 ${iconColors[type]} flex-shrink-0`} />
        <div className="flex-1">
          <p className={`font-medium ${textColors[type]}`}>
            {message}
          </p>
        </div>
        <button
          onClick={onClose}
          className={`${textColors[type]} hover:opacity-70 transition-opacity`}
        >
          <XMarkIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};
