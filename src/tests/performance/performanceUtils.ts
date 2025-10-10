import { performance, PerformanceObserver } from 'perf_hooks';

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private observer: PerformanceObserver;

  constructor() {
    this.observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach((entry) => {
        this.metrics.push({
          name: entry.name,
          duration: entry.duration,
          timestamp: entry.startTime,
        });
      });
    });

    this.observer.observe({ entryTypes: ['measure'] });
  }

  startMeasurement(name: string) {
    performance.mark(`${name}-start`);
  }

  endMeasurement(name: string) {
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
  }

  getMetrics(): PerformanceMetric[] {
    return this.metrics;
  }

  clearMetrics() {
    this.metrics = [];
    performance.clearMarks();
    performance.clearMeasures();
  }

  disconnect() {
    this.observer.disconnect();
  }
}
