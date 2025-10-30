import {
  HomeIcon,
  UsersIcon,
  BuildingOfficeIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  UserGroupIcon,
  ArrowsRightLeftIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon,
  RectangleStackIcon,
  DocumentDuplicateIcon,
  BellIcon,
  TrophyIcon,
  SparklesIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import type { NavigationItem } from '../types/navigation';

export const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: HomeIcon,
    roles: ['admin', 'president', 'ho_recruitment_officer', 'ho_accountant', 'branch_manager']
  },
  {
    name: 'Financial',
    href: '/financial-dashboard',
    icon: ChartBarIcon,
    roles: ['admin', 'president', 'ho_accountant']
  },
  {
    name: 'Notifications',
    href: '/notifications/all',
    icon: BellIcon,
    roles: ['admin', 'president', 'ho_recruitment_officer', 'ho_accountant', 'branch_manager']
  },
  {
    name: 'Users',
    href: '/users',
    icon: UsersIcon,
    roles: ['admin']
  },
  {
    name: 'Branches',
    href: '/branches',
    icon: BuildingOfficeIcon,
    roles: ['admin', 'president']
  },
  {
    name: 'Applicants',
    href: '/applicants',
    icon: DocumentTextIcon,
    roles: ['admin', 'president', 'branch_manager']
  },
  {
    name: 'My Applicants',
    href: '/my-applicants',
    icon: UserGroupIcon,
    roles: ['ho_recruitment_officer']
  },
  {
    name: 'Officers',
    href: '/officers',
    icon: UserGroupIcon,
    roles: ['admin', 'president']
  },
  {
    name: 'Expenses',
    href: '/expenses',
    icon: BanknotesIcon,
    roles: ['admin', 'president', 'ho_accountant', 'branch_manager']
  },
  {
    name: 'Commissions',
    href: '/commissions',
    icon: CurrencyDollarIcon,
    roles: ['admin', 'president', 'ho_accountant', 'branch_manager']
  },
  {
    name: 'Reports',
    href: '/reports',
    icon: ChartBarIcon,
    roles: ['admin', 'president', 'ho_accountant']
  },
  {
    name: 'Branch Targets',
    href: '/settings/branch-targets',
    icon: TrophyIcon,
    roles: ['admin', 'president']
  },
  {
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    roles: ['admin'],
    children: [
      {
        name: 'System Settings',
        href: '/settings/system',
        icon: SparklesIcon,
        roles: ['admin']
      },
      {
        name: 'Notifications',
        href: '/settings/notifications',
        icon: BellIcon,
        roles: ['admin']
      },
      {
        name: 'Role Permissions',
        href: '/settings/roles',
        icon: ShieldCheckIcon,
        roles: ['admin']
      },
      {
        name: 'Branch Config',
        href: '/settings/branches',
        icon: BuildingOfficeIcon,
        roles: ['admin']
      }
    ]
  },
  {
    name: 'Resume Portal',
    href: '/admin/resume-management',
    icon: DocumentDuplicateIcon,
    roles: ['admin']
  },
  {
    name: 'Agency Info',
    href: '/admin/agency-info',
    icon: BuildingOfficeIcon,
    roles: ['admin']
  },
  {
    name: 'Employer Inquiries',
    href: '/admin/employer-inquiries',
    icon: ClipboardDocumentListIcon,
    roles: ['admin']
  }
];
