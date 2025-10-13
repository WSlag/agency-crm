import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  SparklesIcon,
  BuildingOfficeIcon,
  UsersIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';

const systemSettingsSchema = z.object({
  company: z.object({
    name: z.string().min(1, 'Company name is required'),
    address: z.string().min(1, 'Address is required'),
    contact: z.string().min(1, 'Contact information is required'),
    logo: z.string().optional(),
  }),
  recruitment: z.object({
    maxApplicantsPerOfficer: z.number().min(1),
    documentExpiryWarningDays: z.number().min(1),
    autoAssignOfficers: z.boolean(),
  }),
  financial: z.object({
    currency: z.string().min(1),
    commissionRateRange: z.object({
      min: z.number().min(0),
      max: z.number().max(100),
    }),
    requireReceiptUpload: z.boolean(),
  }),
  security: z.object({
    passwordExpiryDays: z.number().min(0),
    sessionTimeoutMinutes: z.number().min(5),
    requireTwoFactor: z.boolean(),
  }),
});

type SystemSettingsData = z.infer<typeof systemSettingsSchema>;

export const SystemSettings: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<SystemSettingsData>({
    resolver: zodResolver(systemSettingsSchema),
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const settingsRef = doc(firestore, 'system_settings', 'general');
      const settingsDoc = await getDoc(settingsRef);

      if (settingsDoc.exists()) {
        reset(settingsDoc.data() as SystemSettingsData);
      } else {
        // Set default values
        reset({
          company: {
            name: '',
            address: '',
            contact: '',
          },
          recruitment: {
            maxApplicantsPerOfficer: 20,
            documentExpiryWarningDays: 30,
            autoAssignOfficers: false,
          },
          financial: {
            currency: 'PHP',
            commissionRateRange: {
              min: 0,
              max: 20,
            },
            requireReceiptUpload: true,
          },
          security: {
            passwordExpiryDays: 90,
            sessionTimeoutMinutes: 30,
            requireTwoFactor: false,
          },
        });
      }
    } catch (error) {
      setError('Failed to load settings');
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: SystemSettingsData) => {
    try {
      setIsSaving(true);
      setError(null);

      const settingsRef = doc(firestore, 'system_settings', 'general');
      await setDoc(settingsRef, {
        ...data,
        updatedAt: new Date(),
      });
    } catch (error) {
      setError('Failed to save settings');
      console.error('Error saving settings:', error);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
            <SparklesIcon className="h-6 w-6 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
          </div>
          <p className="mt-4 text-gray-600 font-medium">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold text-white">System Settings</h1>
              <p className="text-indigo-100 mt-1">
                Configure global system settings and preferences
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Company Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
                <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  {...register('company.name')}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white p-2.5"
                />
                {errors.company?.name && (
                  <p className="mt-1 text-sm text-red-600">⚠ {errors.company.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input
                  type="text"
                  {...register('company.address')}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white p-2.5"
                />
                {errors.company?.address && (
                  <p className="mt-1 text-sm text-red-600">⚠ {errors.company.address.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Contact Information</label>
                <input
                  type="text"
                  {...register('company.contact')}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white p-2.5"
                />
                {errors.company?.contact && (
                  <p className="mt-1 text-sm text-red-600">⚠ {errors.company.contact.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recruitment Settings */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <UsersIcon className="h-6 w-6 text-green-600" />
                <h2 className="text-lg font-semibold text-gray-900">Recruitment Settings</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Maximum Applicants per Officer
                </label>
                <input
                  type="number"
                  {...register('recruitment.maxApplicantsPerOfficer', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all hover:border-green-400 bg-white p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Document Expiry Warning Days
                </label>
                <input
                  type="number"
                  {...register('recruitment.documentExpiryWarningDays', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm transition-all hover:border-green-400 bg-white p-2.5"
                />
              </div>
              <div className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                <input
                  type="checkbox"
                  {...register('recruitment.autoAssignOfficers')}
                  className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-900">
                  Auto-assign Officers to New Applicants
                </label>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-6 w-6 text-yellow-600" />
                <h2 className="text-lg font-semibold text-gray-900">Financial Settings</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                <select
                  {...register('financial.currency')}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm transition-all hover:border-yellow-400 bg-white p-2.5"
                >
                  <option value="PHP">PHP - Philippine Peso</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    {...register('financial.commissionRateRange.min', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm transition-all hover:border-yellow-400 bg-white p-2.5"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Maximum Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    {...register('financial.commissionRateRange.max', { valueAsNumber: true })}
                    className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-yellow-500 focus:ring-yellow-500 sm:text-sm transition-all hover:border-yellow-400 bg-white p-2.5"
                  />
                </div>
              </div>
              <div className="flex items-center p-4 bg-yellow-50 rounded-lg hover:bg-yellow-100 transition-colors">
                <input
                  type="checkbox"
                  {...register('financial.requireReceiptUpload')}
                  className="h-5 w-5 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-900">
                  Require Receipt Upload for Expenses
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <ShieldCheckIcon className="h-6 w-6 text-purple-600" />
                <h2 className="text-lg font-semibold text-gray-900">Security Settings</h2>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password Expiry (Days)
                </label>
                <input
                  type="number"
                  {...register('security.passwordExpiryDays', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all hover:border-purple-400 bg-white p-2.5"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  {...register('security.sessionTimeoutMinutes', { valueAsNumber: true })}
                  className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-sm transition-all hover:border-purple-400 bg-white p-2.5"
                />
              </div>
              <div className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                <input
                  type="checkbox"
                  {...register('security.requireTwoFactor')}
                  className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label className="ml-3 block text-sm font-medium text-gray-900">
                  Require Two-Factor Authentication
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-lg text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {isSaving ? 'Saving Settings...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
