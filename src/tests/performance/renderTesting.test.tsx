import { describe, it, expect, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { PerformanceMonitor } from './performanceUtils';

// Mock heavy components for testing
const MockApplicantList = () => {
  const items = Array.from({ length: 100 }, (_, i) => ({
    id: `applicant-${i}`,
    name: `Applicant ${i}`,
    status: 'pending',
  }));

  return (
    <div>
      {items.map(item => (
        <div key={item.id} data-testid="applicant-item">
          {item.name} - {item.status}
        </div>
      ))}
    </div>
  );
};

const MockDashboard = () => {
  const metrics = Array.from({ length: 20 }, (_, i) => ({
    id: `metric-${i}`,
    value: Math.random() * 1000,
    label: `Metric ${i}`,
  }));

  return (
    <div>
      {metrics.map(metric => (
        <div key={metric.id} data-testid="metric-card">
          {metric.label}: {metric.value.toFixed(2)}
        </div>
      ))}
    </div>
  );
};

describe('Component Render Performance', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });

  it('measures applicant list render performance', () => {
    performanceMonitor.startMeasurement('applicant-list-render');
    const { container } = render(<MockApplicantList />);
    performanceMonitor.endMeasurement('applicant-list-render');

    const metrics = performanceMonitor.getMetrics();
    const renderMetric = metrics.find(m => m.name === 'applicant-list-render');

    expect(renderMetric).toBeDefined();
    expect(renderMetric?.duration).toBeLessThan(100); // 100ms threshold
    expect(container.querySelectorAll('[data-testid="applicant-item"]')).toHaveLength(100);
  });

  it('measures dashboard render performance', () => {
    performanceMonitor.startMeasurement('dashboard-render');
    const { container } = render(<MockDashboard />);
    performanceMonitor.endMeasurement('dashboard-render');

    const metrics = performanceMonitor.getMetrics();
    const renderMetric = metrics.find(m => m.name === 'dashboard-render');

    expect(renderMetric).toBeDefined();
    expect(renderMetric?.duration).toBeLessThan(50); // 50ms threshold
    expect(container.querySelectorAll('[data-testid="metric-card"]')).toHaveLength(20);
  });
});
