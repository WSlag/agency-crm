import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ProfileHeader } from '../../components/applicants/profile/ProfileHeader';
import { ProfileDetails } from '../../components/applicants/profile/ProfileDetails';
import { useApplicantStore } from '../../stores/applicantStore';

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
      <DashboardLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-red-50 p-4 rounded-md">
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
      </DashboardLayout>
    );
  }

  if (!selectedApplicant) {
    return (
      <DashboardLayout>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="mt-2 text-sm font-medium text-gray-900">No applicant found</h3>
            <p className="mt-1 text-sm text-gray-500">
              The applicant you're looking for doesn't exist or you don't have permission to view it.
            </p>
            <div className="mt-6">
              <button
                type="button"
                onClick={() => navigate('/applicants')}
                className="inline-flex items-center rounded-md bg-primary-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                Go back to applicants
              </button>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ProfileHeader
          applicant={selectedApplicant}
          onStatusChange={handleStatusChange}
          onEdit={handleEdit}
        />
        <ProfileDetails applicant={selectedApplicant} />
      </div>
    </DashboardLayout>
  );
};
