import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Branch } from '../../types';

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
        const branchesQuery = query(collection(db, 'branches'));
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="bg-red-50 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentSettings = settings.find(s => s.branchId === selectedBranch);
  if (!currentSettings) return null;

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Branch Configuration</h1>
            <p className="mt-2 text-sm text-gray-700">
              Configure operational settings and integrations for each branch
            </p>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-6">
            <label htmlFor="branch" className="block text-sm font-medium text-gray-700">
              Select Branch
            </label>
            <select
              id="branch"
              value={selectedBranch || ''}
              onChange={(e) => setSelectedBranch(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
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
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Operational Hours
                </h3>
                <div className="mt-4 grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
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
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Services
                </h3>
                <div className="mt-4 space-y-4">
                  {Object.entries(currentSettings.services).map(([service, enabled]) => (
                    <div key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleSettingChange(
                          currentSettings.branchId,
                          'services',
                          service,
                          e.target.checked
                        )}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-700 capitalize">
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Notifications
                </h3>
                <div className="mt-4 space-y-4">
                  {Object.entries(currentSettings.notifications).map(([channel, enabled]) => (
                    <div key={channel} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleSettingChange(
                          currentSettings.branchId,
                          'notifications',
                          channel,
                          e.target.checked
                        )}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-700 capitalize">
                        {channel}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Integrations */}
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  Integrations
                </h3>
                <div className="mt-4 space-y-4">
                  {Object.entries(currentSettings.integrations).map(([integration, enabled]) => (
                    <div key={integration} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={enabled}
                        onChange={(e) => handleSettingChange(
                          currentSettings.branchId,
                          'integrations',
                          integration,
                          e.target.checked
                        )}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label className="ml-3 block text-sm font-medium text-gray-700 capitalize">
                        {integration}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
