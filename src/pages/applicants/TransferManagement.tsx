import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { TransferRequestForm } from '../../components/applicants/transfer/TransferRequestForm';
import { TransferApproval } from '../../components/applicants/transfer/TransferApproval';
import { TransferHistory } from '../../components/applicants/transfer/TransferHistory';
import { useApplicantStore } from '../../stores/applicantStore';
import { useAuth } from '../../contexts/AuthContext';
import { User } from '../../types';

export const TransferManagement = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
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

  const canRequestTransfer =
    user?.role === 'branch_manager' &&
    user.branchId === selectedApplicant.branchId &&
    !selectedApplicant.transferredToHO;

  const canApproveTransfer =
    (user?.role === 'admin' || user?.role === 'president') &&
    selectedApplicant.transferredToHO === false;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-2xl font-bold text-gray-900">
                Transfer Management
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Manage branch transfers for {selectedApplicant.fullName}
              </p>
            </div>
            {canRequestTransfer && !showTransferForm && (
              <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                  type="button"
                  onClick={() => setShowTransferForm(true)}
                  className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Request Transfer
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
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
    </DashboardLayout>
  );
};
