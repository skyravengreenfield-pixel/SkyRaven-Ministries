/**
 * Environment Configuration
 * Centralized configuration for different environments
 */

export enum Environment {
  Development = 'development',
  Staging = 'staging',
  Production = 'production',
}

interface EnvironmentConfig {
  env: Environment;
  apiBaseUrl: string;
  apiTimeout: number;
  enableLogging: boolean;
  enableAnalytics: boolean;
  sentryDsn?: string;
  stripePublicKey?: string;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

const getEnvironment = (): Environment => {
  const env = import.meta.env.VITE_APP_ENV as Environment;
  return env || Environment.Development;
};

const configs: Record<Environment, EnvironmentConfig> = {
  [Environment.Development]: {
    env: Environment.Development,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api',
    apiTimeout: 30000,
    enableLogging: true,
    enableAnalytics: false,
    logLevel: 'debug',
  },
  [Environment.Staging]: {
    env: Environment.Staging,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://staging-api.skyravenministries.org/api',
    apiTimeout: 30000,
    enableLogging: true,
    enableAnalytics: true,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    logLevel: 'info',
  },
  [Environment.Production]: {
    env: Environment.Production,
    apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'https://api.skyravenministries.org/api',
    apiTimeout: 30000,
    enableLogging: false,
    enableAnalytics: true,
    sentryDsn: import.meta.env.VITE_SENTRY_DSN,
    stripePublicKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY,
    logLevel: 'error',
  },
};

class ConfigService {
  private config: EnvironmentConfig;

  constructor() {
    const environment = getEnvironment();
    this.config = configs[environment];
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this.config[key];
  }

  getAll(): EnvironmentConfig {
    return { ...this.config };
  }

  isProduction(): boolean {
    return this.config.env === Environment.Production;
  }

  isDevelopment(): boolean {
    return this.config.env === Environment.Development;
  }

  isStaging(): boolean {
    return this.config.env === Environment.Staging;
  }
}

export const config = new ConfigService();
