import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotificationStore } from '../../stores/notificationStore';
import { NotificationType, NotificationPriority, NotificationStatus } from '../../types/notification';
import {
  BellIcon,
  SparklesIcon,
  FunnelIcon,
  CheckIcon,
  TrashIcon,
  ArchiveBoxIcon,
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

export const NotificationsList = () => {
  const { user } = useAuth();
  const {
    notifications,
    loading,
    error,
    filter,
    sort,
    pagination,
    setFilter,
    setSort,
    setPagination,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    archiveNotification,
    deleteNotification,
    fetchStats,
    stats,
  } = useNotificationStore();

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (user) {
      fetchNotifications(user.uid);
      fetchStats(user.uid);
    }
  }, [user, filter, sort, pagination.page]);

  const handleMarkAsRead = async (id: string) => {
    await markAsRead(id);
    if (user) {
      await fetchNotifications(user.uid);
      await fetchStats(user.uid);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (user) {
      await markAllAsRead(user.uid);
      await fetchNotifications(user.uid);
      await fetchStats(user.uid);
    }
  };

  const handleArchive = async (id: string) => {
    if (window.confirm('Are you sure you want to archive this notification?')) {
      await archiveNotification(id);
      if (user) {
        await fetchNotifications(user.uid);
        await fetchStats(user.uid);
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this notification? This action cannot be undone.')) {
      await deleteNotification(id);
      if (user) {
        await fetchNotifications(user.uid);
        await fetchStats(user.uid);
      }
    }
  };

  const getNotificationIcon = (type: NotificationType) => {
    const iconMap: Record<NotificationType, string> = {
      transfer_request: '🔄',
      transfer_approved: '✅',
      transfer_rejected: '❌',
      officer_assigned: '👤',
      expense_verified: '✓',
      expense_approved: '💰',
      expense_rejected: '⛔',
      commission_verified: '✓',
      commission_approved: '💵',
      commission_rejected: '⛔',
      document_verified: '📄',
      document_rejected: '📛',
      document_expiring: '⚠️',
      stage_change: '📊',
      task_assigned: '✔️',
      message_received: '✉️',
    };
    return iconMap[type] || '🔔';
  };

  const getPriorityColor = (priority: NotificationPriority) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'normal':
        return 'border-l-blue-500 bg-blue-50';
      case 'low':
        return 'border-l-gray-500 bg-gray-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="min-h-full">
      {/* Header with gradient background */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          <div className="sm:flex sm:items-center sm:justify-between">
            <div className="sm:flex-auto">
              <div className="flex items-center space-x-3">
                <BellIcon className="h-8 w-8 text-white" />
                <h1 className="text-3xl font-bold text-white">Notifications</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                Stay updated with all your important notifications
              </p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none space-x-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-200"
              >
                <FunnelIcon className="h-5 w-5 mr-2" />
                Filters
              </button>
              {stats && stats.unread > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-200"
                >
                  <CheckIcon className="h-5 w-5 mr-2" />
                  Mark All Read
                </button>
              )}
            </div>
          </div>

          {/* Stats Cards */}
          {stats && (
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg">
                <dt className="truncate text-sm font-medium text-indigo-100">Total</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{stats.total}</dd>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg">
                <dt className="truncate text-sm font-medium text-indigo-100">Unread</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{stats.unread}</dd>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg">
                <dt className="truncate text-sm font-medium text-indigo-100">High Priority</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{stats.byPriority.high}</dd>
              </div>
              <div className="relative overflow-hidden rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 px-4 py-5 shadow-lg">
                <dt className="truncate text-sm font-medium text-indigo-100">Read</dt>
                <dd className="mt-1 text-3xl font-semibold tracking-tight text-white">{stats.byStatus.read}</dd>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-8 bg-gray-50">
        {/* Filters */}
        {showFilters && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  id="type"
                  value={filter.type || ''}
                  onChange={(e) => setFilter({ ...filter, type: e.target.value as NotificationType || undefined })}
                  className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Types</option>
                  <option value="transfer_request">Transfer Request</option>
                  <option value="transfer_approved">Transfer Approved</option>
                  <option value="expense_approved">Expense Approved</option>
                  <option value="commission_approved">Commission Approved</option>
                  <option value="document_verified">Document Verified</option>
                  <option value="document_expiring">Document Expiring</option>
                  <option value="stage_change">Stage Change</option>
                </select>
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={filter.priority || ''}
                  onChange={(e) => setFilter({ ...filter, priority: e.target.value as NotificationPriority || undefined })}
                  className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Priorities</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={filter.status || ''}
                  onChange={(e) => setFilter({ ...filter, status: e.target.value as NotificationStatus || undefined })}
                  className="block w-full rounded-lg border-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-96">
              <div className="relative">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
                </div>
              </div>
              <p className="mt-4 text-gray-600 font-medium">Loading notifications...</p>
            </div>
          ) : error ? (
            <div className="p-8 text-center text-red-600">{error}</div>
          ) : notifications.length === 0 ? (
            <div className="p-8 text-center">
              <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No notifications</h3>
              <p className="mt-1 text-sm text-gray-500">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-6 border-l-4 ${getPriorityColor(notification.priority)} ${
                    notification.status === 'unread' ? 'bg-blue-50' : 'bg-white'
                  } hover:bg-gray-50 transition-colors`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="text-3xl">{getNotificationIcon(notification.type)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {notification.title}
                          </h3>
                          {notification.status === 'unread' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              New
                            </span>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-gray-600">{notification.body}</p>
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <span>{formatDate(notification.createdAt)}</span>
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                            {notification.priority}
                          </span>
                        </div>
                        {notification.actions && notification.actions.length > 0 && (
                          <div className="mt-3 flex items-center space-x-2">
                            {notification.actions.map((action, index) => (
                              <Link
                                key={index}
                                to={action.url || '#'}
                                className="inline-flex items-center px-3 py-1 text-xs font-medium text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors"
                              >
                                {action.title}
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      {notification.status === 'unread' && (
                        <button
                          onClick={() => handleMarkAsRead(notification.id)}
                          className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 rounded-lg transition-colors"
                          title="Mark as read"
                        >
                          <CheckIcon className="h-5 w-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleArchive(notification.id)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Archive"
                      >
                        <ArchiveBoxIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(notification.id)}
                        className="p-2 text-red-600 hover:text-red-800 hover:bg-red-100 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {notifications.length > 0 && (
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
              <nav className="flex items-center justify-between">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                    disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                    className="relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing page <span className="font-medium">{pagination.page}</span> of{' '}
                      <span className="font-medium">{Math.ceil(pagination.total / pagination.limit)}</span>
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setPagination({ ...pagination, page: Math.max(1, pagination.page - 1) })}
                      disabled={pagination.page === 1}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                      disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
                      className="relative inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                </div>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

