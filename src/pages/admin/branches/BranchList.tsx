import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { useBranchStore } from '../../../stores/branchStore';
import { PlusIcon, SparklesIcon, BuildingOfficeIcon, MapPinIcon } from '@heroicons/react/24/outline';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/20/solid';

export const BranchList = () => {
  const navigate = useNavigate();
  const {
    branches,
    loading,
    error,
    fetchBranches,
    updateBranch,
    deleteBranch,
  } = useBranchStore();

  // Track manager counts per branch
  const [managerCounts, setManagerCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Fetch manager counts for all branches
  useEffect(() => {
    const fetchManagerCounts = async () => {
      if (!branches || branches.length === 0) return;

      try {
        // Fetch all branch managers
        const usersRef = collection(firestore, 'users');
        const managersQuery = query(
          usersRef,
          where('role', '==', 'branch_manager')
        );
        
        const managersSnapshot = await getDocs(managersQuery);
        
        // Count managers per branch
        const counts: Record<string, number> = {};
        branches.forEach(branch => {
          counts[branch.id] = 0;
        });

        managersSnapshot.docs.forEach(doc => {
          const branchId = doc.data().branchId;
          if (branchId && counts[branchId] !== undefined) {
            counts[branchId]++;
          }
        });

        console.log('Manager counts per branch:', counts);
        setManagerCounts(counts);
      } catch (err) {
        console.error('Error fetching manager counts:', err);
      }
    };

    fetchManagerCounts();
  }, [branches]);

  const handleStatusChange = async (branchId: string, active: boolean) => {
    try {
      await updateBranch(branchId, { active });
      await fetchBranches(); // Refresh the list
    } catch (err) {
      console.error('Failed to update branch status:', err);
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    try {
      await deleteBranch(branchId);
    } catch (err) {
      console.error('Failed to delete branch:', err);
    }
  };

  // Calculate stats
  const stats = [
    {
      name: 'Total Branches',
      value: branches?.length || 0,
      color: 'from-blue-500 to-blue-600',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Active Branches',
      value: branches?.filter((b) => b.active).length || 0,
      color: 'from-green-500 to-green-600',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Head Offices',
      value: branches?.filter((b) => b.type === 'HEAD_OFFICE').length || 0,
      color: 'from-purple-500 to-purple-600',
      icon: BuildingOfficeIcon,
    },
    {
      name: 'Branch Offices',
      value: branches?.filter((b) => b.type === 'BRANCH').length || 0,
      color: 'from-orange-500 to-orange-600',
      icon: MapPinIcon,
    },
  ];

  const getTypeBadgeColor = (type: string) => {
    return type === 'HEAD_OFFICE'
      ? 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300'
      : 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
  };

  return (
    <div className="min-h-full">
      {/* Header with gradient background - Mobile Optimized */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                <h1 className="text-xl sm:text-3xl font-bold text-white">Branch Management</h1>
              </div>
              <p className="mt-2 text-sm sm:text-base text-indigo-100">
                Manage all branches including their location, managers, and status
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                onClick={() => navigate('/branches/new')}
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add Branch
              </button>
            </div>
          </div>

          {/* Stats Cards - Mobile Responsive */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.name}
                  className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-3 sm:px-4 sm:py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105 cursor-pointer"
                >
                  <dt className="flex items-center space-x-2 truncate text-xs sm:text-sm font-medium text-indigo-100">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>{stat.name}</span>
                  </dt>
                  <dd className="mt-1 text-xl sm:text-3xl font-semibold tracking-tight text-white">
                    {stat.value}
                  </dd>
                  <div
                    className={`absolute -right-4 -bottom-4 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`}
                  ></div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading branches...</p>
            </div>
          ) : (
            <>
              {/* Mobile Card View - Show on screens < 768px */}
              <div className="md:hidden p-4 space-y-3">
                {branches?.map((branch) => (
                  <div
                    key={branch?.id}
                    className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
                  >
                    {/* Header Row - Name and Type */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center flex-1 min-w-0">
                        <div
                          className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                            branch?.active ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                          }`}
                        ></div>
                        <h3 className="font-semibold text-base text-gray-900 truncate">
                          {branch?.name || '—'}
                        </h3>
                      </div>
                    </div>

                    {/* Info Grid */}
                    <div className="space-y-2 mb-4">
                      {/* Type Badge */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Type:</span>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getTypeBadgeColor(
                            branch?.type || ''
                          )} shadow-sm`}
                        >
                          {branch?.type === 'HEAD_OFFICE' ? '🏢 Head Office' : '🏪 Branch'}
                        </span>
                      </div>

                      {/* Location */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Location:</span>
                        <span className="text-sm font-medium text-gray-900 flex items-center">
                          <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                          {branch?.location?.city || '—'}, {branch?.location?.state || '—'}
                        </span>
                      </div>

                      {/* Managers */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Managers:</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 font-medium text-sm">
                          {managerCounts[branch?.id] || 0}
                        </span>
                      </div>

                      {/* Status Dropdown */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Status:</span>
                        <select
                          value={branch?.active ? 'active' : 'inactive'}
                          onChange={(e) =>
                            handleStatusChange(branch?.id ?? '', e.target.value === 'active')
                          }
                          className={`rounded-lg border-2 px-3 py-1 text-xs font-semibold transition-all ${
                            branch?.active
                              ? 'border-green-300 bg-green-50 text-green-800'
                              : 'border-red-300 bg-red-50 text-red-800'
                          }`}
                          disabled={!branch?.id}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t border-gray-100">
                      <Link
                        to={`/branches/${branch?.id}`}
                        className="flex-1 inline-flex items-center justify-center px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
                      >
                        <EyeIcon className="h-4 w-4 mr-2" />
                        View
                      </Link>
                      <Link
                        to={`/branches/${branch?.id}/edit`}
                        className="px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-sm hover:shadow-md"
                        title="Edit branch"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(branch?.id ?? '')}
                        className="px-3 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow-md"
                        disabled={!branch?.id}
                        title="Delete branch"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {!branches?.length && !loading && (
                  <div className="text-center py-16 text-gray-500">
                    <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                    <p className="mt-4 text-lg font-medium text-gray-900">No branches found</p>
                    <p className="text-sm mt-2 text-gray-600">Get started by adding a new branch</p>
                  </div>
                )}
              </div>

              {/* Desktop Table View - Show on screens >= 768px */}
              <div className="hidden md:block overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                    <tr>
                      <th
                        scope="col"
                        className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        Branch Name
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        Type
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        Location
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        Managers
                      </th>
                      <th
                        scope="col"
                        className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
                      >
                        Status
                      </th>
                      <th scope="col" className="relative py-4 pl-3 pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {branches?.map((branch) => (
                      <tr
                        key={branch?.id}
                        className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                      >
                        <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                          <div className="flex items-center">
                            <div
                              className={`w-2 h-2 rounded-full mr-3 ${
                                branch?.active
                                  ? 'bg-green-500 animate-pulse'
                                  : 'bg-gray-400'
                              }`}
                            ></div>
                            {branch?.name || '—'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <span
                            className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getTypeBadgeColor(
                              branch?.type || ''
                            )} shadow-sm`}
                          >
                            {branch?.type === 'HEAD_OFFICE'
                              ? '🏢 Head Office'
                              : '🏪 Branch'}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <MapPinIcon className="h-4 w-4 mr-1 text-gray-400" />
                            {branch?.location?.city || '—'},{' '}
                            {branch?.location?.state || '—'}
                          </div>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-800 font-medium">
                            {managerCounts[branch?.id] || 0}
                          </span>
                        </td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm">
                          <select
                            value={branch?.active ? 'active' : 'inactive'}
                            onChange={(e) =>
                              handleStatusChange(
                                branch?.id ?? '',
                                e.target.value === 'active'
                              )
                            }
                            className={`rounded-lg border-2 px-3 py-1 text-xs font-semibold transition-all hover:border-indigo-400 ${
                              branch?.active
                                ? 'border-green-300 bg-green-50 text-green-800'
                                : 'border-red-300 bg-red-50 text-red-800'
                            }`}
                            disabled={!branch?.id}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <Link
                              to={`/branches/${branch?.id}`}
                              className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            >
                              <EyeIcon className="h-4 w-4 mr-1" />
                              View
                            </Link>
                            <Link
                              to={`/branches/${branch?.id}/edit`}
                              className="inline-flex items-center px-3 py-1.5 text-blue-600 hover:text-white bg-blue-50 hover:bg-gradient-to-r hover:from-blue-600 hover:to-blue-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            >
                              <PencilIcon className="h-4 w-4 mr-1" />
                              Edit
                            </Link>
                            <button
                              onClick={() => handleDelete(branch?.id ?? '')}
                              className="inline-flex items-center px-3 py-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                              disabled={!branch?.id}
                            >
                              <TrashIcon className="h-4 w-4 mr-1" />
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {!branches?.length && !loading && (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-3 py-16 text-center text-gray-500"
                        >
                          <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                          <p className="mt-4 text-lg font-medium text-gray-900">
                            No branches found
                          </p>
                          <p className="text-sm mt-2 text-gray-600">
                            Get started by adding a new branch
                          </p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};