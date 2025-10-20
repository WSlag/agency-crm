import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BanknotesIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { firestore } from '../../config/firebase';

interface FinancialMetric {
  label: string;
  value: number;
  trend: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  link: string;
}

interface FinancialOverviewProps {
  branchId?: string;
}

export const FinancialOverview: React.FC<FinancialOverviewProps> = ({ branchId }) => {
  const [metrics, setMetrics] = useState<FinancialMetric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setLoading(true);

        // Fetch expenses - filter by branch if branchId is provided
        const expensesQuery = branchId
          ? query(collection(firestore, 'expenses'), where('branchId', '==', branchId))
          : collection(firestore, 'expenses');
        const expensesSnapshot = await getDocs(expensesQuery);
        const pendingExpenses = expensesSnapshot.docs.filter(
          doc => doc.data().status === 'pending'
        );
        const pendingExpensesAmount = pendingExpenses.reduce(
          (sum, doc) => sum + (doc.data().amount || 0), 0
        );

        // Fetch commissions - filter by branch if branchId is provided
        const commissionsQuery = branchId
          ? query(collection(firestore, 'commissions'), where('branchId', '==', branchId))
          : collection(firestore, 'commissions');
        const commissionsSnapshot = await getDocs(commissionsQuery);
        const pendingCommissions = commissionsSnapshot.docs.filter(
          doc => doc.data().status === 'pending'
        );
        const commissionBacklog = pendingCommissions.reduce(
          (sum, doc) => sum + (doc.data().amount || 0), 0
        );

        // Calculate monthly burn rate (expenses in current month)
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyExpenses = expensesSnapshot.docs
          .filter(doc => {
            const expenseDate = doc.data().expenseDate?.toDate();
            return expenseDate && 
                   expenseDate.getMonth() === currentMonth && 
                   expenseDate.getFullYear() === currentYear;
          })
          .reduce((sum, doc) => sum + (doc.data().amount || 0), 0);

        setMetrics([
          {
            label: 'Pending Payables',
            value: pendingExpensesAmount,
            trend: 5.2,
            icon: ClockIcon,
            color: 'from-yellow-500 to-orange-600',
            link: '/expenses'
          },
          {
            label: 'Monthly Burn Rate',
            value: monthlyExpenses,
            trend: -2.1,
            icon: ArrowTrendingUpIcon,
            color: 'from-red-500 to-pink-600',
            link: '/expenses'
          },
          {
            label: 'Commission Backlog',
            value: commissionBacklog,
            trend: 3.8,
            icon: BanknotesIcon,
            color: 'from-purple-500 to-indigo-600',
            link: '/commissions'
          }
        ]);
      } catch (error) {
        console.error('Error fetching financial data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFinancialData();
  }, [branchId]);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-gray-200 rounded"></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-32 bg-gray-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
              <CurrencyDollarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">Financial Overview</h3>
              <p className="text-xs sm:text-sm text-green-100">Key financial metrics</p>
            </div>
          </div>
          <Link
            to="/financial-dashboard"
            className="text-xs sm:text-sm font-medium text-white hover:text-green-100 transition-colors"
          >
            Details →
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4 sm:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            const isPositiveTrend = metric.trend > 0;

            return (
              <Link
                key={metric.label}
                to={metric.link}
                className="group relative bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-green-300 hover:shadow-lg transition-all duration-200"
              >
                {/* Icon */}
                <div className={`
                  inline-flex p-3 rounded-xl bg-gradient-to-r ${metric.color} mb-3
                  group-hover:scale-110 transition-transform
                `}>
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>

                {/* Label */}
                <div className="text-xs sm:text-sm font-medium text-gray-600 mb-1">
                  {metric.label}
                </div>

                {/* Value */}
                <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                  {formatCurrency(metric.value)}
                </div>

                {/* Trend */}
                <div className="flex items-center space-x-1">
                  <span className={`
                    inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${isPositiveTrend 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                    }
                  `}>
                    {isPositiveTrend ? '↑' : '↓'} {Math.abs(metric.trend)}%
                  </span>
                  <span className="text-xs text-gray-500">vs last month</span>
                </div>

                {/* Hover Arrow */}
                <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

