import React, { useEffect, useState } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  updateDoc,
  doc,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firestore as db, storage } from '../../config/firebase';
import { Applicant } from '../../types/applicant';
import { useAuth } from '../../contexts/AuthContext';
import {
  getMissingPhotos,
  notifyResumeApproved,
  notifyResumeRejected,
} from '../../utils/resumeApprovalHelpers';

type TabType = 'pending' | 'approved' | 'rejected' | 'needs_photos';

export const ResumeManagementEnhanced: React.FC = () => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('pending');
  const [selectedApplicants, setSelectedApplicants] = useState<Set<string>>(new Set());
  const [rejectingApplicant, setRejectingApplicant] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchMedicalPassedApplicants();
  }, []);

  const fetchMedicalPassedApplicants = async () => {
    setLoading(true);
    try {
      const applicantsRef = collection(db, 'applicants');
      const q = query(
        applicantsRef,
        where('medicalStatus.examination.result', '==', 'passed'),
        where('status', '==', 'active')
      );

      const querySnapshot = await getDocs(q);
      const apps: Applicant[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        apps.push({
          id: doc.id,
          ...data,
          dateOfBirth: data.dateOfBirth?.toDate(),
          createdAt: data.createdAt?.toDate(),
          updatedAt: data.updatedAt?.toDate(),
          transferredDate: data.transferredDate?.toDate(),
          stageEnteredAt: data.stageEnteredAt?.toDate(),
          stageCompletedAt: data.stageCompletedAt?.toDate(),
          approvedAt: data.approvedAt?.toDate(),
          resumeApprovedAt: data.resumeApprovedAt?.toDate(),
          medicalStatus: {
            ...data.medicalStatus,
            examination: {
              ...data.medicalStatus.examination,
              date: data.medicalStatus.examination.date?.toDate() || null,
            },
            vaccinations: data.medicalStatus.vaccinations?.map((v: any) => ({
              ...v,
              date: v.date?.toDate(),
            })) || [],
          },
          workExperience: data.workExperience?.map((exp: any) => ({
            ...exp,
            startDate: exp.startDate?.toDate(),
            endDate: exp.endDate?.toDate() || null,
          })) || [],
          deployment: {
            ...data.deployment,
            startDate: data.deployment?.startDate?.toDate() || null,
            endDate: data.deployment?.endDate?.toDate() || null,
          },
        } as Applicant);
      });

      setApplicants(apps);
    } catch (error) {
      console.error('Error fetching applicants:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (applicantId: string) => {
    try {
      const applicantRef = doc(db, 'applicants', applicantId);
      await updateDoc(applicantRef, {
        resumeApprovalStatus: 'approved',
        resumeVisible: true,
        resumeApprovedBy: user?.uid || null,
        resumeApprovedAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      // Find applicant for notification
      const applicant = applicants.find(a => a.id === applicantId);
      if (applicant && user?.uid) {
        await notifyResumeApproved(applicant, user.uid);
      }

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId
            ? {
                ...app,
                resumeApprovalStatus: 'approved',
                resumeVisible: true,
                resumeApprovedBy: user?.uid || null,
                resumeApprovedAt: new Date(),
              }
            : app
        )
      );

      alert('Resume approved and is now visible on the employer portal!');
    } catch (error) {
      console.error('Error approving resume:', error);
      alert('Failed to approve resume. Please try again.');
    }
  };

  const handleReject = async (applicantId: string, reason: string) => {
    if (!reason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    try {
      const applicantRef = doc(db, 'applicants', applicantId);
      await updateDoc(applicantRef, {
        resumeApprovalStatus: 'rejected',
        resumeVisible: false,
        resumeApprovedBy: user?.uid || null,
        resumeApprovedAt: Timestamp.now(),
        resumeRejectionReason: reason,
        updatedAt: Timestamp.now(),
      });

      // Find applicant for notification
      const applicant = applicants.find(a => a.id === applicantId);
      if (applicant && user?.uid) {
        await notifyResumeRejected(applicant, user.uid, reason);
      }

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId
            ? {
                ...app,
                resumeApprovalStatus: 'rejected',
                resumeVisible: false,
                resumeApprovedBy: user?.uid || null,
                resumeApprovedAt: new Date(),
                resumeRejectionReason: reason,
              }
            : app
        )
      );

      setRejectingApplicant(null);
      setRejectionReason('');
      alert('Resume rejected');
    } catch (error) {
      console.error('Error rejecting resume:', error);
      alert('Failed to reject resume. Please try again.');
    }
  };

  const handleBulkApprove = async () => {
    if (selectedApplicants.size === 0) {
      alert('Please select at least one applicant');
      return;
    }

    if (!confirm(`Are you sure you want to approve ${selectedApplicants.size} applicant(s)?`)) {
      return;
    }

    try {
      const promises = Array.from(selectedApplicants).map((id) => handleApprove(id));
      await Promise.all(promises);
      setSelectedApplicants(new Set());
      alert(`Successfully approved ${selectedApplicants.size} applicant(s)`);
    } catch (error) {
      console.error('Error bulk approving:', error);
      alert('Some approvals failed. Please check and try again.');
    }
  };

  const toggleSelectApplicant = (applicantId: string) => {
    const newSelected = new Set(selectedApplicants);
    if (newSelected.has(applicantId)) {
      newSelected.delete(applicantId);
    } else {
      newSelected.add(applicantId);
    }
    setSelectedApplicants(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedApplicants.size === filteredByTab.length) {
      setSelectedApplicants(new Set());
    } else {
      setSelectedApplicants(new Set(filteredByTab.map((a) => a.id)));
    }
  };

  const handleFileUpload = async (
    applicantId: string,
    file: File,
    fieldName: 'photoUrl' | 'fullBodyPhotoUrl' | 'passportCopyUrl'
  ) => {
    setUploading(applicantId + fieldName);
    try {
      // Create storage reference
      const storageRef = ref(storage, `resumes/${applicantId}/${fieldName}_${Date.now()}`);

      // Upload file
      await uploadBytes(storageRef, file);

      // Get download URL
      const downloadURL = await getDownloadURL(storageRef);

      // Update Firestore
      const applicantRef = doc(db, 'applicants', applicantId);
      await updateDoc(applicantRef, {
        [fieldName]: downloadURL,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId ? { ...app, [fieldName]: downloadURL } : app
        )
      );

      alert('Photo uploaded successfully!');
      // Refresh to check if applicant is now ready
      fetchMedicalPassedApplicants();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  // Filter by search term
  const filteredApplicants = applicants.filter((app) =>
    app.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter by tab
  const filteredByTab = filteredApplicants.filter((app) => {
    switch (activeTab) {
      case 'pending':
        return app.resumeApprovalStatus === 'pending';
      case 'approved':
        return app.resumeApprovalStatus === 'approved';
      case 'rejected':
        return app.resumeApprovalStatus === 'rejected';
      case 'needs_photos':
        const missingPhotos = getMissingPhotos(app);
        return missingPhotos.length > 0;
      default:
        return true;
    }
  });

  const pendingCount = applicants.filter((a) => a.resumeApprovalStatus === 'pending').length;
  const approvedCount = applicants.filter((a) => a.resumeApprovalStatus === 'approved').length;
  const rejectedCount = applicants.filter((a) => a.resumeApprovalStatus === 'rejected').length;
  const needsPhotosCount = applicants.filter((a) => getMissingPhotos(a).length > 0).length;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Management</h1>
        <p className="text-gray-600">
          Review and approve applicants for the public employer portal
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('pending')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'pending'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Pending Approval
            {pendingCount > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-600 py-0.5 px-2 rounded-full text-xs">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('approved')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'approved'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Approved
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {approvedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('rejected')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'rejected'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Rejected
            <span className="ml-2 bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
              {rejectedCount}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('needs_photos')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'needs_photos'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Needs Photos
            {needsPhotosCount > 0 && (
              <span className="ml-2 bg-orange-100 text-orange-600 py-0.5 px-2 rounded-full text-xs">
                {needsPhotosCount}
              </span>
            )}
          </button>
        </nav>
      </div>

      {/* Search and Actions */}
      <div className="mb-6 flex items-center justify-between">
        <div className="relative max-w-md flex-1">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {activeTab === 'pending' && selectedApplicants.size > 0 && (
          <button
            onClick={handleBulkApprove}
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Approve Selected ({selectedApplicants.size})
          </button>
        )}
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredByTab.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">
              {activeTab === 'pending' && 'No applicants pending approval'}
              {activeTab === 'approved' && 'No approved applicants'}
              {activeTab === 'rejected' && 'No rejected applicants'}
              {activeTab === 'needs_photos' && 'No applicants need photos'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {activeTab === 'pending' && (
                    <th className="px-6 py-3 text-left">
                      <input
                        type="checkbox"
                        checked={selectedApplicants.size === filteredByTab.length}
                        onChange={toggleSelectAll}
                        className="rounded border-gray-300"
                      />
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photos
                  </th>
                  {activeTab === 'rejected' && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rejection Reason
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredByTab.map((applicant) => (
                  <tr key={applicant.id}>
                    {activeTab === 'pending' && (
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedApplicants.has(applicant.id)}
                          onChange={() => toggleSelectApplicant(applicant.id)}
                          className="rounded border-gray-300"
                        />
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {applicant.photoUrl ? (
                          <img
                            src={applicant.photoUrl}
                            alt={applicant.fullName}
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                            <svg
                              className="h-6 w-6 text-gray-500"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {applicant.fullName}
                          </div>
                          <div className="text-sm text-gray-500">{applicant.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {applicant.positionApplied || 'N/A'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {applicant.countryDestination || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {/* 2x2 Photo */}
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-20">2x2 Photo:</label>
                          {applicant.photoUrl ? (
                            <span className="text-xs text-green-600">✓ Uploaded</span>
                          ) : activeTab === 'needs_photos' ? (
                            <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                              Upload
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleFileUpload(applicant.id, file, 'photoUrl');
                                }}
                                disabled={uploading === applicant.id + 'photoUrl'}
                              />
                            </label>
                          ) : (
                            <span className="text-xs text-red-600">✗ Missing</span>
                          )}
                        </div>

                        {/* Full Body Photo */}
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-20">Full Body:</label>
                          {applicant.fullBodyPhotoUrl ? (
                            <span className="text-xs text-green-600">✓ Uploaded</span>
                          ) : activeTab === 'needs_photos' ? (
                            <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                              Upload
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file)
                                    handleFileUpload(applicant.id, file, 'fullBodyPhotoUrl');
                                }}
                                disabled={uploading === applicant.id + 'fullBodyPhotoUrl'}
                              />
                            </label>
                          ) : (
                            <span className="text-xs text-red-600">✗ Missing</span>
                          )}
                        </div>

                        {/* Passport Copy */}
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-20">Passport:</label>
                          {applicant.passportCopyUrl ? (
                            <span className="text-xs text-green-600">✓ Uploaded</span>
                          ) : activeTab === 'needs_photos' ? (
                            <label className="cursor-pointer text-xs text-blue-600 hover:text-blue-800">
                              Upload
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*,application/pdf"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file)
                                    handleFileUpload(applicant.id, file, 'passportCopyUrl');
                                }}
                                disabled={uploading === applicant.id + 'passportCopyUrl'}
                              />
                            </label>
                          ) : (
                            <span className="text-xs text-red-600">✗ Missing</span>
                          )}
                        </div>
                      </div>
                    </td>
                    {activeTab === 'rejected' && (
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {applicant.resumeRejectionReason || 'No reason provided'}
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 whitespace-nowrap text-sm space-y-2">
                      {activeTab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(applicant.id)}
                            className="block w-full px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => setRejectingApplicant(applicant.id)}
                            className="block w-full px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {activeTab === 'approved' && (
                        <span className="text-green-600 font-medium">✓ Approved</span>
                      )}
                      {activeTab === 'rejected' && (
                        <button
                          onClick={() => {
                            // Reset to pending for re-review
                            const applicantRef = doc(db, 'applicants', applicant.id);
                            updateDoc(applicantRef, {
                              resumeApprovalStatus: 'pending',
                              resumeRejectionReason: null,
                            });
                            fetchMedicalPassedApplicants();
                          }}
                          className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                          Re-review
                        </button>
                      )}
                      <a
                        href={`/applicants/${applicant.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-blue-600 hover:text-blue-800"
                      >
                        View Profile
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingApplicant && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-bold mb-4">Reject Resume</h3>
            <p className="text-gray-600 mb-4">
              Please provide a reason for rejecting this applicant's resume:
            </p>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full border border-gray-300 rounded-lg p-2 mb-4"
              rows={4}
              placeholder="Enter rejection reason..."
            />
            <div className="flex space-x-3">
              <button
                onClick={() => handleReject(rejectingApplicant, rejectionReason)}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Confirm Rejection
              </button>
              <button
                onClick={() => {
                  setRejectingApplicant(null);
                  setRejectionReason('');
                }}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
