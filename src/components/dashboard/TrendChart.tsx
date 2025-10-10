import React from 'react';
import type { ReportMetric } from '../../types/report';

interface TrendChartProps {
  title: string;
  metrics: ReportMetric[];
  className?: string;
  formatValue?: (value: number) => string;
}

export const TrendChart: React.FC<TrendChartProps> = ({
  title,
  metrics,
  className = '',
  formatValue = (value) => value.toLocaleString(),
}) => {
  const maxValue = Math.max(...metrics.flatMap((m) => m.trend || []));

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="space-y-8">
          {metrics.map((metric) => (
            <div key={metric.name}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">
                  {metric.name}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium text-gray-900">
                    {formatValue(metric.value)}
                  </span>
                  {metric.change !== undefined && (
                    <span
                      className={`text-sm font-medium ${
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
              {metric.trend && metric.trend.length > 0 && (
                <div className="relative h-10">
                  <div className="absolute inset-0 flex items-end space-x-1">
                    {metric.trend.map((value, index) => {
                      const height = (value / maxValue) * 100;
                      return (
                        <div
                          key={index}
                          className="flex-1 bg-indigo-100 rounded-sm relative group"
                          style={{ height: `${height}%` }}
                        >
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded whitespace-nowrap">
                            {formatValue(value)}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
