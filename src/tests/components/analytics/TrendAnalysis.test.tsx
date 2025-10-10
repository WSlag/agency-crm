import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrendAnalysis } from '../../../components/analytics/TrendAnalysis';

describe('TrendAnalysis', () => {
  const mockMetrics = [
    {
      name: 'Metric 1',
      value: 100,
      change: 5,
      changeType: 'increase' as const,
      trend: [80, 85, 90, 95, 100],
    },
    {
      name: 'Metric 2',
      value: 200,
      change: -3,
      changeType: 'decrease' as const,
      trend: [210, 208, 205, 202, 200],
    },
    {
      name: 'Metric 3',
      value: 300,
      change: 0,
      changeType: 'no_change' as const,
      trend: [300, 300, 300, 300, 300],
    },
  ];

  it('renders the chart title', () => {
    render(
      <TrendAnalysis title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('formats values using custom formatter', () => {
    const formatValue = (value: number) => `$${value}`;
    render(
      <TrendAnalysis
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
      <TrendAnalysis
        title="Test Chart"
        metrics={mockMetrics}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders all metric names', () => {
    render(
      <TrendAnalysis title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Metric 1')).toBeInTheDocument();
    expect(screen.getByText('Metric 2')).toBeInTheDocument();
    expect(screen.getByText('Metric 3')).toBeInTheDocument();
  });

  it('displays change percentages with correct formatting', () => {
    render(
      <TrendAnalysis title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('+5.0%')).toBeInTheDocument();
    expect(screen.getByText('-3.0%')).toBeInTheDocument();
    expect(screen.getByText('0.0%')).toBeInTheDocument();
  });

  it('applies correct color classes for changes', () => {
    render(
      <TrendAnalysis title="Test Chart" metrics={mockMetrics} />
    );
    
    // Increase (green)
    const increaseElement = screen.getByText('+5.0%');
    expect(increaseElement).toHaveClass('text-green-600');

    // Decrease (red)
    const decreaseElement = screen.getByText('-3.0%');
    expect(decreaseElement).toHaveClass('text-red-600');

    // No change (gray)
    const noChangeElement = screen.getByText('0.0%');
    expect(noChangeElement).toHaveClass('text-gray-500');
  });

  it('renders change analysis section', () => {
    render(
      <TrendAnalysis title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Change Analysis')).toBeInTheDocument();
  });

  it('renders summary cards for each metric', () => {
    render(
      <TrendAnalysis title="Test Chart" metrics={mockMetrics} />
    );
    
    mockMetrics.forEach((metric) => {
      const card = screen.getByText(metric.name).closest('.bg-gray-50');
      expect(card).toBeInTheDocument();
      expect(card).toHaveTextContent(metric.value.toString());
      expect(card).toHaveTextContent(
        metric.change > 0
          ? `+${metric.change.toFixed(1)}%`
          : `${metric.change.toFixed(1)}%`
      );
    });
  });
});
