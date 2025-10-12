import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface Tab {
  id: string;
  label: string;
  path: string;
  roles?: string[];
  count?: number;
}

interface TabNavigationProps {
  tabs: Tab[];
  className?: string;
  onChange?: (tabId: string) => void;
  preserveQuery?: boolean;
}

export const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  className = '',
  onChange,
  preserveQuery = false
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { customClaims } = useAuth();
  const [activeTab, setActiveTab] = useState('');

  // Filter tabs based on user role
  const filteredTabs = tabs.filter(tab => 
    !tab.roles || (customClaims?.role && tab.roles.includes(customClaims.role))
  );

  useEffect(() => {
    // Find the active tab based on the current path
    const currentTab = filteredTabs.find(tab => 
      location.pathname.startsWith(tab.path)
    );
    
    if (currentTab) {
      setActiveTab(currentTab.id);
    } else if (filteredTabs.length > 0) {
      // If no matching tab found, set the first available tab as active
      setActiveTab(filteredTabs[0].id);
    }
  }, [location.pathname, filteredTabs]);

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab.id);
    onChange?.(tab.id);

    const queryString = preserveQuery ? location.search : '';
    navigate(tab.path + queryString);
  };

  if (filteredTabs.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      <div className="sm:hidden">
        <select
          aria-label="Selected tab"
          value={activeTab}
          onChange={(e) => {
            const tab = filteredTabs.find(t => t.id === e.target.value);
            if (tab) handleTabChange(tab);
          }}
          className="block w-full rounded-md border-gray-300 focus:border-primary-500 focus:ring-primary-500"
        >
          {filteredTabs.map((tab) => (
            <option key={tab.id} value={tab.id}>
              {tab.label}
              {tab.count !== undefined && ` (${tab.count})`}
            </option>
          ))}
        </select>
      </div>
      <div className="hidden sm:block">
        <nav className="flex space-x-4" aria-label="Tabs">
          {filteredTabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab)}
                className={`
                  px-3 py-2 text-sm font-medium rounded-md
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                  ${
                    isActive
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }
                `}
                aria-current={isActive ? 'page' : undefined}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span
                    className={`
                      ml-2 px-2 py-0.5 text-xs rounded-full
                      ${
                        isActive
                          ? 'bg-primary-200 text-primary-800'
                          : 'bg-gray-100 text-gray-900'
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
