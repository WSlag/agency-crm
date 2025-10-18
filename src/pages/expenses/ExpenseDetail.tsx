import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
import { useApplicantStore } from '../../stores/applicantStore';
import { useBranchStore } from '../../stores/branchStore';
import { EXPENSE_CONFIG } from '../../types/expense';
import { ExpenseVerification } from '../../components/expenses/ExpenseVerification';
import { ExpenseApproval } from '../../components/expenses/ExpenseApproval';
import {
  SparklesIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
  TrashIcon,
  DocumentTextIcon,
  BanknotesIcon,
} from '@heroicons/react/24/outline';

export const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, customClaims } = useAuthStore();
  const {
    selectedExpense,
    loading,
    error,
    fetchExpenseById,
    deleteExpense,
  } = useExpenseStore();
  const { applicants, fetchApplicants } = useApplicantStore();
  const { branches, fetchBranches } = useBranchStore();

  const [showVerification, setShowVerification] = React.useState(false);
  const [showApproval, setShowApproval] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchExpenseById(id);
    }
  }, [id, fetchExpenseById]);

  React.useEffect(() => {
    fetchApplicants();
    fetchBranches();
  }, [fetchApplicants, fetchBranches]);

  // Look up applicant name
  const applicant = applicants?.find(a => a.id === selectedExpense?.applicantId);
  const applicantName = applicant?.fullName || selectedExpense?.applicantId || 'N/A';

  // Look up branch name
  const branch = branches?.find(b => b.id === selectedExpense?.branchId);
  const branchName = branch?.name || selectedExpense?.branchId || 'N/A';

  const canVerify =
    customClaims?.role === 'ho_accountant' &&
    selectedExpense?.status === 'pending';

  const canApprove =
    (customClaims?.role === 'admin' || customClaims?.role === 'president') &&
    selectedExpense?.status === 'verified';

  const canDelete =
    selectedExpense?.enteredBy === user?.uid &&
    selectedExpense?.status === 'pending';

  const handleDelete = async () => {
    if (!id) return;
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await deleteExpense(id);
        navigate('/expenses');
      } catch (error) {
        console.error('Failed to delete expense:', error);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
          <SparklesIcon className="h-8 w-8 text-indigo-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
        </div>
      </div>
    );
  }

  if (error || !selectedExpense) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-white rounded-2xl shadow-xl border-2 border-red-200 p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Error Loading Expense
                </h3>
                <p className="text-gray-600 mb-6">{error || 'Expense not found'}</p>
                <button
                  onClick={() => navigate('/expenses')}
                  className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-700 hover:to-purple-700 transition-all transform hover:scale-105 shadow-lg"
                >
                  <ArrowLeftIcon className="h-5 w-5 mr-2" />
                  Back to Expenses
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const config = EXPENSE_CONFIG[selectedExpense.expenseType];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl shadow-2xl p-8 mb-8 overflow-hidden">
          <div className="absolute inset-0 bg-black opacity-10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/expenses')}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-xl hover:bg-white/30 transition-all transform hover:scale-110"
                >
                  <ArrowLeftIcon className="h-6 w-6 text-white" />
                </button>
                <div>
                  <div className="flex items-center space-x-3">
                    <SparklesIcon className="h-8 w-8 text-white animate-pulse" />
                    <h1 className="text-3xl font-bold text-white">Expense Details</h1>
                  </div>
                  <p className="text-indigo-100 mt-1">View and manage expense information</p>
                </div>
              </div>
              <div className="flex space-x-3">
                {canVerify && (
                  <button
                    onClick={() => setShowVerification(true)}
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white font-medium hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Verify Expense
                  </button>
                )}
                {canApprove && (
                  <button
                    onClick={() => setShowApproval(true)}
                    className="inline-flex items-center px-6 py-3 bg-white/20 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white font-medium hover:bg-white/30 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <CheckCircleIcon className="h-5 w-5 mr-2" />
                    Approve Expense
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={handleDelete}
                    className="inline-flex items-center px-6 py-3 bg-red-500/90 backdrop-blur-sm border-2 border-white/40 rounded-xl text-white font-medium hover:bg-red-600 transition-all transform hover:scale-105 shadow-lg"
                  >
                    <TrashIcon className="h-5 w-5 mr-2" />
                    Delete
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Expense Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 px-6 py-5 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
                <BanknotesIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{config.name}</h3>
                <p className="text-sm text-gray-600">Expense details and status information</p>
              </div>
            </div>
          </div>
          <div className="px-6 py-6">
            <dl className="grid grid-cols-1 gap-x-6 gap-y-6 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Amount</dt>
                <dd className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedExpense.currency,
                  }).format(selectedExpense.amount)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Status</dt>
                <dd>
                  <span
                    className={`inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold border-2 ${
                      selectedExpense.status === 'pending'
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white border-yellow-300'
                        : selectedExpense.status === 'verified'
                        ? 'bg-gradient-to-r from-blue-400 to-cyan-500 text-white border-blue-300'
                        : selectedExpense.status === 'approved'
                        ? 'bg-gradient-to-r from-green-400 to-emerald-500 text-white border-green-300'
                        : selectedExpense.status === 'rejected'
                        ? 'bg-gradient-to-r from-red-400 to-pink-500 text-white border-red-300'
                        : 'bg-gradient-to-r from-purple-400 to-indigo-500 text-white border-purple-300'
                    }`}
                  >
                    {selectedExpense.status.charAt(0).toUpperCase() +
                      selectedExpense.status.slice(1)}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500 mb-1">Description</dt>
                <dd className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                  {selectedExpense.description}
                </dd>
              </div>
              {selectedExpense.applicantId && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Applicant</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {applicantName}
                  </dd>
                </div>
              )}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Branch</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {branchName}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Receipt Number</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {selectedExpense.receiptNumber || 'N/A'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500 mb-1">Expense Date</dt>
                <dd className="text-sm font-medium text-gray-900">
                  {new Date(selectedExpense.expenseDate).toLocaleDateString()}
                </dd>
              </div>
              {selectedExpense.receiptUrl && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Receipt</dt>
                  <dd>
                    <a
                      href={selectedExpense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-700 transition-all transform hover:scale-105 shadow-md"
                    >
                      <DocumentTextIcon className="h-5 w-5 mr-2" />
                      View Receipt
                    </a>
                  </dd>
                </div>
              )}
              {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Tags</dt>
                  <dd>
                    <div className="flex flex-wrap gap-2">
                      {selectedExpense.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-semibold bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 border border-indigo-200"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </dd>
                </div>
              )}
              {selectedExpense.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Notes</dt>
                  <dd className="text-sm text-gray-900 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    {selectedExpense.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Verification History */}
        {selectedExpense.verifiedBy && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Verification Details</h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Verified By</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedExpense.verifiedBy}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Verified At</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedExpense.verifiedAt &&
                      new Date(selectedExpense.verifiedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Approval History */}
        {selectedExpense.approvedBy && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
                  <CheckCircleIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Approval Details</h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Approved By</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedExpense.approvedBy}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Approved At</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedExpense.approvedAt &&
                      new Date(selectedExpense.approvedAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}

        {/* Payment History */}
        {selectedExpense.paidBy && (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden mb-6">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl">
                  <BanknotesIcon className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900">Payment Details</h3>
              </div>
            </div>
            <div className="px-6 py-6">
              <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Paid By</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedExpense.paidBy}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500 mb-1">Paid At</dt>
                  <dd className="text-sm font-medium text-gray-900">
                    {selectedExpense.paidAt &&
                      new Date(selectedExpense.paidAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showVerification && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-gray-200">
            <ExpenseVerification
              expense={selectedExpense}
              onClose={() => setShowVerification(false)}
            />
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproval && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full border-2 border-gray-200">
            <ExpenseApproval
              expense={selectedExpense}
              onClose={() => setShowApproval(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
