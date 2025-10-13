import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { TransferRequestForm } from '../../components/applicants/transfer/TransferRequestForm';
import { TransferApproval } from '../../components/applicants/transfer/TransferApproval';
import { TransferHistory } from '../../components/applicants/transfer/TransferHistory';
import { useApplicantStore } from '../../stores/applicantStore';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';
import { 
  SparklesIcon, 
  ArrowLeftIcon,
  ArrowsRightLeftIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

export const TransferManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, customClaims } = useAuth();
  const {
    selectedApplicant,
    loading,
    error,
    fetchApplicantById,
    requestTransfer,
    approveTransfer,
    rejectTransfer,
  } = useApplicantStore();

  const [showTransferForm, setShowTransferForm] = useState(false);
  const [recruitmentOfficers, setRecruitmentOfficers] = useState<User[]>([]);
  const [transfers, setTransfers] = useState([]);

  useEffect(() => {
    if (id) {
      fetchApplicantById(id);
      // Fetch transfer history and recruitment officers
      // This would typically come from your Firebase store
      // For now, we'll use empty arrays
    }
  }, [id, fetchApplicantById]);

  const handleTransferRequest = async (data: any) => {
    try {
      await requestTransfer(data);
      setShowTransferForm(false);
      // Refresh applicant data
      await fetchApplicantById(id!);
    } catch (error) {
      console.error('Failed to request transfer:', error);
    }
  };

  const handleTransferApproval = async (transferId: string, officerId: string) => {
    try {
      await approveTransfer(transferId, officerId);
      // Refresh applicant data
      await fetchApplicantById(id!);
    } catch (error) {
      console.error('Failed to approve transfer:', error);
    }
  };

  const handleTransferRejection = async (transferId: string, reason: string) => {
    try {
      await rejectTransfer(transferId, reason);
      // Refresh applicant data
      await fetchApplicantById(id!);
    } catch (error) {
      console.error('Failed to reject transfer:', error);
    }
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
        <p className="mt-4 text-gray-600 font-medium">Loading transfer management...</p>
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
      </div>
    );
  }

  if (!selectedApplicant) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <ArrowsRightLeftIcon className="mx-auto h-16 w-16 text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No applicant found
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            The applicant you're looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <div className="mt-6">
            <button
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

  const canRequestTransfer =
    customClaims?.role === 'branch_manager' &&
    user?.branchId === selectedApplicant.branchId &&
    !selectedApplicant.transferredToHO;

  const canApproveTransfer =
    (customClaims?.role === 'admin' || customClaims?.role === 'president') &&
    selectedApplicant.transferredToHO === false;

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
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">
                  Transfer Management
                </h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Manage branch transfers for {selectedApplicant.fullName}
              </p>
            </div>
            {canRequestTransfer && !showTransferForm && (
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setShowTransferForm(true)}
                  className="group relative inline-flex items-center px-6 py-3 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
                >
                  <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                  Request Transfer
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Transfer Request Form */}
          {showTransferForm && (
            <TransferRequestForm
              applicant={selectedApplicant}
              onSubmit={handleTransferRequest}
              onCancel={() => setShowTransferForm(false)}
            />
          )}

          {/* Transfer Approval */}
          {canApproveTransfer &&
            transfers
              .filter((t: any) => t.transferStatus === 'pending')
              .map((transfer: any) => (
                <TransferApproval
                  key={transfer.id}
                  transfer={transfer}
                  recruitmentOfficers={recruitmentOfficers}
                  onApprove={handleTransferApproval}
                  onReject={handleTransferRejection}
                />
              ))}

          {/* Transfer History */}
          <TransferHistory transfers={transfers} />
        </div>
      </div>
    </div>
  );
};
