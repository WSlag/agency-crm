import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  Bars3Icon, 
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
  BellIcon,
  UserCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon
} from '@heroicons/react/24/outline';
import { useNavigation } from '../../hooks/useNavigation';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../hooks/useNotifications';
import { NotificationBadge } from '../notifications/NotificationBadge';

export const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set(['Applicants']));
  const { user, customClaims, signOut } = useAuth();
  const location = useLocation();
  const { filteredNavigation, isActive } = useNavigation();
  const { unreadCount } = useNotifications(user?.uid || '');

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemName)) {
        newSet.delete(itemName);
      } else {
        newSet.add(itemName);
      }
      return newSet;
    });
  };

  return (
    <div className="h-screen overflow-hidden">
      {/* Mobile sidebar */}
      <Transition.Root show={sidebarOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-900/80" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative mr-16 flex w-full max-w-xs flex-1">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                    <button type="button" className="-m-2.5 p-2.5" onClick={() => setSidebarOpen(false)}>
                      <span className="sr-only">Close sidebar</span>
                      <XMarkIcon className="h-6 w-6 text-white" aria-hidden="true" />
                    </button>
                  </div>
                </Transition.Child>
                
                {/* Mobile sidebar content */}
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-indigo-600 to-indigo-800 px-6 pb-4">
                  <div className="flex h-16 shrink-0 items-center">
                    <img className="h-8 w-auto" src="/logo192.png" alt="Company Logo" />
                    <span className="ml-3 text-white font-bold text-lg">Agency CRM</span>
                  </div>
                  
                  {/* User Profile in sidebar */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                    <div className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <UserCircleIcon className="h-10 w-10 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">
                          {user?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-indigo-200 truncate">
                          {customClaims?.role?.replace('_', ' ').toUpperCase()}
                        </p>
                      </div>
                    </div>
                    
                    {/* Profile & Notifications in sidebar */}
                    <div className="mt-3 space-y-2">
                      <Link
                        to="/profile"
                        className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <UserCircleIcon className="h-5 w-5 text-white" />
                          <span className="text-sm text-white">My Profile</span>
                        </div>
                      </Link>
                      
                      <button
                        onClick={() => setNotificationsOpen(!notificationsOpen)}
                        className="w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
                      >
                        <div className="flex items-center space-x-2">
                          <BellIcon className="h-5 w-5 text-white" />
                          <span className="text-sm text-white">Notifications</span>
                        </div>
                        <NotificationBadge count={unreadCount} />
                      </button>
                    </div>
                  </div>
                  
                  <nav className="flex flex-1 flex-col">
                    <ul role="list" className="flex flex-1 flex-col gap-y-7">
                      <li>
                        <ul role="list" className="-mx-2 space-y-1">
                          {filteredNavigation.map((item) => {
                            const hasChildren = item.children && item.children.length > 0;
                            const isExpanded = expandedItems.has(item.name);
                            const hasActiveChild = hasChildren && item.children?.some(child => 
                              location.pathname === child.href || location.pathname.startsWith(child.href + '/')
                            );

                            return (
                              <li key={item.name}>
                                {/* Parent Item */}
                                <div>
                                  <Link
                                    to={hasChildren ? '#' : item.href}
                                    onClick={(e) => {
                                      if (hasChildren) {
                                        e.preventDefault();
                                        toggleExpanded(item.name);
                                      } else {
                                        setSidebarOpen(false);
                                      }
                                    }}
                                    className={`
                                      group flex items-center justify-between gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold
                                      transition-all duration-200 transform hover:scale-[1.02]
                                      ${isActive(item.href) || hasActiveChild
                                        ? 'bg-white text-indigo-600 shadow-lg'
                                        : 'text-white hover:bg-white/10 hover:text-white'
                                      }
                                    `}
                                  >
                                    <div className="flex items-center gap-x-3">
                                      <item.icon
                                        className={`h-6 w-6 shrink-0 ${
                                          isActive(item.href) || hasActiveChild ? 'text-indigo-600' : 'text-indigo-200'
                                        }`}
                                        aria-hidden="true"
                                      />
                                      <span>{item.name}</span>
                                    </div>
                                    {hasChildren && (
                                      isExpanded ? (
                                        <ChevronDownIcon className={`h-4 w-4 ${isActive(item.href) || hasActiveChild ? 'text-indigo-600' : 'text-white'}`} />
                                      ) : (
                                        <ChevronRightIcon className={`h-4 w-4 ${isActive(item.href) || hasActiveChild ? 'text-indigo-600' : 'text-white'}`} />
                                      )
                                    )}
                                  </Link>
                                </div>

                                {/* Children Items */}
                                {hasChildren && isExpanded && (
                                  <ul className="mt-1 ml-4 space-y-1">
                                    {item.children?.map((child) => {
                                      // Filter by role
                                      if (child.roles && customClaims?.role && !child.roles.includes(customClaims.role)) {
                                        return null;
                                      }

                                      return (
                                        <li key={child.href}>
                                          <Link
                                            to={child.href}
                                            onClick={() => setSidebarOpen(false)}
                                            className={`
                                              group flex items-center gap-x-3 rounded-md p-2 pl-10 text-sm
                                              transition-all duration-200
                                              ${isActive(child.href)
                                                ? 'bg-white/20 text-white font-medium'
                                                : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                              }
                                            `}
                                          >
                                            {child.icon && (
                                              <child.icon
                                                className={`h-4 w-4 shrink-0 ${
                                                  isActive(child.href) ? 'text-white' : 'text-indigo-300'
                                                }`}
                                              />
                                            )}
                                            {child.name}
                                          </Link>
                                        </li>
                                      );
                                    })}
                                  </ul>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </li>
                      <li className="mt-auto">
                        <button
                          onClick={() => signOut()}
                          className="group -mx-2 flex w-full gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 text-white hover:bg-red-500/20 transition-colors"
                        >
                          <span className="truncate">Sign out</span>
                        </button>
                      </li>
                    </ul>
                  </nav>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Static collapsible sidebar for desktop */}
      <div 
        className={`
          hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:w-20' : 'lg:w-72'}
        `}
      >
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-gradient-to-b from-indigo-600 to-indigo-800 px-6 pb-4 shadow-xl">
          {/* Header with logo and collapse button */}
          <div className="flex h-16 shrink-0 items-center justify-between">
            <div className="flex items-center overflow-hidden">
              <img className="h-8 w-auto flex-shrink-0" src="/logo192.png" alt="Logo" />
              {!collapsed && (
                <span className="ml-3 text-white font-bold text-lg whitespace-nowrap">
                  Agency CRM
                </span>
              )}
            </div>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-2 rounded-md hover:bg-white/10 text-white transition-colors"
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? (
                <ChevronDoubleRightIcon className="h-5 w-5" />
              ) : (
                <ChevronDoubleLeftIcon className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* User Profile Section */}
          {!collapsed && (
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 hover:bg-white/15 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <UserCircleIcon className="h-10 w-10 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user?.displayName || 'User'}
                  </p>
                  <p className="text-xs text-indigo-200 truncate">
                    {customClaims?.role?.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
              </div>
              
              {/* Notifications Button */}
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="mt-3 w-full flex items-center justify-between px-3 py-2 bg-white/10 hover:bg-white/20 rounded-md transition-all duration-200 group"
              >
                <div className="flex items-center space-x-2">
                  <BellIcon className="h-5 w-5 text-white group-hover:animate-bounce" />
                  <span className="text-sm text-white">Notifications</span>
                </div>
                <NotificationBadge count={unreadCount} />
              </button>
            </div>
          )}
          
          {collapsed && (
            <div className="flex flex-col items-center space-y-3">
              <UserCircleIcon className="h-8 w-8 text-white" />
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 bg-white/10 hover:bg-white/20 rounded-md transition-colors"
              >
                <BellIcon className="h-5 w-5 text-white" />
                <NotificationBadge count={unreadCount} className="absolute -top-1 -right-1" />
              </button>
            </div>
          )}
          
          {/* Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {filteredNavigation.map((item) => {
                    const hasChildren = item.children && item.children.length > 0;
                    const isExpanded = expandedItems.has(item.name);
                    const hasActiveChild = hasChildren && item.children?.some(child => 
                      location.pathname === child.href || location.pathname.startsWith(child.href + '/')
                    );

                    return (
                      <li key={item.name}>
                        {/* Parent Item */}
                        <div>
                          <Link
                            to={hasChildren ? '#' : item.href}
                            onClick={(e) => {
                              if (hasChildren) {
                                e.preventDefault();
                                toggleExpanded(item.name);
                              }
                            }}
                            className={`
                              group flex items-center justify-between gap-x-3 rounded-md p-3 text-sm leading-6 font-semibold
                              transition-all duration-200 transform hover:scale-[1.02]
                              ${collapsed ? 'justify-center' : ''}
                              ${isActive(item.href) || hasActiveChild
                                ? 'bg-white text-indigo-600 shadow-lg'
                                : 'text-white hover:bg-white/10 hover:text-white hover:shadow-md'
                              }
                            `}
                            title={collapsed ? item.name : ''}
                          >
                            <div className="flex items-center gap-x-3">
                              <item.icon
                                className={`h-6 w-6 shrink-0 ${
                                  isActive(item.href) || hasActiveChild ? 'text-indigo-600' : 'text-indigo-200 group-hover:text-white'
                                }`}
                                aria-hidden="true"
                              />
                              {!collapsed && <span>{item.name}</span>}
                            </div>
                            {hasChildren && !collapsed && (
                              isExpanded ? (
                                <ChevronDownIcon className={`h-4 w-4 ${isActive(item.href) || hasActiveChild ? 'text-indigo-600' : 'text-white'}`} />
                              ) : (
                                <ChevronRightIcon className={`h-4 w-4 ${isActive(item.href) || hasActiveChild ? 'text-indigo-600' : 'text-white'}`} />
                              )
                            )}
                          </Link>
                        </div>

                        {/* Children Items */}
                        {hasChildren && isExpanded && !collapsed && (
                          <ul className="mt-1 ml-4 space-y-1">
                            {item.children?.map((child) => {
                              // Filter by role
                              if (child.roles && customClaims?.role && !child.roles.includes(customClaims.role)) {
                                return null;
                              }

                              return (
                                <li key={child.href}>
                                  <Link
                                    to={child.href}
                                    className={`
                                      group flex items-center gap-x-3 rounded-md p-2 pl-10 text-sm
                                      transition-all duration-200
                                      ${isActive(child.href)
                                        ? 'bg-white/20 text-white font-medium'
                                        : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                      }
                                    `}
                                  >
                                    {child.icon && (
                                      <child.icon
                                        className={`h-4 w-4 shrink-0 ${
                                          isActive(child.href) ? 'text-white' : 'text-indigo-300'
                                        }`}
                                      />
                                    )}
                                    {child.name}
                                  </Link>
                                </li>
                              );
                            })}
                          </ul>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </li>
              <li className="mt-auto">
                <button
                  onClick={() => signOut()}
                  className={`
                    group -mx-2 flex w-full gap-x-3 rounded-md p-3 text-sm font-semibold leading-6 
                    text-white hover:bg-red-500/20 transition-all duration-200 hover:scale-[1.02]
                    ${collapsed ? 'justify-center' : ''}
                  `}
                  title={collapsed ? 'Sign out' : ''}
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {!collapsed && <span className="truncate">Sign out</span>}
                </button>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div 
        className={`
          transition-all duration-300 ease-in-out
          ${collapsed ? 'lg:pl-20' : 'lg:pl-72'}
        `}
      >
        {/* Mobile header */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            {user?.displayName}
          </div>
        </div>

        <main className="py-10 h-screen overflow-y-auto bg-gray-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
