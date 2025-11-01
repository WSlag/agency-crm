import React, { useEffect, useRef } from 'react';
import { Transition, Portal } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../hooks/useNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { NotificationType } from '../../services/NotificationService';

const notificationIcons: Record<NotificationType, string> = {
  expiry: '⚠️',
  verification: '✓',
  system: 'ℹ️'
};

interface NotificationCenterProps {
  isOpen: boolean;
  onClose: () => void;
  buttonRef?: React.RefObject<HTMLElement>;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ isOpen, onClose, buttonRef }) => {
  const { user } = useAuth();
  const {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead
  } = useNotifications(user?.uid || '');
  const panelRef = useRef<HTMLDivElement>(null);

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside both the panel AND the button
      const isOutsidePanel = panelRef.current && !panelRef.current.contains(event.target as Node);
      const isOutsideButton = buttonRef?.current && !buttonRef.current.contains(event.target as Node);

      if (isOutsidePanel && isOutsideButton) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);

  // Calculate position based on button ref and viewport
  const getPosition = () => {
    if (!buttonRef?.current) {
      return { left: 0, top: 0 };
    }
    const rect = buttonRef.current.getBoundingClientRect();
    const dropdownWidth = 320; // w-80 = 320px
    const viewportWidth = window.innerWidth;
    const spacing = 8;

    // On mobile (< 640px), position dropdown to align right edge with button
    // On desktop, position to the right of button
    let left: number;

    if (viewportWidth < 640) {
      // Mobile: align right edge of dropdown with right edge of button
      left = rect.right - dropdownWidth;
      // Ensure it doesn't go off left edge
      if (left < spacing) {
        left = spacing;
      }
    } else {
      // Desktop: position to right of button
      left = rect.right + spacing;
      // Ensure it doesn't go off right edge
      if (left + dropdownWidth > viewportWidth - spacing) {
        left = rect.left - dropdownWidth - spacing;
      }
    }

    return {
      left,
      top: rect.bottom + spacing, // Position below button for better mobile UX
    };
  };

  const position = getPosition();

  return (
    <>
      {/* Notification Panel */}
      <Portal>
        <Transition
          show={isOpen}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95"
          enterTo="transform opacity-100 scale-100"
          leave="transition ease-in duration-150"
          leaveFrom="transform opacity-100 scale-100"
          leaveTo="transform opacity-0 scale-95"
        >
          <div
            ref={panelRef}
            className="fixed w-80 max-w-[calc(100vw-2rem)] max-h-96 overflow-y-auto bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50"
            style={{
              left: `${position.left}px`,
              top: `${position.top}px`,
            }}
          >
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Notifications
              </h2>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : error ? (
              <div className="text-red-600 text-center py-4">{error}</div>
            ) : notifications.length === 0 ? (
              <div className="text-gray-500 text-center py-4">
                No new notifications
              </div>
            ) : (
              <>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    className="mb-4 text-sm text-primary-600 hover:text-primary-800"
                  >
                    Mark all as read
                  </button>
                )}
                <div className="space-y-4">
                  {notifications.map((notification) => {
                    // Handle both 'read' boolean and 'status' string properties
                    const isRead = notification.read === true || (notification as any).status === 'read';

                    return (
                      <div
                        key={notification.id}
                        className={`
                          p-3 rounded-lg
                          ${isRead ? 'bg-gray-50' : 'bg-blue-50'}
                        `}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 text-xl">
                            {notificationIcons[notification.type]}
                          </div>
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-gray-500">
                              {notification.message}
                            </p>
                            <div className="mt-2 flex items-center justify-between">
                              <p className="text-xs text-gray-400">
                                {new Date(notification.createdAt).toLocaleDateString()}
                              </p>
                              {!isRead && (
                                <button
                                  onClick={() => handleMarkAsRead(notification.id!)}
                                  className="text-xs text-primary-600 hover:text-primary-800"
                                >
                                  Mark as read
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
        </Transition>
      </Portal>
    </>
  );
};
