import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { ReportMetric } from '../../types/report';

interface ComparisonChartProps {
  title: string;
  metrics: {
    [key: string]: ReportMetric[];
  };
  className?: string;
  formatValue?: (value: number) => string;
}

export const ComparisonChart: React.FC<ComparisonChartProps> = ({
  title,
  metrics,
  className = '',
  formatValue = (value) => value.toLocaleString(),
}) => {
  const data = Object.entries(metrics).map(([category, values]) => ({
    name: category,
    ...values.reduce(
      (acc, metric) => ({
        ...acc,
        [metric.name]: metric.value,
      }),
      {}
    ),
  }));

  const colors = [
    '#4F46E5', // Indigo
    '#10B981', // Emerald
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#8B5CF6', // Purple
    '#EC4899', // Pink
  ];

  return (
    <div className={`bg-white shadow rounded-lg ${className}`}>
      <div className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">{title}</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
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
              {Object.keys(data[0] || {})
                .filter((key) => key !== 'name')
                .map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={colors[index % colors.length]}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
