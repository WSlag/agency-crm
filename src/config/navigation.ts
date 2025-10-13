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
} from '@heroicons/react/24/outline';
import type { NavigationItem } from '../types/navigation';

export const navigation: NavigationItem[] = [
  {
    name: 'Dashboard',
    href: '/',
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
    roles: ['admin', 'president', 'ho_recruitment_officer', 'branch_manager'],
    children: [
      {
        name: 'All Applicants',
        href: '/applicants',
        icon: ClipboardDocumentListIcon,
        roles: ['admin', 'president', 'ho_recruitment_officer', 'branch_manager']
      },
      {
        name: 'Transfers',
        href: '/applicants/transfers',
        icon: ArrowsRightLeftIcon,
        roles: ['admin', 'president', 'ho_recruitment_officer', 'branch_manager']
      },
      {
        name: 'Documents',
        href: '/applicants/documents',
        icon: DocumentDuplicateIcon,
        roles: ['admin', 'president', 'ho_recruitment_officer', 'branch_manager']
      }
    ]
  },
  {
    name: 'Officers',
    href: '/officers',
    icon: UserGroupIcon,
    roles: ['admin', 'president', 'ho_recruitment_officer']
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
    name: 'Settings',
    href: '/settings',
    icon: Cog6ToothIcon,
    roles: ['admin']
  }
];
