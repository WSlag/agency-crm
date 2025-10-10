import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Document } from '../../../types/document';
import { DocumentPreview } from '../viewer/DocumentPreview';
import { VerificationChecklist } from './VerificationChecklist';
import { useDocumentStore } from '../../../stores/documentStore';
import { useAuth } from '../../../contexts/AuthContext';

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
  onSuccess?: () => void;
}

export const VerificationModal = ({
  isOpen,
  onClose,
  document,
  onSuccess,
}: VerificationModalProps) => {
  const { verifyDocument, rejectDocument } = useDocumentStore();
  const { user } = useAuth();

  const handleVerify = async (checklistItems: { id: string; checked: boolean; notes?: string }[]) => {
    if (!user) return;

    try {
      await verifyDocument({
        documentId: document.id,
        verifiedBy: user.uid,
        status: 'verified',
        notes: '',
        checklistItems,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to verify document:', error);
    }
  };

  const handleReject = async (reason: string) => {
    if (!user) return;

    try {
      await rejectDocument(document.id, reason);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Failed to reject document:', error);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full">
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-medium leading-6 text-gray-900 mb-4"
                    >
                      Document Verification
                    </Dialog.Title>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Document Preview */}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 mb-4">
                          Document Preview
                        </h4>
                        <DocumentPreview document={document} />
                      </div>

                      {/* Verification Checklist */}
                      <div>
                        <VerificationChecklist
                          document={document}
                          onVerify={handleVerify}
                          onReject={handleReject}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
