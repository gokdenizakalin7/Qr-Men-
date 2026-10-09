-- ============================================
-- Migration 05: Katalog/şablon tabloları + sync_menus_transaction düzeltmesi
-- Supabase SQL Editor'de çalıştırın. Geri alma: 05_catalog_templates_and_sync_fix_rollback.sql
--
-- Neden:
--  * Canlıdaki RPC `void` döndürüyordu (migration 03 uygulanmamış) ve
--    allergens / calories / tags alanlarını kaydetmiyordu.
--  * Global master kategori ağacı + işletme tipi şablonları için tablolar yoktu.
-- ============================================

-- --------------------------------------------
-- 1. İşletme menüsü: kategori ağacı + ikon (geriye dönük uyumlu, nullable)
-- --------------------------------------------
ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES categories(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS icon text;

CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_items_category ON items(category_id);

-- --------------------------------------------
-- 2. Global katalog (organization_id YOK, tüm işletmeler için ortak)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS catalog_categories (
    id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    parent_id     uuid REFERENCES catalog_categories(id) ON DELETE CASCADE,
    slug          text NOT NULL UNIQUE,
    name          text NOT NULL,
    icon          text,
    display_order integer NOT NULL DEFAULT 0,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz DEFAULT now(),
    updated_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_catalog_categories_parent ON catalog_categories(parent_id);

CREATE TABLE IF NOT EXISTS catalog_items (
    id                   uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug                 text NOT NULL UNIQUE,
    primary_category_id  uuid NOT NULL REFERENCES catalog_categories(id) ON DELETE RESTRICT,
    name                 text NOT NULL,
    description          text DEFAULT '',
    price_suggested      text DEFAULT '0',   -- items.price ile aynı: metin
    image_url            text DEFAULT '',
    allergens            text[] DEFAULT '{}',
    calories             integer,
    tags                 text[] DEFAULT '{}',
    display_order        integer NOT NULL DEFAULT 0,
    is_active            boolean NOT NULL DEFAULT true,
    created_at           timestamptz DEFAULT now(),
    updated_at           timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_catalog_items_category ON catalog_items(primary_category_id);
CREATE INDEX IF NOT EXISTS idx_catalog_items_tags ON catalog_items USING gin(tags);

-- --------------------------------------------
-- 3. Şablonlar (master'dan seçilmiş alt küme)
-- --------------------------------------------
CREATE TABLE IF NOT EXISTS menu_templates (
    id            uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug          text NOT NULL UNIQUE,         -- business-types.ts içindeki templateId ile eşleşir
    business_type text,                         -- BusinessTypeId: cafe, kebab, pub, ...
    name          text NOT NULL,
    tagline       text DEFAULT '',
    venue_type    text DEFAULT '',
    icon          text DEFAULT '',
    color         text DEFAULT '#e11d48',
    cover_image   text DEFAULT '',
    description   text DEFAULT '',
    display_order integer NOT NULL DEFAULT 0,
    is_active     boolean NOT NULL DEFAULT true,
    created_at    timestamptz DEFAULT now(),
    updated_at    timestamptz DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_menu_templates_business_type ON menu_templates(business_type);

CREATE TABLE IF NOT EXISTS menu_template_categories (
    template_id   uuid NOT NULL REFERENCES menu_templates(id) ON DELETE CASCADE,
    category_id   uuid NOT NULL REFERENCES catalog_categories(id) ON DELETE CASCADE,
    display_order integer NOT NULL DEFAULT 0,
    PRIMARY KEY (template_id, category_id)
);

CREATE TABLE IF NOT EXISTS menu_template_items (
    template_id    uuid NOT NULL REFERENCES menu_templates(id) ON DELETE CASCADE,
    item_id        uuid NOT NULL REFERENCES catalog_items(id) ON DELETE CASCADE,
    display_order  integer NOT NULL DEFAULT 0,
    price_override text,                        -- NULL ise catalog_items.price_suggested
    PRIMARY KEY (template_id, item_id)
);
CREATE INDEX IF NOT EXISTS idx_mti_item ON menu_template_items(item_id);

-- --------------------------------------------
-- 4. RLS: giriş yapmış kullanıcılar aktif kayıtları okur, yazma yalnızca service role
-- --------------------------------------------
ALTER TABLE catalog_categories       ENABLE ROW LEVEL SECURITY;
ALTER TABLE catalog_items            ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_templates           ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_template_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_template_items      ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "catalog_categories_read" ON catalog_categories;
CREATE POLICY "catalog_categories_read" ON catalog_categories FOR SELECT
    TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "catalog_items_read" ON catalog_items;
CREATE POLICY "catalog_items_read" ON catalog_items FOR SELECT
    TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "menu_templates_read" ON menu_templates;
CREATE POLICY "menu_templates_read" ON menu_templates FOR SELECT
    TO authenticated USING (is_active = true);

DROP POLICY IF EXISTS "menu_template_categories_read" ON menu_template_categories;
CREATE POLICY "menu_template_categories_read" ON menu_template_categories FOR SELECT
    TO authenticated USING (true);

DROP POLICY IF EXISTS "menu_template_items_read" ON menu_template_items;
CREATE POLICY "menu_template_items_read" ON menu_template_items FOR SELECT
    TO authenticated USING (true);

-- --------------------------------------------
-- 5. sync_menus_transaction: idMap döndürür; allergens/calories/tags/parent_id/icon yazar
--    Dönüş tipi değiştiği için önce DROP gerekir.
--    Kategoriler dizide ebeveyn -> çocuk sırasıyla gelmelidir (parent_id istemci id'si).
-- --------------------------------------------
DROP FUNCTION IF EXISTS public.sync_menus_transaction(uuid, jsonb);

CREATE FUNCTION public.sync_menus_transaction(p_org_id uuid, p_menus jsonb)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_menu          jsonb;
    v_menu_id       uuid;
    v_cat           jsonb;
    v_cat_id        uuid;
    v_item          jsonb;
    v_is_new        boolean;
    v_id_map        jsonb := '{}'::jsonb;
    v_cat_map       jsonb;
    v_client_id     text;
    v_cat_client_id text;
    v_parent_client text;
    v_parent_id     uuid;
BEGIN
    FOR v_menu IN SELECT * FROM jsonb_array_elements(COALESCE(p_menus, '[]'::jsonb))
    LOOP
        v_client_id := v_menu->>'id';
        v_is_new := v_client_id IS NULL OR v_client_id LIKE 'menu-%';

        IF v_is_new THEN
            INSERT INTO menus (organization_id, name, description, image_url, is_listed, layout)
            VALUES (
                p_org_id,
                COALESCE(v_menu->>'name', 'Menü'),
                COALESCE(v_menu->>'description', ''),
                COALESCE(v_menu->>'image_url', ''),
                COALESCE((v_menu->>'is_listed')::boolean, TRUE),
                COALESCE(v_menu->>'layout', 'grid')
            ) RETURNING id INTO v_menu_id;
        ELSE
            v_menu_id := v_client_id::uuid;
            UPDATE menus
            SET name        = COALESCE(v_menu->>'name', 'Menü'),
                description = COALESCE(v_menu->>'description', ''),
                image_url   = COALESCE(v_menu->>'image_url', ''),
                is_listed   = COALESCE((v_menu->>'is_listed')::boolean, TRUE),
                layout      = COALESCE(v_menu->>'layout', 'grid'),
                updated_at  = now()
            WHERE id = v_menu_id AND organization_id = p_org_id;

            -- Başka işletmenin menüsünü silmeyi önle
            IF NOT FOUND THEN
                RAISE EXCEPTION 'Menu % not found for organization %', v_menu_id, p_org_id
                    USING ERRCODE = '42501';
            END IF;
        END IF;

        IF v_client_id IS NOT NULL THEN
            v_id_map := v_id_map || jsonb_build_object(v_client_id, v_menu_id::text);
        END IF;

        DELETE FROM categories WHERE menu_id = v_menu_id;
        v_cat_map := '{}'::jsonb;

        FOR v_cat IN SELECT * FROM jsonb_array_elements(COALESCE(v_menu->'categories', '[]'::jsonb))
        LOOP
            v_cat_client_id := v_cat->>'id';
            v_parent_client := NULLIF(v_cat->>'parent_id', '');
            v_parent_id := NULL;
            IF v_parent_client IS NOT NULL AND v_cat_map ? v_parent_client THEN
                v_parent_id := (v_cat_map->>v_parent_client)::uuid;
            END IF;

            INSERT INTO categories (menu_id, parent_id, name, description, icon, display_order, is_active)
            VALUES (
                v_menu_id,
                v_parent_id,
                v_cat->>'name',
                COALESCE(v_cat->>'description', ''),
                NULLIF(v_cat->>'icon', ''),
                COALESCE((v_cat->>'display_order')::integer, 0),
                COALESCE((v_cat->>'is_active')::boolean, TRUE)
            ) RETURNING id INTO v_cat_id;

            IF v_cat_client_id IS NOT NULL THEN
                v_cat_map := v_cat_map || jsonb_build_object(v_cat_client_id, v_cat_id::text);
            END IF;

            FOR v_item IN SELECT * FROM jsonb_array_elements(COALESCE(v_cat->'items', '[]'::jsonb))
            LOOP
                INSERT INTO items (
                    category_id, name, description, price, image_url,
                    allergens, calories, tags,
                    is_available, is_featured, display_order
                ) VALUES (
                    v_cat_id,
                    v_item->>'name',
                    COALESCE(v_item->>'description', ''),
                    COALESCE(v_item->>'price', '0'),
                    COALESCE(v_item->>'image_url', ''),
                    CASE WHEN jsonb_typeof(v_item->'allergens') = 'array'
                         THEN ARRAY(SELECT jsonb_array_elements_text(v_item->'allergens'))
                         ELSE '{}'::text[] END,
                    CASE WHEN jsonb_typeof(v_item->'calories') = 'number'
                         THEN (v_item->>'calories')::numeric::integer
                         ELSE NULL END,
                    CASE WHEN jsonb_typeof(v_item->'tags') = 'array'
                         THEN ARRAY(SELECT jsonb_array_elements_text(v_item->'tags'))
                         ELSE '{}'::text[] END,
                    COALESCE((v_item->>'is_available')::boolean, TRUE),
                    COALESCE((v_item->>'is_featured')::boolean, FALSE),
                    COALESCE((v_item->>'display_order')::integer, 0)
                );
            END LOOP;
        END LOOP;
    END LOOP;

    RETURN v_id_map;
END;
$$;

-- API yalnızca service role ile çağırıyor; istemcilerin doğrudan çağırmasını kapat
REVOKE ALL ON FUNCTION public.sync_menus_transaction(uuid, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.sync_menus_transaction(uuid, jsonb) TO service_role;
