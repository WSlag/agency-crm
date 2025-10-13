import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { Branch } from '../../types';
import {
  SparklesIcon,
  BuildingOfficeIcon,
  ClockIcon,
  Cog6ToothIcon,
  BellIcon,
  LinkIcon,
} from '@heroicons/react/24/outline';

interface BranchSettings {
  id: string;
  branchId: string;
  operationalHours: {
    start: string;
    end: string;
  };
  services: {
    recruitment: boolean;
    documentation: boolean;
    training: boolean;
    deployment: boolean;
  };
  notifications: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
  integrations: {
    accounting: boolean;
    hrms: boolean;
    crm: boolean;
  };
}

export const BranchConfiguration: React.FC = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [settings, setSettings] = useState<BranchSettings[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranchesAndSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch branches
        const branchesQuery = query(collection(firestore, 'branches'));
        const branchesSnapshot = await getDocs(branchesQuery);
        const branchesData = branchesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Branch[];

        // Mock settings data (replace with actual Firestore data)
        const mockSettings: BranchSettings[] = branchesData.map(branch => ({
          id: `settings-${branch.id}`,
          branchId: branch.id,
          operationalHours: {
            start: '09:00',
            end: '18:00'
          },
          services: {
            recruitment: true,
            documentation: true,
            training: true,
            deployment: true
          },
          notifications: {
            email: true,
            sms: false,
            push: true
          },
          integrations: {
            accounting: true,
            hrms: false,
            crm: true
          }
        }));

        setBranches(branchesData);
        setSettings(mockSettings);
        if (!selectedBranch && branchesData.length > 0) {
          setSelectedBranch(branchesData[0].id);
        }
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch branch settings');
        setLoading(false);
      }
    };

    fetchBranchesAndSettings();
  }, []);

  const handleSettingChange = async (
    branchId: string,
    category: keyof BranchSettings,
    setting: string,
    value: any
  ) => {
    try {
      const branchSettings = settings.find(s => s.branchId === branchId);
      if (!branchSettings) return;

      const updatedSettings = settings.map(s => {
        if (s.branchId === branchId) {
          return {
            ...s,
            [category]: {
              ...s[category as keyof BranchSettings],
              [setting]: value
            }
          };
        }
        return s;
      });

      setSettings(updatedSettings);

      // TODO: Update in Firestore
      console.log('Updating settings:', { branchId, category, setting, value });
    } catch (err) {
      setError('Failed to update settings');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading branch settings...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Settings</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentSettings = settings.find(s => s.branchId === selectedBranch);
  if (!currentSettings) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-8">
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
            <div>
              <h1 className="text-3xl font-bold text-white">Branch Configuration</h1>
              <p className="text-indigo-100 mt-1">
                Configure operational settings and integrations for each branch
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Branch Selector */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-2 mb-4">
            <BuildingOfficeIcon className="h-6 w-6 text-indigo-600" />
            <h3 className="text-xl font-semibold text-gray-900">Select Branch</h3>
          </div>
          <select
            id="branch"
            value={selectedBranch || ''}
            onChange={(e) => setSelectedBranch(e.target.value)}
            className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition-all hover:border-indigo-400 bg-white"
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.branchName}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-6">
          {/* Operational Hours */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                  <ClockIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Operational Hours
                </h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Start Time
                  </label>
                  <input
                    type="time"
                    value={currentSettings.operationalHours.start}
                    onChange={(e) => handleSettingChange(
                      currentSettings.branchId,
                      'operationalHours',
                      'start',
                      e.target.value
                    )}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition-all hover:border-indigo-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    End Time
                  </label>
                  <input
                    type="time"
                    value={currentSettings.operationalHours.end}
                    onChange={(e) => handleSettingChange(
                      currentSettings.branchId,
                      'operationalHours',
                      'end',
                      e.target.value
                    )}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm transition-all hover:border-indigo-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <Cog6ToothIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Services
                </h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-4">
                {Object.entries(currentSettings.services).map(([service, enabled]) => (
                  <div key={service} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <label className="text-sm font-medium text-gray-700 capitalize cursor-pointer">
                      {service}
                    </label>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleSettingChange(
                        currentSettings.branchId,
                        'services',
                        service,
                        e.target.checked
                      )}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl">
                  <BellIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Notifications
                </h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-4">
                {Object.entries(currentSettings.notifications).map(([channel, enabled]) => (
                  <div key={channel} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <label className="text-sm font-medium text-gray-700 capitalize cursor-pointer">
                      {channel}
                    </label>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleSettingChange(
                        currentSettings.branchId,
                        'notifications',
                        channel,
                        e.target.checked
                      )}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <LinkIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Integrations
                </h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <div className="space-y-4">
                {Object.entries(currentSettings.integrations).map(([integration, enabled]) => (
                  <div key={integration} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <label className="text-sm font-medium text-gray-700 capitalize cursor-pointer">
                      {integration}
                    </label>
                    <input
                      type="checkbox"
                      checked={enabled}
                      onChange={(e) => handleSettingChange(
                        currentSettings.branchId,
                        'integrations',
                        integration,
                        e.target.checked
                      )}
                      className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
