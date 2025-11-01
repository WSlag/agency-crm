import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  title: string;
  description: string;
  currentStatus: string;
  targetStatus: string;
  requireReason?: boolean;
  isDestructive?: boolean;
}

export const StatusChangeModal: React.FC<StatusChangeModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  currentStatus,
  targetStatus,
  requireReason = true,
  isDestructive = false,
}) => {
  const [reason, setReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    if (requireReason && !reason.trim()) {
      setError('Reason is required');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      await onConfirm(reason.trim());
      setReason('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to update status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleClose = () => {
    if (!isProcessing) {
      setReason('');
      setError(null);
      onClose();
    }
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-start justify-between">
                  <div className="flex items-center">
                    {isDestructive && (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 mr-3">
                        <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
                      </div>
                    )}
                    <Dialog.Title
                      as="h3"
                      className="text-lg font-semibold leading-6 text-gray-900"
                    >
                      {title}
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={handleClose}
                    disabled={isProcessing}
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mt-4">
                  <p className="text-sm text-gray-500">{description}</p>

                  <div className="mt-4 flex items-center justify-between rounded-lg bg-gray-50 p-3">
                    <div>
                      <p className="text-xs text-gray-500">Current Status</p>
                      <p className="text-sm font-medium text-gray-900">{currentStatus}</p>
                    </div>
                    <div className="text-gray-400">→</div>
                    <div>
                      <p className="text-xs text-gray-500">New Status</p>
                      <p className="text-sm font-medium text-gray-900">{targetStatus}</p>
                    </div>
                  </div>

                  {requireReason && (
                    <div className="mt-4">
                      <label
                        htmlFor="reason"
                        className="block text-sm font-medium text-gray-700 mb-2"
                      >
                        Reason {requireReason && <span className="text-red-500">*</span>}
                      </label>
                      <textarea
                        id="reason"
                        rows={4}
                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="Please provide a reason for this status change..."
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        disabled={isProcessing}
                      />
                    </div>
                  )}

                  {error && (
                    <div className="mt-4 rounded-md bg-red-50 p-3">
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex gap-3">
                  <button
                    type="button"
                    className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleClose}
                    disabled={isProcessing}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                      isDestructive
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
                    }`}
                    onClick={handleConfirm}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Confirm'}
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
