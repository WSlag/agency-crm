import type { UserRole } from '../types/auth';

export const routes = {
  users: {
    path: '/users',
    roles: ['admin'] as UserRole[],
    children: {
      list: '',
      create: 'new',
      detail: ':id',
      edit: ':id/edit'
    }
  },
  branches: {
    path: '/branches',
    roles: ['admin', 'president'] as UserRole[],
    children: {
      list: '',
      create: 'new',
      detail: ':id',
      edit: ':id/edit',
      dashboard: ':id/dashboard',
      metrics: ':id/metrics'
    }
  },
  applicants: {
    path: '/applicants',
    roles: ['admin', 'president', 'ho_recruitment_officer', 'branch_manager'] as UserRole[],
    children: {
      list: '',
      create: 'new',
      detail: ':id',
      edit: ':id/edit',
      documents: ':id/documents',
      transfers: 'transfers',
      transfersPending: 'transfers/pending',
      transfersActive: 'transfers/active',
      transfersCompleted: 'transfers/completed',
      transferDetail: 'transfers/:transferId',
      transferManagement: ':id/transfer',
      documentsOverview: 'documents',
      documentsPending: 'documents/pending',
      documentsExpiring: 'documents/expiring',
      documentsExpired: 'documents/expired',
      documentsVerify: 'documents/verify',
      documentsTemplates: 'documents/templates',
      documentsUpload: 'documents/upload',
      documentDetail: 'documents/:documentId'
    }
  },
  officers: {
    path: '/officers',
    roles: ['admin', 'president', 'ho_recruitment_officer'] as UserRole[],
    children: {
      list: '',
      dashboard: 'dashboard'
    }
  },
  expenses: {
    path: '/expenses',
    roles: ['admin', 'president', 'ho_accountant', 'branch_manager'] as UserRole[],
    children: {
      list: '',
      create: 'new',
      detail: ':id',
      edit: ':id/edit'
    }
  },
  commissions: {
    path: '/commissions',
    roles: ['admin', 'president', 'ho_accountant', 'branch_manager'] as UserRole[],
    children: {
      list: '',
      create: 'new',
      detail: ':id',
      edit: ':id/edit'
    }
  },
  agents: {
    path: '/agents',
    roles: ['admin', 'president', 'branch_manager', 'ho_accountant'] as UserRole[],
    children: {
      list: '',
      create: 'new',
      detail: ':id',
      edit: ':id/edit'
    }
  }
} as const;

export type RouteConfig = typeof routes;
export type RoutePaths = {
  [K in keyof RouteConfig]: {
    [L in keyof RouteConfig[K]['children']]: string;
  };
};
