-- Create customer_addresses table for storing multiple shipping addresses
create table public.customer_addresses (
  id uuid primary key default gen_random_uuid(),
  customer_id uuid references auth.users(id) on delete cascade not null,
  label varchar(100) not null,
  full_name varchar(100) not null,
  phone varchar(20) not null,
  address_line1 text not null,
  address_line2 text,
  city varchar(100) not null default 'Manama',
  postal_code varchar(20),
  country varchar(100) not null default 'Bahrain',
  is_default boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Index for faster lookups
create index idx_customer_addresses_customer_id on public.customer_addresses(customer_id);

-- Ensure only one default address per customer
create unique index idx_one_default_per_customer 
  on public.customer_addresses(customer_id) 
  where is_default = true;

-- Enable RLS
alter table public.customer_addresses enable row level security;

-- Users can view their own addresses
create policy "Users can view own addresses"
  on public.customer_addresses
  for select
  to authenticated
  using (customer_id = auth.uid());

-- Users can create their own addresses
create policy "Users can create own addresses"
  on public.customer_addresses
  for insert
  to authenticated
  with check (customer_id = auth.uid());

-- Users can update their own addresses
create policy "Users can update own addresses"
  on public.customer_addresses
  for update
  to authenticated
  using (customer_id = auth.uid())
  with check (customer_id = auth.uid());

-- Users can delete their own addresses
create policy "Users can delete own addresses"
  on public.customer_addresses
  for delete
  to authenticated
  using (customer_id = auth.uid());

-- Add trigger for updated_at
create trigger update_customer_addresses_updated_at
  before update on public.customer_addresses
  for each row
  execute function public.update_updated_at_column();

-- Migrate existing addresses from customers table to customer_addresses
insert into public.customer_addresses (
  customer_id, 
  label, 
  full_name, 
  phone, 
  address_line1, 
  address_line2, 
  city, 
  postal_code, 
  country,
  is_default,
  created_at
)
select 
  id as customer_id,
  'Default' as label,
  full_name,
  phone,
  address_line1,
  address_line2,
  city,
  postal_code,
  country,
  true as is_default,
  created_at
from public.customers
where address_line1 is not null
on conflict do nothing;