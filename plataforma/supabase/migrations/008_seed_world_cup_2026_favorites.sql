-- ============================================================================
-- FanFest AI — Migration 008: Seed Copa Mundial FIFA 2026 - Tiers 2 & 3
-- ============================================================================
-- Purpose: Inserta los partidos de selecciones favoritas (Tier 2) y de interés (Tier 3)
--          basado en la estrategia de contenido para generar "GeoRivalidad" y mantener
--          el engagement diario en los locales.
-- ============================================================================

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

-- -------------------------------------------------------
-- TIER 2: Selecciones Favoritas y "Gigantes"
-- -------------------------------------------------------

(
  'fifa-2026-t2-bra-mar', 'fanfest-seed', 'Brasil', 'Marruecos', '', '',
  'Copa Mundial FIFA 2026 — Grupo C', '2026', 'Nueva York / Nueva Jersey', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'C', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'El debut de la Canarinha, siempre candidata al título.',
    'key_players', '["Vinícius Jr", "Rodrygo", "Achraf Hakimi"]',
    'rivalry_context', 'Choque de estilos entre la magia brasileña y el pragmatismo marroquí.',
    'marketing_tags', '["promo_cerveza", "futbol_mundial"]'
  ),
  '2026-06-12 22:00:00+00' -- 18:00 ET
),
(
  'fifa-2026-t2-arg-alg', 'fanfest-seed', 'Argentina', 'Argelia', '', '',
  'Copa Mundial FIFA 2026 — Grupo J', '2026', 'Kansas City', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'J', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'La Albiceleste comienza la defensa de su corona mundial.',
    'key_players', '["Lionel Messi", "Emiliano Martínez", "Riyad Mahrez"]',
    'rivalry_context', 'El campeón defensor a prueba contra el campeón africano histórico.',
    'marketing_tags', '["promo_parrilla", "campeon_mundial"]'
  ),
  '2026-06-14 01:00:00+00' -- 13 Jun 21:00 ET
),
(
  'fifa-2026-t2-fra-sen', 'fanfest-seed', 'Francia', 'Senegal', '', '',
  'Copa Mundial FIFA 2026 — Grupo I', '2026', 'Nueva York / Nueva Jersey', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'I', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Kylian Mbappé y Francia inician su camino buscando otra final.',
    'key_players', '["Kylian Mbappé", "Antoine Griezmann", "Sadio Mané"]',
    'rivalry_context', 'Revancha histórica del Mundial 2002.',
    'marketing_tags', '["promo_cocteles", "estrellas_mundiales"]'
  ),
  '2026-06-13 19:00:00+00' -- 15:00 ET
),
(
  'fifa-2026-t2-ger-cuw', 'fanfest-seed', 'Alemania', 'Curazao', '', '',
  'Copa Mundial FIFA 2026 — Grupo E', '2026', 'Houston', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'E', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'La máquina alemana busca arrancar pisando fuerte.',
    'key_players', '["Jamal Musiala", "Florian Wirtz"]',
    'marketing_tags', '["promo_cerveza_importada", "futbol_europeo"]'
  ),
  '2026-06-12 17:00:00+00' -- 13:00 ET
),
(
  'fifa-2026-t2-esp-cpv', 'fanfest-seed', 'España', 'Cabo Verde', '', '',
  'Copa Mundial FIFA 2026 — Grupo H', '2026', 'Atlanta', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'H', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'La joven y talentosa selección española debuta en el torneo.',
    'key_players', '["Lamine Yamal", "Pedri"]',
    'marketing_tags', '["tapas_y_cerveza", "la_roja"]'
  ),
  '2026-06-13 16:00:00+00' -- 12:00 ET
),
(
  'fifa-2026-t2-eng-cro', 'fanfest-seed', 'Inglaterra', 'Croacia', '', '',
  'Copa Mundial FIFA 2026 — Grupo L', '2026', 'Dallas', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'L', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Partidazo europeo: Los Tres Leones se miden a la siempre difícil Croacia.',
    'key_players', '["Jude Bellingham", "Harry Kane", "Luka Modrić"]',
    'rivalry_context', 'Choque de titanes europeos reviviendo la semi de 2018.',
    'marketing_tags', '["promo_pintas", "partidazo"]'
  ),
  '2026-06-14 20:00:00+00' -- 16:00 ET
),
(
  'fifa-2026-t2-bra-hai', 'fanfest-seed', 'Brasil', 'Haití', '', '',
  'Copa Mundial FIFA 2026 — Grupo C', '2026', 'Filadelfia', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'C', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'El Jogo Bonito busca asegurar su pase a la siguiente ronda.',
    'key_players', '["Vinícius Jr", "Neymar"]'
  ),
  '2026-06-18 01:00:00+00' -- 17 Jun 21:00 ET
),
(
  'fifa-2026-t2-arg-aut', 'fanfest-seed', 'Argentina', 'Austria', '', '',
  'Copa Mundial FIFA 2026 — Grupo J', '2026', 'Dallas', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'J', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Prueba de fuego para la Scaloneta ante una dura selección europea.',
    'key_players', '["Lionel Messi", "David Alaba"]',
    'marketing_tags', '["pantalla_gigante"]'
  ),
  '2026-06-18 17:00:00+00' -- 13:00 ET
),
(
  'fifa-2026-t2-fra-irq', 'fanfest-seed', 'Francia', 'Irak', '', '',
  'Copa Mundial FIFA 2026 — Grupo I', '2026', 'Filadelfia', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'I', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Los galos buscan asegurar la cima de su grupo.',
    'key_players', '["Kylian Mbappé"]'
  ),
  '2026-06-18 21:00:00+00' -- 17:00 ET
),
(
  'fifa-2026-t2-ger-civ', 'fanfest-seed', 'Alemania', 'Costa de Marfil', '', '',
  'Copa Mundial FIFA 2026 — Grupo E', '2026', 'Toronto', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'E', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Alemania se enfrenta a la potencia física de Costa de Marfil.',
    'key_players', '["Jamal Musiala", "Sébastien Haller"]'
  ),
  '2026-06-17 20:00:00+00' -- 16:00 ET
),
(
  'fifa-2026-t2-esp-ksa', 'fanfest-seed', 'España', 'Arabia Saudí', '', '',
  'Copa Mundial FIFA 2026 — Grupo H', '2026', 'Atlanta', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'H', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'España busca una goleada para liderar su grupo.',
    'key_players', '["Lamine Yamal", "Salem Al-Dawsari"]'
  ),
  '2026-06-18 16:00:00+00' -- 12:00 ET
),
(
  'fifa-2026-t2-eng-gha', 'fanfest-seed', 'Inglaterra', 'Ghana', '', '',
  'Copa Mundial FIFA 2026 — Grupo L', '2026', 'Boston', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'L', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Duelo atractivo entre la técnica inglesa y la velocidad ghanesa.',
    'key_players', '["Jude Bellingham", "Mohammed Kudus"]'
  ),
  '2026-06-19 20:00:00+00' -- 16:00 ET
),
(
  'fifa-2026-t2-sco-bra', 'fanfest-seed', 'Escocia', 'Brasil', '', '',
  'Copa Mundial FIFA 2026 — Grupo C', '2026', 'Miami', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'C', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Brasil cierra su fase de grupos ante la combativa Escocia.',
    'key_players', '["Vinícius Jr", "Andy Robertson"]'
  ),
  '2026-06-22 22:00:00+00' -- 18:00 ET
),
(
  'fifa-2026-t2-jor-arg', 'fanfest-seed', 'Jordania', 'Argentina', '', '',
  'Copa Mundial FIFA 2026 — Grupo J', '2026', 'Dallas', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'J', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Argentina busca asegurar el liderato del grupo J.',
    'key_players', '["Lionel Messi"]'
  ),
  '2026-06-25 02:00:00+00' -- 24 Jun 22:00 ET
),
(
  'fifa-2026-t2-nor-fra', 'fanfest-seed', 'Noruega', 'Francia', '', '',
  'Copa Mundial FIFA 2026 — Grupo I', '2026', 'Boston', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'I', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Choque de trenes europeos: Haaland vs Mbappé.',
    'key_players', '["Erling Haaland", "Kylian Mbappé"]',
    'rivalry_context', 'El esperado enfrentamiento entre los dos mejores delanteros del mundo.',
    'marketing_tags', '["duelo_titanes", "promo_cerveza"]'
  ),
  '2026-06-23 19:00:00+00' -- 15:00 ET
),
(
  'fifa-2026-t2-ecu-ger', 'fanfest-seed', 'Ecuador', 'Alemania', '', '',
  'Copa Mundial FIFA 2026 — Grupo E', '2026', 'Nueva York / Nueva Jersey', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'E', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'El orgullo sudamericano se mide ante la potencia alemana.',
    'key_players', '["Moisés Caicedo", "Jamal Musiala"]',
    'rivalry_context', 'Conmebol vs UEFA en un duelo de alta intensidad física.'
  ),
  '2026-06-22 20:00:00+00' -- 16:00 ET
),
(
  'fifa-2026-t2-uru-esp', 'fanfest-seed', 'Uruguay', 'España', '', '',
  'Copa Mundial FIFA 2026 — Grupo H', '2026', 'Guadalajara', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'H', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Duelo histórico y de alto vuelo entre la Garra Charrúa y La Roja.',
    'key_players', '["Federico Valverde", "Lamine Yamal", "Darwin Núñez"]',
    'rivalry_context', 'Un choque que sacará chispas por la intensidad charrúa y la posesión española.',
    'marketing_tags', '["partidazo", "menu_especial"]'
  ),
  '2026-06-24 00:00:00+00' -- 23 Jun 20:00 ET
),
(
  'fifa-2026-t2-pan-eng', 'fanfest-seed', 'Panamá', 'Inglaterra', '', '',
  'Copa Mundial FIFA 2026 — Grupo L', '2026', 'Nueva York / Nueva Jersey', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 2, 'group', 'L', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Inglaterra cierra el grupo frente a la revelación de Concacaf.',
    'key_players', '["Jude Bellingham", "Adalberto Carrasquilla"]'
  ),
  '2026-06-24 21:00:00+00' -- 17:00 ET
),

-- -------------------------------------------------------
-- TIER 3: Partidos de Interés y "Caballos Negros"
-- -------------------------------------------------------

(
  'fifa-2026-t3-mex-rsa', 'fanfest-seed', 'México', 'Sudáfrica', '', '',
  'Copa Mundial FIFA 2026 — Grupo A', '2026', 'Ciudad de México', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'A', 'round', 'Fase de Grupos (Inaugural)', 'colombia_plays', false,
    'narrative_focus', '¡Arranca el Mundial 2026! México debuta en casa ante su gente.',
    'key_players', '["Santiago Giménez"]',
    'rivalry_context', 'Partido inaugural del Mundial.',
    'marketing_tags', '["partido_inaugural", "fiesta_mundialista"]'
  ),
  '2026-06-11 19:00:00+00' -- 15:00 ET
),
(
  'fifa-2026-t3-ned-jpn', 'fanfest-seed', 'Países Bajos', 'Japón', '', '',
  'Copa Mundial FIFA 2026 — Grupo F', '2026', 'Dallas', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'F', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'La Naranja Mecánica enfrenta a la velocidad y disciplina nipona.',
    'key_players', '["Virgil van Dijk", "Kaoru Mitoma"]'
  ),
  '2026-06-12 20:00:00+00' -- 16:00 ET
),
(
  'fifa-2026-t3-bel-egy', 'fanfest-seed', 'Bélgica', 'Egipto', '', '',
  'Copa Mundial FIFA 2026 — Grupo G', '2026', 'Seattle', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'G', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Bélgica y su nueva generación se miden a los Faraones.',
    'key_players', '["Kevin De Bruyne", "Mohamed Salah"]'
  ),
  '2026-06-13 19:00:00+00' -- 15:00 ET
),
(
  'fifa-2026-t3-por-cod', 'fanfest-seed', 'Portugal', 'RD Congo', '', '',
  'Copa Mundial FIFA 2026 — Grupo K', '2026', 'Houston', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'K', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Rivales de grupo de Colombia. Ojo a este partido.',
    'key_players', '["Cristiano Ronaldo"]',
    'rivalry_context', 'De aquí sale un rival directo para Colombia en la tabla.'
  ),
  '2026-06-13 17:00:00+00' -- 13:00 ET
),
(
  'fifa-2026-t3-ned-swe', 'fanfest-seed', 'Países Bajos', 'Suecia', '', '',
  'Copa Mundial FIFA 2026 — Grupo F', '2026', 'Houston', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'F', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Duelo puramente europeo para definir el grupo F.',
    'key_players', '["Xavi Simons", "Alexander Isak"]'
  ),
  '2026-06-17 17:00:00+00' -- 13:00 ET
),
(
  'fifa-2026-t3-bel-irn', 'fanfest-seed', 'Bélgica', 'Irán', '', '',
  'Copa Mundial FIFA 2026 — Grupo G', '2026', 'Los Ángeles', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'G', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Los Diablos Rojos continúan su paso por la fase de grupos.'
  ),
  '2026-06-18 19:00:00+00' -- 15:00 ET
),
(
  'fifa-2026-t3-por-uzb', 'fanfest-seed', 'Portugal', 'Uzbekistán', '', '',
  'Copa Mundial FIFA 2026 — Grupo K', '2026', 'Houston', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'K', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Portugal busca clasificar temprano en el grupo de Colombia.',
    'key_players', '["Bruno Fernandes", "Rafael Leão"]',
    'rivalry_context', 'Partido clave que afectará la tabla de Colombia.'
  ),
  '2026-06-19 17:00:00+00' -- 13:00 ET
),
(
  'fifa-2026-t3-tun-ned', 'fanfest-seed', 'Túnez', 'Países Bajos', '', '',
  'Copa Mundial FIFA 2026 — Grupo F', '2026', 'Kansas City', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'F', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Cierre de la fase de grupos para la Naranja Mecánica.'
  ),
  '2026-06-22 23:00:00+00' -- 19:00 ET
),
(
  'fifa-2026-t3-nzl-bel', 'fanfest-seed', 'Nueva Zelanda', 'Bélgica', '', '',
  'Copa Mundial FIFA 2026 — Grupo G', '2026', 'BC Place Vancouver', 'scheduled', 0, 0, 0,
  jsonb_build_object(
    'tier_level', 3, 'group', 'G', 'round', 'Fase de Grupos', 'colombia_plays', false,
    'narrative_focus', 'Bélgica busca el puntaje perfecto para entrar fuerte a octavos.'
  ),
  '2026-06-24 03:00:00+00' -- 23 Jun 23:00 ET
);
