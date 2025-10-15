import React, { useState } from 'react';
import type { DashboardMetric } from '../../types/navigation';

interface BarChartProps {
  title: string;
  data: DashboardMetric[];
  className?: string;
}

export const BarChart: React.FC<BarChartProps> = ({
  title,
  data,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const maxValue = Math.max(...data.map(metric => 
    typeof metric.value === 'number' ? metric.value : 0
  ));

  const colorSchemes = [
    { bg: 'bg-blue-500', hover: 'bg-blue-600', text: 'text-blue-600', bgLight: 'bg-blue-100' },
    { bg: 'bg-green-500', hover: 'bg-green-600', text: 'text-green-600', bgLight: 'bg-green-100' },
    { bg: 'bg-purple-500', hover: 'bg-purple-600', text: 'text-purple-600', bgLight: 'bg-purple-100' },
    { bg: 'bg-orange-500', hover: 'bg-orange-600', text: 'text-orange-600', bgLight: 'bg-orange-100' },
    { bg: 'bg-pink-500', hover: 'bg-pink-600', text: 'text-pink-600', bgLight: 'bg-pink-100' },
    { bg: 'bg-indigo-500', hover: 'bg-indigo-600', text: 'text-indigo-600', bgLight: 'bg-indigo-100' },
    { bg: 'bg-red-500', hover: 'bg-red-600', text: 'text-red-600', bgLight: 'bg-red-100' },
    { bg: 'bg-teal-500', hover: 'bg-teal-600', text: 'text-teal-600', bgLight: 'bg-teal-100' },
    { bg: 'bg-yellow-500', hover: 'bg-yellow-600', text: 'text-yellow-600', bgLight: 'bg-yellow-100' },
    { bg: 'bg-cyan-500', hover: 'bg-cyan-600', text: 'text-cyan-600', bgLight: 'bg-cyan-100' },
  ];

  const total = data.reduce((sum, metric) => {
    const value = typeof metric.value === 'number' ? metric.value : 0;
    return sum + value;
  }, 0);

  return (
    <div className={`bg-white shadow-xl rounded-2xl border border-gray-200 hover:shadow-2xl transition-all duration-300 ${className}`}>
      <div className="px-6 py-5">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center">
            <span className="w-1.5 h-8 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></span>
            {title}
          </h3>
          <div className="text-right">
            <p className="text-xs text-gray-500 font-medium">Total Applicants</p>
            <p className="text-2xl font-bold text-indigo-600">{total}</p>
          </div>
        </div>
        
        {/* Bar Chart */}
        <div className="space-y-4">
          {data.map((metric, index) => {
            const value = typeof metric.value === 'number' ? metric.value : 0;
            const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
            const colorScheme = colorSchemes[index % colorSchemes.length];
            const isHovered = hoveredIndex === index;
            
            return (
              <div
                key={metric.label}
                className="group cursor-pointer"
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-end justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${colorScheme.bg} ${isHovered ? 'scale-125 shadow-lg' : ''} transition-all duration-200`} />
                    <span className={`text-sm font-semibold transition-all duration-200 ${
                      isHovered ? 'text-gray-900 scale-105 transform translate-x-1' : 'text-gray-700'
                    }`}>
                      {metric.label}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className={`text-lg font-bold transition-all duration-200 ${
                      isHovered ? colorScheme.text + ' scale-110' : 'text-gray-900'
                    }`}>
                      {value}
                    </span>
                    <span className={`text-xs font-medium px-2 py-1 rounded-full transition-all duration-200 ${
                      isHovered ? colorScheme.bgLight + ' ' + colorScheme.text : 'bg-gray-100 text-gray-500'
                    }`}>
                      {((value / total) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
                
                {/* Animated Bar */}
                <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorScheme.bg} ${isHovered ? colorScheme.hover : ''} transition-all duration-700 ease-out relative overflow-hidden group-hover:shadow-lg`}
                    style={{ 
                      width: `${Math.max(percentage, 5)}%`,
                      transform: isHovered ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 animate-shimmer" 
                         style={{ 
                           backgroundSize: '200% 100%',
                         }} 
                    />
                    
                    {/* Value label on bar (for larger bars) */}
                    {percentage > 15 && (
                      <div className="absolute inset-0 flex items-center justify-end pr-3">
                        <span className="text-white font-bold text-sm opacity-90">
                          {value}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {/* Hover glow effect */}
                  {isHovered && (
                    <div 
                      className={`absolute inset-0 ${colorScheme.bg} opacity-20 blur-xl`}
                      style={{ 
                        width: `${percentage}%`,
                        transition: 'all 0.3s ease-out'
                      }}
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3 justify-center">
            {data.slice(0, 5).map((metric, index) => {
              const colorScheme = colorSchemes[index % colorSchemes.length];
              return (
                <div 
                  key={metric.label} 
                  className="flex items-center space-x-2 cursor-pointer hover:scale-105 transition-transform"
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  <div className={`w-2.5 h-2.5 rounded-full ${colorScheme.bg}`} />
                  <span className="text-xs font-medium text-gray-600">{metric.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

