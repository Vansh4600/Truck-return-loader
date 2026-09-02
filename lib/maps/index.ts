/**
 * Map provider factory.
 *
 * Selects the active MapProvider implementation. Today only the mock
 * provider is implemented (no external API keys required). To integrate a
 * real provider:
 *
 *   1. Implement `MapProvider` in a new file, e.g. `google-provider.ts`.
 *   2. Read the API key from `process.env.MAPS_API_KEY` (server-side only).
 *   3. Select it below based on `process.env.MAPS_PROVIDER`.
 *
 * No other part of the codebase should import a specific provider directly.
 */

import { mockMapProvider } from './mock-provider';
import type { MapProvider } from './provider';

export function getMapProvider(): MapProvider {
  // Future: switch on process.env.MAPS_PROVIDER ('google' | 'mapbox' | 'mock')
  return mockMapProvider;
}

export type { GeocodeResult, MapProvider, RouteResult } from './provider';
export { CITIES, CORRIDORS, getCity, findCorridor, haversineDistanceKm } from './cities';
