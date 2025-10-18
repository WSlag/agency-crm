import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../config/firebase';
import {
  SparklesIcon,
  EnvelopeIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetEmail, setResetEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Send password reset email
      await sendPasswordResetEmail(auth, data.email);

      setResetEmail(data.email);
      setSuccess(true);

      // In development, log helpful message
      if (import.meta.env.DEV) {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔐 PASSWORD RESET EMAIL SENT (DEV MODE)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📧 Email: ${data.email}`);
        console.log('');
        console.log('⚠️  In development mode, check your email for the reset link.');
        console.log('   If no email arrives, check Firebase Console → Authentication');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      }
    } catch (err: any) {
      console.error('Password reset error:', err);
      
      // Provide user-friendly error messages
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Invalid email address format.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Too many requests. Please try again later.');
      } else {
        setError(err.message || 'Failed to send password reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto h-24 w-24 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl animate-bounce-in">
              <CheckCircleIcon className="h-12 w-12 text-white" />
            </div>
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              Check Your Email
            </h2>
            <div className="mt-4 bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <p className="text-sm text-gray-600 mb-4">
                We've sent a password reset link to:
              </p>
              <p className="text-lg font-semibold text-indigo-600 mb-4">
                {resetEmail}
              </p>
              <p className="text-sm text-gray-600 mb-6">
                Click the link in the email to reset your password. The link will expire in 1 hour.
              </p>
              
              {import.meta.env.DEV && (
                <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
                  <p className="text-xs font-semibold text-yellow-800 mb-2">
                    🔧 Development Mode
                  </p>
                  <p className="text-xs text-yellow-700">
                    Check your email or Firebase Console → Authentication for the reset link.
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  Back to Login
                </Link>
                
                <button
                  onClick={() => {
                    setSuccess(false);
                    setResetEmail('');
                  }}
                  className="block w-full py-3 px-4 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  Send Another Email
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="flex justify-center">
            <div className="p-4 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl shadow-2xl">
              <SparklesIcon className="h-12 w-12 text-white animate-pulse" />
            </div>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Reset Your Password
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border-2 border-red-200 p-4">
              <p className="text-sm font-semibold text-red-800">⚠️ {error}</p>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                <EnvelopeIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={loading}
                className={`appearance-none block w-full px-4 py-3 border-2 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                  errors.email
                    ? 'border-red-300 bg-red-50'
                    : 'border-gray-300 hover:border-indigo-400'
                } ${loading ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              />
              {errors.email && (
                <p className="mt-2 text-sm text-red-600 flex items-center">
                  ⚠️ {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-semibold rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-lg ${
                  loading
                    ? 'bg-indigo-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                }`}
              >
                {loading ? (
                  <span className="flex items-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-3"></div>
                    Sending Reset Link...
                  </span>
                ) : (
                  'Send Reset Link'
                )}
              </button>
            </div>

            <div className="flex items-center justify-center space-x-4 text-sm">
              <Link
                to="/login"
                className="flex items-center font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-1" />
                Back to Login
              </Link>
            </div>
          </form>
        </div>

        {import.meta.env.DEV && (
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4 shadow-lg">
            <p className="text-xs font-semibold text-yellow-800 mb-2">
              🔧 Development Mode Tips
            </p>
            <ul className="text-xs text-yellow-700 space-y-1 list-disc list-inside">
              <li>Reset links are sent to the email address on file</li>
              <li>Check Firebase Console if emails aren't arriving</li>
              <li>Reset links expire in 1 hour</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

