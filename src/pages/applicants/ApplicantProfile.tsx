import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProfileHeader } from '../../components/applicants/profile/ProfileHeader';
import { ProfileDetails } from '../../components/applicants/profile/ProfileDetails';
import { useApplicantStore } from '../../stores/applicantStore';
import { 
  SparklesIcon, 
  ArrowLeftIcon,
  UserIcon
} from '@heroicons/react/24/outline';

export const ApplicantProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    selectedApplicant,
    loading,
    error,
    fetchApplicantById,
    updateApplicant,
  } = useApplicantStore();

  useEffect(() => {
    if (id) {
      fetchApplicantById(id);
    }
  }, [id, fetchApplicantById]);

  const handleStatusChange = async (status: 'active' | 'inactive') => {
    if (id && selectedApplicant) {
      await updateApplicant(id, { status });
    }
  };

  const handleEdit = () => {
    navigate(`/applicants/${id}/edit`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
        <p className="mt-4 text-gray-600 font-medium">Loading applicant profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedApplicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <UserIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">No applicant found</h3>
          <p className="mt-2 text-sm text-gray-500">
            The applicant you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => navigate('/applicants')}
              className="inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg shadow-lg hover:from-indigo-700 hover:to-purple-700 hover:scale-105 transition-all duration-200"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go back to applicants
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <button
            onClick={() => navigate('/applicants')}
            className="group mb-4 inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg hover:bg-white/20 transition-all duration-200"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Applicants
          </button>
          <div className="flex items-center space-x-3">
            <SparklesIcon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Applicant Profile</h1>
          </div>
          <p className="mt-2 text-indigo-100">
            View and manage applicant information and status
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <ProfileHeader
            applicant={selectedApplicant}
            onStatusChange={handleStatusChange}
            onEdit={handleEdit}
          />
          <ProfileDetails applicant={selectedApplicant} />
        </div>
      </div>
    </div>
  );
};
