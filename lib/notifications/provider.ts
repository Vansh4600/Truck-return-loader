/**
 * Notification abstraction.
 *
 * MVP ships an in-app (database-backed) notification channel only. The
 * interface is channel-agnostic so email/SMS/WhatsApp/push can be added
 * later without touching call sites.
 */

import type { NotificationType } from '@/types/database';

export interface SendNotificationInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationChannel {
  send(input: SendNotificationInput): Promise<void>;
}

export const NOTIFICATION_TEMPLATES: Record<
  NotificationType,
  (metadata: Record<string, unknown>) => { title: string; body: string }
> = {
  NEW_MATCH: (m) => ({
    title: 'New return load match found',
    body: `A ${m.matchScore ?? ''}% match load from ${m.pickupCity ?? 'pickup'} to ${
      m.destinationCity ?? 'destination'
    } is available.`,
  }),
  BOOKING_REQUEST: () => ({
    title: 'New booking request',
    body: 'A truck owner has requested to carry your load.',
  }),
  BOOKING_ACCEPTED: () => ({
    title: 'Booking accepted',
    body: 'Your booking request has been accepted.',
  }),
  BOOKING_REJECTED: () => ({
    title: 'Booking rejected',
    body: 'Your booking request was rejected.',
  }),
  TRIP_STARTED: () => ({
    title: 'Trip started',
    body: 'Your shipment is now in transit.',
  }),
  TRIP_DELAYED: () => ({
    title: 'Trip delayed',
    body: 'Your shipment ETA has changed.',
  }),
  TRIP_COMPLETED: () => ({
    title: 'Trip completed',
    body: 'Your shipment has been delivered and completed.',
  }),
  PAYMENT_RECEIVED: () => ({
    title: 'Payment received (Demo)',
    body: 'A demo payment has been recorded for this booking.',
  }),
};
