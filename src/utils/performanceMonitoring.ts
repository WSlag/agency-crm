interface PerformanceMetric {
  name: string;
  duration: number;
  startTime: number;
  entryType: string;
}

class PerformanceMonitoring {
  private static instance: PerformanceMonitoring;
  private metrics: Map<string, PerformanceMetric[]>;
  private observer: PerformanceObserver | null;

  private constructor() {
    this.metrics = new Map();
    this.observer = null;
    this.setupObserver();
  }

  public static getInstance(): PerformanceMonitoring {
    if (!PerformanceMonitoring.instance) {
      PerformanceMonitoring.instance = new PerformanceMonitoring();
    }
    return PerformanceMonitoring.instance;
  }

  private setupObserver() {
    if (typeof window === 'undefined' || !window.PerformanceObserver) return;

    try {
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.addMetric(entry.name, {
            name: entry.name,
            duration: entry.duration,
            startTime: entry.startTime,
            entryType: entry.entryType
          });
        });
      });

      this.observer.observe({ entryTypes: ['measure', 'resource'] });
    } catch (error) {
      console.warn('Performance monitoring is not supported in this environment:', error);
    }
  }

  private addMetric(name: string, metric: PerformanceMetric) {
    const metrics = this.metrics.get(name) || [];
    metrics.push(metric);
    this.metrics.set(name, metrics);
  }

  public startMeasure(name: string) {
    if (typeof window === 'undefined' || !window.performance) return;

    try {
      performance.mark(`${name}-start`);
    } catch (error) {
      console.warn(`Failed to start measure ${name}:`, error);
    }
  }

  public endMeasure(name: string) {
    if (typeof window === 'undefined' || !window.performance) return;

    try {
      performance.mark(`${name}-end`);
      performance.measure(name, `${name}-start`, `${name}-end`);
    } catch (error) {
      console.warn(`Failed to end measure ${name}:`, error);
    }
  }

  public getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.get(name) || [];
    }
    return Array.from(this.metrics.values()).flat();
  }

  public clearMetrics(name?: string) {
    if (name) {
      this.metrics.delete(name);
      if (typeof window !== 'undefined' && window.performance) {
        try {
          performance.clearMarks(`${name}-start`);
          performance.clearMarks(`${name}-end`);
          performance.clearMeasures(name);
        } catch (error) {
          console.warn(`Failed to clear metrics for ${name}:`, error);
        }
      }
    } else {
      this.metrics.clear();
      if (typeof window !== 'undefined' && window.performance) {
        try {
          performance.clearMarks();
          performance.clearMeasures();
        } catch (error) {
          console.warn('Failed to clear all metrics:', error);
        }
      }
    }
  }

  public dispose() {
    if (this.observer) {
      this.observer.disconnect();
    }
    this.metrics.clear();
    if (typeof window !== 'undefined' && window.performance) {
      try {
        performance.clearMarks();
        performance.clearMeasures();
      } catch (error) {
        console.warn('Failed to dispose performance monitoring:', error);
      }
    }
  }
}

export const performanceMonitoring = PerformanceMonitoring.getInstance();