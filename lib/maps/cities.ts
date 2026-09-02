/**
 * Demo geography dataset for the BackHaul MVP.
 *
 * The platform architecture is geography-agnostic (see MapProvider), but for
 * the MVP we ship a curated set of Indian cities/corridors so the app is
 * useful and demo-able without live map API keys.
 */

import type { GeoPoint } from '@/types/database';

export interface CityInfo {
  name: string;
  state: string;
  coordinates: GeoPoint;
}

// Approximate real-world coordinates for demo cities.
export const CITIES: Record<string, CityInfo> = {
  Delhi: { name: 'Delhi', state: 'Delhi', coordinates: { lat: 28.6139, lng: 77.209 } },
  Kanpur: { name: 'Kanpur', state: 'Uttar Pradesh', coordinates: { lat: 26.4499, lng: 80.3319 } },
  Lucknow: { name: 'Lucknow', state: 'Uttar Pradesh', coordinates: { lat: 26.8467, lng: 80.9462 } },
  Agra: { name: 'Agra', state: 'Uttar Pradesh', coordinates: { lat: 27.1767, lng: 78.0081 } },
  Mumbai: { name: 'Mumbai', state: 'Maharashtra', coordinates: { lat: 19.076, lng: 72.8777 } },
  Pune: { name: 'Pune', state: 'Maharashtra', coordinates: { lat: 18.5204, lng: 73.8567 } },
  Jaipur: { name: 'Jaipur', state: 'Rajasthan', coordinates: { lat: 26.9124, lng: 75.7873 } },
  Gwalior: { name: 'Gwalior', state: 'Madhya Pradesh', coordinates: { lat: 26.2183, lng: 78.1828 } },
  Kanpur_Bypass: { name: 'Kanpur', state: 'Uttar Pradesh', coordinates: { lat: 26.4499, lng: 80.3319 } },
  Noida: { name: 'Noida', state: 'Uttar Pradesh', coordinates: { lat: 28.5355, lng: 77.391 } },
  Gurugram: { name: 'Gurugram', state: 'Haryana', coordinates: { lat: 28.4595, lng: 77.0266 } },
  Varanasi: { name: 'Varanasi', state: 'Uttar Pradesh', coordinates: { lat: 25.3176, lng: 82.9739 } },
};

// Known corridors between demo cities with an approximate road distance (km)
// and a rough ordered list of intermediate waypoint cities used for route
// overlap calculations. Distances are illustrative, not survey-grade.
export interface Corridor {
  from: string;
  to: string;
  distanceKm: number;
  // Cities along the corridor in travel order (inclusive of endpoints).
  path: string[];
}

export const CORRIDORS: Corridor[] = [
  { from: 'Delhi', to: 'Kanpur', distanceKm: 470, path: ['Delhi', 'Noida', 'Kanpur'] },
  { from: 'Delhi', to: 'Lucknow', distanceKm: 555, path: ['Delhi', 'Noida', 'Kanpur', 'Lucknow'] },
  { from: 'Kanpur', to: 'Lucknow', distanceKm: 85, path: ['Kanpur', 'Lucknow'] },
  { from: 'Delhi', to: 'Agra', distanceKm: 233, path: ['Delhi', 'Gurugram', 'Agra'] },
  { from: 'Kanpur', to: 'Delhi', distanceKm: 470, path: ['Kanpur', 'Noida', 'Delhi'] },
  { from: 'Agra', to: 'Kanpur', distanceKm: 285, path: ['Agra', 'Gwalior', 'Kanpur'] },
  { from: 'Lucknow', to: 'Varanasi', distanceKm: 320, path: ['Lucknow', 'Varanasi'] },
  { from: 'Mumbai', to: 'Pune', distanceKm: 150, path: ['Mumbai', 'Pune'] },
  { from: 'Delhi', to: 'Jaipur', distanceKm: 280, path: ['Delhi', 'Gurugram', 'Jaipur'] },
  { from: 'Jaipur', to: 'Agra', distanceKm: 240, path: ['Jaipur', 'Agra'] },
];

export function getCity(name: string): CityInfo | undefined {
  return CITIES[name];
}

export function findCorridor(from: string, to: string): Corridor | undefined {
  return CORRIDORS.find(
    (c) => (c.from === from && c.to === to) || (c.from === to && c.to === from)
  );
}

/** Haversine distance in km between two lat/lng points. */
export function haversineDistanceKm(a: GeoPoint, b: GeoPoint): number {
  const R = 6371; // Earth radius km
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;

  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);

  const h = sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLng * sinDLng;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
  return R * c;
}
