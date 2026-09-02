-- BackHaul initial schema
-- Return-load logistics marketplace core tables.
-- Uses UUID primary keys, created_at/updated_at timestamps, and constraints
-- wherever practical. PostGIS is used opportunistically when available;
-- falls back to plain lat/lng numeric columns otherwise.

-- Enable required extensions -------------------------------------------------
create extension if not exists "pgcrypto";      -- gen_random_uuid()

do $$
begin
  if not exists (select 1 from pg_extension where extname = 'postgis') then
    begin
      create extension postgis;
    exception when others then
      -- PostGIS not available on this Postgres instance (e.g. some local
      -- setups). The schema still works using plain lat/lng columns; add
      -- geography columns manually later if PostGIS becomes available.
      raise notice 'PostGIS extension not available, continuing without it';
    end;
  end if;
end $$;

-- Enums -----------------------------------------------------------------------
create type user_role as enum ('truck_owner', 'shipper', 'admin');
create type verification_status as enum ('pending', 'verified', 'rejected');
create type account_status as enum ('active', 'suspended', 'banned');

create type vehicle_type as enum (
  'mini_truck', 'pickup', 'lcv',
  'truck_10ft', 'truck_14ft', 'truck_17ft', 'truck_19ft', 'truck_20ft',
  'truck_22ft', 'truck_24ft',
  'container_20ft', 'container_32ft', 'trailer', 'tanker', 'refrigerated'
);

create type truck_status as enum ('available', 'busy', 'in_transit', 'maintenance', 'inactive');

create type load_status as enum (
  'posted', 'matched', 'requested', 'accepted', 'confirmed',
  'pickup', 'in_transit', 'delivered', 'completed', 'cancelled', 'expired'
);

create type booking_status as enum (
  'requested', 'accepted', 'rejected', 'confirmed', 'pickup',
  'in_transit', 'delivered', 'completed', 'cancelled', 'disputed'
);

create type trip_status as enum (
  'scheduled', 'pickup_pending', 'picked_up', 'in_transit',
  'delivered', 'completed', 'cancelled'
);

create type payment_status as enum ('pending', 'authorized', 'captured', 'failed', 'refunded');

create type load_type as enum (
  'general', 'perishable', 'fragile', 'liquid', 'construction_material',
  'agriculture', 'electronics', 'textile', 'machinery', 'other'
);

create type notification_type as enum (
  'NEW_MATCH', 'BOOKING_REQUEST', 'BOOKING_ACCEPTED', 'BOOKING_REJECTED',
  'TRIP_STARTED', 'TRIP_DELAYED', 'TRIP_COMPLETED', 'PAYMENT_RECEIVED'
);

create type dispute_status as enum ('open', 'investigating', 'resolved', 'rejected');

create type doc_type as enum ('rc', 'insurance', 'permit', 'puc', 'fitness', 'other');

-- Helper: auto-update updated_at ----------------------------------------------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- profiles ---------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'shipper',
  full_name text not null check (char_length(full_name) between 2 and 100),
  phone text,
  email text not null,
  company_name text,
  avatar_url text,
  verification_status verification_status not null default 'pending',
  account_status account_status not null default 'active',
  rating_avg numeric(3,2) not null default 0 check (rating_avg >= 0 and rating_avg <= 5),
  rating_count integer not null default 0 check (rating_count >= 0),
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_profiles_role on profiles(role);
create index idx_profiles_account_status on profiles(account_status);
create trigger trg_profiles_updated_at before update on profiles
  for each row execute function set_updated_at();

-- trucks -------------------------------------------------------------------
create table trucks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references profiles(id) on delete cascade,
  vehicle_number text not null,
  vehicle_type vehicle_type not null,
  capacity_tons numeric(6,2) not null check (capacity_tons > 0 and capacity_tons <= 60),
  length_ft numeric(5,2) check (length_ft is null or length_ft > 0),
  width_ft numeric(5,2) check (width_ft is null or width_ft > 0),
  height_ft numeric(5,2) check (height_ft is null or height_ft > 0),
  current_location jsonb not null, -- { label, city, state, country, pincode, coordinates:{lat,lng} }
  current_lat double precision,
  current_lng double precision,
  origin_city text not null,
  destination_city text not null,
  route_waypoints text[] not null default '{}',
  available_from timestamptz not null,
  available_to timestamptz,
  min_price numeric(12,2) check (min_price is null or min_price >= 0),
  status truck_status not null default 'available',
  verification_status verification_status not null default 'pending',
  driver_name text,
  driver_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_available_window check (available_to is null or available_to > available_from),
  constraint uq_owner_vehicle_number unique (owner_id, vehicle_number)
);
create index idx_trucks_owner on trucks(owner_id);
create index idx_trucks_status on trucks(status);
create index idx_trucks_origin_city on trucks(origin_city);
create index idx_trucks_destination_city on trucks(destination_city);
create index idx_trucks_available_from on trucks(available_from);
create index idx_trucks_lat_lng on trucks(current_lat, current_lng);
create trigger trg_trucks_updated_at before update on trucks
  for each row execute function set_updated_at();

-- truck_documents ------------------------------------------------------------
create table truck_documents (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references trucks(id) on delete cascade,
  doc_type doc_type not null,
  file_url text not null,
  verification_status verification_status not null default 'pending',
  uploaded_at timestamptz not null default now()
);
create index idx_truck_documents_truck on truck_documents(truck_id);

-- truck_locations (live tracking pings) --------------------------------------
create table truck_locations (
  id uuid primary key default gen_random_uuid(),
  truck_id uuid not null references trucks(id) on delete cascade,
  lat double precision not null check (lat >= -90 and lat <= 90),
  lng double precision not null check (lng >= -180 and lng <= 180),
  recorded_at timestamptz not null default now()
);
create index idx_truck_locations_truck_time on truck_locations(truck_id, recorded_at desc);

-- loads ------------------------------------------------------------------------
create table loads (
  id uuid primary key default gen_random_uuid(),
  shipper_id uuid not null references profiles(id) on delete cascade,
  pickup_city text not null,
  pickup_address jsonb not null,
  pickup_lat double precision,
  pickup_lng double precision,
  destination_city text not null,
  destination_address jsonb not null,
  destination_lat double precision,
  destination_lng double precision,
  weight_tons numeric(6,2) not null check (weight_tons > 0 and weight_tons <= 60),
  length_ft numeric(5,2) check (length_ft is null or length_ft > 0),
  width_ft numeric(5,2) check (width_ft is null or width_ft > 0),
  height_ft numeric(5,2) check (height_ft is null or height_ft > 0),
  load_type load_type not null default 'general',
  vehicle_type_required vehicle_type not null,
  pickup_datetime timestamptz not null,
  pickup_window_hours numeric(4,1) not null default 6 check (pickup_window_hours >= 0),
  offered_price numeric(12,2) not null check (offered_price > 0),
  special_instructions text,
  status load_status not null default 'posted',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint chk_diff_cities check (lower(pickup_city) <> lower(destination_city))
);
create index idx_loads_shipper on loads(shipper_id);
create index idx_loads_status on loads(status);
create index idx_loads_pickup_city on loads(pickup_city);
create index idx_loads_destination_city on loads(destination_city);
create index idx_loads_pickup_datetime on loads(pickup_datetime);
create index idx_loads_lat_lng on loads(pickup_lat, pickup_lng);
create trigger trg_loads_updated_at before update on loads
  for each row execute function set_updated_at();

-- load_items ---------------------------------------------------------------
create table load_items (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references loads(id) on delete cascade,
  name text not null,
  quantity integer not null default 1 check (quantity > 0),
  unit text not null default 'unit',
  weight_tons numeric(6,2) check (weight_tons is null or weight_tons > 0)
);
create index idx_load_items_load on load_items(load_id);

-- bookings ------------------------------------------------------------------
create table bookings (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references loads(id) on delete cascade,
  truck_id uuid not null references trucks(id) on delete cascade,
  shipper_id uuid not null references profiles(id) on delete cascade,
  truck_owner_id uuid not null references profiles(id) on delete cascade,
  status booking_status not null default 'requested',
  match_score numeric(5,2) check (match_score is null or (match_score >= 0 and match_score <= 100)),
  agreed_price numeric(12,2) check (agreed_price is null or agreed_price > 0),
  requested_at timestamptz not null default now(),
  responded_at timestamptz,
  confirmed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint uq_load_truck_active unique (load_id, truck_id)
);
create index idx_bookings_load on bookings(load_id);
create index idx_bookings_truck on bookings(truck_id);
create index idx_bookings_shipper on bookings(shipper_id);
create index idx_bookings_truck_owner on bookings(truck_owner_id);
create index idx_bookings_status on bookings(status);
create trigger trg_bookings_updated_at before update on bookings
  for each row execute function set_updated_at();

-- trips -----------------------------------------------------------------------
create table trips (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references bookings(id) on delete cascade,
  status trip_status not null default 'scheduled',
  pickup_actual_at timestamptz,
  delivery_actual_at timestamptz,
  eta timestamptz,
  distance_km numeric(8,2) check (distance_km is null or distance_km >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_trips_status on trips(status);
create trigger trg_trips_updated_at before update on trips
  for each row execute function set_updated_at();

-- payments (Demo/Mock only in MVP) ------------------------------------------
create table payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'INR',
  status payment_status not null default 'pending',
  provider text not null default 'mock',
  provider_reference text,
  is_demo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_payments_booking on payments(booking_id);
create index idx_payments_status on payments(status);
create trigger trg_payments_updated_at before update on payments
  for each row execute function set_updated_at();

-- ratings -----------------------------------------------------------------
create table ratings (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  rater_id uuid not null references profiles(id) on delete cascade,
  ratee_id uuid not null references profiles(id) on delete cascade,
  stars smallint not null check (stars between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  constraint uq_rating_once_per_direction unique (booking_id, rater_id)
);
create index idx_ratings_ratee on ratings(ratee_id);

-- notifications --------------------------------------------------------------
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  body text not null,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_notifications_user on notifications(user_id, created_at desc);
create index idx_notifications_unread on notifications(user_id) where read_at is null;

-- messages ------------------------------------------------------------------
-- Messaging only allowed once a booking exists; enforced by app logic +
-- RLS referencing the booking relationship, so contact details are not
-- exposed before the appropriate booking stage.
create table messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  sender_id uuid not null references profiles(id) on delete cascade,
  recipient_id uuid not null references profiles(id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  read_at timestamptz,
  created_at timestamptz not null default now()
);
create index idx_messages_booking on messages(booking_id, created_at);

-- disputes --------------------------------------------------------------------
create table disputes (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  raised_by uuid not null references profiles(id) on delete cascade,
  reason text not null check (char_length(reason) >= 10),
  status dispute_status not null default 'open',
  resolution_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index idx_disputes_status on disputes(status);
create trigger trg_disputes_updated_at before update on disputes
  for each row execute function set_updated_at();

-- matching_results (persisted/explainable match computations) ---------------
create table matching_results (
  id uuid primary key default gen_random_uuid(),
  load_id uuid not null references loads(id) on delete cascade,
  truck_id uuid not null references trucks(id) on delete cascade,
  overall_score numeric(5,2) not null check (overall_score >= 0 and overall_score <= 100),
  route_score numeric(5,2) not null,
  capacity_score numeric(5,2) not null,
  time_score numeric(5,2) not null,
  vehicle_score numeric(5,2) not null,
  detour_score numeric(5,2) not null,
  price_score numeric(5,2) not null,
  reliability_score numeric(5,2) not null,
  reasons text[] not null default '{}',
  computed_at timestamptz not null default now(),
  constraint uq_matching_result unique (load_id, truck_id)
);
create index idx_matching_results_load on matching_results(load_id, overall_score desc);
create index idx_matching_results_truck on matching_results(truck_id, overall_score desc);
