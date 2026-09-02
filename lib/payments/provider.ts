/**
 * PaymentProvider abstraction.
 *
 * IMPORTANT: The MVP ships only a Mock/Demo payment provider. No real money
 * moves through this platform yet. Any UI that surfaces payment status MUST
 * clearly label it "Demo / Mock Payment". Do not present mock payments as
 * real transactions.
 */

export interface CreatePaymentInput {
  bookingId: string;
  amount: number;
  currency: string; // e.g. 'INR'
  payerId: string;
  payeeId: string;
}

export interface PaymentRecord {
  id: string;
  bookingId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';
  provider: string;
  providerReference: string | null;
  isDemo: boolean;
  createdAt: string;
}

export interface VerifyPaymentInput {
  paymentId: string;
  providerReference: string;
}

export interface RefundPaymentInput {
  paymentId: string;
  amount?: number; // partial refund support
  reason?: string;
}

export interface PayoutInput {
  truckOwnerId: string;
  bookingId: string;
  amount: number;
  currency: string;
}

export interface PayoutRecord {
  id: string;
  truckOwnerId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processed' | 'failed';
  isDemo: boolean;
}

export interface PaymentProvider {
  createPayment(input: CreatePaymentInput): Promise<PaymentRecord>;
  verifyPayment(input: VerifyPaymentInput): Promise<PaymentRecord>;
  refundPayment(input: RefundPaymentInput): Promise<PaymentRecord>;
  payout(input: PayoutInput): Promise<PayoutRecord>;
}
