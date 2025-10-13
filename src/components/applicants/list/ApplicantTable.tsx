import { Link } from 'react-router-dom';
import { Applicant, ApplicantSort } from '../../../types/applicant';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/20/solid';

interface ApplicantTableProps {
  applicants: Applicant[];
  sort: ApplicantSort;
  onSortChange: (sort: ApplicantSort) => void;
}

export const ApplicantTable = ({
  applicants,
  sort,
  onSortChange,
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
      <ChevronUpIcon className="h-5 w-5" />
    ) : (
      <ChevronDownIcon className="h-5 w-5" />
    );
  };

  const getStageBadgeColor = (stage: string) => {
    switch (stage) {
      case 'interview':
        return 'bg-blue-100 text-blue-800';
      case 'medical':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-purple-100 text-purple-800';
      case 'deployment':
        return 'bg-orange-100 text-orange-800';
      case 'deployed':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
      <div className="text-center py-4 text-red-600">
        Error loading applicants data
      </div>
    );
  }

  if (applicants.length === 0) {
    console.log('No applicants found - returning empty state');
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg font-medium">No applicants found</p>
        <p className="text-sm mt-2">Try adjusting your filters or add a new applicant</p>
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
    <div className="mt-8 flow-root">
      <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
        <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
          <table className="min-w-full divide-y divide-gray-300">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('fullName')}
                    className="group inline-flex"
                  >
                    Full Name
                    {renderSortIcon('fullName')}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('currentStage')}
                    className="group inline-flex"
                  >
                    Stage
                    {renderSortIcon('currentStage')}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('applicationType')}
                    className="group inline-flex"
                  >
                    Type
                    {renderSortIcon('applicationType')}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('transferredToHO')}
                    className="group inline-flex"
                  >
                    Location
                    {renderSortIcon('transferredToHO')}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('status')}
                    className="group inline-flex"
                  >
                    Status
                    {renderSortIcon('status')}
                  </button>
                </th>
                <th
                  scope="col"
                  className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900"
                >
                  <button
                    type="button"
                    onClick={() => handleSort('createdAt')}
                    className="group inline-flex"
                  >
                    Registration Date
                    {renderSortIcon('createdAt')}
                  </button>
                </th>
                <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
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
                    <tr key={applicant?.id}>
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-0">
                        {applicant?.fullName || applicant?.name || '—'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStageBadgeColor(
                            applicant?.currentStage || ''
                          )}`}
                        >
                          {applicant?.currentStage || '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {applicant?.applicationType === 'with_agent'
                          ? 'With Agent'
                          : 'Direct Hire'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {applicant?.transferredToHO ? 'Head Office' : 'Branch'}
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(
                            applicant?.status || ''
                          )}`}
                        >
                          {applicant?.status || '—'}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                        {formatDate(applicant?.createdAt)}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <Link
                          to={`/applicants/${applicant?.id}`}
                          className="text-primary-600 hover:text-primary-900"
                        >
                          View
                        </Link>
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
    </div>
  );
};