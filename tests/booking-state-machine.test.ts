import { describe, expect, it } from 'vitest';
import {
  assertValidTransition,
  canTransition,
  InvalidBookingTransitionError,
  isTerminalStatus,
} from '@/lib/booking/state-machine';

describe('Booking state machine', () => {
  it('allows the full happy-path lifecycle', () => {
    const path: Array<[Parameters<typeof canTransition>[0], Parameters<typeof canTransition>[1], Parameters<typeof canTransition>[2]]> = [
      ['requested', 'accepted', 'truck_owner'],
      ['accepted', 'confirmed', 'shipper'],
      ['confirmed', 'pickup', 'truck_owner'],
      ['pickup', 'in_transit', 'truck_owner'],
      ['in_transit', 'delivered', 'truck_owner'],
      ['delivered', 'completed', 'shipper'],
    ];
    for (const [from, to, actor] of path) {
      expect(canTransition(from, to, actor).allowed).toBe(true);
    }
  });

  it('allows a shipper to reject a booking request', () => {
    expect(canTransition('requested', 'rejected', 'shipper').allowed).toBe(true);
  });

  it('allows cancellation before pickup', () => {
    expect(canTransition('accepted', 'cancelled', 'shipper').allowed).toBe(true);
    expect(canTransition('confirmed', 'cancelled', 'truck_owner').allowed).toBe(true);
  });

  it('rejects skipping states (requested -> in_transit)', () => {
    const result = canTransition('requested', 'in_transit', 'truck_owner');
    expect(result.allowed).toBe(false);
  });

  it('rejects moving backwards (delivered -> pickup)', () => {
    const result = canTransition('delivered', 'pickup', 'truck_owner');
    expect(result.allowed).toBe(false);
  });

  it('rejects transitions from a terminal state', () => {
    expect(canTransition('completed', 'cancelled', 'admin').allowed).toBe(false);
    expect(canTransition('rejected', 'accepted', 'truck_owner').allowed).toBe(false);
  });

  it('enforces actor authorization: shipper cannot mark pickup', () => {
    const result = canTransition('confirmed', 'pickup', 'shipper');
    expect(result.allowed).toBe(false);
    expect(result.reason).toMatch(/not permitted/i);
  });

  it('enforces actor authorization: truck_owner cannot complete a delivered booking', () => {
    const result = canTransition('delivered', 'completed', 'truck_owner');
    expect(result.allowed).toBe(false);
  });

  it('allows admin to resolve a dispute into completed or cancelled', () => {
    expect(canTransition('disputed', 'completed', 'admin').allowed).toBe(true);
    expect(canTransition('disputed', 'cancelled', 'admin').allowed).toBe(true);
  });

  it('does not allow a non-admin to resolve a dispute', () => {
    expect(canTransition('disputed', 'completed', 'shipper').allowed).toBe(false);
  });

  it('allows the system actor to bypass role checks but not graph rules', () => {
    expect(canTransition('requested', 'accepted', 'system').allowed).toBe(true);
    expect(canTransition('requested', 'in_transit', 'system').allowed).toBe(false);
  });

  it('assertValidTransition throws for invalid transitions', () => {
    expect(() => assertValidTransition('completed', 'requested', 'admin')).toThrow(
      InvalidBookingTransitionError
    );
  });

  it('assertValidTransition does not throw for valid transitions', () => {
    expect(() => assertValidTransition('requested', 'accepted', 'truck_owner')).not.toThrow();
  });

  it('identifies terminal statuses correctly', () => {
    expect(isTerminalStatus('completed')).toBe(true);
    expect(isTerminalStatus('cancelled')).toBe(true);
    expect(isTerminalStatus('rejected')).toBe(true);
    expect(isTerminalStatus('requested')).toBe(false);
    expect(isTerminalStatus('in_transit')).toBe(false);
  });
});
