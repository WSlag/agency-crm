import { useFormContext } from 'react-hook-form';
import { ApplicantRegistrationData } from '../../../types/applicant';

export const EmergencyContactForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicantRegistrationData>();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Emergency Contact</h3>

      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="emergencyContact.name" className="block text-sm font-medium text-gray-700">
            Contact Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('emergencyContact.name')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.emergencyContact?.name && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.name.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="emergencyContact.relationship" className="block text-sm font-medium text-gray-700">
            Relationship
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('emergencyContact.relationship')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.emergencyContact?.relationship && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.relationship.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="emergencyContact.contactNumber" className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('emergencyContact.contactNumber')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.emergencyContact?.contactNumber && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.contactNumber.message}</p>
            )}
          </div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="emergencyContact.address" className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <div className="mt-1">
            <textarea
              {...register('emergencyContact.address')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.emergencyContact?.address && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyContact.address.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
