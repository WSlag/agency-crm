import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { PersonalInfoForm } from '../../components/applicants/registration/PersonalInfoForm';
import { JobPreferencesForm } from '../../components/applicants/registration/JobPreferencesForm';
import { EducationExperienceForm } from '../../components/applicants/registration/EducationExperienceForm';
import { MedicalInfoForm } from '../../components/applicants/registration/MedicalInfoForm';
import { EmergencyContactForm } from '../../components/applicants/registration/EmergencyContactForm';
import { useApplicantStore } from '../../stores/applicantStore';
import { applicantRegistrationSchema } from '../../schemas/applicant';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicantRegistrationData } from '../../types/applicant';
import { 
  SparklesIcon, 
  ArrowLeftIcon,
  CheckIcon,
  UserPlusIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

const steps = [
  { id: 'personal', name: 'Personal Information', component: PersonalInfoForm },
  { id: 'job', name: 'Job Preferences', component: JobPreferencesForm },
  { id: 'education', name: 'Education & Experience', component: EducationExperienceForm },
  { id: 'medical', name: 'Medical Information', component: MedicalInfoForm },
  { id: 'emergency', name: 'Emergency Contact', component: EmergencyContactForm },
];

export const ApplicantRegistration = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { createApplicant, updateApplicant, selectedApplicant, fetchApplicantById } = useApplicantStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(!!id);

  const isEditMode = !!id;

  const methods = useForm<ApplicantRegistrationData>({
    resolver: zodResolver(applicantRegistrationSchema),
    mode: 'onChange',
    defaultValues: {
      branchId: user?.branchId || '',
      applicationType: 'direct_hire',
      status: 'active',
      currentStage: 'registration',
      transferredToHO: false,
      transferredDate: null,
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
      emergencyContact: {
        name: '',
        relationship: '',
        contactNumber: '',
        address: '',
      },
    },
  });

  // Load existing applicant data if editing
  useEffect(() => {
    const loadApplicant = async () => {
      if (id && isEditMode) {
        setIsLoading(true);
        try {
          await fetchApplicantById(id);
        } catch (error) {
          console.error('Failed to load applicant:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    loadApplicant();
  }, [id, isEditMode, fetchApplicantById]);

  // Pre-fill form with existing data
  useEffect(() => {
    if (isEditMode && selectedApplicant && selectedApplicant.id === id) {
      // Convert Firestore Timestamps to Dates and filter out server-generated fields
      const formData: any = {
        fullName: selectedApplicant.fullName,
        contactInfo: selectedApplicant.contactInfo,
        email: selectedApplicant.email,
        agentId: selectedApplicant.agentId,
        branchId: selectedApplicant.branchId,
        assignedRecruitmentOfficerId: selectedApplicant.assignedRecruitmentOfficerId,
        applicationType: selectedApplicant.applicationType,
        currentStage: selectedApplicant.currentStage,
        transferredToHO: selectedApplicant.transferredToHO,
        transferredDate: selectedApplicant.transferredDate,
        status: selectedApplicant.status,
        
        // Personal Information - convert dates
        dateOfBirth: selectedApplicant.dateOfBirth instanceof Date 
          ? selectedApplicant.dateOfBirth 
          : selectedApplicant.dateOfBirth?.toDate?.() || new Date(selectedApplicant.dateOfBirth),
        placeOfBirth: selectedApplicant.placeOfBirth,
        nationality: selectedApplicant.nationality,
        civilStatus: selectedApplicant.civilStatus,
        gender: selectedApplicant.gender,
        address: selectedApplicant.address,
        
        // Job Preferences
        preferredCountries: selectedApplicant.preferredCountries || [''],
        preferredPositions: selectedApplicant.preferredPositions || [''],
        expectedSalary: selectedApplicant.expectedSalary,
        
        // Skills and Qualifications
        education: selectedApplicant.education || [],
        workExperience: selectedApplicant.workExperience || [],
        skills: selectedApplicant.skills || [],
        certifications: selectedApplicant.certifications || [],
        languages: selectedApplicant.languages || [],
        
        // Medical Information
        medicalStatus: selectedApplicant.medicalStatus,
        
        // Emergency Contact
        emergencyContact: selectedApplicant.emergencyContact,
      };
      
      methods.reset(formData);
    }
  }, [isEditMode, selectedApplicant, id, methods]);

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
      if (isEditMode && id) {
        // Update existing applicant
        console.log('Updating applicant with data:', data);
        await updateApplicant(id, data);
        console.log('Update successful, navigating to profile');
        navigate(`/applicants/${id}`);
      } else {
        // Create new applicant
        console.log('Creating applicant with data:', data);
        const applicantId = await createApplicant(data);
        console.log('Creation successful, navigating to profile');
        navigate(`/applicants/${applicantId}`);
      }
    } catch (error: any) {
      console.error(`Failed to ${isEditMode ? 'update' : 'create'} applicant:`, error);
      alert(`Error: ${error.message || 'Failed to save applicant. Please try again.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  // Show loading spinner while fetching applicant data
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading applicant data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <button
            onClick={() => navigate(isEditMode ? `/applicants/${id}` : '/applicants')}
            className="group mb-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            {isEditMode ? 'Back to Profile' : 'Back to Applicants'}
          </button>
          <div className="flex items-center space-x-3">
            {isEditMode ? (
              <PencilIcon className="h-8 w-8 text-white" />
            ) : (
              <SparklesIcon className="h-8 w-8 text-white" />
            )}
            <h1 className="text-3xl font-bold text-white">
              {isEditMode ? 'Edit Applicant' : 'Register New Applicant'}
            </h1>
          </div>
          <p className="mt-2 text-indigo-100">
            {isEditMode 
              ? 'Update applicant information across all sections'
              : 'Complete all steps to register a new applicant'
            }
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          {/* Progress Steps */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
            <nav aria-label="Progress">
              <ol role="list" className="space-y-4 md:flex md:space-y-0 md:space-x-8">
                {steps.map((step, index) => (
                  <li key={step.id} className="md:flex-1">
                    <div
                      className={`group flex flex-col border-l-4 py-2 pl-4 md:border-l-0 md:border-t-4 md:pl-0 md:pt-4 md:pb-0 ${
                        index <= currentStep
                          ? 'border-indigo-600'
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-xs font-semibold tracking-wide uppercase text-gray-500">
                        Step {index + 1}
                      </span>
                      <span className="text-sm font-medium flex items-center">
                        {index < currentStep && (
                          <CheckIcon className="h-5 w-5 text-green-600 mr-2" />
                        )}
                        <span className={index <= currentStep ? 'text-indigo-600' : 'text-gray-500'}>
                          {step.name}
                        </span>
                      </span>
                    </div>
                  </li>
                ))}
              </ol>
            </nav>
          </div>

          {/* Form */}
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <div className="flex items-center space-x-2 mb-6">
                  <UserPlusIcon className="h-6 w-6 text-indigo-600" />
                  <h3 className="text-xl font-bold text-gray-900">{steps[currentStep].name}</h3>
                </div>
                <CurrentStepComponent />
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                >
                  Previous
                </button>
                
                <div>
                  {currentStep === steps.length - 1 ? (
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-transparent rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    >
                      {isSubmitting ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          {isEditMode ? 'Updating...' : 'Submitting...'}
                        </span>
                      ) : (
                        isEditMode ? 'Save Changes' : 'Submit Registration'
                      )}
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 border-2 border-transparent rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            </form>
          </FormProvider>
        </div>
      </div>
    </div>
  );
};
