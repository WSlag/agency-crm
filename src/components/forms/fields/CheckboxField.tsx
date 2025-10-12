import React from 'react';
import { UseFormRegister, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface CheckboxFieldProps<T extends FieldValues> {
  name: Path<T>;
  label: string;
  register: UseFormRegister<T>;
  rules?: RegisterOptions;
  error?: string;
  className?: string;
  disabled?: boolean;
  helpText?: string;
}

export const CheckboxField = <T extends FieldValues>({
  name,
  label,
  register,
  rules,
  error,
  className = '',
  disabled = false,
  helpText,
}: CheckboxFieldProps<T>) => {
  const { ref, ...registerProps } = register(name, rules);

  return (
    <div className={`relative flex items-start ${className}`}>
      <div className="flex h-5 items-center">
        <input
          id={name}
          type="checkbox"
          ref={ref}
          {...registerProps}
          disabled={disabled}
          className={`
            h-4 w-4 rounded border-gray-300 text-primary-600
            focus:ring-primary-500
            ${disabled ? 'bg-gray-50' : ''}
            ${error ? 'border-red-300' : ''}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${name}-error` : undefined}
        />
      </div>
      <div className="ml-3 text-sm">
        <label
          htmlFor={name}
          className={`font-medium ${
            disabled ? 'text-gray-500' : 'text-gray-700'
          }`}
        >
          {label}
        </label>
        {(helpText || error) && (
          <p
            id={error ? `${name}-error` : undefined}
            className={`mt-1 ${
              error ? 'text-red-600' : 'text-gray-500'
            }`}
          >
            {error || helpText}
          </p>
        )}
      </div>
    </div>
  );
};
