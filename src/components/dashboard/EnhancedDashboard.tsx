import React from 'react';
import { MetricCard } from './MetricCard';
import { SimpleBreakdownChart } from './SimpleBreakdownChart';
import type { DashboardMetric } from '../../types/navigation';

interface EnhancedDashboardProps {
  metrics: DashboardMetric[];
  breakdowns?: Record<string, DashboardMetric[]>;
  title?: string;
}

export const EnhancedDashboard: React.FC<EnhancedDashboardProps> = ({
  metrics,
  breakdowns,
  title
}) => {
  return (
    <div className="space-y-6">
      {title && (
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
      )}
      
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {metrics.map(metric => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </div>

      {/* Breakdowns Section */}
      {breakdowns && Object.keys(breakdowns).length > 0 && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {Object.entries(breakdowns).map(([key, data]) => (
            <SimpleBreakdownChart
              key={key}
              title={key.replace(/([A-Z])/g, ' $1').trim().replace(/^./, str => str.toUpperCase())}
              data={data}
            />
          ))}
        </div>
      )}
    </div>
  );
};

// Quick Stats Component for highlighting key metrics
interface QuickStatsProps {
  metrics: DashboardMetric[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ metrics }) => {
  return (
    <div className="bg-gradient-to-r from-primary-500 to-primary-700 rounded-lg shadow-lg overflow-hidden">
      <div className="px-4 py-5 sm:p-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {metrics.slice(0, 4).map(metric => (
            <div key={metric.label} className="text-center">
              <dt className="text-sm font-medium text-primary-100 truncate">
                {metric.label}
              </dt>
              <dd className="mt-1 text-3xl font-semibold text-white">
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString() 
                  : metric.value}
              </dd>
              {metric.trend && metric.change !== undefined && (
                <div className="mt-1">
                  <span className={`text-xs font-medium ${
                    metric.trend === 'up' 
                      ? 'text-green-200' 
                      : metric.trend === 'down' 
                      ? 'text-red-200' 
                      : 'text-primary-200'
                  }`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '−'} {metric.change}%
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

