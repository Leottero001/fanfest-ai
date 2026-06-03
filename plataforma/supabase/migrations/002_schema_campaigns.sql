-- ============================================================================
-- FanFest AI — Migration 002: Campaign Engine Schema
-- ============================================================================
-- Tables: promotions, campaigns, ai_generations, publications, campaign_analytics
-- Depends on: 001_schema_core.sql
-- ============================================================================

-- -------------------------------------------------------
-- 1. promotions — Reusable promotion templates per business
-- -------------------------------------------------------
CREATE TABLE public.promotions (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id       uuid NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,

  name              text NOT NULL,                     -- e.g., "2x1 Cerveza Águila"
  description       text,                              -- Extended description for the AI prompt
  discount_text     text,                              -- Short text for the poster, e.g., "2x1 en cerveza"

  -- What event triggers this promotion automatically?
  trigger_type      text NOT NULL DEFAULT 'manual'
                    CHECK (trigger_type IN (
                      'goal_home',     -- Goal by the local/home team
                      'goal_away',     -- Goal by the visiting team
                      'goal_any',      -- Any goal
                      'halftime',      -- Halftime whistle
                      'match_start',   -- Match kicks off
                      'match_end',     -- Final whistle
                      'manual'         -- Manually triggered by business owner
                    )),

  duration_minutes  integer NOT NULL DEFAULT 30,       -- How long the promo lasts after trigger
  is_active         boolean NOT NULL DEFAULT true,

  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.promotions IS 'Promotion templates configured by business owners. Linked to campaign triggers.';
COMMENT ON COLUMN public.promotions.trigger_type IS 'Event that auto-triggers this promotion. Maps to sports_events status changes.';
COMMENT ON COLUMN public.promotions.duration_minutes IS 'Duration of the promotion window after trigger. Displayed in generated copy.';

-- Auto-update updated_at
CREATE TRIGGER trg_promotions_updated_at
  BEFORE UPDATE ON public.promotions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_promotions_business   ON public.promotions (business_id);
CREATE INDEX idx_promotions_trigger    ON public.promotions (trigger_type) WHERE is_active = true;

-- -------------------------------------------------------
-- 2. campaigns — Central unit: a marketing campaign instance
-- -------------------------------------------------------
CREATE TABLE public.campaigns (
  id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id           uuid NOT NULL REFERENCES public.businesses(id)    ON DELETE CASCADE,
  sports_event_id       uuid          REFERENCES public.sports_events(id) ON DELETE SET NULL,
  promotion_id          uuid          REFERENCES public.promotions(id)    ON DELETE SET NULL,

  -- Campaign metadata
  campaign_type         text NOT NULL DEFAULT 'auto'
                        CHECK (campaign_type IN ('auto', 'manual', 'scheduled')),
  trigger_event         text,                           -- e.g., 'goal_home', 'halftime' — what triggered it

  status                text NOT NULL DEFAULT 'draft'
                        CHECK (status IN (
                          'draft',              -- Initial state
                          'generating',         -- AI is generating copy
                          'generated',          -- Copy generated, awaiting review
                          'pending_approval',   -- Sent to owner for approval
                          'approved',           -- Owner approved
                          'publishing',         -- In the process of posting
                          'published',          -- Successfully posted to platform(s)
                          'failed',             -- Publication failed
                          'expired',            -- Promotion window passed
                          'cancelled'           -- Manually cancelled
                        )),

  -- Contextual configuration for AI generation
  tone                  text,                           -- Override: 'paisa' | 'premium'
  neighborhood_context  text,                           -- Neighborhood used for contextual copy

  -- Snapshot of the game state at the moment of generation.
  -- Enables audit trail: why did the AI generate this specific copy?
  -- Example: {"home_team":"Nacional","away_team":"DIM","score":"2-0","minute":72,"event":"goal_home"}
  context_snapshot      jsonb NOT NULL DEFAULT '{}',

  created_at            timestamptz NOT NULL DEFAULT now(),
  approved_at           timestamptz,                    -- When owner clicked "Aprobar y Publicar"
  expires_at            timestamptz,                    -- When the campaign/promotion window closes
  updated_at            timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.campaigns IS 'A marketing campaign instance. The central entity linking events, promotions, AI output, and publications.';
COMMENT ON COLUMN public.campaigns.context_snapshot IS 'Frozen game state at generation time. Enables debugging and prompt auditing.';
COMMENT ON COLUMN public.campaigns.trigger_event IS 'The specific event type that triggered this campaign creation.';

-- Auto-update updated_at
CREATE TRIGGER trg_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_campaigns_business     ON public.campaigns (business_id);
CREATE INDEX idx_campaigns_status       ON public.campaigns (status);
CREATE INDEX idx_campaigns_event        ON public.campaigns (sports_event_id) WHERE sports_event_id IS NOT NULL;
CREATE INDEX idx_campaigns_created_at   ON public.campaigns (created_at DESC);

-- -------------------------------------------------------
-- 3. ai_generations — Every AI call and its output
-- -------------------------------------------------------
CREATE TABLE public.ai_generations (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,

  -- Prompt tracking
  prompt_system       text,                             -- System prompt sent to the model
  prompt_user         text NOT NULL,                    -- User/context prompt
  response_text       text,                             -- Generated copy/content

  -- Model metadata
  model               text NOT NULL DEFAULT 'gemini-2.0-flash',
  prompt_tokens       integer,
  completion_tokens   integer,
  total_tokens        integer,
  estimated_cost_usd  numeric(10, 6) DEFAULT 0,        -- Estimated API cost for this call

  -- Quality tracking
  quality_score       smallint CHECK (quality_score BETWEEN 1 AND 5),  -- Owner rating (1-5)
  is_selected         boolean NOT NULL DEFAULT false,   -- Is this the copy chosen for publication?

  generated_at        timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.ai_generations IS 'Every AI generation call. Multiple generations per campaign enable "Regenerar con Gemini" without losing history.';
COMMENT ON COLUMN public.ai_generations.is_selected IS 'True for the generation chosen for publication. Only one per campaign should be true.';
COMMENT ON COLUMN public.ai_generations.estimated_cost_usd IS 'Estimated cost based on token usage and model pricing. Enables cost tracking per business/plan.';

-- Indexes
CREATE INDEX idx_ai_generations_campaign  ON public.ai_generations (campaign_id);
CREATE INDEX idx_ai_generations_selected  ON public.ai_generations (campaign_id)
  WHERE is_selected = true;

-- -------------------------------------------------------
-- 4. publications — Posts to social media platforms
-- -------------------------------------------------------
CREATE TABLE public.publications (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid NOT NULL REFERENCES public.campaigns(id)       ON DELETE CASCADE,
  ai_generation_id    uuid          REFERENCES public.ai_generations(id)  ON DELETE SET NULL,

  -- Platform info
  platform            text NOT NULL
                      CHECK (platform IN (
                        'instagram',         -- Priority: Instagram Business API
                        'facebook',          -- Facebook Pages API
                        'whatsapp',          -- WhatsApp Business API
                        'tiktok',            -- Future phase
                        'x'                  -- Future phase
                      )),
  platform_post_id    text,                             -- ID of the post on the platform (for tracking)
  platform_url        text,                             -- Direct URL to the published post

  status              text NOT NULL DEFAULT 'pending'
                      CHECK (status IN (
                        'pending',       -- Queued for publishing
                        'publishing',    -- API call in progress
                        'published',     -- Successfully posted
                        'failed',        -- API error
                        'deleted',       -- Post was removed
                        'scheduled'      -- Scheduled for future publication
                      )),

  media_url           text,                             -- URL of the generated image/video
  media_type          text DEFAULT 'image'
                      CHECK (media_type IN ('image', 'video', 'carousel', 'story', 'reel')),
  caption_text        text,                             -- Final caption as published (may differ from AI output)
  error_message       text,                             -- Error details if status = 'failed'

  published_at        timestamptz,
  scheduled_for       timestamptz,                      -- For scheduled posts
  created_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.publications IS 'Individual social media posts. One campaign can publish to multiple platforms.';
COMMENT ON COLUMN public.publications.media_type IS 'Type of media content: image, video, carousel, story, or reel.';

-- Indexes
CREATE INDEX idx_publications_campaign  ON public.publications (campaign_id);
CREATE INDEX idx_publications_platform  ON public.publications (platform, status);
CREATE INDEX idx_publications_status    ON public.publications (status)
  WHERE status IN ('pending', 'publishing', 'scheduled');

-- -------------------------------------------------------
-- 5. campaign_analytics — Engagement metrics per publication
-- -------------------------------------------------------
CREATE TABLE public.campaign_analytics (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid NOT NULL REFERENCES public.campaigns(id)     ON DELETE CASCADE,
  publication_id      uuid          REFERENCES public.publications(id)  ON DELETE SET NULL,

  -- Engagement metrics (fetched from platform APIs)
  impressions         integer NOT NULL DEFAULT 0,
  reach               integer NOT NULL DEFAULT 0,
  likes               integer NOT NULL DEFAULT 0,
  comments            integer NOT NULL DEFAULT 0,
  shares              integer NOT NULL DEFAULT 0,
  saves               integer NOT NULL DEFAULT 0,
  link_clicks         integer NOT NULL DEFAULT 0,
  profile_visits      integer NOT NULL DEFAULT 0,

  -- Calculated / derived metrics
  engagement_rate     numeric(7, 4) DEFAULT 0,          -- (likes+comments+shares+saves) / reach * 100
  estimated_revenue   numeric(12, 2) DEFAULT 0,         -- Attributed revenue estimate (COP)

  -- Reaction time: seconds between event trigger and publication
  reaction_time_secs  integer,

  fetched_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.campaign_analytics IS 'Engagement and performance metrics fetched from social media platforms.';
COMMENT ON COLUMN public.campaign_analytics.engagement_rate IS 'Engagement percentage: (likes+comments+shares+saves) / reach * 100.';
COMMENT ON COLUMN public.campaign_analytics.reaction_time_secs IS 'Seconds between the sports event trigger and the actual publication. Key SaaS metric.';

-- Auto-update updated_at
CREATE TRIGGER trg_campaign_analytics_updated_at
  BEFORE UPDATE ON public.campaign_analytics
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Indexes
CREATE INDEX idx_analytics_campaign     ON public.campaign_analytics (campaign_id);
CREATE INDEX idx_analytics_publication  ON public.campaign_analytics (publication_id)
  WHERE publication_id IS NOT NULL;
