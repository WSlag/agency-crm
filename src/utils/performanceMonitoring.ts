interface PerformanceMetric {
  componentName: string;
  renderTime: number;
  timestamp: Date;
}

class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetric[] = [];
  private readonly maxMetrics = 1000;
  private isEnabled = process.env.NODE_ENV === 'development';

  private constructor() {}

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
  }

  measureRender(componentName: string, startTime: number) {
    if (!this.isEnabled) return;

    const renderTime = performance.now() - startTime;
    this.addMetric({
      componentName,
      renderTime,
      timestamp: new Date()
    });

    // Log slow renders
    if (renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  }

  private addMetric(metric: PerformanceMetric) {
    this.metrics.push(metric);
    
    // Remove old metrics if we exceed maxMetrics
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  getMetrics(componentName?: string) {
    if (componentName) {
      return this.metrics.filter(m => m.componentName === componentName);
    }
    return this.metrics;
  }

  getAverageRenderTime(componentName?: string) {
    const relevantMetrics = componentName
      ? this.metrics.filter(m => m.componentName === componentName)
      : this.metrics;

    if (relevantMetrics.length === 0) return 0;

    const sum = relevantMetrics.reduce((acc, m) => acc + m.renderTime, 0);
    return sum / relevantMetrics.length;
  }

  clearMetrics() {
    this.metrics = [];
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();

// Performance monitoring hook
export function usePerformanceMonitoring(componentName: string) {
  return {
    measureRender: () => {
      const startTime = performance.now();
      return () => performanceMonitor.measureRender(componentName, startTime);
    }
  };
}
