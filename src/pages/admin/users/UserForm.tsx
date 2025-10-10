import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../../config/firebase';
import { DashboardLayout } from '../../../components/layout/DashboardLayout';
import { UserRole } from '../../../types';

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
        const branchesSnapshot = await getDocs(collection(db, 'branches'));
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
          const userDoc = await getDoc(doc(db, 'users', id));
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
        const userRef = doc(db, 'users', id);
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
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: data.email,
          displayName: data.displayName,
          role: data.role,
          branchId: data.branchId,
          status: data.status,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
      }

      navigate('/admin/users');
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
              {id ? 'Edit User' : 'Create User'}
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
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <div className="mt-1">
                <input
                  type="email"
                  {...register('email')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.email && (
                  <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>
            </div>

            {!id && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="mt-1">
                  <input
                    type="password"
                    {...register('password')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  />
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                Display Name
              </label>
              <div className="mt-1">
                <input
                  type="text"
                  {...register('displayName')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
                {errors.displayName && (
                  <p className="mt-1 text-sm text-red-600">{errors.displayName.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium text-gray-700">
                Role
              </label>
              <div className="mt-1">
                <select
                  {...register('role')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="admin">Admin</option>
                  <option value="president">President</option>
                  <option value="ho_recruitment_officer">HO Recruitment Officer</option>
                  <option value="ho_accountant">HO Accountant</option>
                  <option value="branch_manager">Branch Manager</option>
                </select>
                {errors.role && (
                  <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="branchId" className="block text-sm font-medium text-gray-700">
                Branch
              </label>
              <div className="mt-1">
                <select
                  {...register('branchId')}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Head Office</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
                {errors.branchId && (
                  <p className="mt-1 text-sm text-red-600">{errors.branchId.message}</p>
                )}
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
              onClick={() => navigate('/admin/users')}
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
