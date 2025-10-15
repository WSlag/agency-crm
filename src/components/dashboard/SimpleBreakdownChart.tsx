import React, { useState } from 'react';
import type { DashboardMetric } from '../../types/navigation';

interface SimpleBreakdownChartProps {
  title: string;
  data: DashboardMetric[];
  className?: string;
}

export const SimpleBreakdownChart: React.FC<SimpleBreakdownChartProps> = ({
  title,
  data,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const total = data.reduce((sum, metric) => {
    const value = typeof metric.value === 'number' ? metric.value : 0;
    return sum + value;
  }, 0);

  const colorSchemes = [
    { bg: 'bg-blue-500', hover: 'hover:bg-blue-600', glow: 'shadow-blue-500/50' },
    { bg: 'bg-green-500', hover: 'hover:bg-green-600', glow: 'shadow-green-500/50' },
    { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', glow: 'shadow-yellow-500/50' },
    { bg: 'bg-purple-500', hover: 'hover:bg-purple-600', glow: 'shadow-purple-500/50' },
    { bg: 'bg-pink-500', hover: 'hover:bg-pink-600', glow: 'shadow-pink-500/50' },
    { bg: 'bg-indigo-500', hover: 'hover:bg-indigo-600', glow: 'shadow-indigo-500/50' },
    { bg: 'bg-red-500', hover: 'hover:bg-red-600', glow: 'shadow-red-500/50' },
    { bg: 'bg-teal-500', hover: 'hover:bg-teal-600', glow: 'shadow-teal-500/50' },
  ];

  return (
    <div className={`bg-white shadow-lg rounded-xl border border-gray-200 hover:shadow-2xl transition-shadow duration-300 ${className}`}>
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
          <span className="w-1 h-6 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></span>
          {title}
        </h3>
        <div className="space-y-4">
          {data.map((metric, index) => {
            const value = typeof metric.value === 'number' ? metric.value : 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const colorScheme = colorSchemes[index % colorSchemes.length];
            const isHovered = hoveredIndex === index;
            
            return (
              <div 
                key={metric.label}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-sm font-semibold transition-all duration-200 ${
                    isHovered ? 'text-gray-900 scale-105' : 'text-gray-700'
                  }`}>
                    {metric.label}
                  </span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-sm font-bold transition-all duration-200 ${
                      isHovered ? 'text-indigo-600 scale-110' : 'text-gray-900'
                    }`}>
                      {value.toLocaleString()}
                    </span>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-200 ${
                      isHovered ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {percentage.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div className="relative">
                  <div className="overflow-hidden h-3 rounded-full bg-gray-200">
                    <div
                      style={{ width: `${percentage}%` }}
                      className={`h-full transition-all duration-500 ease-out ${colorScheme.bg} ${colorScheme.hover} ${
                        isHovered ? `shadow-lg ${colorScheme.glow}` : ''
                      } relative overflow-hidden`}
                    >
                      {/* Animated shine effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer" 
                           style={{ 
                             backgroundSize: '200% 100%',
                             animation: 'shimmer 2s infinite'
                           }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Total Summary */}
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-600">Total</span>
            <span className="text-lg font-bold text-indigo-600">{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

