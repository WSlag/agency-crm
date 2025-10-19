import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CommissionRequestForm } from '../../components/commissions/CommissionRequestForm';
import { useCommissionStore } from '../../stores/commissionStore';
import { useAuthStore } from '../../stores/authStore';
import type { Commission } from '../../types/commission';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/outline';

export const CommissionRequest = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, customClaims } = useAuthStore();
  const {
    selectedCommission,
    loading,
    error,
    fetchCommissionById,
    createCommission,
    updateCommission,
  } = useCommissionStore();

  useEffect(() => {
    if (id) {
      fetchCommissionById(id);
    }
  }, [id, fetchCommissionById]);

  const handleSubmit = async (data: Partial<Commission>) => {
    try {
      if (id) {
        await updateCommission(id, data);
      } else {
        // Use branchId from form data (already set by CommissionRequestForm)
        const newCommissionData = {
          ...data,
          requestedBy: user?.uid || '',
          branchId: data.branchId || customClaims?.branchId || '', // Use form's branchId or customClaims
        };
        
        console.log('📤 Commission Request: Submitting with branchId:', newCommissionData.branchId);
        
        await createCommission(
          newCommissionData as Omit<
            Commission,
            'id' | 'status' | 'createdAt' | 'updatedAt'
          >
        );
      }
      navigate('/commissions');
    } catch (error) {
      console.error('Failed to save commission:', error);
      alert('Failed to save commission. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/commissions');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading commission...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
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
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/commissions')}
            className="group mb-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Commissions
          </button>
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">
              {id ? 'Edit Commission Request' : 'New Commission Request'}
            </h1>
          </div>
          <p className="mt-2 text-indigo-100">
            {id ? 'Update commission details and information' : 'Submit a new commission request for approval'}
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="mx-auto max-w-4xl">
          <CommissionRequestForm
            initialData={id ? selectedCommission : undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
          />
        </div>
      </div>
    </div>
  );
};
