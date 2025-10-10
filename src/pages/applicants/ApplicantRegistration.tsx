import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PersonalInfoForm } from '../../components/applicants/registration/PersonalInfoForm';
import { JobPreferencesForm } from '../../components/applicants/registration/JobPreferencesForm';
import { EducationExperienceForm } from '../../components/applicants/registration/EducationExperienceForm';
import { MedicalInfoForm } from '../../components/applicants/registration/MedicalInfoForm';
import { EmergencyContactForm } from '../../components/applicants/registration/EmergencyContactForm';
import { useApplicantStore } from '../../stores/applicantStore';
import { applicantRegistrationSchema } from '../../schemas/applicant';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicantRegistrationData } from '../../types/applicant';

const steps = [
  { id: 'personal', name: 'Personal Information', component: PersonalInfoForm },
  { id: 'job', name: 'Job Preferences', component: JobPreferencesForm },
  { id: 'education', name: 'Education & Experience', component: EducationExperienceForm },
  { id: 'medical', name: 'Medical Information', component: MedicalInfoForm },
  { id: 'emergency', name: 'Emergency Contact', component: EmergencyContactForm },
];

export const ApplicantRegistration = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { createApplicant } = useApplicantStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const methods = useForm<ApplicantRegistrationData>({
    resolver: zodResolver(applicantRegistrationSchema),
    defaultValues: {
      branchId: user?.branchId || '',
      applicationType: 'direct_hire',
      status: 'active',
      preferredCountries: [''],
      preferredPositions: [''],
      education: [],
      workExperience: [],
      skills: [],
      certifications: [],
      languages: [],
      medicalStatus: {
        examination: {
          date: null,
          result: null,
          facility: '',
        },
        conditions: [],
        allergies: [],
        vaccinations: [],
      },
    },
  });

  const { handleSubmit, trigger } = methods;

  const handleNext = async () => {
    const fields = getFieldsForStep(currentStep);
    const isValid = await trigger(fields);
    
    if (isValid) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const getFieldsForStep = (step: number): Array<keyof ApplicantRegistrationData> => {
    switch (step) {
      case 0:
        return ['fullName', 'email', 'contactInfo', 'dateOfBirth', 'placeOfBirth', 'nationality', 'civilStatus', 'gender', 'address'];
      case 1:
        return ['preferredCountries', 'preferredPositions', 'expectedSalary'];
      case 2:
        return ['education', 'workExperience', 'skills', 'certifications', 'languages'];
      case 3:
        return ['medicalStatus'];
      case 4:
        return ['emergencyContact'];
      default:
        return [];
    }
  };

  const onSubmit = async (data: ApplicantRegistrationData) => {
    try {
      setIsSubmitting(true);
      const applicantId = await createApplicant(data);
      navigate(`/applicants/${applicantId}`);
    } catch (error) {
      console.error('Failed to create applicant:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Register New Applicant</h1>
          <p className="mt-2 text-sm text-gray-600">
            Please fill out all required information to register a new applicant.
          </p>
        </div>

        {/* Progress Steps */}
        <nav aria-label="Progress" className="mb-8">
          <ol role="list" className="flex items-center">
            {steps.map((step, index) => (
              <li
                key={step.id}
                className={`${
                  index !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''
                } relative`}
              >
                <div className="flex items-center">
                  <div
                    className={`${
                      index <= currentStep
                        ? 'bg-primary-600'
                        : 'bg-gray-200'
                    } h-8 w-8 rounded-full flex items-center justify-center`}
                  >
                    <span className="text-white text-sm">{index + 1}</span>
                  </div>
                  <span className="ml-4 text-sm font-medium text-gray-900">
                    {step.name}
                  </span>
                </div>
                {index !== steps.length - 1 && (
                  <div className="absolute top-4 w-full h-0.5 bg-gray-200">
                    <div
                      className="h-full bg-primary-600 transition-all duration-500"
                      style={{
                        width: index < currentStep ? '100%' : '0%',
                      }}
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>

        {/* Form */}
        <FormProvider {...methods}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            <div className="bg-white shadow sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <CurrentStepComponent />
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 0}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                Previous
              </button>
              
              <div>
                {currentStep === steps.length - 1 ? (
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </DashboardLayout>
  );
};
