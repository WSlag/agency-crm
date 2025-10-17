import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { PageTransition } from '../animation/PageTransition';
import { Breadcrumbs } from '../navigation/Breadcrumbs';
import { ErrorBoundary } from '../error/ErrorBoundary';
import { SelectField } from '../forms/fields/SelectField';
import { analyticsService, AnalyticsResult } from '../../services/AnalyticsService';
import { ResponsiveContainer } from '../layout/ResponsiveContainer';
import { ResponsiveGrid } from '../layout/ResponsiveContainer';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartData
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DashboardMetrics {
  financial: {
    expenses: AnalyticsResult;
    commissions: AnalyticsResult;
  };
  documents: AnalyticsResult;
  performance: AnalyticsResult;
}

interface MetricCardProps {
  title: string;
  value: number | string;
  change?: number;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, format }) => {
  const formatValue = (val: number | string, format?: string) => {
    if (typeof val !== 'number') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-PH', {
          style: 'currency',
          currency: 'PHP'
        }).format(val);
      case 'percentage':
        return `${(val * 100).toFixed(1)}%`;
      case 'duration':
        return `${val.toFixed(1)}ms`;
      default:
        return new Intl.NumberFormat('en-US').format(val);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <div className="mt-2 flex items-baseline">
        <p className="text-2xl font-semibold text-gray-900">
          {formatValue(value, format)}
        </p>
        {change !== undefined && (
          <p className={`ml-2 flex items-baseline text-sm font-semibold ${
            change >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
    </div>
  );
};

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState('7d');
  const { customClaims } = useAuth();

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' }
  ];

  useEffect(() => {
    loadMetrics();
  }, [timeRange]);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const [expenses, commissions, documents, performance] = await Promise.all([
        analyticsService.getExpenseMetrics(customClaims?.branchId),
        analyticsService.getCommissionMetrics(customClaims?.branchId),
        analyticsService.getDocumentMetrics(customClaims?.branchId),
        analyticsService.getPerformanceMetrics()
      ]);

      setMetrics({
        financial: {
          expenses,
          commissions
        },
        documents,
        performance
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const getChartData = (result: AnalyticsResult): ChartData<'line' | 'bar'> => {
    return {
      labels: result.details.map(d => new Date(d.createdAt).toLocaleDateString()),
      datasets: Object.entries(result.summary)
        .filter(([key]) => !key.includes('_sum') && !key.includes('_count'))
        .map(([key, value]) => ({
          label: key,
          data: result.details.map(d => d[key] || 0),
          borderColor: `hsl(${Math.random() * 360}, 70%, 50%)`,
          backgroundColor: `hsla(${Math.random() * 360}, 70%, 50%, 0.5)`,
          tension: 0.4
        }))
    };
  };

  return (
    <ErrorBoundary>
      <PageTransition isLoading={loading}>
        <div className="space-y-6">
          <Breadcrumbs />
          
          <div className="sm:flex sm:items-center sm:justify-between">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Analytics Dashboard</h1>
              <p className="mt-2 text-sm text-gray-700">
                Track key metrics and performance indicators.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
              <SelectField
                name="timeRange"
                label="Time Range"
                value={timeRange}
                onChange={setTimeRange}
                options={timeRangeOptions}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">{error}</div>
                </div>
              </div>
            </div>
          )}

          {metrics && (
            <ResponsiveContainer>
              {/* Financial Metrics */}
              <div className="space-y-6">
                <h2 className="text-lg font-medium text-gray-900">Financial Metrics</h2>
                <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 4 }} gap={4}>
                  <MetricCard
                    title="Total Expenses"
                    value={metrics.financial.expenses.summary.total}
                    format="currency"
                  />
                  <MetricCard
                    title="Average Expense"
                    value={metrics.financial.expenses.summary.average}
                    format="currency"
                  />
                  <MetricCard
                    title="Total Commissions"
                    value={metrics.financial.commissions.summary.total}
                    format="currency"
                  />
                  <MetricCard
                    title="Average Commission"
                    value={metrics.financial.commissions.summary.average}
                    format="currency"
                  />
                </ResponsiveGrid>
                <div className="h-80">
                  <Line
                    data={getChartData(metrics.financial.expenses)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Expense Trends'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Document Metrics */}
              <div className="space-y-6 mt-8">
                <h2 className="text-lg font-medium text-gray-900">Document Metrics</h2>
                <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap={4}>
                  <MetricCard
                    title="Total Documents"
                    value={metrics.documents.summary.total}
                    format="number"
                  />
                  <MetricCard
                    title="Average Verification Time"
                    value={metrics.documents.summary.verificationTime}
                    format="duration"
                  />
                  <MetricCard
                    title="Rejection Rate"
                    value={metrics.documents.summary.rejectionRate}
                    format="percentage"
                  />
                </ResponsiveGrid>
                <div className="h-80">
                  <Bar
                    data={getChartData(metrics.documents)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'Document Processing Statistics'
                        }
                      }
                    }}
                  />
                </div>
              </div>

              {/* Performance Metrics */}
              <div className="space-y-6 mt-8">
                <h2 className="text-lg font-medium text-gray-900">Performance Metrics</h2>
                <ResponsiveGrid cols={{ default: 1, sm: 2, lg: 3 }} gap={4}>
                  <MetricCard
                    title="Average Response Time"
                    value={metrics.performance.summary.responseTime}
                    format="duration"
                  />
                  <MetricCard
                    title="Error Rate"
                    value={metrics.performance.summary.errorRate}
                    format="percentage"
                  />
                  <MetricCard
                    title="Active Users"
                    value={metrics.performance.summary.userCount}
                    format="number"
                  />
                </ResponsiveGrid>
                <div className="h-80">
                  <Line
                    data={getChartData(metrics.performance)}
                    options={{
                      responsive: true,
                      maintainAspectRatio: false,
                      plugins: {
                        title: {
                          display: true,
                          text: 'System Performance Trends'
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </ResponsiveContainer>
          )}
        </div>
      </PageTransition>
    </ErrorBoundary>
  );
};