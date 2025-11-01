import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuthStore } from '../../stores/authStore';
import { Commission } from '../../types/commission';
import { CommissionService } from '../../services/commissionService';
import { CheckCircleIcon, XCircleIcon, XMarkIcon } from '@heroicons/react/24/outline';

const commissionApprovalSchema = z.object({
  commissionId: z.string(),
  status: z.enum(['approved', 'rejected']),
  notes: z.string().optional(),
});

type CommissionApprovalData = z.infer<typeof commissionApprovalSchema>;

interface CommissionApprovalProps {
  commission: Commission;
  onClose: () => void;
  onSuccess: () => void;
}

export const CommissionApproval: React.FC<CommissionApprovalProps> = ({
  commission,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuthStore();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CommissionApprovalData>({
    resolver: zodResolver(commissionApprovalSchema),
    defaultValues: {
      commissionId: commission.id,
      status: 'approved',
      notes: '',
    },
  });

  const status = watch('status');

  const handleApproval = async (data: CommissionApprovalData) => {
    if (!user) return;

    try {
      if (data.status === 'approved') {
        await CommissionService.approveCommission(
          commission.id,
          user.uid,
          data.notes
        );
      } else {
        await CommissionService.verifyCommission(
          commission.id,
          user.uid,
          'rejected',
          data.notes || 'Rejected by admin'
        );
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to process commission:', error);
      throw error;
    }
  };

  return (
    <div className="bg-white p-3 sm:p-6 rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-2xl font-bold text-gray-900 flex items-center">
          {status === 'approved' ? (
            <>
              <CheckCircleIcon className="h-5 w-5 sm:h-7 sm:w-7 mr-2 text-green-600 flex-shrink-0" />
              <span className="text-sm sm:text-2xl">Approve Commission</span>
            </>
          ) : (
            <>
              <XCircleIcon className="h-5 w-5 sm:h-7 sm:w-7 mr-2 text-red-600 flex-shrink-0" />
              <span className="text-sm sm:text-2xl">Reject Commission</span>
            </>
          )}
        </h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0"
        >
          <XMarkIcon className="h-5 w-5 sm:h-6 sm:w-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit(handleApproval)} className="space-y-4 sm:space-y-6">
        {/* Commission Summary */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 sm:p-4 border-2 border-indigo-200">
          <h3 className="text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Commission Summary</h3>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <div>
              <p className="text-xs text-gray-500">Amount</p>
              <p className="text-base sm:text-lg font-bold text-indigo-600">
                ₱{commission.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Status</p>
              <p className="text-xs sm:text-sm font-semibold text-blue-600 capitalize">
                {commission.status}
              </p>
            </div>
          </div>
        </div>

        {/* Action Selection */}
        <div>
          <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2 sm:mb-3">
            Action
          </label>
          <div className="space-y-2">
            <label className="flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-green-50 has-[:checked]:bg-green-50 has-[:checked]:border-green-500">
              <input
                type="radio"
                value="approved"
                {...register('status')}
                className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 focus:ring-green-500 flex-shrink-0"
              />
              <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3 mr-1 sm:mr-2 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                Approve Commission
              </span>
            </label>

            <label className="flex items-center p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-red-50 has-[:checked]:bg-red-50 has-[:checked]:border-red-500">
              <input
                type="radio"
                value="rejected"
                {...register('status')}
                className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 focus:ring-red-500 flex-shrink-0"
              />
              <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 ml-2 sm:ml-3 mr-1 sm:mr-2 text-red-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm font-medium text-gray-900">
                Reject Commission
              </span>
            </label>
          </div>
          {errors.status && (
            <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.status.message}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-xs sm:text-sm font-semibold text-gray-700 mb-2">
            {status === 'approved' ? 'Approval Notes (Optional)' : 'Rejection Reason (Required)'}
          </label>
          <textarea
            id="notes"
            {...register('notes', {
              required: status === 'rejected' ? 'Rejection reason is required' : false
            })}
            rows={3}
            className="block w-full rounded-lg border-2 border-gray-300 px-3 py-2 sm:px-4 sm:py-3 focus:border-indigo-500 focus:ring-indigo-500 transition-colors text-xs sm:text-sm"
            placeholder={
              status === 'approved'
                ? 'Add any notes about this approval...'
                : 'Please provide a reason for rejection...'
            }
          />
          {errors.notes && (
            <p className="mt-2 text-xs sm:text-sm text-red-600">{errors.notes.message}</p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
          <button
            type="button"
            onClick={onClose}
            className="px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors order-2 sm:order-1"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={`px-4 sm:px-6 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed order-1 sm:order-2 ${
              status === 'approved'
                ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                : 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800'
            }`}
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Processing...
              </span>
            ) : (
              <>
                {status === 'approved' ? (
                  <span className="flex items-center justify-center">
                    <CheckCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
                    Approve Commission
                  </span>
                ) : (
                  <span className="flex items-center justify-center">
                    <XCircleIcon className="h-4 w-4 sm:h-5 sm:w-5 inline mr-1 sm:mr-2" />
                    Reject Commission
                  </span>
                )}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

