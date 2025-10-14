import { useState, useEffect } from 'react';
import { useCommunicationStore } from '../../stores/communicationStore';
import { useAuth } from '../../contexts/AuthContext';
import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  DocumentTextIcon,
  CalendarIcon,
  PlusIcon,
  FunnelIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { Communication, CommunicationType } from '../../types/communication';
import { AddCommunication } from './AddCommunication';

interface CommunicationHistoryProps {
  applicantId: string;
}

export const CommunicationHistory: React.FC<CommunicationHistoryProps> = ({ applicantId }) => {
  const { user } = useAuth();
  const { communications, loading, error, stats, fetchCommunications, fetchCommunicationStats } =
    useCommunicationStore();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [filterType, setFilterType] = useState<CommunicationType | 'all'>('all');
  const [filterDirection, setFilterDirection] = useState<'all' | 'inbound' | 'outbound'>('all');

  useEffect(() => {
    if (applicantId) {
      fetchCommunications(applicantId);
      fetchCommunicationStats(applicantId);
    }
  }, [applicantId, fetchCommunications, fetchCommunicationStats]);

  const getTypeIcon = (type: CommunicationType) => {
    switch (type) {
      case 'email':
        return <EnvelopeIcon className="h-5 w-5" />;
      case 'sms':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      case 'call':
        return <PhoneIcon className="h-5 w-5" />;
      case 'note':
        return <DocumentTextIcon className="h-5 w-5" />;
      case 'meeting':
        return <CalendarIcon className="h-5 w-5" />;
      case 'in-app':
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
      default:
        return <ChatBubbleLeftRightIcon className="h-5 w-5" />;
    }
  };

  const getTypeColor = (type: CommunicationType) => {
    switch (type) {
      case 'email':
        return 'bg-blue-100 text-blue-800';
      case 'sms':
        return 'bg-green-100 text-green-800';
      case 'call':
        return 'bg-purple-100 text-purple-800';
      case 'note':
        return 'bg-yellow-100 text-yellow-800';
      case 'meeting':
        return 'bg-indigo-100 text-indigo-800';
      case 'in-app':
        return 'bg-pink-100 text-pink-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
      case 'delivered':
      case 'read':
        return <CheckCircleIcon className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircleIcon className="h-4 w-4 text-red-600" />;
      case 'draft':
        return <ClockIcon className="h-4 w-4 text-yellow-600" />;
      default:
        return null;
    }
  };

  const filteredCommunications = communications.filter((comm) => {
    if (filterType !== 'all' && comm.type !== filterType) return false;
    if (filterDirection !== 'all' && comm.direction !== filterDirection) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Communication History</h3>
          <p className="mt-1 text-sm text-gray-500">
            Track all communications with this applicant
          </p>
        </div>
        <button
          onClick={() => setShowAddDialog(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          Add Communication
        </button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChatBubbleLeftRightIcon className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <EnvelopeIcon className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Emails</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.byType.email || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <PhoneIcon className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Calls</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.byType.call || 0}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DocumentTextIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Notes</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.byType.note || 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center space-x-4">
          <FunnelIcon className="h-5 w-5 text-gray-400" />
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All Types</option>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="call">Call</option>
                <option value="note">Note</option>
                <option value="meeting">Meeting</option>
                <option value="in-app">In-App</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Direction
              </label>
              <select
                value={filterDirection}
                onChange={(e) => setFilterDirection(e.target.value as any)}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              >
                <option value="all">All</option>
                <option value="outbound">Outbound</option>
                <option value="inbound">Inbound</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Communications Timeline */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading communications...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center">
            <XCircleIcon className="h-12 w-12 text-red-400 mx-auto" />
            <p className="mt-2 text-sm text-red-600">{error}</p>
          </div>
        ) : filteredCommunications.length === 0 ? (
          <div className="p-8 text-center">
            <ChatBubbleLeftRightIcon className="h-12 w-12 text-gray-400 mx-auto" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No communications</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by adding a new communication.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredCommunications.map((comm) => (
              <div key={comm.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start space-x-4">
                  {/* Type Icon */}
                  <div
                    className={`flex-shrink-0 rounded-full p-2 ${getTypeColor(comm.type)}`}
                  >
                    {getTypeIcon(comm.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 capitalize">
                          {comm.type}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            comm.direction === 'inbound'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {comm.direction === 'inbound' ? '←' : '→'} {comm.direction}
                        </span>
                        {getStatusIcon(comm.status)}
                      </div>
                      <span className="text-sm text-gray-500">
                        {new Date(comm.createdAt).toLocaleString()}
                      </span>
                    </div>

                    {comm.subject && (
                      <p className="mt-1 text-sm font-medium text-gray-900">{comm.subject}</p>
                    )}

                    <p className="mt-1 text-sm text-gray-600 line-clamp-2">{comm.content}</p>

                    {/* Metadata */}
                    <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                      {comm.createdByName && (
                        <span>By: {comm.createdByName}</span>
                      )}
                      {comm.metadata.recipient && (
                        <span>To: {comm.metadata.recipient}</span>
                      )}
                      {comm.metadata.duration && (
                        <span>Duration: {comm.metadata.duration} min</span>
                      )}
                      {comm.metadata.location && (
                        <span>Location: {comm.metadata.location}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Communication Dialog */}
      {showAddDialog && (
        <AddCommunication
          applicantId={applicantId}
          onClose={() => setShowAddDialog(false)}
          onSuccess={() => {
            setShowAddDialog(false);
            fetchCommunications(applicantId);
            fetchCommunicationStats(applicantId);
          }}
        />
      )}
    </div>
  );
};

