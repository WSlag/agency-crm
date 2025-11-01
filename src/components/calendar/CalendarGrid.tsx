/**
 * Calendar Grid Component
 * Displays a monthly calendar grid with events
 */

import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import type { Event } from '../../types/event';
import { getEventTypeConfig } from '../../types/event';

interface CalendarGridProps {
  events: Event[];
  selectedDate: Date;
  onDateChange: (date: Date) => void;
  onEventClick: (event: Event) => void;
  onDayClick: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  events,
  selectedDate,
  onDateChange,
  onEventClick,
  onDayClick,
}) => {
  const [currentMonth, setCurrentMonth] = React.useState(selectedDate);

  // Get calendar data
  const { days, monthName, year } = React.useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const monthName = currentMonth.toLocaleDateString('en-US', { month: 'long' });

    // Get first day of month
    const firstDay = new Date(year, month, 1);
    const startingDayOfWeek = firstDay.getDay();

    // Get last day of month
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    // Get previous month's last days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: startingDayOfWeek }, (_, i) => {
      const day = prevMonthLastDay - startingDayOfWeek + i + 1;
      return {
        date: new Date(year, month - 1, day),
        isCurrentMonth: false,
        isPrevMonth: true,
      };
    });

    // Get current month's days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(year, month, i + 1),
      isCurrentMonth: true,
      isPrevMonth: false,
    }));

    // Get next month's first days (to complete the grid)
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const remainingDays = totalDays % 7 === 0 ? 0 : 7 - (totalDays % 7);
    const nextMonthDays = Array.from({ length: remainingDays }, (_, i) => ({
      date: new Date(year, month + 1, i + 1),
      isCurrentMonth: false,
      isPrevMonth: false,
    }));

    const days = [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];

    return { days, monthName, year };
  }, [currentMonth]);

  // Get events for a specific day
  const getEventsForDay = (date: Date): Event[] => {
    return events.filter((event) => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  };

  // Check if date is today
  const isToday = (date: Date): boolean => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // Check if date is selected
  const isSelected = (date: Date): boolean => {
    return (
      date.getFullYear() === selectedDate.getFullYear() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getDate() === selectedDate.getDate()
    );
  };

  // Navigate to previous month
  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentMonth(newDate);
    onDateChange(newDate);
  };

  // Navigate to next month
  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    setCurrentMonth(newDate);
    onDateChange(newDate);
  };

  // Go to today
  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    onDateChange(today);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="bg-white rounded-2xl shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-gray-900">
            {monthName} {year}
          </h2>
          <button
            onClick={goToToday}
            className="px-3 py-1 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
          >
            Today
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={goToPreviousMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
          </button>
          <button
            onClick={goToNextMonth}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next month"
          >
            <ChevronRightIcon className="h-5 w-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Week day headers */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center text-xs font-semibold text-gray-600 py-2"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Calendar days */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dayEvents = getEventsForDay(day.date);
            const isTodayDate = isToday(day.date);
            const isSelectedDate = isSelected(day.date);

            return (
              <div
                key={index}
                onClick={() => onDayClick(day.date)}
                className={`
                  min-h-[100px] p-2 rounded-lg border cursor-pointer transition-all
                  ${!day.isCurrentMonth ? 'bg-gray-50 opacity-50' : 'bg-white hover:bg-gray-50'}
                  ${isTodayDate ? 'border-indigo-500 border-2' : 'border-gray-200'}
                  ${isSelectedDate && !isTodayDate ? 'border-purple-400 border-2' : ''}
                `}
              >
                {/* Day number */}
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`
                      text-sm font-medium
                      ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                      ${isTodayDate ? 'text-indigo-600 font-bold' : ''}
                    `}
                  >
                    {day.date.getDate()}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded-full">
                      {dayEvents.length}
                    </span>
                  )}
                </div>

                {/* Events */}
                <div className="space-y-1">
                  {dayEvents.slice(0, 3).map((event) => {
                    const config = getEventTypeConfig(event.eventType);
                    return (
                      <div
                        key={event.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onEventClick(event);
                        }}
                        className={`
                          text-xs px-2 py-1 rounded truncate cursor-pointer
                          ${config.bgColor} ${config.color} hover:opacity-80 transition-opacity
                        `}
                        title={event.title}
                      >
                        {event.allDay ? (
                          event.title
                        ) : (
                          <>
                            {event.startDate.toLocaleTimeString('en-US', {
                              hour: 'numeric',
                              minute: '2-digit',
                              hour12: true,
                            })}{' '}
                            {event.title}
                          </>
                        )}
                      </div>
                    );
                  })}
                  {dayEvents.length > 3 && (
                    <div className="text-xs text-gray-500 px-2">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
