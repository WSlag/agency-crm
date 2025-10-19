import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { User, UserRole } from '../../../types';
import { Link } from 'react-router-dom';
import { useBranchStore } from '../../../stores/branchStore';
import { 
  SparklesIcon, 
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  UserPlusIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

export const UserList = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { branches, fetchBranches } = useBranchStore();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const usersQuery = query(collection(firestore, 'users'));
        const querySnapshot = await getDocs(usersQuery);
        const usersData = querySnapshot.docs.map(doc => ({
          uid: doc.id,
          ...doc.data()
        } as User));
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch users');
        setLoading(false);
      }
    };

    // Fetch branches for branch name display
    if (branches.length === 0) {
      fetchBranches();
    }

    fetchUsers();
  }, []);

  // Helper function to get branch name
  const getBranchName = (branchId: string | null | undefined) => {
    if (!branchId) return null;
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  const handleStatusChange = async (userId: string, newStatus: 'active' | 'inactive') => {
    try {
      const userRef = doc(firestore, 'users', userId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setUsers(users.map(user => 
        user.uid === userId ? { ...user, status: newStatus } : user
      ));
    } catch (err) {
      setError('Failed to update user status');
    }
  };

  const handleDelete = async (userId: string) => {
    if (!window.confirm('Are you sure you want to delete this user?')) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'users', userId));
      setUsers(users.filter(user => user.uid !== userId));
    } catch (err) {
      setError('Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'admin':
        return 'bg-gradient-to-r from-purple-500 to-purple-600 text-white';
      case 'president':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white';
      case 'ho_recruitment_officer':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
      case 'ho_accountant':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white';
      case 'branch_manager':
        return 'bg-gradient-to-r from-orange-500 to-orange-600 text-white';
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white';
    }
  };

  const formatRoleName = (role: UserRole | undefined) => {
    if (!role) return 'Unknown';
    return role
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Calculate stats
  const activeUsers = users.filter(u => u.status === 'active').length;
  const inactiveUsers = users.filter(u => u.status === 'inactive').length;
  const branchManagers = users.filter(u => u.role === 'branch_manager').length;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 m-4">
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
    );
  }

  return (
    <div className="min-h-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="sm:flex sm:items-center sm:justify-between">
              <div className="sm:flex-auto">
                <div className="flex items-center space-x-3">
                  <SparklesIcon className="h-8 w-8 text-white" />
                  <h1 className="text-3xl font-bold text-white">User Management</h1>
                </div>
                <p className="mt-2 text-indigo-100">
                  Manage system users, roles, and permissions
                </p>
              </div>
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <Link
                  to="/users/new"
                  className="group relative inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
                >
                  <UserPlusIcon className="h-5 w-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                  Add User
                </Link>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <UserGroupIcon className="h-5 w-5" />
                  <span>Total Users</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {users.length}
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <CheckCircleIcon className="h-5 w-5" />
                  <span>Active Users</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {activeUsers}
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-green-500 to-green-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <XCircleIcon className="h-5 w-5" />
                  <span>Inactive Users</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {inactiveUsers}
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 opacity-20 blur-2xl"></div>
              </div>

              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105">
                <dt className="flex items-center space-x-2 truncate text-sm font-medium text-indigo-100">
                  <BuildingOfficeIcon className="h-5 w-5" />
                  <span>Branch Managers</span>
                </dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">
                  {branchManagers}
                </dd>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 opacity-20 blur-2xl"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                  <tr>
                    <th scope="col" className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Branch
                    </th>
                    <th scope="col" className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-3 py-4 text-right text-xs font-semibold text-gray-900 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users.map((user) => (
                    <tr key={user.uid} className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                      <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center">
                              <span className="text-white font-semibold text-sm">
                                {user.displayName?.charAt(0).toUpperCase() || '?'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-semibold text-gray-900">{user.displayName || 'Unknown User'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                        {user.email || 'No email'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                          {formatRoleName(user.role)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                        {user.branchId ? (
                          <span className="flex items-center">
                            <BuildingOfficeIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {getBranchName(user.branchId)}
                          </span>
                        ) : (
                          <span className="flex items-center">
                            🏢 Head Office
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm">
                        <select
                          value={user.status || 'inactive'}
                          onChange={(e) => handleStatusChange(user.uid, e.target.value as 'active' | 'inactive')}
                          className={`rounded-lg border-2 px-3 py-1.5 text-xs font-medium focus:ring-indigo-500 focus:border-indigo-500 transition-all ${
                            user.status === 'active'
                              ? 'border-green-300 text-green-700 bg-green-50'
                              : 'border-gray-300 text-gray-700 bg-gray-50'
                          }`}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/users/${user.uid}/edit`}
                            className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                          >
                            <PencilIcon className="h-4 w-4 mr-1" />
                            Edit
                          </Link>
                          <button
                            onClick={() => handleDelete(user.uid)}
                            className="inline-flex items-center px-3 py-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 rounded-lg transition-all duration-200 hover:scale-105 hover:shadow-md"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {users.length === 0 && (
                <div className="text-center py-12">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">Get started by creating a new user.</p>
                  <div className="mt-6">
                    <Link
                      to="/users/new"
                      className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200"
                    >
                      <UserPlusIcon className="h-5 w-5 mr-2" />
                      Add User
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
    </div>
  );
};
