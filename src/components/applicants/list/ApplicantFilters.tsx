import { Fragment, useState, useEffect } from 'react';
import { Dialog, Disclosure, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import { ApplicantFilter } from '../../../types/applicant';

interface ApplicantFiltersProps {
  filters: ApplicantFilter;
  onFiltersChange: (filters: ApplicantFilter) => void;
  branches: Array<{ id: string; branchName: string }>;
  agents: Array<{ id: string; agentName: string }>;
  officers: Array<{ id: string; displayName: string }>;
  hideAgentFilter?: boolean; // SECURITY: Hide agent filter from certain roles
}

export const ApplicantFilters = ({
  filters,
  onFiltersChange,
  branches,
  agents,
  officers,
  hideAgentFilter = false,
}: ApplicantFiltersProps) => {
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [localFilters, setLocalFilters] = useState<ApplicantFilter>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof ApplicantFilter, value: any) => {
    console.log('Filter change:', { key, value });
    
    let newValue = value;
    
    // Special handling for different filter types
    if (value === '') {
      newValue = undefined;
    } else if (key === 'transferredToHO') {
      newValue = Boolean(value);
    } else if (key === 'dateRange' && value) {
      newValue = {
        start: value.start ? new Date(value.start) : undefined,
        end: value.end ? new Date(value.end) : undefined
      };
    }

    // Create new filters object
    const newFilters = {
      ...localFilters,
      [key]: newValue
    };

    // Clean up undefined values
    Object.keys(newFilters).forEach(k => {
      const key = k as keyof ApplicantFilter;
      if (newFilters[key] === undefined || newFilters[key] === null) {
        delete newFilters[key];
      }
    });

    console.log('New filters:', newFilters);
    setLocalFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const filterSections = [
    {
      id: 'currentStage', // Changed from 'stage' to match the field name in Applicant type
      name: 'Stage',
      options: [
        { value: 'interview', label: 'Interview' },
        { value: 'medical', label: 'Medical' },
        { value: 'processing', label: 'Processing' },
        { value: 'deployment', label: 'Deployment' },
        { value: 'deployed', label: 'Deployed' },
      ],
    },
    {
      id: 'status',
      name: 'Status',
      options: [
        { value: 'active', label: 'Active' },
        { value: 'inactive', label: 'Inactive' },
      ],
    },
  ];

  const renderFilterContent = () => (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700"
        >
          Search
        </label>
        <div className="mt-1">
          <input
            type="text"
            name="search"
            id="search"
            value={localFilters.searchTerm || ''}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
            className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
            placeholder="Search applicants..."
          />
        </div>
      </div>

      {/* Date Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-900">Date Range</h3>
        <div className="mt-2 grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="start-date" className="sr-only">
              Start Date
            </label>
            <input
              type="date"
              id="start-date"
              value={localFilters.dateRange?.start?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                handleFilterChange('dateRange', {
                  ...localFilters.dateRange,
                  start: e.target.value ? new Date(e.target.value) : null,
                })
              }
              className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
            />
          </div>
          <div>
            <label htmlFor="end-date" className="sr-only">
              End Date
            </label>
            <input
              type="date"
              id="end-date"
              value={localFilters.dateRange?.end?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                handleFilterChange('dateRange', {
                  ...localFilters.dateRange,
                  end: e.target.value ? new Date(e.target.value) : null,
                })
              }
              className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400"
            />
          </div>
        </div>
      </div>

      {/* Branch Filter */}
      <div>
        <label
          htmlFor="branch"
          className="block text-sm font-medium text-gray-700"
        >
          Branch
        </label>
        <select
          id="branch"
          value={localFilters.branchId || ''}
          onChange={(e) => handleFilterChange('branchId', e.target.value || undefined)}
          className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
        >
          <option value="">All Branches</option>
          {branches?.map((branch) => (
            <option key={branch.id} value={branch.id}>
              {branch.branchName}
            </option>
          ))}
        </select>
      </div>

      {/* SECURITY: Hide agent filter from certain roles */}
      {!hideAgentFilter && (
        <div>
          <label
            htmlFor="agent"
            className="block text-sm font-medium text-gray-700"
          >
            Agent
          </label>
          <select
            id="agent"
            value={localFilters.agentId || ''}
            onChange={(e) => handleFilterChange('agentId', e.target.value || undefined)}
            className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
          >
            <option value="">All Agents</option>
            {Array.isArray(agents) && agents.length > 0 ? (
              agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.agentName || 'Unknown Agent'}
                </option>
              ))
            ) : (
              <option value="" disabled>Loading agents...</option>
            )}
          </select>
        </div>
      )}

      {/* Recruitment Officer Filter */}
      <div>
        <label
          htmlFor="officer"
          className="block text-sm font-medium text-gray-700"
        >
          Recruitment Officer
        </label>
        <select
          id="officer"
          value={localFilters.assignedOfficerId || ''}
          onChange={(e) => handleFilterChange('assignedOfficerId', e.target.value || undefined)}
          className="mt-1 block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm transition-all hover:border-indigo-400 bg-white"
        >
          <option value="">All Officers</option>
          {officers?.map((officer) => (
            <option key={officer.id} value={officer.id}>
              {officer.displayName}
            </option>
          ))}
        </select>
      </div>

      {/* Other Filters */}
      {filterSections.map((section) => (
        <Disclosure
          as="div"
          key={section.id}
          className="border-t border-gray-200 pt-4"
          defaultOpen={true}
        >
          {({ open }) => (
            <>
              <h3 className="-mx-2 -my-3">
                <Disclosure.Button className="flex w-full items-center justify-between bg-white px-2 py-3 text-sm text-gray-400 hover:text-gray-500">
                  <span className="font-medium text-gray-900">
                    {section.name}
                  </span>
                  <span className="ml-6 flex items-center">
                    <ChevronDownIcon
                      className={`h-5 w-5 ${open ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </span>
                </Disclosure.Button>
              </h3>
              <Disclosure.Panel className="pt-6">
                <div className="space-y-4">
                  {section.options.map((option) => (
                    <div key={option.value} className="flex items-center">
                      <input
                        id={`filter-${section.id}-${option.value}`}
                        name={`${section.id}[]`}
                        value={option.value}
                        type="radio"
                        checked={localFilters[section.id as keyof ApplicantFilter] === option.value}
                        onChange={() => handleFilterChange(section.id as keyof ApplicantFilter, option.value)}
                        className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label
                        htmlFor={`filter-${section.id}-${option.value}`}
                        className="ml-3 text-sm text-gray-600"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                  {/* Add clear option */}
                  <div className="flex items-center">
                    <input
                      id={`filter-${section.id}-clear`}
                      name={`${section.id}[]`}
                      value=""
                      type="radio"
                      checked={!localFilters[section.id as keyof ApplicantFilter]}
                      onChange={() => handleFilterChange(section.id as keyof ApplicantFilter, undefined)}
                      className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <label
                      htmlFor={`filter-${section.id}-clear`}
                      className="ml-3 text-sm text-gray-600"
                    >
                      All
                    </label>
                  </div>
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>
      ))}

      {/* Head Office Transfer Filter */}
      <div className="flex items-center">
        <input
          id="transferred-to-ho"
          name="transferred-to-ho"
          type="checkbox"
          checked={localFilters.transferredToHO || false}
          onChange={(e) => handleFilterChange('transferredToHO', e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
        />
        <label
          htmlFor="transferred-to-ho"
          className="ml-3 text-sm text-gray-600"
        >
          Transferred to Head Office
        </label>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile filter dialog */}
      <Transition.Root show={mobileFiltersOpen} as={Fragment}>
        <Dialog as="div" className="relative z-40 lg:hidden" onClose={setMobileFiltersOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 z-40 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <Dialog.Panel className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
                <div className="flex items-center justify-between px-4">
                  <Dialog.Title className="text-lg font-medium text-gray-900">Filters</Dialog.Title>
                  <button
                    type="button"
                    className="-mr-2 flex h-10 w-10 items-center justify-center rounded-md bg-white p-2 text-gray-400 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                    onClick={() => setMobileFiltersOpen(false)}
                  >
                    <span className="sr-only">Close menu</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                {/* Filters */}
                <div className="mt-4 px-4">{renderFilterContent()}</div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop filters */}
      <div className="hidden lg:block">
        <h3 className="sr-only">Filters</h3>
        {renderFilterContent()}
      </div>
    </>
  );
};