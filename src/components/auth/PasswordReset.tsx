import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const passwordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type PasswordResetFormData = z.infer<typeof passwordResetSchema>;

interface PasswordResetProps {
  onSubmit: (email: string) => Promise<void>;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

export const PasswordReset: React.FC<PasswordResetProps> = ({
  onSubmit,
  onSuccess,
  onError,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<PasswordResetFormData>({
    resolver: zodResolver(passwordResetSchema),
  });

  const handleFormSubmit = async (data: PasswordResetFormData) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data.email);
      onSuccess();
    } catch (error) {
      onError(error instanceof Error ? error : new Error('Password reset failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Reset your password
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                type="email"
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSubmitting ? 'Sending...' : 'Reset Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
