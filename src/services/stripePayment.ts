/**
 * Stripe Payment Service
 * Handles payment processing with Stripe
 */

import { Stripe, StripeElements, PaymentIntent } from '@stripe/stripe-js';
import { getStripe, STRIPE_CONFIG } from '../config/stripe';
import { apiClient } from './apiClient';
import { logger } from '../utils/logger';

export interface DonationPayment {
  amount: number;
  currency?: string;
  projectId?: number;
  donorName: string;
  donorEmail: string;
  message?: string;
  recurring?: boolean;
  frequency?: 'monthly' | 'quarterly' | 'yearly';
}

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
}

class StripePaymentService {
  private stripe: Stripe | null = null;

  /**
   * Initialize Stripe
   */
  async initialize(): Promise<void> {
    if (!this.stripe) {
      this.stripe = await getStripe();
      if (this.stripe) {
        logger.info('Stripe initialized successfully');
      }
    }
  }

  /**
   * Create payment intent for donation
   */
  async createPaymentIntent(donation: DonationPayment): Promise<PaymentIntentResponse> {
    try {
      const response = await apiClient.post<PaymentIntentResponse>('/payments/create-intent', {
        amount: Math.round(donation.amount * 100), // Convert to cents
        currency: donation.currency || STRIPE_CONFIG.currency,
        projectId: donation.projectId,
        donorName: donation.donorName,
        donorEmail: donation.donorEmail,
        message: donation.message,
        recurring: donation.recurring,
        frequency: donation.frequency,
      });

      logger.info('Payment intent created', { paymentIntentId: response.paymentIntentId });
      return response;
    } catch (error) {
      logger.error('Failed to create payment intent', { error });
      throw new Error('Failed to create payment. Please try again.');
    }
  }

  /**
   * Confirm card payment
   */
  async confirmCardPayment(
    clientSecret: string,
    elements: StripeElements,
    billingDetails: {
      name: string;
      email: string;
      phone?: string;
    }
  ): Promise<PaymentIntent> {
    await this.initialize();

    if (!this.stripe) {
      throw new Error('Stripe is not initialized');
    }

    try {
      const { error, paymentIntent } = await this.stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: billingDetails,
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        logger.error('Payment confirmation failed', { error });
        throw new Error(error.message || 'Payment failed');
      }

      if (!paymentIntent) {
        throw new Error('Payment intent not returned');
      }

      logger.info('Payment confirmed successfully', { paymentIntentId: paymentIntent.id });
      return paymentIntent;
    } catch (error: any) {
      logger.error('Payment confirmation error', { error });
      throw new Error(error.message || 'Payment processing failed');
    }
  }

  /**
   * Retrieve payment intent
   */
  async retrievePaymentIntent(clientSecret: string): Promise<PaymentIntent | null> {
    await this.initialize();

    if (!this.stripe) {
      return null;
    }

    try {
      const { paymentIntent } = await this.stripe.retrievePaymentIntent(clientSecret);
      return paymentIntent || null;
    } catch (error) {
      logger.error('Failed to retrieve payment intent', { error });
      return null;
    }
  }

  /**
   * Create subscription for recurring donations
   */
  async createSubscription(
    customerId: string,
    priceId: string,
    paymentMethodId: string
  ): Promise<any> {
    try {
      const response = await apiClient.post('/payments/create-subscription', {
        customerId,
        priceId,
        paymentMethodId,
      });

      logger.info('Subscription created', { subscriptionId: response.id });
      return response;
    } catch (error) {
      logger.error('Failed to create subscription', { error });
      throw new Error('Failed to set up recurring donation');
    }
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      await apiClient.post(`/payments/cancel-subscription/${subscriptionId}`);
      logger.info('Subscription cancelled', { subscriptionId });
    } catch (error) {
      logger.error('Failed to cancel subscription', { error });
      throw new Error('Failed to cancel subscription');
    }
  }

  /**
   * Get Stripe instance
   */
  getStripeInstance(): Stripe | null {
    return this.stripe;
  }

  /**
   * Format amount for display
   */
  formatAmount(amount: number, currency: string = STRIPE_CONFIG.currency): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount);
  }

  /**
   * Validate card details
   */
  validateCardNumber(cardNumber: string): boolean {
    // Luhn algorithm for card validation
    const digits = cardNumber.replace(/\D/g, '');
    if (digits.length < 13 || digits.length > 19) return false;

    let sum = 0;
    let isEven = false;

    for (let i = digits.length - 1; i >= 0; i--) {
      let digit = parseInt(digits[i], 10);

      if (isEven) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }

      sum += digit;
      isEven = !isEven;
    }

    return sum % 10 === 0;
  }

  /**
   * Get card brand from number
   */
  getCardBrand(cardNumber: string): string {
    const digits = cardNumber.replace(/\D/g, '');
    
    if (/^4/.test(digits)) return 'visa';
    if (/^5[1-5]/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(?:011|5)/.test(digits)) return 'discover';
    
    return 'unknown';
  }
}

export const stripePaymentService = new StripePaymentService();
