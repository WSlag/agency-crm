import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useReportStore } from '../../stores/reportStore';
import { useAuth } from '../../contexts/AuthContext';
import { XMarkIcon, ShareIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import type { Report } from '../../types/report';

const shareReportSchema = z.object({
  recipients: z.string().min(1, 'At least one recipient is required'),
  accessLevel: z.enum(['view', 'download']),
  expiresAt: z.string().optional(),
  message: z.string().optional(),
});

type ShareReportFormData = z.infer<typeof shareReportSchema>;

interface ReportShareDialogProps {
  report: Report;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReportShareDialog: React.FC<ReportShareDialogProps> = ({
  report,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [shareMethod, setShareMethod] = useState<'email' | 'internal'>('email');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ShareReportFormData>({
    resolver: zodResolver(shareReportSchema),
    defaultValues: {
      accessLevel: 'view',
    },
  });

  const onSubmit = async (data: ShareReportFormData) => {
    if (!user) return;

    try {
      setSubmitting(true);
      
      // Parse recipients (comma-separated emails or user IDs)
      const recipientList = data.recipients
        .split(',')
        .map(r => r.trim())
        .filter(r => r.length > 0);

      // Create share record
      const shareData = {
        reportId: report.id,
        sharedBy: user.uid,
        sharedByName: user.displayName || user.email || 'Unknown User',
        sharedWith: recipientList,
        accessLevel: data.accessLevel,
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : undefined,
      };

      // Store in Firestore
      const { addDoc, collection, serverTimestamp } = await import('firebase/firestore');
      const { firestore } = await import('../../config/firebase');

      await addDoc(collection(firestore, 'report_shares'), {
        ...shareData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      // Send notifications/emails to recipients
      if (shareMethod === 'email') {
        // Create email notifications
        const emailPromises = recipientList.map(email =>
          addDoc(collection(firestore, 'notifications'), {
            type: 'report_shared',
            recipientEmail: email,
            title: 'Report Shared With You',
            body: `${user.displayName || 'A user'} has shared a report "${report.name}" with you.${
              data.message ? `\n\nMessage: ${data.message}` : ''
            }`,
            metadata: {
              reportId: report.id,
              reportName: report.name,
              sharedBy: user.uid,
              sharedByName: user.displayName || user.email,
              accessLevel: data.accessLevel,
              expiresAt: data.expiresAt,
              message: data.message,
            },
            channels: ['email'],
            read: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'active',
          })
        );
        await Promise.all(emailPromises);
      } else {
        // Create in-app notifications
        const notificationPromises = recipientList.map(userId =>
          addDoc(collection(firestore, 'notifications'), {
            type: 'report_shared',
            recipientId: userId,
            title: 'Report Shared With You',
            body: `${user.displayName || 'A user'} has shared a report "${report.name}" with you.`,
            metadata: {
              reportId: report.id,
              reportName: report.name,
              sharedBy: user.uid,
              sharedByName: user.displayName || user.email,
              accessLevel: data.accessLevel,
              expiresAt: data.expiresAt,
            },
            channels: ['in-app', 'push'],
            read: false,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            status: 'active',
          })
        );
        await Promise.all(notificationPromises);
      }

      // Create audit log
      await addDoc(collection(firestore, 'audit_logs'), {
        action: 'report_shared',
        entityId: report.id,
        entityType: 'report',
        performedBy: user.uid,
        performedAt: serverTimestamp(),
        details: {
          reportName: report.name,
          recipients: recipientList,
          accessLevel: data.accessLevel,
          shareMethod,
        },
      });

      onSuccess();
    } catch (error) {
      console.error('Failed to share report:', error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">&#8203;</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button type="button" className="bg-white rounded-md text-gray-400 hover:text-gray-500" onClick={onClose}>
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 sm:mx-0 sm:h-10 sm:w-10">
              <ShareIcon className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Share Report
              </h3>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Share "{report.name}" with others
                </p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
                {/* Share Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Share Method</label>
                  <div className="mt-2 space-x-4">
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={shareMethod === 'email'}
                        onChange={(e) => setShareMethod(e.target.value as 'email')}
                        className="form-radio h-4 w-4 text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Email</span>
                    </label>
                    <label className="inline-flex items-center">
                      <input
                        type="radio"
                        value="internal"
                        checked={shareMethod === 'internal'}
                        onChange={(e) => setShareMethod(e.target.value as 'internal')}
                        className="form-radio h-4 w-4 text-indigo-600"
                      />
                      <span className="ml-2 text-sm text-gray-700">Internal Users</span>
                    </label>
                  </div>
                </div>

                {/* Recipients */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    {shareMethod === 'email' ? 'Email Addresses' : 'User IDs'}
                  </label>
                  <textarea
                    {...register('recipients')}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder={shareMethod === 'email' ? 'user@example.com, another@example.com' : 'user_id_1, user_id_2'}
                  />
                  <p className="mt-1 text-xs text-gray-500">Separate multiple recipients with commas</p>
                  {errors.recipients && (
                    <p className="mt-1 text-sm text-red-600">{errors.recipients.message}</p>
                  )}
                </div>

                {/* Access Level */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">Access Level</label>
                  <select
                    {...register('accessLevel')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  >
                    <option value="view">View Only</option>
                    <option value="download">View & Download</option>
                  </select>
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Expires At (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    {...register('expiresAt')}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">Leave empty for no expiration</p>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Message (Optional)
                  </label>
                  <textarea
                    {...register('message')}
                    rows={2}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="Add a personal message..."
                  />
                </div>

                {/* Actions */}
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Sharing...' : 'Share Report'}
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

