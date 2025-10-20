import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, doc, getDoc } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { 
  ArrowsRightLeftIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import type { ApplicantTransfer } from '../../types/applicant';

type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed';
type FilterTab = 'all' | 'pending' | 'approved' | 'rejected' | 'completed';

interface EnrichedTransfer extends ApplicantTransfer {
  applicantName: string;
  fromBranchName: string;
  toBranchName: string;
  requestedByName: string;
  approvedByName: string | null;
  assignedOfficerName: string | null;
}

export const TransfersList = () => {
  const { customClaims, user } = useAuth();
  const [transfers, setTransfers] = useState<EnrichedTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTransfers();
  }, [activeTab, customClaims]);

  const enrichTransfersWithDetails = async (transfers: ApplicantTransfer[]): Promise<EnrichedTransfer[]> => {
    // Collect unique IDs
    const applicantIds = [...new Set(transfers.map(t => t.applicantId))];
    const branchIds = [...new Set([...transfers.map(t => t.fromBranchId), ...transfers.map(t => t.toBranchId)])];
    const userIds = [...new Set([
      ...transfers.map(t => t.requestedBy),
      ...transfers.filter(t => t.approvedBy).map(t => t.approvedBy!),
      ...transfers.filter(t => t.assignedOfficerId).map(t => t.assignedOfficerId!)
    ])];

    // Fetch all data in parallel
    const [applicantsMap, branchesMap, usersMap] = await Promise.all([
      // Fetch applicants
      (async () => {
        const map = new Map<string, string>();
        await Promise.all(applicantIds.map(async (id) => {
          try {
            const docSnap = await getDoc(doc(firestore, 'applicants', id));
            if (docSnap.exists()) {
              map.set(id, docSnap.data().fullName || 'Unknown Applicant');
            } else {
              map.set(id, 'Unknown Applicant');
            }
          } catch {
            map.set(id, 'Unknown Applicant');
          }
        }));
        return map;
      })(),
      // Fetch branches
      (async () => {
        const map = new Map<string, string>();
        await Promise.all(branchIds.map(async (id) => {
          try {
            const docSnap = await getDoc(doc(firestore, 'branches', id));
            if (docSnap.exists()) {
              map.set(id, docSnap.data().name || 'Unknown Branch');
            } else {
              map.set(id, 'Unknown Branch');
            }
          } catch {
            map.set(id, 'Unknown Branch');
          }
        }));
        return map;
      })(),
      // Fetch users
      (async () => {
        const map = new Map<string, string>();
        await Promise.all(userIds.map(async (id) => {
          try {
            const docSnap = await getDoc(doc(firestore, 'users', id));
            if (docSnap.exists()) {
              const userData = docSnap.data();
              map.set(id, userData.displayName || userData.name || userData.email || 'Unknown User');
            } else {
              map.set(id, 'Unknown User');
            }
          } catch {
            map.set(id, 'Unknown User');
          }
        }));
        return map;
      })()
    ]);

    // Enrich transfers with names
    return transfers.map(transfer => ({
      ...transfer,
      applicantName: applicantsMap.get(transfer.applicantId) || 'Unknown Applicant',
      fromBranchName: branchesMap.get(transfer.fromBranchId) || 'Unknown Branch',
      toBranchName: branchesMap.get(transfer.toBranchId) || 'Unknown Branch',
      requestedByName: usersMap.get(transfer.requestedBy) || 'Unknown User',
      approvedByName: transfer.approvedBy ? (usersMap.get(transfer.approvedBy) || 'Unknown User') : null,
      assignedOfficerName: transfer.assignedOfficerId ? (usersMap.get(transfer.assignedOfficerId) || 'Unknown User') : null
    }));
  };

  const fetchTransfers = async () => {
    try {
      setLoading(true);
      
      // Build query constraints array
      const constraints: any[] = [];

      // Role-based filtering
      if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
        constraints.push(where('fromBranchId', '==', customClaims.branchId));
      } else if (customClaims?.role === 'ho_recruitment_officer' && user?.uid) {
        constraints.push(where('assignedOfficerId', '==', user.uid));
      }
      // Admin and President see all (no filter)

      // Apply status filter
      if (activeTab !== 'all') {
        constraints.push(where('transferStatus', '==', activeTab));
      }

      // Add ordering
      constraints.push(orderBy('requestedDate', 'desc'));

      // Build the query with all constraints
      const q = query(collection(firestore, 'transfers'), ...constraints);

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
          notes: data.notes || '',
          rejectionReason: data.rejectionReason || undefined
        };
      }) as ApplicantTransfer[];

      // Enrich transfers with names
      const enrichedTransfers = await enrichTransfersWithDetails(transfersData);
      setTransfers(enrichedTransfers);
    } catch (error) {
      console.error('Error fetching transfers:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTransfers = transfers.filter(transfer =>
    searchTerm === '' ||
    transfer.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.transferReason.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toBranchName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.requestedByName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (transfer.approvedByName && transfer.approvedByName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (transfer.assignedOfficerName && transfer.assignedOfficerName.toLowerCase().includes(searchTerm.toLowerCase()))
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
    { id: 'rejected' as FilterTab, name: 'Rejected', count: transfers.filter(t => t.transferStatus === 'rejected').length },
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
                <ArrowsRightLeftIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Transfer History</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                View transfer history across your accessible transfers
              </p>
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
                    {searchTerm 
                      ? `No transfers match your search "${searchTerm}"`
                      : activeTab === 'all'
                      ? 'No transfer history available.'
                      : `No ${activeTab} transfers found.`
                    }
                  </p>
                </div>
              ) : (
                filteredTransfers.map((transfer) => (
                  <div
                    key={transfer.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <div className="space-y-3">
                      {/* Top Row: Applicant Name (Linked) + Status Badge */}
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/applicants/${transfer.applicantId}`}
                          className="flex items-center space-x-2 flex-1 min-w-0 group"
                        >
                          <UserIcon className="h-5 w-5 text-gray-400 flex-shrink-0" />
                          <span className="text-base font-semibold text-gray-900 truncate group-hover:text-indigo-600 transition-colors">
                            {transfer.applicantName}
                          </span>
                        </Link>
                        <span className={`
                          ml-3 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border flex-shrink-0
                          ${getStatusBadge(transfer.transferStatus)}
                        `}>
                          {transfer.transferStatus.charAt(0).toUpperCase() + transfer.transferStatus.slice(1)}
                        </span>
                      </div>

                      {/* Transfer Reason */}
                      <div className="flex items-start space-x-2">
                        <span className="text-sm text-gray-600 italic">
                          "{transfer.transferReason}"
                        </span>
                      </div>

                      {/* Branch Transfer Info */}
                      <div className="flex items-center space-x-2 text-sm text-gray-700">
                        <BuildingOfficeIcon className="h-4 w-4 text-gray-400 flex-shrink-0" />
                        <span className="font-medium">{transfer.fromBranchName}</span>
                        <span className="text-gray-400">→</span>
                        <span className="font-medium">{transfer.toBranchName}</span>
                      </div>

                      {/* Requested By & Date */}
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <span>Requested by <span className="font-medium text-gray-700">{transfer.requestedByName}</span> on {transfer.requestedDate.toLocaleDateString()}</span>
                      </div>

                      {/* Approved/Rejected Info */}
                      {transfer.transferStatus === 'approved' && transfer.approvedByName && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <CheckCircleIcon className="h-4 w-4 text-green-500" />
                            <span>Approved by <span className="font-medium text-gray-700">{transfer.approvedByName}</span></span>
                            {transfer.approvedDate && <span>on {transfer.approvedDate.toLocaleDateString()}</span>}
                          </div>
                          {transfer.assignedOfficerName && (
                            <>
                              <span>•</span>
                              <span>Assigned to <span className="font-medium text-gray-700">{transfer.assignedOfficerName}</span></span>
                            </>
                          )}
                        </div>
                      )}

                      {transfer.transferStatus === 'rejected' && (
                        <div className="space-y-1">
                          <div className="flex items-center space-x-1 text-xs text-gray-500">
                            <XCircleIcon className="h-4 w-4 text-red-500" />
                            <span>Rejected by <span className="font-medium text-gray-700">{transfer.approvedByName || 'Unknown'}</span></span>
                            {transfer.approvedDate && <span>on {transfer.approvedDate.toLocaleDateString()}</span>}
                          </div>
                          {transfer.rejectionReason && (
                            <div className="ml-5">
                              <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                                Reason: {transfer.rejectionReason}
                              </span>
                            </div>
                          )}
                        </div>
                      )}

                      {transfer.transferStatus === 'completed' && transfer.completedDate && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                          <CheckCircleIcon className="h-4 w-4 text-blue-500" />
                          <span>Completed on {transfer.completedDate.toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

