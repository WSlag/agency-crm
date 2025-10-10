import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { PipelineStages } from '../../components/applicants/pipeline/PipelineStages';
import { useApplicantStore } from '../../stores/applicantStore';
import { ApplicantStage } from '../../types/applicant';

const requiredDocuments: { [key in ApplicantStage]: string[] } = {
  interview: ['passport', 'nbi_clearance', 'barangay_cert'],
  medical: ['medical_cert'],
  processing: ['tesda_cert', 'owwa', 'employment_contract'],
  deployment: ['pdos', 'plane_ticket'],
  deployed: [],
};

export const PipelineManagement = () => {
  const { id } = useParams<{ id: string }>();
  const {
    selectedApplicant,
    loading,
    error,
    fetchApplicantById,
    updatePipeline,
    uploadDocument,
  } = useApplicantStore();

  const [uploadedDocuments, setUploadedDocuments] = useState<{
    [key: string]: {
      fileUrl: string;
      status: 'pending' | 'verified' | 'rejected';
    };
  }>({});

  useEffect(() => {
    if (id) {
      fetchApplicantById(id);
      // Fetch documents for the applicant
      // This would typically come from your Firebase store
      // For now, we'll use an empty object
    }
  }, [id, fetchApplicantById]);

  const handleStageUpdate = async (newStage: ApplicantStage) => {
    if (!id || !selectedApplicant) return;

    // Check if all required documents for the current stage are uploaded
    const currentStageDocuments = requiredDocuments[selectedApplicant.currentStage];
    const missingDocuments = currentStageDocuments.filter(
      (doc) => !uploadedDocuments[doc]
    );

    if (missingDocuments.length > 0) {
      alert(
        `Please upload all required documents before proceeding:\n${missingDocuments
          .map((doc) => doc.split('_').join(' ').toUpperCase())
          .join('\n')}`
      );
      return;
    }

    try {
      await updatePipeline(id, {
        stage: newStage,
        notes: `Moved from ${selectedApplicant.currentStage} to ${newStage}`,
      });
      await fetchApplicantById(id);
    } catch (error) {
      console.error('Failed to update pipeline stage:', error);
    }
  };

  const handleDocumentUpload = async (
    stage: ApplicantStage,
    documentType: string,
    file: File
  ) => {
    if (!id || !selectedApplicant) return;

    try {
      await uploadDocument({
        applicantId: id,
        documentType: documentType as any,
        documentStage: stage,
        file,
      });

      // Update local state
      setUploadedDocuments((prev) => ({
        ...prev,
        [documentType]: {
          fileUrl: URL.createObjectURL(file),
          status: 'pending',
        },
      }));
    } catch (error) {
      console.error('Failed to upload document:', error);
    }
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
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No applicant found
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              The applicant you're looking for doesn't exist or you don't have
              permission to view it.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">
            Pipeline Management
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Manage recruitment pipeline stages and required documents for{' '}
            {selectedApplicant.fullName}
          </p>
        </div>

        <PipelineStages
          currentStage={selectedApplicant.currentStage}
          pipelineHistory={[]} // This would come from your Firebase store
          onStageUpdate={handleStageUpdate}
          requiredDocuments={requiredDocuments}
          uploadedDocuments={uploadedDocuments}
          onDocumentUpload={handleDocumentUpload}
        />
      </div>
    </DashboardLayout>
  );
};
