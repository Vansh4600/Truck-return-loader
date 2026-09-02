-- =============================================================================
-- BackHaul DEMO SEED DATA
-- =============================================================================
-- This file inserts clearly-labelled demo data: 5 truck owners, 5 shippers,
-- 1 admin, 10+ trucks, and 20+ loads across the Delhi/Kanpur/Lucknow/Agra
-- demo corridors. All emails use the `@demo.backhaul.dev` domain and full
-- names are prefixed "[Demo]" so this data is never mistaken for real users.
--
-- IMPORTANT: This script inserts directly into `auth.users` (Supabase's
-- internal schema) for convenience in local development so seeded accounts
-- can actually log in with a known password. Do NOT run this against a
-- production project. See README.md "Database setup" for instructions.
-- =============================================================================

-- Demo password for ALL seeded accounts: "Demo@12345" (bcrypt hash below)
-- Generated with: select crypt('Demo@12345', gen_salt('bf'));
do $$
declare
  demo_password text := crypt('Demo@12345', gen_salt('bf'));

  -- Truck owners
  owner1 uuid := '10000000-0000-0000-0000-000000000001';
  owner2 uuid := '10000000-0000-0000-0000-000000000002';
  owner3 uuid := '10000000-0000-0000-0000-000000000003';
  owner4 uuid := '10000000-0000-0000-0000-000000000004';
  owner5 uuid := '10000000-0000-0000-0000-000000000005';

  -- Shippers
  shipper1 uuid := '20000000-0000-0000-0000-000000000001';
  shipper2 uuid := '20000000-0000-0000-0000-000000000002';
  shipper3 uuid := '20000000-0000-0000-0000-000000000003';
  shipper4 uuid := '20000000-0000-0000-0000-000000000004';
  shipper5 uuid := '20000000-0000-0000-0000-000000000005';

  -- Admin
  admin1 uuid := '30000000-0000-0000-0000-000000000001';
begin
  -- ---------------------------------------------------------------------
  -- auth.users + profiles for truck owners
  -- ---------------------------------------------------------------------
  insert into auth.users (id, instance_id, email, encrypted_password, email_confirmed_at, created_at, updated_at, aud, role)
  values
    (owner1, '00000000-0000-0000-0000-000000000000', 'owner1@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (owner2, '00000000-0000-0000-0000-000000000000', 'owner2@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (owner3, '00000000-0000-0000-0000-000000000000', 'owner3@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (owner4, '00000000-0000-0000-0000-000000000000', 'owner4@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (owner5, '00000000-0000-0000-0000-000000000000', 'owner5@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (shipper1, '00000000-0000-0000-0000-000000000000', 'shipper1@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (shipper2, '00000000-0000-0000-0000-000000000000', 'shipper2@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (shipper3, '00000000-0000-0000-0000-000000000000', 'shipper3@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (shipper4, '00000000-0000-0000-0000-000000000000', 'shipper4@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (shipper5, '00000000-0000-0000-0000-000000000000', 'shipper5@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated'),
    (admin1, '00000000-0000-0000-0000-000000000000', 'admin@demo.backhaul.dev', demo_password, now(), now(), now(), 'authenticated', 'authenticated')
  on conflict (id) do nothing;

  -- profiles (auto-created by trigger with defaults; update with demo details)
  insert into profiles (id, role, full_name, phone, email, company_name, verification_status, city)
  values
    (owner1, 'truck_owner', '[Demo] Rajesh Kumar', '+919810000001', 'owner1@demo.backhaul.dev', 'Kumar Transport Co.', 'verified', 'Delhi'),
    (owner2, 'truck_owner', '[Demo] Suresh Yadav', '+919810000002', 'owner2@demo.backhaul.dev', 'Yadav Logistics', 'verified', 'Kanpur'),
    (owner3, 'truck_owner', '[Demo] Vikram Singh', '+919810000003', 'owner3@demo.backhaul.dev', 'Singh Freight Carriers', 'verified', 'Lucknow'),
    (owner4, 'truck_owner', '[Demo] Mahesh Sharma', '+919810000004', 'owner4@demo.backhaul.dev', 'Sharma Roadways', 'pending', 'Agra'),
    (owner5, 'truck_owner', '[Demo] Ramesh Gupta', '+919810000005', 'owner5@demo.backhaul.dev', 'Gupta Carriers', 'verified', 'Delhi'),
    (shipper1, 'shipper', '[Demo] Anita Traders', '+919820000001', 'shipper1@demo.backhaul.dev', 'Anita Traders Pvt Ltd', 'verified', 'Delhi'),
    (shipper2, 'shipper', '[Demo] Kanpur Textiles Ltd', '+919820000002', 'shipper2@demo.backhaul.dev', 'Kanpur Textiles Ltd', 'verified', 'Kanpur'),
    (shipper3, 'shipper', '[Demo] Lucknow AgroFresh', '+919820000003', 'shipper3@demo.backhaul.dev', 'AgroFresh Pvt Ltd', 'verified', 'Lucknow'),
    (shipper4, 'shipper', '[Demo] Agra Marble Works', '+919820000004', 'shipper4@demo.backhaul.dev', 'Agra Marble Works', 'pending', 'Agra'),
    (shipper5, 'shipper', '[Demo] Delhi Electronics Hub', '+919820000005', 'shipper5@demo.backhaul.dev', 'Delhi Electronics Hub', 'verified', 'Delhi'),
    (admin1, 'admin', '[Demo] Platform Admin', '+919830000000', 'admin@demo.backhaul.dev', 'BackHaul', 'verified', 'Delhi')
  on conflict (id) do update set
    role = excluded.role,
    full_name = excluded.full_name,
    phone = excluded.phone,
    company_name = excluded.company_name,
    verification_status = excluded.verification_status,
    city = excluded.city;

  -- ---------------------------------------------------------------------
  -- trucks (10+)
  -- ---------------------------------------------------------------------
  insert into trucks (
    owner_id, vehicle_number, vehicle_type, capacity_tons, length_ft, width_ft, height_ft,
    current_location, current_lat, current_lng, origin_city, destination_city,
    route_waypoints, available_from, available_to, min_price, status, verification_status,
    driver_name, driver_phone
  ) values
    (owner1, 'DL01AB1234', 'truck_17ft', 9, 17, 7, 7,
     jsonb_build_object('label','Connaught Place, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)),
     28.6139, 77.2090, 'Delhi', 'Kanpur', array['Delhi','Noida','Kanpur'],
     now(), now() + interval '2 days', 15000, 'available', 'verified', 'Ravi Prasad', '+919811100001'),

    (owner1, 'DL01CD5678', 'truck_20ft', 12, 20, 8, 8,
     jsonb_build_object('label','Rohini, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)),
     28.6139, 77.2090, 'Delhi', 'Agra', array['Delhi','Gurugram','Agra'],
     now(), now() + interval '1 days', 12000, 'available', 'verified', 'Sanjay Verma', '+919811100002'),

    (owner2, 'UP78EF4321', 'truck_17ft', 8.5, 17, 7, 7,
     jsonb_build_object('label','Civil Lines, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)),
     26.4499, 80.3319, 'Kanpur', 'Delhi', array['Kanpur','Noida','Delhi'],
     now(), now() + interval '2 days', 18000, 'available', 'verified', 'Amit Tiwari', '+919811100003'),

    (owner2, 'UP78GH8765', 'lcv', 6, 14, 6, 6,
     jsonb_build_object('label','Kalyanpur, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)),
     26.4499, 80.3319, 'Kanpur', 'Lucknow', array['Kanpur','Lucknow'],
     now(), now() + interval '1 days', 8000, 'available', 'verified', 'Deepak Mishra', '+919811100004'),

    (owner3, 'UP32IJ2468', 'truck_19ft', 10, 19, 7, 7,
     jsonb_build_object('label','Hazratganj, Lucknow','city','Lucknow','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.8467,'lng',80.9462)),
     26.8467, 80.9462, 'Lucknow', 'Kanpur', array['Lucknow','Kanpur'],
     now(), now() + interval '3 days', 9000, 'available', 'verified', 'Praveen Yadav', '+919811100005'),

    (owner3, 'UP32KL1357', 'truck_22ft', 15, 22, 8, 8,
     jsonb_build_object('label','Gomti Nagar, Lucknow','city','Lucknow','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.8467,'lng',80.9462)),
     26.8467, 80.9462, 'Lucknow', 'Delhi', array['Lucknow','Kanpur','Noida','Delhi'],
     now(), now() + interval '2 days', 22000, 'busy', 'verified', 'Anil Chauhan', '+919811100006'),

    (owner4, 'UP80MN9753', 'truck_14ft', 5.5, 14, 6, 6,
     jsonb_build_object('label','Sikandra, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)),
     27.1767, 78.0081, 'Agra', 'Delhi', array['Agra','Gurugram','Delhi'],
     now(), now() + interval '1 days', 10000, 'available', 'pending', 'Manoj Rathore', '+919811100007'),

    (owner4, 'UP80OP7531', 'container_20ft', 20, 20, 8, 9,
     jsonb_build_object('label','Kamla Nagar, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)),
     27.1767, 78.0081, 'Agra', 'Kanpur', array['Agra','Gwalior','Kanpur'],
     now(), now() + interval '2 days', 25000, 'available', 'pending', 'Rakesh Solanki', '+919811100008'),

    (owner5, 'DL03QR1122', 'trailer', 30, 32, 8, 9,
     jsonb_build_object('label','Narela, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)),
     28.6139, 77.2090, 'Delhi', 'Kanpur', array['Delhi','Noida','Kanpur'],
     now(), now() + interval '2 days', 35000, 'available', 'verified', 'Yogesh Pal', '+919811100009'),

    (owner5, 'DL03ST3344', 'refrigerated', 12, 20, 8, 8,
     jsonb_build_object('label','Okhla, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)),
     28.6139, 77.2090, 'Delhi', 'Lucknow', array['Delhi','Noida','Kanpur','Lucknow'],
     now(), now() + interval '3 days', 28000, 'available', 'verified', 'Sunil Bhatt', '+919811100010'),

    (owner1, 'DL01UV5566', 'pickup', 2.5, 10, 5, 5,
     jsonb_build_object('label','Karol Bagh, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)),
     28.6139, 77.2090, 'Delhi', 'Agra', array['Delhi','Gurugram','Agra'],
     now(), now() + interval '1 days', 6000, 'maintenance', 'verified', 'Naveen Kumar', '+919811100011');

  -- ---------------------------------------------------------------------
  -- loads (20+)
  -- ---------------------------------------------------------------------
  insert into loads (
    shipper_id, pickup_city, pickup_address, pickup_lat, pickup_lng,
    destination_city, destination_address, destination_lat, destination_lng,
    weight_tons, length_ft, width_ft, height_ft, load_type, vehicle_type_required,
    pickup_datetime, pickup_window_hours, offered_price, special_instructions, status
  ) values
    -- Exact reverse of Delhi->Kanpur trucks (high-priority matches)
    (shipper2, 'Kanpur', jsonb_build_object('label','Civil Lines, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     'Delhi', jsonb_build_object('label','Azadpur, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     8.5, 17, 7, 6, 'textile', 'truck_17ft', now() + interval '6 hours', 6, 18500, 'Textile rolls, handle with care', 'posted'),

    (shipper2, 'Kanpur', jsonb_build_object('label','Kalyanpur, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     'Delhi', jsonb_build_object('label','Karol Bagh, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     11, 20, 8, 7, 'general', 'truck_20ft', now() + interval '8 hours', 8, 21000, 'General merchandise cartons', 'posted'),

    -- Continuation match: Kanpur -> Lucknow (truck going Delhi->Kanpur can continue)
    (shipper3, 'Kanpur', jsonb_build_object('label','Kalyanpur, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     'Lucknow', jsonb_build_object('label','Alambagh, Lucknow','city','Lucknow','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.8467,'lng',80.9462)), 26.8467, 80.9462,
     6, 14, 6, 6, 'agriculture', 'lcv', now() + interval '10 hours', 6, 9500, 'Perishable produce crates', 'posted'),

    (shipper3, 'Lucknow', jsonb_build_object('label','Hazratganj, Lucknow','city','Lucknow','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.8467,'lng',80.9462)), 26.8467, 80.9462,
     'Kanpur', jsonb_build_object('label','Civil Lines, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     9.5, 19, 7, 7, 'general', 'truck_19ft', now() + interval '12 hours', 6, 10500, 'Packaged consumer goods', 'posted'),

    (shipper3, 'Lucknow', jsonb_build_object('label','Gomti Nagar, Lucknow','city','Lucknow','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.8467,'lng',80.9462)), 26.8467, 80.9462,
     'Delhi', jsonb_build_object('label','Rohini, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     14, 22, 8, 8, 'machinery', 'truck_22ft', now() + interval '1 days', 8, 23000, 'Industrial spare parts, secure tie-down required', 'posted'),

    (shipper4, 'Agra', jsonb_build_object('label','Sikandra, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)), 27.1767, 78.0081,
     'Delhi', jsonb_build_object('label','Connaught Place, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     5, 14, 6, 6, 'construction_material', 'truck_14ft', now() + interval '5 hours', 6, 9800, 'Marble slabs, fragile', 'posted'),

    (shipper4, 'Agra', jsonb_build_object('label','Kamla Nagar, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)), 27.1767, 78.0081,
     'Kanpur', jsonb_build_object('label','Civil Lines, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     18, 20, 8, 9, 'construction_material', 'container_20ft', now() + interval '1 days', 6, 26000, 'Marble blocks, heavy load', 'posted'),

    (shipper1, 'Delhi', jsonb_build_object('label','Azadpur, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     'Kanpur', jsonb_build_object('label','Kalyanpur, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     10, 17, 7, 7, 'general', 'truck_17ft', now() + interval '4 hours', 6, 17000, 'Retail goods for wholesale distributor', 'posted'),

    (shipper1, 'Delhi', jsonb_build_object('label','Karol Bagh, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     'Agra', jsonb_build_object('label','Sikandra, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)), 27.1767, 78.0081,
     3, 10, 5, 5, 'general', 'pickup', now() + interval '3 hours', 4, 5500, 'Small courier packages', 'posted'),

    (shipper5, 'Delhi', jsonb_build_object('label','Okhla, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     'Lucknow', jsonb_build_object('label','Alambagh, Lucknow','city','Lucknow','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.8467,'lng',80.9462)), 26.8467, 80.9462,
     11, 20, 8, 8, 'electronics', 'refrigerated', now() + interval '14 hours', 6, 27500, 'Temperature-sensitive electronics', 'posted'),

    (shipper5, 'Delhi', jsonb_build_object('label','Rohini, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     'Kanpur', jsonb_build_object('label','Civil Lines, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     28, 32, 8, 9, 'electronics', 'container_32ft', now() + interval '1 days', 8, 40000, 'Consumer electronics, full container', 'posted'),

    -- Unrelated corridor: Mumbai <-> Pune (should never match Delhi/Kanpur/Lucknow trucks)
    (shipper1, 'Mumbai', jsonb_build_object('label','Andheri, Mumbai','city','Mumbai','state','Maharashtra','country','India','coordinates',jsonb_build_object('lat',19.0760,'lng',72.8777)), 19.0760, 72.8777,
     'Pune', jsonb_build_object('label','Hinjewadi, Pune','city','Pune','state','Maharashtra','country','India','coordinates',jsonb_build_object('lat',18.5204,'lng',73.8567)), 18.5204, 73.8567,
     7, 17, 7, 7, 'general', 'truck_17ft', now() + interval '10 hours', 6, 12000, 'FMCG goods', 'posted'),

    (shipper2, 'Mumbai', jsonb_build_object('label','Bandra, Mumbai','city','Mumbai','state','Maharashtra','country','India','coordinates',jsonb_build_object('lat',19.0760,'lng',72.8777)), 19.0760, 72.8777,
     'Pune', jsonb_build_object('label','Kothrud, Pune','city','Pune','state','Maharashtra','country','India','coordinates',jsonb_build_object('lat',18.5204,'lng',73.8567)), 18.5204, 73.8567,
     5, 14, 6, 6, 'textile', 'lcv', now() + interval '20 hours', 6, 9000, 'Garment bales', 'posted'),

    -- Jaipur corridor loads
    (shipper4, 'Delhi', jsonb_build_object('label','Connaught Place, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     'Jaipur', jsonb_build_object('label','Malviya Nagar, Jaipur','city','Jaipur','state','Rajasthan','country','India','coordinates',jsonb_build_object('lat',26.9124,'lng',75.7873)), 26.9124, 75.7873,
     9, 17, 7, 7, 'general', 'truck_17ft', now() + interval '9 hours', 6, 16000, 'Handicraft export cargo', 'posted'),

    (shipper5, 'Jaipur', jsonb_build_object('label','C-Scheme, Jaipur','city','Jaipur','state','Rajasthan','country','India','coordinates',jsonb_build_object('lat',26.9124,'lng',75.7873)), 26.9124, 75.7873,
     'Agra', jsonb_build_object('label','Sikandra, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)), 27.1767, 78.0081,
     6.5, 14, 6, 6, 'general', 'lcv', now() + interval '16 hours', 6, 11000, 'Textile and handicrafts', 'posted'),

    -- Already progressed loads (for booking/trip demo states)
    (shipper1, 'Kanpur', jsonb_build_object('label','Civil Lines, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     'Delhi', jsonb_build_object('label','Azadpur, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     14, 22, 8, 8, 'machinery', 'truck_22ft', now() - interval '1 days', 6, 22000, 'Demo booking in progress', 'matched'),

    (shipper2, 'Lucknow', jsonb_build_object('label','Hazratganj, Lucknow','city','Lucknow','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.8467,'lng',80.9462)), 26.8467, 80.9462,
     'Kanpur', jsonb_build_object('label','Kalyanpur, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     9, 19, 7, 7, 'general', 'truck_19ft', now() - interval '3 days', 6, 10000, 'Demo completed shipment', 'completed'),

    (shipper3, 'Delhi', jsonb_build_object('label','Rohini, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     'Agra', jsonb_build_object('label','Kamla Nagar, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)), 27.1767, 78.0081,
     12, 20, 8, 8, 'general', 'truck_20ft', now() - interval '5 days', 6, 13500, 'Demo completed shipment', 'completed'),

    (shipper4, 'Kanpur', jsonb_build_object('label','Kalyanpur, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     'Agra', jsonb_build_object('label','Sikandra, Agra','city','Agra','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',27.1767,'lng',78.0081)), 27.1767, 78.0081,
     16, 20, 8, 9, 'construction_material', 'container_20ft', now() - interval '2 hours', 6, 24000, 'Demo cancelled shipment', 'cancelled'),

    (shipper5, 'Delhi', jsonb_build_object('label','Okhla, Delhi','city','Delhi','state','Delhi','country','India','coordinates',jsonb_build_object('lat',28.6139,'lng',77.2090)), 28.6139, 77.2090,
     'Kanpur', jsonb_build_object('label','Civil Lines, Kanpur','city','Kanpur','state','Uttar Pradesh','country','India','coordinates',jsonb_build_object('lat',26.4499,'lng',80.3319)), 26.4499, 80.3319,
     7, 14, 6, 6, 'general', 'lcv', now() + interval '18 hours', 6, 9200, 'General cargo', 'posted');

end $$;

-- Note: Row counts — 5 truck owners, 5 shippers, 1 admin, 11 trucks, 20 loads.
