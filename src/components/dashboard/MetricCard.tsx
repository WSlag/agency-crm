import React, { useMemo } from 'react';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/20/solid';
import type { DashboardMetric } from '../../types/navigation';

// Support both simple DashboardMetric and advanced features
type MetricCardProps = DashboardMetric & {
  trendData?: number[]; // Optional trend sparkline data
  description?: string; // Optional metric description
  colorScheme?: 'blue' | 'green' | 'purple' | 'orange' | 'pink' | 'indigo'; // Color variant
};

const formatMetricValue = (value: string | number, type: 'number' | 'currency' | 'percentage' = 'number'): string => {
  if (typeof value === 'string') return value;

  switch (type) {
    case 'currency':
      return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
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

const getColorScheme = (color: string = 'blue') => {
  const schemes: Record<string, {bg: string; border: string; text: string; sparkline: string; hover: string}> = {
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      sparkline: 'bg-blue-400',
      hover: 'hover:from-blue-100 hover:to-blue-200'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-600',
      sparkline: 'bg-green-400',
      hover: 'hover:from-green-100 hover:to-green-200'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
      sparkline: 'bg-purple-400',
      hover: 'hover:from-purple-100 hover:to-purple-200'
    },
    orange: {
      bg: 'bg-gradient-to-br from-orange-50 to-orange-100',
      border: 'border-orange-200',
      text: 'text-orange-600',
      sparkline: 'bg-orange-400',
      hover: 'hover:from-orange-100 hover:to-orange-200'
    },
    pink: {
      bg: 'bg-gradient-to-br from-pink-50 to-pink-100',
      border: 'border-pink-200',
      text: 'text-pink-600',
      sparkline: 'bg-pink-400',
      hover: 'hover:from-pink-100 hover:to-pink-200'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      sparkline: 'bg-indigo-400',
      hover: 'hover:from-indigo-100 hover:to-indigo-200'
    }
  };
  return schemes[color] || schemes.blue;
};

const MiniSparkline: React.FC<{ data: number[], colorScheme: string }> = ({ data, colorScheme }) => {
  const maxValue = Math.max(...data);
  const minValue = Math.min(...data);
  const range = maxValue - minValue || 1;
  
  return (
    <div className="flex items-end space-x-0.5 h-8 mt-2">
      {data.map((value, index) => {
        const height = ((value - minValue) / range) * 100;
        return (
          <div
            key={index}
            className={`flex-1 ${colorScheme} rounded-sm transition-all hover:opacity-80`}
            style={{ height: `${Math.max(height, 10)}%` }}
          />
        );
      })}
    </div>
  );
};

export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  type = 'number',
  trend,
  change,
  trendData,
  description,
  colorScheme = 'blue'
}) => {
  const formattedValue = useMemo(() => formatMetricValue(value, type), [value, type]);
  const colors = getColorScheme(colorScheme);
  
  return (
    <div className={`
      ${colors.bg} ${colors.hover}
      overflow-hidden shadow-lg rounded-xl border-2 ${colors.border}
      transition-all duration-300 transform hover:scale-105 hover:shadow-2xl
      cursor-pointer
    `}>
      <div className="px-4 py-5 sm:p-6">
        <dt className="text-sm font-medium text-gray-600 truncate">{label}</dt>
        {description && (
          <p className="mt-1 text-xs text-gray-400">{description}</p>
        )}
        <dd className="mt-1 flex items-baseline justify-between md:block lg:flex">
          <div className={`flex items-baseline text-3xl font-bold ${colors.text}`}>
            {formattedValue}
          </div>
          {trend && change !== undefined && (
            <div className={`
              inline-flex items-baseline px-2.5 py-0.5 rounded-full text-sm font-medium md:mt-2 lg:mt-0
              ${getTrendColor(trend)}
              animate-pulse
            `}>
              <TrendIcon trend={trend} className="-ml-1 mr-0.5 h-5 w-5 flex-shrink-0" />
              <span className="sr-only">{trend === 'up' ? 'Increased' : 'Decreased'} by</span>
              {Math.abs(change)}%
            </div>
          )}
        </dd>
        {trendData && trendData.length > 0 && (
          <MiniSparkline data={trendData} colorScheme={colors.sparkline} />
        )}
      </div>
    </div>
  );
};