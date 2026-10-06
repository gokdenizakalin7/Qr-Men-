-- ============================================
-- Rollback 01: RLS ve Şema Güncellemelerini Geri Al
-- ============================================

-- 2.1 organizations
CREATE POLICY "org_public_select" ON organizations FOR SELECT USING (true);

-- 2.5 organizations
DROP POLICY IF EXISTS "org_insert" ON organizations;
CREATE POLICY "Users can create organizations" ON organizations FOR INSERT WITH CHECK (true);

-- 2.2 qr_tables
DROP POLICY IF EXISTS "qr_tables_select" ON qr_tables;
DROP POLICY IF EXISTS "qr_tables_insert" ON qr_tables;
DROP POLICY IF EXISTS "qr_tables_update" ON qr_tables;
DROP POLICY IF EXISTS "qr_tables_delete" ON qr_tables;
ALTER TABLE qr_tables DISABLE ROW LEVEL SECURITY;
-- (updated_at sütununu silmiyoruz, veri kaybı olmaması için)

-- 2.3 menu_views
DROP POLICY IF EXISTS "views_insert" ON menu_views;
CREATE POLICY "views_insert" ON menu_views FOR INSERT WITH CHECK (true);

-- 2.4 handle_new_user
-- Orijinal haline geri döndürüyoruz
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    org_id uuid;
BEGIN
    INSERT INTO public.organizations (
        name,
        subdomain,
        owner_name
    ) VALUES (
        coalesce(new.raw_user_meta_data->>'business_name', 'Restoranım'),
        coalesce(
            lower(regexp_replace(new.raw_user_meta_data->>'business_name', '[^a-zA-Z0-9]', '-', 'g')),
            'restoran-' || substr(new.id::text, 1, 8)
        ),
        coalesce(new.raw_user_meta_data->>'owner_name', '')
    )
    RETURNING id INTO org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id, new.id, 'owner');

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.7 organization_members
ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS chk_role;

-- 2.8 Storage
DROP POLICY IF EXISTS "Allow members to upload" ON storage.objects;
DROP POLICY IF EXISTS "Allow members to update" ON storage.objects;
DROP POLICY IF EXISTS "Allow members to delete" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to read" ON storage.objects;

-- 2.9 categories ve items
DROP POLICY IF EXISTS "categories_public_select" ON categories;
CREATE POLICY "categories_public_select" ON categories FOR SELECT
    USING (
        menu_id IN (SELECT id FROM menus WHERE is_listed = true)
    );

DROP POLICY IF EXISTS "items_public_select" ON items;
CREATE POLICY "items_public_select" ON items FOR SELECT
    USING (
        category_id IN (
            SELECT c.id FROM categories c
            JOIN menus m ON c.menu_id = m.id
            WHERE m.is_listed = true
        )
    );

-- BİTTİ
