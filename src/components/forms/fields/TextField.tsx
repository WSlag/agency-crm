import React from 'react';
import { BaseFieldProps, FieldWrapper } from './BaseField';

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'password' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
}

export const TextField = ({
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  maxLength,
  minLength,
  pattern,
  autoComplete,
  disabled,
  required,
  ...fieldProps
}: TextFieldProps) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FieldWrapper {...fieldProps} required={required} disabled={disabled}>
      <input
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={onBlur}
        disabled={disabled}
        required={required}
        placeholder={placeholder}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        autoComplete={autoComplete}
        className={`
          block w-full rounded-md shadow-sm
          ${disabled ? 'bg-gray-100' : 'bg-white'}
          ${
            fieldProps.error
              ? 'border-red-300 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500'
          }
          sm:text-sm
        `}
      />
    </FieldWrapper>
  );
};
