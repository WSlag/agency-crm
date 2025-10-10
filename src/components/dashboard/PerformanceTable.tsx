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
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="overflow-x-auto">
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
