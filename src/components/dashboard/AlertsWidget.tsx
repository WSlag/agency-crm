import React from 'react';
import { Link } from 'react-router-dom';
import {
  BellIcon,
  ExclamationTriangleIcon,
  ClockIcon,
  DocumentTextIcon,
  ArrowsRightLeftIcon,
  BanknotesIcon,
  ChevronRightIcon,
  ArrowUpCircleIcon
} from '@heroicons/react/24/outline';
import { useRealtimeAlerts, Alert } from '../../hooks/useRealtimeAlerts';

const getAlertIcon = (type: Alert['type']) => {
  switch (type) {
    case 'expense':
      return BanknotesIcon;
    case 'commission':
      return BanknotesIcon;
    case 'document':
      return DocumentTextIcon;
    case 'transfer':
      return ArrowsRightLeftIcon;
    case 'stage_advancement':
      return ArrowUpCircleIcon;
    default:
      return BellIcon;
  }
};

const getPriorityStyles = (priority: Alert['priority']) => {
  switch (priority) {
    case 'high':
      return {
        bg: 'bg-gradient-to-r from-red-50 to-orange-50',
        border: 'border-red-300',
        iconBg: 'bg-red-500',
        text: 'text-red-700',
        badge: 'bg-red-100 text-red-800'
      };
    case 'medium':
      return {
        bg: 'bg-gradient-to-r from-yellow-50 to-amber-50',
        border: 'border-yellow-300',
        iconBg: 'bg-yellow-500',
        text: 'text-yellow-700',
        badge: 'bg-yellow-100 text-yellow-800'
      };
    case 'low':
      return {
        bg: 'bg-gradient-to-r from-blue-50 to-cyan-50',
        border: 'border-blue-300',
        iconBg: 'bg-blue-500',
        text: 'text-blue-700',
        badge: 'bg-blue-100 text-blue-800'
      };
  }
};

interface AlertsWidgetProps {
  branchId?: string;
}

export const AlertsWidget: React.FC<AlertsWidgetProps> = ({ branchId }) => {
  const { alerts, loading, totalCount } = useRealtimeAlerts(branchId);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="flex items-center space-x-3">
            <div className="h-6 w-6 bg-gray-200 rounded"></div>
            <div className="h-6 w-32 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-100 rounded-lg"></div>
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
              <h3 className="text-base sm:text-lg font-bold text-white">Priority Alerts</h3>
              <p className="text-xs sm:text-sm text-indigo-100">
                {totalCount} item{totalCount !== 1 ? 's' : ''} need{totalCount === 1 ? 's' : ''} attention
              </p>
            </div>
          </div>
          {alerts.length > 0 && (
            <div className="flex items-center space-x-1">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-300 animate-pulse" />
            </div>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="p-4 sm:p-6">
        {alerts.length === 0 ? (
          <div className="text-center py-8 sm:py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-sm sm:text-base font-medium text-gray-900">All caught up!</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">No pending actions at this time</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.map((alert) => {
              const Icon = getAlertIcon(alert.type);
              const styles = getPriorityStyles(alert.priority);

              return (
                <Link
                  key={alert.id}
                  to={alert.actionUrl}
                  className={`
                    block ${styles.bg} border-2 ${styles.border} rounded-xl p-3 sm:p-4
                    hover:shadow-lg transition-all duration-200 transform hover:scale-[1.02]
                    group
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div className={`p-2 ${styles.iconBg} rounded-lg flex-shrink-0`}>
                      <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-semibold text-gray-900 truncate">
                            {alert.title}
                          </p>
                          <p className="text-xs sm:text-sm text-gray-600 mt-0.5">
                            {alert.description}
                          </p>
                        </div>
                        {alert.count && (
                          <span className={`
                            inline-flex items-center px-2 sm:px-2.5 py-1 rounded-full text-xs font-bold
                            ${styles.badge} flex-shrink-0
                          `}>
                            {alert.count}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center text-xs text-gray-500">
                          <ClockIcon className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          <span className="hidden sm:inline">Just now</span>
                          <span className="sm:hidden">Now</span>
                        </div>
                        <span className="inline-flex items-center text-xs sm:text-sm font-medium text-indigo-600 group-hover:text-indigo-800">
                          Take Action
                          <ChevronRightIcon className="h-3 w-3 sm:h-4 sm:w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

