import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ReportMetric } from '../../types/report';

interface TrendAnalysisProps {
  title: string;
  metrics: ReportMetric[];
  className?: string;
  formatValue?: (value: number) => string;
}

export const TrendAnalysis: React.FC<TrendAnalysisProps> = ({
  title,
  metrics,
  className = '',
  formatValue = (value) => value.toLocaleString(),
}) => {
  const data = metrics.map((metric) => ({
    name: metric.name,
    value: metric.value,
    trend: metric.trend,
    change: metric.change,
  }));

  const getChangeColor = (change: number | undefined) => {
    if (!change) return '#9CA3AF'; // Gray
    return change >= 0 ? '#10B981' : '#EF4444'; // Green : Red
  };

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
          {metrics.map((metric) => (
            <div
              key={metric.name}
              className="bg-gray-50 rounded-lg p-4"
            >
              <h4 className="text-sm font-medium text-gray-500">
                {metric.name}
              </h4>
              <p className="mt-1 text-2xl font-semibold text-gray-900">
                {formatValue(metric.value)}
              </p>
              {metric.change !== undefined && (
                <p
                  className={`mt-1 text-sm font-medium ${
                    metric.changeType === 'increase'
                      ? 'text-green-600'
                      : metric.changeType === 'decrease'
                      ? 'text-red-600'
                      : 'text-gray-500'
                  }`}
                >
                  {metric.change > 0 ? '+' : ''}
                  {metric.change.toFixed(1)}%
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip
                formatter={(value: number) => [formatValue(value), 'Value']}
              />
              <Legend />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8} />
                  <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Change Analysis */}
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-700 mb-3">
            Change Analysis
          </h4>
          <div className="space-y-4">
            {metrics.map((metric) => (
              <div key={metric.name} className="flex items-center">
                <div className="flex-1">
                  <div className="flex items-center">
                    <span className="text-sm font-medium text-gray-900">
                      {metric.name}
                    </span>
                    {metric.change !== undefined && (
                      <span
                        className={`ml-2 text-sm font-medium ${
                          metric.changeType === 'increase'
                            ? 'text-green-600'
                            : metric.changeType === 'decrease'
                            ? 'text-red-600'
                            : 'text-gray-500'
                        }`}
                      >
                        {metric.change > 0 ? '+' : ''}
                        {metric.change.toFixed(1)}%
                      </span>
                    )}
                  </div>
                  <div className="mt-1 relative">
                    <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                      <div
                        style={{
                          width: `${Math.abs(metric.change || 0)}%`,
                          backgroundColor: getChangeColor(metric.change),
                        }}
                        className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="ml-4 text-sm font-medium text-gray-900">
                  {formatValue(metric.value)}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
