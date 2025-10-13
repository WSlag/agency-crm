import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { firestore, auth } from '../../../config/firebase';
import { 
  SparklesIcon, 
  UserIcon,
  EnvelopeIcon,
  KeyIcon,
  UserCircleIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  CheckCircleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';

const userSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
  displayName: z.string().min(2, 'Name must be at least 2 characters'),
  role: z.enum(['admin', 'president', 'ho_recruitment_officer', 'ho_accountant', 'branch_manager'] as const),
  branchId: z.string().nullable(),
  status: z.enum(['active', 'inactive'] as const),
});

type UserFormData = z.infer<typeof userSchema>;

export const UserForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [branches, setBranches] = useState<Array<{ id: string; branchName: string }>>([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      status: 'active',
      branchId: null,
    },
  });

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const branchesSnapshot = await getDocs(collection(firestore, 'branches'));
        const branchesData = branchesSnapshot.docs.map(doc => ({
          id: doc.id,
          branchName: doc.data().branchName,
        }));
        setBranches(branchesData);
      } catch (err) {
        setError('Failed to fetch branches');
      }
    };

    fetchBranches();

    if (id) {
      const fetchUser = async () => {
        try {
          const userDoc = await getDoc(doc(firestore, 'users', id));
          if (userDoc.exists()) {
            reset(userDoc.data() as UserFormData);
          } else {
            setError('User not found');
          }
        } catch (err) {
          setError('Failed to fetch user');
        }
      };

      fetchUser();
    }
  }, [id, reset]);

  const onSubmit = async (data: UserFormData) => {
    try {
      setLoading(true);
      setError(null);

      if (id) {
        // Update existing user
        const userRef = doc(firestore, 'users', id);
        const updateData = { ...data };
        delete updateData.password; // Remove password from update data
        await updateDoc(userRef, {
          ...updateData,
          updatedAt: new Date(),
        });
      } else {
        // Create new user
        if (!data.password) {
          throw new Error('Password is required for new users');
        }

        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          data.email,
          data.password
        );

        // Create user document in Firestore
        await setDoc(doc(firestore, 'users', userCredential.user.uid), {
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          branchId: data.branchId,
          status: data.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      navigate('/users');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full">
        {/* Header with gradient background */}
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <button
              onClick={() => navigate('/users')}
              className="group mb-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Users
            </button>
            <div className="flex items-center space-x-3">
              <SparklesIcon className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold text-white">
                {id ? 'Edit User' : 'Create New User'}
            </h1>
            </div>
            <p className="mt-2 text-indigo-100">
              {id ? 'Update user information and permissions' : 'Add a new user to the system'}
            </p>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {error && (
            <div className="mb-6 rounded-xl bg-red-50 border-2 border-red-200 p-4">
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <UserCircleIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Basic Information</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="displayName" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <UserIcon className="h-4 w-4 mr-2 text-indigo-600" />
                    Display Name
                  </label>
                  <input
                    type="text"
                    {...register('displayName')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                    placeholder="John Doe"
                  />
                  {errors.displayName && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.displayName.message}</p>
                  )}
                </div>

            <div>
                  <label htmlFor="email" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <EnvelopeIcon className="h-4 w-4 mr-2 text-indigo-600" />
                    Email Address
              </label>
                <input
                  type="email"
                  {...register('email')}
                    disabled={!!id}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="john@example.com"
                />
                {errors.email && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.email.message}</p>
                )}
            </div>

            {!id && (
              <div>
                    <label htmlFor="password" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                      <KeyIcon className="h-4 w-4 mr-2 text-indigo-600" />
                  Password
                </label>
                  <input
                    type="password"
                    {...register('password')}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                      placeholder="••••••••"
                  />
                  {errors.password && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.password.message}</p>
                  )}
                </div>
                )}
              </div>
            </div>

            {/* Role & Permissions */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <div className="flex items-center space-x-2 mb-6">
                <ShieldCheckIcon className="h-6 w-6 text-indigo-600" />
                <h3 className="text-xl font-bold text-gray-900">Role & Permissions</h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
                  <label htmlFor="role" className="block text-sm font-semibold text-gray-700 mb-2">
                    User Role
              </label>
                <select
                  {...register('role')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                >
                  <option value="admin">Admin</option>
                  <option value="president">President</option>
                  <option value="ho_recruitment_officer">HO Recruitment Officer</option>
                  <option value="ho_accountant">HO Accountant</option>
                  <option value="branch_manager">Branch Manager</option>
                </select>
                {errors.role && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.role.message}</p>
                )}
            </div>

            <div>
                  <label htmlFor="branchId" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <BuildingOfficeIcon className="h-4 w-4 mr-2 text-indigo-600" />
                    Branch Assignment
              </label>
                <select
                  {...register('branchId')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                >
                  <option value="">Head Office</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.branchId.message}</p>
                )}
            </div>

            <div>
                  <label htmlFor="status" className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    <CheckCircleIcon className="h-4 w-4 mr-2 text-indigo-600" />
                    Account Status
              </label>
                <select
                  {...register('status')}
                    className="block w-full rounded-lg border-2 border-gray-300 px-4 py-2.5 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
                {errors.status && (
                    <p className="mt-2 text-sm text-red-600 flex items-center">⚠ {errors.status.message}</p>
                )}
                </div>
            </div>
          </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/users')}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-transparent rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {loading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {id ? 'Updating...' : 'Creating...'}
                  </span>
                ) : (
                  id ? 'Update User' : 'Create User'
                )}
            </button>
          </div>
        </form>
        </div>
    </div>
  );
};
