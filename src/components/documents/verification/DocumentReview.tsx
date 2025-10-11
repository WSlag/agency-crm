import React, { useState } from 'react';
import { Document } from '../../../types/entities/document';

interface VerificationResult {
  status: 'verified' | 'rejected';
  comments: string;
  metadata?: Record<string, any>;
}

interface DocumentReviewProps {
  document: Document;
  onVerify: (result: VerificationResult) => Promise<void>;
  onReject: (reason: string) => Promise<void>;
}

export const DocumentReview: React.FC<DocumentReviewProps> = ({
  document,
  onVerify,
  onReject,
}) => {
  const [comments, setComments] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleVerify = async () => {
    try {
      setIsProcessing(true);
      await onVerify({
        status: 'verified',
        comments,
        metadata: {
          verifiedAt: new Date().toISOString(),
        },
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    try {
      setIsProcessing(true);
      await onReject(comments);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Document Review
        </h3>
        
        <div className="mt-5">
          <div className="rounded-md bg-gray-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 0v12h8V4H6z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-gray-800">
                  {document.type}
                </h3>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Applicant ID: {document.applicantId}</p>
                  <p>Status: {document.verificationStatus}</p>
                  {document.expiryDate && (
                    <p>Expires: {new Date(document.expiryDate).toLocaleDateString()}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5">
            <label htmlFor="comments" className="block text-sm font-medium text-gray-700">
              Review Comments
            </label>
            <div className="mt-1">
              <textarea
                id="comments"
                rows={4}
                className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                value={comments}
                onChange={(e) => setComments(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-5 space-x-4">
            <button
              type="button"
              onClick={handleVerify}
              disabled={isProcessing || !comments}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              {isProcessing ? 'Processing...' : 'Verify Document'}
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={isProcessing || !comments}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              {isProcessing ? 'Processing...' : 'Reject Document'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
