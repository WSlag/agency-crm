import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import {
  EnvelopeIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  SparklesIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  ChartBarIcon,
  ExclamationCircleIcon,
} from '@heroicons/react/24/outline';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      setError(null);
      await signIn(data.email, data.password);
      
      // Navigate to the page they tried to visit or dashboard
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during sign in');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-6xl w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding & Features (Hidden on mobile) */}
          <div className="hidden lg:block space-y-8">
            {/* Logo & Brand */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center space-x-3 mb-6">
                <div className="h-14 w-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform">
                  <SparklesIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                    Agency CRM
                  </h1>
                  <p className="text-sm text-gray-600">Recruitment Management System</p>
                </div>
              </div>
              <p className="text-lg text-gray-700 leading-relaxed">
                Streamline your recruitment process with our comprehensive management platform.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                  <UserGroupIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Applicant Management</h3>
                  <p className="text-sm text-gray-600">Track and manage all applicants in one place</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                  <ChartBarIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Real-time Analytics</h3>
                  <p className="text-sm text-gray-600">Monitor performance with live dashboards</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                  <ShieldCheckIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Secure & Compliant</h3>
                  <p className="text-sm text-gray-600">Enterprise-grade security for your data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="w-full max-w-md mx-auto lg:max-w-none">
            {/* Mobile Logo (Visible only on mobile) */}
            <div className="lg:hidden text-center mb-8">
              <div className="inline-flex items-center justify-center space-x-2 mb-4">
                <div className="h-12 w-12 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <SparklesIcon className="h-7 w-7 text-white" />
                </div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  Agency CRM
                </h1>
              </div>
            </div>

            {/* Login Card */}
            <div className="bg-white rounded-2xl shadow-2xl border-2 border-gray-100 overflow-hidden">
              {/* Card Header */}
              <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 px-6 sm:px-8 py-6 sm:py-8">
                <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
                  Sign in to your account
                </h2>
                <p className="mt-2 text-sm sm:text-base text-indigo-100 text-center">
                  Welcome back! Please enter your credentials
                </p>
              </div>

              {/* Card Body */}
              <div className="px-6 sm:px-8 py-8 sm:py-10">
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                  {/* Error Message */}
                  {error && (
                    <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 animate-shake">
                      <div className="flex items-start">
                        <ExclamationCircleIcon className="h-5 w-5 text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Email Input */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('email')}
                        id="email"
                        type="email"
                        autoComplete="email"
                        className={`block w-full pl-10 pr-3 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all duration-200 sm:text-sm
                          ${errors.email ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password Input */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        {...register('password')}
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        autoComplete="current-password"
                        className={`block w-full pl-10 pr-12 py-3 border-2 rounded-xl text-gray-900 placeholder-gray-400 
                          focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                          transition-all duration-200 sm:text-sm
                          ${errors.password ? 'border-red-300 bg-red-50' : 'border-gray-200 hover:border-gray-300'}`}
                        placeholder="Enter your password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-indigo-600 transition-colors"
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5 text-gray-400" />
                        ) : (
                          <EyeIcon className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <ExclamationCircleIcon className="h-4 w-4 mr-1" />
                        {errors.password.message}
                      </p>
                    )}
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 cursor-pointer">
                        Remember me
                      </label>
                    </div>

                    <div className="text-sm">
                      <a
                        href="#"
                        className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                      >
                        Forgot your password?
                      </a>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="group relative w-full flex justify-center items-center py-3 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Signing in...
                        </>
                      ) : (
                        <>
                          <LockClosedIcon className="h-5 w-5 mr-2" />
                          Sign in
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>

              {/* Card Footer */}
              <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-100">
                <p className="text-xs text-center text-gray-600">
                  Protected by enterprise-grade security • 
                  <ShieldCheckIcon className="inline h-4 w-4 ml-1 mr-1 text-green-500" />
                  Encrypted connection
                </p>
              </div>
            </div>

            {/* Mobile Features (Visible only on mobile) */}
            <div className="lg:hidden mt-8 space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                <UserGroupIcon className="h-5 w-5 text-indigo-600 flex-shrink-0" />
                <p className="text-xs text-gray-700">Applicant Management</p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                <ChartBarIcon className="h-5 w-5 text-purple-600 flex-shrink-0" />
                <p className="text-xs text-gray-700">Real-time Analytics</p>
              </div>
              <div className="flex items-center space-x-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg">
                <ShieldCheckIcon className="h-5 w-5 text-green-600 flex-shrink-0" />
                <p className="text-xs text-gray-700">Secure & Compliant</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
