import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ReportMetric } from '../../types/report';

interface PerformanceChartProps {
  title: string;
  metrics: ReportMetric[];
  className?: string;
  formatValue?: (value: number) => string;
}

export const PerformanceChart: React.FC<PerformanceChartProps> = ({
  title,
  metrics,
  className = '',
  formatValue = (value) => value.toLocaleString(),
}) => {
  const data = metrics.map((metric) => ({
    name: metric.name,
    value: metric.value,
    trend: metric.trend,
  }));

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={data}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={formatValue} />
              <Tooltip
                formatter={(value: number) => [formatValue(value), 'Value']}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#4F46E5"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
