-- ============================================================================
-- Migration: Security Lint Fixes
-- Description: Addresses Supabase security lint warnings for functions
-- ============================================================================

-- 1. Fix: "update_updated_at_column has a mutable search_path"
-- Add SET search_path = '' to prevent search path hijacking
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- 2. Fix: "Public/Signed-In Users Can Execute SECURITY DEFINER Function" for Triggers
-- Trigger functions should NEVER be executed directly by users via the API.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_fn_trigger_campaign_publish() FROM PUBLIC, anon, authenticated;

-- 3. Fix: "Public Can Execute SECURITY DEFINER Function" for RLS Helpers
-- These functions are needed for RLS, so 'authenticated' users must be able to execute them 
-- (implicitly during queries), but 'anon' and 'PUBLIC' should not.
REVOKE EXECUTE ON FUNCTION public.is_member_of(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.user_business_ids() FROM PUBLIC, anon;

-- Also apply SET search_path = '' to all SECURITY DEFINER functions for best practices
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.is_member_of(uuid) SET search_path = '';
ALTER FUNCTION public.trg_fn_trigger_campaign_publish() SET search_path = '';
ALTER FUNCTION public.user_business_ids() SET search_path = '';
