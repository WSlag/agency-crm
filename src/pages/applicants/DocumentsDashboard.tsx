import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { 
  DocumentDuplicateIcon,
  MagnifyingGlassIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  ArrowUpTrayIcon,
  DocumentTextIcon,
  UserIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import type { Document } from '../../types/document';

type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired';
type FilterTab = 'all' | 'pending' | 'verified' | 'expiring' | 'expired';

export const DocumentsDashboard = () => {
  const { customClaims } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchDocuments();
  }, [activeTab, customClaims]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      
      // Step 1: If Branch Manager, get applicant IDs from their branch first
      let allowedApplicantIds: string[] | null = null;
      if (customClaims?.role === 'branch_manager' && customClaims?.branchId) {
        const applicantsQuery = query(
          collection(firestore, 'applicants'),
          where('branchId', '==', customClaims.branchId)
        );
        const applicantsSnapshot = await getDocs(applicantsQuery);
        allowedApplicantIds = applicantsSnapshot.docs.map(doc => doc.id);
        
        // If no applicants in branch, return empty
        if (allowedApplicantIds.length === 0) {
          setDocuments([]);
          setLoading(false);
          return;
        }
      }
      
      // Step 2: Fetch documents
      let q = query(
        collection(firestore, 'documents'),
        orderBy('uploadedAt', 'desc'),
        limit(100)
      );

      // Apply status filter
      if (activeTab === 'pending') {
        q = query(
          collection(firestore, 'documents'),
          where('status', '==', 'pending'),
          orderBy('uploadedAt', 'desc')
        );
      } else if (activeTab === 'verified') {
        q = query(
          collection(firestore, 'documents'),
          where('status', '==', 'verified'),
          orderBy('uploadedAt', 'desc')
        );
      } else if (activeTab === 'expired') {
        q = query(
          collection(firestore, 'documents'),
          where('status', '==', 'expired'),
          orderBy('uploadedAt', 'desc')
        );
      } else if (activeTab === 'expiring') {
        // Documents expiring in next 30 days
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        
        q = query(
          collection(firestore, 'documents'),
          where('expiryDate', '<=', thirtyDaysFromNow),
          where('expiryDate', '>', new Date()),
          orderBy('expiryDate', 'asc')
        );
      }

      const snapshot = await getDocs(q);
      let documentsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          applicantId: data.applicantId,
          type: data.type,
          fileName: data.fileName,
          fileUrl: data.fileUrl,
          fileSize: data.fileSize,
          mimeType: data.mimeType,
          uploadedBy: data.uploadedBy,
          uploadedAt: data.uploadedAt?.toDate ? data.uploadedAt.toDate() : new Date(data.uploadedAt),
          verifiedBy: data.verifiedBy,
          verifiedAt: data.verifiedAt?.toDate ? data.verifiedAt.toDate() : data.verifiedAt ? new Date(data.verifiedAt) : undefined,
          status: data.status,
          expiryDate: data.expiryDate?.toDate ? data.expiryDate.toDate() : data.expiryDate ? new Date(data.expiryDate) : undefined,
          metadata: data.metadata
        };
      }) as Document[];

      // Step 3: Filter documents by allowed applicant IDs (for Branch Managers)
      if (allowedApplicantIds !== null) {
        documentsData = documentsData.filter(doc => 
          allowedApplicantIds!.includes(doc.applicantId)
        );
      }

      setDocuments(documentsData);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDocuments = documents.filter(doc =>
    searchTerm === '' ||
    doc.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.applicantId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusIcon = (status: DocumentStatus) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />;
      case 'verified':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />;
      case 'expired':
        return <ExclamationTriangleIcon className="h-5 w-5 text-orange-500" />;
    }
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const badges = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      verified: 'bg-green-100 text-green-800 border-green-300',
      rejected: 'bg-red-100 text-red-800 border-red-300',
      expired: 'bg-orange-100 text-orange-800 border-orange-300'
    };
    return badges[status];
  };

  const getExpiryStatus = (expiryDate?: Date) => {
    if (!expiryDate) return null;
    
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return { text: 'Expired', color: 'text-red-600' };
    if (daysUntilExpiry <= 7) return { text: `${daysUntilExpiry}d left`, color: 'text-red-600' };
    if (daysUntilExpiry <= 30) return { text: `${daysUntilExpiry}d left`, color: 'text-yellow-600' };
    return { text: `${daysUntilExpiry}d left`, color: 'text-gray-600' };
  };

  const tabs = [
    { id: 'all' as FilterTab, name: 'All Documents', count: documents.length },
    { id: 'pending' as FilterTab, name: 'Pending Verification', count: documents.filter(d => d.status === 'pending').length },
    { id: 'verified' as FilterTab, name: 'Verified', count: documents.filter(d => d.status === 'verified').length },
    { id: 'expiring' as FilterTab, name: 'Expiring Soon', count: documents.filter(d => {
      if (!d.expiryDate) return false;
      const days = Math.ceil((d.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30;
    }).length },
    { id: 'expired' as FilterTab, name: 'Expired', count: documents.filter(d => d.status === 'expired').length },
  ];

  // Calculate statistics
  const stats = {
    total: documents.length,
    pending: documents.filter(d => d.status === 'pending').length,
    verified: documents.filter(d => d.status === 'verified').length,
    expiring: documents.filter(d => {
      if (!d.expiryDate) return false;
      const days = Math.ceil((d.expiryDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30;
    }).length,
    expired: documents.filter(d => d.status === 'expired').length
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <SparklesIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Document Management</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                View, manage, and verify applicant documents across the system
              </p>
            </div>
            {/* Quick Actions */}
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Link
                to="/documents/templates"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-white/20 hover:bg-white/30 backdrop-blur-sm transition-all duration-200"
              >
                <DocumentTextIcon className="h-5 w-5 mr-2" />
                Templates
              </Link>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Total</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.total}</div>
            </div>
            <div className="bg-yellow-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Pending</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.pending}</div>
            </div>
            <div className="bg-green-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Verified</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.verified}</div>
            </div>
            <div className="bg-orange-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Expiring</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.expiring}</div>
            </div>
            <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-4">
              <div className="text-white text-sm font-medium">Expired</div>
              <div className="text-white text-2xl font-bold mt-1">{stats.expired}</div>
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
              <nav className="flex -mb-px space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
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
                  placeholder="Search documents by filename, type, or applicant..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            {/* Documents List */}
            <div className="divide-y divide-gray-200">
              {loading ? (
                <div className="p-12 text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                  <p className="mt-4 text-gray-600">Loading documents...</p>
                </div>
              ) : filteredDocuments.length === 0 ? (
                <div className="p-12 text-center">
                  <DocumentDuplicateIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {activeTab === 'all' 
                      ? 'No documents have been uploaded yet.'
                      : `No ${activeTab} documents found.`
                    }
                  </p>
                </div>
              ) : (
                filteredDocuments.map((document) => {
                  const expiryStatus = getExpiryStatus(document.expiryDate);
                  
                  return (
                    <Link
                      key={document.id}
                      to={`/applicants/${document.applicantId}`}
                      className="block hover:bg-gray-50 transition-colors duration-150"
                    >
                      <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-3">
                              {getStatusIcon(document.status)}
                              <div>
                                <div className="flex items-center space-x-2">
                                  <DocumentTextIcon className="h-4 w-4 text-gray-400" />
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {document.fileName}
                                  </p>
                                </div>
                                <p className="text-sm text-gray-500 truncate mt-1">
                                  {document.type.replace(/_/g, ' ').toUpperCase()}
                                </p>
                              </div>
                            </div>
                            <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                              <div className="flex items-center space-x-1">
                                <UserIcon className="h-4 w-4" />
                                <span>Applicant: {document.applicantId}</span>
                              </div>
                              <span>•</span>
                              <span>
                                Uploaded: {document.uploadedAt.toLocaleDateString()}
                              </span>
                              {document.verifiedAt && (
                                <>
                                  <span>•</span>
                                  <span>
                                    Verified: {document.verifiedAt.toLocaleDateString()}
                                  </span>
                                </>
                              )}
                              {expiryStatus && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center space-x-1">
                                    <CalendarIcon className="h-4 w-4" />
                                    <span className={expiryStatus.color}>
                                      {expiryStatus.text}
                                    </span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                          <div className="ml-4 flex-shrink-0 flex items-center space-x-3">
                            <span className={`
                              inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border
                              ${getStatusBadge(document.status)}
                            `}>
                              {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
                            </span>
                            {expiryStatus && (
                              <span className={`text-xs font-medium ${expiryStatus.color}`}>
                                {expiryStatus.text}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

