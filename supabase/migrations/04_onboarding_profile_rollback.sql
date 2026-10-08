-- Migration 04 geri alma (handle_new_user eski sürüme dönmez; 01'i yeniden çalıştırın)
ALTER TABLE organizations
  DROP COLUMN IF EXISTS business_type,
  DROP COLUMN IF EXISTS instagram_handle,
  DROP COLUMN IF EXISTS whatsapp_number,
  DROP COLUMN IF EXISTS google_maps_url,
  DROP COLUMN IF EXISTS google_review_url,
  DROP COLUMN IF EXISTS working_hours,
  DROP COLUMN IF EXISTS onboarding_step,
  DROP COLUMN IF EXISTS onboarding_completed_at;
