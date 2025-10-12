import React, { useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/20/solid';
import type { DashboardMetric } from '../../types/navigation';

type MetricCardProps = DashboardMetric;

const formatMetricValue = (value: string | number, type: 'number' | 'currency' | 'percentage' = 'number'): string => {
  if (typeof value === 'string') return value;

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
      }).format(value);
    case 'percentage':
      return `${value}%`;
    default:
      return new Intl.NumberFormat('en-US').format(value);
  }
};

const TrendIcon: React.FC<{ trend: 'up' | 'down' | 'neutral', className?: string }> = ({ trend, className }) => {
  switch (trend) {
    case 'up':
      return <ArrowUpIcon className={className} />;
    case 'down':
      return <ArrowDownIcon className={className} />;
    default:
      return <MinusIcon className={className} />;
  }
};

const getTrendColor = (trend: 'up' | 'down' | 'neutral'): string => {
  switch (trend) {
    case 'up':
      return 'bg-green-100 text-green-800';
    case 'down':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  type = 'number',
  trend,
  change
}) => {
  const formattedValue = useMemo(() => formatMetricValue(value, type), [value, type]);
  
  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-500 truncate">{label}</dt>
        <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
          <div className="flex items-baseline text-2xl font-semibold text-primary-600">
            {formattedValue}
          </div>
          {trend && change && (
            <div className={`
              inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0
              ${getTrendColor(trend)}
            `}>
              <TrendIcon trend={trend} className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0" />
              <span className="sr-only">{trend === 'up' ? 'Increased' : 'Decreased'} by</span>
              {change}%
            </div>
          )}
        </dd>
      </div>
    </div>
  );
};