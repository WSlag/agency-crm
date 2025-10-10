import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Branch } from '../../../types';
import { Link } from 'react-router-dom';

export const BranchList = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesQuery = query(collection(db, 'branches'));
        const querySnapshot = await getDocs(branchesQuery);
        const branchesData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Branch));
        setBranches(branchesData);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch branches');
        setLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleStatusChange = async (branchId: string, newStatus: 'active' | 'inactive') => {
    try {
      const branchRef = doc(db, 'branches', branchId);
      await updateDoc(branchRef, {
        status: newStatus
      });
      
      setBranches(branches.map(branch => 
        branch.id === branchId ? { ...branch, status: newStatus } : branch
      ));
    } catch (err) {
      setError('Failed to update branch status');
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!window.confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'branches', branchId));
      setBranches(branches.filter(branch => branch.id !== branchId));
    } catch (err) {
      setError('Failed to delete branch');
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
            <h1 className="text-base font-semibold leading-6 text-gray-900">Branches</h1>
            <p className="mt-2 text-sm text-gray-700">
              A list of all branches including their name, location, and status.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Link
              to="/admin/branches/new"
              className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
            >
              Add Branch
            </Link>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  <tr>
                    <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0">
                      Branch Name
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Branch Code
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Address
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Contact Info
                    </th>
                    <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
                      Head Office
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
                  {branches.map((branch) => (
                    <tr key={branch.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {branch.branchName}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {branch.branchCode}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {branch.address}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {branch.contactInfo}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {branch.isHeadOffice ? 'Yes' : 'No'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <select
                          value={branch.status}
                          onChange={(e) => handleStatusChange(branch.id, e.target.value as 'active' | 'inactive')}
                          className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Link
                          to={`/admin/branches/${branch.id}/edit`}
                          className="text-primary-600 hover:text-primary-900 mr-4"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(branch.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
