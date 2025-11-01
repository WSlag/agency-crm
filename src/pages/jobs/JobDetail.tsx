import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useJobStore } from '../../stores/jobStore';
import { useAuth } from '../../contexts/AuthContext';
import {
  ArrowLeftIcon,
  PencilIcon,
  BriefcaseIcon,
  MapPinIcon,
  BanknotesIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import type { JobAssignment, JobAnalytics } from '../../types/job';

type TabType = 'overview' | 'applicants' | 'requirements' | 'analytics';

export const JobDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customClaims } = useAuth();
  const { selectedJob, loading, error, fetchJobById, fetchJobAssignments, fetchJobAnalytics } = useJobStore();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [assignments, setAssignments] = useState<JobAssignment[]>([]);
  const [analytics, setAnalytics] = useState<JobAnalytics | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    if (id) {
      fetchJobById(id);
    }
  }, [id]);

  useEffect(() => {
    if (id && activeTab === 'applicants') {
      loadAssignments();
    } else if (id && activeTab === 'analytics') {
      loadAnalytics();
    }
  }, [id, activeTab]);

  const loadAssignments = async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      const data = await fetchJobAssignments(id);
      setAssignments(data);
    } catch (error) {
      console.error('Error loading assignments:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadAnalytics = async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      const data = await fetchJobAnalytics(id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const canEdit = customClaims?.role === 'admin' || 
    customClaims?.role === 'president' || 
    customClaims?.role === 'ho_recruitment_officer';

  const tabs = [
    { id: 'overview' as TabType, name: 'Overview', icon: BriefcaseIcon },
    { id: 'applicants' as TabType, name: 'Applicants', icon: UserGroupIcon },
    { id: 'requirements' as TabType, name: 'Requirements', icon: DocumentTextIcon },
    { id: 'analytics' as TabType, name: 'Analytics', icon: ChartBarIcon },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'filled':
        return 'bg-blue-100 text-blue-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getApplicationStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'bg-blue-100 text-blue-800';
      case 'interview':
        return 'bg-yellow-100 text-yellow-800';
      case 'offered':
        return 'bg-purple-100 text-purple-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !selectedJob) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading job details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-4">
            <p className="text-red-800">{error}</p>
            <button
              onClick={() => navigate('/jobs')}
              className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Back to Jobs
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link
              to="/jobs"
              className="inline-flex items-center text-white hover:text-blue-100"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Jobs
            </Link>
          </div>
          
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">{selectedJob.jobTitle}</h1>
              <div className="mt-2 flex items-center space-x-4 text-blue-100">
                <div className="flex items-center">
                  <BuildingOfficeIcon className="h-5 w-5 mr-1" />
                  <span>{selectedJob.employerName}</span>
                </div>
                <div className="flex items-center">
                  <MapPinIcon className="h-5 w-5 mr-1" />
                  <span>{selectedJob.location}, {selectedJob.country}</span>
                </div>
              </div>
            </div>
            {canEdit && (
              <div className="mt-4 sm:mt-0">
                <Link
                  to={`/jobs/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-blue-600 bg-white hover:bg-blue-50"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Job
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px" aria-label="Tabs">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`
                        flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm
                        transition-all duration-200 flex items-center justify-center space-x-2
                        ${activeTab === tab.id
                          ? 'border-blue-500 text-blue-600'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="h-5 w-5" />
                      <span className="hidden sm:inline">{tab.name}</span>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedJob.status)}`}>
                        {selectedJob.status.charAt(0).toUpperCase() + selectedJob.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Job Type</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedJob.jobType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Salary Range</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedJob.salaryRange.currency} {selectedJob.salaryRange.min.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} - {selectedJob.salaryRange.max.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Openings</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedJob.filled} / {selectedJob.openings} filled
                      </p>
                    </div>
                    {selectedJob.deadline && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Application Deadline</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedJob.deadline.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Posted On</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {selectedJob.createdAt.toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Description</h3>
                    <p className="mt-2 text-sm text-gray-900 whitespace-pre-line">
                      {selectedJob.description}
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'applicants' && (
                <div>
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading applicants...</p>
                    </div>
                  ) : assignments.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No applicants assigned to this job yet</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applied</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Notes</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {assignments.map((assignment) => (
                            <tr key={assignment.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {assignment.applicantName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getApplicationStatusColor(assignment.applicationStatus)}`}>
                                  {assignment.applicationStatus.charAt(0).toUpperCase() + assignment.applicationStatus.slice(1)}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {assignment.assignedDate.toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-500">
                                {assignment.notes || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requirements' && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900 mb-2">General Requirements</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {selectedJob.requirements.map((req, idx) => (
                        <li key={idx} className="text-sm text-gray-700">{req}</li>
                      ))}
                    </ul>
                  </div>

                  {selectedJob.requiredSkills.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requiredSkills.map((skill, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedJob.requiredCertifications.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-gray-900 mb-2">Required Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {selectedJob.requiredCertifications.map((cert, idx) => (
                          <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'analytics' && (
                <div>
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading analytics...</p>
                    </div>
                  ) : analytics ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-blue-600">Total Applications</div>
                        <div className="text-xl md:text-2xl font-bold text-blue-900 mt-1">{analytics.totalApplications}</div>
                      </div>
                      <div className="bg-yellow-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-yellow-600">In Interview</div>
                        <div className="text-xl md:text-2xl font-bold text-yellow-900 mt-1">{analytics.interviewCount}</div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-purple-600">Offered</div>
                        <div className="text-xl md:text-2xl font-bold text-purple-900 mt-1">{analytics.offeredCount}</div>
                      </div>
                      <div className="bg-green-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-green-600">Accepted</div>
                        <div className="text-xl md:text-2xl font-bold text-green-900 mt-1">{analytics.acceptedCount}</div>
                      </div>
                      <div className="bg-red-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-red-600">Rejected</div>
                        <div className="text-xl md:text-2xl font-bold text-red-900 mt-1">{analytics.rejectedCount}</div>
                      </div>
                      <div className="bg-indigo-50 rounded-lg p-4">
                        <div className="text-sm font-medium text-indigo-600">Fill Rate</div>
                        <div className="text-xl md:text-2xl font-bold text-indigo-900 mt-1">{analytics.fillRate.toFixed(1)}%</div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-gray-500">No analytics data available</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

