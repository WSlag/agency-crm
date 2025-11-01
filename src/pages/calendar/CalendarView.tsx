/**
 * Calendar View Page
 * Main calendar interface with grid/list views and filters
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlusIcon,
  FunnelIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { CalendarGrid } from '../../components/calendar/CalendarGrid';
import { EventList } from '../../components/calendar/EventList';
import { EventModal } from '../../components/calendar/EventModal';
import type { Event, EventType, EventStatus, CalendarView } from '../../types/event';
import { EVENT_TYPE_CONFIG, EVENT_STATUS_CONFIG } from '../../types/event';

export const CalendarViewPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    events,
    loading,
    error,
    filter,
    view,
    setFilter,
    setView,
    fetchEventsByDateRange,
    deleteEvent,
  } = useEventStore();

  const [selectedDate, setSelectedDate] = React.useState(new Date());
  const [selectedEvent, setSelectedEvent] = React.useState<Event | null>(null);
  const [showEventModal, setShowEventModal] = React.useState(false);
  const [showFilters, setShowFilters] = React.useState(false);

  // Fetch events when date range changes
  React.useEffect(() => {
    if (view === 'month') {
      // Get first and last day of current month
      const year = selectedDate.getFullYear();
      const month = selectedDate.getMonth();
      const firstDay = new Date(year, month, 1);
      const lastDay = new Date(year, month + 1, 0, 23, 59, 59);

      fetchEventsByDateRange(firstDay, lastDay, user?.uid);
    } else if (view === 'week') {
      // Get first and last day of current week
      const day = selectedDate.getDay();
      const diff = selectedDate.getDate() - day;
      const firstDay = new Date(selectedDate.setDate(diff));
      const lastDay = new Date(firstDay);
      lastDay.setDate(lastDay.getDate() + 6);
      lastDay.setHours(23, 59, 59);

      fetchEventsByDateRange(firstDay, lastDay, user?.uid);
    } else if (view === 'list') {
      // Get next 30 days
      const today = new Date();
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 30);

      fetchEventsByDateRange(today, futureDate, user?.uid);
    }
  }, [selectedDate, view, user?.uid, fetchEventsByDateRange]);

  const handleEventClick = (event: Event) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await deleteEvent(id);
      setShowEventModal(false);
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  const handleCreateEvent = () => {
    navigate('/calendar/event/new');
  };

  const canEditEvent = (event: Event): boolean => {
    return event.createdBy === user?.uid;
  };

  const canDeleteEvent = (event: Event): boolean => {
    return event.createdBy === user?.uid;
  };

  // Filter events by search term
  const filteredEvents = React.useMemo(() => {
    let filtered = [...events];

    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (event) =>
          event.title.toLowerCase().includes(searchLower) ||
          event.description?.toLowerCase().includes(searchLower)
      );
    }

    if (filter.eventType) {
      filtered = filtered.filter((event) => event.eventType === filter.eventType);
    }

    if (filter.status) {
      filtered = filtered.filter((event) => event.status === filter.status);
    }

    return filtered;
  }, [events, filter]);

  if (loading && events.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-gray-600 mt-1">Manage your events and schedule</p>
            </div>
            <button
              onClick={handleCreateEvent}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-lg"
            >
              <PlusIcon className="h-5 w-5" />
              <span>New Event</span>
            </button>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between bg-white rounded-xl shadow-lg p-4">
            {/* Search & Filters */}
            <div className="flex items-center space-x-3">
              <input
                type="text"
                placeholder="Search events..."
                value={filter.searchTerm || ''}
                onChange={(e) => setFilter({ searchTerm: e.target.value })}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 w-64"
              />
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  showFilters
                    ? 'bg-indigo-100 text-indigo-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <FunnelIcon className="h-5 w-5" />
                <span>Filters</span>
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setView('month')}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  view === 'month'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Squares2X2Icon className="h-5 w-5" />
                <span>Month</span>
              </button>
              <button
                onClick={() => setView('list')}
                className={`px-3 py-2 rounded-lg flex items-center space-x-2 transition-colors ${
                  view === 'list'
                    ? 'bg-white text-indigo-600 shadow'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <ListBulletIcon className="h-5 w-5" />
                <span>List</span>
              </button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="mt-4 bg-white rounded-xl shadow-lg p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Event Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Event Type
                  </label>
                  <select
                    value={filter.eventType || ''}
                    onChange={(e) =>
                      setFilter({ eventType: e.target.value as EventType | undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Types</option>
                    {Object.values(EVENT_TYPE_CONFIG).map((config) => (
                      <option key={config.value} value={config.value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={filter.status || ''}
                    onChange={(e) =>
                      setFilter({ status: e.target.value as EventStatus | undefined })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">All Statuses</option>
                    {Object.values(EVENT_STATUS_CONFIG).map((config) => (
                      <option key={config.value} value={config.value}>
                        {config.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Clear Filters */}
                <div className="flex items-end">
                  <button
                    onClick={() => setFilter({ searchTerm: '', eventType: undefined, status: undefined })}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Clear Filters
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Calendar/List View */}
        {view === 'month' && (
          <CalendarGrid
            events={filteredEvents}
            selectedDate={selectedDate}
            onDateChange={setSelectedDate}
            onEventClick={handleEventClick}
            onDayClick={handleDayClick}
          />
        )}

        {view === 'list' && (
          <EventList
            events={filteredEvents}
            onEventClick={handleEventClick}
            emptyMessage="No upcoming events found"
          />
        )}
      </div>

      {/* Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        event={selectedEvent}
        onDelete={handleDeleteEvent}
        canEdit={selectedEvent ? canEditEvent(selectedEvent) : false}
        canDelete={selectedEvent ? canDeleteEvent(selectedEvent) : false}
      />
    </div>
  );
};
