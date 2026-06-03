-- ============================================================================
-- FanFest AI — Migration 001: Core Schema
-- ============================================================================
-- Tables: profiles, businesses, business_members, sports_events
-- Utility: updated_at trigger function, auto-profile creation on signup
-- ============================================================================

-- -------------------------------------------------------
-- 0. Utility: Reusable trigger function for updated_at
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.update_updated_at_column()
  IS 'Automatically sets updated_at to now() on every UPDATE.';

-- -------------------------------------------------------
-- 1. profiles — Extends auth.users with app-specific data
-- -------------------------------------------------------
CREATE TABLE public.profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name   text,
  avatar_url  text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profiles IS 'User profile data. One row per auth.users entry.';

-- Auto-update updated_at
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'avatar_url', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

COMMENT ON FUNCTION public.handle_new_user()
  IS 'Creates a profiles row automatically when a new user signs up via Supabase Auth.';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- -------------------------------------------------------
-- 2. businesses — Registered establishments
-- -------------------------------------------------------
CREATE TABLE public.businesses (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name              text NOT NULL,
  slug              text UNIQUE NOT NULL,
  neighborhood      text NOT NULL,                    -- 'laureles', 'poblado', 'envigado', etc.
  city              text NOT NULL DEFAULT 'Medellín',
  address           text,
  category          text,                             -- 'gastrobar', 'restaurante', 'bar', 'café'
  tone_default      text NOT NULL DEFAULT 'paisa',    -- 'paisa' | 'premium' — maps to frontend toggle
  logo_url          text,
  cover_image_url   text,
  instagram_handle  text,                             -- For automated IG publishing
  facebook_page_id  text,                             -- For Facebook publishing
  whatsapp_number   text,                             -- For WhatsApp Business integration

  -- Plan / Tier (minimal, no billing yet)
  -- Determines feature limits, UX, prompt behavior, and automation rules.
  plan_tier         text NOT NULL DEFAULT 'starter'
                    CHECK (plan_tier IN ('starter', 'pro', 'empresa')),
  plan_status       text NOT NULL DEFAULT 'active'
                    CHECK (plan_status IN ('active', 'trialing', 'past_due', 'suspended', 'cancelled')),
  plan_started_at   timestamptz DEFAULT now(),

  settings          jsonb NOT NULL DEFAULT '{}',      -- Flexible config: hours, preferences, limits
  is_active         boolean NOT NULL DEFAULT true,    -- Soft-delete / suspension flag

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.businesses IS 'Registered businesses/establishments using FanFest AI.';
COMMENT ON COLUMN public.businesses.plan_tier IS 'Product tier: starter (free), pro, empresa. Controls feature gates and limits.';
COMMENT ON COLUMN public.businesses.plan_status IS 'Lifecycle status of the plan. Billing system will manage transitions in a future phase.';
COMMENT ON COLUMN public.businesses.settings IS 'Flexible JSON config: operating hours, notification preferences, API rate limits, etc.';
COMMENT ON COLUMN public.businesses.tone_default IS 'Default tone for AI-generated copy: paisa (local slang) or premium (neutral/formal).';

-- Auto-update updated_at
CREATE TRIGGER trg_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_businesses_neighborhood ON public.businesses (neighborhood);
CREATE INDEX idx_businesses_plan_tier    ON public.businesses (plan_tier);
CREATE INDEX idx_businesses_is_active    ON public.businesses (is_active) WHERE is_active = true;

-- -------------------------------------------------------
-- 3. business_members — User ↔ Business relationship
-- -------------------------------------------------------
CREATE TABLE public.business_members (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id   uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id       uuid NOT NULL REFERENCES public.profiles(id)   ON DELETE CASCADE,
  role          text NOT NULL DEFAULT 'owner'
                CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
  joined_at     timestamptz NOT NULL DEFAULT now(),

  UNIQUE (business_id, user_id)
);

COMMENT ON TABLE public.business_members IS 'Maps users to businesses with role-based access. Enables multi-tenancy.';
COMMENT ON COLUMN public.business_members.role IS 'owner: full control. admin: manage campaigns. editor: create/edit. viewer: read-only.';

-- Indexes
CREATE INDEX idx_business_members_user     ON public.business_members (user_id);
CREATE INDEX idx_business_members_business ON public.business_members (business_id);

-- -------------------------------------------------------
-- 4. sports_events — Live sports events (API-Football)
-- -------------------------------------------------------
CREATE TABLE public.sports_events (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- API-Football alignment: fixture ID is an integer in their API.
  -- Stored as text for flexibility; e.g., "1035142" maps to API-Football fixture endpoint.
  -- Ref: https://www.api-football.com/documentation-v3#tag/Fixtures
  external_event_id  text,
  external_source    text DEFAULT 'api-football',     -- Source identifier for multi-API support

  home_team          text NOT NULL,                    -- e.g., "Atlético Nacional"
  away_team          text NOT NULL,                    -- e.g., "Independiente Medellín"
  home_team_logo     text,                             -- URL to team crest
  away_team_logo     text,                             -- URL to team crest
  league             text,                             -- e.g., "Liga BetPlay Dimayor"
  season             text,                             -- e.g., "2026-I"
  venue              text,                             -- e.g., "Estadio Atanasio Girardot"

  status             text NOT NULL DEFAULT 'scheduled'
                     CHECK (status IN (
                       'scheduled',   -- Programado
                       'live',        -- En vivo (1T o 2T)
                       'halftime',    -- Medio tiempo
                       'finished',    -- Finalizado
                       'extra_time',  -- Tiempo extra
                       'penalties',   -- Penales
                       'postponed',   -- Aplazado
                       'cancelled',   -- Cancelado
                       'suspended'    -- Suspendido
                     )),

  home_score         integer NOT NULL DEFAULT 0,
  away_score         integer NOT NULL DEFAULT 0,
  match_minute       integer NOT NULL DEFAULT 0,

  -- Rich event data: goals detail, cards, lineups, statistics
  event_metadata     jsonb NOT NULL DEFAULT '{}',

  starts_at          timestamptz NOT NULL,             -- Scheduled kick-off time
  updated_at         timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.sports_events IS 'Sports events tracked in real-time. Primary source: API-Football.';
COMMENT ON COLUMN public.sports_events.external_event_id IS 'API-Football fixture ID. Used to sync live match data.';
COMMENT ON COLUMN public.sports_events.event_metadata IS 'Detailed event data: goals array, cards, substitutions, match statistics.';

-- Auto-update updated_at
CREATE TRIGGER trg_sports_events_updated_at
  BEFORE UPDATE ON public.sports_events
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_sports_events_status       ON public.sports_events (status);
CREATE INDEX idx_sports_events_starts_at    ON public.sports_events (starts_at DESC);
CREATE INDEX idx_sports_events_external_id  ON public.sports_events (external_event_id)
  WHERE external_event_id IS NOT NULL;
