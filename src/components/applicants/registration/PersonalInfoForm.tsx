import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { ApplicantRegistrationData } from '../../../types/applicant';
import { useAgentStore } from '../../../stores/agentStore';

export const PersonalInfoForm = () => {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<ApplicantRegistrationData>();

  // Fetch agents for the dropdown
  const { agents, fetchActiveAgents } = useAgentStore();

  useEffect(() => {
    fetchActiveAgents();
  }, [fetchActiveAgents]);

  // Watch the applicationType field to conditionally show agent dropdown
  const applicationType = watch('applicationType');

  // Reset agentId to null when changing to direct_hire
  useEffect(() => {
    if (applicationType === 'direct_hire') {
      setValue('agentId', null);
      console.log('✅ Agent ID reset to null (direct_hire)');
    }
  }, [applicationType, setValue]);

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

        {/* Application Type */}
        <div>
          <label htmlFor="applicationType" className="block text-sm font-medium text-gray-700">
            Application Type <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              {...register('applicationType')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="direct_hire">Direct Hire</option>
              <option value="with_agent">With Agent</option>
            </select>
            {errors.applicationType && (
              <p className="mt-1 text-sm text-red-600">{errors.applicationType.message}</p>
            )}
          </div>
        </div>

        {/* Agent Selection - Only show when "With Agent" is selected */}
        {applicationType === 'with_agent' && (
          <div>
            <label htmlFor="agentId" className="block text-sm font-medium text-gray-700">
              Select Agent <span className="text-red-500">*</span>
            </label>
            <div className="mt-1">
              <select
                {...register('agentId')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">-- Select an Agent --</option>
                {agents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.agentName}
                  </option>
                ))}
              </select>
              {errors.agentId && (
                <p className="mt-1 text-sm text-red-600">{errors.agentId.message}</p>
              )}
            </div>
          </div>
        )}

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

        <div>
          <label htmlFor="positionApplied" className="block text-sm font-medium text-gray-700">
            Position Applied
          </label>
          <div className="mt-1">
            <input
              type="text"
              {...register('positionApplied')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              placeholder="e.g., Factory Worker, Caregiver, Nurse"
            />
            {errors.positionApplied && (
              <p className="mt-1 text-sm text-red-600">{errors.positionApplied.message}</p>
            )}
          </div>
        </div>

        <div>
          <label htmlFor="countryDestination" className="block text-sm font-medium text-gray-700">
            Country Destination
          </label>
          <div className="mt-1">
            <select
              {...register('countryDestination')}
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select Country</option>
              <option value="Saudi Arabia">Saudi Arabia</option>
              <option value="United Arab Emirates">United Arab Emirates</option>
              <option value="Qatar">Qatar</option>
              <option value="Kuwait">Kuwait</option>
              <option value="Bahrain">Bahrain</option>
              <option value="Oman">Oman</option>
              <option value="Singapore">Singapore</option>
              <option value="Hong Kong">Hong Kong</option>
              <option value="Taiwan">Taiwan</option>
              <option value="Japan">Japan</option>
              <option value="South Korea">South Korea</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="New Zealand">New Zealand</option>
              <option value="Other">Other</option>
            </select>
            {errors.countryDestination && (
              <p className="mt-1 text-sm text-red-600">{errors.countryDestination.message}</p>
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
