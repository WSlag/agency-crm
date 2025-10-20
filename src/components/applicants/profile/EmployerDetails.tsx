import { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { Applicant } from '../../../types/applicant';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { firestore } from '../../../config/firebase';
import { 
  PencilIcon, 
  CheckIcon, 
  XMarkIcon,
  BuildingOfficeIcon,
  UserIcon,
  MapPinIcon,
  PhoneIcon
} from '@heroicons/react/24/outline';

interface EmployerDetailsProps {
  applicant: Applicant;
}

export const EmployerDetails = ({ applicant }: EmployerDetailsProps) => {
  const { user, customClaims } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    fraName: applicant.employerDetails?.fraName || '',
    employerName: applicant.employerDetails?.employerName || '',
    employerAddress: applicant.employerDetails?.employerAddress || '',
    employerContactNumber: applicant.employerDetails?.employerContactNumber || ''
  });

  // Check if user can edit employer details
  const canEdit = 
    customClaims?.role === 'admin' || 
    customClaims?.role === 'president' || 
    (customClaims?.role === 'ho_recruitment_officer' && 
     user?.uid === applicant.assignedRecruitmentOfficerId);

  // Check if user can view employer details
  const canView =
    customClaims?.role === 'admin' ||
    customClaims?.role === 'president' ||
    (customClaims?.role === 'ho_recruitment_officer' &&
     user?.uid === applicant.assignedRecruitmentOfficerId);

  useEffect(() => {
    if (applicant.employerDetails) {
      setFormData({
        fraName: applicant.employerDetails.fraName || '',
        employerName: applicant.employerDetails.employerName || '',
        employerAddress: applicant.employerDetails.employerAddress || '',
        employerContactNumber: applicant.employerDetails.employerContactNumber || ''
      });
    }
  }, [applicant.employerDetails]);

  const handleSave = async () => {
    if (!user) return;

    // Validate all fields are filled
    if (!formData.fraName || !formData.employerName || 
        !formData.employerAddress || !formData.employerContactNumber) {
      setError('All fields are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const applicantRef = doc(firestore, 'applicants', applicant.id);
      await updateDoc(applicantRef, {
        employerDetails: {
          fraName: formData.fraName,
          employerName: formData.employerName,
          employerAddress: formData.employerAddress,
          employerContactNumber: formData.employerContactNumber,
          addedBy: user.uid,
          addedAt: serverTimestamp()
        },
        updatedAt: serverTimestamp()
      });

      setIsEditing(false);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (err) {
      console.error('Error updating employer details:', err);
      setError('Failed to update employer details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fraName: applicant.employerDetails?.fraName || '',
      employerName: applicant.employerDetails?.employerName || '',
      employerAddress: applicant.employerDetails?.employerAddress || '',
      employerContactNumber: applicant.employerDetails?.employerContactNumber || ''
    });
    setIsEditing(false);
    setError(null);
  };

  if (!canView) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <p className="text-sm text-yellow-800">
          You do not have permission to view employer details.
        </p>
      </div>
    );
  }

  const hasEmployerDetails = applicant.employerDetails && 
    applicant.employerDetails.fraName && 
    applicant.employerDetails.employerName;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Employer Details</h3>
          <p className="mt-1 text-sm text-gray-500">
            Information about the employer and foreign recruitment agency
          </p>
        </div>
        
        {canEdit && !isEditing && (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PencilIcon className="h-4 w-4 mr-2" />
            {hasEmployerDetails ? 'Edit' : 'Add'} Details
          </button>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      {/* Form/Display */}
      {isEditing ? (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              {/* FRA Name */}
              <div>
                <label htmlFor="fraName" className="block text-sm font-medium text-gray-700">
                  Foreign Recruitment Agency (FRA) Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fraName"
                    value={formData.fraName}
                    onChange={(e) => setFormData({ ...formData, fraName: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter FRA name"
                  />
                </div>
              </div>

              {/* Employer Name */}
              <div>
                <label htmlFor="employerName" className="block text-sm font-medium text-gray-700">
                  Employer Name <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="employerName"
                    value={formData.employerName}
                    onChange={(e) => setFormData({ ...formData, employerName: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter employer name"
                  />
                </div>
              </div>

              {/* Employer Address */}
              <div>
                <label htmlFor="employerAddress" className="block text-sm font-medium text-gray-700">
                  Employer Address <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPinIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <textarea
                    id="employerAddress"
                    value={formData.employerAddress}
                    onChange={(e) => setFormData({ ...formData, employerAddress: e.target.value })}
                    rows={3}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter employer address"
                  />
                </div>
              </div>

              {/* Employer Contact Number */}
              <div>
                <label htmlFor="employerContactNumber" className="block text-sm font-medium text-gray-700">
                  Employer Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <PhoneIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="employerContactNumber"
                    value={formData.employerContactNumber}
                    onChange={(e) => setFormData({ ...formData, employerContactNumber: e.target.value })}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Enter contact number"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  <XMarkIcon className="h-4 w-4 mr-2" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={loading}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckIcon className="h-4 w-4 mr-2" />
                      Save Details
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            {hasEmployerDetails ? (
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                {/* FRA Name */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <BuildingOfficeIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Foreign Recruitment Agency (FRA)
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">
                    {applicant.employerDetails?.fraName || 'N/A'}
                  </dd>
                </div>

                {/* Employer Name */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Employer Name
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 font-medium">
                    {applicant.employerDetails?.employerName || 'N/A'}
                  </dd>
                </div>

                {/* Employer Address */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <MapPinIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Employer Address
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {applicant.employerDetails?.employerAddress || 'N/A'}
                  </dd>
                </div>

                {/* Employer Contact Number */}
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <PhoneIcon className="h-5 w-5 mr-2 text-gray-400" />
                    Employer Contact Number
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {applicant.employerDetails?.employerContactNumber || 'N/A'}
                  </dd>
                </div>

                {/* Metadata */}
                {applicant.employerDetails?.addedAt && (
                  <div className="sm:col-span-2 pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Last updated: {new Date(applicant.employerDetails.addedAt).toLocaleString()}
                    </p>
                  </div>
                )}
              </dl>
            ) : (
              <div className="text-center py-6">
                <BuildingOfficeIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No employer details</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Employer details have not been added yet.
                </p>
                {canEdit && (
                  <div className="mt-6">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      <PencilIcon className="h-4 w-4 mr-2" />
                      Add Employer Details
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

