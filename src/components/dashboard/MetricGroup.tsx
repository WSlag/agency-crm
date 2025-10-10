import React from 'react';
import { MetricCard } from './MetricCard';
import type { ReportMetric } from '../../types/report';

interface MetricGroupProps {
  title: string;
  metrics: {
    [key: string]: ReportMetric;
  };
  className?: string;
  formatValue?: (value: number) => string;
}

export const MetricGroup: React.FC<MetricGroupProps> = ({
  title,
  metrics,
  className = '',
  formatValue,
}) => {
  return (
    <div className={className}>
      <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {Object.values(metrics).map((metric) => (
          <MetricCard
            key={metric.name}
            metric={metric}
            formatValue={formatValue}
          />
        ))}
      </div>
    </div>
  );
};
