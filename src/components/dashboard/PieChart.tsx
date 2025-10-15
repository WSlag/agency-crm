import React, { useState, useMemo } from 'react';
import type { DashboardMetric } from '../../types/navigation';

interface PieChartProps {
  title: string;
  data: DashboardMetric[];
  className?: string;
}

export const PieChart: React.FC<PieChartProps> = ({
  title,
  data,
  className = '',
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const colorSchemes = [
    { bg: 'bg-blue-500', fill: '#3B82F6', text: 'text-blue-600', border: 'border-blue-500' },
    { bg: 'bg-green-500', fill: '#10B981', text: 'text-green-600', border: 'border-green-500' },
    { bg: 'bg-purple-500', fill: '#A855F7', text: 'text-purple-600', border: 'border-purple-500' },
    { bg: 'bg-orange-500', fill: '#F97316', text: 'text-orange-600', border: 'border-orange-500' },
    { bg: 'bg-pink-500', fill: '#EC4899', text: 'text-pink-600', border: 'border-pink-500' },
    { bg: 'bg-indigo-500', fill: '#6366F1', text: 'text-indigo-600', border: 'border-indigo-500' },
  ];

  const total = useMemo(() => 
    data.reduce((sum, metric) => sum + (typeof metric.value === 'number' ? metric.value : 0), 0),
    [data]
  );

  // Calculate pie slices
  const slices = useMemo(() => {
    let currentAngle = -90; // Start from top
    return data.map((metric, index) => {
      const value = typeof metric.value === 'number' ? metric.value : 0;
      const percentage = total > 0 ? (value / total) * 100 : 0;
      const angle = (percentage / 100) * 360;
      
      const startAngle = currentAngle;
      const endAngle = currentAngle + angle;
      currentAngle = endAngle;

      // Calculate path for pie slice
      const startRad = (startAngle * Math.PI) / 180;
      const endRad = (endAngle * Math.PI) / 180;
      const radius = 80;
      const centerX = 100;
      const centerY = 100;

      const x1 = centerX + radius * Math.cos(startRad);
      const y1 = centerY + radius * Math.sin(startRad);
      const x2 = centerX + radius * Math.cos(endRad);
      const y2 = centerY + radius * Math.sin(endRad);

      const largeArc = angle > 180 ? 1 : 0;

      const path = [
        `M ${centerX} ${centerY}`,
        `L ${x1} ${y1}`,
        `A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`,
        'Z'
      ].join(' ');

      return {
        path,
        percentage,
        value,
        label: metric.label,
        color: colorSchemes[index % colorSchemes.length],
        midAngle: (startAngle + endAngle) / 2,
      };
    });
  }, [data, total, colorSchemes]);

  return (
    <div className={`bg-white shadow-2xl rounded-2xl border border-gray-200 hover:shadow-3xl transition-all duration-300 ${className}`}>
      <div className="px-6 py-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="w-2 h-10 bg-gradient-to-b from-indigo-500 to-purple-600 rounded-full mr-3"></span>
            {title}
          </h3>
          <div className="text-right">
            <p className="text-sm text-gray-500 font-medium">Total</p>
            <p className="text-3xl font-bold text-indigo-600">{total}</p>
          </div>
        </div>

        {/* Pie Chart Container */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 mt-6">
          {/* SVG Pie Chart */}
          <div className="flex-shrink-0">
            <svg
              viewBox="0 0 200 200"
              className="w-80 h-80 transform transition-transform duration-300 hover:scale-105"
            >
              {/* Shadow circle */}
              <circle
                cx="100"
                cy="100"
                r="85"
                fill="none"
                stroke="#E5E7EB"
                strokeWidth="2"
                opacity="0.3"
              />

              {/* Pie slices */}
              {slices.map((slice, index) => (
                <g key={index}>
                  <path
                    d={slice.path}
                    fill={slice.color.fill}
                    className={`cursor-pointer transition-all duration-300 ${
                      hoveredIndex === index ? 'opacity-100 filter drop-shadow-lg' : 'opacity-90'
                    }`}
                    stroke="white"
                    strokeWidth="2"
                    onMouseEnter={() => setHoveredIndex(index)}
                    onMouseLeave={() => setHoveredIndex(null)}
                    style={{
                      transform: hoveredIndex === index ? 'scale(1.05)' : 'scale(1)',
                      transformOrigin: '100px 100px',
                      filter: hoveredIndex === index ? 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' : 'none'
                    }}
                  />
                  
                  {/* Percentage label on slice */}
                  {slice.percentage > 5 && (
                    <text
                      x={100 + 50 * Math.cos((slice.midAngle * Math.PI) / 180)}
                      y={100 + 50 * Math.sin((slice.midAngle * Math.PI) / 180)}
                      fill="white"
                      fontSize="14"
                      fontWeight="bold"
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className={hoveredIndex === index ? 'text-lg' : ''}
                    >
                      {slice.percentage.toFixed(0)}%
                    </text>
                  )}
                </g>
              ))}

              {/* Center circle with total */}
              <circle
                cx="100"
                cy="100"
                r="45"
                fill="white"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              <text
                x="100"
                y="95"
                fill="#6B7280"
                fontSize="12"
                fontWeight="600"
                textAnchor="middle"
              >
                Total
              </text>
              <text
                x="100"
                y="110"
                fill="#4F46E5"
                fontSize="20"
                fontWeight="bold"
                textAnchor="middle"
              >
                {total}
              </text>
            </svg>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {slices.map((slice, index) => (
              <div
                key={index}
                className={`group cursor-pointer p-4 rounded-xl transition-all duration-300 ${
                  hoveredIndex === index
                    ? 'bg-gradient-to-r from-indigo-50 to-purple-50 shadow-md scale-105'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-6 h-6 rounded-lg ${slice.color.bg} ${
                        hoveredIndex === index ? 'scale-125 shadow-lg' : ''
                      } transition-all duration-300 border-2 ${slice.color.border}`}
                    />
                    <div>
                      <p className={`font-bold transition-all duration-300 ${
                        hoveredIndex === index ? 'text-lg ' + slice.color.text : 'text-base text-gray-900'
                      }`}>
                        {slice.label}
                      </p>
                      <p className="text-xs text-gray-500">
                        {slice.percentage.toFixed(1)}% of total
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-2xl font-bold transition-all duration-300 ${
                      hoveredIndex === index ? slice.color.text + ' scale-110' : 'text-gray-900'
                    }`}>
                      {slice.value}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

