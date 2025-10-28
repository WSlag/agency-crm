import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  orderBy,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { firestore as db } from '../../config/firebase';
import { EmployerInquiry } from '../../types/resume';
import { useAuth } from '../../contexts/AuthContext';

export const EmployerInquiries: React.FC = () => {
  const { user } = useAuth();
  const [inquiries, setInquiries] = useState<EmployerInquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedInquiry, setSelectedInquiry] = useState<EmployerInquiry | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchInquiries();
  }, []);

  const fetchInquiries = async () => {
    setLoading(true);
    try {
      const inquiriesRef = collection(db, 'employer_inquiries');
      const q = query(inquiriesRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const inqs: EmployerInquiry[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        inqs.push({
          id: doc.id,
          applicantId: data.applicantId,
          applicantName: data.applicantName,
          inquiryType: data.inquiryType,
          employerName: data.employerName,
          companyName: data.companyName,
          email: data.email,
          phone: data.phone,
          country: data.country,
          message: data.message,
          status: data.status,
          createdAt: data.createdAt?.toDate(),
          resolvedAt: data.resolvedAt?.toDate(),
          resolvedBy: data.resolvedBy,
          notes: data.notes,
        });
      });

      setInquiries(inqs);
    } catch (error) {
      console.error('Error fetching inquiries:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (
    inquiryId: string,
    newStatus: 'new' | 'contacted' | 'resolved' | 'closed'
  ) => {
    try {
      const inquiryRef = doc(db, 'employer_inquiries', inquiryId);
      const updateData: any = {
        status: newStatus,
      };

      if (newStatus === 'resolved' || newStatus === 'closed') {
        updateData.resolvedAt = Timestamp.now();
        updateData.resolvedBy = user?.uid || 'unknown';
      }

      await updateDoc(inquiryRef, updateData);

      // Update local state
      setInquiries((prev) =>
        prev.map((inq) =>
          inq.id === inquiryId
            ? {
                ...inq,
                status: newStatus,
                resolvedAt:
                  newStatus === 'resolved' || newStatus === 'closed'
                    ? new Date()
                    : inq.resolvedAt,
                resolvedBy:
                  newStatus === 'resolved' || newStatus === 'closed'
                    ? user?.uid || 'unknown'
                    : inq.resolvedBy,
              }
            : inq
        )
      );

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev) =>
          prev
            ? {
                ...prev,
                status: newStatus,
                resolvedAt:
                  newStatus === 'resolved' || newStatus === 'closed'
                    ? new Date()
                    : prev.resolvedAt,
              }
            : null
        );
      }
    } catch (error) {
      console.error('Error updating inquiry status:', error);
      alert('Failed to update status. Please try again.');
    }
  };

  const handleAddNotes = async (inquiryId: string, notes: string) => {
    try {
      const inquiryRef = doc(db, 'employer_inquiries', inquiryId);
      await updateDoc(inquiryRef, { notes });

      setInquiries((prev) =>
        prev.map((inq) => (inq.id === inquiryId ? { ...inq, notes } : inq))
      );

      if (selectedInquiry?.id === inquiryId) {
        setSelectedInquiry((prev) => (prev ? { ...prev, notes } : null));
      }

      alert('Notes saved successfully!');
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Failed to save notes. Please try again.');
    }
  };

  const filteredInquiries = inquiries.filter((inq) => {
    if (filterStatus !== 'all' && inq.status !== filterStatus) return false;
    if (filterType !== 'all' && inq.inquiryType !== filterType) return false;
    return true;
  });

  const statusColors = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    resolved: 'bg-green-100 text-green-800',
    closed: 'bg-gray-100 text-gray-800',
  };

  const typeColors = {
    shortlist: 'bg-purple-100 text-purple-800',
    contact: 'bg-indigo-100 text-indigo-800',
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Employer Inquiries</h1>
        <p className="text-gray-600">
          Manage inquiries and leads from potential employers
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{inquiries.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg
                className="h-6 w-6 text-blue-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">New</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter((i) => i.status === 'new').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-100 rounded-lg p-3">
              <svg
                className="h-6 w-6 text-yellow-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter((i) => i.status === 'contacted').length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg
                className="h-6 w-6 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Resolved</p>
              <p className="text-2xl font-bold text-gray-900">
                {inquiries.filter((i) => i.status === 'resolved' || i.status === 'closed').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6 flex items-center space-x-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Status:</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="new">New</option>
            <option value="contacted">Contacted</option>
            <option value="resolved">Resolved</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mr-2">Type:</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All</option>
            <option value="shortlist">Shortlist</option>
            <option value="contact">Contact Request</option>
          </select>
        </div>

        <div className="flex-grow"></div>

        <button
          onClick={fetchInquiries}
          className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Refresh
        </button>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredInquiries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No inquiries found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Employer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inquiry.employerName}
                        </div>
                        <div className="text-sm text-gray-500">{inquiry.companyName}</div>
                        <div className="text-xs text-gray-400">{inquiry.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/applicants/${inquiry.applicantId}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {inquiry.applicantName}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded-full ${
                          typeColors[inquiry.inquiryType]
                        }`}
                      >
                        {inquiry.inquiryType === 'shortlist' ? 'Shortlist' : 'Contact'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select
                        value={inquiry.status}
                        onChange={(e) =>
                          handleStatusUpdate(
                            inquiry.id,
                            e.target.value as 'new' | 'contacted' | 'resolved' | 'closed'
                          )
                        }
                        className={`px-2 py-1 text-xs font-medium rounded-full border-0 ${
                          statusColors[inquiry.status]
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inquiry.createdAt.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => setSelectedInquiry(inquiry)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-white">Inquiry Details</h3>
              <button
                onClick={() => setSelectedInquiry(null)}
                className="text-white hover:text-gray-200"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Employer Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Employer Information</h4>
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Name:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedInquiry.employerName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Company:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedInquiry.companyName}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Email:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedInquiry.email}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Phone:</span>
                    <span className="text-sm font-medium text-gray-900">
                      {selectedInquiry.phone}
                    </span>
                  </div>
                  {selectedInquiry.country && (
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Country:</span>
                      <span className="text-sm font-medium text-gray-900">
                        {selectedInquiry.country}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Message */}
              {selectedInquiry.message && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-700 mb-2">Message</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-900">{selectedInquiry.message}</p>
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Internal Notes</h4>
                <textarea
                  defaultValue={selectedInquiry.notes || ''}
                  placeholder="Add internal notes..."
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  onBlur={(e) => {
                    if (e.target.value !== selectedInquiry.notes) {
                      handleAddNotes(selectedInquiry.id, e.target.value);
                    }
                  }}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Close
                </button>
                <a
                  href={`mailto:${selectedInquiry.email}`}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700"
                >
                  Email Employer
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
