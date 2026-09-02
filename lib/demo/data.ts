/**
 * Static demo dataset used as a graceful fallback whenever Supabase is not
 * yet configured (e.g. right after `git clone`, before `.env.local` is set
 * up) so the UI remains fully explorable. Mirrors `supabase/seed.sql`.
 *
 * Real deployments backed by Supabase should never hit this file — see
 * `lib/data/*.ts` for the Supabase-backed data access layer, which falls
 * back to this module only on connection failure.
 */

import type { MatchableLoad, MatchableTruck } from '@/lib/matching/types';
import { getCity } from '@/lib/maps/cities';

function loc(city: string) {
  return getCity(city)!.coordinates;
}

export const DEMO_TRUCKS: MatchableTruck[] = [
  {
    id: 'demo-truck-1',
    ownerId: 'demo-owner-1',
    vehicleType: 'truck_17ft',
    capacityTons: 9,
    originCity: 'Delhi',
    destinationCity: 'Kanpur',
    currentLocation: loc('Delhi'),
    routeWaypoints: ['Delhi', 'Noida', 'Kanpur'],
    availableFrom: new Date(Date.now() - 2 * 60 * 60 * 1000),
    availableTo: new Date(Date.now() + 24 * 60 * 60 * 1000),
    minPrice: 15000,
    status: 'available',
    reliabilityRating: 4.6,
    completedTrips: 32,
  },
  {
    id: 'demo-truck-2',
    ownerId: 'demo-owner-2',
    vehicleType: 'truck_17ft',
    capacityTons: 8.5,
    originCity: 'Kanpur',
    destinationCity: 'Delhi',
    currentLocation: loc('Kanpur'),
    routeWaypoints: ['Kanpur', 'Noida', 'Delhi'],
    availableFrom: new Date(Date.now() - 1 * 60 * 60 * 1000),
    availableTo: new Date(Date.now() + 30 * 60 * 60 * 1000),
    minPrice: 18000,
    status: 'available',
    reliabilityRating: 4.8,
    completedTrips: 51,
  },
  {
    id: 'demo-truck-3',
    ownerId: 'demo-owner-3',
    vehicleType: 'lcv',
    capacityTons: 6,
    originCity: 'Kanpur',
    destinationCity: 'Lucknow',
    currentLocation: loc('Kanpur'),
    routeWaypoints: ['Kanpur', 'Lucknow'],
    availableFrom: new Date(),
    availableTo: new Date(Date.now() + 20 * 60 * 60 * 1000),
    minPrice: 8000,
    status: 'available',
    reliabilityRating: 4.2,
    completedTrips: 14,
  },
  {
    id: 'demo-truck-4',
    ownerId: 'demo-owner-4',
    vehicleType: 'trailer',
    capacityTons: 30,
    originCity: 'Delhi',
    destinationCity: 'Kanpur',
    currentLocation: loc('Delhi'),
    routeWaypoints: ['Delhi', 'Noida', 'Kanpur'],
    availableFrom: new Date(),
    availableTo: new Date(Date.now() + 48 * 60 * 60 * 1000),
    minPrice: 35000,
    status: 'available',
    reliabilityRating: 4.9,
    completedTrips: 67,
  },
];

export const DEMO_LOADS: MatchableLoad[] = [
  {
    id: 'demo-load-1',
    shipperId: 'demo-shipper-1',
    pickupCity: 'Kanpur',
    pickupLocation: loc('Kanpur'),
    destinationCity: 'Delhi',
    destinationLocation: loc('Delhi'),
    weightTons: 8.5,
    vehicleTypeRequired: 'truck_17ft',
    pickupDatetime: new Date(Date.now() + 6 * 60 * 60 * 1000),
    pickupWindowHours: 6,
    offeredPrice: 18500,
    status: 'posted',
  },
  {
    id: 'demo-load-2',
    shipperId: 'demo-shipper-2',
    pickupCity: 'Kanpur',
    pickupLocation: loc('Kanpur'),
    destinationCity: 'Lucknow',
    destinationLocation: loc('Lucknow'),
    weightTons: 6,
    vehicleTypeRequired: 'lcv',
    pickupDatetime: new Date(Date.now() + 10 * 60 * 60 * 1000),
    pickupWindowHours: 6,
    offeredPrice: 9500,
    status: 'posted',
  },
  {
    id: 'demo-load-3',
    shipperId: 'demo-shipper-3',
    pickupCity: 'Delhi',
    pickupLocation: loc('Delhi'),
    destinationCity: 'Agra',
    destinationLocation: loc('Agra'),
    weightTons: 3,
    vehicleTypeRequired: 'pickup',
    pickupDatetime: new Date(Date.now() + 3 * 60 * 60 * 1000),
    pickupWindowHours: 4,
    offeredPrice: 5500,
    status: 'posted',
  },
  {
    id: 'demo-load-4',
    shipperId: 'demo-shipper-4',
    pickupCity: 'Mumbai',
    pickupLocation: loc('Mumbai'),
    destinationCity: 'Pune',
    destinationLocation: loc('Pune'),
    weightTons: 7,
    vehicleTypeRequired: 'truck_17ft',
    pickupDatetime: new Date(Date.now() + 10 * 60 * 60 * 1000),
    pickupWindowHours: 6,
    offeredPrice: 12000,
    status: 'posted',
  },
];

export const DEMO_STATS = {
  totalTrucks: 11,
  totalLoads: 20,
  activeTrips: 3,
  successfulMatches: 42,
  avgMatchTimeSeconds: 8,
  emptyTripsAvoided: 27,
  gmv: 612000,
  platformRevenue: 30600,
};
