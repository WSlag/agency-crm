import React, { useState, useEffect } from 'react';
import { UserRole } from '../../types';
import {
  SparklesIcon,
  LockClosedIcon,
} from '@heroicons/react/24/outline';

interface Permission {
  id: string;
  name: string;
  description: string;
  module: string;
}

interface RolePermission {
  id: string;
  role: UserRole;
  permissions: string[];
  createdAt: Date;
  updatedAt: Date;
}

export const RolePermissions: React.FC = () => {
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const availableRoles: UserRole[] = [
    'admin',
    'president',
    'ho_recruitment_officer',
    'ho_accountant',
    'branch_manager'
  ];

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Mock permissions data (replace with actual Firestore data)
        const mockPermissions: Permission[] = [
          {
            id: '1',
            name: 'view_dashboard',
            description: 'View main dashboard',
            module: 'dashboard'
          },
          {
            id: '2',
            name: 'manage_users',
            description: 'Create and manage users',
            module: 'users'
          },
          {
            id: '3',
            name: 'manage_documents',
            description: 'Upload and manage documents',
            module: 'documents'
          },
          {
            id: '4',
            name: 'manage_branches',
            description: 'Create and manage branches',
            module: 'branches'
          },
          {
            id: '5',
            name: 'view_reports',
            description: 'View and generate reports',
            module: 'reports'
          }
        ];

        // Mock role permissions data
        const mockRolePermissions: RolePermission[] = availableRoles.map(role => ({
          id: role,
          role,
          permissions: role === 'admin' ? mockPermissions.map(p => p.id) : [],
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        setPermissions(mockPermissions);
        setRolePermissions(mockRolePermissions);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch permissions data');
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const handlePermissionToggle = async (role: UserRole, permissionId: string) => {
    try {
      const rolePermission = rolePermissions.find(rp => rp.role === role);
      if (!rolePermission) return;

      const newPermissions = rolePermission.permissions.includes(permissionId)
        ? rolePermission.permissions.filter(id => id !== permissionId)
        : [...rolePermission.permissions, permissionId];

      // Update state
      setRolePermissions(rolePermissions.map(rp =>
        rp.role === role
          ? { ...rp, permissions: newPermissions, updatedAt: new Date() }
          : rp
      ));

      // TODO: Update in Firestore
      console.log('Updating permissions for role:', role, newPermissions);
    } catch (err) {
      setError('Failed to update permissions');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading permissions...</p>
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
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Permissions</h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </div>
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
              <h1 className="text-3xl font-bold text-white">Role Permissions</h1>
              <p className="text-indigo-100 mt-1">
                Manage access permissions for different user roles
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6">
                        Permission
                      </th>
                      {availableRoles.map(role => (
                        <th
                          key={role}
                          scope="col"
                          className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900"
                        >
                          {role.replace(/_/g, ' ').toUpperCase()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {permissions.map(permission => (
                    <tr key={permission.id} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                        <div className="flex items-center space-x-2">
                          <LockClosedIcon className="h-4 w-4 text-indigo-600" />
                          <div>
                            <div className="font-semibold text-gray-900">{permission.name}</div>
                            <div className="text-gray-500 text-xs">{permission.description}</div>
                          </div>
                        </div>
                      </td>
                      {availableRoles.map(role => {
                        const rolePermission = rolePermissions.find(rp => rp.role === role);
                        const hasPermission = rolePermission?.permissions.includes(permission.id);

                        return (
                          <td key={role} className="px-3 py-4 text-sm text-center">
                            <button
                              onClick={() => handlePermissionToggle(role, permission.id)}
                              className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                                hasPermission ? 'bg-gradient-to-r from-indigo-600 to-purple-600' : 'bg-gray-200'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                                  hasPermission ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
          </div>
        </div>
      </div>
    </div>
  );
};
