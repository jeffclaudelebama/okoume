create extension if not exists pgcrypto;

create type public.user_role as enum ('admin', 'catalog_manager', 'stock_manager', 'logistics');
create type public.order_status as enum ('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled');
create type public.fulfillment_method as enum ('delivery', 'pickup');
create type public.payment_method as enum ('cash_on_delivery', 'airtel_money', 'moov_money');
create type public.payment_status as enum ('pending', 'submitted', 'validated', 'rejected', 'collected');

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  role public.user_role not null default 'catalog_manager',
  full_name text not null,
  created_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  category_id uuid not null references public.categories on delete restrict,
  slug text not null unique,
  brand text not null,
  title text not null,
  description text not null,
  price_xaf integer not null check (price_xaf >= 0),
  previous_price_xaf integer check (previous_price_xaf is null or previous_price_xaf >= price_xaf),
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  sku text not null unique,
  label text not null,
  value text not null,
  price_xaf integer check (price_xaf is null or price_xaf >= 0),
  is_active boolean not null default true
);

create table public.inventory (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references public.product_variants on delete cascade,
  location_name text not null,
  quantity integer not null default 0 check (quantity >= 0),
  unique (variant_id, location_name)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default ('OKM-' || upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 6))),
  customer_name text not null,
  whatsapp_phone text not null,
  city text not null check (city in ('Libreville', 'Akanda', 'Owendo')),
  district text,
  landmark text,
  fulfillment public.fulfillment_method not null,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  status public.order_status not null default 'pending',
  subtotal_xaf integer not null check (subtotal_xaf >= 0),
  delivery_fee_xaf integer not null check (delivery_fee_xaf in (0, 2000)),
  total_xaf integer not null check (total_xaf = subtotal_xaf + delivery_fee_xaf),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  variant_id uuid not null references public.product_variants on delete restrict,
  title_snapshot text not null,
  unit_price_xaf integer not null check (unit_price_xaf >= 0),
  quantity integer not null check (quantity > 0)
);

create table public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders on delete cascade,
  transaction_reference text,
  submitted_at timestamptz,
  validated_by uuid references public.profiles on delete set null,
  validated_at timestamptz
);

create table public.audit_log (
  id bigint generated always as identity primary key,
  actor_id uuid references public.profiles on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.inventory enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payment_transactions enable row level security;
alter table public.audit_log enable row level security;

create policy "published categories are public" on public.categories for select using (is_active);
create policy "published products are public" on public.products for select using (is_published);
create policy "active variants of published products are public" on public.product_variants for select using (is_active and exists (select 1 from public.products where products.id = product_variants.product_id and products.is_published));
create policy "inventory is not public" on public.inventory for select using (false);
-- Orders are created exclusively by a validated server endpoint; no anonymous table policy is granted.

grant usage on schema public to anon, authenticated;
grant select on public.categories, public.products, public.product_variants to anon, authenticated;
