import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAgentStore } from '../../stores/agentStore';
import { useBranchStore } from '../../stores/branchStore';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  UsersIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  SparklesIcon,
  CheckCircleIcon,
  XCircleIcon,
  BanknotesIcon,
  UserGroupIcon,
  BuildingOfficeIcon,
  FunnelIcon
} from '@heroicons/react/24/outline';
import type { Agent } from '../../types/agent';

export const AgentManagement = () => {
  const { customClaims } = useAuth();
  const { agents, loading, error, fetchAllAgents, fetchAgentsByBranch } = useAgentStore();
  const { branches, fetchBranches } = useBranchStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');
  const [applicantCounts, setApplicantCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    // Fetch branches for branch name display
    if (branches.length === 0) {
      fetchBranches();
    }
    
    if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
      fetchAgentsByBranch(customClaims.branchId);
    } else {
      fetchAllAgents();
    }
  }, [customClaims]);

  // Fetch applicant counts for each agent
  useEffect(() => {
    const fetchApplicantCounts = async () => {
      if (agents.length === 0) return;
      
      const counts: Record<string, number> = {};
      
      try {
        // Fetch all applicants and group by agentId
        const applicantsRef = collection(firestore, 'applicants');
        const snapshot = await getDocs(applicantsRef);
        
        snapshot.docs.forEach(doc => {
          const agentId = doc.data().agentId;
          if (agentId) {
            counts[agentId] = (counts[agentId] || 0) + 1;
          }
        });
        
        setApplicantCounts(counts);
      } catch (error) {
        console.error('Error fetching applicant counts:', error);
      }
    };
    
    fetchApplicantCounts();
  }, [agents]);

  // Helper function to get branch name
  const getBranchName = (branchId: string) => {
    const branch = branches.find(b => b.id === branchId);
    return branch?.name || branchId;
  };

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = searchTerm === '' ||
      agent.agentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.contactNumber.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || agent.status === statusFilter;
    const matchesBranch = branchFilter === 'all' || agent.branchId === branchFilter;
    
    return matchesSearch && matchesStatus && matchesBranch;
  });

  const stats = {
    total: agents.length,
    active: agents.filter(a => a.status === 'active').length,
    inactive: agents.filter(a => a.status === 'inactive').length,
    totalCommissions: agents.reduce((sum, a) => sum + (a.totalCommissions || 0), 0),
    totalApplicants: Object.values(applicantCounts).reduce((sum, count) => sum + count, 0),
  };

  const getStatusColor = (status: Agent['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-300';
    }
  };

  const canManageAgents = customClaims?.role === 'admin' || customClaims?.role === 'branch_manager';

  return (
    <div className="min-h-full">
      {/* Header - Mobile Optimized */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-2 sm:space-x-3">
                <SparklesIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                <h1 className="text-xl sm:text-3xl font-bold text-white">Agent Management</h1>
              </div>
              <p className="mt-2 text-sm sm:text-base text-teal-100">
                Manage agents, track performance, and monitor commission earnings
              </p>
            </div>
            {canManageAgents && (
              <div className="mt-4 sm:mt-0 sm:ml-4">
                <Link
                  to="/agents/new"
                  className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2.5 sm:py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-teal-600 bg-white hover:bg-teal-50 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New Agent
                </Link>
              </div>
            )}
          </div>

          {/* Statistics Cards - Mobile Responsive Grid */}
          <div className="mt-6 sm:mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-3 py-3 sm:px-4 sm:py-4">
              <div className="text-white text-xs sm:text-sm font-medium">Total Agents</div>
              <div className="text-white text-xl sm:text-2xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg px-3 py-3 sm:px-4 sm:py-4">
              <div className="text-white text-xs sm:text-sm font-medium">Active</div>
              <div className="text-white text-xl sm:text-2xl font-bold mt-1">{stats.active}</div>
            </div>
            <div className="bg-gray-500/20 backdrop-blur-sm rounded-lg px-3 py-3 sm:px-4 sm:py-4">
              <div className="text-white text-xs sm:text-sm font-medium">Inactive</div>
              <div className="text-white text-xl sm:text-2xl font-bold mt-1">{stats.inactive}</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg px-3 py-3 sm:px-4 sm:py-4 col-span-2 lg:col-span-1">
              <div className="text-white text-xs sm:text-sm font-medium">Total Applicants</div>
              <div className="text-white text-xl sm:text-2xl font-bold mt-1">{stats.totalApplicants}</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg px-3 py-3 sm:px-4 sm:py-4 col-span-2 lg:col-span-1">
              <div className="text-white text-xs sm:text-sm font-medium">Total Commissions</div>
              <div className="text-white text-xl sm:text-2xl font-bold mt-1">
                ₱{stats.totalCommissions.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters - Mobile Optimized */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="p-3 sm:p-4 space-y-3 sm:space-y-4">
              {/* Search Bar */}
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search agents by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 sm:py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Filter Options - Responsive Layout */}
              <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4">
                <div className="hidden sm:flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm font-medium text-gray-700">Filters:</span>
                </div>
                
                {/* Mobile: Full Width Filters, Desktop: Auto Width */}
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 flex-1 sm:flex-initial">
                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as any)}
                    className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  {customClaims?.role !== 'branch_manager' && (
                    <select
                      value={branchFilter}
                      onChange={(e) => setBranchFilter(e.target.value)}
                      className="w-full sm:w-auto px-3 py-2.5 sm:py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    >
                      <option value="all">All Branches</option>
                      {/* TODO: Load branches from store */}
                    </select>
                  )}
                </div>

                {(searchTerm || statusFilter !== 'all' || branchFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setBranchFilter('all');
                    }}
                    className="w-full sm:w-auto px-4 py-2 text-sm text-white bg-teal-600 hover:bg-teal-700 rounded-lg font-medium transition-colors sm:bg-transparent sm:text-teal-600 sm:hover:text-teal-800 sm:hover:bg-transparent sm:p-0"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Agent Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading ? (
              <div className="col-span-full p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading agents...</p>
              </div>
            ) : error ? (
              <div className="col-span-full p-12 text-center">
                <XCircleIcon className="mx-auto h-12 w-12 text-red-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading agents</h3>
                <p className="mt-1 text-sm text-gray-500">{error}</p>
                <button
                  onClick={() => fetchAllAgents()}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                >
                  Try Again
                </button>
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-200">
                <UsersIcon className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No agents found</h3>
                <p className="mt-1 text-sm text-gray-500">
                  {searchTerm || statusFilter !== 'all' || branchFilter !== 'all'
                    ? 'Try adjusting your search or filters.'
                    : 'Get started by adding your first agent.'}
                </p>
                {canManageAgents && !searchTerm && statusFilter === 'all' && (
                  <div className="mt-6">
                    <Link
                      to="/agents/new"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                    >
                      <PlusIcon className="h-5 w-5 mr-2" />
                      Add New Agent
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-white rounded-xl shadow-sm border-2 border-gray-200 hover:border-teal-300 hover:shadow-lg transition-all duration-200 overflow-hidden relative"
                >
                  <Link
                    to={`/agents/${agent.id}`}
                    className="block"
                  >
                    <div className="p-4 sm:p-6">
                      {/* Agent Header - Mobile Optimized */}
                      <div className="flex items-start justify-between mb-3 sm:mb-4">
                        <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
                          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
                            {agent.agentName?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                              {agent.agentName || 'Unknown Agent'}
                            </h3>
                            <p className="text-xs sm:text-sm text-gray-500 truncate">{agent.email || 'No email'}</p>
                          </div>
                        </div>
                        <span className={`inline-flex items-center px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(agent.status)} flex-shrink-0 ml-2`}>
                          {agent.status ? agent.status.charAt(0).toUpperCase() + agent.status.slice(1) : 'Unknown'}
                        </span>
                      </div>

                      {/* Agent Details - Mobile Optimized */}
                      <div className="space-y-2 text-xs sm:text-sm">
                        <div className="flex items-center text-gray-600">
                          <BuildingOfficeIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span className="truncate">Branch: {getBranchName(agent.branchId)}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <BanknotesIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Commission Amount: ₱{agent.commissionAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <UserGroupIcon className="h-4 w-4 mr-2 flex-shrink-0" />
                          <span>Applicants: {applicantCounts[agent.id] || 0}</span>
                        </div>
                      </div>

                      {/* Stats - Mobile Optimized */}
                      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-gray-100 grid grid-cols-2 gap-3 sm:gap-4">
                        <div>
                          <div className="text-xs text-gray-500">Deployed</div>
                          <div className="text-base sm:text-lg font-semibold text-gray-900 mt-0.5">
                            {agent.deployedApplicants || 0}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500">Total Earnings</div>
                          <div className="text-base sm:text-lg font-semibold text-teal-600 mt-0.5">
                            ₱{(agent.totalCommissions || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

