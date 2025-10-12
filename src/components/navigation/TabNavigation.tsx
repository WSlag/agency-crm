import React, { useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

interface Tab {
  name: string;
  href: string;
  count?: number;
  disabled?: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
  className?: string;
  ariaLabel?: string;
  onChange?: (href: string) => void;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  className = '',
  ariaLabel = 'Navigation',
  onChange
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = useCallback(
    (href: string) => location.pathname === href,
    [location.pathname]
  );

  const handleTabClick = (href: string) => {
    if (onChange) {
      onChange(href);
    } else {
      navigate(href);
    }
  };

  return (
    <div className={className}>
      <div className="sm:hidden">
        <label htmlFor="tabs" className="sr-only">
          Select a tab
        </label>
        <select
          id="tabs"
          name="tabs"
          className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
          value={location.pathname}
          onChange={(e) => handleTabClick(e.target.value)}
        >
          {tabs.map((tab) => (
            <option key={tab.name} value={tab.href} disabled={tab.disabled}>
              {tab.name}
              {tab.count !== undefined && ` (${tab.count})`}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav
          className="isolate flex divide-x divide-gray-200 rounded-lg shadow"
          aria-label={ariaLabel}
        >
          {tabs.map((tab, tabIdx) => {
            const active = isActive(tab.href);
            return (
              <button
                key={tab.name}
                onClick={() => !tab.disabled && handleTabClick(tab.href)}
                disabled={tab.disabled}
                className={`
                  group relative min-w-0 flex-1 overflow-hidden
                  px-4 py-3 text-center text-sm font-medium
                  hover:bg-gray-50 focus:z-10
                  ${active ? 'text-primary-600' : 'text-gray-500 hover:text-gray-700'}
                  ${tabIdx === 0 ? 'rounded-l-lg' : ''}
                  ${tabIdx === tabs.length - 1 ? 'rounded-r-lg' : ''}
                  ${tab.disabled ? 'cursor-not-allowed opacity-50' : ''}
                `}
                aria-current={active ? 'page' : undefined}
              >
                <span>{tab.name}</span>
                {tab.count !== undefined && (
                  <span
                    className={`
                      ml-2 rounded-full
                      ${active
                        ? 'bg-primary-100 text-primary-600'
                        : 'bg-gray-100 text-gray-900'
                      }
                      px-2.5 py-0.5 text-xs font-medium
                    `}
                  >
                    {tab.count}
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className={`
                    absolute inset-x-0 bottom-0 h-0.5
                    ${active ? 'bg-primary-500' : 'bg-transparent'}
                  `}
                />
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};