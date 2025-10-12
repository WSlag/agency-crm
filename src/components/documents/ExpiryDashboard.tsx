import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { notificationService } from '../../services/NotificationService';
import { useAuth } from '../../contexts/AuthContext';
import { PageTransition } from '../animation/PageTransition';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { SelectField } from '../forms/fields/SelectField';
import OptimizedImage from '../common/OptimizedImage';

interface Document {
  id: string;
  type: string;
  expiryDate: Date;
  status: 'valid' | 'expiring' | 'expired';
  applicantId: string;
  applicantName: string;
  documentUrl: string;
  notificationSent: boolean;
}

const EXPIRY_THRESHOLDS = {
  warning: 30, // days before expiry to show warning
  critical: 7  // days before expiry to show critical warning
};

export const ExpiryDashboard: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const { customClaims } = useAuth();

  const filterOptions = [
    { value: 'all', label: 'All Documents' },
    { value: 'valid', label: 'Valid' },
    { value: 'expiring', label: 'Expiring Soon' },
    { value: 'expired', label: 'Expired' }
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const documentsRef = collection(firestore, 'documents');
        let q = query(documentsRef, orderBy('expiryDate', 'asc'));

        if (filter !== 'all') {
          q = query(documentsRef, where('status', '==', filter), orderBy('expiryDate', 'asc'));
        }

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          expiryDate: doc.data().expiryDate.toDate()
        })) as Document[];

        setDocuments(docs);
        setError(null);
      } catch (err) {
        console.error('Error fetching documents:', err);
        setError('Failed to load documents');
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, [filter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'expired':
        return 'bg-red-100 text-red-800';
      case 'expiring':
        return 'bg-yellow-100 text-yellow-800';
      case 'valid':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleNotificationSend = async (documentId: string) => {
    try {
      const doc = documents.find(d => d.id === documentId);
      if (!doc) return;

      await notificationService.sendNotification({
        userId: doc.applicantId,
        title: 'Document Expiry Notice',
        message: `Your ${doc.type} will expire on ${doc.expiryDate.toLocaleDateString()}. Please take necessary action.`,
        type: 'expiry',
        priority: 'high',
        channels: ['email', 'push', 'in-app'],
        data: {
          documentId: doc.id,
          documentType: doc.type,
          expiryDate: doc.expiryDate.toISOString()
        }
      });

      // Update local state to show notification sent
      setDocuments(docs =>
        docs.map(d =>
          d.id === documentId
            ? { ...d, notificationSent: true }
            : d
        )
      );
    } catch (err) {
      console.error('Error sending notification:', err);
      // Show error to user
      setError(err instanceof Error ? err.message : 'Failed to send notification');
    }
  };

  return (
    <ErrorBoundary>
      <PageTransition isLoading={loading}>
        <div className="space-y-6">
          <Breadcrumbs />
          
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Document Expiry Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700">
                Monitor and manage document expiration dates and notifications.
              </p>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="max-w-xs mb-6">
                <SelectField
                  name="filter"
                  label="Filter by Status"
                  value={filter}
                  onChange={setFilter}
                  options={filterOptions}
                />
              </div>

              {error && (
                <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
                  {error}
                </div>
              )}

              <div className="mt-4">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Expiry Date
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <OptimizedImage
                                  src={doc.documentUrl}
                                  alt={doc.type}
                                  className="h-10 w-10 rounded-md object-cover"
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {doc.type}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doc.applicantName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {doc.expiryDate.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleNotificationSend(doc.id)}
                              disabled={doc.notificationSent}
                              className={`inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md ${
                                doc.notificationSent
                                  ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                                  : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'
                              }`}
                            >
                              {doc.notificationSent ? 'Notification Sent' : 'Send Notification'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
    </div>
      </PageTransition>
    </ErrorBoundary>
  );
};