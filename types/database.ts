/**
 * Core domain enums and row types mirroring the Supabase Postgres schema.
 * Keep this file in sync with `supabase/migrations/*.sql`.
 */

export type UserRole = 'truck_owner' | 'shipper' | 'admin';

export type VerificationStatus = 'pending' | 'verified' | 'rejected';

export type AccountStatus = 'active' | 'suspended' | 'banned';

export type VehicleType =
  | 'mini_truck' // <1.5T (Tata Ace, etc.)
  | 'pickup' // 1.5-3T
  | 'lcv' // Light commercial vehicle, 3-7T
  | 'truck_10ft'
  | 'truck_14ft'
  | 'truck_17ft'
  | 'truck_19ft'
  | 'truck_20ft'
  | 'truck_22ft'
  | 'truck_24ft'
  | 'container_20ft'
  | 'container_32ft'
  | 'trailer'
  | 'tanker'
  | 'refrigerated';

export type TruckStatus = 'available' | 'busy' | 'in_transit' | 'maintenance' | 'inactive';

export type LoadStatus =
  | 'posted'
  | 'matched'
  | 'requested'
  | 'accepted'
  | 'confirmed'
  | 'pickup'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'expired';

export type BookingStatus =
  | 'requested'
  | 'accepted'
  | 'rejected'
  | 'confirmed'
  | 'pickup'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'disputed';

export type TripStatus =
  | 'scheduled'
  | 'pickup_pending'
  | 'picked_up'
  | 'in_transit'
  | 'delivered'
  | 'completed'
  | 'cancelled';

export type PaymentStatus = 'pending' | 'authorized' | 'captured' | 'failed' | 'refunded';

export type LoadType =
  | 'general'
  | 'perishable'
  | 'fragile'
  | 'liquid'
  | 'construction_material'
  | 'agriculture'
  | 'electronics'
  | 'textile'
  | 'machinery'
  | 'other';

export type NotificationType =
  | 'NEW_MATCH'
  | 'BOOKING_REQUEST'
  | 'BOOKING_ACCEPTED'
  | 'BOOKING_REJECTED'
  | 'TRIP_STARTED'
  | 'TRIP_DELAYED'
  | 'TRIP_COMPLETED'
  | 'PAYMENT_RECEIVED';

export type DisputeStatus = 'open' | 'investigating' | 'resolved' | 'rejected';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface Address {
  label: string;
  city: string;
  state: string;
  country: string;
  pincode?: string | null;
  coordinates: GeoPoint;
}

export interface Profile {
  id: string; // uuid, references auth.users.id
  role: UserRole;
  full_name: string;
  phone: string | null;
  email: string;
  company_name: string | null;
  avatar_url: string | null;
  verification_status: VerificationStatus;
  account_status: AccountStatus;
  rating_avg: number;
  rating_count: number;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface Truck {
  id: string;
  owner_id: string;
  vehicle_number: string;
  vehicle_type: VehicleType;
  capacity_tons: number;
  length_ft: number | null;
  width_ft: number | null;
  height_ft: number | null;
  current_location: Address;
  origin_city: string;
  destination_city: string;
  route_waypoints: string[]; // list of city names along the intended route
  available_from: string; // ISO timestamp
  available_to: string | null;
  min_price: number | null;
  status: TruckStatus;
  verification_status: VerificationStatus;
  driver_name: string | null;
  driver_phone: string | null;
  created_at: string;
  updated_at: string;
}

export interface TruckDocument {
  id: string;
  truck_id: string;
  doc_type: 'rc' | 'insurance' | 'permit' | 'puc' | 'fitness' | 'other';
  file_url: string;
  verification_status: VerificationStatus;
  uploaded_at: string;
}

export interface TruckLocation {
  id: string;
  truck_id: string;
  coordinates: GeoPoint;
  recorded_at: string;
}

export interface Load {
  id: string;
  shipper_id: string;
  pickup_city: string;
  pickup_address: Address;
  destination_city: string;
  destination_address: Address;
  weight_tons: number;
  length_ft: number | null;
  width_ft: number | null;
  height_ft: number | null;
  load_type: LoadType;
  vehicle_type_required: VehicleType;
  pickup_datetime: string; // ISO
  pickup_window_hours: number; // flexibility window
  offered_price: number;
  special_instructions: string | null;
  status: LoadStatus;
  created_at: string;
  updated_at: string;
}

export interface LoadItem {
  id: string;
  load_id: string;
  name: string;
  quantity: number;
  unit: string;
  weight_tons: number | null;
}

export interface Booking {
  id: string;
  load_id: string;
  truck_id: string;
  shipper_id: string;
  truck_owner_id: string;
  status: BookingStatus;
  match_score: number | null;
  agreed_price: number | null;
  requested_at: string;
  responded_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  booking_id: string;
  status: TripStatus;
  pickup_actual_at: string | null;
  delivery_actual_at: string | null;
  eta: string | null;
  distance_km: number | null;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string; // 'mock' for MVP
  provider_reference: string | null;
  is_demo: boolean;
  created_at: string;
  updated_at: string;
}

export interface Rating {
  id: string;
  booking_id: string;
  rater_id: string;
  ratee_id: string;
  stars: number; // 1-5
  comment: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string;
  metadata: Record<string, unknown>;
  read_at: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  reason: string;
  status: DisputeStatus;
  resolution_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface MatchingResult {
  id: string;
  load_id: string;
  truck_id: string;
  overall_score: number;
  route_score: number;
  capacity_score: number;
  time_score: number;
  vehicle_score: number;
  detour_score: number;
  price_score: number;
  reliability_score: number;
  reasons: string[];
  computed_at: string;
}
