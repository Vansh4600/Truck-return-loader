/**
 * MapProvider abstraction.
 *
 * The application must never call a specific maps vendor (Google Maps,
 * Mapbox, OpenRouteService, etc.) directly from business logic. Instead,
 * everything routes through this interface so a real provider can be
 * dropped in later without touching the matching engine, dashboards, or
 * booking flow.
 */

import type { GeoPoint } from '@/types/database';

export interface GeocodeResult {
  address: string;
  coordinates: GeoPoint;
  city: string;
  state: string;
  country: string;
}

export interface RouteResult {
  distanceKm: number;
  durationMinutes: number;
  /** Ordered list of coordinates roughly describing the path (for map rendering). */
  polyline: GeoPoint[];
  /** City names the route is understood to pass through, in order. */
  waypointCities: string[];
}

export interface MapProvider {
  geocode(address: string): Promise<GeocodeResult | null>;
  reverseGeocode(point: GeoPoint): Promise<GeocodeResult | null>;
  calculateDistance(a: GeoPoint, b: GeoPoint): Promise<number>; // straight-line km
  calculateRoute(origin: GeoPoint | string, destination: GeoPoint | string): Promise<RouteResult>;
  calculateETA(origin: GeoPoint | string, destination: GeoPoint | string, departAt?: Date): Promise<Date>;
}
