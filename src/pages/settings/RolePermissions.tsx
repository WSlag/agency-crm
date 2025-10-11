import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { UserRole } from '../../types';

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
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

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

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-2xl font-bold text-gray-900">Role Permissions</h1>
            <p className="mt-2 text-sm text-gray-700">
              Manage access permissions for different user roles
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-col">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
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
                      <tr key={permission.id}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm sm:pl-6">
                          <div className="font-medium text-gray-900">{permission.name}</div>
                          <div className="text-gray-500">{permission.description}</div>
                        </td>
                        {availableRoles.map(role => {
                          const rolePermission = rolePermissions.find(rp => rp.role === role);
                          const hasPermission = rolePermission?.permissions.includes(permission.id);

                          return (
                            <td key={role} className="px-3 py-4 text-sm text-center">
                              <button
                                onClick={() => handlePermissionToggle(role, permission.id)}
                                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                                  hasPermission ? 'bg-primary-600' : 'bg-gray-200'
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
      </div>
    </DashboardLayout>
  );
};
