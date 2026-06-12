-- ============================================================================
-- FanFest AI — Migration 007: Seed Copa Mundial FIFA 2026 - Colombia
-- ============================================================================
-- Purpose: Inserta los partidos de Colombia en el Mundial 2026 en sports_events.
--          Incluye fase de grupos (confirmados) y fases eliminatorias (proyectadas).
-- Source: FIFA / AS.com / El Colombiano — verificado 09 Jun 2026
--
-- Grupo K: Colombia, Portugal, Uzbekistán, RD Congo
--
-- NOTA DE HORARIOS: Todos los tiempos están en UTC.
--   Colombia (COL) = UTC-5
--   Para convertir: hora COL + 5 = hora UTC
--   Ej: 9:00 PM COL = 02:00 AM UTC del día siguiente
-- ============================================================================

-- -------------------------------------------------------
-- FASE DE GRUPOS — CONFIRMADOS
-- -------------------------------------------------------

INSERT INTO public.sports_events (
  external_event_id,
  external_source,
  home_team,
  away_team,
  home_team_logo,
  away_team_logo,
  league,
  season,
  venue,
  status,
  home_score,
  away_score,
  match_minute,
  event_metadata,
  starts_at
) VALUES

-- Partido 1 (Jornada 1): Uzbekistán vs Colombia
-- 17 Jun 2026, 9:00 PM COL = 18 Jun 2026 02:00 UTC
(
  'fifa-2026-k1-uzb-col',
  'fanfest-seed',
  'Uzbekistán',
  'Colombia',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/8/84/Flag_of_Uzbekistan.svg/320px-Flag_of_Uzbekistan.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  'Copa Mundial FIFA 2026 — Grupo K',
  '2026',
  'Estadio Azteca, Ciudad de México',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'tier_level', 1,
    'group', 'K',
    'round', 'Fase de Grupos - Jornada 1',
    'colombia_plays', true,
    'colombia_side', 'away',
    'rival', 'Uzbekistán',
    'rival_flag', '🇺🇿',
    'colombia_flag', '🇨🇴',
    'broadcast_co', 'Gol Caracol, RCN Fútbol, DSports',
    'importance', 'debut',
    'note', 'DEBUT DE COLOMBIA EN EL MUNDIAL 2026'
  ),
  '2026-06-18 02:00:00+00'  -- 9:00 PM COL del 17 Jun
),

-- Partido 2 (Jornada 2): Colombia vs RD Congo
-- 23 Jun 2026, 9:00 PM COL = 24 Jun 2026 02:00 UTC
(
  'fifa-2026-k2-col-cod',
  'fanfest-seed',
  'Colombia',
  'RD Congo',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Flag_of_the_Democratic_Republic_of_the_Congo.svg/320px-Flag_of_the_Democratic_Republic_of_the_Congo.svg.png',
  'Copa Mundial FIFA 2026 — Grupo K',
  '2026',
  'Estadio Akron, Guadalajara, México',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'tier_level', 1,
    'group', 'K',
    'round', 'Fase de Grupos - Jornada 2',
    'colombia_plays', true,
    'colombia_side', 'home',
    'rival', 'RD Congo',
    'rival_flag', '🇨🇩',
    'colombia_flag', '🇨🇴',
    'broadcast_co', 'Gol Caracol, RCN Fútbol, DSports',
    'importance', 'high'
  ),
  '2026-06-24 02:00:00+00'  -- 9:00 PM COL del 23 Jun
),

-- Partido 3 (Jornada 3): Colombia vs Portugal
-- 27 Jun 2026, 6:30 PM COL = 27 Jun 2026 23:30 UTC
(
  'fifa-2026-k3-col-por',
  'fanfest-seed',
  'Colombia',
  'Portugal',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Flag_of_Portugal.svg/320px-Flag_of_Portugal.svg.png',
  'Copa Mundial FIFA 2026 — Grupo K',
  '2026',
  'Hard Rock Stadium, Miami, Florida',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'tier_level', 1,
    'group', 'K',
    'tier_level', 1,
    'round', 'Fase de Grupos - Jornada 3',
    'colombia_plays', true,
    'colombia_side', 'home',
    'rival', 'Portugal',
    'rival_flag', '🇵🇹',
    'colombia_flag', '🇨🇴',
    'broadcast_co', 'Gol Caracol, RCN Fútbol, DSports',
    'importance', 'decisive',
    'note', 'Partido decisivo vs Portugal — Ronaldo, Félix y compañía'
  ),
  '2026-06-27 23:30:00+00'  -- 6:30 PM COL del 27 Jun
),

-- -------------------------------------------------------
-- FASE ELIMINATORIA — PROYECTADOS (si Colombia clasifica)
-- Fechas basadas en el calendario oficial FIFA 2026
-- Los equipos se actualizan cuando la fase de grupos termina
-- -------------------------------------------------------

-- Dieciseisavos de Final (Round of 32): 28 Jun - 3 Jul 2026
-- Colombia clasificaría aprox el 30 Jun - 1 Jul si va 1° o 2° del Grupo K
(
  'fifa-2026-r32-col-tbd',
  'fanfest-seed',
  'Colombia',
  'Por definir',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  '',
  'Copa Mundial FIFA 2026 — Dieciseisavos de Final',
  '2026',
  'Por definir (USA/México/Canadá)',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'tier_level', 1,
    'round', 'Dieciseisavos de Final',
    'colombia_plays', true,
    'colombia_side', 'home',
    'rival', 'Por definir',
    'importance', 'knockout',
    'projected', true,
    'note', 'Rival se define al finalizar la fase de grupos (mejor 3°)'
  ),
  '2026-07-01 02:00:00+00'  -- Estimado: 30 Jun o 1 Jul 2026, hora TBD
),

-- Octavos de Final (Round of 16): 4 - 7 Jul 2026
(
  'fifa-2026-r16-col-tbd',
  'fanfest-seed',
  'Colombia',
  'Por definir',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  '',
  'Copa Mundial FIFA 2026 — Octavos de Final',
  '2026',
  'Por definir (USA/México/Canadá)',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'round', 'Octavos de Final',
    'colombia_plays', true,
    'colombia_side', 'home',
    'rival', 'Por definir',
    'importance', 'knockout',
    'projected', true
  ),
  '2026-07-05 22:00:00+00'  -- Estimado: 5 Jul 2026
),

-- Cuartos de Final (Quarterfinals): 9 - 11 Jul 2026
(
  'fifa-2026-qf-col-tbd',
  'fanfest-seed',
  'Colombia',
  'Por definir',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  '',
  'Copa Mundial FIFA 2026 — Cuartos de Final',
  '2026',
  'Por definir (USA/México/Canadá)',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'round', 'Cuartos de Final',
    'colombia_plays', true,
    'colombia_side', 'home',
    'rival', 'Por definir',
    'importance', 'knockout',
    'projected', true
  ),
  '2026-07-10 22:00:00+00'  -- Estimado: 10 Jul 2026
),

-- Semifinal (Semifinals): 14 - 15 Jul 2026
(
  'fifa-2026-sf-col-tbd',
  'fanfest-seed',
  'Colombia',
  'Por definir',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  '',
  'Copa Mundial FIFA 2026 — Semifinal',
  '2026',
  'Por definir (USA)',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'round', 'Semifinal',
    'colombia_plays', true,
    'colombia_side', 'home',
    'rival', 'Por definir',
    'importance', 'knockout',
    'projected', true
  ),
  '2026-07-14 23:00:00+00'  -- Estimado: 14 Jul 2026
),

-- Final (World Cup Final): 19 Jul 2026
(
  'fifa-2026-final-col-tbd',
  'fanfest-seed',
  'Colombia',
  'Por definir',
  'https://upload.wikimedia.org/wikipedia/commons/thumb/2/21/Flag_of_Colombia.svg/320px-Flag_of_Colombia.svg.png',
  '',
  'Copa Mundial FIFA 2026 — Gran Final',
  '2026',
  'MetLife Stadium, East Rutherford, Nueva Jersey',
  'scheduled',
  0, 0, 0,
  jsonb_build_object(
    'round', 'Gran Final',
    'colombia_plays', true,
    'colombia_side', 'home',
    'rival', 'Por definir',
    'importance', 'final',
    'projected', true,
    'note', 'La gran final del Mundial 2026 — 19 Jul 2026'
  ),
  '2026-07-19 22:00:00+00'  -- 19 Jul 2026, hora TBD (estimado 5 PM COL)
);

-- ============================================================================
-- Verificación rápida: muestra los eventos insertados ordenados por fecha
-- ============================================================================
-- SELECT
--   home_team, away_team, league,
--   (starts_at AT TIME ZONE 'America/Bogota') AS hora_colombia,
--   venue,
--   (event_metadata->>'round') AS ronda
-- FROM public.sports_events
-- WHERE external_source = 'fanfest-seed'
-- ORDER BY starts_at ASC;
