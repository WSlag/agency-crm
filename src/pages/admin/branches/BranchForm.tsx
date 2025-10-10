import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../../config/firebase';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';

const branchSchema = z.object({
  branchName: z.string().min(2, 'Branch name must be at least 2 characters'),
  branchCode: z.string().min(2, 'Branch code must be at least 2 characters'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  contactInfo: z.string().min(5, 'Contact info must be at least 5 characters'),
  isHeadOffice: z.boolean(),
  status: z.enum(['active', 'inactive'] as const),
});

type BranchFormData = z.infer<typeof branchSchema>;

export const BranchForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BranchFormData>({
    resolver: zodResolver(branchSchema),
    defaultValues: {
      status: 'active',
      isHeadOffice: false,
    },
  });

  useEffect(() => {
    if (id) {
      const fetchBranch = async () => {
        try {
          const branchDoc = await getDoc(doc(db, 'branches', id));
          if (branchDoc.exists()) {
            reset(branchDoc.data() as BranchFormData);
          } else {
            setError('Branch not found');
          }
        } catch (err) {
          setError('Failed to fetch branch');
        }
      };

      fetchBranch();
    }
  }, [id, reset]);

  const onSubmit = async (data: BranchFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (id) {
        // Update existing branch
        const branchRef = doc(db, 'branches', id);
        await updateDoc(branchRef, {
          ...data,
          updatedAt: new Date(),
        });
      } else {
        // Create new branch
        const branchRef = doc(collection(db, 'branches'));
        await setDoc(branchRef, {
          ...data,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      navigate('/admin/branches');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-gray-900">
              {id ? 'Edit Branch' : 'Create Branch'}
            </h1>
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

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label htmlFor="branchName" className="block text-sm font-medium text-gray-700">
                Branch Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('branchName')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.branchName && (
                  <p className="mt-1 text-sm text-red-600">{errors.branchName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="branchCode" className="block text-sm font-medium text-gray-700">
                Branch Code
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('branchCode')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.branchCode && (
                  <p className="mt-1 text-sm text-red-600">{errors.branchCode.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                Address
              </label>
              <div className="mt-1">
                <textarea
                  {...register('address')}
                  rows={3}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
                Contact Information
              </label>
              <div className="mt-1">
                <textarea
                  {...register('contactInfo')}
                  rows={2}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.contactInfo && (
                  <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
                )}
              </div>
            </div>

            <div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  {...register('isHeadOffice')}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isHeadOffice" className="ml-2 block text-sm text-gray-900">
                  Is Head Office
                </label>
              </div>
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <div className="mt-1">
                <select
                  {...register('status')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/admin/branches')}
              className="rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-md border border-transparent bg-primary-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </DashboardLayout>
  );
};
