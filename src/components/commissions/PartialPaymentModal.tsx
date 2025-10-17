import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Commission } from '../../types/commission';

interface PartialPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  commission: Commission;
  onPayment: (amount: number, paymentReference: string, notes: string) => Promise<void>;
}

export const PartialPaymentModal: React.FC<PartialPaymentModalProps> = ({
  isOpen,
  onClose,
  commission,
  onPayment,
}) => {
  const [amount, setAmount] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const amountPaid = commission.amountPaid || 0;
  const remaining = commission.amount - amountPaid;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const paymentAmount = parseFloat(amount);

    // Validation
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      setError('Please enter a valid payment amount');
      return;
    }

    if (paymentAmount > remaining) {
      setError(`Payment amount cannot exceed remaining balance of ₱${remaining.toLocaleString()}`);
      return;
    }

    try {
      setIsSubmitting(true);
      await onPayment(paymentAmount, paymentReference, notes);
      
      // Reset form
      setAmount('');
      setPaymentReference('');
      setNotes('');
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to record payment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayFull = () => {
    setAmount(remaining.toString());
  };

  const handlePayHalf = () => {
    setAmount((remaining / 2).toFixed(2));
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 pr-4 pt-4">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-emerald-100 sm:mx-0 sm:h-10 sm:w-10">
                    <CurrencyDollarIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left flex-1">
                    <Dialog.Title as="h3" className="text-xl font-bold leading-6 text-gray-900">
                      Record Partial Payment
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500">
                      Record a partial payment for this commission
                    </p>
                  </div>
                </div>

                {/* Payment Summary */}
                <div className="mt-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Total Amount:</span>
                      <span className="text-lg font-bold text-gray-900">
                        ₱{commission.amount.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">Already Paid:</span>
                      <span className="text-lg font-semibold text-green-600">
                        ₱{amountPaid.toLocaleString()}
                      </span>
                    </div>
                    <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-gray-900">Remaining Balance:</span>
                      <span className="text-2xl font-bold text-indigo-600">
                        ₱{remaining.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {/* Payment Amount */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-semibold text-gray-700 mb-1">
                      Payment Amount <span className="text-red-500">*</span>
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 sm:text-sm">₱</span>
                      </div>
                      <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="block w-full rounded-lg border-2 border-gray-300 pl-8 pr-12 py-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        max={remaining}
                        required
                      />
                    </div>
                    
                    {/* Quick Amount Buttons */}
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={handlePayHalf}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        Pay Half (₱{(remaining / 2).toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={handlePayFull}
                        className="flex-1 px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        Pay Full (₱{remaining.toLocaleString()})
                      </button>
                    </div>
                  </div>

                  {/* Payment Reference */}
                  <div>
                    <label htmlFor="paymentReference" className="block text-sm font-semibold text-gray-700 mb-1">
                      Payment Reference / Receipt No.
                    </label>
                    <input
                      type="text"
                      id="paymentReference"
                      value={paymentReference}
                      onChange={(e) => setPaymentReference(e.target.value)}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="OR-12345 or Check #123"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label htmlFor="notes" className="block text-sm font-semibold text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      id="notes"
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="block w-full rounded-lg border-2 border-gray-300 px-4 py-3 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Additional notes about this payment..."
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="rounded-lg bg-red-50 border-2 border-red-200 p-3">
                      <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !amount}
                      className="flex-1 inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-emerald-600 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-5 w-5 mr-2" />
                          Record Payment
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

