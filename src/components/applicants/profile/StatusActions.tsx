import { useState } from 'react';
import { Menu, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import {
  EllipsisVerticalIcon,
  PauseCircleIcon,
  PlayCircleIcon,
  NoSymbolIcon,
} from '@heroicons/react/24/outline';
import { StatusChangeModal } from '../modals/StatusChangeModal';
import { StatusManagementService, UserWithRole } from '../../../services/statusManagementService';
import { Applicant, ApplicantStatus } from '../../../types/applicant';

interface StatusActionsProps {
  applicant: Applicant;
  user: UserWithRole;
  onStatusChange: () => void;
}

export const StatusActions: React.FC<StatusActionsProps> = ({
  applicant,
  user,
  onStatusChange,
}) => {
  const [showOnHoldModal, setShowOnHoldModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);

  const currentWorkflowStatus = applicant.currentStatus || ApplicantStatus.ACTIVE;
  const isOnHold = currentWorkflowStatus === ApplicantStatus.ON_HOLD;
  const isWithdrawn = currentWorkflowStatus === ApplicantStatus.WITHDRAWN;
  const isDeployed = currentWorkflowStatus === ApplicantStatus.DEPLOYED;

  // Can't change status if withdrawn or deployed (terminal states)
  const isTerminalState = isWithdrawn || isDeployed;

  const handlePutOnHold = async (reason: string) => {
    await StatusManagementService.setApplicantOnHold(applicant.id, reason, user);
    onStatusChange();
  };

  const handleMarkWithdrawn = async (reason: string) => {
    await StatusManagementService.markApplicantWithdrawn(applicant.id, reason, user);
    onStatusChange();
  };

  const handleResume = async () => {
    await StatusManagementService.resumeApplicant(applicant.id, user);
    onStatusChange();
  };

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex items-center justify-center w-full px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <EllipsisVerticalIcon className="w-5 h-5" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-100"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-75"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              {isOnHold ? (
                // Show Resume option when on hold
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setShowResumeModal(true)}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      <PlayCircleIcon className="mr-3 h-5 w-5 text-green-600" />
                      Resume Processing
                    </button>
                  )}
                </Menu.Item>
              ) : (
                // Show Put On Hold option when not on hold
                !isTerminalState && (
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={() => setShowOnHoldModal(true)}
                        className={`${
                          active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                        } group flex items-center w-full px-4 py-2 text-sm`}
                      >
                        <PauseCircleIcon className="mr-3 h-5 w-5 text-yellow-600" />
                        Put On Hold
                      </button>
                    )}
                  </Menu.Item>
                )
              )}

              {/* Mark as Withdrawn - only if not already in terminal state */}
              {!isTerminalState && (
                <Menu.Item>
                  {({ active }) => (
                    <button
                      onClick={() => setShowWithdrawModal(true)}
                      className={`${
                        active ? 'bg-gray-100 text-gray-900' : 'text-gray-700'
                      } group flex items-center w-full px-4 py-2 text-sm`}
                    >
                      <NoSymbolIcon className="mr-3 h-5 w-5 text-red-600" />
                      Mark as Withdrawn
                    </button>
                  )}
                </Menu.Item>
              )}

              {/* Show message if in terminal state */}
              {isTerminalState && (
                <div className="px-4 py-2 text-sm text-gray-500 italic">
                  No actions available for {isWithdrawn ? 'withdrawn' : 'deployed'} applicants
                </div>
              )}
            </div>
          </Menu.Items>
        </Transition>
      </Menu>

      {/* Put On Hold Modal */}
      <StatusChangeModal
        isOpen={showOnHoldModal}
        onClose={() => setShowOnHoldModal(false)}
        onConfirm={handlePutOnHold}
        title="Put Applicant On Hold"
        description="This will pause the applicant's recruitment process temporarily. You can resume it later."
        currentStatus={currentWorkflowStatus}
        targetStatus="On Hold"
        requireReason={true}
        isDestructive={false}
      />

      {/* Mark as Withdrawn Modal */}
      <StatusChangeModal
        isOpen={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onConfirm={handleMarkWithdrawn}
        title="Mark Applicant as Withdrawn"
        description="This will permanently mark the applicant as withdrawn. This action indicates the applicant has left the recruitment process."
        currentStatus={currentWorkflowStatus}
        targetStatus="Withdrawn"
        requireReason={true}
        isDestructive={true}
      />

      {/* Resume Processing Modal */}
      <StatusChangeModal
        isOpen={showResumeModal}
        onClose={() => setShowResumeModal(false)}
        onConfirm={handleResume}
        title="Resume Applicant Processing"
        description="This will resume the applicant's recruitment process and return them to active status."
        currentStatus={currentWorkflowStatus}
        targetStatus="Active"
        requireReason={false}
        isDestructive={false}
      />
    </>
  );
};
