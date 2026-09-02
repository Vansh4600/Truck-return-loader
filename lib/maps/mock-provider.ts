/**
 * Mock / development MapProvider implementation.
 *
 * Uses the curated CITIES/CORRIDORS dataset so the app works fully offline
 * and without any paid API keys. Swap this out for a real provider (Google
 * Maps, Mapbox, OpenRouteService, ...) by implementing `MapProvider` and
 * updating `lib/maps/index.ts`.
 */

import type { GeoPoint } from '@/types/database';
import { CITIES, CORRIDORS, findCorridor, getCity, haversineDistanceKm } from './cities';
import type { GeocodeResult, MapProvider, RouteResult } from './provider';

const AVERAGE_SPEED_KMH = 45; // conservative average for Indian highway/mixed truck routes

function resolvePoint(input: GeoPoint | string): { point: GeoPoint; city?: string } {
  if (typeof input === 'string') {
    const city = getCity(input);
    if (city) return { point: city.coordinates, city: city.name };
    // Fall back to Delhi if an unknown city name is passed, to keep the mock resilient.
    return { point: CITIES.Delhi!.coordinates, city: 'Delhi' };
  }
  return { point: input };
}

export class MockMapProvider implements MapProvider {
  async geocode(address: string): Promise<GeocodeResult | null> {
    const normalized = address.trim();
    const match = Object.values(CITIES).find(
      (c) => c.name.toLowerCase() === normalized.toLowerCase()
    );
    if (!match) {
      // naive partial match
      const partial = Object.values(CITIES).find((c) =>
        normalized.toLowerCase().includes(c.name.toLowerCase())
      );
      if (!partial) return null;
      return {
        address: normalized,
        coordinates: partial.coordinates,
        city: partial.name,
        state: partial.state,
        country: 'India',
      };
    }
    return {
      address: normalized,
      coordinates: match.coordinates,
      city: match.name,
      state: match.state,
      country: 'India',
    };
  }

  async reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null> {
    let closest: { city: (typeof CITIES)[string]; dist: number } | null = null;
    for (const city of Object.values(CITIES)) {
      const dist = haversineDistanceKm(point, city.coordinates);
      if (!closest || dist < closest.dist) closest = { city, dist };
    }
    if (!closest) return null;
    return {
      address: closest.city.name,
      coordinates: closest.city.coordinates,
      city: closest.city.name,
      state: closest.city.state,
      country: 'India',
    };
  }

  async calculateDistance(a: GeoPoint, b: GeoPoint): Promise<number> {
    return haversineDistanceKm(a, b);
  }

  async calculateRoute(
    origin: GeoPoint | string,
    destination: GeoPoint | string
  ): Promise<RouteResult> {
    const originResolved = resolvePoint(origin);
    const destResolved = resolvePoint(destination);

    // Prefer a known corridor for realistic distance/waypoints.
    if (originResolved.city && destResolved.city) {
      const corridor = findCorridor(originResolved.city, destResolved.city);
      if (corridor) {
        const path =
          corridor.from === originResolved.city ? corridor.path : [...corridor.path].reverse();
        const polyline = path
          .map((cityName) => getCity(cityName)?.coordinates)
          .filter((p): p is GeoPoint => Boolean(p));
        return {
          distanceKm: corridor.distanceKm,
          durationMinutes: Math.round((corridor.distanceKm / AVERAGE_SPEED_KMH) * 60),
          polyline,
          waypointCities: path,
        };
      }
    }

    // Fall back to straight-line distance with a road-distance multiplier.
    const straight = haversineDistanceKm(originResolved.point, destResolved.point);
    const roadDistance = Math.round(straight * 1.25);
    return {
      distanceKm: roadDistance,
      durationMinutes: Math.round((roadDistance / AVERAGE_SPEED_KMH) * 60),
      polyline: [originResolved.point, destResolved.point],
      waypointCities: [originResolved.city ?? 'Origin', destResolved.city ?? 'Destination'],
    };
  }

  async calculateETA(
    origin: GeoPoint | string,
    destination: GeoPoint | string,
    departAt: Date = new Date()
  ): Promise<Date> {
    const route = await this.calculateRoute(origin, destination);
    return new Date(departAt.getTime() + route.durationMinutes * 60_000);
  }
}

export const mockMapProvider = new MockMapProvider();

// Re-export dataset helpers for convenience in matching/UI code.
export { CITIES, CORRIDORS, findCorridor, getCity, haversineDistanceKm };
