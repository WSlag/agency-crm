import React, { useState } from 'react';
import { Document } from '../../../types/entities/document';
import { UserProfile } from '../../../types/auth';

interface VerificationDashboardProps {
  documents: Document[];
  verifiers: UserProfile[];
  onAssign: (docId: string, verifierId: string) => Promise<void>;
}

export const VerificationDashboard: React.FC<VerificationDashboardProps> = ({
  documents,
  verifiers,
  onAssign,
}) => {
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);

  const handleAssign = async (docId: string, verifierId: string) => {
    try {
      setIsAssigning(true);
      await onAssign(docId, verifierId);
      setSelectedDocument(null);
    } catch (error) {
      console.error('Failed to assign document:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="py-6">
        <h1 className="text-2xl font-semibold text-gray-900">Document Verification Dashboard</h1>
        
        <div className="mt-6">
          <div className="flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Document Type
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Applicant
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Assigned To
                        </th>
                        <th scope="col" className="relative px-6 py-3">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {documents.map((doc) => (
                        <tr key={doc.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doc.type}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              doc.verificationStatus === 'verified' ? 'bg-green-100 text-green-800' :
                              doc.verificationStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }`}>
                              {doc.verificationStatus}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">{doc.applicantId}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {doc.verifiedBy ? (
                              <div className="text-sm text-gray-900">
                                {verifiers.find(v => v.id === doc.verifiedBy)?.displayName || 'Unknown'}
                              </div>
                            ) : (
                              <select
                                disabled={isAssigning || selectedDocument === doc.id}
                                onChange={(e) => handleAssign(doc.id, e.target.value)}
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              >
                                <option value="">Assign verifier...</option>
                                {verifiers.map((verifier) => (
                                  <option key={verifier.id} value={verifier.id}>
                                    {verifier.displayName}
                                  </option>
                                ))}
                              </select>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setSelectedDocument(doc.id)}
                              className="text-indigo-600 hover:text-indigo-900"
                            >
                              View Details
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
      </div>
    </div>
  );
};
