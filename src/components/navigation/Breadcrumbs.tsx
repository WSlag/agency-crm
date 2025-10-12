import { Link, useLocation } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';
import { useAuth } from '../../contexts/AuthContext';

interface BreadcrumbConfig {
  path: string;
  label: string;
  roles?: string[];
}

const routeConfigs: Record<string, BreadcrumbConfig> = {
  'dashboard': { path: '/', label: 'Dashboard' },
  'applicants': { path: '/applicants', label: 'Applicants', roles: ['admin', 'branch_manager', 'ho_recruitment_officer'] },
  'documents': { path: '/documents', label: 'Documents', roles: ['admin', 'branch_manager', 'ho_recruitment_officer'] },
  'expenses': { path: '/expenses', label: 'Expenses', roles: ['admin', 'branch_manager', 'ho_accountant'] },
  'reports': { path: '/reports', label: 'Reports', roles: ['admin', 'president', 'ho_accountant'] },
  'settings': { path: '/settings', label: 'Settings', roles: ['admin'] },
};

export const Breadcrumbs = () => {
  const location = useLocation();
  const { customClaims } = useAuth();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  // Build breadcrumb items based on current path and user role
  const breadcrumbs = pathSegments.reduce<Array<{ path: string; label: string }>>((acc, segment, index) => {
    const config = routeConfigs[segment];
    if (config && (!config.roles || (customClaims?.role && config.roles.includes(customClaims.role)))) {
      acc.push({
        path: '/' + pathSegments.slice(0, index + 1).join('/'),
        label: config.label
      });
    }
    return acc;
  }, []);

  if (breadcrumbs.length === 0) {
    return null;
  }

  return (
    <nav className="flex mb-4" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <div>
            <Link
              to="/"
              className="text-gray-400 hover:text-gray-500"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Home</span>
            </Link>
          </div>
        </li>
        {breadcrumbs.map((breadcrumb, index) => {
          const isLast = index === breadcrumbs.length - 1;

          return (
            <li key={breadcrumb.path}>
              <div className="flex items-center">
                <ChevronRightIcon
                  className="h-5 w-5 flex-shrink-0 text-gray-400"
                  aria-hidden="true"
                />
                <Link
                  to={breadcrumb.path}
                  className={`ml-4 text-sm font-medium ${
                    isLast
                      ? 'text-gray-700 cursor-default'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  aria-current={isLast ? 'page' : undefined}
                >
                  {breadcrumb.label}
                </Link>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};
