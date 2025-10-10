import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { transferRequestSchema } from '../../../schemas/applicant';
import { Applicant } from '../../../types/applicant';

interface TransferRequestFormProps {
  applicant: Applicant;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export const TransferRequestForm = ({
  applicant,
  onSubmit,
  onCancel,
}: TransferRequestFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(transferRequestSchema),
    defaultValues: {
      applicantId: applicant.id,
      fromBranchId: applicant.branchId,
      toBranchId: '', // Head Office branch ID would be set here
      transferReason: '',
      notes: '',
    },
  });

  const onFormSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
      <div className="sm:flex sm:items-start">
        <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Request Transfer to Head Office
          </h3>
          <div className="mt-4">
            <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
              <div>
                <label
                  htmlFor="transferReason"
                  className="block text-sm font-medium text-gray-700"
                >
                  Transfer Reason
                </label>
                <div className="mt-1">
                  <textarea
                    {...register('transferReason')}
                    rows={4}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Please provide a detailed reason for the transfer request..."
                  />
                  {errors.transferReason && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.transferReason.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="notes"
                  className="block text-sm font-medium text-gray-700"
                >
                  Additional Notes
                </label>
                <div className="mt-1">
                  <textarea
                    {...register('notes')}
                    rows={3}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Any additional information or special requirements..."
                  />
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">
                      {errors.notes.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex w-full justify-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Request'}
                </button>
                <button
                  type="button"
                  onClick={onCancel}
                  className="mt-3 inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
