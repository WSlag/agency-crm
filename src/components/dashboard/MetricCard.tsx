import React from 'react';
import { ReportMetric } from '../../types/report';

interface MetricCardProps {
  metric: ReportMetric;
  className?: string;
  formatValue?: (value: number) => string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  metric,
  className = '',
  formatValue = (value) => value.toLocaleString(),
}) => {
  const getChangeColor = () => {
    if (!metric.changeType) return 'text-gray-500';
    switch (metric.changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getChangeIcon = () => {
    if (!metric.changeType) return null;
    switch (metric.changeType) {
      case 'increase':
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M5 15l7-7 7 7" />
          </svg>
        );
      case 'decrease':
        return (
          <svg
            className="h-4 w-4"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path d="M19 9l-7 7-7-7" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div
      className={`bg-white overflow-hidden shadow rounded-lg ${className}`}
    >
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">
              {metric.name}
            </p>
            <p className="mt-1 text-3xl font-semibold text-gray-900">
              {formatValue(metric.value)}
            </p>
          </div>
          {metric.change !== undefined && (
            <div className={`ml-5 flex items-center ${getChangeColor()}`}>
              {getChangeIcon()}
              <span className="ml-1 text-sm">
                {metric.change > 0 ? '+' : ''}
                {metric.change.toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        {metric.trend && metric.trend.length > 0 && (
          <div className="mt-4">
            <div className="relative h-8">
              <div className="absolute inset-0 flex items-end space-x-1">
                {metric.trend.map((value, index) => {
                  const maxValue = Math.max(...metric.trend!);
                  const height = (value / maxValue) * 100;
                  return (
                    <div
                      key={index}
                      className="flex-1 bg-indigo-100 rounded-sm"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
