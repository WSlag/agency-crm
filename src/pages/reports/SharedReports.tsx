import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import { useAuth } from '../../contexts/AuthContext';
import {
  ShareIcon,
  DocumentTextIcon,
  ArrowDownTrayIcon,
  EyeIcon,
  ClockIcon,
  UserIcon,
} from '@heroicons/react/24/outline';
import type { ReportShare } from '../../types/report';

interface SharedReportWithDetails extends ReportShare {
  reportName?: string;
  reportType?: string;
}

export const SharedReports = () => {
  const { user } = useAuth();
  const [sharedReports, setSharedReports] = useState<SharedReportWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSharedReports();
  }, [user]);

  const fetchSharedReports = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Fetch reports shared with current user (by email or user ID)
      const sharesQuery = query(
        collection(firestore, 'report_shares'),
        where('sharedWith', 'array-contains', user.email || user.uid)
      );

      const snapshot = await getDocs(sharesQuery);
      const shares = await Promise.all(
        snapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Fetch report details
          let reportName = 'Unknown Report';
          let reportType = 'unknown';
          try {
            const reportDoc = await getDocs(
              query(collection(firestore, 'reports'), where('__name__', '==', data.reportId))
            );
            if (!reportDoc.empty) {
              const reportData = reportDoc.docs[0].data();
              reportName = reportData.name || reportName;
              reportType = reportData.type || reportType;
            }
          } catch (err) {
            console.error('Error fetching report details:', err);
          }

          return {
            id: doc.id,
            ...data,
            reportName,
            reportType,
            createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
            updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
            expiresAt: data.expiresAt
              ? data.expiresAt instanceof Timestamp
                ? data.expiresAt.toDate()
                : new Date(data.expiresAt)
              : undefined,
          } as SharedReportWithDetails;
        })
      );

      setSharedReports(shares);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch shared reports');
    } finally {
      setLoading(false);
    }
  };

  const isExpired = (share: SharedReportWithDetails) => {
    if (!share.expiresAt) return false;
    return new Date(share.expiresAt) < new Date();
  };

  return (
    <div className="min-h-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 shadow-xl -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex items-center space-x-3">
            <ShareIcon className="h-8 w-8 text-white" />
            <h1 className="text-3xl font-bold text-white">Shared Reports</h1>
          </div>
          <p className="mt-2 text-purple-100">
            Reports that have been shared with you
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {loading ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-500">Loading shared reports...</p>
              </div>
            ) : error ? (
              <div className="p-12 text-center">
                <DocumentTextIcon className="h-12 w-12 text-red-400 mx-auto" />
                <p className="mt-2 text-sm text-red-600">{error}</p>
              </div>
            ) : sharedReports.length === 0 ? (
              <div className="p-12 text-center">
                <ShareIcon className="h-12 w-12 text-gray-400 mx-auto" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No shared reports</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Reports shared with you will appear here
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {sharedReports.map((share) => (
                  <div
                    key={share.id}
                    className={`p-6 hover:bg-gray-50 transition-colors ${
                      isExpired(share) ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4 flex-1">
                        <div className="flex-shrink-0">
                          <DocumentTextIcon className="h-10 w-10 text-indigo-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {share.reportName}
                          </h3>
                          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                            <div className="flex items-center">
                              <UserIcon className="h-4 w-4 mr-1" />
                              <span>Shared by: {share.sharedByName || 'Unknown'}</span>
                            </div>
                            <div className="flex items-center">
                              <ClockIcon className="h-4 w-4 mr-1" />
                              <span>{new Date(share.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                          <div className="mt-2 flex items-center space-x-2">
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                share.accessLevel === 'download'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {share.accessLevel === 'download' ? (
                                <ArrowDownTrayIcon className="h-3 w-3 mr-1" />
                              ) : (
                                <EyeIcon className="h-3 w-3 mr-1" />
                              )}
                              {share.accessLevel === 'download' ? 'Can Download' : 'View Only'}
                            </span>
                            {share.expiresAt && (
                              <span
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  isExpired(share)
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-yellow-100 text-yellow-800'
                                }`}
                              >
                                <ClockIcon className="h-3 w-3 mr-1" />
                                {isExpired(share)
                                  ? 'Expired'
                                  : `Expires ${new Date(share.expiresAt).toLocaleDateString()}`}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      {!isExpired(share) && (
                        <div className="flex-shrink-0 ml-4">
                          <Link
                            to={`/reports/${share.reportId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            <EyeIcon className="h-4 w-4 mr-2" />
                            View Report
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

