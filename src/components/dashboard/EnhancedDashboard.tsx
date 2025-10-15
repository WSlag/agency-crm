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
    <div className="relative bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-2xl shadow-2xl overflow-hidden">
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-[size:20px_20px]" />
      </div>
      
      {/* Content */}
      <div className="relative px-4 py-6 sm:p-8">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {metrics.slice(0, 4).map((metric, index) => (
            <div 
              key={metric.label} 
              className="text-center group cursor-pointer transform transition-all duration-300 hover:scale-110"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <dt className="text-sm font-semibold text-blue-100 truncate mb-2 transition-colors group-hover:text-white">
                {metric.label}
              </dt>
              <dd className="text-4xl font-bold text-white mb-1 tracking-tight">
                {typeof metric.value === 'number' 
                  ? metric.value.toLocaleString() 
                  : metric.value}
              </dd>
              {metric.trend && metric.change !== undefined && (
                <div className="mt-2">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold transition-all ${
                    metric.trend === 'up' 
                      ? 'bg-green-400/20 text-green-100 group-hover:bg-green-400/30' 
                      : metric.trend === 'down' 
                      ? 'bg-red-400/20 text-red-100 group-hover:bg-red-400/30' 
                      : 'bg-blue-400/20 text-blue-100 group-hover:bg-blue-400/30'
                  }`}>
                    {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '−'} {metric.change}%
                  </span>
                </div>
              )}
              
              {/* Decorative line */}
              <div className="mt-3 h-1 w-full bg-white/20 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-white rounded-full transition-all duration-1000 group-hover:w-full"
                  style={{ width: '60%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Shine effect */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" 
           style={{ 
             backgroundSize: '200% 100%',
           }} 
      />
    </div>
  );
};

