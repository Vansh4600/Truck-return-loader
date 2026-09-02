-- Row Level Security policies for BackHaul.
-- Principle: users can only access their own private data; admins get
-- controlled elevated access via the `is_admin()` helper. Never rely on
-- frontend checks alone — these policies are the actual enforcement layer.

create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and role = 'admin' and account_status = 'active'
  );
$$ language sql security definer stable;

create or replace function current_role_is(target_role user_role)
returns boolean as $$
  select exists (
    select 1 from profiles where id = auth.uid() and role = target_role
  );
$$ language sql security definer stable;

-- profiles ----------------------------------------------------------------
alter table profiles enable row level security;

create policy "profiles_select_own_or_admin"
  on profiles for select
  using (id = auth.uid() or is_admin());

-- Public, limited read for counterparties to see basic profile info
-- (name/rating) once they interact via a booking. Handled via a view below
-- instead of loosening this table policy.

create policy "profiles_insert_self"
  on profiles for insert
  with check (id = auth.uid());

create policy "profiles_update_own_or_admin"
  on profiles for update
  using (id = auth.uid() or is_admin());

-- trucks --------------------------------------------------------------------
alter table trucks enable row level security;

create policy "trucks_select_own_or_admin"
  on trucks for select
  using (owner_id = auth.uid() or is_admin());

-- Shippers need to see trucks that are part of an active match/booking, or
-- that are publicly available for discovery. We expose "available" trucks
-- for matching purposes (non-sensitive fields only, via a view) while still
-- restricting the raw table to the owner. See 0003_views.sql.

create policy "trucks_insert_owner"
  on trucks for insert
  with check (owner_id = auth.uid() and current_role_is('truck_owner'));

create policy "trucks_update_own_or_admin"
  on trucks for update
  using (owner_id = auth.uid() or is_admin());

create policy "trucks_delete_own_or_admin"
  on trucks for delete
  using (owner_id = auth.uid() or is_admin());

-- truck_documents -------------------------------------------------------------
alter table truck_documents enable row level security;

create policy "truck_documents_owner_or_admin"
  on truck_documents for all
  using (
    is_admin() or
    exists (select 1 from trucks t where t.id = truck_id and t.owner_id = auth.uid())
  )
  with check (
    is_admin() or
    exists (select 1 from trucks t where t.id = truck_id and t.owner_id = auth.uid())
  );

-- truck_locations -------------------------------------------------------------
alter table truck_locations enable row level security;

create policy "truck_locations_owner_write"
  on truck_locations for insert
  with check (
    exists (select 1 from trucks t where t.id = truck_id and t.owner_id = auth.uid())
  );

create policy "truck_locations_read_owner_or_counterparty_or_admin"
  on truck_locations for select
  using (
    is_admin() or
    exists (select 1 from trucks t where t.id = truck_id and t.owner_id = auth.uid()) or
    exists (
      select 1 from bookings b
      where b.truck_id = truck_locations.truck_id
        and b.shipper_id = auth.uid()
        and b.status in ('confirmed','pickup','in_transit','delivered','completed')
    )
  );

-- loads -------------------------------------------------------------------
alter table loads enable row level security;

create policy "loads_select_own_or_admin"
  on loads for select
  using (shipper_id = auth.uid() or is_admin());

create policy "loads_insert_shipper"
  on loads for insert
  with check (shipper_id = auth.uid() and current_role_is('shipper'));

create policy "loads_update_own_or_admin"
  on loads for update
  using (shipper_id = auth.uid() or is_admin());

create policy "loads_delete_own_or_admin"
  on loads for delete
  using (shipper_id = auth.uid() or is_admin());

-- load_items -----------------------------------------------------------------
alter table load_items enable row level security;

create policy "load_items_owner_or_admin"
  on load_items for all
  using (
    is_admin() or
    exists (select 1 from loads l where l.id = load_id and l.shipper_id = auth.uid())
  )
  with check (
    is_admin() or
    exists (select 1 from loads l where l.id = load_id and l.shipper_id = auth.uid())
  );

-- bookings ------------------------------------------------------------------
alter table bookings enable row level security;

create policy "bookings_select_participant_or_admin"
  on bookings for select
  using (shipper_id = auth.uid() or truck_owner_id = auth.uid() or is_admin());

create policy "bookings_insert_truck_owner"
  on bookings for insert
  with check (
    truck_owner_id = auth.uid()
    and exists (select 1 from trucks t where t.id = truck_id and t.owner_id = auth.uid())
  );

create policy "bookings_update_participant_or_admin"
  on bookings for update
  using (shipper_id = auth.uid() or truck_owner_id = auth.uid() or is_admin());

-- trips -----------------------------------------------------------------------
alter table trips enable row level security;

create policy "trips_select_participant_or_admin"
  on trips for select
  using (
    is_admin() or
    exists (
      select 1 from bookings b
      where b.id = booking_id and (b.shipper_id = auth.uid() or b.truck_owner_id = auth.uid())
    )
  );

create policy "trips_write_truck_owner_or_admin"
  on trips for all
  using (
    is_admin() or
    exists (
      select 1 from bookings b
      where b.id = booking_id and b.truck_owner_id = auth.uid()
    )
  )
  with check (
    is_admin() or
    exists (
      select 1 from bookings b
      where b.id = booking_id and b.truck_owner_id = auth.uid()
    )
  );

-- payments (demo) -------------------------------------------------------------
alter table payments enable row level security;

create policy "payments_select_participant_or_admin"
  on payments for select
  using (
    is_admin() or
    exists (
      select 1 from bookings b
      where b.id = booking_id and (b.shipper_id = auth.uid() or b.truck_owner_id = auth.uid())
    )
  );

create policy "payments_write_shipper_or_admin"
  on payments for insert
  with check (
    is_admin() or
    exists (
      select 1 from bookings b
      where b.id = booking_id and b.shipper_id = auth.uid()
    )
  );

-- ratings -----------------------------------------------------------------
alter table ratings enable row level security;

create policy "ratings_select_participant_or_admin"
  on ratings for select
  using (rater_id = auth.uid() or ratee_id = auth.uid() or is_admin());

create policy "ratings_insert_participant"
  on ratings for insert
  with check (
    rater_id = auth.uid() and
    exists (
      select 1 from bookings b
      where b.id = booking_id
        and b.status = 'completed'
        and (b.shipper_id = auth.uid() or b.truck_owner_id = auth.uid())
    )
  );

-- notifications --------------------------------------------------------------
alter table notifications enable row level security;

create policy "notifications_select_own"
  on notifications for select
  using (user_id = auth.uid() or is_admin());

create policy "notifications_update_own"
  on notifications for update
  using (user_id = auth.uid());

create policy "notifications_insert_system"
  on notifications for insert
  with check (true); -- inserted by server-side code on behalf of users

-- messages ------------------------------------------------------------------
alter table messages enable row level security;

create policy "messages_select_participant_or_admin"
  on messages for select
  using (sender_id = auth.uid() or recipient_id = auth.uid() or is_admin());

create policy "messages_insert_participant_after_booking"
  on messages for insert
  with check (
    sender_id = auth.uid() and
    exists (
      select 1 from bookings b
      where b.id = booking_id
        and (b.shipper_id = auth.uid() or b.truck_owner_id = auth.uid())
        and b.status not in ('rejected','cancelled')
    )
  );

-- disputes --------------------------------------------------------------------
alter table disputes enable row level security;

create policy "disputes_select_participant_or_admin"
  on disputes for select
  using (
    raised_by = auth.uid() or is_admin() or
    exists (
      select 1 from bookings b
      where b.id = booking_id and (b.shipper_id = auth.uid() or b.truck_owner_id = auth.uid())
    )
  );

create policy "disputes_insert_participant"
  on disputes for insert
  with check (
    raised_by = auth.uid() and
    exists (
      select 1 from bookings b
      where b.id = booking_id and (b.shipper_id = auth.uid() or b.truck_owner_id = auth.uid())
    )
  );

create policy "disputes_update_admin_only"
  on disputes for update
  using (is_admin());

-- matching_results -------------------------------------------------------------
alter table matching_results enable row level security;

create policy "matching_results_select_related_or_admin"
  on matching_results for select
  using (
    is_admin() or
    exists (select 1 from loads l where l.id = load_id and l.shipper_id = auth.uid()) or
    exists (select 1 from trucks t where t.id = truck_id and t.owner_id = auth.uid())
  );

create policy "matching_results_write_service"
  on matching_results for insert
  with check (
    exists (select 1 from loads l where l.id = load_id and l.shipper_id = auth.uid()) or
    exists (select 1 from trucks t where t.id = truck_id and t.owner_id = auth.uid()) or
    is_admin()
  );
