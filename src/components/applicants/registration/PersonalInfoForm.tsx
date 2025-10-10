import { useFormContext } from 'react-hook-form';
import { ApplicantRegistrationData } from '../../../types/applicant';

export const PersonalInfoForm = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext<ApplicantRegistrationData>();

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Personal Information</h3>
      
      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
            Full Name
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('fullName')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.fullName && (
              <p className="mt-1 text-sm text-red-600">{errors.fullName.message}</p>
            )}
          </div>
        </div>

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

        <div>
          <label htmlFor="contactInfo" className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('contactInfo')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.contactInfo && (
              <p className="mt-1 text-sm text-red-600">{errors.contactInfo.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700">
            Date of Birth
          </label>
          <div className="mt-1">
            <input
              type="date"
              {...register('dateOfBirth')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.dateOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.dateOfBirth.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="placeOfBirth" className="block text-sm font-medium text-gray-700">
            Place of Birth
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('placeOfBirth')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.placeOfBirth && (
              <p className="mt-1 text-sm text-red-600">{errors.placeOfBirth.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="nationality" className="block text-sm font-medium text-gray-700">
            Nationality
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('nationality')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.nationality && (
              <p className="mt-1 text-sm text-red-600">{errors.nationality.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="civilStatus" className="block text-sm font-medium text-gray-700">
            Civil Status
          </label>
          <div className="mt-1">
            <select
              {...register('civilStatus')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select status</option>
              <option value="single">Single</option>
              <option value="married">Married</option>
              <option value="widowed">Widowed</option>
              <option value="divorced">Divorced</option>
            </select>
            {errors.civilStatus && (
              <p className="mt-1 text-sm text-red-600">{errors.civilStatus.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <div className="mt-1">
            <select
              {...register('gender')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label htmlFor="address.present" className="block text-sm font-medium text-gray-700">
            Present Address
          </label>
          <div className="mt-1">
            <textarea
              {...register('address.present')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.address?.present && (
              <p className="mt-1 text-sm text-red-600">{errors.address.present.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="address.permanent" className="block text-sm font-medium text-gray-700">
            Permanent Address
          </label>
          <div className="mt-1">
            <textarea
              {...register('address.permanent')}
              rows={3}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
            {errors.address?.permanent && (
              <p className="mt-1 text-sm text-red-600">{errors.address.permanent.message}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
