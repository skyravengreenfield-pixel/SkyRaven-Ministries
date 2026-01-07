/**
 * Centralized Logging Service
 * Enterprise-grade logging with multiple levels and external service integration
 */

import { config } from '../config/environment';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  data?: unknown;
  stack?: string;
  context?: string;
}

class Logger {
  private context?: string;
  private logLevel: LogLevel;

  constructor(context?: string) {
    this.context = context;
    this.logLevel = this.mapLogLevel(config.get('logLevel'));
  }

  private mapLogLevel(level: string): LogLevel {
    return (LogLevel[level.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO);
  }

  private shouldLog(level: LogLevel): boolean {
    if (!config.get('enableLogging')) {
      return level === LogLevel.ERROR; // Always log errors
    }

    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);

    return messageLevelIndex >= currentLevelIndex;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const context = entry.context || this.context || 'App';
    return `[${timestamp}] [${entry.level.toUpperCase()}] [${context}] ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: unknown): void {
    if (!this.shouldLog(level)) {
      return;
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      data,
      context: this.context,
    };

    const formattedMessage = this.formatMessage(entry);

    // Console logging
    switch (level) {
      case LogLevel.DEBUG:
        console.debug(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
    }

    // Send to external logging service in production
    if (config.isProduction() && (level === LogLevel.ERROR || level === LogLevel.WARN)) {
      this.sendToExternalService(entry);
    }
  }

  private sendToExternalService(entry: LogEntry): void {
    // Integration point for external logging services (Sentry, LogRocket, etc.)
    // This would be implemented with your actual logging service
    try {
      // Example: Send to Sentry
      // Sentry.captureMessage(entry.message, { level: entry.level, extra: entry.data });
    } catch (error) {
      console.error('Failed to send log to external service', error);
    }
  }

  debug(message: string, data?: unknown): void {
    this.log(LogLevel.DEBUG, message, data);
  }

  info(message: string, data?: unknown): void {
    this.log(LogLevel.INFO, message, data);
  }

  warn(message: string, data?: unknown): void {
    this.log(LogLevel.WARN, message, data);
  }

  error(message: string, error?: Error | unknown): void {
    const entry: LogEntry = {
      level: LogLevel.ERROR,
      message,
      timestamp: new Date(),
      data: error,
      stack: error instanceof Error ? error.stack : undefined,
      context: this.context,
    };

    const formattedMessage = this.formatMessage(entry);
    console.error(formattedMessage, error);

    if (config.isProduction()) {
      this.sendToExternalService(entry);
    }
  }

  createChild(context: string): Logger {
    return new Logger(context);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export factory function for creating contextual loggers
export const createLogger = (context: string): Logger => {
  return new Logger(context);
};
