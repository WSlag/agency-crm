import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc, collection, addDoc, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { useAuth } from '../../../contexts/AuthContext';
import {
  SparklesIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  ArrowLeftIcon,
} from '@heroicons/react/24/outline';

const branchSchema = z.object({
  name: z.string().min(2, 'Branch name must be at least 2 characters'),
  type: z.enum(['HEAD_OFFICE', 'BRANCH'] as const),
  location: z.object({
    address: z.string().min(5, 'Address must be at least 5 characters'),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'State is required'),
    country: z.string().min(2, 'Country is required'),
    postalCode: z.string().min(3, 'Postal code is required'),
  }),
  active: z.boolean(),
});

type BranchFormData = z.infer<typeof branchSchema>;

export const BranchForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      active: true,
      type: 'BRANCH',
      location: {
        address: '',
        city: '',
        state: '',
        country: 'Philippines',
        postalCode: '',
      },
    },
  });

  useEffect(() => {
    if (id) {
      const fetchBranch = async () => {
        try {
          const branchDoc = await getDoc(doc(firestore, 'branches', id));
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
        const branchRef = doc(firestore, 'branches', id);
        await updateDoc(branchRef, {
          ...data,
          updatedAt: new Date(),
        });
      } else {
        // Create new branch
        const branchRef = doc(collection(firestore, 'branches'));
        await setDoc(branchRef, {
          ...data,
          managers: [],
          metrics: {
            applicantCount: 0,
            activeTransfers: 0,
            pendingDocuments: 0,
            completedPlacements: 0,
            revenue: 0,
          },
          createdAt: new Date(),
          updatedAt: new Date(),
        });

        // Send notifications to admins and president about new branch creation
        try {
          const notificationsRef = collection(firestore, 'notifications');
          const recipients: string[] = [];

          // Get all admin users
          const adminQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'admin')
          );
          const adminSnapshot = await getDocs(adminQuery);
          adminSnapshot.docs.forEach(doc => {
            if (doc.id !== user?.uid) { // Don't notify the creator
              recipients.push(doc.id);
            }
          });

          // Get all president users
          const presidentQuery = query(
            collection(firestore, 'users'),
            where('role', '==', 'president')
          );
          const presidentSnapshot = await getDocs(presidentQuery);
          presidentSnapshot.docs.forEach(doc => recipients.push(doc.id));

          // Create notifications for all recipients
          const branchTypeLabel = data.type === 'HEAD_OFFICE' ? 'Head Office' : 'Branch Office';

          for (const recipientId of recipients) {
            await addDoc(notificationsRef, {
              type: 'branch_created',
              title: 'New Branch Created',
              body: `${data.name} (${branchTypeLabel}) has been added in ${data.location.city}, ${data.location.state}`,
              priority: 'medium',
              status: 'unread',
              recipientId: recipientId,
              recipientEmail: '',
              icon: '🏢',
              metadata: {
                branchId: branchRef.id,
                branchName: data.name,
                branchType: data.type,
                location: data.location,
              },
              createdAt: Timestamp.now(),
            });
          }

          console.log(`✅ Sent ${recipients.length} notifications for new branch creation`);
        } catch (notifError) {
          console.error('Error sending notifications:', notifError);
          // Don't fail the whole operation if notifications fail
        }
      }

      navigate('/branches');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
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
              <h1 className="text-3xl font-bold text-white">
                {id ? 'Edit Branch' : 'Create New Branch'}
              </h1>
            </div>
          </div>
          <p className="text-indigo-100 ml-14">
            {id ? 'Update branch information' : 'Add a new branch to your organization'}
          </p>
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

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
            {/* Basic Information Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <BuildingOfficeIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Basic Information
              </h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Name *
                  </label>
                  <input
                    type="text"
                    {...register('name')}
                    placeholder="e.g. Manila Branch"
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="type" className="block text-sm font-semibold text-gray-700 mb-2">
                    Branch Type *
                  </label>
                  <select
                    {...register('type')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                  >
                    <option value="BRANCH">🏪 Branch Office</option>
                    <option value="HEAD_OFFICE">🏢 Head Office</option>
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="active" className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      {...register('active')}
                      className="h-5 w-5 rounded border-2 border-gray-300 text-indigo-600 focus:ring-indigo-500 transition-all"
                    />
                    <span className="ml-3 text-sm font-semibold text-gray-700">
                      Branch is Active
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500 ml-8">
                    Active branches can accept applicants and transactions
                  </p>
                </div>
              </div>
            </div>

            {/* Location Section */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-t border-gray-200 mt-6">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Location Details
              </h2>
            </div>
            <div className="px-6 py-6">
              <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label htmlFor="location.address" className="block text-sm font-semibold text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <textarea
                    {...register('location.address')}
                    rows={3}
                    placeholder="Enter complete street address"
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  />
                  {errors.location?.address && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.location.address.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.city" className="block text-sm font-semibold text-gray-700 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    {...register('location.city')}
                    placeholder="e.g. Manila"
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  />
                  {errors.location?.city && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.location.city.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.state" className="block text-sm font-semibold text-gray-700 mb-2">
                    State/Province *
                  </label>
                  <input
                    type="text"
                    {...register('location.state')}
                    placeholder="e.g. Metro Manila"
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  />
                  {errors.location?.state && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.location.state.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.country" className="block text-sm font-semibold text-gray-700 mb-2">
                    Country *
                  </label>
                  <input
                    type="text"
                    {...register('location.country')}
                    placeholder="e.g. Philippines"
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  />
                  {errors.location?.country && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.location.country.message}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="location.postalCode" className="block text-sm font-semibold text-gray-700 mb-2">
                    Postal Code *
                  </label>
                  <input
                    type="text"
                    {...register('location.postalCode')}
                    placeholder="e.g. 1000"
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  />
                  {errors.location?.postalCode && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <span className="mr-1">⚠</span>
                      {errors.location.postalCode.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-t border-gray-200">
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => navigate('/branches')}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Saving...
                    </>
                  ) : (
                    <>
                      <SparklesIcon className="h-4 w-4 mr-2" />
                      {id ? 'Update Branch' : 'Create Branch'}
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
