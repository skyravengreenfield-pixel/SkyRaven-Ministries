/**
 * Monitoring Service
 * Integrates with Sentry for error tracking and performance monitoring
 */

import * as Sentry from '@sentry/react';
import { getEnv } from '../config/validation';
import { User } from '../types';

class MonitoringService {
  private initialized = false;

  initialize(): void {
    if (this.initialized) return;

    const enableErrorTracking = getEnv('VITE_ENABLE_ERROR_TRACKING');
    const sentryDsn = getEnv('VITE_SENTRY_DSN');

    if (enableErrorTracking && sentryDsn) {
      Sentry.init({
        dsn: sentryDsn,
        environment: getEnv('VITE_SENTRY_ENVIRONMENT') || getEnv('VITE_ENV'),
        integrations: [
          new Sentry.BrowserTracing({
            tracePropagationTargets: ['localhost', /^https:\/\/.*\.skyraven-ministries\.org/],
          }),
          new Sentry.Replay({
            maskAllText: true,
            blockAllMedia: true,
          }),
        ],
        tracesSampleRate: getEnv('VITE_SENTRY_TRACES_SAMPLE_RATE') || 0.1,
        replaysSessionSampleRate: 0.1,
        replaysOnErrorSampleRate: 1.0,
        beforeSend(event, hint) {
          // Filter out certain errors
          if (event.exception) {
            const error = hint.originalException;
            if (error instanceof Error) {
              // Don't send network errors in development
              if (import.meta.env.DEV && error.message.includes('Network')) {
                return null;
              }
            }
          }
          return event;
        },
      });

      this.initialized = true;
      console.log('Monitoring initialized');
    }
  }

  setUser(user: User | null): void {
    if (!this.initialized) return;

    if (user) {
      Sentry.setUser({
        id: user.id,
        email: user.email,
        username: user.name,
      });
    } else {
      Sentry.setUser(null);
    }
  }

  captureException(error: Error, context?: Record<string, any>): void {
    if (!this.initialized) {
      console.error('Monitoring not initialized:', error, context);
      return;
    }

    Sentry.captureException(error, {
      extra: context,
    });
  }

  captureMessage(message: string, level: Sentry.SeverityLevel = 'info'): void {
    if (!this.initialized) {
      console.log(`[${level}] ${message}`);
      return;
    }

    Sentry.captureMessage(message, level);
  }

  addBreadcrumb(breadcrumb: Sentry.Breadcrumb): void {
    if (!this.initialized) return;
    Sentry.addBreadcrumb(breadcrumb);
  }

  startTransaction(name: string, op: string) {
    if (!this.initialized) return null;
    return Sentry.startTransaction({ name, op });
  }

  setTag(key: string, value: string): void {
    if (!this.initialized) return;
    Sentry.setTag(key, value);
  }

  setContext(name: string, context: Record<string, any>): void {
    if (!this.initialized) return;
    Sentry.setContext(name, context);
  }
}

export const monitoringService = new MonitoringService();
