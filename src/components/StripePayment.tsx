/**
 * Stripe Payment Component
 * Reusable Stripe payment form
 */

import React, { useState } from 'react';
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from '@stripe/react-stripe-js';
import { getStripe } from '../config/stripe';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { showToast } from './ui/Toast';
import { logger } from '../utils/logger';

interface PaymentFormProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  clientSecret,
  amount,
  onSuccess,
  onError,
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/donation/success`,
          payment_method_data: {
            billing_details: {
              name,
              email,
            },
          },
        },
        redirect: 'if_required',
      });

      if (error) {
        logger.error('Payment failed', { error });
        showToast.error(error.message || 'Payment failed');
        onError?.(new Error(error.message));
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        logger.info('Payment succeeded', { paymentIntentId: paymentIntent.id });
        showToast.success('Payment successful! Thank you for your donation.');
        onSuccess(paymentIntent.id);
      }
    } catch (err: any) {
      logger.error('Payment error', { err });
      showToast.error('An error occurred during payment');
      onError?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <p className="text-lg font-semibold text-blue-900">
          Donation Amount: ${amount.toFixed(2)}
        </p>
      </div>

      <Input
        label="Full Name"
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="John Doe"
        required
        fullWidth
      />

      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="john@example.com"
        required
        fullWidth
      />

      <div className="border border-gray-300 rounded-lg p-4">
        <PaymentElement />
      </div>

      <Button
        type="submit"
        variant="primary"
        size="lg"
        fullWidth
        isLoading={isProcessing}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? 'Processing...' : `Donate $${amount.toFixed(2)}`}
      </Button>

      <p className="text-xs text-gray-500 text-center">
        Powered by Stripe. Your payment information is secure and encrypted.
      </p>
    </form>
  );
};

interface StripePaymentProps {
  clientSecret: string;
  amount: number;
  onSuccess: (paymentIntentId: string) => void;
  onError?: (error: Error) => void;
}

export const StripePayment: React.FC<StripePaymentProps> = (props) => {
  const stripePromise = getStripe();

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret: props.clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
            colorBackground: '#ffffff',
            colorText: '#1f2937',
            colorDanger: '#dc2626',
            fontFamily: 'system-ui, sans-serif',
            borderRadius: '8px',
          },
        },
      }}
    >
      <PaymentForm {...props} />
    </Elements>
  );
};
