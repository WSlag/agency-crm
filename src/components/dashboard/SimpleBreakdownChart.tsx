import React from 'react';
import type { DashboardMetric } from '../../types/navigation';

interface SimpleBreakdownChartProps {
  title: string;
  data: DashboardMetric[];
  className?: string;
}

export const SimpleBreakdownChart: React.FC<SimpleBreakdownChartProps> = ({
  title,
  data,
  className = '',
}) => {
  const total = data.reduce((sum, metric) => {
    const value = typeof metric.value === 'number' ? metric.value : 0;
    return sum + value;
  }, 0);

  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-red-500',
    'bg-teal-500',
  ];

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-3">
          {data.map((metric, index) => {
            const value = typeof metric.value === 'number' ? metric.value : 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            return (
              <div key={metric.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700">
                    {metric.label}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">
                    {value.toLocaleString()}
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center ${
                        colors[index % colors.length]
                      }`}
                    />
                  </div>
                  <span className="text-xs text-gray-500 mt-0.5 inline-block">
                    {percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

