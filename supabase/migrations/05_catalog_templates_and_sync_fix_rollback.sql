-- Rollback for 05: katalog tablolarını ve yeni sütunları kaldırır, RPC'yi migration 02 davranışına (void) döndürür.
-- UYARI: catalog_* / menu_template* verisi silinir.

DROP TABLE IF EXISTS menu_template_items;
DROP TABLE IF EXISTS menu_template_categories;
DROP TABLE IF EXISTS menu_templates;
DROP TABLE IF EXISTS catalog_items;
DROP TABLE IF EXISTS catalog_categories;

DROP INDEX IF EXISTS idx_categories_parent;
ALTER TABLE categories DROP COLUMN IF EXISTS parent_id, DROP COLUMN IF EXISTS icon;

-- RPC'yi eski haline döndürmek için 02_menu_sync_rpc.sql dosyasını yeniden çalıştırın
-- (dönüş tipi değiştiği için önce DROP gerekir).
DROP FUNCTION IF EXISTS public.sync_menus_transaction(uuid, jsonb);
