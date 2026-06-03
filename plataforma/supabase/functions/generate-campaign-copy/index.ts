// ============================================================================
// FanFest AI — Edge Function: generate-campaign-copy
// ============================================================================
// Calls Gemini API to generate contextual Instagram copy based on:
//   - Business profile (name, neighborhood, tone)
//   - Active sports event context (teams, score, minute, scorer)
//   - Active promotion (discount text, duration)
//
// Persists the result in ai_generations and updates campaign status.
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// ── CORS headers ─────────────────────────────────────────────────────────────
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ── Gemini model + endpoint ───────────────────────────────────────────────────
const GEMINI_MODEL = "gemini-2.0-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

// ── Request body type ─────────────────────────────────────────────────────────
interface GenerateRequest {
  campaign_id?: string;       // Optional: link generation to existing campaign
  business_id: string;        // Required: to fetch business profile
  sports_event_id?: string;   // Optional: to fetch live match context
  tone: "paisa" | "premium";  // Required: which prompt template to use
  // Override context (used when DB data isn't available / for quick demo)
  context?: {
    business_name?: string;
    neighborhood?: string;
    home_team?: string;
    away_team?: string;
    score?: string;
    minute?: number;
    scorer?: string;
    discount?: string;
    duration_minutes?: number;
  };
}

serve(async (req: Request) => {
  // ── Handle CORS preflight ──────────────────────────────────────────────────
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // ── 1. Parse request body ────────────────────────────────────────────────
    const body: GenerateRequest = await req.json();
    const { campaign_id, business_id, sports_event_id, tone, context } = body;

    if (!business_id || !tone) {
      return new Response(
        JSON.stringify({ error: "business_id and tone are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 2. Init Supabase admin client ────────────────────────────────────────
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ── 3. Fetch Gemini API Key ──────────────────────────────────────────────
    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({ error: "GEMINI_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 4. Fetch business profile from DB ────────────────────────────────────
    const { data: business, error: bizError } = await supabase
      .from("businesses")
      .select("id, name, neighborhood, tone_default, settings")
      .eq("id", business_id)
      .eq("is_active", true)
      .single();

    if (bizError || !business) {
      return new Response(
        JSON.stringify({ error: "Business not found", detail: bizError?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 5. Fetch sports event context (optional, fallback to request context) ─
    let matchContext = {
      home_team: context?.home_team ?? "Colombia",
      away_team: context?.away_team ?? "Brasil",
      score: context?.score ?? "1-0",
      minute: context?.minute ?? 78,
      scorer: context?.scorer ?? "Luis Díaz",
      discount: context?.discount ?? "2x1 en cerveza Águila",
      duration_minutes: context?.duration_minutes ?? 30,
    };

    if (sports_event_id) {
      const { data: event } = await supabase
        .from("sports_events")
        .select("home_team, away_team, home_score, away_score, match_minute, event_metadata")
        .eq("id", sports_event_id)
        .single();

      if (event) {
        const latestGoal = event.event_metadata?.goals?.[event.event_metadata.goals.length - 1];
        matchContext = {
          home_team: event.home_team,
          away_team: event.away_team,
          score: `${event.home_score}-${event.away_score}`,
          minute: event.match_minute,
          scorer: latestGoal?.player ?? matchContext.scorer,
          discount: matchContext.discount,
          duration_minutes: matchContext.duration_minutes,
        };
      }
    }

    // ── 6. Fetch prompt template from DB ─────────────────────────────────────
    const templateKey = tone === "paisa" ? "copy_paisa" : "copy_premium";
    const { data: template, error: tplError } = await supabase
      .from("prompt_templates")
      .select("system_prompt, user_template")
      .eq("key", templateKey)
      .eq("is_active", true)
      .single();

    // ── 7. Build prompts (DB template or hardcoded fallback) ─────────────────
    const businessName = context?.business_name ?? business.name;
    const neighborhood = context?.neighborhood ?? business.neighborhood;

    let systemPrompt: string;
    let userPrompt: string;

    if (template && !tplError) {
      // Interpolate template variables
      systemPrompt = template.system_prompt ?? "";
      userPrompt = template.user_template
        .replace(/{{business_name}}/g, businessName)
        .replace(/{{neighborhood}}/g, neighborhood)
        .replace(/{{home_team}}/g, matchContext.home_team)
        .replace(/{{away_team}}/g, matchContext.away_team)
        .replace(/{{team}}/g, matchContext.home_team)
        .replace(/{{score}}/g, matchContext.score)
        .replace(/{{minute}}/g, String(matchContext.minute))
        .replace(/{{scorer}}/g, matchContext.scorer)
        .replace(/{{discount}}/g, matchContext.discount)
        .replace(/{{duration_minutes}}/g, String(matchContext.duration_minutes));
    } else {
      // Hardcoded fallback prompts (mirrors seed data)
      if (tone === "paisa") {
        systemPrompt =
          "Eres un redactor creativo de marketing deportivo para locales en Medellín. Escribe con jerga y dialecto paisa auténtico (parce, mor, pues, ¡qué golazo de mi verde!, ¡se prendió esto!). Usa emojis relevantes. Máximo 260 caracteres.";
        userPrompt = `Genera una publicación de Instagram para "${businessName}" en el barrio "${neighborhood}". Contexto: gol de ${matchContext.scorer} para ${matchContext.home_team} (marcador: ${matchContext.score}, minuto: ${matchContext.minute}'). Promoción: "${matchContext.discount}" por ${matchContext.duration_minutes} minutos. Anima a la gente a venir YA y cierra con hashtags relevantes.`;
      } else {
        systemPrompt =
          "Eres un redactor de marketing de alta gama para bares sofisticados en Medellín. Escribe en tono premium, refinado, a veces bilingüe (español/inglés). Emojis moderados y estilizados. Máximo 260 caracteres.";
        userPrompt = `Generate an Instagram post for "${businessName}" in "${neighborhood}". Context: ${matchContext.home_team} scored! Score: ${matchContext.score}, minute: ${matchContext.minute}', scorer: ${matchContext.scorer}. Promotion: "${matchContext.discount}" for the next ${matchContext.duration_minutes} minutes. Elegant, premium, inviting.`;
      }
    }

    // ── 7.5. Read Context Layer Files & Build Super Prompt ────────────────────
    const contextWorldCup = `
# FIFA World Cup 2026

La Copa Mundial FIFA 2026 se jugará en Estados Unidos, México y Canadá.
Participarán 48 selecciones.

FanFest AI genera campañas de marketing hiper-localizadas para negocios durante partidos del Mundial, basándose en eventos en vivo (goles, tarjetas, finales).

IMPORTANTE - REGLAS DE ORO DEL TORNEO:
- NO inventar resultados.
- NO inventar goles ni cambiar el marcador reportado en el contexto.
- NO inventar estadísticas de los equipos.
- SI el partido NO ha terminado (minuto menor a 90), DEBES usar lenguaje condicional y hablar de victoria/derrota *parcial* (ej. "Si Colombia mantiene la ventaja...", "Con este gol parcial..."). Nunca afirmar que ya ganaron si no ha acabado el encuentro.
- Fomentar la emoción y la tensión propia de un torneo mundialista.
`;

    const contextColombia = `
# Selección Colombia - Mundial 2026

Jugadores destacados y referentes del equipo actual:
- Luis Díaz (Extremo, figura principal)
- James Rodríguez (Creativo, capitán)
- Jhon Arias (Mediocampista)
- Richard Ríos (Mediocampista, estilo vistoso)
- Camilo Vargas (Arquero)
- Néstor Lorenzo (Director Técnico)

DIRECTRICES DE NARRATIVA:
- No asumir alineaciones futuras de jugadores que no estén confirmados.
- Si no existe un dato confirmado sobre la jugada, usa lenguaje neutral o resalta el esfuerzo del equipo completo.
- Resalta la pasión de la hinchada "Tricolor" y la unión del país.
- Usa colores amarillo, azul y rojo de forma descriptiva si es relevante.
`;

    const contextBusiness = `
# Reglas Comerciales de FanFest AI

FanFest AI opera exclusivamente para potenciar ventas locales.
Nuestros clientes son:
- Gastrobares
- Bares y Cantinas
- Restaurantes
- Licoreras
- Tiendas deportivas

OBJETIVO DEL COPY:
Generar FOMO (miedo a perderse algo) y urgencia (urgency) para incrementar el tráfico a pie (foot traffic) y ventas inmediatas de bebidas y comida.

REGLAS ESTRICTAS DE PROMOCIÓN:
- El copy generado DEBE incluir obligatoriamente y de forma prominente la [PROMOCIÓN] enviada en el contexto en tiempo real.
- NO generar ni inventar promociones imposibles o irreales (ej. "Todo el bar gratis", "Regalamos carros").
- NO alterar la duración o los términos de la promoción recibida. Si dice "por 30 minutos", debes respetar esos "30 minutos".
- Fomentar el consumo en el momento y la celebración grupal.
- Incluir un claro llamado a la acción (Call to Action / CTA) para que la gente visite el local.
`;

    const superSystemPrompt = systemPrompt
      + "\n\n--- REGLAS DEL TORNEO (MUNDIAL 2026) ---\n"
      + contextWorldCup
      + "\n--- CONTEXTO DEL EQUIPO (COLOMBIA) ---\n"
      + contextColombia
      + "\n--- REGLAS DE NEGOCIO Y MARKETING ---\n"
      + contextBusiness;

    // ── 8. Call Gemini API ────────────────────────────────────────────────────
    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${geminiApiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: superSystemPrompt }],
        },
        contents: [
          {
            role: "user",
            parts: [{ text: userPrompt }],
          },
        ],
        generationConfig: {
          temperature: 0.85,
          topP: 0.95,
          maxOutputTokens: 300,
          responseMimeType: "text/plain",
        },
      }),
    });

    if (!geminiRes.ok) {
      const errText = await geminiRes.text();
      console.error("Gemini API error:", errText);
      return new Response(
        JSON.stringify({ error: "Gemini API call failed", detail: errText }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiData = await geminiRes.json();
    const generatedText: string =
      geminiData.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? "";
    const promptTokens: number = geminiData.usageMetadata?.promptTokenCount ?? 0;
    const completionTokens: number = geminiData.usageMetadata?.candidatesTokenCount ?? 0;
    const totalTokens: number = geminiData.usageMetadata?.totalTokenCount ?? 0;
    // Gemini 2.0 Flash pricing: input $0.075/1M tokens, output $0.30/1M tokens
    const estimatedCostUsd =
      (promptTokens / 1_000_000) * 0.075 + (completionTokens / 1_000_000) * 0.3;

    if (!generatedText) {
      return new Response(
        JSON.stringify({ error: "Gemini returned empty response" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 9. Determine or create campaign_id ───────────────────────────────────
    let resolvedCampaignId = campaign_id;

    if (!resolvedCampaignId) {
      // Create a new campaign linked to this generation
      const contextSnapshot = {
        home_team: matchContext.home_team,
        away_team: matchContext.away_team,
        score: matchContext.score,
        minute: matchContext.minute,
        scorer: matchContext.scorer,
        neighborhood,
        tone,
        promotion: matchContext.discount,
        event: "goal_home",
        generated_via: "frontend_regenerate",
      };

      const { data: newCampaign, error: campErr } = await supabase
        .from("campaigns")
        .insert({
          business_id,
          sports_event_id: sports_event_id ?? null,
          campaign_type: "manual",
          trigger_event: "goal_home",
          status: "generated",
          tone,
          neighborhood_context: neighborhood,
          context_snapshot: contextSnapshot,
          expires_at: new Date(Date.now() + matchContext.duration_minutes * 60 * 1000).toISOString(),
        })
        .select("id")
        .single();

      if (campErr || !newCampaign) {
        console.error("Error creating campaign:", campErr);
        return new Response(
          JSON.stringify({ error: "Failed to create campaign", detail: campErr?.message }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      resolvedCampaignId = newCampaign.id;
    } else {
      // Update existing campaign status to 'generated'
      await supabase
        .from("campaigns")
        .update({ status: "generated" })
        .eq("id", resolvedCampaignId);
    }

    // ── 10. Mark previous generations as not selected, then save new one ─────
    await supabase
      .from("ai_generations")
      .update({ is_selected: false })
      .eq("campaign_id", resolvedCampaignId);

    const { data: newGen, error: genErr } = await supabase
      .from("ai_generations")
      .insert({
        campaign_id: resolvedCampaignId,
        prompt_system: superSystemPrompt,
        prompt_user: userPrompt,
        response_text: generatedText,
        model: GEMINI_MODEL,
        prompt_tokens: promptTokens,
        completion_tokens: completionTokens,
        total_tokens: totalTokens,
        estimated_cost_usd: estimatedCostUsd,
        is_selected: true,
      })
      .select("id")
      .single();

    if (genErr || !newGen) {
      console.error("Error saving ai_generation:", genErr);
      return new Response(
        JSON.stringify({ error: "Failed to save generation", detail: genErr?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ── 11. Return success ────────────────────────────────────────────────────
    return new Response(
      JSON.stringify({
        success: true,
        campaign_id: resolvedCampaignId,
        generation_id: newGen.id,
        generated_text: generatedText,
        model: GEMINI_MODEL,
        tokens: { prompt: promptTokens, completion: completionTokens, total: totalTokens },
        estimated_cost_usd: estimatedCostUsd,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error in generate-campaign-copy:", err);
    return new Response(
      JSON.stringify({ error: "Internal server error", detail: String(err) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
