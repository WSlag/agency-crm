import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import { getAnalytics, logEvent } from 'firebase/analytics';
import { getPerformance } from 'firebase/performance';
import { firestore } from '../../config/firebase';

export interface PerformanceMetrics {
  responseTime: number;
  errorRate: number;
  userConcurrency: number;
  dataSync: number;
}

export interface ErrorReport {
  error: Error;
  context: Record<string, any>;
  user?: {
    id: string;
    role: string;
  };
}

export class MonitoringService {
  private analytics;
  private performance;

  constructor() {
    // Initialize Sentry
    Sentry.init({
      dsn: process.env.REACT_APP_SENTRY_DSN,
      integrations: [new Integrations.BrowserTracing()],
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });

    // Initialize Firebase Analytics and Performance
    this.analytics = getAnalytics();
    this.performance = getPerformance();
  }

  // Error tracking
  trackError(report: ErrorReport): void {
    Sentry.withScope((scope) => {
      if (report.user) {
        scope.setUser({
          id: report.user.id,
          role: report.user.role,
        });
      }

      scope.setExtras(report.context);
      Sentry.captureException(report.error);
    });

    // Log to Firebase Analytics
    logEvent(this.analytics, 'error', {
      error_type: report.error.name,
      error_message: report.error.message,
      ...report.context,
    });

    // Store in Firestore for internal tracking
    firestore.collection('error_logs').add({
      error: {
        name: report.error.name,
        message: report.error.message,
        stack: report.error.stack,
      },
      context: report.context,
      user: report.user,
      timestamp: new Date(),
    });
  }

  // Performance monitoring
  trackPerformance(name: string, duration: number): void {
    // Log to Firebase Performance
    const trace = this.performance.trace(name);
    trace.putMetric('duration', duration);
    trace.stop();

    // Log to Firebase Analytics
    logEvent(this.analytics, 'performance', {
      metric_name: name,
      duration,
    });
  }

  // User analytics
  trackUserAction(action: string, data: Record<string, any>): void {
    logEvent(this.analytics, action, data);
  }

  // Health check
  async performHealthCheck(): Promise<Record<string, boolean>> {
    const results: Record<string, boolean> = {};

    try {
      // Check Firestore connection
      await firestore.collection('health_checks').add({
        timestamp: new Date(),
      });
      results.firestore = true;
    } catch (error) {
      results.firestore = false;
      this.trackError({
        error: error as Error,
        context: { check: 'firestore' },
      });
    }

    // Add more health checks as needed

    return results;
  }

  // System metrics
  async collectMetrics(): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      responseTime: 0,
      errorRate: 0,
      userConcurrency: 0,
      dataSync: 0,
    };

    try {
      // Get metrics from Firestore
      const metricsDoc = await firestore.collection('system_metrics').doc('current').get();
      if (metricsDoc.exists) {
        const data = metricsDoc.data();
        metrics.responseTime = data?.responseTime || 0;
        metrics.errorRate = data?.errorRate || 0;
        metrics.userConcurrency = data?.userConcurrency || 0;
        metrics.dataSync = data?.dataSync || 0;
      }
    } catch (error) {
      this.trackError({
        error: error as Error,
        context: { operation: 'collectMetrics' },
      });
    }

    return metrics;
  }

  // User session tracking
  trackSession(userId: string): void {
    logEvent(this.analytics, 'session_start', {
      user_id: userId,
    });

    // Update active users count
    firestore.collection('system_metrics').doc('current').update({
      userConcurrency: firestore.FieldValue.increment(1),
    });
  }

  endSession(userId: string): void {
    logEvent(this.analytics, 'session_end', {
      user_id: userId,
    });

    // Update active users count
    firestore.collection('system_metrics').doc('current').update({
      userConcurrency: firestore.FieldValue.increment(-1),
    });
  }
}
