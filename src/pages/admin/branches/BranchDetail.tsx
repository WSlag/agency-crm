import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { Branch } from '../../../types/entities/branch';
import {
  SparklesIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  PencilIcon,
  TrashIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

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
            ...branchSnap.data(),
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

  const handleStatusChange = async (active: boolean) => {
    if (!branch || !id) return;

    try {
      const branchRef = doc(firestore, 'branches', id);
      await updateDoc(branchRef, {
        active,
        updatedAt: new Date(),
      });

      setBranch({
        ...branch,
        active,
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
      navigate('/branches');
    } catch (err) {
      setError('Failed to delete branch');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !branch) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="rounded-xl bg-red-50 border-2 border-red-200 p-6 max-w-md w-full">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-6 w-6 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error || 'Branch not found'}</h3>
              <button
                onClick={() => navigate('/branches')}
                className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
              >
                ← Back to Branches
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const formatDate = (date: any) => {
    if (!date) return '—';
    try {
      if (date.toDate) return date.toDate().toLocaleDateString();
      if (date instanceof Date) return date.toLocaleDateString();
      return new Date(date).toLocaleDateString();
    } catch {
      return '—';
    }
  };

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center mb-4">
            <button
              onClick={() => navigate('/branches')}
              className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-all duration-200 text-white"
            >
              <ArrowLeftIcon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-8 w-8 text-white" />
              <div>
                <h1 className="text-3xl font-bold text-white">{branch.name}</h1>
                <p className="text-indigo-100 text-sm mt-1">
                  {branch.type === 'HEAD_OFFICE' ? '🏢 Head Office' : '🏪 Branch Office'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to={`/branches/${id}/metrics`}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <ChartBarIcon className="h-5 w-5 mr-2" />
              View Metrics
            </Link>
            <Link
              to={`/branches/${id}/edit`}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <PencilIcon className="h-5 w-5 mr-2" />
              Edit Branch
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-red-500/20 backdrop-blur-sm border border-red-400/30 rounded-lg hover:bg-red-500/30 transition-all duration-200"
            >
              <TrashIcon className="h-5 w-5 mr-2" />
              Delete Branch
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {error && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info Card */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Branch Information
              </h2>
            </div>
            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPinIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    Address
                  </dt>
                  <dd className="mt-2 text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                    {branch.location?.address || '—'}
                    <br />
                    {branch.location?.city && branch.location?.state
                      ? `${branch.location.city}, ${branch.location.state}`
                      : ''}
                    <br />
                    {branch.location?.country && branch.location?.postalCode
                      ? `${branch.location.country} ${branch.location.postalCode}`
                      : ''}
                  </dd>
                </div>

                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserGroupIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    Managers
                  </dt>
                  <dd className="mt-2">
                    <span className="inline-flex items-center px-4 py-2 rounded-lg bg-indigo-50 text-indigo-800 font-semibold text-lg">
                      {branch.managers?.length || 0} Managers
                    </span>
                  </dd>
                </div>

                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1.5 text-gray-400" />
                    Created Date
                  </dt>
                  <dd className="mt-2 text-sm text-gray-900 bg-gray-50 rounded-lg p-3">
                    {formatDate(branch.createdAt)}
                  </dd>
                </div>

                <div className="col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Status</dt>
                  <dd>
                    <select
                      value={branch.active ? 'active' : 'inactive'}
                      onChange={(e) => handleStatusChange(e.target.value === 'active')}
                      className={`w-full rounded-lg border-2 px-4 py-2 text-sm font-semibold transition-all hover:border-indigo-400 ${
                        branch.active
                          ? 'border-green-300 bg-green-50 text-green-800'
                          : 'border-red-300 bg-red-50 text-red-800'
                      }`}
                    >
                      <option value="active">✓ Active</option>
                      <option value="inactive">✗ Inactive</option>
                    </select>
                  </dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Metrics Card */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <ChartBarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Branch Metrics
              </h2>
            </div>
            <div className="px-6 py-6">
              <dl className="space-y-4">
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <dt className="text-xs font-medium text-blue-600 uppercase">Applicants</dt>
                  <dd className="mt-1 text-2xl font-bold text-blue-900">
                    {branch.metrics?.applicantCount || 0}
                  </dd>
                </div>

                <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
                  <dt className="text-xs font-medium text-green-600 uppercase">Active Transfers</dt>
                  <dd className="mt-1 text-2xl font-bold text-green-900">
                    {branch.metrics?.activeTransfers || 0}
                  </dd>
                </div>

                <div className="bg-yellow-50 rounded-lg p-4 border-l-4 border-yellow-500">
                  <dt className="text-xs font-medium text-yellow-600 uppercase">Pending Docs</dt>
                  <dd className="mt-1 text-2xl font-bold text-yellow-900">
                    {branch.metrics?.pendingDocuments || 0}
                  </dd>
                </div>

                <div className="bg-purple-50 rounded-lg p-4 border-l-4 border-purple-500">
                  <dt className="text-xs font-medium text-purple-600 uppercase">Placements</dt>
                  <dd className="mt-1 text-2xl font-bold text-purple-900">
                    {branch.metrics?.completedPlacements || 0}
                  </dd>
                </div>

                <div className="bg-indigo-50 rounded-lg p-4 border-l-4 border-indigo-500">
                  <dt className="text-xs font-medium text-indigo-600 uppercase">Revenue</dt>
                  <dd className="mt-1 text-2xl font-bold text-indigo-900">
                    ₱{(branch.metrics?.revenue || 0).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
