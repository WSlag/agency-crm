import React from 'react';

export interface BaseFieldProps {
  name: string;
  label: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  helpText?: string;
}

export const FieldWrapper: React.FC<BaseFieldProps & { children: React.ReactNode }> = ({
  label,
  error,
  required,
  helpText,
  children,
  className = ''
}) => {
  const id = React.useId();

  return (
    <div className={className}>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-gray-700"
      >
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="mt-1">
        {React.cloneElement(children as React.ReactElement, { id })}
        {helpText && (
          <p className="mt-2 text-sm text-gray-500">{helpText}</p>
        )}
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};
