/**
 * Event List Component
 * Displays events in a list format (alternative to calendar grid)
 */

import React from 'react';
import {
  CalendarIcon,
  ClockIcon,
  MapPinIcon,
  UserGroupIcon,
} from '@heroicons/react/24/outline';
import type { Event } from '../../types/event';
import {
  getEventTypeConfig,
  getEventStatusConfig,
  formatEventTime,
} from '../../types/event';

interface EventListProps {
  events: Event[];
  onEventClick: (event: Event) => void;
  emptyMessage?: string;
}

export const EventList: React.FC<EventListProps> = ({
  events,
  onEventClick,
  emptyMessage = 'No events found',
}) => {
  // Group events by date
  const groupedEvents = React.useMemo(() => {
    const groups: { [key: string]: Event[] } = {};

    events.forEach((event) => {
      const dateKey = event.startDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });

      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });

    return groups;
  }, [events]);

  const groupKeys = Object.keys(groupedEvents).sort((a, b) => {
    const dateA = new Date(groupedEvents[a][0].startDate);
    const dateB = new Date(groupedEvents[b][0].startDate);
    return dateA.getTime() - dateB.getTime();
  });

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
        <CalendarIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {groupKeys.map((dateKey) => (
        <div key={dateKey} className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {/* Date Header */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-3 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">{dateKey}</h3>
          </div>

          {/* Events for this date */}
          <div className="divide-y divide-gray-200">
            {groupedEvents[dateKey].map((event) => {
              const typeConfig = getEventTypeConfig(event.eventType);
              const statusConfig = getEventStatusConfig(event.status);

              return (
                <div
                  key={event.id}
                  onClick={() => onEventClick(event)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start space-x-4">
                    {/* Time */}
                    <div className="flex-shrink-0 w-24 text-right">
                      <p className="text-sm font-medium text-gray-900">
                        {formatEventTime(event.startDate, event.allDay)}
                      </p>
                      {!event.allDay && (
                        <p className="text-xs text-gray-500">
                          {formatEventTime(event.endDate, event.allDay)}
                        </p>
                      )}
                    </div>

                    {/* Event Details */}
                    <div
                      className={`flex-shrink-0 w-1 rounded-full ${typeConfig.bgColor}`}
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="text-base font-semibold text-gray-900 truncate">
                          {event.title}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeConfig.bgColor} ${typeConfig.color}`}
                        >
                          {typeConfig.label}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          {statusConfig.label}
                        </span>
                      </div>

                      {event.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                        {event.location && (
                          <div className="flex items-center space-x-1">
                            <MapPinIcon className="h-4 w-4" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        {event.attendees && event.attendees.length > 0 && (
                          <div className="flex items-center space-x-1">
                            <UserGroupIcon className="h-4 w-4" />
                            <span>
                              {event.attendees.length}{' '}
                              {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                            </span>
                          </div>
                        )}
                        {event.recurrence && (
                          <div className="flex items-center space-x-1">
                            <ClockIcon className="h-4 w-4" />
                            <span>Repeats {event.recurrence.frequency}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
