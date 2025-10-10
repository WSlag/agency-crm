import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useExpenseStore } from '../../stores/expenseStore';
import { useAuthStore } from '../../stores/authStore';
import { EXPENSE_CONFIG } from '../../types/expense';
import { ExpenseVerification } from '../../components/expenses/ExpenseVerification';
import { ExpenseApproval } from '../../components/expenses/ExpenseApproval';

export const ExpenseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const {
    selectedExpense,
    loading,
    error,
    fetchExpenseById,
    deleteExpense,
  } = useExpenseStore();

  const [showVerification, setShowVerification] = React.useState(false);
  const [showApproval, setShowApproval] = React.useState(false);

  React.useEffect(() => {
    if (id) {
      fetchExpenseById(id);
    }
  }, [id, fetchExpenseById]);

  const canVerify =
    user?.role === 'ho_accountant' &&
    selectedExpense?.status === 'pending';

  const canApprove =
    (user?.role === 'admin' || user?.role === 'president') &&
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error || !selectedExpense) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-6">
        <div className="mx-auto max-w-7xl">
          <div className="bg-red-50 border-l-4 border-red-400 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Error</h3>
                <div className="mt-2 text-sm text-red-700">
                  {error || 'Expense not found'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const config = EXPENSE_CONFIG[selectedExpense.expenseType];

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="mx-auto max-w-7xl">
        <div className="md:flex md:items-center md:justify-between mb-6">
          <div className="min-w-0 flex-1">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:truncate sm:text-3xl sm:tracking-tight">
              Expense Details
            </h2>
          </div>
          <div className="mt-4 flex md:ml-4 md:mt-0 space-x-3">
            {canVerify && (
              <button
                onClick={() => setShowVerification(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Verify Expense
              </button>
            )}
            {canApprove && (
              <button
                onClick={() => setShowApproval(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Approve Expense
              </button>
            )}
            {canDelete && (
              <button
                onClick={handleDelete}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            )}
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {config.name}
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Expense details and status information.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Amount</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: selectedExpense.currency,
                  }).format(selectedExpense.amount)}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      selectedExpense.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : selectedExpense.status === 'verified'
                        ? 'bg-blue-100 text-blue-800'
                        : selectedExpense.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : selectedExpense.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {selectedExpense.status.charAt(0).toUpperCase() +
                      selectedExpense.status.slice(1)}
                  </span>
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-500">Description</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {selectedExpense.description}
                </dd>
              </div>
              {selectedExpense.applicantId && (
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Applicant</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedExpense.applicantId}
                  </dd>
                </div>
              )}
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Branch</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {selectedExpense.branchId}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Receipt Number
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {selectedExpense.receiptNumber || 'N/A'}
                </dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Expense Date
                </dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {new Date(selectedExpense.expenseDate).toLocaleDateString()}
                </dd>
              </div>
              {selectedExpense.receiptUrl && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Receipt</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <a
                      href={selectedExpense.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Receipt
                    </a>
                  </dd>
                </div>
              )}
              {selectedExpense.tags && selectedExpense.tags.length > 0 && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    <div className="flex flex-wrap gap-2">
                      {selectedExpense.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
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
                  <dt className="text-sm font-medium text-gray-500">Notes</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedExpense.notes}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Verification History */}
        {selectedExpense.verifiedBy && (
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Verification Details
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Verified By
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedExpense.verifiedBy}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Verified At
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
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
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Approval Details
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Approved By
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedExpense.approvedBy}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">
                    Approved At
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900">
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
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Payment Details
              </h3>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Paid By</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {selectedExpense.paidBy}
                  </dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Paid At</dt>
                  <dd className="mt-1 text-sm text-gray-900">
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
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-2xl w-full">
            <ExpenseVerification
              expense={selectedExpense}
              onClose={() => setShowVerification(false)}
            />
          </div>
        </div>
      )}

      {/* Approval Modal */}
      {showApproval && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="relative bg-white rounded-lg max-w-2xl w-full">
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
