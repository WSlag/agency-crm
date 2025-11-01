/**
 * Event Modal Component
 * Quick view modal for event details with edit/delete actions
 */

import React, { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import {
  XMarkIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import type { Event } from '../../types/event';
import {
  getEventTypeConfig,
  getEventStatusConfig,
  formatEventDateRange,
  formatEventTime,
} from '../../types/event';

interface EventModalProps {
  isOpen: boolean;
  onClose: () => void;
  event: Event | null;
  onDelete?: (id: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

export const EventModal: React.FC<EventModalProps> = ({
  isOpen,
  onClose,
  event,
  onDelete,
  canEdit = false,
  canDelete = false,
}) => {
  const navigate = useNavigate();

  if (!event) return null;

  const typeConfig = getEventTypeConfig(event.eventType);
  const statusConfig = getEventStatusConfig(event.status);

  const handleEdit = () => {
    onClose();
    navigate(`/calendar/event/${event.id}/edit`);
  };

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      onDelete?.(event.id);
      onClose();
    }
  };

  const handleViewDetails = () => {
    onClose();
    navigate(`/calendar/event/${event.id}`);
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-900 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all w-full max-w-lg">
                {/* Header */}
                <div className={`px-6 py-4 ${typeConfig.bgColor} border-b border-gray-200`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>
                      <Dialog.Title className="text-xl font-bold text-gray-900">
                        {event.title}
                      </Dialog.Title>
                    </div>
                    <button
                      onClick={onClose}
                      className="rounded-lg p-1 hover:bg-white hover:bg-opacity-50 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 space-y-4">
                  {/* Date & Time */}
                  <div className="flex items-start space-x-3">
                    <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {formatEventDateRange(event.startDate, event.endDate, event.allDay)}
                      </p>
                      {!event.allDay && (
                        <p className="text-sm text-gray-500">
                          {formatEventTime(event.startDate, event.allDay)} -{' '}
                          {formatEventTime(event.endDate, event.allDay)}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Location */}
                  {event.location && (
                    <div className="flex items-start space-x-3">
                      <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">{event.location}</p>
                    </div>
                  )}

                  {/* Attendees */}
                  {event.attendees && event.attendees.length > 0 && (
                    <div className="flex items-start space-x-3">
                      <UserGroupIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="text-sm text-gray-700">
                          {event.attendees.length}{' '}
                          {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Recurrence */}
                  {event.recurrence && (
                    <div className="flex items-start space-x-3">
                      <ClockIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                      <p className="text-sm text-gray-700">
                        Repeats {event.recurrence.frequency} (every {event.recurrence.interval}{' '}
                        {event.recurrence.frequency === 'daily' ? 'day(s)' : ''}
                        {event.recurrence.frequency === 'weekly' ? 'week(s)' : ''}
                        {event.recurrence.frequency === 'monthly' ? 'month(s)' : ''})
                      </p>
                    </div>
                  )}

                  {/* Description */}
                  {event.description && (
                    <div className="pt-2 border-t border-gray-200">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">
                        {event.description}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={handleViewDetails}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    View Full Details
                  </button>
                  <div className="flex items-center space-x-2">
                    {canEdit && (
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors flex items-center space-x-2"
                      >
                        <PencilIcon className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors flex items-center space-x-2"
                      >
                        <TrashIcon className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    )}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
};
