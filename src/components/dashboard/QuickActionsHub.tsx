import React from 'react';
import { Link } from 'react-router-dom';
import {
  UserPlusIcon,
  DocumentPlusIcon,
  BanknotesIcon,
  ArrowsRightLeftIcon,
  DocumentTextIcon,
  UsersIcon,
  BriefcaseIcon,
  BoltIcon
} from '@heroicons/react/24/outline';

interface QuickAction {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  color: string;
  badge?: number;
}

interface QuickActionsHubProps {
  role?: string;
}

export const QuickActionsHub: React.FC<QuickActionsHubProps> = ({ role = 'admin' }) => {
  const getActions = (): QuickAction[] => {
    const adminActions: QuickAction[] = [
      {
        id: 'add-applicant',
        title: 'New Applicant',
        description: 'Register applicant',
        icon: UserPlusIcon,
        href: '/applicants/new',
        color: 'from-blue-500 to-cyan-600'
      },
      {
        id: 'approve-expenses',
        title: 'Expenses',
        description: 'Review pending',
        icon: BanknotesIcon,
        href: '/expenses',
        color: 'from-green-500 to-emerald-600'
      },
      {
        id: 'commissions',
        title: 'Commissions',
        description: 'Process requests',
        icon: BanknotesIcon,
        href: '/commissions',
        color: 'from-purple-500 to-pink-600'
      },
      {
        id: 'transfers',
        title: 'Transfers',
        description: 'Manage transfers',
        icon: ArrowsRightLeftIcon,
        href: '/applicants/transfers',
        color: 'from-orange-500 to-red-600'
      },
      {
        id: 'reports',
        title: 'Reports',
        description: 'Generate reports',
        icon: DocumentTextIcon,
        href: '/reports',
        color: 'from-indigo-500 to-purple-600'
      },
      {
        id: 'agents',
        title: 'Agents',
        description: 'Manage agents',
        icon: UsersIcon,
        href: '/agents',
        color: 'from-teal-500 to-cyan-600'
      },
      {
        id: 'jobs',
        title: 'Job Orders',
        description: 'Post new jobs',
        icon: BriefcaseIcon,
        href: '/jobs',
        color: 'from-yellow-500 to-orange-600'
      }
    ];

    const branchManagerActions: QuickAction[] = [
      {
        id: 'add-applicant',
        title: 'New Applicant',
        description: 'Register applicant',
        icon: UserPlusIcon,
        href: '/applicants/new',
        color: 'from-blue-500 to-cyan-600'
      },
      {
        id: 'add-agent',
        title: 'New Agent',
        description: 'Add branch agent',
        icon: UsersIcon,
        href: '/agents/new',
        color: 'from-teal-500 to-cyan-600'
      },
      {
        id: 'approve-expenses',
        title: 'Expenses',
        description: 'Approve branch',
        icon: BanknotesIcon,
        href: '/expenses',
        color: 'from-green-500 to-emerald-600'
      },
      {
        id: 'commissions',
        title: 'Commissions',
        description: 'Review branch',
        icon: BanknotesIcon,
        href: '/commissions',
        color: 'from-purple-500 to-pink-600'
      },
      {
        id: 'transfers',
        title: 'Transfers',
        description: 'Handle transfers',
        icon: ArrowsRightLeftIcon,
        href: '/applicants/transfers',
        color: 'from-orange-500 to-red-600'
      },
      {
        id: 'documents',
        title: 'Documents',
        description: 'View applicant docs',
        icon: DocumentTextIcon,
        href: '/applicants/documents',
        color: 'from-indigo-500 to-purple-600'
      },
      {
        id: 'agents',
        title: 'My Agents',
        description: 'Manage agents',
        icon: UsersIcon,
        href: '/agents',
        color: 'from-pink-500 to-rose-600'
      },
      {
        id: 'jobs',
        title: 'Job Orders',
        description: 'Available jobs',
        icon: BriefcaseIcon,
        href: '/jobs',
        color: 'from-yellow-500 to-orange-600'
      }
    ];

    if (role === 'branch_manager') {
      return branchManagerActions;
    }

    return adminActions;
  };

  const actions = getActions();

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 px-4 sm:px-6 py-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
            <BoltIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white">Quick Actions</h3>
            <p className="text-xs sm:text-sm text-indigo-100">Fast access to common tasks</p>
          </div>
        </div>
      </div>

      {/* Actions Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.id}
                to={action.href}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-3 sm:p-4 hover:border-indigo-300 hover:shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                {/* Badge */}
                {action.badge && action.badge > 0 && (
                  <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 sm:h-6 sm:w-6 flex items-center justify-center shadow-lg animate-pulse">
                    {action.badge > 99 ? '99+' : action.badge}
                  </div>
                )}

                {/* Icon */}
                <div className={`
                  inline-flex p-2 sm:p-3 rounded-xl bg-gradient-to-r ${action.color}
                  mb-2 sm:mb-3 group-hover:scale-110 transition-transform
                `}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>

                {/* Text */}
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 group-hover:text-indigo-600 transition-colors mb-0.5">
                    {action.title}
                  </h4>
                  <p className="text-xs text-gray-500 line-clamp-1">
                    {action.description}
                  </p>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="h-4 w-4 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

