import React from 'react';
import { UseFormRegister, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { BaseField } from './BaseField';

interface TextAreaFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions;
  error?: string;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  rows?: number;
}

export const TextAreaField = <T extends FieldValues>({
  name,
  label,
  register,
  rules,
  error,
  placeholder,
  className = '',
  disabled = false,
  required = false,
  helpText,
  rows = 4,
}: TextAreaFieldProps<T>) => {
  const { ref, ...registerProps } = register(name, rules);

  return (
    <BaseField
      label={label}
      htmlFor={name}
      error={error}
      className={className}
      required={required}
      helpText={helpText}
    >
      <textarea
        id={name}
        ref={ref}
        {...registerProps}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          block w-full rounded-md shadow-sm sm:text-sm
          ${error
            ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
            : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }
          ${disabled ? 'bg-gray-50 text-gray-500' : ''}
        `}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${name}-error` : undefined}
      />
    </BaseField>
  );
};
