import React from 'react';
import { render, screen } from '@testing-library/react';
import { ComparisonChart } from '../../../components/analytics/ComparisonChart';

describe('ComparisonChart', () => {
  const mockMetrics = {
    'Category 1': [
      {
        name: 'Metric 1',
        value: 100,
      },
      {
        name: 'Metric 2',
        value: 200,
      },
    ],
    'Category 2': [
      {
        name: 'Metric 1',
        value: 150,
      },
      {
        name: 'Metric 2',
        value: 250,
      },
    ],
  };

  it('renders the chart title', () => {
    render(
      <ComparisonChart title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('formats values using custom formatter', () => {
    const formatValue = (value: number) => `$${value}`;
    render(
      <ComparisonChart
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
      <ComparisonChart
        title="Test Chart"
        metrics={mockMetrics}
        className="custom-class"
      />
    );
    expect(container.firstChild).toHaveClass('custom-class');
  });

  it('renders all categories', () => {
    render(
      <ComparisonChart title="Test Chart" metrics={mockMetrics} />
    );
    expect(screen.getByText('Category 1')).toBeInTheDocument();
    expect(screen.getByText('Category 2')).toBeInTheDocument();
  });
});
