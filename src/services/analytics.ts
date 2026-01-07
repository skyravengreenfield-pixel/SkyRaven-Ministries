/**
 * Analytics Service
 * Tracks user interactions and events
 */

import { getEnv } from '../config/validation';

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

class AnalyticsService {
  private initialized = false;
  private queue: AnalyticsEvent[] = [];

  initialize(): void {
    if (this.initialized) return;

    const enableAnalytics = getEnv('VITE_ENABLE_ANALYTICS');

    if (enableAnalytics && !import.meta.env.DEV) {
      // Initialize Google Analytics or other analytics services here
      // Example: gtag('config', 'GA_MEASUREMENT_ID');
      
      this.initialized = true;
      this.flushQueue();
      console.log('Analytics initialized');
    }
  }

  track(event: AnalyticsEvent): void {
    if (!this.initialized) {
      this.queue.push(event);
      return;
    }

    // Send to analytics service
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', event.action, {
        event_category: event.category,
        event_label: event.label,
        value: event.value,
      });
    }

    console.log('Analytics Event:', event);
  }

  pageView(path: string): void {
    if (!this.initialized) return;

    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('config', 'GA_MEASUREMENT_ID', {
        page_path: path,
      });
    }

    console.log('Page View:', path);
  }

  // Convenience methods
  trackDonation(amount: number, project: string): void {
    this.track({
      category: 'Donation',
      action: 'Completed',
      label: project,
      value: amount,
    });
  }

  trackProjectView(projectId: number): void {
    this.track({
      category: 'Project',
      action: 'View',
      label: `Project ${projectId}`,
    });
  }

  trackExpenseView(): void {
    this.track({
      category: 'Expense',
      action: 'View',
    });
  }

  trackSearch(query: string): void {
    this.track({
      category: 'Search',
      action: 'Query',
      label: query,
    });
  }

  trackError(error: string): void {
    this.track({
      category: 'Error',
      action: 'Encountered',
      label: error,
    });
  }

  private flushQueue(): void {
    while (this.queue.length > 0) {
      const event = this.queue.shift();
      if (event) {
        this.track(event);
      }
    }
  }
}

export const analyticsService = new AnalyticsService();
