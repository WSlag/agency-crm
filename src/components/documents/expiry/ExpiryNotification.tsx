import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Document } from '../../../types/document';

interface ExpiryNotificationProps {
  document: Document;
  onRenew?: () => void;
}

export const ExpiryNotification = ({
  document,
  onRenew,
}: ExpiryNotificationProps) => {
  if (!document.expiryDate) return null;

  const expiryDate = new Date(document.expiryDate);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  const isExpired = daysUntilExpiry <= 0;
  const isExpiringSoon = daysUntilExpiry <= 30;

  if (!isExpired && !isExpiringSoon) return null;

  return (
    <div
      className={`rounded-md p-4 ${
        isExpired ? 'bg-red-50' : 'bg-yellow-50'
      }`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon
            className={`h-5 w-5 ${
              isExpired ? 'text-red-400' : 'text-yellow-400'
            }`}
            aria-hidden="true"
          />
        </div>
        <div className="ml-3">
          <h3
            className={`text-sm font-medium ${
              isExpired ? 'text-red-800' : 'text-yellow-800'
            }`}
          >
            {isExpired
              ? 'Document has expired'
              : `Document expires in ${daysUntilExpiry} days`}
          </h3>
          <div className="mt-2 text-sm text-gray-700">
            <p>
              {isExpired
                ? `This document expired on ${expiryDate.toLocaleDateString()}`
                : `This document will expire on ${expiryDate.toLocaleDateString()}`}
              . Please ensure to renew it before expiry to maintain compliance.
            </p>
          </div>
          {onRenew && (
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <button
                  type="button"
                  onClick={onRenew}
                  className={`rounded-md px-2 py-1.5 text-sm font-medium ${
                    isExpired
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                >
                  Renew Document
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
