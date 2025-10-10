import React from 'react';
import { render, screen } from '@testing-library/react';
import { PerformanceChart } from '../../../components/analytics/PerformanceChart';

describe('PerformanceChart', () => {
  const mockMetrics = [
    {
      name: 'Metric 1',
      value: 100,
      trend: [10, 20, 30, 40, 50],
    },
    {
      name: 'Metric 2',
      value: 200,
      trend: [15, 25, 35, 45, 55],
    },
  ];

  it('renders the chart title', () => {
    render(
      <PerformanceChart title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('formats values using custom formatter', () => {
    const formatValue = (value: number) => `$${value}`;
    render(
      <PerformanceChart
        title="Test Chart"
        metrics={mockMetrics}
        formatValue={formatValue}
      />
    );
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <PerformanceChart
        title="Test Chart"
        metrics={mockMetrics}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
