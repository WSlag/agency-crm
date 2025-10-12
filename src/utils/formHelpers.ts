import { z } from 'zod';
import { useCallback, useState } from 'react';

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export interface FormHelperOptions<T> {
  initialData?: T;
  onSubmit?: (data: T) => Promise<void>;
  validationSchema?: z.ZodSchema<T>;
  onError?: (error: Error) => void;
}

export function useFormHelper<T extends Record<string, any>>(
  options: FormHelperOptions<T>
) {
  const [data, setData] = useState<Partial<T>>(options.initialData || {});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback(
    (formData: unknown): formData is T => {
      if (!options.validationSchema) {
        return true;
      }

      const result = options.validationSchema.safeParse(formData);
      if (!result.success) {
        const formattedErrors: Record<string, string> = {};
        result.error.issues.forEach(issue => {
          const path = issue.path.join('.');
          formattedErrors[path] = issue.message;
        });
        setErrors(formattedErrors);
        return false;
      }

      setErrors({});
      return true;
    },
    [options.validationSchema]
  );

  const setValue = useCallback(<K extends keyof T>(
    field: K,
    value: T[K]
  ) => {
    setData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error when field is updated
    setErrors(prev => ({
      ...prev,
      [field]: undefined
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (isSubmitting) return;

      try {
        setIsSubmitting(true);
        
        if (!validate(data)) {
          return;
        }

        await options.onSubmit?.(data as T);
        setErrors({});
      } catch (error) {
        options.onError?.(error as Error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [data, isSubmitting, options, validate]
  );

  const reset = useCallback(() => {
    setData(options.initialData || {});
    setErrors({});
  }, [options.initialData]);

  return {
    data,
    errors,
    isSubmitting,
    setValue,
    handleSubmit,
    reset,
    validate
  };
}
