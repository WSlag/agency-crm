import React, { forwardRef } from 'react';
import { UseFormRegister, FieldValues, Path, RegisterOptions } from 'react-hook-form';
import { BaseField } from './BaseField';

interface TextFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions;
  error?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  required?: boolean;
  helpText?: string;
  autoComplete?: string;
}

export const TextField = <T extends FieldValues>({
  name,
  label,
  register,
  rules,
  error,
  type = 'text',
  placeholder,
  className = '',
  disabled = false,
  required = false,
  helpText,
  autoComplete,
}: TextFieldProps<T>) => {
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
      <input
        id={name}
        type={type}
        ref={ref}
        {...registerProps}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
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