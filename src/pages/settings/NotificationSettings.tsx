import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationService, NotificationType, NotificationChannel, UserNotificationPreferences } from '../../services/notifications/notificationService';
import {
  SparklesIcon,
  BellIcon,
  EnvelopeIcon,
  DevicePhoneMobileIcon,
} from '@heroicons/react/24/outline';

const notificationTypes: { type: NotificationType; label: string; description: string }[] = [
  {
    type: 'document_verification',
    label: 'Document Verification',
    description: 'Notifications about document verification requests and results',
  },
  {
    type: 'transfer_request',
    label: 'Transfer Requests',
    description: 'Updates about applicant transfer requests',
  },
  {
    type: 'transfer_approval',
    label: 'Transfer Approvals',
    description: 'Notifications when transfers are approved or rejected',
  },
  {
    type: 'expense_approval',
    label: 'Expense Approvals',
    description: 'Updates about expense approval requests and decisions',
  },
  {
    type: 'commission_approval',
    label: 'Commission Approvals',
    description: 'Notifications about commission approval status',
  },
  {
    type: 'document_expiry',
    label: 'Document Expiry',
    description: 'Alerts about documents approaching expiration',
  },
  {
    type: 'system_alert',
    label: 'System Alerts',
    description: 'Important system notifications and updates',
  },
];

const channels: { id: NotificationChannel; label: string; icon: string }[] = [
  {
    id: 'email',
    label: 'Email',
    icon: 'mail',
  },
  {
    id: 'push',
    label: 'Push Notifications',
    icon: 'bell',
  },
  {
    id: 'in-app',
    label: 'In-App Notifications',
    icon: 'desktop',
  },
];

export const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserNotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const notificationService = new NotificationService();

  useEffect(() => {
    loadPreferences();
  }, [user?.id]);

  const loadPreferences = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const userPrefs = await notificationService.getUserPreferences(user.id);
      setPreferences(userPrefs);
    } catch (error) {
      setError('Failed to load notification preferences');
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelToggle = async (channel: NotificationChannel) => {
    if (!preferences || !user?.id) return;

    try {
      setSaving(true);
      const updatedPreferences = {
        ...preferences,
        channels: {
          ...preferences.channels,
          [channel]: !preferences.channels[channel],
        },
      };

      await notificationService.updateUserPreferences(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      setError('Failed to update channel preferences');
      console.error('Error updating channel preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleTypeToggle = async (type: NotificationType) => {
    if (!preferences || !user?.id) return;

    try {
      setSaving(true);
      const updatedPreferences = {
        ...preferences,
        types: {
          ...preferences.types,
          [type]: {
            ...preferences.types[type],
            enabled: !preferences.types[type].enabled,
          },
        },
      };

      await notificationService.updateUserPreferences(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      setError('Failed to update notification type preferences');
      console.error('Error updating type preferences:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleChannelForTypeToggle = async (type: NotificationType, channel: NotificationChannel) => {
    if (!preferences || !user?.id) return;

    try {
      setSaving(true);
      const currentChannels = preferences.types[type].channels;
      const updatedChannels = currentChannels.includes(channel)
        ? currentChannels.filter(c => c !== channel)
        : [...currentChannels, channel];

      const updatedPreferences = {
        ...preferences,
        types: {
          ...preferences.types,
          [type]: {
            ...preferences.types[type],
            channels: updatedChannels,
          },
        },
      };

      await notificationService.updateUserPreferences(user.id, updatedPreferences);
      setPreferences(updatedPreferences);
    } catch (error) {
      setError('Failed to update notification channels');
      console.error('Error updating channels:', error);
    } finally {
      setSaving(false);
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
          <p className="mt-4 text-gray-600 font-medium">Loading preferences...</p>
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
              <h1 className="text-3xl font-bold text-white">Notification Settings</h1>
              <p className="text-indigo-100 mt-1">
                Manage your notification preferences and channels
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
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

        {/* Notification Channels */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Channels</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {channels.map(channel => (
              <div key={channel.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-lg hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                <div className="flex items-center space-x-3">
                  {channel.id === 'email' && <EnvelopeIcon className="h-5 w-5 text-indigo-600" />}
                  {channel.id === 'push' && <DevicePhoneMobileIcon className="h-5 w-5 text-purple-600" />}
                  {channel.id === 'in-app' && <BellIcon className="h-5 w-5 text-pink-600" />}
                  <span className="font-medium text-gray-900">{channel.label}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleChannelToggle(channel.id)}
                    disabled={saving}
                    className={`${
                      preferences?.channels[channel.id]
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50`}
                  >
                    <span
                      className={`${
                        preferences?.channels[channel.id] ? 'translate-x-5' : 'translate-x-0'
                      } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                    />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notification Types */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <BellIcon className="h-6 w-6 text-green-600" />
              <h2 className="text-lg font-semibold text-gray-900">Notification Types</h2>
            </div>
          </div>
          <div className="p-6 space-y-4">
            {notificationTypes.map(({ type, label, description }) => (
              <div key={type} className="border border-gray-200 rounded-xl p-4 hover:border-indigo-300 transition-all duration-200">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-500 mt-1">{description}</p>
                  </div>
                  <div className="ml-4">
                    <button
                      type="button"
                      onClick={() => handleTypeToggle(type)}
                      disabled={saving}
                      className={`${
                        preferences?.types[type].enabled
                          ? 'bg-gradient-to-r from-green-600 to-emerald-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50`}
                    >
                      <span
                        className={`${
                          preferences?.types[type].enabled ? 'translate-x-5' : 'translate-x-0'
                        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                      />
                    </button>
                  </div>
                </div>
                {preferences?.types[type].enabled && (
                  <div className="mt-4 pt-4 border-t border-gray-200 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4">
                    <p className="text-sm font-semibold text-gray-700 mb-3">Delivery Channels</p>
                    <div className="flex flex-wrap gap-4">
                      {channels.map(channel => (
                        <label key={channel.id} className="flex items-center p-2 bg-white rounded-lg hover:bg-gradient-to-r hover:from-white hover:to-green-50 transition-all cursor-pointer">
                          <input
                            type="checkbox"
                            checked={preferences.types[type].channels.includes(channel.id)}
                            onChange={() => handleChannelForTypeToggle(type, channel.id)}
                            disabled={saving}
                            className="h-5 w-5 text-green-600 focus:ring-green-500 border-gray-300 rounded transition-all"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-700">{channel.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
