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

export const ResumeManagement: React.FC = () => {
  const { user } = useAuth();
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploading, setUploading] = useState<string | null>(null);

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

  const handleToggleVisibility = async (applicantId: string, currentValue: boolean) => {
    try {
      const applicantRef = doc(db, 'applicants', applicantId);
      await updateDoc(applicantRef, {
        resumeVisible: !currentValue,
        updatedAt: Timestamp.now(),
      });

      // Update local state
      setApplicants((prev) =>
        prev.map((app) =>
          app.id === applicantId ? { ...app, resumeVisible: !currentValue } : app
        )
      );
    } catch (error) {
      console.error('Error toggling visibility:', error);
      alert('Failed to update visibility. Please try again.');
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
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const filteredApplicants = applicants.filter((app) =>
    app.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Resume Management</h1>
        <p className="text-gray-600">
          Manage which applicants are visible on the public employer portal
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
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
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Qualified</p>
              <p className="text-2xl font-bold text-gray-900">{applicants.length}</p>
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
              <p className="text-sm font-medium text-gray-600">Visible on Portal</p>
              <p className="text-2xl font-bold text-gray-900">
                {applicants.filter((a) => a.resumeVisible).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-100 rounded-lg p-3">
              <svg
                className="h-6 w-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Hidden</p>
              <p className="text-2xl font-bold text-gray-900">
                {applicants.filter((a) => !a.resumeVisible).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Applicants Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : filteredApplicants.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500">No applicants found with passed medical status</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Position
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Photos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Visible
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredApplicants.map((applicant) => (
                  <tr key={applicant.id}>
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
                        {/* 2x2 Photo Upload */}
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-20">2x2 Photo:</label>
                          {applicant.photoUrl ? (
                            <span className="text-xs text-green-600">✓ Uploaded</span>
                          ) : (
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
                          )}
                        </div>

                        {/* Full Body Photo Upload */}
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-20">Full Body:</label>
                          {applicant.fullBodyPhotoUrl ? (
                            <span className="text-xs text-green-600">✓ Uploaded</span>
                          ) : (
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
                          )}
                        </div>

                        {/* Passport Copy Upload */}
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600 w-20">Passport:</label>
                          {applicant.passportCopyUrl ? (
                            <span className="text-xs text-green-600">✓ Uploaded</span>
                          ) : (
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
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() =>
                          handleToggleVisibility(applicant.id, applicant.resumeVisible || false)
                        }
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          applicant.resumeVisible ? 'bg-blue-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            applicant.resumeVisible ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <a
                        href={`/applicants/${applicant.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800"
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
    </div>
  );
};
