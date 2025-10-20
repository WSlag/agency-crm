import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  SparklesIcon,
  UserCircleIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

const profileUpdateSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
    language: z.string(),
  }),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

export const ProfilePage: React.FC = () => {
  const { user, customClaims } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: '',
      preferences: {
        theme: 'light',
        notifications: true,
        language: 'en',
      },
    },
  });

  // Load user data from Firestore on component mount
  useEffect(() => {
    const loadUserData = async () => {
      if (!user) return;

      try {
        setLoadingData(true);
        const userRef = doc(firestore, 'users', user.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          reset({
            displayName: userData.displayName || user.displayName || '',
            preferences: {
              theme: userData.preferences?.theme || 'light',
              notifications: userData.preferences?.notifications ?? true,
              language: userData.preferences?.language || 'en',
            },
          });
        } else {
          // If document doesn't exist, use auth data
          reset({
            displayName: user.displayName || '',
            preferences: {
              theme: 'light',
              notifications: true,
              language: 'en',
            },
          });
        }
      } catch (err) {
        console.error('Error loading user data:', err);
        setError('Failed to load profile data');
      } finally {
        setLoadingData(false);
      }
    };

    loadUserData();
  }, [user, reset]);

  const onSubmit = async (data: ProfileUpdateData) => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      // Update Firebase Auth displayName
      await updateProfile(user, {
        displayName: data.displayName,
      });

      // Update Firestore user document
      const userRef = doc(firestore, 'users', user.uid);
      await updateDoc(userRef, {
        displayName: data.displayName,
        preferences: data.preferences,
        updatedAt: new Date(),
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        // Reload the page to refresh the auth context with new displayName
        window.location.reload();
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  // Show loading skeleton while fetching data
  if (loadingData) {
    return (
      <div className="min-h-full">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
          <div className="px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
              >
                <ArrowLeftIcon className="h-6 w-6 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <UserCircleIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center">
                    My Profile
                    <SparklesIcon className="ml-3 h-8 w-8 text-yellow-300 animate-pulse" />
                  </h1>
                  <p className="text-indigo-100 mt-1">Loading your profile...</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Loading Skeleton */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-2xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate(-1)}
                className="p-2 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-200 border border-white/20"
              >
                <ArrowLeftIcon className="h-6 w-6 text-white" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20">
                  <UserCircleIcon className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white flex items-center">
                    My Profile
                    <SparklesIcon className="ml-3 h-8 w-8 text-yellow-300 animate-pulse" />
                  </h1>
                  <p className="text-indigo-100 mt-1">Manage your account settings and preferences</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Success Message */}
          {success && (
            <div className="rounded-xl bg-green-50 border-2 border-green-200 p-4 shadow-lg animate-bounce-in">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-600 mr-3" />
                <p className="text-sm font-semibold text-green-800">Profile updated successfully!</p>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 shadow-lg">
              <p className="text-sm font-semibold text-red-800">⚠️ {error}</p>
            </div>
          )}

          {/* Account Information (Read-only) */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
            <div className="flex items-center space-x-2 mb-6">
              <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
              <h3 className="text-xl font-bold text-gray-900">Account Information</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <EnvelopeIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                  Email Address
                </label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="block w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-600 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Email cannot be changed</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <ShieldCheckIcon className="h-4 w-4 inline mr-2 text-indigo-600" />
                  Role
                </label>
                <input
                  type="text"
                  value={customClaims?.role || 'No role assigned'}
                  disabled
                  className="block w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-4 py-2.5 text-gray-600 cursor-not-allowed capitalize"
                />
                <p className="mt-1 text-xs text-gray-500">Role is managed by administrators</p>
              </div>
            </div>
          </div>

          {/* Profile Settings Form */}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Profile Settings</h3>
              </div>

              <div className="space-y-6">
                {/* Display Name */}
                <div>
                  <label htmlFor="displayName" className="block text-sm font-semibold text-gray-700 mb-2">
                    Display Name
                  </label>
                  <input
                    {...register('displayName')}
                    type="text"
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-400"
                    placeholder="John Doe"
                  />
                  {errors.displayName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">
                      ⚠️ {errors.displayName.message}
                    </p>
                  )}
                </div>

                {/* Theme Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Theme Preference</label>
                  <select
                    {...register('preferences.theme')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-400"
                  >
                    <option value="light">☀️ Light Mode</option>
                    <option value="dark">🌙 Dark Mode</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Choose your preferred theme</p>
                </div>

                {/* Notifications */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      {...register('preferences.notifications')}
                      type="checkbox"
                      className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded cursor-pointer"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-semibold text-gray-700 cursor-pointer">
                      Enable Notifications
                    </label>
                    <p className="text-gray-500">Receive notifications about important updates</p>
                  </div>
                </div>

                {/* Language Preference */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Language</label>
                  <select
                    {...register('preferences.language')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 transition-all hover:border-indigo-400"
                  >
                    <option value="en">🇺🇸 English</option>
                    <option value="fil">🇵🇭 Filipino</option>
                  </select>
                  <p className="mt-1 text-xs text-gray-500">Select your preferred language</p>
                </div>
              </div>

              {/* Save Button */}
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate(-1)}
                  className="px-6 py-2.5 border-2 border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className={`px-6 py-2.5 border border-transparent rounded-lg shadow-lg text-sm font-semibold text-white transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
                    loading
                      ? 'bg-indigo-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Saving...
                    </span>
                  ) : (
                    'Save Changes'
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

