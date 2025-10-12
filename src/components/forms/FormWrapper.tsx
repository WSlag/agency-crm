import React from 'react';
import { useForm, FieldValues, UseFormProps, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ErrorBoundary } from '../error/ErrorBoundary';

interface FormWrapperProps<T extends FieldValues> {
  schema: z.Schema<T>;
  defaultValues?: UseFormProps<T>['defaultValues'];
  onSubmit: SubmitHandler<T>;
  children: (methods: ReturnType<typeof useForm<T>>) => React.ReactNode;
  className?: string;
}

export const FormWrapper = <T extends FieldValues>({
  schema,
  defaultValues,
  onSubmit,
  children,
  className = ''
}: FormWrapperProps<T>) => {
  const methods = useForm<T>({
    resolver: zodResolver(schema),
    defaultValues,
    mode: 'onBlur'
  });

  return (
    <ErrorBoundary>
      <form
        onSubmit={methods.handleSubmit(onSubmit)}
        className={`space-y-6 ${className}`}
        noValidate
      >
        {children(methods)}
      </form>
    </ErrorBoundary>
  );
};
