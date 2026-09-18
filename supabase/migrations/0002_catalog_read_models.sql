create table public.product_specifications (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products on delete cascade,
  label text not null,
  value text not null,
  sort_order integer not null default 0,
  unique (product_id, label)
);

alter table public.product_specifications enable row level security;
create policy "specifications of published products are public"
on public.product_specifications for select
using (exists (select 1 from public.products where products.id = product_specifications.product_id and products.is_published));
grant select on public.product_specifications to anon, authenticated;

create or replace view public.public_catalog_products as
select
  p.id, p.slug, p.brand, p.title, p.description, p.price_xaf, p.previous_price_xaf,
  c.slug as category_slug, c.name as category_name,
  coalesce(sum(i.quantity), 0)::integer as stock
from public.products p
join public.categories c on c.id = p.category_id and c.is_active
left join public.product_variants v on v.product_id = p.id and v.is_active
left join public.inventory i on i.variant_id = v.id
where p.is_published
group by p.id, c.slug, c.name;

create or replace view public.public_catalog_variants as
select
  v.id, v.product_id, v.sku, v.label, v.value, v.price_xaf,
  coalesce(sum(i.quantity), 0)::integer as stock
from public.product_variants v
join public.products p on p.id = v.product_id and p.is_published
left join public.inventory i on i.variant_id = v.id
where v.is_active
group by v.id;

grant select on public.public_catalog_products, public.public_catalog_variants to anon, authenticated;

insert into public.product_specifications (product_id, label, value, sort_order) values
  ((select id from public.products where slug = 'iphone-16-pro-256'), 'Écran', '6,3 pouces', 1),
  ((select id from public.products where slug = 'iphone-16-pro-256'), 'Stockage', '256 Go', 2),
  ((select id from public.products where slug = 'iphone-16-pro-256'), 'Réseau', '5G', 3),
  ((select id from public.products where slug = 'galaxy-buds-3-pro'), 'Connexion', 'Bluetooth', 1),
  ((select id from public.products where slug = 'galaxy-buds-3-pro'), 'Garantie', '12 mois', 2),
  ((select id from public.products where slug = 'tecno-camon-30-premier'), 'Réseau', '5G', 1),
  ((select id from public.products where slug = 'tecno-camon-30-premier'), 'Stockage', '512 Go', 2),
  ((select id from public.products where slug = 'anker-powerbank-20000'), 'Capacité', '20 000 mAh', 1),
  ((select id from public.products where slug = 'anker-powerbank-20000'), 'Ports', 'USB-C + USB-A', 2)
on conflict (product_id, label) do update set value = excluded.value, sort_order = excluded.sort_order;
