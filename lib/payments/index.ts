import { mockPaymentProvider } from './mock-provider';
import type { PaymentProvider } from './provider';

export function getPaymentProvider(): PaymentProvider {
  // Future: switch on process.env.PAYMENT_PROVIDER ('razorpay' | 'stripe' | 'mock')
  return mockPaymentProvider;
}

export * from './provider';
