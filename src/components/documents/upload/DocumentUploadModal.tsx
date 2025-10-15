import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { DocumentUploadForm } from './DocumentUploadForm';
import { DocumentType, DOCUMENT_TYPE_LABELS } from '../../../types/document';

interface DocumentUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicantId: string;
  documentType?: DocumentType; // Make it optional
  onSuccess?: () => void;
}

export const DocumentUploadModal = ({
  isOpen,
  onClose,
  applicantId,
  documentType,
  onSuccess,
}: DocumentUploadModalProps) => {
  const [selectedType, setSelectedType] = useState<DocumentType | null>(documentType || null);
  
  const handleSuccess = () => {
    onSuccess?.();
    onClose();
    setSelectedType(null);
  };
  
  const handleClose = () => {
    onClose();
    setSelectedType(null);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <button
                  type="button"
                  className="absolute top-6 right-6 text-gray-400 hover:text-gray-500"
                  onClick={handleClose}
                >
                  <span className="sr-only">Close</span>
                  <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                </button>
                
                <div className="mt-3 text-center sm:mt-0 sm:text-left">
                  {!selectedType ? (
                    // Document Type Selection
                    <div>
                      <Dialog.Title
                        as="h3"
                        className="text-lg font-medium leading-6 text-gray-900 mb-4"
                      >
                        Select Document Type
                      </Dialog.Title>
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        {(Object.keys(DOCUMENT_TYPE_LABELS) as DocumentType[]).map((type) => (
                          <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className="px-4 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-indigo-500 transition-colors text-left"
                          >
                            {DOCUMENT_TYPE_LABELS[type]}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    // Document Upload Form
                    <div>
                      {documentType ? null : (
                        <button
                          onClick={() => setSelectedType(null)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 mb-4"
                        >
                          ← Change Document Type
                        </button>
                      )}
                      <DocumentUploadForm
                        applicantId={applicantId}
                        documentType={selectedType}
                        onSuccess={handleSuccess}
                        onCancel={handleClose}
                      />
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
