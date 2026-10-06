-- ============================================
-- Migration 01: RLS ve Şema Güncellemeleri
-- ============================================

-- 2.1 organizations: Herkese açık okumayı kaldır (sızıntıyı önle)
DROP POLICY IF EXISTS "org_public_select" ON organizations;
DROP POLICY IF EXISTS "Users can view organizations" ON organizations;
-- "org_select" (kendi organizasyonunu görme) kuralı zaten mevcut.

-- 2.5 organizations: insert politikasını düzelt (sadece auth kullanıcıları)
DROP POLICY IF EXISTS "Users can create organizations" ON organizations;
CREATE POLICY "org_insert" ON organizations FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- 2.2 qr_tables: RLS aç ve üye politikaları ekle
ALTER TABLE qr_tables ADD COLUMN IF NOT EXISTS updated_at timestamp with time zone default now();
ALTER TABLE qr_tables ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qr_tables_select" ON qr_tables;
CREATE POLICY "qr_tables_select" ON qr_tables FOR SELECT
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "qr_tables_insert" ON qr_tables;
CREATE POLICY "qr_tables_insert" ON qr_tables FOR INSERT
    WITH CHECK (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "qr_tables_update" ON qr_tables;
CREATE POLICY "qr_tables_update" ON qr_tables FOR UPDATE
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

DROP POLICY IF EXISTS "qr_tables_delete" ON qr_tables;
CREATE POLICY "qr_tables_delete" ON qr_tables FOR DELETE
    USING (organization_id IN (SELECT organization_id FROM organization_members WHERE user_id = auth.uid()));

-- 2.3 menu_views: insert politikasını sadece yayındaki menülerle sınırla
DROP POLICY IF EXISTS "views_insert" ON menu_views;
CREATE POLICY "views_insert" ON menu_views FOR INSERT
    WITH CHECK (menu_id IN (SELECT id FROM menus WHERE is_listed = true));

-- 2.4 handle_new_user: Subdomain çakışma ve normalizasyon çözümü
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
    org_id uuid;
    base_subdomain text;
    final_subdomain text;
    counter integer := 1;
BEGIN
    -- Temel subdomain'i Türkçe karakterleri düzeltmeden önce küçük harfe çevir
    base_subdomain := coalesce(
        lower(regexp_replace(new.raw_user_meta_data->>'business_name', '[^a-zA-Z0-9]', '-', 'g')),
        'restoran-' || substr(new.id::text, 1, 8)
    );
    
    -- Subdomain boş kalamaz
    IF base_subdomain = '' OR base_subdomain IS NULL THEN
        base_subdomain := 'restoran-' || substr(new.id::text, 1, 8);
    END IF;

    final_subdomain := base_subdomain;
    
    -- Çakışma kontrolü
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE subdomain = final_subdomain) LOOP
        final_subdomain := base_subdomain || '-' || counter;
        counter := counter + 1;
    END LOOP;

    -- Yeni organizasyon oluştur
    INSERT INTO public.organizations (
        name,
        subdomain,
        owner_name
    ) VALUES (
        coalesce(new.raw_user_meta_data->>'business_name', 'Restoranım'),
        final_subdomain,
        coalesce(new.raw_user_meta_data->>'owner_name', '')
    )
    RETURNING id INTO org_id;

    -- Kullanıcıyı owner olarak ekle
    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id, new.id, 'owner');

    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2.7 organization_members: Rol kısıtı
-- Tabloda varsa uyumsuz rolleri owner'a çevirelim önce
UPDATE organization_members SET role = 'owner' WHERE role NOT IN ('owner', 'admin', 'staff');
ALTER TABLE organization_members DROP CONSTRAINT IF EXISTS chk_role;
ALTER TABLE organization_members ADD CONSTRAINT chk_role CHECK (role IN ('owner', 'admin', 'staff'));

-- 2.8 Storage: menu-images kova (bucket) politikaları
-- Storage eklentisi Supabase'de hazır, eğer bucket yoksa dashboard'dan oluşturulmalı
-- "menu-images" bucket'ının Public olduğunu varsayıyoruz
CREATE POLICY "Allow members to upload" ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'menu-images' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Allow members to update" ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'menu-images' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Allow members to delete" ON storage.objects FOR DELETE
    USING (
        bucket_id = 'menu-images' AND
        auth.uid() IS NOT NULL
    );

CREATE POLICY "Allow public to read" ON storage.objects FOR SELECT
    USING (bucket_id = 'menu-images');

-- 2.9 categories ve items: is_active / is_available filtreleri (Public okumada)
DROP POLICY IF EXISTS "categories_public_select" ON categories;
CREATE POLICY "categories_public_select" ON categories FOR SELECT
    USING (
        is_active = true AND
        menu_id IN (SELECT id FROM menus WHERE is_listed = true)
    );

DROP POLICY IF EXISTS "items_public_select" ON items;
CREATE POLICY "items_public_select" ON items FOR SELECT
    USING (
        is_available = true AND
        category_id IN (
            SELECT c.id FROM categories c
            JOIN menus m ON c.menu_id = m.id
            WHERE m.is_listed = true AND c.is_active = true
        )
    );

-- BİTTİ
