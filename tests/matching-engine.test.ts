import { describe, expect, it } from 'vitest';
import { RuleBasedMatchingEngine } from '@/lib/matching/engine';
import { MockMapProvider } from '@/lib/maps/mock-provider';
import { getCity } from '@/lib/maps/cities';
import type { MatchableLoad, MatchableTruck } from '@/lib/matching/types';

const mapProvider = new MockMapProvider();
const engine = new RuleBasedMatchingEngine(mapProvider);

function makeTruck(overrides: Partial<MatchableTruck> = {}): MatchableTruck {
  const origin = overrides.originCity ?? 'Delhi';
  return {
    id: 'truck-1',
    ownerId: 'owner-1',
    vehicleType: 'truck_17ft',
    capacityTons: 9,
    originCity: origin,
    destinationCity: 'Kanpur',
    currentLocation: getCity(origin)!.coordinates,
    routeWaypoints: [],
    availableFrom: new Date('2026-09-02T10:00:00Z'),
    availableTo: new Date('2026-09-03T10:00:00Z'),
    minPrice: 15000,
    status: 'available',
    reliabilityRating: 4.5,
    completedTrips: 20,
    ...overrides,
  };
}

function makeLoad(overrides: Partial<MatchableLoad> = {}): MatchableLoad {
  const pickupCity = overrides.pickupCity ?? 'Kanpur';
  const destCity = overrides.destinationCity ?? 'Delhi';
  return {
    id: 'load-1',
    shipperId: 'shipper-1',
    pickupCity,
    pickupLocation: getCity(pickupCity)!.coordinates,
    destinationCity: destCity,
    destinationLocation: getCity(destCity)!.coordinates,
    weightTons: 8.5,
    vehicleTypeRequired: 'truck_17ft',
    pickupDatetime: new Date('2026-09-02T12:00:00Z'),
    pickupWindowHours: 6,
    offeredPrice: 18500,
    status: 'posted',
    ...overrides,
  };
}

describe('RuleBasedMatchingEngine', () => {
  it('scores an exact return route (Delhi->Kanpur truck, Kanpur->Delhi load) very high', async () => {
    const truck = makeTruck({ originCity: 'Delhi', destinationCity: 'Kanpur' });
    const load = makeLoad({ pickupCity: 'Kanpur', destinationCity: 'Delhi' });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.disqualified).toBe(false);
    expect(result.scores.routeScore).toBeGreaterThanOrEqual(90);
    expect(result.scores.overallScore).toBeGreaterThanOrEqual(85);
    expect(result.reasons.some((r) => r.toLowerCase().includes('return corridor'))).toBe(true);
  });

  it('supports a reasonable partial route match (Delhi->Kanpur truck, Kanpur->Lucknow load)', async () => {
    const truck = makeTruck({ originCity: 'Delhi', destinationCity: 'Kanpur' });
    const load = makeLoad({ pickupCity: 'Kanpur', destinationCity: 'Lucknow' });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.disqualified).toBe(false);
    // Continuation match, not as high as an exact reverse, but still viable.
    expect(result.scores.routeScore).toBeGreaterThanOrEqual(55);
    expect(result.scores.overallScore).toBeGreaterThanOrEqual(30);
  });

  it('rejects a load going in a completely unrelated direction (Mumbai->Pune vs Delhi->Kanpur)', async () => {
    const truck = makeTruck({ originCity: 'Delhi', destinationCity: 'Kanpur' });
    const load = makeLoad({ pickupCity: 'Mumbai', destinationCity: 'Pune' });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.disqualified).toBe(true);
    expect(result.scores.overallScore).toBeLessThan(30);
  });

  it('disqualifies when load weight exceeds truck capacity', async () => {
    const truck = makeTruck({ capacityTons: 5 });
    const load = makeLoad({ weightTons: 8.5 });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.disqualified).toBe(true);
    expect(result.scores.capacityScore).toBe(0);
    expect(result.disqualificationReason).toMatch(/exceeds truck capacity/i);
  });

  it('disqualifies when vehicle type is incompatible (load requires refrigerated)', async () => {
    const truck = makeTruck({ vehicleType: 'truck_17ft' });
    const load = makeLoad({ vehicleTypeRequired: 'refrigerated' });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.disqualified).toBe(true);
    expect(result.scores.vehicleScore).toBe(0);
  });

  it('disqualifies when the truck is not available', async () => {
    const truck = makeTruck({ status: 'busy' });
    const load = makeLoad();

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.disqualified).toBe(true);
    expect(result.disqualificationReason).toMatch(/not currently available/i);
  });

  it('penalizes pickup time outside the truck availability window', async () => {
    const truck = makeTruck({
      availableFrom: new Date('2026-09-05T00:00:00Z'),
      availableTo: new Date('2026-09-06T00:00:00Z'),
    });
    const load = makeLoad({
      pickupDatetime: new Date('2026-09-02T12:00:00Z'),
      pickupWindowHours: 2,
    });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.scores.timeScore).toBeLessThan(40);
    expect(result.disqualified).toBe(true);
  });

  it('reflects high detour distance with a lower detour score', async () => {
    const truck = makeTruck({ originCity: 'Delhi', destinationCity: 'Kanpur' });
    // Pickup far from the truck's current position (Agra, not on the Delhi-Kanpur corridor)
    const load = makeLoad({ pickupCity: 'Agra', destinationCity: 'Kanpur' });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.detourKm).toBeGreaterThan(50);
    expect(result.scores.detourScore).toBeLessThan(80);
  });

  it('penalizes price well below the truck minimum', async () => {
    const truck = makeTruck({ minPrice: 20000 });
    const load = makeLoad({ offeredPrice: 8000 });

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.scores.priceScore).toBeLessThan(50);
  });

  it('rewards strong historical reliability', async () => {
    const truck = makeTruck({ reliabilityRating: 4.9, completedTrips: 50 });
    const load = makeLoad();

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.scores.reliabilityScore).toBeGreaterThanOrEqual(90);
  });

  it('gives a neutral reliability score for a truck with no history', async () => {
    const truck = makeTruck({ reliabilityRating: null, completedTrips: 0 });
    const load = makeLoad();

    const result = await engine.scoreLoadForTruck(load, truck);

    expect(result.scores.reliabilityScore).toBe(65);
  });

  it('ranks and limits loads for a truck to the top N', async () => {
    const truck = makeTruck({ originCity: 'Delhi', destinationCity: 'Kanpur' });
    const loads = [
      makeLoad({ id: 'l1', pickupCity: 'Kanpur', destinationCity: 'Delhi' }), // best
      makeLoad({ id: 'l2', pickupCity: 'Kanpur', destinationCity: 'Lucknow' }), // good
      makeLoad({ id: 'l3', pickupCity: 'Mumbai', destinationCity: 'Pune' }), // rejected
      makeLoad({ id: 'l4', pickupCity: 'Kanpur', destinationCity: 'Delhi', weightTons: 50 }), // disqualified: capacity
    ];

    const ranked = await engine.rankLoadsForTruck(truck, loads, 5);

    expect(ranked.length).toBeGreaterThan(0);
    expect(ranked[0]!.loadId).toBe('l1');
    expect(ranked.some((r) => r.loadId === 'l3')).toBe(false);
    expect(ranked.some((r) => r.loadId === 'l4')).toBe(false);
  });

  it('ranks trucks for a load and respects the limit parameter', async () => {
    const load = makeLoad({ pickupCity: 'Kanpur', destinationCity: 'Delhi' });
    const trucks = Array.from({ length: 8 }, (_, i) =>
      makeTruck({ id: `t${i}`, originCity: 'Delhi', destinationCity: 'Kanpur' })
    );

    const ranked = await engine.rankTrucksForLoad(load, trucks, 5);

    expect(ranked.length).toBeLessThanOrEqual(5);
  });

  it('produces an overall score using the documented weighted formula', async () => {
    const truck = makeTruck();
    const load = makeLoad();
    const result = await engine.scoreLoadForTruck(load, truck);
    const s = result.scores;

    const expected =
      s.routeScore * 0.3 +
      s.capacityScore * 0.2 +
      s.timeScore * 0.15 +
      s.vehicleScore * 0.1 +
      s.detourScore * 0.1 +
      s.priceScore * 0.1 +
      s.reliabilityScore * 0.05;

    expect(Math.round(expected * 10) / 10).toBeCloseTo(s.overallScore, 0);
  });
});
