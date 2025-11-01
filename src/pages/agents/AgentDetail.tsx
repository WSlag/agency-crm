import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAgentStore } from '../../stores/agentStore';
import { useBranchStore } from '../../stores/branchStore';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  ArrowLeftIcon,
  PencilIcon,
  UserCircleIcon,
  ChartBarIcon,
  UsersIcon,
  BanknotesIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import type { AgentPerformance } from '../../types/agent';

type TabType = 'profile' | 'performance' | 'applicants' | 'commissions';

export const AgentDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customClaims } = useAuth();
  const { selectedAgent, loading, error, fetchAgentById, fetchAgentPerformance } = useAgentStore();
  const { branches, fetchBranches } = useBranchStore();
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [performance, setPerformance] = useState<AgentPerformance | null>(null);
  const [applicants, setApplicants] = useState<any[]>([]);
  const [commissions, setCommissions] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  useEffect(() => {
    // Fetch branches for branch name display
    if (branches.length === 0) {
      fetchBranches();
    }
    
    if (id) {
      fetchAgentById(id);
    }
  }, [id]);

  // Helper function to get branch name
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  useEffect(() => {
    if (id && activeTab === 'performance') {
      loadPerformanceData();
    } else if (id && activeTab === 'applicants') {
      loadApplicants();
    } else if (id && activeTab === 'commissions') {
      loadCommissions();
    }
  }, [id, activeTab]);

  const loadPerformanceData = async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      const data = await fetchAgentPerformance(id);
      setPerformance(data);
    } catch (error) {
      console.error('Error loading performance:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadApplicants = async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      const applicantsRef = collection(firestore, 'applicants');
      const q = query(applicantsRef, where('agentId', '==', id), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setApplicants(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    } catch (error) {
      console.error('Error loading applicants:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const loadCommissions = async () => {
    if (!id) return;
    try {
      setLoadingData(true);
      const commissionsRef = collection(firestore, 'commissions');
      const q = query(commissionsRef, where('agentId', '==', id), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      // Fetch applicant details for each commission
      const commissionsWithApplicants = await Promise.all(
        snapshot.docs.map(async (commissionDoc) => {
          const commissionData = { id: commissionDoc.id, ...commissionDoc.data() };
          
          // Fetch applicant name if applicantId exists
          if (commissionData.applicantId) {
            try {
              const applicantDocRef = doc(firestore, 'applicants', commissionData.applicantId);
              const applicantSnapshot = await getDoc(applicantDocRef);
              
              if (applicantSnapshot.exists()) {
                const applicantData = applicantSnapshot.data();
                commissionData.applicantName = applicantData.fullName || 'Unknown';
              } else {
                commissionData.applicantName = 'Not Found';
              }
            } catch (err) {
              console.error('Error fetching applicant:', err);
              commissionData.applicantName = 'Error';
            }
          } else {
            commissionData.applicantName = 'N/A';
          }
          
          return commissionData;
        })
      );
      
      setCommissions(commissionsWithApplicants);
    } catch (error) {
      console.error('Error loading commissions:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const canEdit = customClaims?.role === 'admin' || 
    (customClaims?.role === 'branch_manager' && selectedAgent?.branchId === customClaims?.branchId);

  const tabs = [
    { id: 'profile' as TabType, name: 'Profile', icon: UserCircleIcon },
    { id: 'performance' as TabType, name: 'Performance', icon: ChartBarIcon },
    { id: 'applicants' as TabType, name: 'Applicants', icon: UsersIcon },
    { id: 'commissions' as TabType, name: 'Commissions', icon: BanknotesIcon },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      case 'suspended':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading || !selectedAgent) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-teal-600"></div>
        <p className="mt-4 text-gray-600 font-medium">Loading agent details...</p>
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
              onClick={() => navigate('/agents')}
              className="mt-4 text-sm text-red-600 hover:text-red-800 font-medium"
            >
              Back to Agents
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-4">
            <Link
              to="/agents"
              className="inline-flex items-center text-white hover:text-teal-100"
            >
              <ArrowLeftIcon className="h-5 w-5 mr-2" />
              Back to Agents
            </Link>
          </div>
          
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="flex items-center space-x-4">
              <div className="h-16 w-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold text-2xl">
                {selectedAgent.agentName?.charAt(0).toUpperCase() || '?'}
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-white">{selectedAgent.agentName || 'Unknown Agent'}</h1>
                <p className="mt-1 text-teal-100">{selectedAgent.email || 'No email'}</p>
              </div>
            </div>
            {canEdit && (
              <div className="mt-4 sm:mt-0">
                <Link
                  to={`/agents/${id}/edit`}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-teal-600 bg-white hover:bg-teal-50"
                >
                  <PencilIcon className="h-5 w-5 mr-2" />
                  Edit Agent
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
                          ? 'border-teal-500 text-teal-600'
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
              {activeTab === 'profile' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Contact Number</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedAgent.contactNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Status</h3>
                      <span className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedAgent.status)}`}>
                        {selectedAgent.status.charAt(0).toUpperCase() + selectedAgent.status.slice(1)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Branch</h3>
                      <p className="mt-1 text-sm text-gray-900">{getBranchName(selectedAgent.branchId)}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Commission Amount</h3>
                      <p className="mt-1 text-sm text-gray-900">₱{selectedAgent.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                    </div>
                    <div className="md:col-span-2">
                      <h3 className="text-sm font-medium text-gray-500">Address</h3>
                      <p className="mt-1 text-sm text-gray-900">{selectedAgent.address}</p>
                    </div>
                    {selectedAgent.licenseNumber && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">License Number</h3>
                        <p className="mt-1 text-sm text-gray-900">{selectedAgent.licenseNumber}</p>
                      </div>
                    )}
                    {selectedAgent.licenseExpiry && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">License Expiry</h3>
                        <p className="mt-1 text-sm text-gray-900">
                          {selectedAgent.licenseExpiry.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="space-y-6">
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading performance data...</p>
                    </div>
                  ) : performance ? (
                    <>
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="bg-blue-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-blue-600">Total Applicants</div>
                          <div className="text-2xl font-bold text-blue-900 mt-1">{performance.totalApplicants}</div>
                        </div>
                        <div className="bg-green-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-green-600">Deployed</div>
                          <div className="text-2xl font-bold text-green-900 mt-1">{performance.deployedApplicants}</div>
                        </div>
                        <div className="bg-yellow-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-yellow-600">Success Rate</div>
                          <div className="text-2xl font-bold text-yellow-900 mt-1">{performance.successRate.toFixed(1)}%</div>
                        </div>
                        <div className="bg-teal-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-teal-600">Total Earnings</div>
                          <div className="text-2xl font-bold text-teal-900 mt-1">₱{performance.totalCommissionsEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-600">Active Applicants</div>
                          <div className="text-xl font-bold text-gray-900 mt-1">{performance.activeApplicants}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-600">Pending Commissions</div>
                          <div className="text-xl font-bold text-gray-900 mt-1">₱{performance.pendingCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="text-sm font-medium text-gray-600">Paid Commissions</div>
                          <div className="text-xl font-bold text-gray-900 mt-1">₱{performance.paidCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <p className="text-center text-gray-500">No performance data available</p>
                  )}
                </div>
              )}

              {activeTab === 'applicants' && (
                <div>
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading applicants...</p>
                    </div>
                  ) : applicants.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No applicants found for this agent</p>
                  ) : (
                    <>
                      {/* Desktop Table View - Hidden on Mobile */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stage</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {applicants.map((applicant) => (
                              <tr key={applicant.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="text-sm font-medium text-gray-900">
                                    {applicant.fullName || applicant.personalInfo?.fullName || 'N/A'}
                                  </div>
                                  {applicant.personalInfo?.email && (
                                    <div className="text-xs text-gray-500">{applicant.personalInfo.email}</div>
                                  )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    applicant.currentStage === 'deployed' ? 'bg-green-100 text-green-800' :
                                    applicant.currentStage === 'processing' ? 'bg-blue-100 text-blue-800' :
                                    applicant.currentStage === 'medical' ? 'bg-purple-100 text-purple-800' :
                                    applicant.currentStage === 'training' ? 'bg-yellow-100 text-yellow-800' :
                                    applicant.currentStage === 'documentation' ? 'bg-orange-100 text-orange-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {applicant.currentStage || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                    applicant.status === 'active' ? 'bg-green-100 text-green-800' :
                                    applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {applicant.status || 'N/A'}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {applicant.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <Link
                                    to={`/applicants/${applicant.id}`}
                                    className="text-teal-600 hover:text-teal-900 font-medium"
                                  >
                                    View Details
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View - Shown on Mobile Only */}
                      <div className="md:hidden space-y-4">
                        {applicants.map((applicant) => (
                          <Link
                            key={applicant.id}
                            to={`/applicants/${applicant.id}`}
                            className="block bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                          >
                            <div className="p-4">
                              {/* Header with Name and Status */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold text-gray-900 truncate">
                                    {applicant.fullName || applicant.personalInfo?.fullName || 'N/A'}
                                  </h3>
                                  {applicant.personalInfo?.email && (
                                    <p className="text-sm text-gray-500 truncate mt-0.5">
                                      {applicant.personalInfo.email}
                                    </p>
                                  )}
                                </div>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                  applicant.status === 'active' ? 'bg-green-100 text-green-800' :
                                  applicant.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  applicant.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {applicant.status || 'N/A'}
                                </span>
                              </div>

                              {/* Stage Badge */}
                              <div className="mb-3">
                                <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
                                  applicant.currentStage === 'deployed' ? 'bg-green-100 text-green-800' :
                                  applicant.currentStage === 'processing' ? 'bg-blue-100 text-blue-800' :
                                  applicant.currentStage === 'medical' ? 'bg-purple-100 text-purple-800' :
                                  applicant.currentStage === 'training' ? 'bg-yellow-100 text-yellow-800' :
                                  applicant.currentStage === 'documentation' ? 'bg-orange-100 text-orange-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  <span className="mr-1.5">📍</span>
                                  {applicant.currentStage ? 
                                    applicant.currentStage.charAt(0).toUpperCase() + applicant.currentStage.slice(1) : 
                                    'N/A'
                                  }
                                </span>
                              </div>

                              {/* Additional Info */}
                              <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                                <div className="flex items-center">
                                  <ClockIcon className="h-4 w-4 mr-1.5" />
                                  <span>Created {applicant.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}</span>
                                </div>
                                <span className="text-teal-600 font-medium">View →</span>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === 'commissions' && (
                <div>
                  {loadingData ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Loading commissions...</p>
                    </div>
                  ) : commissions.length === 0 ? (
                    <p className="text-center text-gray-500 py-12">No commissions found for this agent</p>
                  ) : (
                    <>
                      {/* Desktop Table View - Hidden on Mobile */}
                      <div className="hidden md:block overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Applicant</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requested</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Paid Date</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {commissions.map((commission) => (
                              <tr key={commission.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => navigate(`/commissions/${commission.id}`)}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <div className="flex items-center">
                                    <div>
                                      <div className="font-medium text-gray-900">
                                        {commission.applicantName || 'Loading...'}
                                      </div>
                                      {commission.applicantId && (
                                        <div className="text-xs text-gray-500">
                                          ID: {commission.applicantId.slice(0, 8)}...
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  ₱{(commission.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                                    commission.status === 'partially_paid' ? 'bg-orange-100 text-orange-800' :
                                    commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {commission.status}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {commission.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {commission.lastPaymentDate?.toDate?.()?.toLocaleDateString() || 
                                   commission.paidAt?.toDate?.()?.toLocaleDateString() || '-'}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      {/* Mobile Card View - Shown on Mobile Only */}
                      <div className="md:hidden space-y-4">
                        {commissions.map((commission) => (
                          <div
                            key={commission.id}
                            onClick={() => navigate(`/commissions/${commission.id}`)}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden cursor-pointer"
                          >
                            <div className="p-4">
                              {/* Header with Applicant Name and Status */}
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                  <h3 className="text-base font-semibold text-gray-900">
                                    {commission.applicantName || 'Loading...'}
                                  </h3>
                                  {commission.applicantId && (
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      ID: {commission.applicantId.slice(0, 8)}...
                                    </p>
                                  )}
                                </div>
                                <span className={`ml-2 inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${
                                  commission.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  commission.status === 'partially_paid' ? 'bg-orange-100 text-orange-800' :
                                  commission.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {commission.status === 'partially_paid' ? 'Partial' : 
                                   commission.status ? commission.status.charAt(0).toUpperCase() + commission.status.slice(1) : 'N/A'}
                                </span>
                              </div>

                              {/* Amount Display */}
                              <div className="mb-3 py-2 px-3 bg-teal-50 rounded-lg">
                                <div className="text-xs text-teal-600 font-medium">Commission Amount</div>
                                <div className="text-xl font-bold text-teal-900 mt-0.5">
                                  ₱{(commission.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                </div>
                              </div>

                              {/* Date Information */}
                              <div className="space-y-2 text-xs text-gray-500">
                                <div className="flex items-center justify-between">
                                  <span className="flex items-center">
                                    <ClockIcon className="h-4 w-4 mr-1.5" />
                                    Requested
                                  </span>
                                  <span className="font-medium text-gray-700">
                                    {commission.createdAt?.toDate?.()?.toLocaleDateString() || 'N/A'}
                                  </span>
                                </div>
                                {(commission.lastPaymentDate || commission.paidAt) && (
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center">
                                      <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                                      Paid Date
                                    </span>
                                    <span className="font-medium text-gray-700">
                                      {commission.lastPaymentDate?.toDate?.()?.toLocaleDateString() || 
                                       commission.paidAt?.toDate?.()?.toLocaleDateString()}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* View Details Arrow */}
                              <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                                <span className="text-xs text-teal-600 font-medium">View Details →</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
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

