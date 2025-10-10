import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PerformanceMonitor } from './performanceUtils';

// Performance thresholds in milliseconds
const PERFORMANCE_THRESHOLDS = {
  AUTH_LOGIN: 2000,
  DATA_FETCH: 1000,
  FORM_SUBMIT: 3000,
  FILE_UPLOAD: 5000,
  ROUTE_CHANGE: 300,
  INITIAL_LOAD: 2000,
};

describe('Critical Operations Performance', () => {
  let performanceMonitor: PerformanceMonitor;

  beforeEach(() => {
    performanceMonitor = new PerformanceMonitor();
  });

  afterEach(() => {
    performanceMonitor.clearMetrics();
    performanceMonitor.disconnect();
  });

  it('measures authentication performance', async () => {
    performanceMonitor.startMeasurement('auth-login');
    // Simulate login operation
    await new Promise(resolve => setTimeout(resolve, 500));
    performanceMonitor.endMeasurement('auth-login');

    const metrics = performanceMonitor.getMetrics();
    const loginMetric = metrics.find(m => m.name === 'auth-login');
    
    expect(loginMetric).toBeDefined();
    expect(loginMetric?.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.AUTH_LOGIN);
  });

  it('measures data fetching performance', async () => {
    performanceMonitor.startMeasurement('data-fetch');
    // Simulate data fetching
    await new Promise(resolve => setTimeout(resolve, 300));
    performanceMonitor.endMeasurement('data-fetch');

    const metrics = performanceMonitor.getMetrics();
    const fetchMetric = metrics.find(m => m.name === 'data-fetch');
    
    expect(fetchMetric).toBeDefined();
    expect(fetchMetric?.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.DATA_FETCH);
  });

  it('measures form submission performance', async () => {
    performanceMonitor.startMeasurement('form-submit');
    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    performanceMonitor.endMeasurement('form-submit');

    const metrics = performanceMonitor.getMetrics();
    const submitMetric = metrics.find(m => m.name === 'form-submit');
    
    expect(submitMetric).toBeDefined();
    expect(submitMetric?.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FORM_SUBMIT);
  });

  it('measures file upload performance', async () => {
    performanceMonitor.startMeasurement('file-upload');
    // Simulate file upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    performanceMonitor.endMeasurement('file-upload');

    const metrics = performanceMonitor.getMetrics();
    const uploadMetric = metrics.find(m => m.name === 'file-upload');
    
    expect(uploadMetric).toBeDefined();
    expect(uploadMetric?.duration).toBeLessThan(PERFORMANCE_THRESHOLDS.FILE_UPLOAD);
  });
});
