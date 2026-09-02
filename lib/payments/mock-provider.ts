/**
 * Mock Payment Provider — DEMO ONLY.
 *
 * Simulates a payment lifecycle in-memory/DB without ever contacting a real
 * payment gateway. All records are flagged `isDemo: true`. Replace with a
 * real provider (Razorpay, Stripe, etc.) by implementing `PaymentProvider`.
 */

import type {
  CreatePaymentInput,
  PaymentProvider,
  PaymentRecord,
  PayoutInput,
  PayoutRecord,
  RefundPaymentInput,
  VerifyPaymentInput,
} from './provider';

function generateId(prefix: string): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

export class MockPaymentProvider implements PaymentProvider {
  async createPayment(input: CreatePaymentInput): Promise<PaymentRecord> {
    return {
      id: generateId('demo_pay'),
      bookingId: input.bookingId,
      amount: input.amount,
      currency: input.currency,
      status: 'pending',
      provider: 'mock',
      providerReference: generateId('demo_ref'),
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
  }

  async verifyPayment(input: VerifyPaymentInput): Promise<PaymentRecord> {
    // In the mock provider, verification always succeeds instantly.
    return {
      id: input.paymentId,
      bookingId: '',
      amount: 0,
      currency: 'INR',
      status: 'captured',
      provider: 'mock',
      providerReference: input.providerReference,
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
  }

  async refundPayment(input: RefundPaymentInput): Promise<PaymentRecord> {
    return {
      id: input.paymentId,
      bookingId: '',
      amount: input.amount ?? 0,
      currency: 'INR',
      status: 'refunded',
      provider: 'mock',
      providerReference: generateId('demo_refund'),
      isDemo: true,
      createdAt: new Date().toISOString(),
    };
  }

  async payout(input: PayoutInput): Promise<PayoutRecord> {
    return {
      id: generateId('demo_payout'),
      truckOwnerId: input.truckOwnerId,
      amount: input.amount,
      currency: input.currency,
      status: 'processed',
      isDemo: true,
    };
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
