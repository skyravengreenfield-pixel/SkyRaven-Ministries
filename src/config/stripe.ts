/**
 * Stripe Configuration
 * Initialize and configure Stripe for payment processing
 */

import { loadStripe, Stripe } from '@stripe/stripe-js';
import { logger } from '../utils/logger';

let stripePromise: Promise<Stripe | null> | null = null;

/**
 * Get Stripe instance
 */
export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!publishableKey) {
      logger.warn('Stripe publishable key not configured');
      return Promise.resolve(null);
    }

    stripePromise = loadStripe(publishableKey);
    logger.info('Stripe initialized');
  }

  return stripePromise;
}

/**
 * Stripe configuration constants
 */
export const STRIPE_CONFIG = {
  currency: 'usd',
  country: 'US',
  locale: 'en',
} as const;

/**
 * Payment method types supported
 */
export const PAYMENT_METHODS = {
  CARD: 'card',
  BANK_ACCOUNT: 'us_bank_account',
  LINK: 'link',
} as const;

export type PaymentMethod = typeof PAYMENT_METHODS[keyof typeof PAYMENT_METHODS];
