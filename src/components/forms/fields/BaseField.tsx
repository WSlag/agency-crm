import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

interface BaseFieldProps {
  label?: string;
  htmlFor?: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  helpText?: string;
}

export const BaseField: React.FC<BaseFieldProps> = ({
  label,
  htmlFor,
  error,
  children,
  className = '',
  required = false,
  helpText
}) => {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={htmlFor}
          className="block text-sm font-medium text-gray-700"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <div className="relative mt-1">
        {children}
        {error && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <ExclamationCircleIcon
              className="h-5 w-5 text-red-500"
              aria-hidden="true"
            />
          </div>
        )}
      </div>
      {(error || helpText) && (
        <p
          className={`mt-2 text-sm ${
            error ? 'text-red-600' : 'text-gray-500'
          }`}
        >
          {error || helpText}
        </p>
      )}
    </div>
  );
};