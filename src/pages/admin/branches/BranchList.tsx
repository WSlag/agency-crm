import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { useBranchStore } from '../../../stores/branchStore';
import { PageTransition } from '../../../components/animation/PageTransition';

export const BranchList: React.FC = () => {
  const {
    branches,
    loading,
    error,
    fetchBranches,
    updateBranch,
    deleteBranch,
  } = useBranchStore();

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleStatusChange = async (branchId: string, active: boolean) => {
    try {
      await updateBranch(branchId, { active });
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

  const renderContent = () => (
    <div
      role="main"
      aria-label="Branch List Content"
      className="branch-list-content"
      data-testid="branch-list-content"
    >
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-base font-semibold leading-6 text-gray-900">Branches</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all branches including their name, location, and status.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Link
            to="/branches/new"
            className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
          >
            Add Branch
          </Link>
        </div>
      </div>

      {error && (
        <div className="mt-4 bg-red-50 p-4 rounded-md">
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
      )}

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                    Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Type
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Location
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Managers
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branches?.map((branch) => (
                  <tr key={branch?.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                      {branch?.name ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {branch?.type === 'HEAD_OFFICE' ? 'Head Office' : 'Branch'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {branch?.location?.city ?? '—'}, {branch?.location?.state ?? '—'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {branch?.managers?.length ?? 0}
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      <select
                        value={branch?.active ? 'active' : 'inactive'}
                        onChange={(e) => handleStatusChange(branch?.id ?? '', e.target.value === 'active')}
                        className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                        disabled={!branch?.id}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                      <Link
                        to={`/branches/${branch?.id}/edit`}
                        className="text-primary-600 hover:text-primary-900 mr-4"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDelete(branch?.id ?? '')}
                        className="text-red-600 hover:text-red-900"
                        disabled={!branch?.id}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {!branches?.length && !loading && (
                  <tr>
                    <td colSpan={6} className="px-3 py-4 text-sm text-gray-500 text-center">
                      No branches found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <PageTransition isLoading={loading}>
          {renderContent()}
        </PageTransition>
      </div>
    </DashboardLayout>
  );
};