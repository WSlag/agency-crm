import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { Branch } from '../../../types';

export const BranchDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<Branch | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBranch = async () => {
      if (!id) return;

      try {
        const branchRef = doc(firestore, 'branches', id);
        const branchSnap = await getDoc(branchRef);

        if (branchSnap.exists()) {
          setBranch({
            id: branchSnap.id,
            ...branchSnap.data()
          } as Branch);
        } else {
          setError('Branch not found');
        }
      } catch (err) {
        setError('Failed to fetch branch details');
      } finally {
        setLoading(false);
      }
    };

    fetchBranch();
  }, [id]);

  const handleStatusChange = async (newStatus: 'active' | 'inactive') => {
    if (!branch || !id) return;

    try {
      const branchRef = doc(firestore, 'branches', id);
      await updateDoc(branchRef, {
        status: newStatus,
        updatedAt: new Date()
      });
      
      setBranch({
        ...branch,
        status: newStatus
      });
    } catch (err) {
      setError('Failed to update branch status');
    }
  };

  const handleDelete = async () => {
    if (!id || !window.confirm('Are you sure you want to delete this branch?')) {
      return;
    }

    try {
      await deleteDoc(doc(firestore, 'branches', id));
      navigate('/admin/branches');
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

  if (error || !branch) {
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
              <h3 className="text-sm font-medium text-red-800">{error || 'Branch not found'}</h3>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{branch.branchName}</h1>
            <p className="mt-2 text-sm text-gray-700">Branch Code: {branch.branchCode}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:flex space-x-3">
            <Link
              to={`/admin/branches/${id}/metrics`}
              className="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
            >
              View Metrics
            </Link>
            <Link
              to={`/admin/branches/${id}/edit`}
              className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700"
            >
              Edit Branch
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Address</dt>
              <dd className="mt-1 text-sm text-gray-900">{branch.address}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Contact Information</dt>
              <dd className="mt-1 text-sm text-gray-900">{branch.contactInfo}</dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Head Office</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {branch.isHeadOffice ? (
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    Yes
                  </span>
                ) : (
                  <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                    No
                  </span>
                )}
              </dd>
            </div>

            <div className="sm:col-span-1">
              <dt className="text-sm font-medium text-gray-500">Status</dt>
              <dd className="mt-1 text-sm text-gray-900">
                <select
                  value={branch.status}
                  onChange={(e) => handleStatusChange(e.target.value as 'active' | 'inactive')}
                  className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </dd>
            </div>

            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Created At</dt>
              <dd className="mt-1 text-sm text-gray-900">
                {branch.createdAt instanceof Date
                  ? branch.createdAt.toLocaleDateString()
                  : new Date(branch.createdAt).toLocaleDateString()}
              </dd>
            </div>
          </dl>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-8">
          <div className="flex justify-end">
            <button
              onClick={handleDelete}
              className="rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
            >
              Delete Branch
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
