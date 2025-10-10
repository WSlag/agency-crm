import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  DocumentIcon,
  CalendarIcon,
  TagIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import { Document } from '../../../types/document';
import { DocumentPreview } from './DocumentPreview';

interface DocumentViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: Document;
}

export const DocumentViewerModal = ({
  isOpen,
  onClose,
  document,
}: DocumentViewerModalProps) => {
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:p-6">
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
                      {document.fileName}
                    </Dialog.Title>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Document Preview */}
                      <div className="md:col-span-2">
                        <DocumentPreview document={document} />
                      </div>

                      {/* Document Details */}
                      <div className="space-y-6">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900">
                            Document Information
                          </h4>
                          <dl className="mt-2 space-y-4">
                            <div>
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <DocumentIcon className="h-4 w-4 mr-1" />
                                Type
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {document.documentType
                                  .split('_')
                                  .map(
                                    (word) =>
                                      word.charAt(0).toUpperCase() + word.slice(1)
                                  )
                                  .join(' ')}
                              </dd>
                            </div>

                            <div>
                              <dt className="text-sm font-medium text-gray-500 flex items-center">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                Upload Date
                              </dt>
                              <dd className="mt-1 text-sm text-gray-900">
                                {new Date(document.uploadDate).toLocaleDateString()}
                              </dd>
                            </div>

                            {document.expiryDate && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  Expiry Date
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {new Date(
                                    document.expiryDate
                                  ).toLocaleDateString()}
                                </dd>
                              </div>
                            )}

                            {document.verifiedBy && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <UserIcon className="h-4 w-4 mr-1" />
                                  Verified By
                                </dt>
                                <dd className="mt-1 text-sm text-gray-900">
                                  {document.verifiedBy}
                                  {document.verifiedAt && (
                                    <span className="text-gray-500">
                                      {' '}
                                      on{' '}
                                      {new Date(
                                        document.verifiedAt
                                      ).toLocaleDateString()}
                                    </span>
                                  )}
                                </dd>
                              </div>
                            )}

                            {document.tags && document.tags.length > 0 && (
                              <div>
                                <dt className="text-sm font-medium text-gray-500 flex items-center">
                                  <TagIcon className="h-4 w-4 mr-1" />
                                  Tags
                                </dt>
                                <dd className="mt-1">
                                  <div className="flex flex-wrap gap-2">
                                    {document.tags.map((tag) => (
                                      <span
                                        key={tag}
                                        className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                      >
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>

                        {/* Metadata */}
                        {Object.keys(document.metadata).length > 0 && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Additional Information
                            </h4>
                            <dl className="mt-2 space-y-4">
                              {Object.entries(document.metadata).map(
                                ([key, value]) =>
                                  value && (
                                    <div key={key}>
                                      <dt className="text-sm font-medium text-gray-500">
                                        {key
                                          .split(/(?=[A-Z])/)
                                          .map(
                                            (word) =>
                                              word.charAt(0).toUpperCase() +
                                              word.slice(1)
                                          )
                                          .join(' ')}
                                      </dt>
                                      <dd className="mt-1 text-sm text-gray-900">
                                        {value instanceof Date
                                          ? value.toLocaleDateString()
                                          : value.toString()}
                                      </dd>
                                    </div>
                                  )
                              )}
                            </dl>
                          </div>
                        )}

                        {/* Notes */}
                        {document.notes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">
                              Notes
                            </h4>
                            <p className="mt-2 text-sm text-gray-500">
                              {document.notes}
                            </p>
                          </div>
                        )}
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
