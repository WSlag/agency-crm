import React from 'react';
import type { ReportMetric } from '../../types/report';

interface BreakdownChartProps {
  title: string;
  data: {
    [key: string]: ReportMetric;
  };
  className?: string;
  formatValue?: (value: number) => string;
}

export const BreakdownChart: React.FC<BreakdownChartProps> = ({
  title,
  data,
  className = '',
  formatValue = (value) => value.toLocaleString(),
}) => {
  const total = Object.values(data).reduce((sum, metric) => sum + metric.value, 0);

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-4">
          {Object.entries(data).map(([key, metric]) => {
            const percentage = total > 0 ? (metric.value / total) * 100 : 0;
            return (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">
                    {metric.name}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {formatValue(metric.value)}
                  </span>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                    <div
                      style={{ width: `${percentage}%` }}
                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-600"
                    />
                  </div>
                  <span className="text-xs text-gray-500 absolute right-0 -top-5">
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
