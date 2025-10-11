import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { UserProfile, UserPreferences } from '../../types/auth';

const profileUpdateSchema = z.object({
  displayName: z.string().min(2, 'Display name must be at least 2 characters'),
  preferences: z.object({
    theme: z.enum(['light', 'dark']),
    notifications: z.boolean(),
    language: z.string(),
  }),
});

type ProfileUpdateData = z.infer<typeof profileUpdateSchema>;

interface ProfileProps {
  user: UserProfile;
  onUpdate: (updates: Partial<UserProfile>) => Promise<void>;
}

export const Profile: React.FC<ProfileProps> = ({ user, onUpdate }) => {
  const { register, handleSubmit, formState: { errors } } = useForm<ProfileUpdateData>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      displayName: user.displayName,
      preferences: user.preferences,
    },
  });

  const handleFormSubmit = async (data: ProfileUpdateData) => {
    await onUpdate(data);
  };

  return (
    <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <div className="px-4 py-6 sm:px-0">
        <h1 className="text-2xl font-semibold text-gray-900">Profile Settings</h1>
        <form className="mt-6 space-y-6" onSubmit={handleSubmit(handleFormSubmit)}>
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
              Display Name
            </label>
            <input
              {...register('displayName')}
              type="text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            />
            {errors.displayName && (
              <p className="mt-2 text-sm text-red-600">{errors.displayName.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Theme</label>
            <select
              {...register('preferences.theme')}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
            </select>
          </div>

          <div className="flex items-center">
            <input
              {...register('preferences.notifications')}
              type="checkbox"
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-900">
              Enable Notifications
            </label>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
