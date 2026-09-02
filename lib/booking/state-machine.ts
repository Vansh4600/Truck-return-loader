/**
 * Booking lifecycle state machine.
 *
 * Enforces valid transitions only. Both server actions/API routes MUST call
 * `assertValidTransition` (or `canTransition`) before persisting any status
 * change — never update `bookings.status` directly from client input.
 */

import type { BookingStatus } from '@/types/database';

export type BookingActor = 'shipper' | 'truck_owner' | 'admin' | 'system';

interface TransitionRule {
  to: BookingStatus[];
  /** Which actor role(s) are allowed to trigger this transition. */
  allowedActors: BookingActor[];
}

/**
 * The canonical lifecycle (happy path):
 *   requested -> accepted -> confirmed -> pickup -> in_transit -> delivered -> completed
 *
 * Branches:
 *   requested -> rejected | cancelled
 *   accepted  -> cancelled
 *   confirmed -> cancelled
 *   any active state -> disputed
 */
export const BOOKING_TRANSITIONS: Record<BookingStatus, TransitionRule> = {
  requested: {
    to: ['accepted', 'rejected', 'cancelled'],
    allowedActors: ['truck_owner', 'shipper', 'admin'],
  },
  accepted: {
    to: ['confirmed', 'cancelled', 'disputed'],
    allowedActors: ['shipper', 'truck_owner', 'admin'],
  },
  rejected: { to: [], allowedActors: [] },
  confirmed: {
    to: ['pickup', 'cancelled', 'disputed'],
    allowedActors: ['truck_owner', 'admin'],
  },
  pickup: {
    to: ['in_transit', 'disputed'],
    allowedActors: ['truck_owner', 'admin'],
  },
  in_transit: {
    to: ['delivered', 'disputed'],
    allowedActors: ['truck_owner', 'admin'],
  },
  delivered: {
    to: ['completed', 'disputed'],
    allowedActors: ['shipper', 'admin'],
  },
  completed: { to: [], allowedActors: [] },
  cancelled: { to: [], allowedActors: [] },
  disputed: {
    to: ['completed', 'cancelled'],
    allowedActors: ['admin'],
  },
};

export interface TransitionCheckResult {
  allowed: boolean;
  reason?: string;
}

export function canTransition(
  from: BookingStatus,
  to: BookingStatus,
  actor: BookingActor
): TransitionCheckResult {
  const rule = BOOKING_TRANSITIONS[from];

  if (!rule) {
    return { allowed: false, reason: `Unknown current status "${from}"` };
  }

  if (from === to) {
    return { allowed: false, reason: 'Booking is already in this status' };
  }

  if (!rule.to.includes(to)) {
    return {
      allowed: false,
      reason: `Cannot move booking from "${from}" to "${to}"`,
    };
  }

  if (actor !== 'system' && !rule.allowedActors.includes(actor)) {
    return {
      allowed: false,
      reason: `"${actor}" is not permitted to move a booking from "${from}" to "${to}"`,
    };
  }

  return { allowed: true };
}

export class InvalidBookingTransitionError extends Error {
  constructor(reason: string) {
    super(reason);
    this.name = 'InvalidBookingTransitionError';
  }
}

export function assertValidTransition(
  from: BookingStatus,
  to: BookingStatus,
  actor: BookingActor
): void {
  const result = canTransition(from, to, actor);
  if (!result.allowed) {
    throw new InvalidBookingTransitionError(result.reason ?? 'Invalid transition');
  }
}

export function isTerminalStatus(status: BookingStatus): boolean {
  return BOOKING_TRANSITIONS[status]?.to.length === 0;
}
