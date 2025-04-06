-- Create an enum for service types
create type service_type as enum ('gym', 'co-working', 'banquet', 'cafe', 'other');

-- Create an enum for service status
create type service_status as enum ('pending', 'approved', 'rejected');

-- Create services table
create table services (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  
  -- Service provider details
  provider_id uuid references auth.users(id) on delete cascade,
  
  -- Basic information
  name text not null,
  description text not null,
  type service_type not null,
  image_url text,
  
  -- Location details
  location text not null,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  
  -- Pricing
  price_per_hour numeric(10, 2) not null,
  
  -- Availability
  opening_time time not null,
  closing_time time not null,
  available_days text[] not null, -- Array of days like ['monday', 'tuesday', etc.]
  
  -- Capacity and status
  max_capacity integer not null,
  status service_status default 'pending',
  
  -- Additional details
  amenities text[],
  rules text[]
);

-- Create RLS policies
alter table services enable row level security;

-- Policy for providers to view their own services
create policy "Providers can view their own services"
  on services for select
  using (auth.uid() = provider_id);

-- Policy for providers to delete their own services
create policy "Providers can delete their own services"
  on services for delete
  using (auth.uid() = provider_id);

-- Drop existing function
drop function if exists get_services_with_provider_emails();

-- Function to get services with provider emails for admin
create function get_services_with_provider_emails()
returns setof services
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Check if user is admin
  if (auth.jwt()->>'email' != 'admin@gmail.com') then
    raise exception 'Only admin can access this function';
  end if;

  return query
  select s.*
  from services s
  order by s.created_at desc;
end;
$$;

-- Policy for admin to view all services
create policy "Admin can view all services"
  on services for select
  using (auth.jwt()->>'email' = 'admin@gmail.com');

-- Policy for admin to update all services
create policy "Admin can update all services"
  on services for update
  using (auth.jwt()->>'email' = 'admin@gmail.com');

-- Policy for admin to delete all services
create policy "Admin can delete all services"
  on services for delete
  using (auth.jwt()->>'email' = 'admin@gmail.com');

-- Policy for providers to insert their own services
create policy "Providers can insert their own services"
  on services for insert
  with check (auth.uid() = provider_id);

-- Policy for providers to update their own services

-- Sample service data
INSERT INTO services (provider_id, name, description, type, location, price_per_hour, status, opening_time, closing_time, available_days, max_capacity, created_at, updated_at)
VALUES
('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Luxury Conference Room', 'Modern conference room with A/V equipment and seating for 20', 'co-working', 'Downtown Business Center', 75.00, 'approved', '09:00', '18:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 20, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Creative Studio Space', 'Well-lit studio perfect for photography and art projects', 'co-working', 'Arts District', 45.00, 'approved', '08:00', '20:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 15, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Rooftop Event Venue', 'Stunning rooftop venue with city views and bar setup', 'banquet', 'City Center', 200.00, 'approved', '10:00', '23:00', ARRAY['friday', 'saturday', 'sunday'], 100, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Private Dance Studio', 'Mirrored walls, wood floors, and sound system', 'other', 'Performing Arts Center', 35.00, 'approved', '07:00', '22:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], 25, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Coworking Hot Desk', 'Flexible desk space with high-speed internet and coffee', 'co-working', 'Tech Hub', 15.00, 'approved', '08:00', '20:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 50, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Recording Studio', 'Professional recording booth with mixing equipment', 'other', 'Music District', 85.00, 'approved', '10:00', '22:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'], 4, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Workshop Space', 'Industrial workspace with tools and workbenches', 'other', 'Maker District', 40.00, 'approved', '09:00', '18:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 12, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Yoga Studio', 'Peaceful studio with mats and meditation space', 'gym', 'Wellness Center', 30.00, 'approved', '06:00', '21:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'], 20, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Private Theater', 'Intimate screening room with 30 luxury seats', 'other', 'Entertainment Complex', 150.00, 'approved', '11:00', '23:00', ARRAY['friday', 'saturday', 'sunday'], 30, NOW(), NOW()),

('773e32b6-5d81-4e0e-903c-a5951ecdbedd', 'Meeting Room', 'Professional meeting space with whiteboard and projector', 'co-working', 'Business Park', 50.00, 'approved', '09:00', '18:00', ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday'], 10, NOW(), NOW());
create policy "Providers can update their own services"
  on services for update
  using (auth.uid() = provider_id)
  with check (auth.uid() = provider_id);

-- Policy for users to view approved services
create policy "Users can view approved services"
  on services for select
  using (status = 'approved');

-- Create function to automatically update updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create trigger for updated_at
create trigger update_services_updated_at
  before update on services
  for each row
  execute function update_updated_at_column();
