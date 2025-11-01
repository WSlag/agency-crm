/**
 * Event Detail Page
 * Full event information display with edit/delete actions
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeftIcon,
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import {
  getEventTypeConfig,
  getEventStatusConfig,
  formatEventDateRange,
  formatEventTime,
} from '../../types/event';

export const EventDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedEvent,
    loading,
    error,
    fetchEventById,
    deleteEvent,
    markEventAsCompleted,
    markEventAsCancelled,
  } = useEventStore();

  React.useEffect(() => {
    if (id) {
      fetchEventById(id);
    }
  }, [id, fetchEventById]);

  const handleBack = () => {
    navigate('/calendar');
  };

  const handleEdit = () => {
    navigate(`/calendar/event/${id}/edit`);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this event?')) {
      try {
        await deleteEvent(id!);
        navigate('/calendar');
      } catch (error) {
        console.error('Error deleting event:', error);
      }
    }
  };

  const handleMarkAsCompleted = async () => {
    try {
      await markEventAsCompleted(id!);
      fetchEventById(id!);
    } catch (error) {
      console.error('Error marking event as completed:', error);
    }
  };

  const handleMarkAsCancelled = async () => {
    if (window.confirm('Are you sure you want to cancel this event?')) {
      try {
        await markEventAsCancelled(id!);
        fetchEventById(id!);
      } catch (error) {
        console.error('Error marking event as cancelled:', error);
      }
    }
  };

  const canEdit = selectedEvent && selectedEvent.createdBy === user?.uid;
  const canDelete = selectedEvent && selectedEvent.createdBy === user?.uid;
  const canUpdateStatus =
    selectedEvent &&
    (selectedEvent.createdBy === user?.uid || selectedEvent.attendees.includes(user?.uid || '')) &&
    selectedEvent.status === 'scheduled';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600" />
      </div>
    );
  }

  if (error || !selectedEvent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <p className="text-red-700">{error || 'Event not found'}</p>
            <button
              onClick={handleBack}
              className="mt-4 text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Back to Calendar
            </button>
          </div>
        </div>
      </div>
    );
  }

  const typeConfig = getEventTypeConfig(selectedEvent.eventType);
  const statusConfig = getEventStatusConfig(selectedEvent.status);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back to Calendar</span>
        </button>

        {/* Event Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className={`px-6 py-6 ${typeConfig.bgColor} border-b border-gray-200`}>
            <div className="flex items-center space-x-2 mb-3">
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${typeConfig.bgColor} ${typeConfig.color} border-2 ${typeConfig.borderColor}`}
              >
                {typeConfig.label}
              </span>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
              >
                {statusConfig.label}
              </span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900">{selectedEvent.title}</h1>
          </div>

          {/* Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Date & Time */}
            <div className="flex items-start space-x-4">
              <div className="flex-shrink-0">
                <CalendarIcon className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Date & Time</h3>
                <p className="text-base text-gray-900">
                  {formatEventDateRange(
                    selectedEvent.startDate,
                    selectedEvent.endDate,
                    selectedEvent.allDay
                  )}
                </p>
                {!selectedEvent.allDay && (
                  <p className="text-sm text-gray-600 mt-1">
                    {formatEventTime(selectedEvent.startDate, selectedEvent.allDay)} -{' '}
                    {formatEventTime(selectedEvent.endDate, selectedEvent.allDay)}
                  </p>
                )}
              </div>
            </div>

            {/* Location */}
            {selectedEvent.location && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <MapPinIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Location</h3>
                  <p className="text-base text-gray-900">{selectedEvent.location}</p>
                </div>
              </div>
            )}

            {/* Attendees */}
            {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Attendees</h3>
                  <p className="text-base text-gray-900">
                    {selectedEvent.attendees.length}{' '}
                    {selectedEvent.attendees.length === 1 ? 'attendee' : 'attendees'}
                  </p>
                </div>
              </div>
            )}

            {/* Recurrence */}
            {selectedEvent.recurrence && (
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <ClockIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-1">Recurrence</h3>
                  <p className="text-base text-gray-900">
                    Repeats {selectedEvent.recurrence.frequency} (every{' '}
                    {selectedEvent.recurrence.interval}{' '}
                    {selectedEvent.recurrence.frequency === 'daily' ? 'day(s)' : ''}
                    {selectedEvent.recurrence.frequency === 'weekly' ? 'week(s)' : ''}
                    {selectedEvent.recurrence.frequency === 'monthly' ? 'month(s)' : ''})
                  </p>
                  {selectedEvent.recurrence.endDate && (
                    <p className="text-sm text-gray-600 mt-1">
                      Until {selectedEvent.recurrence.endDate.toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Description */}
            {selectedEvent.description && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
                <p className="text-base text-gray-900 whitespace-pre-wrap">
                  {selectedEvent.description}
                </p>
              </div>
            )}

            {/* Reminder */}
            {selectedEvent.reminder?.enabled && (
              <div className="pt-4 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Reminder</h3>
                <p className="text-base text-gray-900">
                  {selectedEvent.reminder.time} minutes before event
                </p>
              </div>
            )}

            {/* Metadata */}
            <div className="pt-4 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Event Details</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Created:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedEvent.createdAt.toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-600">Last Updated:</span>
                  <span className="ml-2 text-gray-900">
                    {selectedEvent.updatedAt.toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center space-x-2">
              {canUpdateStatus && (
                <>
                  <button
                    onClick={handleMarkAsCompleted}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                  >
                    <CheckCircleIcon className="h-5 w-5" />
                    <span>Mark Complete</span>
                  </button>
                  <button
                    onClick={handleMarkAsCancelled}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center space-x-2"
                  >
                    <XCircleIcon className="h-5 w-5" />
                    <span>Cancel Event</span>
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {canEdit && (
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                >
                  <PencilIcon className="h-5 w-5" />
                  <span>Edit</span>
                </button>
              )}
              {canDelete && (
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
                >
                  <TrashIcon className="h-5 w-5" />
                  <span>Delete</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
