import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { OfflineStorage } from '../../services/offline/offlineStorage';

interface OfflineFormConfig {
  type: 'document' | 'transfer' | 'expense';
  syncPriority: 'high' | 'medium' | 'low';
  validation: z.ZodSchema;
  onSubmit: (data: any) => Promise<void>;
  onError: (error: Error) => void;
}

interface OfflineCapableFormProps {
  config: OfflineFormConfig;
  children: React.ReactNode;
  defaultValues?: Record<string, any>;
}

export const OfflineCapableForm: React.FC<OfflineCapableFormProps> = ({
  config,
  children,
  defaultValues,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const offlineStorage = new OfflineStorage();

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(config.validation),
    defaultValues,
  });

  React.useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const onSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      if (isOffline) {
        // Store form data offline
        await offlineStorage.saveForm({
          formType: config.type,
          data,
        });

        // Show success message
        alert('Form saved offline. Will be submitted when connection is restored.');
        reset();
      } else {
        // Submit form directly
        await config.onSubmit(data);
        reset();
      }
    } catch (error) {
      if (!isOffline && error instanceof Error && error.message.includes('network')) {
        // If online submission fails due to network, try saving offline
        try {
          await offlineStorage.saveForm({
            formType: config.type,
            data,
          });
          alert('Network error. Form saved offline and will be submitted later.');
          reset();
        } catch (offlineError) {
          config.onError(new Error('Failed to save form offline'));
        }
      } else {
        config.onError(error instanceof Error ? error : new Error('Form submission failed'));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {isOffline && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You are offline. Form will be submitted when connection is restored.
              </p>
            </div>
          </div>
        </div>
      )}

      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            register,
            errors,
          });
        }
        return child;
      })}

      <div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : isOffline ? 'Save Offline' : 'Submit'}
        </button>
      </div>
    </form>
  );
};
