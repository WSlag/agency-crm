import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { 
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  UserIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import type { ApplicantTransfer } from '../../types/applicant';

type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed';
type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

export const TransfersList = () => {
  const { customClaims } = useAuth();
  const [transfers, setTransfers] = useState<ApplicantTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransfers();
  }, [activeTab, customClaims]);

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      let q = query(collection(firestore, 'transfers'), orderBy('requestedDate', 'desc'));

      // Apply status filter
      if (activeTab !== 'all') {
        q = query(
          collection(firestore, 'transfers'),
          where('transferStatus', '==', activeTab),
          orderBy('requestedDate', 'desc')
        );
      }

      // Role-based filtering
      if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
        q = query(
          collection(firestore, 'transfers'),
          where('fromBranchId', '==', customClaims.branchId),
          orderBy('requestedDate', 'desc')
        );
      }

      const snapshot = await getDocs(q);
      const transfersData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          applicantId: data.applicantId,
          fromBranchId: data.fromBranchId,
          toBranchId: data.toBranchId,
          requestedBy: data.requestedBy,
          approvedBy: data.approvedBy || null,
          assignedOfficerId: data.assignedOfficerId || null,
          transferReason: data.transferReason,
          transferStatus: data.transferStatus,
          requestedDate: data.requestedDate?.toDate ? data.requestedDate.toDate() : new Date(data.requestedDate),
          approvedDate: data.approvedDate?.toDate ? data.approvedDate.toDate() : data.approvedDate ? new Date(data.approvedDate) : null,
          completedDate: data.completedDate?.toDate ? data.completedDate.toDate() : data.completedDate ? new Date(data.completedDate) : null,
          notes: data.notes || ''
        };
      }) as ApplicantTransfer[];

      setTransfers(transfersData);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    searchTerm === '' ||
    transfer.applicantId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.transferReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromBranchId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toBranchId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: TransferStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: TransferStatus) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      approved: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      completed: 'bg-blue-100 text-blue-800 border-blue-300'
    };
    return badges[status];
  };

  const tabs = [
    { id: 'all' as FilterTab, name: 'All Transfers', count: transfers.length },
    { id: 'pending' as FilterTab, name: 'Pending', count: transfers.filter(t => t.transferStatus === 'pending').length },
    { id: 'approved' as FilterTab, name: 'Approved', count: transfers.filter(t => t.transferStatus === 'approved').length },
    { id: 'completed' as FilterTab, name: 'Completed', count: transfers.filter(t => t.transferStatus === 'completed').length },
  ];

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Transfer Management</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                View and manage applicant transfers across branches
              </p>
            </div>
            {/* Quick Actions */}
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link
                to="/applicants"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Request Transfer
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px space-x-8 px-6" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
                      transition-all duration-200
                      ${activeTab === tab.id
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.name}
                    <span className={`
                      ml-2 py-0.5 px-2 rounded-full text-xs
                      ${activeTab === tab.id
                        ? 'bg-indigo-100 text-indigo-600'
                        : 'bg-gray-100 text-gray-600'
                      }
                    `}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </nav>
            </div>

            {/* Search Bar */}
            <div className="p-4 bg-gray-50 border-b border-gray-200">
              <div className="relative">
                <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search transfers by applicant, reason, or branch..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Transfers List */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading transfers...</p>
                </div>
              ) : filteredTransfers.length === 0 ? (
                <div className="p-12 text-center">
                  <ArrowsRightLeftIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No transfers found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === 'all' 
                      ? 'No transfer requests have been made yet.'
                      : `No ${activeTab} transfers found.`
                    }
                  </p>
                  {activeTab === 'all' && (
                    <div className="mt-6">
                      <p className="text-sm text-gray-600 mb-4">
                        To request a transfer, select an applicant from All Applicants
                      </p>
                      <Link
                        to="/applicants"
                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <UserIcon className="h-5 w-5 mr-2" />
                        View All Applicants
                      </Link>
                    </div>
                  )}
                </div>
              ) : (
                filteredTransfers.map((transfer) => (
                  <Link
                    key={transfer.id}
                    to={`/applicants/${transfer.applicantId}/transfer`}
                    className="block hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="px-6 py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(transfer.transferStatus)}
                            <div>
                              <div className="flex items-center space-x-2">
                                <UserIcon className="h-4 w-4 text-gray-400" />
                                <p className="text-sm font-medium text-gray-900 truncate">
                                  Applicant ID: {transfer.applicantId}
                                </p>
                              </div>
                              <p className="text-sm text-gray-500 truncate mt-1">
                                {transfer.transferReason}
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                            <div className="flex items-center space-x-1">
                              <BuildingOfficeIcon className="h-4 w-4" />
                              <span>From: {transfer.fromBranchId}</span>
                            </div>
                            <span>→</span>
                            <div className="flex items-center space-x-1">
                              <BuildingOfficeIcon className="h-4 w-4" />
                              <span>To: {transfer.toBranchId}</span>
                            </div>
                            <span>•</span>
                            <span>
                              Requested: {transfer.requestedDate.toLocaleDateString()}
                            </span>
                            {transfer.approvedDate && (
                              <>
                                <span>•</span>
                                <span>
                                  Approved: {transfer.approvedDate.toLocaleDateString()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="ml-4 flex-shrink-0">
                          <span className={`
                            inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                            ${getStatusBadge(transfer.transferStatus)}
                          `}>
                            {transfer.transferStatus.charAt(0).toUpperCase() + transfer.transferStatus.slice(1)}
                          </span>
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
    </div>
  );
};

