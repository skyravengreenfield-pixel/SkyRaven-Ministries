/**
 * Environment Validation
 * Validates environment variables at startup using Zod schemas
 */

import { z } from 'zod';

const envSchema = z.object({
  VITE_API_BASE_URL: z.string().url('Invalid API base URL'),
  VITE_API_TIMEOUT: z.string().transform(Number).pipe(z.number().positive()),
  VITE_API_RETRY_ATTEMPTS: z.string().transform(Number).pipe(z.number().int().min(0).max(10)),
  VITE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  VITE_ENABLE_ANALYTICS: z.string().transform((val) => val === 'true').default('false'),
  VITE_ENABLE_ERROR_TRACKING: z.string().transform((val) => val === 'true').default('false'),
  VITE_SENTRY_DSN: z.string().optional(),
  VITE_SENTRY_ENVIRONMENT: z.string().optional(),
  VITE_SENTRY_TRACES_SAMPLE_RATE: z.string().transform(Number).pipe(z.number().min(0).max(1)).optional(),
  // Firebase
  VITE_FIREBASE_API_KEY: z.string().optional(),
  VITE_FIREBASE_AUTH_DOMAIN: z.string().optional(),
  VITE_FIREBASE_PROJECT_ID: z.string().optional(),
  VITE_FIREBASE_STORAGE_BUCKET: z.string().optional(),
  VITE_FIREBASE_MESSAGING_SENDER_ID: z.string().optional(),
  VITE_FIREBASE_APP_ID: z.string().optional(),
  VITE_FIREBASE_MEASUREMENT_ID: z.string().optional(),
  // Stripe
  VITE_STRIPE_PUBLISHABLE_KEY: z.string().optional(),
});

export type EnvConfig = z.infer<typeof envSchema>;

/**
 * Validates and returns environment configuration
 * Throws error if validation fails
 */
export function validateEnv(): EnvConfig {
  try {
    return envSchema.parse(import.meta.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const issues = error.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
      throw new Error(`Environment validation failed:\n${issues.join('\n')}`);
    }
    throw error;
  }
}

/**
 * Type-safe environment getter
 */
export function getEnv<K extends keyof EnvConfig>(key: K): EnvConfig[K] {
  const config = validateEnv();
  return config[key];
}
