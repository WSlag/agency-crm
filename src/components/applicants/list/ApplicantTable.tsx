import { Link } from 'react-router-dom';
import { Applicant, ApplicantSort } from '../../../types/applicant';
import { ChevronUpIcon, ChevronDownIcon, EyeIcon, TrashIcon } from '@heroicons/react/20/solid';

interface ApplicantTableProps {
  applicants: Applicant[];
  sort: ApplicantSort;
  onSortChange: (sort: ApplicantSort) => void;
  isAdmin?: boolean;
  onDelete?: (applicantId: string, applicantName: string) => void;
  basePath?: string; // Base path for applicant links - '/applicants' or '/my-applicants'
}

export const ApplicantTable = ({
  applicants,
  sort,
  onSortChange,
  isAdmin = false,
  onDelete,
  basePath = '/applicants', // Default to '/applicants' for backward compatibility
}: ApplicantTableProps) => {
  const handleSort = (field: keyof Applicant) => {
    if (sort.field === field) {
      onSortChange({
        field,
        direction: sort.direction === 'asc' ? 'desc' : 'asc',
      });
    } else {
      onSortChange({
        field,
        direction: 'asc',
      });
    }
  };

  const renderSortIcon = (field: keyof Applicant) => {
    if (sort.field !== field) {
      return null;
    }

    return sort.direction === 'asc' ? (
      <ChevronUpIcon className="h-4 w-4 ml-1" />
    ) : (
      <ChevronDownIcon className="h-4 w-4 ml-1" />
    );
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'interview':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'medical':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'processing':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      case 'deployment':
        return 'bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300';
      case 'deployed':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'archived':
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
      case 'blacklisted':
        return 'bg-gradient-to-r from-red-900 to-red-800 text-white border-red-900';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      case 'document_verification':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return '—';
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return '—';
    }
  };

  // Enhanced debug logging
  console.log('=== ApplicantTable Render ===');
  console.log('ApplicantTable received props:', { 
    applicantsCount: applicants?.length,
    applicantsArray: applicants,
    isArray: Array.isArray(applicants),
    sortField: sort?.field,
    sortDirection: sort?.direction,
    firstApplicant: applicants?.[0]
  });

  if (!Array.isArray(applicants)) {
    console.error('Applicants is not an array:', applicants);
    return (
      <div className="text-center py-12 text-red-600 bg-red-50 rounded-lg m-4">
        <p className="text-lg font-medium">Error loading applicants data</p>
      </div>
    );
  }

  if (applicants.length === 0) {
    console.log('No applicants found - returning empty state');
    return (
      <div className="text-center py-16 text-gray-500">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p className="mt-4 text-lg font-medium text-gray-900">No applicants found</p>
        <p className="text-sm mt-2 text-gray-600">Try adjusting your filters or add a new applicant</p>
      </div>
    );
  }

  // Log the first applicant for debugging
  console.log('First applicant data:', {
    id: applicants[0]?.id,
    name: applicants[0]?.fullName,
    stage: applicants[0]?.currentStage,
    type: applicants[0]?.applicationType,
    status: applicants[0]?.status
  });
  console.log('Rendering table with', applicants.length, 'applicants');

  return (
    <div className="overflow-hidden">
      {/* Mobile Card View - Show on screens < 768px */}
      <div className="md:hidden space-y-3">
        {applicants.map((applicant) => (
          <div
            key={applicant?.id}
            className="bg-white rounded-xl border-2 border-gray-200 p-4 hover:border-indigo-300 hover:shadow-lg transition-all duration-200"
          >
            {/* Header Row - Name and Status Indicator */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                <div className={`w-3 h-3 rounded-full mr-3 flex-shrink-0 ${
                  applicant?.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                }`}></div>
                <h3 className="font-semibold text-base text-gray-900 truncate">
                  {applicant?.fullName || applicant?.name || '—'}
                </h3>
              </div>
            </div>

            {/* Info Grid */}
            <div className="space-y-2 mb-4">
              {/* Stage */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Stage:</span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStageBadgeColor(
                    applicant?.currentStage || ''
                  )} shadow-sm`}
                >
                  {applicant?.currentStage || '—'}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Status:</span>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStatusBadgeColor(
                    applicant?.status || ''
                  )} shadow-sm`}
                >
                  {applicant?.status || '—'}
                </span>
              </div>

              {/* Type */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Type:</span>
                <span className="text-sm font-medium text-gray-900 capitalize">
                  {applicant?.applicationType?.replace('_', ' ') || '—'}
                </span>
              </div>

              {/* Location */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Location:</span>
                <span className="text-sm font-medium text-gray-900">
                  {applicant?.transferredToHO ? 'Head Office' : 'Branch'}
                </span>
              </div>

              {/* Registration Date */}
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Registered:</span>
                <span className="text-sm text-gray-900">
                  {formatDate(applicant?.createdAt)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-3 border-t border-gray-100">
              <Link
                to={`${basePath}/${applicant?.id}`}
                className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <EyeIcon className="h-4 w-4 mr-2" />
                View Details
              </Link>
              {isAdmin && onDelete && (
                <button
                  onClick={() => onDelete(applicant?.id, applicant?.fullName || applicant?.name || 'this applicant')}
                  className="px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  title="Delete applicant"
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View - Show on screens >= 768px */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
            <tr>
              <th
                scope="col"
                className="py-4 pl-6 pr-3 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
              >
                <button
                  type="button"
                  onClick={() => handleSort('fullName')}
                  className="group inline-flex items-center hover:text-indigo-600 transition-colors"
                >
                  Full Name
                  {renderSortIcon('fullName')}
                </button>
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
              >
                <button
                  type="button"
                  onClick={() => handleSort('currentStage')}
                  className="group inline-flex items-center hover:text-indigo-600 transition-colors"
                >
                  Stage
                  {renderSortIcon('currentStage')}
                </button>
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
              >
                <button
                  type="button"
                  onClick={() => handleSort('applicationType')}
                  className="group inline-flex items-center hover:text-indigo-600 transition-colors"
                >
                  Type
                  {renderSortIcon('applicationType')}
                </button>
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
              >
                <button
                  type="button"
                  onClick={() => handleSort('transferredToHO')}
                  className="group inline-flex items-center hover:text-indigo-600 transition-colors"
                >
                  Location
                  {renderSortIcon('transferredToHO')}
                </button>
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
              >
                <button
                  type="button"
                  onClick={() => handleSort('status')}
                  className="group inline-flex items-center hover:text-indigo-600 transition-colors"
                >
                  Status
                  {renderSortIcon('status')}
                </button>
              </th>
              <th
                scope="col"
                className="px-3 py-4 text-left text-xs font-semibold text-gray-900 uppercase tracking-wider"
              >
                <button
                  type="button"
                  onClick={() => handleSort('createdAt')}
                  className="group inline-flex items-center hover:text-indigo-600 transition-colors"
                >
                  Registration Date
                  {renderSortIcon('createdAt')}
                </button>
              </th>
              <th scope="col" className="relative py-4 pl-3 pr-6">
                <span className="sr-only">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {applicants.length > 0 ? (
              applicants.map((applicant) => {
                console.log('Rendering applicant row:', {
                  id: applicant?.id,
                  fullName: applicant?.fullName,
                  name: applicant?.name,
                  allKeys: Object.keys(applicant || {}),
                  applicantObject: applicant
                });
                return (
                  <tr 
                    key={applicant?.id}
                    className="hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200 group"
                  >
                    <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm font-medium text-gray-900">
                      <div className="flex items-center">
                        <div className={`w-2 h-2 rounded-full mr-3 ${
                          applicant?.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                        }`}></div>
                        {applicant?.fullName || applicant?.name || '—'}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStageBadgeColor(
                          applicant?.currentStage || ''
                        )} shadow-sm`}
                      >
                        {applicant?.currentStage || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      <span className="font-medium">
                        {applicant?.applicationType === 'with_agent'
                          ? 'With Agent'
                          : 'Direct Hire'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      <span className={`inline-flex items-center ${applicant?.transferredToHO ? 'text-indigo-600 font-semibold' : ''}`}>
                        {applicant?.transferredToHO ? '🏢 Head Office' : '🏪 Branch'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold border ${getStatusBadgeColor(
                          applicant?.status || ''
                        )} shadow-sm`}
                      >
                        {applicant?.status || '—'}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-600">
                      {formatDate(applicant?.createdAt)}
                    </td>
                    <td className="relative whitespace-nowrap py-4 pl-3 pr-6 text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <Link
                          to={`${basePath}/${applicant?.id}`}
                          className="inline-flex items-center px-3 py-1.5 text-indigo-600 hover:text-white bg-indigo-50 hover:bg-gradient-to-r hover:from-indigo-600 hover:to-purple-600 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View
                        </Link>
                        {isAdmin && onDelete && (
                          <button
                            onClick={() => onDelete(applicant?.id, applicant?.fullName || applicant?.name || 'Unknown')}
                            className="inline-flex items-center px-3 py-1.5 text-red-600 hover:text-white bg-red-50 hover:bg-gradient-to-r hover:from-red-600 hover:to-red-700 rounded-lg font-semibold transition-all duration-200 hover:scale-105 hover:shadow-lg"
                            title="Delete applicant"
                          >
                            <TrashIcon className="h-4 w-4 mr-1" />
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-sm text-gray-500 text-center"
                >
                  No applicants found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
