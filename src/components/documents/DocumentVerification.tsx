import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, updateDoc, doc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { PageTransition } from '../animation/PageTransition';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { SelectField } from '../forms/fields/SelectField';
import { TextField } from '../forms/fields/TextField';
import OptimizedImage from '../common/OptimizedImage';

interface Document {
  id: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected';
  applicantId: string;
  applicantName: string;
  documentUrl: string;
  submittedAt: Date;
  verifiedAt?: Date;
  verifiedBy?: string;
  comments?: string;
}

export const DocumentVerification: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('pending');
  const [comment, setComment] = useState('');
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const { user, customClaims } = useAuth();

  const filterOptions = [
    { value: 'pending', label: 'Pending Verification' },
    { value: 'verified', label: 'Verified' },
    { value: 'rejected', label: 'Rejected' }
  ];

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const documentsRef = collection(firestore, 'documents');
        let q = query(
          documentsRef,
          where('status', '==', filter),
          orderBy('submittedAt', 'desc')
        );

        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt.toDate(),
          verifiedAt: doc.data().verifiedAt?.toDate()
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

  const handleVerification = async (documentId: string, status: 'verified' | 'rejected') => {
    if (!user) return;

    try {
      const docRef = doc(firestore, 'documents', documentId);
      await updateDoc(docRef, {
        status,
        verifiedAt: new Date(),
        verifiedBy: user.uid,
        comments: comment || undefined
      });

      // Update local state
      setDocuments(docs =>
        docs.map(doc =>
          doc.id === documentId
            ? {
                ...doc,
                status,
                verifiedAt: new Date(),
                verifiedBy: user.uid,
                comments: comment
              }
            : doc
        )
      );

      setComment('');
      setSelectedDoc(null);
    } catch (err) {
      console.error('Error updating document:', err);
      setError('Failed to update document status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'verified':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <ErrorBoundary>
      <PageTransition isLoading={loading}>
        <div className="space-y-6">
          <Breadcrumbs />
          
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-xl font-semibold text-gray-900">Document Verification</h1>
              <p className="mt-2 text-sm text-gray-700">
                Verify and manage submitted documents.
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
                          Submitted
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
                              {doc.submittedAt.toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(doc.status)}`}>
                              {doc.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {doc.status === 'pending' && (
                              <div className="flex items-center space-x-2">
                                {selectedDoc === doc.id && (
                                  <TextField
                                    name="comment"
                                    label=""
                                    value={comment}
                                    onChange={setComment}
                                    placeholder="Add comment..."
                                    className="w-48"
                                  />
                                )}
                                <button
                                  onClick={() => {
                                    if (selectedDoc === doc.id) {
                                      handleVerification(doc.id, 'verified');
                                    } else {
                                      setSelectedDoc(doc.id);
                                      setComment('');
                                    }
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
                                >
                                  Verify
                                </button>
                                <button
                                  onClick={() => {
                                    if (selectedDoc === doc.id) {
                                      handleVerification(doc.id, 'rejected');
                                    } else {
                                      setSelectedDoc(doc.id);
                                      setComment('');
                                    }
                                  }}
                                  className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                                >
                                  Reject
                                </button>
                              </div>
                            )}
                            {doc.status !== 'pending' && doc.comments && (
                              <div className="text-sm text-gray-500">
                                {doc.comments}
                              </div>
                            )}
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