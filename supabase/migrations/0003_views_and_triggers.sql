-- Discovery views + auto-profile-provisioning trigger.

-- Public, minimal-field views so counterparties can discover available
-- trucks/loads for matching without exposing full owner-only rows via RLS
-- bypass. Views run with the permissions of the underlying tables' RLS by
-- default (security_invoker), so we instead expose them as
-- security-definer-backed functions with only safe columns and an explicit
-- availability filter.

create or replace view public_available_trucks as
select
  t.id,
  t.owner_id,
  t.vehicle_type,
  t.capacity_tons,
  t.origin_city,
  t.destination_city,
  t.route_waypoints,
  t.current_lat,
  t.current_lng,
  t.available_from,
  t.available_to,
  t.min_price,
  t.status,
  t.verification_status,
  p.full_name as owner_name,
  p.rating_avg as owner_rating,
  p.rating_count as owner_rating_count
from trucks t
join profiles p on p.id = t.owner_id
where t.status = 'available';

comment on view public_available_trucks is
  'Non-sensitive truck fields exposed for cross-user matching/discovery. Excludes driver phone, vehicle number, and exact address label.';

create or replace view public_open_loads as
select
  l.id,
  l.shipper_id,
  l.pickup_city,
  l.destination_city,
  l.pickup_lat,
  l.pickup_lng,
  l.destination_lat,
  l.destination_lng,
  l.weight_tons,
  l.load_type,
  l.vehicle_type_required,
  l.pickup_datetime,
  l.pickup_window_hours,
  l.offered_price,
  l.status,
  p.full_name as shipper_name,
  p.rating_avg as shipper_rating
from loads l
join profiles p on p.id = l.shipper_id
where l.status in ('posted', 'matched');

comment on view public_open_loads is
  'Non-sensitive load fields exposed for cross-user matching/discovery. Excludes exact pickup address label and special instructions.';

-- Grant select on the views to authenticated users. The base tables keep
-- their strict RLS; these views intentionally surface a safe subset.
grant select on public_available_trucks to authenticated;
grant select on public_open_loads to authenticated;

-- Auto-create a profile row when a new auth user signs up. Role/full_name
-- are passed through `raw_user_meta_data` from the sign-up form.
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, email, phone, company_name)
  values (
    new.id,
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'shipper'),
    coalesce(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    new.raw_user_meta_data->>'phone',
    new.raw_user_meta_data->>'company_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Keep profiles.rating_avg / rating_count in sync when a rating is inserted.
create or replace function refresh_profile_rating()
returns trigger as $$
begin
  update profiles
  set
    rating_count = (select count(*) from ratings where ratee_id = new.ratee_id),
    rating_avg = (select coalesce(avg(stars), 0) from ratings where ratee_id = new.ratee_id)
  where id = new.ratee_id;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_rating_created on ratings;
create trigger on_rating_created
  after insert on ratings
  for each row execute function refresh_profile_rating();
