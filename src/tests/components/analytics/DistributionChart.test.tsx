import React from 'react';
import { render, screen } from '@testing-library/react';
import { DistributionChart } from '../../../components/analytics/DistributionChart';

describe('DistributionChart', () => {
  const mockMetrics = {
    metric1: {
      name: 'Metric 1',
      value: 100,
    },
    metric2: {
      name: 'Metric 2',
      value: 200,
    },
    metric3: {
      name: 'Metric 3',
      value: 300,
    },
  };

  it('renders the chart title', () => {
    render(
      <DistributionChart title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('formats values using custom formatter', () => {
    const formatValue = (value: number) => `$${value}`;
    render(
      <DistributionChart
        title="Test Chart"
        metrics={mockMetrics}
        formatValue={formatValue}
      />
    );
    expect(screen.getByText('$100')).toBeInTheDocument();
    expect(screen.getByText('$200')).toBeInTheDocument();
    expect(screen.getByText('$300')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <DistributionChart
        title="Test Chart"
        metrics={mockMetrics}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders all metric names', () => {
    render(
      <DistributionChart title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Metric 1')).toBeInTheDocument();
    expect(screen.getByText('Metric 2')).toBeInTheDocument();
    expect(screen.getByText('Metric 3')).toBeInTheDocument();
  });

  it('calculates and displays percentages', () => {
    render(
      <DistributionChart title="Test Chart" metrics={mockMetrics} />
    );
    const total = 100 + 200 + 300;
    expect(screen.getByText('17%')).toBeInTheDocument(); // 100/600 ≈ 17%
    expect(screen.getByText('33%')).toBeInTheDocument(); // 200/600 ≈ 33%
    expect(screen.getByText('50%')).toBeInTheDocument(); // 300/600 = 50%
  });
});
