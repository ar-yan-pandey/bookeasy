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
