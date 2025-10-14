import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCommunicationStore } from '../../stores/communicationStore';
import { useAuth } from '../../contexts/AuthContext';
import {
  XMarkIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import type { CommunicationType, CommunicationDirection } from '../../types/communication';

const communicationSchema = z.object({
  type: z.enum(['email', 'sms', 'call', 'note', 'meeting', 'in-app']),
  direction: z.enum(['inbound', 'outbound']),
  subject: z.string().optional(),
  content: z.string().min(1, 'Content is required'),
  recipient: z.string().optional(),
  phoneNumber: z.string().optional(),
  emailAddress: z.string().email().optional().or(z.literal('')),
  duration: z.number().optional(),
  location: z.string().optional(),
});

type CommunicationFormData = z.infer<typeof communicationSchema>;

interface AddCommunicationProps {
  applicantId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const AddCommunication: React.FC<AddCommunicationProps> = ({
  applicantId,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { createCommunication } = useCommunicationStore();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<CommunicationFormData>({
    resolver: zodResolver(communicationSchema),
    defaultValues: {
      type: 'note',
      direction: 'outbound',
    },
  });

  const selectedType = watch('type');

  const onSubmit = async (data: CommunicationFormData) => {
    if (!user) return;

    try {
      setSubmitting(true);

      const metadata: any = {};
      if (data.recipient) metadata.recipient = data.recipient;
      if (data.phoneNumber) metadata.phoneNumber = data.phoneNumber;
      if (data.emailAddress) metadata.emailAddress = data.emailAddress;
      if (data.duration) metadata.duration = data.duration;
      if (data.location) metadata.location = data.location;

      await createCommunication(
        {
          applicantId,
          type: data.type,
          direction: data.direction,
          subject: data.subject,
          content: data.content,
          metadata,
        },
        user.uid,
        user.displayName || user.email || 'Unknown User'
      );

      onSuccess();
    } catch (error) {
      console.error('Failed to create communication:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>

        {/* Center modal */}
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={onClose}
            >
              <span className="sr-only">Close</span>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Add Communication
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Record a new communication with this applicant
              </p>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Type
                  </label>
                  <select
                    {...register('type')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="note">Note</option>
                    <option value="email">Email</option>
                    <option value="sms">SMS</option>
                    <option value="call">Phone Call</option>
                    <option value="meeting">Meeting</option>
                    <option value="in-app">In-App Message</option>
                  </select>
                </div>

                {/* Direction */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Direction
                  </label>
                  <select
                    {...register('direction')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="outbound">Outbound (Sent by us)</option>
                    <option value="inbound">Inbound (Received from applicant)</option>
                  </select>
                </div>

                {/* Subject (for email/meeting) */}
                {(selectedType === 'email' || selectedType === 'meeting') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Subject
                    </label>
                    <input
                      type="text"
                      {...register('subject')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder={selectedType === 'email' ? 'Email subject' : 'Meeting subject'}
                    />
                  </div>
                )}

                {/* Content */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Content/Message
                  </label>
                  <textarea
                    {...register('content')}
                    rows={4}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Enter the communication content..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>

                {/* Email Address (for email) */}
                {selectedType === 'email' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      {...register('emailAddress')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="applicant@email.com"
                    />
                    {errors.emailAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.emailAddress.message}</p>
                    )}
                  </div>
                )}

                {/* Phone Number (for SMS/call) */}
                {(selectedType === 'sms' || selectedType === 'call') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      {...register('phoneNumber')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="+63 912 345 6789"
                    />
                  </div>
                )}

                {/* Duration (for call/meeting) */}
                {(selectedType === 'call' || selectedType === 'meeting') && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Duration (minutes)
                    </label>
                    <input
                      type="number"
                      {...register('duration', { valueAsNumber: true })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="30"
                      min="0"
                    />
                  </div>
                )}

                {/* Location (for meeting) */}
                {selectedType === 'meeting' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      {...register('location')}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder="Office / Virtual / Client Site"
                    />
                  </div>
                )}

                {/* Recipient (for outbound) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Recipient/Contact Name
                  </label>
                  <input
                    type="text"
                    {...register('recipient')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Applicant name or contact person"
                  />
                </div>

                {/* Actions */}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Saving...' : 'Save Communication'}
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

