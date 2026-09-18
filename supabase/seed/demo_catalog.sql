insert into public.categories (slug, name, is_active) values
  ('smartphones', 'Smartphones', true),
  ('accessoires', 'Accessoires', true),
  ('audio', 'Audio', true),
  ('electromenager', 'Petit électroménager', true)
on conflict (slug) do update set name = excluded.name, is_active = excluded.is_active;

insert into public.products (category_id, slug, brand, title, description, price_xaf, previous_price_xaf, is_published) values
  ((select id from public.categories where slug = 'smartphones'), 'iphone-16-pro-256', 'Apple', 'iPhone 16 Pro 256 Go', 'Le modèle Pro conçu pour les performances et la photo.', 875000, 925000, true),
  ((select id from public.categories where slug = 'audio'), 'galaxy-buds-3-pro', 'Samsung', 'Galaxy Buds3 Pro', 'Écouteurs sans fil à réduction active du bruit.', 145000, null, true),
  ((select id from public.categories where slug = 'smartphones'), 'tecno-camon-30-premier', 'TECNO', 'Camon 30 Premier 5G', 'Smartphone 5G pour la photographie mobile.', 299000, null, true),
  ((select id from public.categories where slug = 'accessoires'), 'anker-powerbank-20000', 'Anker', 'Powerbank 20 000 mAh', 'Batterie externe haute capacité.', 35000, null, true)
on conflict (slug) do update set
  brand = excluded.brand, title = excluded.title, description = excluded.description,
  price_xaf = excluded.price_xaf, previous_price_xaf = excluded.previous_price_xaf, is_published = excluded.is_published, updated_at = now();

insert into public.product_variants (product_id, sku, label, value, is_active) values
  ((select id from public.products where slug = 'iphone-16-pro-256'), 'APL-IP16P-256-NAT', 'Coloris', 'Titane naturel · 256 Go', true),
  ((select id from public.products where slug = 'iphone-16-pro-256'), 'APL-IP16P-256-BLK', 'Coloris', 'Titane noir · 256 Go', true),
  ((select id from public.products where slug = 'galaxy-buds-3-pro'), 'SAM-BUDS3-SLV', 'Coloris', 'Argent', true),
  ((select id from public.products where slug = 'galaxy-buds-3-pro'), 'SAM-BUDS3-WHT', 'Coloris', 'Blanc', true),
  ((select id from public.products where slug = 'tecno-camon-30-premier'), 'TEC-C30P-512-BLK', 'Coloris', 'Noir · 512 Go', true),
  ((select id from public.products where slug = 'tecno-camon-30-premier'), 'TEC-C30P-512-GLD', 'Coloris', 'Or · 512 Go', true),
  ((select id from public.products where slug = 'anker-powerbank-20000'), 'ANK-20K-BLK', 'Coloris', 'Noir', true)
on conflict (sku) do update set label = excluded.label, value = excluded.value, is_active = excluded.is_active;

insert into public.inventory (variant_id, location_name, quantity) values
  ((select id from public.product_variants where sku = 'APL-IP16P-256-NAT'), 'Akanda, Delta Postal', 2),
  ((select id from public.product_variants where sku = 'APL-IP16P-256-BLK'), 'Akanda, Delta Postal', 1),
  ((select id from public.product_variants where sku = 'SAM-BUDS3-SLV'), 'Akanda, Delta Postal', 7),
  ((select id from public.product_variants where sku = 'SAM-BUDS3-WHT'), 'Akanda, Delta Postal', 5),
  ((select id from public.product_variants where sku = 'TEC-C30P-512-BLK'), 'Akanda, Delta Postal', 3),
  ((select id from public.product_variants where sku = 'TEC-C30P-512-GLD'), 'Akanda, Delta Postal', 2),
  ((select id from public.product_variants where sku = 'ANK-20K-BLK'), 'Akanda, Delta Postal', 18)
on conflict (variant_id, location_name) do update set quantity = excluded.quantity;
