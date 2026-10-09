-- 06: Katalog tablolarına İngilizce alanlar.
-- Seed'deki name_en / description_en bu sütunlara yazılır.
-- Proje ileride ayrı bir translations tablosuna geçerse import-catalog.ts'de
-- SEED_INCLUDE_EN=false ile bu alanlar atlanır.

alter table catalog_categories
  add column if not exists name_en text;

alter table catalog_items
  add column if not exists name_en text,
  add column if not exists description_en text;

-- İsteğe bağlı: tag ve alerjen değerlerini seed sözlüğüyle sınırlamak.
-- schema/vocab.json ile senkron tutulmalı; istemiyorsan bu bloğu çalıştırma.
-- alter table catalog_items
--   add constraint catalog_items_tags_check check (
--     tags <@ array['hot','cold','caffeinated','decaf','alcoholic','vegan','vegetarian',
--                   'gluten_free','dairy_free','sugar_free','spicy','kids','sharing',
--                   'seasonal','popular','chef_choice']::text[]
--   );
-- alter table catalog_items
--   add constraint catalog_items_allergens_check check (
--     allergens <@ array['Gluten','Süt Ürünleri','Yumurta','Balık','Kabuklu Deniz Ürünleri',
--                        'Yumuşakçalar','Yer Fıstığı','Sert Kabuklu Yemişler','Soya','Kereviz',
--                        'Hardal','Susam','Sülfit','Acı Bakla']::text[]
--   );

-- Şablon → kategori / ürün bağlantılarında sık kullanılan sorgular için
create index if not exists catalog_items_primary_category_idx on catalog_items (primary_category_id);
create index if not exists catalog_categories_parent_idx on catalog_categories (parent_id);
create index if not exists menu_template_items_template_idx on menu_template_items (template_id);
create index if not exists menu_template_categories_template_idx on menu_template_categories (template_id);
