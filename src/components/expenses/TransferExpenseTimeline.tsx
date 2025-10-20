import { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy, Timestamp } from 'firebase/firestore';
import { firestore } from '../../config/firebase';
import {
  BanknotesIcon,
  ArrowRightIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import type { Expense } from '../../types/expense';

interface TransferExpenseTimelineProps {
  applicantId: string;
  transferDate?: Date;
}

interface TimelineSection {
  title: string;
  period: 'before' | 'after';
  expenses: Expense[];
  totalAmount: number;
}

export const TransferExpenseTimeline: React.FC<TransferExpenseTimelineProps> = ({
  applicantId,
  transferDate,
}) => {
  const [timeline, setTimeline] = useState<TimelineSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, [applicantId]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      setError(null);

      const expensesQuery = query(
        collection(firestore, 'expenses'),
        where('applicantId', '==', applicantId),
        orderBy('expenseDate', 'asc')
      );

      const snapshot = await getDocs(expensesQuery);
      const expenses = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          expenseDate: data.expenseDate instanceof Timestamp ? data.expenseDate.toDate() : new Date(data.expenseDate),
          createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt),
          updatedAt: data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date(data.updatedAt),
        } as Expense;
      });

      // Split expenses into before and after transfer
      const beforeTransfer = transferDate
        ? expenses.filter(e => new Date(e.expenseDate) < new Date(transferDate))
        : [];
      const afterTransfer = transferDate
        ? expenses.filter(e => new Date(e.expenseDate) >= new Date(transferDate))
        : expenses;

      const timelineData: TimelineSection[] = [];

      if (beforeTransfer.length > 0) {
        timelineData.push({
          title: 'Before Transfer (Branch Office)',
          period: 'before',
          expenses: beforeTransfer,
          totalAmount: beforeTransfer.reduce((sum, e) => sum + e.amount, 0),
        });
      }

      if (afterTransfer.length > 0) {
        timelineData.push({
          title: transferDate ? 'After Transfer (Head Office)' : 'All Expenses',
          period: 'after',
          expenses: afterTransfer,
          totalAmount: afterTransfer.reduce((sum, e) => sum + e.amount, 0),
        });
      }

      setTimeline(timelineData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
      case 'paid':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
            <CheckCircleIcon className="h-3 w-3 mr-1" />
            {status}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
            <ClockIcon className="h-3 w-3 mr-1" />
            {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const totalExpenses = timeline.reduce((sum, section) => sum + section.totalAmount, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Expense Timeline</h3>
          <p className="mt-1 text-sm text-gray-500">
            Track expenses before and after transfer
          </p>
        </div>
        {totalExpenses > 0 && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Total Expenses</p>
            <p className="text-2xl font-bold text-gray-900">
              ₱{totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          </div>
        )}
      </div>

      {loading ? (
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-500">Loading expenses...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      ) : timeline.length === 0 ? (
        <div className="p-8 text-center bg-white rounded-lg border border-gray-200">
          <BanknotesIcon className="h-12 w-12 text-gray-400 mx-auto" />
          <p className="mt-2 text-sm text-gray-500">No expenses recorded</p>
        </div>
      ) : (
        <div className="space-y-6">
          {timeline.map((section, sectionIndex) => (
            <div key={sectionIndex} className="relative">
              {/* Section Header */}
              <div className="flex items-center space-x-3 mb-4">
                <div
                  className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    section.period === 'before'
                      ? 'bg-blue-100'
                      : 'bg-purple-100'
                  }`}
                >
                  <BuildingOfficeIcon
                    className={`h-5 w-5 ${
                      section.period === 'before' ? 'text-blue-600' : 'text-purple-600'
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-base font-semibold text-gray-900">{section.title}</h4>
                  <p className="text-sm text-gray-500">
                    {section.expenses.length} expense(s) · Total: ₱
                    {section.totalAmount.toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Expenses List */}
              <div className="ml-5 pl-5 border-l-2 border-gray-200 space-y-4">
                {section.expenses.map((expense, expenseIndex) => (
                  <div
                    key={expense.id}
                    className="relative bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                  >
                    {/* Timeline dot */}
                    <div className="absolute -left-7 top-6 w-3 h-3 rounded-full bg-white border-2 border-indigo-600"></div>

                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-900 capitalize">
                            {expense.expenseType.replace('_', ' ')}
                          </span>
                          {getStatusBadge(expense.status)}
                        </div>
                        {expense.description && (
                          <p className="mt-1 text-sm text-gray-600">{expense.description}</p>
                        )}
                        <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {new Date(expense.expenseDate).toLocaleDateString()}
                          </div>
                          {expense.receiptNumber && <span>Receipt: {expense.receiptNumber}</span>}
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-lg font-bold text-gray-900">
                          {expense.currency} {expense.amount.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Transfer Marker */}
              {sectionIndex === 0 && timeline.length > 1 && transferDate && (
                <div className="my-6 flex items-center">
                  <div className="flex-1 border-t-2 border-dashed border-purple-300"></div>
                  <div className="px-4 flex items-center space-x-2 bg-purple-50 rounded-full py-2">
                    <ArrowRightIcon className="h-4 w-4 text-purple-600" />
                    <span className="text-sm font-medium text-purple-900">
                      Transfer to Head Office
                    </span>
                    <span className="text-xs text-purple-700">
                      {new Date(transferDate).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex-1 border-t-2 border-dashed border-purple-300"></div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

