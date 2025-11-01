/**
 * Event Form Page
 * Create and edit event form with validation
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useEventStore } from '../../stores/eventStore';
import { useAuthStore } from '../../stores/authStore';
import { useBranchStore } from '../../stores/branchStore';
import type { EventFormData, EventType, RecurrenceFrequency } from '../../types/event';
import { EVENT_TYPE_CONFIG } from '../../types/event';

export const EventForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { branches, fetchBranches } = useBranchStore();
  const { selectedEvent, loading, error, fetchEventById, createEvent, updateEvent } =
    useEventStore();

  const isEditMode = Boolean(id);

  // Form state
  const [formData, setFormData] = React.useState<Partial<EventFormData>>({
    title: '',
    description: '',
    eventType: 'meeting',
    status: 'scheduled',
    startDate: new Date(),
    endDate: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
    allDay: false,
    location: '',
    branchId: '',
    attendees: [],
    createdBy: user?.uid || '',
    reminder: {
      enabled: false,
      time: 15,
    },
    recurrence: undefined,
  });

  const [enableRecurrence, setEnableRecurrence] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch event data if editing
  React.useEffect(() => {
    if (isEditMode && id) {
      fetchEventById(id);
    }
  }, [id, isEditMode, fetchEventById]);

  // Fetch branches
  React.useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  // Populate form when event is loaded
  React.useEffect(() => {
    if (isEditMode && selectedEvent) {
      setFormData({
        title: selectedEvent.title,
        description: selectedEvent.description,
        eventType: selectedEvent.eventType,
        status: selectedEvent.status,
        startDate: new Date(selectedEvent.startDate),
        endDate: new Date(selectedEvent.endDate),
        allDay: selectedEvent.allDay,
        location: selectedEvent.location,
        branchId: selectedEvent.branchId,
        attendees: selectedEvent.attendees || [],
        createdBy: selectedEvent.createdBy,
        reminder: selectedEvent.reminder,
        recurrence: selectedEvent.recurrence,
      });

      if (selectedEvent.recurrence) {
        setEnableRecurrence(true);
      }
    }
  }, [isEditMode, selectedEvent]);

  const handleInputChange = (field: keyof EventFormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDateTimeChange = (field: 'startDate' | 'endDate', dateString: string) => {
    const date = new Date(dateString);
    setFormData((prev) => ({ ...prev, [field]: date }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // Validation
      if (!formData.title || !formData.branchId) {
        alert('Please fill in all required fields');
        setSubmitting(false);
        return;
      }

      if (formData.endDate! < formData.startDate!) {
        alert('End date must be after start date');
        setSubmitting(false);
        return;
      }

      const eventData: EventFormData = {
        title: formData.title!,
        description: formData.description || '',
        eventType: formData.eventType!,
        status: formData.status!,
        startDate: formData.startDate!,
        endDate: formData.endDate!,
        allDay: formData.allDay!,
        location: formData.location,
        branchId: formData.branchId!,
        attendees: formData.attendees || [user?.uid || ''],
        applicantId: formData.applicantId || null,
        createdBy: user?.uid || '',
        reminder: formData.reminder,
        recurrence: enableRecurrence ? formData.recurrence : undefined,
      };

      if (isEditMode && id) {
        await updateEvent(id, eventData);
      } else {
        await createEvent(eventData);
      }

      navigate('/calendar');
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Format date for datetime-local input
  const formatDateTimeLocal = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  if (loading && isEditMode) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-6">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="mb-4 flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeftIcon className="h-5 w-5" />
          <span>Back</span>
        </button>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-white">
              {isEditMode ? 'Edit Event' : 'Create New Event'}
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter event title"
                required
              />
            </div>

            {/* Event Type & Branch */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Event Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.eventType}
                  onChange={(e) => handleInputChange('eventType', e.target.value as EventType)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  {Object.values(EVENT_TYPE_CONFIG).map((config) => (
                    <option key={config.value} value={config.value}>
                      {config.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Branch <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.branchId}
                  onChange={(e) => handleInputChange('branchId', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                >
                  <option value="">Select Branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* All Day Toggle */}
            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="allDay"
                checked={formData.allDay}
                onChange={(e) => handleInputChange('allDay', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label htmlFor="allDay" className="text-sm font-medium text-gray-700">
                All Day Event
              </label>
            </div>

            {/* Start Date & Time */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start {formData.allDay ? 'Date' : 'Date & Time'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={
                    formData.allDay
                      ? formData.startDate?.toISOString().split('T')[0]
                      : formatDateTimeLocal(formData.startDate!)
                  }
                  onChange={(e) => handleDateTimeChange('startDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End {formData.allDay ? 'Date' : 'Date & Time'}{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type={formData.allDay ? 'date' : 'datetime-local'}
                  value={
                    formData.allDay
                      ? formData.endDate?.toISOString().split('T')[0]
                      : formatDateTimeLocal(formData.endDate!)
                  }
                  onChange={(e) => handleDateTimeChange('endDate', e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter event location"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter event description"
              />
            </div>

            {/* Reminder */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="reminderEnabled"
                  checked={formData.reminder?.enabled}
                  onChange={(e) =>
                    handleInputChange('reminder', {
                      ...formData.reminder,
                      enabled: e.target.checked,
                    })
                  }
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="reminderEnabled" className="text-sm font-medium text-gray-700">
                  Enable Reminder
                </label>
              </div>

              {formData.reminder?.enabled && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Remind me (minutes before)
                  </label>
                  <input
                    type="number"
                    value={formData.reminder.time}
                    onChange={(e) =>
                      handleInputChange('reminder', {
                        ...formData.reminder,
                        time: parseInt(e.target.value),
                      })
                    }
                    min="5"
                    step="5"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              )}
            </div>

            {/* Recurrence */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center space-x-3 mb-3">
                <input
                  type="checkbox"
                  id="recurrenceEnabled"
                  checked={enableRecurrence}
                  onChange={(e) => setEnableRecurrence(e.target.checked)}
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="recurrenceEnabled" className="text-sm font-medium text-gray-700">
                  Recurring Event
                </label>
              </div>

              {enableRecurrence && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Frequency
                      </label>
                      <select
                        value={formData.recurrence?.frequency || 'weekly'}
                        onChange={(e) =>
                          handleInputChange('recurrence', {
                            ...formData.recurrence,
                            frequency: e.target.value as RecurrenceFrequency,
                            interval: formData.recurrence?.interval || 1,
                          })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="daily">Daily</option>
                        <option value="weekly">Weekly</option>
                        <option value="monthly">Monthly</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Interval
                      </label>
                      <input
                        type="number"
                        value={formData.recurrence?.interval || 1}
                        onChange={(e) =>
                          handleInputChange('recurrence', {
                            ...formData.recurrence,
                            frequency: formData.recurrence?.frequency || 'weekly',
                            interval: parseInt(e.target.value),
                          })
                        }
                        min="1"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (optional)
                    </label>
                    <input
                      type="date"
                      value={
                        formData.recurrence?.endDate
                          ? new Date(formData.recurrence.endDate).toISOString().split('T')[0]
                          : ''
                      }
                      onChange={(e) =>
                        handleInputChange('recurrence', {
                          ...formData.recurrence,
                          frequency: formData.recurrence?.frequency || 'weekly',
                          interval: formData.recurrence?.interval || 1,
                          endDate: e.target.value ? new Date(e.target.value) : undefined,
                        })
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? 'Saving...' : isEditMode ? 'Update Event' : 'Create Event'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
