-- ============================================================================
-- FanFest AI — Seed Data
-- ============================================================================
-- Populates the database with realistic example data that mirrors the current
-- frontend mock state. Uses deterministic UUIDs for easy reference.
--
-- NOTE: This file does NOT create auth.users entries. The profiles below
-- assume you have created test users in Supabase Auth first (Dashboard or API).
-- Replace the UUIDs below with your actual auth.users IDs.
-- ============================================================================

-- -------------------------------------------------------
-- Configuration: Replace these with your actual auth user IDs
-- -------------------------------------------------------
-- Test User 1: "Juan Botero" (the JB avatar shown in the frontend header)
-- Create this user in Supabase Dashboard → Authentication → Users → Add User
-- Then replace this UUID:
DO $$
DECLARE
  v_user_juan      uuid := '00000000-0000-0000-0000-000000000001';  -- REPLACE with real auth.users ID

  -- Business IDs (deterministic for seed cross-references)
  v_biz_templo     uuid := 'b0000000-0000-0000-0000-000000000001';
  v_biz_fanfest    uuid := 'b0000000-0000-0000-0000-000000000002';
  v_biz_fonda      uuid := 'b0000000-0000-0000-0000-000000000003';

  -- Sports event
  v_event_clasico  uuid := 'e0000000-0000-0000-0000-000000000001';

  -- Promotions
  v_promo_templo   uuid := 'f0000000-0000-0000-0000-000000000001';
  v_promo_fanfest  uuid := 'f0000000-0000-0000-0000-000000000002';
  v_promo_fonda    uuid := 'f0000000-0000-0000-0000-000000000003';

  -- Campaigns
  v_camp_templo    uuid := 'c0000000-0000-0000-0000-000000000001';
  v_camp_fanfest   uuid := 'c0000000-0000-0000-0000-000000000002';

  -- AI Generations
  v_aigen_templo_1 uuid := 'a0000000-0000-0000-0000-000000000001';
  v_aigen_templo_2 uuid := 'a0000000-0000-0000-0000-000000000002';
  v_aigen_fanfest  uuid := 'a0000000-0000-0000-0000-000000000003';

  -- Publications
  v_pub_templo     uuid := 'd0000000-0000-0000-0000-000000000001';

BEGIN

-- -------------------------------------------------------
-- 1. Profile (will be auto-created by trigger if user exists)
-- -------------------------------------------------------
INSERT INTO public.profiles (id, full_name, avatar_url)
VALUES (v_user_juan, 'Juan Botero', '')
ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

-- -------------------------------------------------------
-- 2. Businesses — The 3 establishments from the frontend
-- -------------------------------------------------------
INSERT INTO public.businesses (id, name, slug, neighborhood, city, category, tone_default, instagram_handle, plan_tier, plan_status, settings)
VALUES
  (
    v_biz_templo,
    'El Templo Bar',
    'el-templo-bar',
    'laureles',
    'Medellín',
    'gastrobar',
    'paisa',
    '@eltemplo.laureles',
    'pro',
    'active',
    '{"operating_hours": {"open": "16:00", "close": "02:00"}, "max_campaigns_per_month": 30}'::jsonb
  ),
  (
    v_biz_fanfest,
    'FanFest Lounge',
    'fanfest-lounge',
    'poblado',
    'Medellín',
    'bar',
    'premium',
    '@fanfest.lounge',
    'empresa',
    'active',
    '{"operating_hours": {"open": "12:00", "close": "00:00"}, "max_campaigns_per_month": 100}'::jsonb
  ),
  (
    v_biz_fonda,
    'La Fonda del Gol',
    'la-fonda-del-gol',
    'envigado',
    'Medellín',
    'restaurante',
    'paisa',
    '@lafondadelgol',
    'starter',
    'active',
    '{"operating_hours": {"open": "11:00", "close": "23:00"}, "max_campaigns_per_month": 10}'::jsonb
  )
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 3. Business Members — Juan owns all 3 (for demo)
-- -------------------------------------------------------
INSERT INTO public.business_members (business_id, user_id, role)
VALUES
  (v_biz_templo,  v_user_juan, 'owner'),
  (v_biz_fanfest, v_user_juan, 'owner'),
  (v_biz_fonda,   v_user_juan, 'owner')
ON CONFLICT (business_id, user_id) DO NOTHING;

-- -------------------------------------------------------
-- 4. Sports Event — The classic paisa derby
-- -------------------------------------------------------
INSERT INTO public.sports_events (id, external_event_id, external_source, home_team, away_team, league, season, venue, status, home_score, away_score, match_minute, event_metadata, starts_at)
VALUES (
  v_event_clasico,
  'match_test_1',
  'api-football',
  'Colombia',
  'Brasil',
  'Mundial 2026',
  '2026',
  'Estadio Metropolitano',
  'live',
  1,
  0,
  78,
  '{
    "goals": [
      {
        "minute": 34,
        "team": "home",
        "player": "Luis Díaz",
        "type": "goal",
        "assist": "James Rodríguez"
      }
    ],
    "cards": [],
    "referee": "Wilmar Roldán"
  }'::jsonb,
  now() - interval '78 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 5. Promotions — One per business
-- -------------------------------------------------------
INSERT INTO public.promotions (id, business_id, name, description, discount_text, trigger_type, duration_minutes, is_active)
VALUES
  (
    v_promo_templo,
    v_biz_templo,
    '2x1 Cerveza Águila',
    'Promoción de cerveza Águila 2x1 cuando el equipo local mete gol. Válida durante partidos en vivo.',
    '2x1 en cerveza Águila',
    'goal_home',
    30,
    true
  ),
  (
    v_promo_fanfest,
    v_biz_fanfest,
    '30% Off Premium Drafts',
    'Descuento del 30% en cervezas de barril premium tras gol del equipo local.',
    '30% discount on premium draft beers',
    'goal_home',
    60,
    true
  ),
  (
    v_promo_fonda,
    v_biz_fonda,
    '50% Segunda Picada',
    'La segunda picada va con 50% de descuento por cada gol del equipo local.',
    '50% en segunda picada',
    'goal_home',
    45,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 6. Campaigns — Two active campaigns
-- -------------------------------------------------------
INSERT INTO public.campaigns (id, business_id, sports_event_id, promotion_id, campaign_type, trigger_event, status, tone, neighborhood_context, context_snapshot, approved_at, expires_at)
VALUES
  (
    v_camp_templo,
    v_biz_templo,
    v_event_clasico,
    v_promo_templo,
    'auto',
    'goal_home',
    'pending_approval',
    'paisa',
    'laureles',
    '{
      "home_team": "Colombia",
      "away_team": "Brasil",
      "score": "1-0",
      "minute": 78,
      "event": "goal_home",
      "scorer": "Luis Díaz",
      "neighborhood": "laureles",
      "tone": "paisa",
      "promotion": "2x1 cerveza Águila"
    }'::jsonb,
    NULL,
    now() + interval '30 minutes'
  ),
  (
    v_camp_fanfest,
    v_biz_fanfest,
    v_event_clasico,
    v_promo_fanfest,
    'auto',
    'goal_home',
    'published',
    'premium',
    'poblado',
    '{
      "home_team": "Colombia",
      "away_team": "Brasil",
      "score": "1-0",
      "minute": 78,
      "event": "goal_home",
      "scorer": "Luis Díaz",
      "neighborhood": "poblado",
      "tone": "premium",
      "promotion": "30% premium drafts"
    }'::jsonb,
    now() - interval '30 minutes',
    now() + interval '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 7. AI Generations — Copy variants from the frontend mocks
-- -------------------------------------------------------
INSERT INTO public.ai_generations (id, campaign_id, prompt_system, prompt_user, response_text, model, prompt_tokens, completion_tokens, total_tokens, estimated_cost_usd, quality_score, is_selected)
VALUES
  (
    v_aigen_templo_1,
    v_camp_templo,
    'Eres el community manager de un gastrobar en Medellín. Usa un tono muy paisa, alegre, fiestero y apasionado por la Selección Colombia en el Mundial 2026. Usa expresiones como "parce", "qué chimba", "mor". Fomenta el consumo de cerveza y guaro.',
    '¡Gol de Colombia! El marcador va 1 - 0 en el minuto 78. Crea un copy corto para Instagram Stories invitando a la gente a seguir viendo el partido de la Selección en El Templo Bar en Laureles con la promoción: 2x1 en cerveza Águila',
    '¡GOLAZO de Lucho Díaz, parce! ⚽🔥 Celebra la victoria parcial de la Selección en *El Templo de Laureles*. Por los próximos 30 minutos, toda la cerveza Águila está a 2x1. ¡Caigan pues a celebrar que este mundial es nuestro! 🍻💚 #SeleccionColombia #Laureles #Mundial2026',
    'gemini-2.0-flash',
    185,
    89,
    274,
    0.000041,
    NULL,
    true
  ),
  (
    v_aigen_templo_2,
    v_camp_templo,
    'Eres el community manager de un restaurante/bar exclusivo y moderno. Tu tono es sofisticado, emocionante pero elegante, enfocado en ejecutivos o grupos de amigos que ven el Mundial 2026 de la Selección Colombia con estilo. Evita el lenguaje demasiado coloquial. Fomenta el consumo de cócteles y platillos premium.',
    'Acaba de marcar la Selección Colombia. Minuto 78, marcador 1-0. Crea un copy sofisticado y vibrante para Instagram Stories para El Templo Bar en Laureles. Invita a celebrar el gol con esta promoción: 2x1 en cerveza Águila',
    '¡Gol de la Selección Colombia! 🇨🇴✨ Vive la pasión del Mundial 2026 con nuestra promoción exclusiva: 2x1 en cervezas seleccionadas por la próxima hora en nuestra terraza en Laureles. Reserva tu mesa ahora y disfruta con estilo. 🍹⚽ #FanFestStyle #Laureles #ColombiaMundial',
    'gemini-2.0-flash',
    190,
    95,
    285,
    0.000043,
    NULL,
    false
  ),
  (
    v_aigen_fanfest,
    v_camp_fanfest,
    'You are a premium sports marketing copywriter for upscale bars in Medellín, Colombia. Write in a sophisticated, bilingual style (English/Spanish). Use elegant emojis. Max 280 characters.',
    'Generate an Instagram caption for FanFest Lounge in El Poblado. Context: Atlético Nacional goal (1-0 vs DIM, minute 34). Promotion: 30% off premium draft beers for 1 hour. Tone: premium.',
    'Goal by Atlético Nacional! ⚽🏆 Celebrate the Medellin Classic at *FanFest Lounge Poblado*. Enjoy our premium draft beers with a 30% discount for the next hour. Premium vibe for real fans. 🍺🥂 #Poblado #SportsLounge',
    'gemini-2.0-flash',
    175,
    82,
    257,
    0.000039,
    5,
    true
  )
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 8. Publication — FanFest Lounge post on Instagram
-- -------------------------------------------------------
INSERT INTO public.publications (id, campaign_id, ai_generation_id, platform, status, media_type, caption_text, published_at)
VALUES (
  v_pub_templo,
  v_camp_fanfest,
  v_aigen_fanfest,
  'instagram',
  'published',
  'image',
  'Goal by Atlético Nacional! ⚽🏆 Celebrate the Medellin Classic at *FanFest Lounge Poblado*. Enjoy our premium draft beers with a 30% discount for the next hour. Premium vibe for real fans. 🍺🥂 #Poblado #SportsLounge',
  now() - interval '25 minutes'
)
ON CONFLICT (id) DO NOTHING;

-- -------------------------------------------------------
-- 9. Campaign Analytics — Mock metrics from the frontend
-- -------------------------------------------------------
INSERT INTO public.campaign_analytics (campaign_id, publication_id, impressions, reach, likes, comments, shares, saves, link_clicks, profile_visits, engagement_rate, estimated_revenue, reaction_time_secs)
VALUES (
  v_camp_fanfest,
  v_pub_templo,
  3200,
  2800,
  134,
  23,
  12,
  8,
  45,
  28,
  4.8000,                                             -- Matches the "4.8% Engagement Promedio" KPI in frontend
  350000.00,                                          -- COP estimated revenue
  12                                                  -- Matches the "12s Tiempo de Reacción" KPI in frontend
);

END $$;
