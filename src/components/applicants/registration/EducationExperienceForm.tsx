import { useFormContext, useFieldArray } from 'react-hook-form';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ApplicantRegistrationData } from '../../../types/applicant';

export const EducationExperienceForm = () => {
  const {
    register,
    control,
    formState: { errors },
  } = useFormContext<ApplicantRegistrationData>();

  const {
    fields: educationFields,
    append: appendEducation,
    remove: removeEducation,
  } = useFieldArray({
    control,
    name: 'education',
  });

  const {
    fields: workFields,
    append: appendWork,
    remove: removeWork,
  } = useFieldArray({
    control,
    name: 'workExperience',
  });

  const {
    fields: skillFields,
    append: appendSkill,
    remove: removeSkill,
  } = useFieldArray({
    control,
    name: 'skills',
  });

  const {
    fields: certFields,
    append: appendCert,
    remove: removeCert,
  } = useFieldArray({
    control,
    name: 'certifications',
  });

  const {
    fields: languageFields,
    append: appendLanguage,
    remove: removeLanguage,
  } = useFieldArray({
    control,
    name: 'languages',
  });

  return (
    <div className="space-y-8">
      {/* Education Section */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Education</h3>
        <div className="mt-4 space-y-4">
          {educationFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start">
                <div className="flex-grow grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Level</label>
                    <select
                      {...register(`education.${index}.level`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    >
                      <option value="">Select level</option>
                      <option value="Elementary">Elementary</option>
                      <option value="High School">High School</option>
                      <option value="Vocational">Vocational</option>
                      <option value="College">College</option>
                      <option value="Graduate">Graduate</option>
                    </select>
                    {errors.education?.[index]?.level && (
                      <p className="mt-1 text-sm text-red-600">{errors.education[index]?.level?.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Course</label>
                    <input
                      type="text"
                      {...register(`education.${index}.course`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">School</label>
                    <input
                      type="text"
                      {...register(`education.${index}.school`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Year Completed</label>
                    <input
                      type="number"
                      {...register(`education.${index}.yearCompleted`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="ml-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendEducation({ level: '', course: '', school: '', yearCompleted: new Date().getFullYear() })}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Education
          </button>
        </div>
      </div>

      {/* Work Experience Section */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Work Experience</h3>
        <div className="mt-4 space-y-4">
          {workFields.map((field, index) => (
            <div key={field.id} className="border border-gray-200 rounded-md p-4">
              <div className="flex justify-between items-start">
                <div className="flex-grow grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Company</label>
                    <input
                      type="text"
                      {...register(`workExperience.${index}.company`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <input
                      type="text"
                      {...register(`workExperience.${index}.position`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Location</label>
                    <input
                      type="text"
                      {...register(`workExperience.${index}.location`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Start Date</label>
                    <input
                      type="date"
                      {...register(`workExperience.${index}.startDate`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">End Date</label>
                    <input
                      type="date"
                      {...register(`workExperience.${index}.endDate`)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      {...register(`workExperience.${index}.isOverseas`)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label className="ml-2 block text-sm text-gray-700">Overseas Experience</label>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removeWork(index)}
                  className="ml-4 inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendWork({
              company: '',
              position: '',
              location: '',
              startDate: new Date(),
              endDate: null,
              isOverseas: false,
            })}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Work Experience
          </button>
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Skills</h3>
        <div className="mt-4 space-y-2">
          {skillFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                {...register(`skills.${index}`)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter skill"
              />
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendSkill('')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Skill
          </button>
        </div>
      </div>

      {/* Certifications Section */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Certifications</h3>
        <div className="mt-4 space-y-2">
          {certFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="text"
                {...register(`certifications.${index}`)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Enter certification"
              />
              <button
                type="button"
                onClick={() => removeCert(index)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendCert('')}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Certification
          </button>
        </div>
      </div>

      {/* Languages Section */}
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">Languages</h3>
        <div className="mt-4 space-y-4">
          {languageFields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-4">
              <div className="flex-grow">
                <input
                  type="text"
                  {...register(`languages.${index}.language`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  placeholder="Enter language"
                />
              </div>
              <div className="w-48">
                <select
                  {...register(`languages.${index}.proficiency`)}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                >
                  <option value="">Select proficiency</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="fluent">Fluent</option>
                  <option value="native">Native</option>
                </select>
              </div>
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="inline-flex items-center rounded-md border border-gray-300 bg-white px-2.5 py-1.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => appendLanguage({ language: '', proficiency: 'basic' })}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Language
          </button>
        </div>
      </div>
    </div>
  );
};
