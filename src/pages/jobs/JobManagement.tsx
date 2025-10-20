import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useJobStore } from '../../stores/jobStore';
import {
  BriefcaseIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  MapPinIcon,
  BanknotesIcon,
  UserGroupIcon,
  FunnelIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import type { Job, JobStatus } from '../../types/job';

export const JobManagement = () => {
  const { customClaims } = useAuth();
  const { jobs, loading, error, fetchAllJobs } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | JobStatus>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

  useEffect(() => {
    fetchAllJobs();
  }, []);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = searchTerm === '' ||
      job.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.employerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
    const matchesCountry = countryFilter === 'all' || job.country === countryFilter;
    
    return matchesSearch && matchesStatus && matchesCountry;
  });

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    filled: jobs.filter(j => j.status === 'filled').length,
    closed: jobs.filter(j => j.status === 'closed').length,
    totalOpenings: jobs.reduce((sum, j) => sum + (j.openings - j.filled), 0),
  };

  const uniqueCountries = Array.from(new Set(jobs.map(j => j.country))).filter(Boolean);

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'filled':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'closed':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const canManageJobs = customClaims?.role === 'admin' || 
    customClaims?.role === 'president' || 
    customClaims?.role === 'ho_recruitment_officer';

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Job Management</h1>
              </div>
              <p className="mt-2 text-blue-100">
                Manage job postings and track applicant assignments
              </p>
            </div>
            {canManageJobs && (
              <div className="mt-4 sm:mt-0">
                <Link
                  to="/jobs/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Post New Job
                </Link>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Jobs</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Open</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.open}</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Filled</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.filled}</div>
            </div>
            <div className="bg-gray-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Closed</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.closed}</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Openings</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.totalOpenings}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-4 space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs by title, employer, country, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filter Options */}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="open">Open</option>
                  <option value="filled">Filled</option>
                  <option value="closed">Closed</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {/* Country Filter */}
                <select
                  value={countryFilter}
                  onChange={(e) => setCountryFilter(e.target.value)}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Countries</option>
                  {uniqueCountries.map(country => (
                    <option key={country} value={country}>{country}</option>
                  ))}
                </select>

                {(searchTerm || statusFilter !== 'all' || countryFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setCountryFilter('all');
                    }}
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Job Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading jobs...</p>
              </div>
            ) : error ? (
              <div className="col-span-full p-12 text-center">
                <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading jobs</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => fetchAllJobs()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredJobs.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-200">
                <BriefcaseIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No jobs found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' || countryFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by posting your first job.'}
                </p>
                {canManageJobs && !searchTerm && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Link
                      to="/jobs/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Post New Job
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              filteredJobs.map((job) => (
                <Link
                  key={job.id}
                  to={`/jobs/${job.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Job Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-1">
                          {job.jobTitle}
                        </h3>
                        <div className="flex items-center text-sm text-gray-600">
                          <BuildingOfficeIcon className="h-4 w-4 mr-1" />
                          <span>{job.employerName}</span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(job.status)}`}>
                        {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                      </span>
                    </div>

                    {/* Job Details */}
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        <span>{job.location}, {job.country}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BanknotesIcon className="h-4 w-4 mr-2" />
                        <span>
                          {job.salaryRange.currency} {job.salaryRange.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - {job.salaryRange.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        <span>{job.filled} / {job.openings} filled</span>
                      </div>
                    </div>

                    {/* Job Type Badge */}
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        {job.jobType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </span>
                      {job.deadline && (
                        <span className="text-xs text-gray-500">
                          Deadline: {job.deadline.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

