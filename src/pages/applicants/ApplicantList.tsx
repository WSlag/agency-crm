import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicantFilters } from '../../components/applicants/list/ApplicantFilters';
import { ApplicantTable } from '../../components/applicants/list/ApplicantTable';
import { useApplicantStore } from '../../stores/applicantStore';
import { useBranchStore } from '../../stores/branchStore';
import { useAgentStore } from '../../stores/agentStore';
import { useOfficerStore } from '../../stores/officerStore';
import { ApplicantFilter, ApplicantSort } from '../../types/applicant';
import { FunnelIcon, PlusIcon } from '@heroicons/react/24/outline';

export const ApplicantList = () => {
  const navigate = useNavigate();
  const {
    applicants,
    loading,
    error,
    filter,
    sort,
    pagination,
    setFilter,
    setSort,
    setPagination,
    fetchApplicants,
  } = useApplicantStore();

  const { branches, loading: branchesLoading, error: branchesError, fetchActiveBranches } = useBranchStore();
  const { agents, loading: agentsLoading, error: agentsError, fetchActiveAgents } = useAgentStore();
  const { officers, loading: officersLoading, error: officersError, fetchActiveOfficers } = useOfficerStore();

  const [showMobileFilters, setShowMobileFilters] = useState(false);

  // Load initial data only once on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        console.log('Loading initial data...');
        
        // Load reference data in parallel
        const [
          branchesResult,
          agentsResult,
          officersResult
        ] = await Promise.all([
          fetchActiveBranches(),
          fetchActiveAgents(),
          fetchActiveOfficers()
        ]);

        console.log('Reference data loaded:', {
          branches: branchesResult?.length,
          agents: agentsResult?.length,
          officers: officersResult?.length
        });

        // Fetch applicants after reference data is loaded
        await fetchApplicants();
        console.log('Initial data loaded successfully');
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };

    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Fetch applicants when filters, sort, or pagination change
  useEffect(() => {
    const isInitialLoad = filter && Object.keys(filter).length === 0;
    if (!isInitialLoad) {
      console.log('Fetching applicants due to filter/sort/pagination change');
      fetchApplicants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, sort, pagination.page]); // Don't include fetchApplicants to avoid infinite loop

  const handleFiltersChange = (newFilters: ApplicantFilter) => {
    console.log('Applying filters:', newFilters);
    setFilter(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const handleSortChange = (newSort: ApplicantSort) => {
    console.log('Applying sort:', newSort);
    setSort(newSort);
  };

  // Transform branches data for filters
  const branchOptions = branches?.map(branch => ({
    id: branch.id,
    branchName: branch.name
  })) || [];

  // Transform agents data for filters
  const agentOptions = agents?.map(agent => ({
    id: agent.id,
    agentName: agent.agentName
  })) || [];

  const isLoading = loading || branchesLoading || agentsLoading || officersLoading;
  const combinedError = error || branchesError || agentsError || officersError;

  // Debug logging
  console.log('=== ApplicantList Render ===');
  console.log('Applicants from store:', {
    count: applicants?.length,
    isArray: Array.isArray(applicants),
    sample: applicants?.[0],
    loading,
    error
  });

  return (
    <div className="min-h-full">
      <div className="bg-white shadow">
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="sm:flex sm:items-center">
            <div className="sm:flex-auto">
              <h1 className="text-base font-semibold leading-6 text-gray-900">
                Applicants
              </h1>
              <p className="mt-2 text-sm text-gray-700">
                A list of all applicants in the system including their status,
                stage, and registration date.
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                onClick={() => navigate('/applicants/new')}
                className="block rounded-md bg-primary-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
              >
                <PlusIcon className="h-5 w-5 inline-block mr-1" />
                Add Applicant
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        {combinedError && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{combinedError}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters */}
          <div className="w-full lg:w-64 flex-none">
            <div className="flex items-center justify-between lg:hidden">
              <h2 className="text-sm font-medium text-gray-900">Filters</h2>
              <button
                type="button"
                className="text-gray-500 hover:text-gray-600"
                onClick={() => setShowMobileFilters(true)}
              >
                <FunnelIcon className="h-5 w-5" />
              </button>
            </div>

            <ApplicantFilters
              filters={filter}
              onFiltersChange={handleFiltersChange}
              branches={branchOptions}
              agents={agentOptions}
              officers={officers}
            />
          </div>

          {/* Content */}
          <div className="flex-1">
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
              </div>
            ) : (
              <>
                <ApplicantTable
                  applicants={applicants}
                  sort={sort}
                  onSortChange={handleSortChange}
                />

                {/* Pagination */}
                <nav
                  className="flex items-center justify-between border-t border-gray-200 px-4 sm:px-0 mt-6"
                  aria-label="Pagination"
                >
                  <div className="-mt-px flex w-0 flex-1">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: Math.max(1, pagination.page - 1),
                        })
                      }
                      disabled={pagination.page === 1}
                      className="inline-flex items-center border-t-2 border-transparent pt-4 pr-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50"
                    >
                      Previous
                    </button>
                  </div>
                  <div className="hidden md:-mt-px md:flex">
                    <span className="inline-flex items-center border-t-2 border-transparent px-4 pt-4 text-sm font-medium text-gray-500">
                      Page {pagination.page} of{' '}
                      {Math.ceil(pagination.total / pagination.limit)}
                    </span>
                  </div>
                  <div className="-mt-px flex w-0 flex-1 justify-end">
                    <button
                      onClick={() =>
                        setPagination({
                          ...pagination,
                          page: pagination.page + 1,
                        })
                      }
                      disabled={
                        pagination.page >=
                        Math.ceil(pagination.total / pagination.limit)
                      }
                      className="inline-flex items-center border-t-2 border-transparent pt-4 pl-1 text-sm font-medium text-gray-500 hover:border-gray-300 hover:text-gray-700 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </nav>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};