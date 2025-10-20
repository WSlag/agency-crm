import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  UserPlusIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  BanknotesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { collection, query, orderBy, limit, getDocs, where } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

interface Activity {
  id: string;
  type: 'applicant' | 'expense' | 'commission' | 'deployment' | 'system';
  title: string;
  description: string;
  timestamp: Date;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

interface ActivityFeedProps {
  branchId?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ branchId }) => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  useEffect(() => {
    fetchActivities();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchActivities();
    }, 30000);

    return () => clearInterval(interval);
  }, [branchId]);

  const fetchActivities = async () => {
    try {
      setLoading(true);

      // Fetch recent applicants - filter by branch if branchId is provided
      const applicantsQuery = branchId
        ? query(
            collection(firestore, 'applicants'),
            where('branchId', '==', branchId),
            orderBy('createdAt', 'desc'),
            limit(5)
          )
        : query(
            collection(firestore, 'applicants'),
            orderBy('createdAt', 'desc'),
            limit(5)
          );
      const applicantsSnapshot = await getDocs(applicantsQuery);

      const recentActivities: Activity[] = [];

      applicantsSnapshot.forEach(doc => {
        const data = doc.data();
        recentActivities.push({
          id: doc.id,
          type: 'applicant',
          title: 'New Applicant Registered',
          description: data.fullName || 'Unknown',
          timestamp: data.createdAt?.toDate() || new Date(),
          icon: UserPlusIcon,
          color: 'from-blue-500 to-cyan-600'
        });
      });

      // Fetch recent expenses - filter by branch if branchId is provided
      const expensesQuery = branchId
        ? query(
            collection(firestore, 'expenses'),
            where('branchId', '==', branchId),
            orderBy('createdAt', 'desc'),
            limit(3)
          )
        : query(
            collection(firestore, 'expenses'),
            orderBy('createdAt', 'desc'),
            limit(3)
          );
      const expensesSnapshot = await getDocs(expensesQuery);

      expensesSnapshot.forEach(doc => {
        const data = doc.data();
        recentActivities.push({
          id: doc.id,
          type: 'expense',
          title: 'Expense Submitted',
          description: `₱${data.amount?.toLocaleString() || 0}`,
          timestamp: data.createdAt?.toDate() || new Date(),
          icon: BanknotesIcon,
          color: 'from-green-500 to-emerald-600'
        });
      });

      // Fetch recent deployments - filter by branch if branchId is provided
      const deploymentsQuery = branchId
        ? query(
            collection(firestore, 'applicants'),
            where('branchId', '==', branchId),
            orderBy('deployedAt', 'desc'),
            limit(3)
          )
        : query(
            collection(firestore, 'applicants'),
            orderBy('deployedAt', 'desc'),
            limit(3)
          );
      const deploymentsSnapshot = await getDocs(deploymentsQuery);

      deploymentsSnapshot.forEach(doc => {
        const data = doc.data();
        if (data.currentStage === 'deployed') {
          recentActivities.push({
            id: `deployed-${doc.id}`,
            type: 'deployment',
            title: 'Applicant Deployed',
            description: data.fullName || 'Unknown',
            timestamp: data.deployedAt?.toDate() || new Date(),
            icon: CheckCircleIcon,
            color: 'from-purple-500 to-pink-600'
          });
        }
      });

      // Sort by timestamp
      recentActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setActivities(recentActivities.slice(0, 10));
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  if (loading && activities.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-32 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex space-x-3">
                <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 w-2/3 bg-gray-100 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <BellIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Activity Feed</h3>
              <p className="text-xs sm:text-sm text-indigo-100">Recent system activities</p>
            </div>
          </div>
          <button
            onClick={fetchActivities}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            disabled={loading}
          >
            <ArrowPathIcon className={`h-5 w-5 text-white ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Activities List */}
      <div className="p-4 sm:p-6">
        {activities.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm sm:text-base font-medium text-gray-900">No recent activity</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Activities will appear here</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {activities.map((activity) => {
              const Icon = activity.icon;

              return (
                <div
                  key={activity.id}
                  className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 p-2 rounded-lg bg-gradient-to-r ${activity.color}
                    group-hover:scale-110 transition-transform
                  `}>
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
                      {activity.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Last Refresh */}
        <div className="mt-4 pt-4 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </p>
        </div>
      </div>
    </div>
  );
};

