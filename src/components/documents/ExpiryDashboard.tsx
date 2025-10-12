import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useExpiryDocuments } from '../../hooks/useExpiryDocuments';
import { PageTransition } from '../animation/PageTransition';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { AsyncBoundary } from '../performance/AsyncBoundary';
import { SelectField } from '../forms/fields/SelectField';
import { withPerformanceOptimizations } from '../../hocs/withPerformanceOptimizations';
import { useAnnouncer } from '../../hooks/useAnnouncer';

const filterOptions = [
  { value: 'all', label: 'All Documents' },
  { value: 'expiring_soon', label: 'Expiring Soon' },
  { value: 'expired', label: 'Expired' }
];

const ExpiryTable = withPerformanceOptimizations(
  ({ documents, onSendNotification }: any) => {
    const getStatusColor = (expiryDate: Date) => {
      const now = new Date();
      const diffDays = Math.ceil(
        (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (diffDays <= 0) return 'bg-red-100 text-red-800';
      if (diffDays <= 7) return 'bg-yellow-100 text-yellow-800';
      if (diffDays <= 30) return 'bg-blue-100 text-blue-800';
      return 'bg-green-100 text-green-800';
    };

    return (
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Document Type
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Applicant
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Expiry Date
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="relative px-6 py-3">
              <span className="sr-only">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {documents.map((doc: any) => (
            <tr key={doc.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {doc.type}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {doc.applicantName}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {doc.expiryDate.toLocaleDateString()}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.expiryDate)}`}>
                  {new Date() > doc.expiryDate ? 'Expired' : 'Active'}
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onSendNotification(doc.id)}
                  disabled={doc.notificationSent}
                  className={`text-indigo-600 hover:text-indigo-900 ${
                    doc.notificationSent ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {doc.notificationSent ? 'Notification Sent' : 'Send Notification'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  },
  { name: 'ExpiryTable' }
);

export const ExpiryDashboard: React.FC = () => {
  const { customClaims } = useAuth();
  const { announce } = useAnnouncer();
  const {
    documents,
    loading,
    error,
    filterStatus,
    setFilterStatus,
    sendNotification
  } = useExpiryDocuments(
    customClaims?.role === 'branch_manager' ? customClaims.branchId : null
  );

  const handleSendNotification = async (documentId: string) => {
    try {
      await sendNotification(documentId);
      announce('Notification sent successfully');
    } catch (err) {
      announce('Failed to send notification', 'assertive');
    }
  };

  return (
    <AsyncBoundary>
      <PageTransition isLoading={loading}>
        <div className="space-y-6">
          <Breadcrumbs />

          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">
                Document Expiry Dashboard
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                Monitor and manage document expiration dates and notifications.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error.message}</div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="mb-6">
                <SelectField
                  label="Filter by Status"
                  name="filterStatus"
                  options={filterOptions}
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value as any)}
                  register={() => ({})}
                />
              </div>

              <div className="mt-6">
                <div className="overflow-x-auto">
                  <ExpiryTable
                    documents={documents}
                    onSendNotification={handleSendNotification}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </PageTransition>
    </AsyncBoundary>
  );
};