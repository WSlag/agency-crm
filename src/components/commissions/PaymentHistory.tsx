import {
  ClockIcon,
  CheckCircleIcon,
  CurrencyDollarIcon,
  DocumentTextIcon,
} from '@heroicons/react/24/outline';
import { Commission, CommissionInstallment } from '../../types/commission';

interface PaymentHistoryProps {
  commission: Commission;
}

export const PaymentHistory: React.FC<PaymentHistoryProps> = ({ commission }) => {
  const installments = commission.installments || [];
  const amountPaid = commission.amountPaid || 0;
  const remaining = commission.amount - amountPaid;

  if (installments.length === 0 && commission.status !== 'paid') {
    return (
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-8 text-center border-2 border-dashed border-gray-300">
        <ClockIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-base font-semibold text-gray-900">No Payment History</h3>
        <p className="mt-2 text-sm text-gray-600">
          No payments have been recorded for this commission yet.
        </p>
      </div>
    );
  }

  const formatDate = (date: any) => {
    if (!date) return 'N/A';
    const dateObj = date.toDate ? date.toDate() : new Date(date);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(dateObj);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-700">Total Amount</p>
              <p className="mt-1 text-2xl font-bold text-blue-900">
                {formatCurrency(commission.amount)}
              </p>
            </div>
            <CurrencyDollarIcon className="h-10 w-10 text-blue-400" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-5 border border-green-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-700">Amount Paid</p>
              <p className="mt-1 text-2xl font-bold text-green-900">
                {formatCurrency(amountPaid)}
              </p>
              <p className="text-xs text-green-600 mt-1">
                {installments.length} payment{installments.length !== 1 ? 's' : ''}
              </p>
            </div>
            <CheckCircleIcon className="h-10 w-10 text-green-400" />
          </div>
        </div>

        <div className={`bg-gradient-to-br rounded-xl p-5 border ${
          remaining > 0 
            ? 'from-yellow-50 to-orange-50 border-yellow-100' 
            : 'from-purple-50 to-pink-50 border-purple-100'
        }`}>
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${remaining > 0 ? 'text-yellow-700' : 'text-purple-700'}`}>
                {remaining > 0 ? 'Remaining' : 'Completed'}
              </p>
              <p className={`mt-1 text-2xl font-bold ${remaining > 0 ? 'text-yellow-900' : 'text-purple-900'}`}>
                {formatCurrency(remaining)}
              </p>
              {remaining > 0 && (
                <p className="text-xs text-yellow-600 mt-1">
                  {((amountPaid / commission.amount) * 100).toFixed(1)}% paid
                </p>
              )}
            </div>
            {remaining > 0 ? (
              <ClockIcon className="h-10 w-10 text-yellow-400" />
            ) : (
              <CheckCircleIcon className="h-10 w-10 text-purple-400" />
            )}
          </div>
        </div>
      </div>

      {/* Payment Timeline */}
      <div>
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <DocumentTextIcon className="h-5 w-5 text-indigo-600" />
          Payment History
        </h3>

        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Payment Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Reference
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {installments.map((installment: CommissionInstallment, index: number) => (
                  <tr key={index} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white text-sm font-bold">
                        {installment.installmentNumber}
                      </span>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <ClockIcon className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-900">
                          {formatDate(installment.paidDate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border border-green-200">
                        {formatCurrency(installment.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                        {installment.paymentReference || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-gray-600 line-clamp-2">
                        {installment.notes || '-'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      {commission.status === 'partially_paid' && (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-6 border border-indigo-100">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-indigo-900">Payment Progress</span>
            <span className="text-sm font-bold text-indigo-700">
              {((amountPaid / commission.amount) * 100).toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-500 shadow-lg"
              style={{ width: `${(amountPaid / commission.amount) * 100}%` }}
            >
              <div className="h-full w-full bg-white opacity-20 animate-pulse"></div>
            </div>
          </div>
          <div className="mt-3 flex justify-between text-xs font-medium text-indigo-700">
            <span>₱0</span>
            <span className="text-indigo-900 font-bold">
              ₱{amountPaid.toLocaleString()} / ₱{commission.amount.toLocaleString()}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

