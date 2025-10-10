import { ApplicantTransfer } from '../../../types/applicant';
import {
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/solid';

interface TransferHistoryProps {
  transfers: ApplicantTransfer[];
}

export const TransferHistory = ({ transfers }: TransferHistoryProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <CheckCircleIcon
            className="h-5 w-5 text-green-500"
            aria-hidden="true"
          />
        );
      case 'rejected':
        return (
          <XCircleIcon className="h-5 w-5 text-red-500" aria-hidden="true" />
        );
      case 'pending':
        return (
          <ClockIcon className="h-5 w-5 text-yellow-500" aria-hidden="true" />
        );
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-800 bg-green-100';
      case 'rejected':
        return 'text-red-800 bg-red-100';
      case 'pending':
        return 'text-yellow-800 bg-yellow-100';
      default:
        return 'text-gray-800 bg-gray-100';
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Transfer History
        </h3>
        
        <div className="mt-6 flow-root">
          <ul role="list" className="-mb-8">
            {transfers.map((transfer, transferIdx) => (
              <li key={transfer.id}>
                <div className="relative pb-8">
                  {transferIdx !== transfers.length - 1 ? (
                    <span
                      className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                      aria-hidden="true"
                    />
                  ) : null}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white bg-gray-100">
                        {getStatusIcon(transfer.transferStatus)}
                      </span>
                    </div>
                    <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                      <div>
                        <p className="text-sm text-gray-500">
                          Transfer request from{' '}
                          <span className="font-medium text-gray-900">
                            {transfer.fromBranchId}
                          </span>{' '}
                          to{' '}
                          <span className="font-medium text-gray-900">
                            Head Office
                          </span>
                        </p>
                        <div className="mt-2">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusColor(
                              transfer.transferStatus
                            )}`}
                          >
                            {transfer.transferStatus.toUpperCase()}
                          </span>
                        </div>
                        {transfer.transferReason && (
                          <p className="mt-2 text-sm text-gray-500">
                            Reason: {transfer.transferReason}
                          </p>
                        )}
                        {transfer.notes && (
                          <p className="mt-1 text-sm text-gray-500">
                            Notes: {transfer.notes}
                          </p>
                        )}
                        {transfer.assignedOfficerId && (
                          <p className="mt-1 text-sm text-gray-500">
                            Assigned to:{' '}
                            <span className="font-medium text-gray-900">
                              {transfer.assignedOfficerId}
                            </span>
                          </p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-right text-sm text-gray-500">
                        <div>
                          Requested:{' '}
                          <time dateTime={transfer.requestedDate.toISOString()}>
                            {new Date(transfer.requestedDate).toLocaleDateString()}
                          </time>
                        </div>
                        {transfer.approvedDate && (
                          <div className="mt-1">
                            Approved:{' '}
                            <time dateTime={transfer.approvedDate.toISOString()}>
                              {new Date(
                                transfer.approvedDate
                              ).toLocaleDateString()}
                            </time>
                          </div>
                        )}
                        {transfer.completedDate && (
                          <div className="mt-1">
                            Completed:{' '}
                            <time dateTime={transfer.completedDate.toISOString()}>
                              {new Date(
                                transfer.completedDate
                              ).toLocaleDateString()}
                            </time>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {transfers.length === 0 && (
          <div className="text-center mt-6">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                vectorEffect="non-scaling-stroke"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No transfer history
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              This applicant has not been transferred between branches.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
