import { useFormContext, useFieldArray } from 'react-hook-form';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ApplicantRegistrationData } from '../../../types/applicant';

export const MedicalInfoForm = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ApplicantRegistrationData>();

  const {
    fields: conditionFields,
    append: appendCondition,
    remove: removeCondition,
  } = useFieldArray({
    control,
    name: 'medicalStatus.conditions',
  });

  const {
    fields: allergyFields,
    append: appendAllergy,
    remove: removeAllergy,
  } = useFieldArray({
    control,
    name: 'medicalStatus.allergies',
  });

  const {
    fields: vaccinationFields,
    append: appendVaccination,
    remove: removeVaccination,
  } = useFieldArray({
    control,
    name: 'medicalStatus.vaccinations',
  });

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Medical Information</h3>

      {/* Medical Examination */}
      <div className="border border-gray-200 rounded-md p-4">
        <h4 className="text-md font-medium text-gray-900 mb-4">Medical Examination</h4>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">Examination Date</label>
            <input
              type="date"
              {...register('medicalStatus.examination.date')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Result</label>
            <select
              {...register('medicalStatus.examination.result')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            >
              <option value="">Select result</option>
              <option value="pending">Pending</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Facility</label>
            <input
              type="text"
              {...register('medicalStatus.examination.facility')}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* Medical Conditions */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Medical Conditions</h4>
        <div className="space-y-2">
          {conditionFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                {...register(`medicalStatus.conditions.${index}`)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter medical condition"
              />
              <button
                type="button"
                onClick={() => removeCondition(index)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendCondition('')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Medical Condition
          </button>
        </div>
      </div>

      {/* Allergies */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Allergies</h4>
        <div className="space-y-2">
          {allergyFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                {...register(`medicalStatus.allergies.${index}`)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter allergy"
              />
              <button
                type="button"
                onClick={() => removeAllergy(index)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendAllergy('')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Allergy
          </button>
        </div>
      </div>

      {/* Vaccinations */}
      <div>
        <h4 className="text-md font-medium text-gray-900 mb-4">Vaccinations</h4>
        <div className="space-y-4">
          {vaccinationFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  {...register(`medicalStatus.vaccinations.${index}.name`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter vaccination name"
                />
              </div>
              <div className="w-48">
                <input
                  type="date"
                  {...register(`medicalStatus.vaccinations.${index}.date`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                />
              </div>
              <button
                type="button"
                onClick={() => removeVaccination(index)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendVaccination({ name: '', date: new Date() })}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Vaccination
          </button>
        </div>
      </div>
    </div>
  );
};
