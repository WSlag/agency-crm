import { useState } from 'react';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { Document, DOCUMENT_CONFIG } from '../../../types/document';

interface VerificationChecklistProps {
  document: Document;
  onVerify: (checklistItems: { id: string; checked: boolean; notes?: string }[]) => void;
  onReject: (reason: string) => void;
}

export const VerificationChecklist = ({
  document,
  onVerify,
  onReject,
}: VerificationChecklistProps) => {
  const config = DOCUMENT_CONFIG[document.documentType];
  const [checklist, setChecklist] = useState(
    config.verificationChecklist.map((item, index) => ({
      id: `checklist-${index}`,
      name: item,
      checked: false,
      notes: '',
    }))
  );
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectionForm, setShowRejectionForm] = useState(false);

  const handleChecklistChange = (index: number, checked: boolean) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, checked } : item
      )
    );
  };

  const handleNotesChange = (index: number, notes: string) => {
    setChecklist((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, notes } : item
      )
    );
  };

  const handleVerify = () => {
    onVerify(
      checklist.map(({ id, checked, notes }) => ({
        id,
        checked,
        notes,
      }))
    );
  };

  const handleReject = () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a reason for rejection');
      return;
    }
    onReject(rejectionReason);
  };

  const allChecked = checklist.every((item) => item.checked);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Document Verification Checklist
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          Please verify all items before approving the document
        </p>
      </div>

      <div className="space-y-4">
        {checklist.map((item, index) => (
          <div key={item.id} className="border-b border-gray-200 pb-4">
            <div className="flex items-start">
              <div className="flex h-5 items-center">
                <input
                  type="checkbox"
                  checked={item.checked}
                  onChange={(e) => handleChecklistChange(index, e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
              </div>
              <div className="ml-3">
                <label className="text-sm font-medium text-gray-700">
                  {item.name}
                </label>
                <div className="mt-2">
                  <textarea
                    value={item.notes}
                    onChange={(e) => handleNotesChange(index, e.target.value)}
                    placeholder="Add notes (optional)"
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                    rows={2}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {!showRejectionForm ? (
        <div className="flex space-x-3">
          <button
            type="button"
            onClick={handleVerify}
            disabled={!allChecked}
            className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50"
          >
            <CheckIcon className="h-4 w-4 mr-1.5" />
            Verify Document
          </button>
          <button
            type="button"
            onClick={() => setShowRejectionForm(true)}
            className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          >
            <XMarkIcon className="h-4 w-4 mr-1.5" />
            Reject Document
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label
              htmlFor="rejectionReason"
              className="block text-sm font-medium text-gray-700"
            >
              Rejection Reason
            </label>
            <div className="mt-1">
              <textarea
                id="rejectionReason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                placeholder="Please provide a reason for rejecting this document..."
              />
            </div>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleReject}
              className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              onClick={() => setShowRejectionForm(false)}
              className="inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
