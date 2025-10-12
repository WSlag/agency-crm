import { ComponentType } from 'react';
import { UserRole } from './auth';

export interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: UserRole[];
  children?: NavigationChild[];
}

export interface NavigationChild {
  name: string;
  href: string;
  roles: UserRole[];
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  type?: 'number' | 'currency' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
}

export interface BreadcrumbItem {
  name: string;
  href: string;
  current: boolean;
}
