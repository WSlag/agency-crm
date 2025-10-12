import React from 'react';
import { BaseFieldProps, FieldWrapper } from './BaseField';

interface Option {
  value: string;
  label: string;
}

interface SelectFieldProps extends BaseFieldProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: Option[];
  placeholder?: string;
}

export const SelectField = ({
  value,
  onChange,
  onBlur,
  options,
  placeholder,
  disabled,
  required,
  ...fieldProps
}: SelectFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <FieldWrapper {...fieldProps} required={required} disabled={disabled}>
      <select
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        className={`
          block w-full rounded-md shadow-sm
          ${disabled ? 'bg-gray-100' : 'bg-white'}
          ${
            fieldProps.error
              ? 'border-red-300 text-red-900 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }
          sm:text-sm
        `}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};
