import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationService, NotificationType, NotificationChannel, UserNotificationPreferences } from '../../services/notifications/notificationService';

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
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your notification preferences and channels.
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

        {/* Notification Channels */}
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Channels</h2>
          <div className="space-y-4">
            {channels.map(channel => (
              <div key={channel.id} className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-gray-900">{channel.label}</span>
                </div>
                <div>
                  <button
                    type="button"
                    onClick={() => handleChannelToggle(channel.id)}
                    disabled={saving}
                    className={`${
                      preferences?.channels[channel.id]
                        ? 'bg-indigo-600'
                        : 'bg-gray-200'
                    } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
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
        <div className="bg-white shadow sm:rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Notification Types</h2>
          <div className="space-y-6">
            {notificationTypes.map(({ type, label, description }) => (
              <div key={type} className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{label}</h3>
                    <p className="text-sm text-gray-500">{description}</p>
                  </div>
                  <div>
                    <button
                      type="button"
                      onClick={() => handleTypeToggle(type)}
                      disabled={saving}
                      className={`${
                        preferences?.types[type].enabled
                          ? 'bg-indigo-600'
                          : 'bg-gray-200'
                      } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2`}
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
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Channels</p>
                    <div className="flex space-x-4">
                      {channels.map(channel => (
                        <label key={channel.id} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={preferences.types[type].channels.includes(channel.id)}
                            onChange={() => handleChannelForTypeToggle(type, channel.id)}
                            disabled={saving}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-600">{channel.label}</span>
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
