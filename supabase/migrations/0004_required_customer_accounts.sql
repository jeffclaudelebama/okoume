-- Customer identities live separately from staff profiles: signing up never
-- grants a catalogue, stock or logistics role.
create table public.customer_accounts (
  id uuid primary key references auth.users on delete cascade,
  full_name text not null check (length(trim(full_name)) between 2 and 120),
  whatsapp_phone text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.customer_accounts enable row level security;

create policy "customers can read their account"
on public.customer_accounts for select
to authenticated
using (id = auth.uid());

create policy "customers can update their account"
on public.customer_accounts for update
to authenticated
using (id = auth.uid())
with check (id = auth.uid());

create or replace function public.create_customer_account()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.customer_accounts (id, full_name)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''), 'Client OKOUMÉ')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created_create_customer_account
  after insert on auth.users
  for each row execute procedure public.create_customer_account();

alter table public.orders add column customer_id uuid references auth.users on delete restrict;
create index orders_customer_id_created_at_idx on public.orders (customer_id, created_at desc);

create policy "customers can read their own orders"
on public.orders for select
to authenticated
using (customer_id = auth.uid());

-- Guest checkout is permanently disabled. Orders can only be created by the
-- authenticated function below, which derives the customer id from the JWT.
drop function if exists public.create_guest_order(text, text, text, text, text, public.fulfillment_method, public.payment_method, jsonb);

create or replace function public.create_customer_order(
  p_whatsapp_phone text,
  p_city text,
  p_district text,
  p_landmark text,
  p_fulfillment public.fulfillment_method,
  p_payment_method public.payment_method,
  p_items jsonb
)
returns table (reference text)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_customer_id uuid := auth.uid();
  v_customer_name text;
  v_item jsonb;
  v_variant_id uuid;
  v_quantity integer;
  v_unit_price integer;
  v_title text;
  v_stock integer;
  v_subtotal integer := 0;
  v_delivery_fee integer;
  v_order_id uuid;
  v_reference text;
  v_inventory_id uuid;
begin
  if v_customer_id is null then
    raise exception 'Authentification requise';
  end if;
  if length(trim(p_whatsapp_phone)) < 6 or length(trim(p_whatsapp_phone)) > 30 then
    raise exception 'Numéro WhatsApp invalide';
  end if;
  if p_city not in ('Libreville', 'Akanda', 'Owendo') then
    raise exception 'Ville non desservie';
  end if;
  if p_fulfillment = 'delivery' and (coalesce(length(trim(p_district)), 0) < 2 or coalesce(length(trim(p_landmark)), 0) < 3) then
    raise exception 'Adresse de livraison incomplète';
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 or jsonb_array_length(p_items) > 20 then
    raise exception 'Panier invalide';
  end if;

  insert into public.customer_accounts (id, full_name)
  values (v_customer_id, coalesce(nullif(auth.jwt() -> 'user_metadata' ->> 'full_name', ''), 'Client OKOUMÉ'))
  on conflict (id) do nothing;

  update public.customer_accounts
  set whatsapp_phone = trim(p_whatsapp_phone), updated_at = now()
  where id = v_customer_id;

  select full_name into v_customer_name from public.customer_accounts where id = v_customer_id;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    if coalesce(v_item->>'variant_id', '') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      or coalesce(v_item->>'quantity', '') !~ '^[1-9][0-9]{0,2}$' then
      raise exception 'Article de panier invalide';
    end if;

    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    perform 1 from public.inventory where variant_id = v_variant_id for update;

    select coalesce(product_variants.price_xaf, products.price_xaf),
           products.brand || ' ' || products.title || ' — ' || product_variants.value,
           coalesce(sum(inventory.quantity), 0)
    into v_unit_price, v_title, v_stock
    from public.product_variants
    join public.products on products.id = product_variants.product_id
    left join public.inventory on inventory.variant_id = product_variants.id
    where product_variants.id = v_variant_id
      and product_variants.is_active and products.is_published
    group by product_variants.price_xaf, products.price_xaf, products.brand, products.title, product_variants.value;

    if v_unit_price is null or v_stock < v_quantity then
      raise exception 'Stock insuffisant pour un article du panier';
    end if;
    v_subtotal := v_subtotal + (v_unit_price * v_quantity);
  end loop;

  v_delivery_fee := case when p_fulfillment = 'delivery' then 2000 else 0 end;
  insert into public.orders (customer_id, customer_name, whatsapp_phone, city, district, landmark, fulfillment, payment_method, subtotal_xaf, delivery_fee_xaf, total_xaf)
  values (v_customer_id, v_customer_name, trim(p_whatsapp_phone), p_city, nullif(trim(p_district), ''), nullif(trim(p_landmark), ''), p_fulfillment, p_payment_method, v_subtotal, v_delivery_fee, v_subtotal + v_delivery_fee)
  returning id, orders.reference into v_order_id, v_reference;

  for v_item in select value from jsonb_array_elements(p_items)
  loop
    v_variant_id := (v_item->>'variant_id')::uuid;
    v_quantity := (v_item->>'quantity')::integer;
    select coalesce(product_variants.price_xaf, products.price_xaf), products.brand || ' ' || products.title || ' — ' || product_variants.value
    into v_unit_price, v_title
    from public.product_variants join public.products on products.id = product_variants.product_id
    where product_variants.id = v_variant_id;

    update public.inventory set quantity = quantity - v_quantity
    where id = (select id from public.inventory where variant_id = v_variant_id and quantity >= v_quantity order by quantity desc, id limit 1)
    returning id into v_inventory_id;
    if v_inventory_id is null then raise exception 'Stock insuffisant pour un article du panier'; end if;

    insert into public.order_items (order_id, variant_id, title_snapshot, unit_price_xaf, quantity)
    values (v_order_id, v_variant_id, v_title, v_unit_price, v_quantity);
  end loop;

  insert into public.audit_log (actor_id, action, entity_type, entity_id, payload)
  values (v_customer_id, 'customer_order_created', 'order', v_order_id, jsonb_build_object('reference', v_reference));

  return query select v_reference;
end;
$$;

revoke all on function public.create_customer_order(text, text, text, text, public.fulfillment_method, public.payment_method, jsonb) from public;
grant execute on function public.create_customer_order(text, text, text, text, public.fulfillment_method, public.payment_method, jsonb) to authenticated;
