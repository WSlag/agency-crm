import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApplicantTable } from '../../components/applicants/list/ApplicantTable';
import { useApplicantStore } from '../../stores/applicantStore';
import { useBranchStore } from '../../stores/branchStore';
import { useAgentStore } from '../../stores/agentStore';
import { useOfficerStore } from '../../stores/officerStore';
import { useAuth } from '../../contexts/AuthContext';
import { ApplicantFilter, ApplicantSort } from '../../types/applicant';
import { PlusIcon, SparklesIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { STAGE_LABELS, getAllStagesInOrder } from '../../config/stageConfig';
import { getAllStatusFilterOptions } from '../../config/statusConfig';

export const ApplicantList = () => {
  const navigate = useNavigate();
  const { customClaims } = useAuth();
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
    deleteApplicant,
  } = useApplicantStore();

  // SECURITY: Redirect HO Recruitment Officers to their dedicated page
  useEffect(() => {
    if (customClaims?.role === 'ho_recruitment_officer') {
      console.warn('🔒 HO Officer redirected from All Applicants to My Applicants');
      navigate('/my-applicants', { replace: true });
    }
  }, [customClaims, navigate]);

  const { branches, loading: branchesLoading, error: branchesError, fetchBranches } = useBranchStore();
  const { agents, loading: agentsLoading, error: agentsError, fetchActiveAgents } = useAgentStore();
  const { officers, loading: officersLoading, error: officersError, fetchActiveOfficers } = useOfficerStore();

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
          fetchBranches(), // Changed from fetchActiveBranches to fetch ALL branches
          fetchActiveAgents(),
          fetchActiveOfficers()
        ]);

        console.log('Reference data loaded:', {
          branches: branchesResult?.length,
          agents: agentsResult?.length,
          officers: officersResult?.length
        });

        // Auto-filter by branch for Branch Managers
        if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
          console.log('Branch Manager detected, auto-filtering by branch:', customClaims.branchId);
          setFilter({ branchId: customClaims.branchId });
        }

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

  // Fetch applicants when filters or sort change
  useEffect(() => {
    fetchApplicants();
  }, [filter, sort, fetchApplicants]);

  const handleFilterChange = (key: keyof ApplicantFilter, value: any) => {
    console.log('Filter change:', { key, value });
    const newFilters = { ...filter };
    
    // SECURITY: Branch Managers cannot remove branchId filter
    if (key === 'branchId' && customClaims?.role === 'branch_manager') {
      console.warn('Branch Manager cannot change branch filter');
      return; // Ignore branch filter changes for Branch Managers
    }
    
    if (value === '' || value === undefined) {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    console.log('New filters:', newFilters);
    setFilter(newFilters);
    setPagination({ ...pagination, page: 1 }); // Reset to first page
  };

  const handleSortChange = (newSort: ApplicantSort) => {
    console.log('Applying sort:', newSort);
    setSort(newSort);
  };

  // Transform branches data for filters
  const branchOptions = branches
    ?.map(branch => ({
      id: branch.id,
      branchName: branch.name
    }))
    // Remove duplicates based on branch ID
    .filter((branch, index, self) => 
      index === self.findIndex((b) => b.id === branch.id)
    )
    // Sort alphabetically by branch name
    .sort((a, b) => a.branchName.localeCompare(b.branchName))
    || [];

  // Transform agents data for filters
  // Branch Managers can only see agents from their own branch
  const agentOptions = agents
    ?.filter(agent => {
      // If user is a Branch Manager, only show agents from their branch
      if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
        return agent.branchId === customClaims.branchId;
      }
      // Other roles see all agents
      return true;
    })
    .map(agent => ({
      id: agent.id,
      agentName: agent.agentName || 'Unknown Agent'
    }))
    // Remove duplicates based on agent ID
    .filter((agent, index, self) => 
      index === self.findIndex((a) => a.id === agent.id)
    )
    // Sort alphabetically by agent name
    .sort((a, b) => a.agentName.localeCompare(b.agentName))
    || [];

  const isLoading = loading || branchesLoading || agentsLoading || officersLoading;
  const combinedError = error || branchesError || agentsError || officersError;

  // Delete handler (Admin only)
  const handleDelete = async (applicantId: string, applicantName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${applicantName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteApplicant(applicantId);
      // Refresh the list after deletion
      await fetchApplicants();
    } catch (error) {
      console.error('Error deleting applicant:', error);
      alert('Failed to delete applicant. Please try again.');
    }
  };

  // Check if current user is admin
  const isAdmin = customClaims?.role === 'admin';

  // Stats for the top cards
  const stats = [
    { name: 'Total Applicants', value: pagination.total, color: 'from-blue-500 to-blue-600' },
    { name: 'Active', value: applicants.filter(a => a.status === 'active').length, color: 'from-green-500 to-green-600' },
    { name: 'In Interview', value: applicants.filter(a => a.currentStage === 'interview').length, color: 'from-purple-500 to-purple-600' },
    { name: 'Deployed', value: applicants.filter(a => a.currentStage === 'deployed').length, color: 'from-orange-500 to-orange-600' },
  ];

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                <h1 className="text-xl sm:text-3xl font-bold text-white">
                  Applicants Management
                </h1>
              </div>
              <p className="mt-2 text-sm sm:text-base text-indigo-100">
                Track and manage all applicants throughout their recruitment journey
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
              <button
                type="button"
                onClick={() => navigate('/applicants/new')}
                className="group relative inline-flex items-center justify-center w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-2xl"
              >
                <PlusIcon className="h-5 w-5 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                Add Applicant
              </button>
            </div>
          </div>

          {/* Stats Cards - Responsive Grid */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
            {stats.map((stat) => (
              <div
                key={stat.name}
                className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-4 sm:px-4 sm:py-5 shadow-lg hover:bg-white/15 transition-all duration-200 hover:scale-105 cursor-pointer"
              >
                <dt className="truncate text-xs sm:text-sm font-medium text-indigo-100">{stat.name}</dt>
                <dd className="mt-1 text-2xl sm:text-3xl font-semibold tracking-tight text-white">{stat.value}</dd>
                <div className={`absolute -right-4 -bottom-4 h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-gradient-to-br ${stat.color} opacity-20 blur-2xl`}></div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {combinedError && (
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4 mb-6">
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

        {/* Horizontal Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Search */}
            <div className="xl:col-span-2">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="search"
                  value={filter.searchTerm || ''}
                  onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                  className="block w-full pl-10 rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
                  placeholder="Search applicants..."
                />
              </div>
            </div>

            {/* Stage Dropdown */}
            <div>
              <label htmlFor="stage" className="block text-sm font-medium text-gray-700 mb-2">
                Stage
              </label>
              <select
                id="stage"
                value={filter.currentStage || ''}
                onChange={(e) => handleFilterChange('currentStage', e.target.value)}
                className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
              >
                <option value="">All Stages</option>
                {getAllStagesInOrder().map((stage) => (
                  <option key={stage} value={stage}>
                    {STAGE_LABELS[stage]}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Dropdown */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                value={filter.statusFilterId || ''}
                onChange={(e) => handleFilterChange('statusFilterId', e.target.value)}
                className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
              >
                {getAllStatusFilterOptions().map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Branch Dropdown - Hidden for Branch Managers (they can only see their branch) */}
            {customClaims?.role !== 'branch_manager' && (
              <div>
                <label htmlFor="branch" className="block text-sm font-medium text-gray-700 mb-2">
                  Branch
                </label>
                <select
                  id="branch"
                  value={filter.branchId || ''}
                  onChange={(e) => handleFilterChange('branchId', e.target.value)}
                  className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
                >
                  <option value="">All Branches</option>
                  {branchOptions?.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.branchName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Agent Dropdown */}
            <div>
              <label htmlFor="agent" className="block text-sm font-medium text-gray-700 mb-2">
                Agent
              </label>
              <select
                id="agent"
                value={filter.agentId || ''}
                onChange={(e) => handleFilterChange('agentId', e.target.value)}
                className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
              >
                <option value="">All Agents</option>
                {agentOptions?.map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.agentName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading applicants...</p>
            </div>
          ) : (
            <>
              <ApplicantTable
                applicants={applicants}
                sort={sort}
                onSortChange={handleSortChange}
                isAdmin={isAdmin}
                onDelete={handleDelete}
              />

              {/* Pagination with Gradient */}
              <nav
                className="flex items-center justify-between border-t border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4"
                aria-label="Pagination"
              >
                <div className="flex w-0 flex-1">
                  <button
                    onClick={() =>
                      setPagination({
                        ...pagination,
                        page: Math.max(1, pagination.page - 1),
                      })
                    }
                    disabled={pagination.page === 1}
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    ← Previous
                  </button>
                </div>
                <div className="hidden md:flex">
                  <span className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg">
                    Page {pagination.page} of{' '}
                    {Math.ceil(pagination.total / pagination.limit)}
                  </span>
                </div>
                <div className="flex w-0 flex-1 justify-end">
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
                    className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
                  >
                    Next →
                  </button>
                </div>
              </nav>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
