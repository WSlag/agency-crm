import { useState } from 'react';
import { ApplicantTransfer } from '../../../types/applicant';
import { User } from '../../../types/index';

interface TransferApprovalProps {
  transfer: ApplicantTransfer;
  recruitmentOfficers: User[];
  onApprove: (transferId: string, officerId: string) => Promise<void>;
  onReject: (transferId: string, reason: string) => Promise<void>;
}

export const TransferApproval = ({
  transfer,
  recruitmentOfficers,
  onApprove,
  onReject,
}: TransferApprovalProps) => {
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleApprove = async () => {
    if (!selectedOfficer) {
      alert('Please select a recruitment officer');
      return;
    }

    try {
      setIsProcessing(true);
      await onApprove(transfer.id, selectedOfficer);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason) {
      alert('Please provide a reason for rejection');
      return;
    }

    try {
      setIsProcessing(true);
      await onReject(transfer.id, rejectionReason);
    } finally {
      setIsProcessing(false);
      setShowRejectionForm(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Transfer Request Details
        </h3>
        
        <div className="mt-5 border-t border-gray-200">
          <dl className="divide-y divide-gray-200">
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Request Date</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {new Date(transfer.requestedDate).toLocaleDateString()}
              </dd>
            </div>
            
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Requested By</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {transfer.requestedBy}
              </dd>
            </div>
            
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">From Branch</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {transfer.fromBranchId}
              </dd>
            </div>
            
            <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Reason</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                {transfer.transferReason}
              </dd>
            </div>
            
            {transfer.notes && (
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">Notes</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {transfer.notes}
                </dd>
              </div>
            )}
          </dl>
        </div>

        {transfer.transferStatus === 'pending' && (
          <div className="mt-6 space-y-6">
            {!showRejectionForm ? (
              <>
                <div>
                  <label
                    htmlFor="officer"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Assign Recruitment Officer
                  </label>
                  <select
                    id="officer"
                    value={selectedOfficer}
                    onChange={(e) => setSelectedOfficer(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                  >
                    <option value="">Select an officer</option>
                    {recruitmentOfficers.map((officer) => (
                      <option key={officer.uid} value={officer.uid}>
                        {officer.displayName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleApprove}
                    disabled={isProcessing || !selectedOfficer}
                    className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Approve Transfer'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowRejectionForm(true)}
                    disabled={isProcessing}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Reject Transfer
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-4">
                <div>
                  <label
                    htmlFor="rejectionReason"
                    className="block text-sm font-medium text-gray-700"
                  >
                    Rejection Reason
                  </label>
                  <textarea
                    id="rejectionReason"
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    placeholder="Please provide a reason for rejecting this transfer request..."
                  />
                </div>

                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleReject}
                    disabled={isProcessing || !rejectionReason}
                    className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    {isProcessing ? 'Processing...' : 'Confirm Rejection'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => setShowRejectionForm(false)}
                    disabled={isProcessing}
                    className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
