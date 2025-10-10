import { useFormContext, useFieldArray } from 'react-hook-form';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ApplicantRegistrationData } from '../../../types/applicant';

export const JobPreferencesForm = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ApplicantRegistrationData>();

  const {
    fields: countryFields,
    append: appendCountry,
    remove: removeCountry,
  } = useFieldArray({
    control,
    name: 'preferredCountries',
  });

  const {
    fields: positionFields,
    append: appendPosition,
    remove: removePosition,
  } = useFieldArray({
    control,
    name: 'preferredPositions',
  });

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium leading-6 text-gray-900">Job Preferences</h3>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Countries
          </label>
          <div className="mt-2 space-y-2">
            {countryFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  {...register(`preferredCountries.${index}`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter country name"
                />
                <button
                  type="button"
                  onClick={() => removeCountry(index)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendCountry('')}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Country
            </button>
            {errors.preferredCountries && (
              <p className="mt-1 text-sm text-red-600">{errors.preferredCountries.message}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Positions
          </label>
          <div className="mt-2 space-y-2">
            {positionFields.map((field, index) => (
              <div key={field.id} className="flex items-center gap-2">
                <input
                  type="text"
                  {...register(`preferredPositions.${index}`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter position"
                />
                <button
                  type="button"
                  onClick={() => removePosition(index)}
                  className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => appendPosition('')}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Position
            </button>
            {errors.preferredPositions && (
              <p className="mt-1 text-sm text-red-600">{errors.preferredPositions.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
          <div>
            <label htmlFor="expectedSalary.amount" className="block text-sm font-medium text-gray-700">
              Expected Salary Amount
            </label>
            <div className="mt-1">
              <input
                type="number"
                {...register('expectedSalary.amount')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              />
              {errors.expectedSalary?.amount && (
                <p className="mt-1 text-sm text-red-600">{errors.expectedSalary.amount.message}</p>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="expectedSalary.currency" className="block text-sm font-medium text-gray-700">
              Currency
            </label>
            <div className="mt-1">
              <select
                {...register('expectedSalary.currency')}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
              >
                <option value="">Select currency</option>
                <option value="USD">USD</option>
                <option value="PHP">PHP</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
                <option value="AUD">AUD</option>
                <option value="CAD">CAD</option>
                <option value="SGD">SGD</option>
                <option value="AED">AED</option>
              </select>
              {errors.expectedSalary?.currency && (
                <p className="mt-1 text-sm text-red-600">{errors.expectedSalary.currency.message}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
