-- ============================================================================
-- FanFest AI — Migration 003: Row Level Security (RLS) Policies
-- ============================================================================
-- Enables RLS on all tables and defines access policies.
-- Multi-tenant isolation: each business only sees its own data.
-- Depends on: 001_schema_core.sql, 002_schema_campaigns.sql
-- ============================================================================

-- -------------------------------------------------------
-- Helper function: Check if current user belongs to a business
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_member_of(target_business_id uuid)
RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.business_members
    WHERE business_id = target_business_id
      AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

COMMENT ON FUNCTION public.is_member_of(uuid)
  IS 'Returns true if the current authenticated user is a member of the given business.';

-- -------------------------------------------------------
-- Helper function: Get all business IDs for current user
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.user_business_ids()
RETURNS SETOF uuid AS $$
  SELECT business_id
  FROM public.business_members
  WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '';

COMMENT ON FUNCTION public.user_business_ids()
  IS 'Returns the set of business IDs the current user belongs to.';

-- ============================================================
-- 1. profiles
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Users can read their own profile
CREATE POLICY profiles_select_own ON public.profiles
  FOR SELECT USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY profiles_update_own ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Profiles are created automatically via trigger (no INSERT policy for users)
-- Service role can always bypass RLS

-- ============================================================
-- 2. businesses
-- ============================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Members can view their businesses
CREATE POLICY businesses_select_member ON public.businesses
  FOR SELECT USING (
    public.is_member_of(id)
  );

-- Only owners can update business settings
CREATE POLICY businesses_update_owner ON public.businesses
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- Any authenticated user can create a new business (they become owner via app logic)
CREATE POLICY businesses_insert_authenticated ON public.businesses
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Only owners can delete (soft-delete preferred, but policy exists for hard-delete)
CREATE POLICY businesses_delete_owner ON public.businesses
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- ============================================================
-- 3. business_members
-- ============================================================
ALTER TABLE public.business_members ENABLE ROW LEVEL SECURITY;

-- Members can see other members of their businesses
CREATE POLICY business_members_select ON public.business_members
  FOR SELECT USING (
    public.is_member_of(business_id)
  );

-- Only owners/admins can add members
CREATE POLICY business_members_insert ON public.business_members
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members existing
      WHERE existing.business_id = business_id
        AND existing.user_id = auth.uid()
        AND existing.role IN ('owner', 'admin')
    )
    -- OR it's the first member (owner creating the business)
    OR NOT EXISTS (
      SELECT 1 FROM public.business_members existing
      WHERE existing.business_id = business_id
    )
  );

-- Only owners can update member roles
CREATE POLICY business_members_update ON public.business_members
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.business_members existing
      WHERE existing.business_id = business_id
        AND existing.user_id = auth.uid()
        AND existing.role = 'owner'
    )
  );

-- Only owners can remove members (and members can remove themselves)
CREATE POLICY business_members_delete ON public.business_members
  FOR DELETE USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM public.business_members existing
      WHERE existing.business_id = business_id
        AND existing.user_id = auth.uid()
        AND existing.role = 'owner'
    )
  );

-- ============================================================
-- 4. sports_events — PUBLIC READ, restricted write
-- ============================================================
ALTER TABLE public.sports_events ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read sports events (shared data)
CREATE POLICY sports_events_select_public ON public.sports_events
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Only service_role (n8n, edge functions) can insert/update/delete sports events.
-- No user-facing INSERT/UPDATE/DELETE policies are created.
-- The service_role key bypasses RLS entirely.

-- ============================================================
-- 5. promotions
-- ============================================================
ALTER TABLE public.promotions ENABLE ROW LEVEL SECURITY;

-- Members can view their business's promotions
CREATE POLICY promotions_select ON public.promotions
  FOR SELECT USING (
    public.is_member_of(business_id)
  );

-- Owners/admins/editors can create promotions
CREATE POLICY promotions_insert ON public.promotions
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = promotions.business_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Owners/admins/editors can update promotions
CREATE POLICY promotions_update ON public.promotions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = promotions.business_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Only owners can delete promotions
CREATE POLICY promotions_delete ON public.promotions
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = promotions.business_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 6. campaigns
-- ============================================================
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Members can view their business's campaigns
CREATE POLICY campaigns_select ON public.campaigns
  FOR SELECT USING (
    public.is_member_of(business_id)
  );

-- Owners/admins/editors can create campaigns
CREATE POLICY campaigns_insert ON public.campaigns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = campaigns.business_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Owners/admins/editors can update campaigns (approve, change status, etc.)
CREATE POLICY campaigns_update ON public.campaigns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = campaigns.business_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin', 'editor')
    )
  );

-- Only owners/admins can delete campaigns
CREATE POLICY campaigns_delete ON public.campaigns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.business_members
      WHERE business_id = campaigns.business_id
        AND user_id = auth.uid()
        AND role IN ('owner', 'admin')
    )
  );

-- ============================================================
-- 7. ai_generations — Access via campaign → business
-- ============================================================
ALTER TABLE public.ai_generations ENABLE ROW LEVEL SECURITY;

-- Members can view AI generations for their campaigns
CREATE POLICY ai_generations_select ON public.ai_generations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
        AND public.is_member_of(c.business_id)
    )
  );

-- Insert is done by service_role (Edge Functions / n8n) and by editors+
CREATE POLICY ai_generations_insert ON public.ai_generations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.business_members bm ON bm.business_id = c.business_id
      WHERE c.id = campaign_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Update (e.g., set quality_score, is_selected)
CREATE POLICY ai_generations_update ON public.ai_generations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.business_members bm ON bm.business_id = c.business_id
      WHERE c.id = campaign_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin', 'editor')
    )
  );

-- ============================================================
-- 8. publications — Access via campaign → business
-- ============================================================
ALTER TABLE public.publications ENABLE ROW LEVEL SECURITY;

-- Members can view publications for their campaigns
CREATE POLICY publications_select ON public.publications
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
        AND public.is_member_of(c.business_id)
    )
  );

-- Editors+ can create publications
CREATE POLICY publications_insert ON public.publications
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.business_members bm ON bm.business_id = c.business_id
      WHERE c.id = campaign_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin', 'editor')
    )
  );

-- Update publication status
CREATE POLICY publications_update ON public.publications
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.business_members bm ON bm.business_id = c.business_id
      WHERE c.id = campaign_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin', 'editor')
    )
  );

-- ============================================================
-- 9. campaign_analytics — Access via campaign → business
-- ============================================================
ALTER TABLE public.campaign_analytics ENABLE ROW LEVEL SECURITY;

-- Members can view analytics for their campaigns
CREATE POLICY analytics_select ON public.campaign_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      WHERE c.id = campaign_id
        AND public.is_member_of(c.business_id)
    )
  );

-- Insert/update is primarily done by service_role (webhook from platform APIs)
-- But editors+ can also manually adjust
CREATE POLICY analytics_insert ON public.campaign_analytics
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.business_members bm ON bm.business_id = c.business_id
      WHERE c.id = campaign_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin', 'editor')
    )
  );

CREATE POLICY analytics_update ON public.campaign_analytics
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.campaigns c
      JOIN public.business_members bm ON bm.business_id = c.business_id
      WHERE c.id = campaign_id
        AND bm.user_id = auth.uid()
        AND bm.role IN ('owner', 'admin')
    )
  );
