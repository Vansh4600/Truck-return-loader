/**
 * Domain-focused input/output types for the matching engine. These are
 * intentionally decoupled from the full DB row types so the engine can be
 * unit tested with plain objects and reused by a future FastAPI/AI service.
 */

import type { GeoPoint, VehicleType } from '@/types/database';

export interface MatchableTruck {
  id: string;
  ownerId: string;
  vehicleType: VehicleType;
  capacityTons: number;
  originCity: string;
  destinationCity: string;
  currentLocation: GeoPoint;
  /** Cities the truck is willing to pass through, in travel order. */
  routeWaypoints: string[];
  availableFrom: Date;
  availableTo: Date | null;
  minPrice: number | null;
  status: 'available' | 'busy' | 'in_transit' | 'maintenance' | 'inactive';
  /** 0-5 average rating from past shippers; null if no history yet. */
  reliabilityRating: number | null;
  completedTrips: number;
}

export interface MatchableLoad {
  id: string;
  shipperId: string;
  pickupCity: string;
  pickupLocation: GeoPoint;
  destinationCity: string;
  destinationLocation: GeoPoint;
  weightTons: number;
  vehicleTypeRequired: VehicleType;
  pickupDatetime: Date;
  pickupWindowHours: number;
  offeredPrice: number;
  status: string;
}

export interface MatchScoreBreakdown {
  routeScore: number;
  capacityScore: number;
  timeScore: number;
  vehicleScore: number;
  detourScore: number;
  priceScore: number;
  reliabilityScore: number;
  overallScore: number;
}

export interface MatchResult {
  loadId: string;
  truckId: string;
  scores: MatchScoreBreakdown;
  reasons: string[];
  disqualified: boolean;
  disqualificationReason?: string;
  detourKm: number;
  pickupDistanceKm: number;
}

export interface MatchWeights {
  route: number;
  capacity: number;
  time: number;
  vehicle: number;
  detour: number;
  price: number;
  reliability: number;
}

export const DEFAULT_WEIGHTS: MatchWeights = {
  route: 0.3,
  capacity: 0.2,
  time: 0.15,
  vehicle: 0.1,
  detour: 0.1,
  price: 0.1,
  reliability: 0.05,
};

/** Vehicle capacity tiers used for compatibility scoring (approx tons ceiling). */
export const VEHICLE_CAPACITY_TONS: Record<VehicleType, number> = {
  mini_truck: 1.5,
  pickup: 3,
  lcv: 7,
  truck_10ft: 3.5,
  truck_14ft: 6,
  truck_17ft: 9,
  truck_19ft: 10,
  truck_20ft: 12,
  truck_22ft: 16,
  truck_24ft: 18,
  container_20ft: 25,
  container_32ft: 30,
  trailer: 35,
  tanker: 20,
  refrigerated: 15,
};

/** Ordering used to judge "close enough" vehicle type substitutions. */
export const VEHICLE_TYPE_ORDER: VehicleType[] = [
  'mini_truck',
  'pickup',
  'lcv',
  'truck_10ft',
  'truck_14ft',
  'truck_17ft',
  'truck_19ft',
  'truck_20ft',
  'truck_22ft',
  'truck_24ft',
  'container_20ft',
  'tanker',
  'refrigerated',
  'container_32ft',
  'trailer',
];
