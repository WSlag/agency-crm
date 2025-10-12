import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';
import { useNavigation } from '../../hooks/useNavigation';
import type { BreadcrumbItem } from '../../types/navigation';

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  showHome?: boolean;
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items: propItems,
  showHome = true,
  className = ''
}) => {
  const { getBreadcrumbs } = useNavigation();
  const items = propItems || getBreadcrumbs();

  return (
    <nav className={`flex ${className}`} aria-label="Breadcrumb">
      <ol role="list" className="flex items-center space-x-4">
        {showHome && (
          <li>
            <div>
              <Link
                to="/"
                className="text-gray-400 hover:text-gray-500"
                aria-label="Home"
              >
                <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              </Link>
            </div>
          </li>
        )}

        {items.map((item, index) => (
          <li key={item.href}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-gray-400"
                aria-hidden="true"
              />
              <Link
                to={item.href}
                className={`ml-4 text-sm font-medium ${
                  item.current
                    ? 'text-gray-700 cursor-default'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                aria-current={item.current ? 'page' : undefined}
                onClick={(e) => {
                  if (item.current) {
                    e.preventDefault();
                  }
                }}
              >
                {item.name}
              </Link>
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
};