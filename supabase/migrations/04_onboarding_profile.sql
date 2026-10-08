-- ============================================
-- Migration 04: Onboarding profil alanları + handle_new_user düzeltmesi
-- Supabase SQL Editor'de çalıştırın.
-- ============================================

ALTER TABLE organizations
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS instagram_handle text,
  ADD COLUMN IF NOT EXISTS whatsapp_number text,
  ADD COLUMN IF NOT EXISTS google_maps_url text,
  ADD COLUMN IF NOT EXISTS google_review_url text,
  ADD COLUMN IF NOT EXISTS working_hours text,
  ADD COLUMN IF NOT EXISTS onboarding_step text,
  ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- Mevcut restoranlar sihirbaza zorlanmaz
UPDATE organizations SET onboarding_completed_at = now()
WHERE onboarding_completed_at IS NULL;

-- Yeni kullanıcı: Türkçe karakter normalizasyonu, benzersiz subdomain
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    org_id uuid;
    raw_name text;
    base_subdomain text;
    final_subdomain text;
    counter integer := 1;
BEGIN
    raw_name := coalesce(new.raw_user_meta_data->>'business_name', '');

    base_subdomain := lower(translate(raw_name, 'ğüşıöçĞÜŞİÖÇ', 'gusiocGUSIOC'));
    base_subdomain := regexp_replace(base_subdomain, '[^a-z0-9]+', '-', 'g');
    base_subdomain := trim(both '-' from base_subdomain);
    base_subdomain := left(base_subdomain, 40);

    IF base_subdomain IS NULL OR base_subdomain = '' THEN
        base_subdomain := 'restoran-' || substr(new.id::text, 1, 8);
    END IF;

    final_subdomain := base_subdomain;
    WHILE EXISTS (SELECT 1 FROM public.organizations WHERE subdomain = final_subdomain) LOOP
        final_subdomain := base_subdomain || '-' || counter;
        counter := counter + 1;
    END LOOP;

    INSERT INTO public.organizations (name, subdomain, owner_name)
    VALUES (
        coalesce(nullif(raw_name, ''), 'Restoranım'),
        final_subdomain,
        coalesce(new.raw_user_meta_data->>'owner_name', '')
    )
    RETURNING id INTO org_id;

    INSERT INTO public.organization_members (organization_id, user_id, role)
    VALUES (org_id, new.id, 'owner');

    RETURN new;
END;
$$;

-- Tetikleyiciyi kesin olarak kur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
