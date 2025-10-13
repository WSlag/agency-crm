import { ComponentType } from 'react';
import { UserRole } from './auth';

export interface NavigationChild {
  name: string;
  href: string;
  icon?: ComponentType<{ className?: string }>;
  roles?: UserRole[];
}

export interface NavigationItem {
  name: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: UserRole[];
  children?: NavigationChild[];
  badge?: () => number | string;
}

export interface DashboardMetric {
  label: string;
  value: string | number;
  type?: 'number' | 'currency' | 'percentage';
  trend?: 'up' | 'down' | 'neutral';
  change?: number;
  trendData?: number[];
  description?: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo';
}

export interface BreadcrumbItem {
  name: string;
  href: string;
  current: boolean;
}
