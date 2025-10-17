import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useCommissionStore } from '../../stores/commissionStore';
import { CommissionService } from '../../services/commissionService';
import { Commission, COMMISSION_CONFIG } from '../../types/commission';
import { PartialPaymentModal } from '../../components/commissions/PartialPaymentModal';
import { PaymentHistory } from '../../components/commissions/PaymentHistory';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserIcon,
  CalendarIcon,
  DocumentTextIcon,
  SparklesIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

export const CommissionDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { recordPartialPayment } = useCommissionStore();
  const [commission, setCommission] = useState<Commission | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (id) {
      loadCommission();
    }
  }, [id]);

  const loadCommission = async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      const data = await CommissionService.getCommission(id);
      if (!data) {
        setError('Commission not found');
      } else {
        setCommission(data);
        setError(null);
      }
    } catch (err) {
      setError('Failed to load commission details');
      console.error('Error loading commission:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!commission || !user) return;
    
    try {
      setActionLoading(true);
      await CommissionService.approveCommission(commission.id, user.uid);
      await loadCommission();
    } catch (err) {
      console.error('Error approving commission:', err);
      alert('Failed to approve commission');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!commission || !user) return;
    
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) return;

    try {
      setActionLoading(true);
      await CommissionService.verifyCommission(commission.id, user.uid, 'rejected', reason);
      await loadCommission();
    } catch (err) {
      console.error('Error rejecting commission:', err);
      alert('Failed to reject commission');
    } finally {
      setActionLoading(false);
    }
  };

  const canApprove = () => {
    if (!commission || !user) return false;
    
    const approverRoles = ['admin', 'president', 'ho_accountant'];
    return approverRoles.includes(user.role) && commission.status === 'pending';
  };

  const canRecordPayment = () => {
    if (!commission || !user) return false;
    
    const paymentRoles = ['admin', 'president', 'ho_accountant'];
    return paymentRoles.includes(user.role) && 
      (commission.status === 'approved' || commission.status === 'partially_paid');
  };

  const handleRecordPartialPayment = async (
    amount: number,
    paymentReference: string,
    notes: string
  ) => {
    if (!commission || !user) return;
    
    try {
      await recordPartialPayment(commission.id, amount, user.uid, paymentReference, notes);
      await loadCommission();
      setShowPaymentModal(false);
    } catch (err: any) {
      console.error('Error recording partial payment:', err);
      throw err; // Rethrow to be handled by modal
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return '—';
    
    const dateObj = new Date(date);
    if (isNaN(dateObj.getTime())) return '—';
    
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const getStatusBadgeColor = (status: Commission['status']) => {
    switch (status) {
      case 'pending':
        return 'bg-gradient-to-r from-yellow-100 to-yellow-200 text-yellow-800 border-yellow-300';
      case 'verified':
        return 'bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300';
      case 'approved':
        return 'bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300';
      case 'rejected':
        return 'bg-gradient-to-r from-red-100 to-red-200 text-red-800 border-red-300';
      case 'partially_paid':
        return 'bg-gradient-to-r from-orange-100 to-amber-200 text-orange-800 border-orange-300';
      case 'paid':
        return 'bg-gradient-to-r from-purple-100 to-purple-200 text-purple-800 border-purple-300';
      default:
        return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: Commission['status']) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return CheckCircleIcon;
      case 'rejected':
        return XCircleIcon;
      default:
        return ClockIcon;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            <SparklesIcon className="h-6 w-6 text-indigo-600 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !commission) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="rounded-xl bg-red-50 border-2 border-red-200 p-6">
            <div className="flex">
              <XCircleIcon className="h-6 w-6 text-red-400" />
              <div className="ml-3">
                <h3 className="text-lg font-medium text-red-800">
                  {error || 'Commission not found'}
                </h3>
                <button
                  onClick={() => navigate('/commissions')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-red-300 rounded-lg text-sm font-medium text-red-700 bg-white hover:bg-red-50 transition-all"
                >
                  <ArrowLeftIcon className="h-4 w-4 mr-2" />
                  Back to Commissions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(commission.status);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => navigate('/commissions')}
            className="group inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-white/10 backdrop-blur-sm border-2 border-white/30 rounded-xl hover:bg-white/20 transition-all duration-200 mb-6"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Back to Commissions
          </button>

          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3">
                <CurrencyDollarIcon className="h-10 w-10 text-white" />
                <h1 className="text-3xl font-bold text-white">Commission Details</h1>
              </div>
              <p className="mt-2 text-indigo-100">
                View and manage commission request
              </p>
            </div>
            
            <div className={`inline-flex items-center space-x-2 rounded-full px-6 py-3 text-base font-semibold border-2 ${getStatusBadgeColor(commission.status)} shadow-lg`}>
              <StatusIcon className="h-5 w-5" />
              <span>{commission.status.charAt(0).toUpperCase() + commission.status.slice(1)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Amount Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Commission Amount
              </h2>
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
                <p className="text-sm text-gray-600 mb-1">Total Amount</p>
                <p className="text-4xl font-bold text-indigo-600">
                  {formatCurrency(commission.amount || 0, commission.currency || 'PHP')}
                </p>
                {commission.commissionType && (
                  <p className="mt-2 text-sm text-gray-600">
                    Type: <span className="font-semibold text-gray-900">
                      {COMMISSION_CONFIG[commission.commissionType]?.name || commission.commissionType}
                    </span>
                  </p>
                )}
              </div>
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <DocumentTextIcon className="h-5 w-5 mr-2 text-indigo-600" />
                Commission Information
              </h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <UserIcon className="h-4 w-4 mr-1" />
                    Agent ID
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {commission.agentId || '—'}
                  </dd>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <dt className="text-sm font-medium text-gray-500 flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-1" />
                    Created Date
                  </dt>
                  <dd className="mt-1 text-sm font-semibold text-gray-900">
                    {formatDate(commission.createdAt)}
                  </dd>
                </div>

                {commission.requestedBy && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500">Requested By</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {commission.requestedBy}
                    </dd>
                  </div>
                )}

                {commission.approvedBy && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500">Approved By</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {commission.approvedBy}
                    </dd>
                  </div>
                )}

                {commission.approvedAt && (
                  <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2">
                    <dt className="text-sm font-medium text-gray-500">Approved At</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(commission.approvedAt)}
                    </dd>
                  </div>
                )}

                {commission.rejectedBy && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500">Rejected By</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {commission.rejectedBy}
                    </dd>
                  </div>
                )}

                {commission.rejectedAt && (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <dt className="text-sm font-medium text-gray-500">Rejected At</dt>
                    <dd className="mt-1 text-sm font-semibold text-gray-900">
                      {formatDate(commission.rejectedAt)}
                    </dd>
                  </div>
                )}

                {commission.rejectionReason && (
                  <div className="bg-red-50 rounded-lg p-4 sm:col-span-2 border border-red-200">
                    <dt className="text-sm font-medium text-red-700">Rejection Reason</dt>
                    <dd className="mt-1 text-sm text-red-900">
                      {commission.rejectionReason}
                    </dd>
                  </div>
                )}
              </dl>
            </div>

            {/* Notes */}
            {commission.notes && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Notes</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{commission.notes}</p>
                </div>
              </div>
            )}

            {/* Payment History Section */}
            {(commission.installments && commission.installments.length > 0) || 
             commission.status === 'partially_paid' || 
             commission.status === 'paid' ? (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
                <PaymentHistory commission={commission} />
              </div>
            ) : null}
          </div>

          {/* Actions Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6 sticky top-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Actions</h2>
              <div className="space-y-3">
                {canApprove() && (
                  <>
                    <button
                      onClick={handleApprove}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-green-600 to-green-700 rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <CheckCircleIcon className="h-5 w-5 mr-2" />
                      Approve Commission
                    </button>
                    
                    <button
                      onClick={handleReject}
                      disabled={actionLoading}
                      className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg"
                    >
                      <XCircleIcon className="h-5 w-5 mr-2" />
                      Reject Commission
                    </button>
                  </>
                )}

                {canRecordPayment() && (
                  <button
                    onClick={() => setShowPaymentModal(true)}
                    disabled={actionLoading}
                    className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 rounded-lg hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:scale-105 shadow-lg"
                  >
                    <BanknotesIcon className="h-5 w-5 mr-2" />
                    Record Payment
                  </button>
                )}

                {commission.status === 'pending' && commission.requestedBy === user?.uid && (
                  <button
                    onClick={() => navigate(`/commissions/${commission.id}/edit`)}
                    className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-indigo-600 bg-indigo-50 rounded-lg hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                  >
                    <DocumentTextIcon className="h-5 w-5 mr-2" />
                    Edit Commission
                  </button>
                )}

                <button
                  onClick={() => navigate('/commissions')}
                  className="w-full inline-flex items-center justify-center px-4 py-3 text-sm font-semibold text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-all duration-200"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to List
                </button>
              </div>

              {/* Timeline */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Timeline</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                        <ClockIcon className="h-4 w-4 text-indigo-600" />
                      </div>
                    </div>
                    <div className="ml-3">
                      <p className="text-xs font-medium text-gray-900">Created</p>
                      <p className="text-xs text-gray-500">{formatDate(commission.createdAt)}</p>
                    </div>
                  </div>

                  {commission.approvedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                          <CheckCircleIcon className="h-4 w-4 text-green-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-900">Approved</p>
                        <p className="text-xs text-gray-500">{formatDate(commission.approvedAt)}</p>
                      </div>
                    </div>
                  )}

                  {commission.rejectedAt && (
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                          <XCircleIcon className="h-4 w-4 text-red-600" />
                        </div>
                      </div>
                      <div className="ml-3">
                        <p className="text-xs font-medium text-gray-900">Rejected</p>
                        <p className="text-xs text-gray-500">{formatDate(commission.rejectedAt)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Partial Payment Modal */}
      <PartialPaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        commission={commission}
        onPayment={handleRecordPartialPayment}
      />
    </div>
  );
};

