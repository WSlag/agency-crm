import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Configure global system settings and preferences.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
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

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Company Information */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Company Information</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Company Name</label>
                <input
                  type="text"
                  {...register('company.name')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.company?.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Address</label>
                <input
                  type="text"
                  {...register('company.address')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.company?.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.address.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Contact Information</label>
                <input
                  type="text"
                  {...register('company.contact')}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
                {errors.company?.contact && (
                  <p className="mt-1 text-sm text-red-600">{errors.company.contact.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Recruitment Settings */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Recruitment Settings</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Maximum Applicants per Officer
                </label>
                <input
                  type="number"
                  {...register('recruitment.maxApplicantsPerOfficer', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Document Expiry Warning Days
                </label>
                <input
                  type="number"
                  {...register('recruitment.documentExpiryWarningDays', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('recruitment.autoAssignOfficers')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Auto-assign Officers to New Applicants
                </label>
              </div>
            </div>
          </div>

          {/* Financial Settings */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Financial Settings</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Currency</label>
                <select
                  {...register('financial.currency')}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                >
                  <option value="PHP">PHP - Philippine Peso</option>
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Minimum Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    {...register('financial.commissionRateRange.min', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Maximum Commission Rate (%)
                  </label>
                  <input
                    type="number"
                    {...register('financial.commissionRateRange.max', { valueAsNumber: true })}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                  />
                </div>
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('financial.requireReceiptUpload')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Require Receipt Upload for Expenses
                </label>
              </div>
            </div>
          </div>

          {/* Security Settings */}
          <div className="bg-white shadow sm:rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Security Settings</h2>
            <div className="grid grid-cols-1 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password Expiry (Days)
                </label>
                <input
                  type="number"
                  {...register('security.passwordExpiryDays', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Session Timeout (Minutes)
                </label>
                <input
                  type="number"
                  {...register('security.sessionTimeoutMinutes', { valueAsNumber: true })}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('security.requireTwoFactor')}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label className="ml-2 block text-sm text-gray-900">
                  Require Two-Factor Authentication
                </label>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
