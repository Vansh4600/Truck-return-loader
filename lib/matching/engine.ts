/**
 * Return-load matching engine.
 *
 * Deterministic, rule-based, and fully explainable. Every score is derived
 * from clear domain logic (no black-box ML) so it can be audited, tested,
 * and later swapped for an `AIMatchingEngine` that implements the same
 * `MatchingEngine` interface (see bottom of file).
 */

import { getMapProvider, haversineDistanceKm } from '@/lib/maps';
import type { MapProvider } from '@/lib/maps/provider';
import {
  DEFAULT_WEIGHTS,
  VEHICLE_TYPE_ORDER,
  type MatchResult,
  type MatchScoreBreakdown,
  type MatchWeights,
  type MatchableLoad,
  type MatchableTruck,
} from './types';

const MIN_VIABLE_SCORE = 30; // matches below this are considered "very low / rejected"

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

// ---------------------------------------------------------------------------
// Individual scoring dimensions
// ---------------------------------------------------------------------------

interface RouteScoreResult {
  score: number;
  detourKm: number;
  pickupDistanceKm: number;
  isExactReverse: boolean;
  isSameDirectionContinuation: boolean;
  reasons: string[];
}

async function computeRouteAndDetour(
  truck: MatchableTruck,
  load: MatchableLoad,
  mapProvider: MapProvider
): Promise<RouteScoreResult> {
  const reasons: string[] = [];

  const pickupDistanceKm = round1(
    haversineDistanceKm(truck.currentLocation, load.pickupLocation)
  );

  const isExactReverse =
    load.pickupCity.toLowerCase() === truck.destinationCity.toLowerCase() &&
    load.destinationCity.toLowerCase() === truck.originCity.toLowerCase();

  const isSameDirectionContinuation =
    !isExactReverse &&
    load.pickupCity.toLowerCase() === truck.destinationCity.toLowerCase();

  const [truckRoute, loadRoute] = await Promise.all([
    mapProvider.calculateRoute(truck.originCity, truck.destinationCity),
    mapProvider.calculateRoute(load.pickupCity, load.destinationCity),
  ]);

  const truckCities = new Set(truckRoute.waypointCities.map((c) => c.toLowerCase()));
  const loadCities = new Set(loadRoute.waypointCities.map((c) => c.toLowerCase()));
  const intersection = [...truckCities].filter((c) => loadCities.has(c));
  const union = new Set([...truckCities, ...loadCities]);
  const overlapRatio = union.size === 0 ? 0 : intersection.length / union.size;

  let score: number;
  if (isExactReverse) {
    score = clamp(96 + overlapRatio * 4);
    reasons.push('Same return corridor (exact reverse route)');
  } else if (isSameDirectionContinuation && overlapRatio >= 0.5) {
    score = clamp(78 + overlapRatio * 20);
    reasons.push('Load continues along your planned route');
  } else if (isSameDirectionContinuation) {
    score = clamp(55 + overlapRatio * 20);
    reasons.push('Load starts where your truck ends, new direction beyond that');
  } else if (overlapRatio > 0) {
    score = clamp(25 + overlapRatio * 45);
    reasons.push('Partial overlap with your route corridor');
  } else {
    score = 5;
  }

  // Detour: extra distance the truck must travel to reach the pickup point
  // relative to where it will already be (its destination city / current
  // location). A same-direction continuation with a nearby pickup point has
  // a small detour; a pickup far from the truck's position is penalised.
  const detourKm = round1(pickupDistanceKm);

  if (pickupDistanceKm <= 10) {
    reasons.push(`Pickup is ${pickupDistanceKm} km away`);
  }

  return {
    score,
    detourKm,
    pickupDistanceKm,
    isExactReverse,
    isSameDirectionContinuation,
    reasons,
  };
}

function computeCapacityScore(
  truck: MatchableTruck,
  load: MatchableLoad
): { score: number; ok: boolean; reason: string } {
  if (load.weightTons > truck.capacityTons) {
    return {
      score: 0,
      ok: false,
      reason: `Load weight (${load.weightTons}T) exceeds truck capacity (${truck.capacityTons}T)`,
    };
  }
  const utilization = truck.capacityTons > 0 ? load.weightTons / truck.capacityTons : 0;
  const score = clamp(70 + utilization * 30);
  return {
    score,
    ok: true,
    reason: `Truck has sufficient capacity (${load.weightTons}T of ${truck.capacityTons}T)`,
  };
}

function computeVehicleScore(
  truck: MatchableTruck,
  load: MatchableLoad
): { score: number; ok: boolean; reason: string } {
  if (truck.vehicleType === load.vehicleTypeRequired) {
    return { score: 100, ok: true, reason: 'Vehicle type matches exactly' };
  }

  const specialTypes = new Set(['refrigerated', 'tanker']);
  if (specialTypes.has(load.vehicleTypeRequired)) {
    return {
      score: 0,
      ok: false,
      reason: `Load requires a specialised ${load.vehicleTypeRequired.replace('_', ' ')} vehicle`,
    };
  }

  const truckIdx = VEHICLE_TYPE_ORDER.indexOf(truck.vehicleType);
  const reqIdx = VEHICLE_TYPE_ORDER.indexOf(load.vehicleTypeRequired);

  if (truckIdx === -1 || reqIdx === -1) {
    return { score: 40, ok: true, reason: 'Vehicle type compatibility unknown' };
  }

  if (truckIdx < reqIdx) {
    // Truck's category is smaller than required — usually caught by capacity
    // too, but flag explicitly.
    return {
      score: 20,
      ok: false,
      reason: 'Truck category is smaller than the required vehicle type',
    };
  }

  const diff = truckIdx - reqIdx;
  const score = clamp(100 - diff * 8, 50, 100);
  return { score, ok: true, reason: 'Vehicle type is compatible' };
}

function computeTimeScore(
  truck: MatchableTruck,
  load: MatchableLoad
): { score: number; ok: boolean; reason: string } {
  const windowMs = load.pickupWindowHours * 60 * 60 * 1000;
  const earliestAcceptable = load.pickupDatetime.getTime() - windowMs;
  const latestAcceptable = load.pickupDatetime.getTime() + windowMs;

  const availableFromMs = truck.availableFrom.getTime();
  const availableToMs = truck.availableTo ? truck.availableTo.getTime() : Infinity;

  const truckWindowOverlapsLoadWindow =
    availableFromMs <= latestAcceptable && availableToMs >= earliestAcceptable;

  if (!truckWindowOverlapsLoadWindow) {
    return {
      score: 10,
      ok: false,
      reason: 'Pickup time is outside the truck availability window',
    };
  }

  const hoursDiff =
    Math.abs(load.pickupDatetime.getTime() - availableFromMs) / (60 * 60 * 1000);
  const score = clamp(100 - hoursDiff * 1.5, 40, 100);
  return { score, ok: true, reason: 'Pickup time fits truck availability' };
}

function computePriceScore(
  truck: MatchableTruck,
  load: MatchableLoad
): { score: number; ok: boolean; reason: string } {
  if (!truck.minPrice || truck.minPrice <= 0) {
    return { score: 75, ok: true, reason: 'No minimum price set — neutral score' };
  }
  const ratio = load.offeredPrice / truck.minPrice;
  if (ratio >= 1) {
    const score = clamp(90 + Math.min(ratio - 1, 0.2) * 50);
    return { score, ok: true, reason: 'Offered price meets or exceeds your minimum' };
  }
  // Below minimum: penalize proportionally to the shortfall.
  const shortfall = 1 - ratio;
  const score = clamp(90 - shortfall * 150);
  return {
    score,
    ok: score >= 40,
    reason:
      score >= 40
        ? 'Offered price is close to your minimum'
        : 'Offered price is well below your minimum',
  };
}

function computeReliabilityScore(truck: MatchableTruck): { score: number; reason: string } {
  if (truck.reliabilityRating === null || truck.completedTrips === 0) {
    return { score: 65, reason: 'No trip history yet — neutral reliability score' };
  }
  const score = clamp((truck.reliabilityRating / 5) * 100);
  return { score, reason: `Strong track record (${truck.completedTrips} completed trips)` };
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export interface MatchingEngine {
  scoreLoadForTruck(
    load: MatchableLoad,
    truck: MatchableTruck,
    weights?: MatchWeights
  ): Promise<MatchResult>;
  rankLoadsForTruck(
    truck: MatchableTruck,
    loads: MatchableLoad[],
    limit?: number,
    weights?: MatchWeights
  ): Promise<MatchResult[]>;
  rankTrucksForLoad(
    load: MatchableLoad,
    trucks: MatchableTruck[],
    limit?: number,
    weights?: MatchWeights
  ): Promise<MatchResult[]>;
}

export class RuleBasedMatchingEngine implements MatchingEngine {
  constructor(private readonly mapProvider: MapProvider = getMapProvider()) {}

  async scoreLoadForTruck(
    load: MatchableLoad,
    truck: MatchableTruck,
    weights: MatchWeights = DEFAULT_WEIGHTS
  ): Promise<MatchResult> {
    const reasons: string[] = [];
    const disqualifiers: string[] = [];

    if (truck.status !== 'available') {
      disqualifiers.push('Truck is not currently available');
    }
    if (load.status !== 'posted' && load.status !== 'matched') {
      disqualifiers.push('Load is no longer open for matching');
    }

    const route = await computeRouteAndDetour(truck, load, this.mapProvider);
    const capacity = computeCapacityScore(truck, load);
    const vehicle = computeVehicleScore(truck, load);
    const time = computeTimeScore(truck, load);
    const price = computePriceScore(truck, load);
    const reliability = computeReliabilityScore(truck);

    // Detour score: derived from the pickup distance. Close pickups are
    // "on the way"; far pickups mean a costly, unprofitable detour.
    const detourScore = clamp(100 - route.detourKm * 2);

    if (!capacity.ok) disqualifiers.push(capacity.reason);
    if (!vehicle.ok) disqualifiers.push(vehicle.reason);
    if (!time.ok) disqualifiers.push(time.reason);
    if (route.score < 15) disqualifiers.push('Route direction does not align with this load');

    reasons.push(...route.reasons);
    if (capacity.ok) reasons.push(capacity.reason);
    if (vehicle.ok && vehicle.score === 100) reasons.push(vehicle.reason);
    if (time.ok) reasons.push(time.reason);
    if (detourScore >= 80) reasons.push(`Only ${route.detourKm} km estimated detour`);
    if (price.ok && price.score >= 85) reasons.push(price.reason);
    if (reliability.score >= 80) reasons.push(reliability.reason);

    const scores: MatchScoreBreakdown = {
      routeScore: round1(route.score),
      capacityScore: round1(capacity.score),
      timeScore: round1(time.score),
      vehicleScore: round1(vehicle.score),
      detourScore: round1(detourScore),
      priceScore: round1(price.score),
      reliabilityScore: round1(reliability.score),
      overallScore: 0,
    };

    const overall =
      scores.routeScore * weights.route +
      scores.capacityScore * weights.capacity +
      scores.timeScore * weights.time +
      scores.vehicleScore * weights.vehicle +
      scores.detourScore * weights.detour +
      scores.priceScore * weights.price +
      scores.reliabilityScore * weights.reliability;

    const disqualified = disqualifiers.length > 0;
    scores.overallScore = disqualified ? Math.min(round1(overall), 25) : round1(overall);

    if (!disqualified && scores.overallScore < MIN_VIABLE_SCORE) {
      disqualifiers.push('Overall compatibility is too low for a viable match');
    }

    return {
      loadId: load.id,
      truckId: truck.id,
      scores,
      reasons: disqualified ? [] : reasons,
      disqualified: disqualified || scores.overallScore < MIN_VIABLE_SCORE,
      disqualificationReason: disqualifiers[0],
      detourKm: route.detourKm,
      pickupDistanceKm: route.pickupDistanceKm,
    };
  }

  async rankLoadsForTruck(
    truck: MatchableTruck,
    loads: MatchableLoad[],
    limit = 5,
    weights: MatchWeights = DEFAULT_WEIGHTS
  ): Promise<MatchResult[]> {
    const results = await Promise.all(
      loads.map((load) => this.scoreLoadForTruck(load, truck, weights))
    );
    return results
      .filter((r) => !r.disqualified)
      .sort((a, b) => b.scores.overallScore - a.scores.overallScore)
      .slice(0, limit);
  }

  async rankTrucksForLoad(
    load: MatchableLoad,
    trucks: MatchableTruck[],
    limit = 5,
    weights: MatchWeights = DEFAULT_WEIGHTS
  ): Promise<MatchResult[]> {
    const results = await Promise.all(
      trucks.map((truck) => this.scoreLoadForTruck(load, truck, weights))
    );
    return results
      .filter((r) => !r.disqualified)
      .sort((a, b) => b.scores.overallScore - a.scores.overallScore)
      .slice(0, limit);
  }
}

/**
 * Extension point for a future AI/ML-based engine. It must implement the
 * same `MatchingEngine` interface so callers (API routes, dashboards) never
 * need to change when a smarter engine is introduced. Not implemented in
 * the MVP — see README "Future AI Architecture".
 */
export type { MatchingEngine as MatchingEngineInterface };

export function getMatchingEngine(): MatchingEngine {
  return new RuleBasedMatchingEngine();
}
