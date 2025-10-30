import React from 'react';
import type { ReportMetric } from '../../types/report';

interface PerformanceTableProps {
  title: string;
  data: {
    id: string;
    name: string;
    metrics: {
      [key: string]: ReportMetric;
    };
  }[];
  className?: string;
  formatValue?: (value: number) => string;
}

export const PerformanceTable: React.FC<PerformanceTableProps> = ({
  title,
  data,
  className = '',
  formatValue = (value) => value.toLocaleString(),
}) => {
  const metricKeys = data[0]?.metrics ? Object.keys(data[0].metrics) : [];

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="p-4 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>

        {/* Mobile Card View - Show on screens < 768px */}
        <div className="md:hidden space-y-3">
          {data.map((item) => (
            <div key={item.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h4 className="text-sm font-semibold text-gray-900 mb-3">{item.name}</h4>
              <div className="space-y-2">
                {metricKeys.map((key) => {
                  const metric = item.metrics[key];
                  return (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-xs font-medium text-gray-500 uppercase">{key}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900">
                          {formatValue(metric.value)}
                        </span>
                        {metric.change !== undefined && (
                          <span
                            className={`text-xs font-medium ${
                              metric.changeType === 'increase'
                                ? 'text-green-500'
                                : metric.changeType === 'decrease'
                                ? 'text-red-500'
                                : 'text-gray-500'
                            }`}
                          >
                            {metric.change > 0 ? '+' : ''}
                            {metric.change.toFixed(1)}%
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Desktop Table View - Show on screens >= 768px */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                {metricKeys.map((key) => (
                  <th
                    key={key}
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.name}
                  </td>
                  {metricKeys.map((key) => {
                    const metric = item.metrics[key];
                    return (
                      <td
                        key={key}
                        className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                      >
                        <div className="flex items-center space-x-2">
                          <span>{formatValue(metric.value)}</span>
                          {metric.change !== undefined && (
                            <span
                              className={`text-xs font-medium ${
                                metric.changeType === 'increase'
                                  ? 'text-green-500'
                                  : metric.changeType === 'decrease'
                                  ? 'text-red-500'
                                  : 'text-gray-500'
                              }`}
                            >
                              {metric.change > 0 ? '+' : ''}
                              {metric.change.toFixed(1)}%
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
