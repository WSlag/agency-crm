import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useAgentStore } from '../../stores/agentStore';
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
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'suspended'>('all');
  const [branchFilter, setBranchFilter] = useState<string>('all');

  useEffect(() => {
    if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
      fetchAgentsByBranch(customClaims.branchId);
    } else {
      fetchAllAgents();
    }
  }, [customClaims]);

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
    totalApplicants: agents.reduce((sum, a) => sum + (a.totalApplicants || 0), 0),
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
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 via-cyan-600 to-blue-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Agent Management</h1>
              </div>
              <p className="mt-2 text-teal-100">
                Manage agents, track performance, and monitor commission earnings
              </p>
            </div>
            {canManageAgents && (
              <div className="mt-4 sm:mt-0">
                <Link
                  to="/agents/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-teal-600 bg-white hover:bg-teal-50 transition-all duration-200"
                >
                  <PlusIcon className="h-5 w-5 mr-2" />
                  Add New Agent
                </Link>
              </div>
            )}
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Agents</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Active</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.active}</div>
            </div>
            <div className="bg-gray-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Inactive</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.inactive}</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Applicants</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.totalApplicants}</div>
            </div>
            <div className="bg-blue-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total Commissions</div>
              <div className="text-white text-2xl font-bold mt-1">
                ${stats.totalCommissions.toLocaleString()}
              </div>
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
                  placeholder="Search agents by name, email, or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
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
                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">All Branches</option>
                    {/* TODO: Load branches from store */}
                  </select>
                )}

                {(searchTerm || statusFilter !== 'all' || branchFilter !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setStatusFilter('all');
                      setBranchFilter('all');
                    }}
                    className="text-sm text-teal-600 hover:text-teal-800 font-medium"
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
                <Link
                  key={agent.id}
                  to={`/agents/${agent.id}`}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden"
                >
                  <div className="p-6">
                    {/* Agent Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center text-white font-bold text-lg">
                          {agent.agentName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            {agent.agentName}
                          </h3>
                          <p className="text-sm text-gray-500">{agent.email}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(agent.status)}`}>
                        {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                      </span>
                    </div>

                    {/* Agent Details */}
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center text-gray-600">
                        <BuildingOfficeIcon className="h-4 w-4 mr-2" />
                        <span>Branch: {agent.branchId}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <BanknotesIcon className="h-4 w-4 mr-2" />
                        <span>Commission Amount: ₱{agent.commissionAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        <span>Applicants: {agent.totalApplicants || 0}</span>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-500">Deployed</div>
                        <div className="text-lg font-semibold text-gray-900">
                          {agent.deployedApplicants || 0}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500">Total Earnings</div>
                        <div className="text-lg font-semibold text-teal-600">
                          ${(agent.totalCommissions || 0).toLocaleString()}
                        </div>
                      </div>
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

