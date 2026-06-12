"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase as rawSupabase } from "../lib/supabaseClient";
const supabase = rawSupabase as any;
import type { Business, SportsEvent, Campaign, AiGeneration } from "../lib/database.types";

// ── Edge Function URL helper ──────────────────────────────────────────────────
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const EDGE_FN_URL = `${SUPABASE_URL}/functions/v1/generate-campaign-copy`;

// ── Toast type ────────────────────────────────────────────────────────────────
type Toast = { id: number; type: "success" | "error" | "loading"; message: string };

export default function Home() {
  const [selectedNeighborhood, setSelectedNeighborhood] = useState("laureles");
  const [selectedTone, setSelectedTone] = useState("paisa");

  // Detect query parameters on mount to support deep linking from /app/dashboard
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const urlNeighborhood = params.get("neighborhood");
      const urlTone = params.get("tone");
      
      if (urlNeighborhood) {
        setSelectedNeighborhood(urlNeighborhood.toLowerCase());
      }
      if (urlTone) {
        setSelectedTone(urlTone.toLowerCase());
      }
    }
  }, []);
  
  // Database States
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [activeEvent, setActiveEvent] = useState<SportsEvent | null>(null);
  const [activeCampaign, setActiveCampaign] = useState<Campaign | null>(null);
  const [aiGenerations, setAiGenerations] = useState<AiGeneration[]>([]);
  const [crmData, setCrmData] = useState<any[]>([]);
  
  // UI States (with mock fallbacks)
  const [scoreColombia, setscoreColombia] = useState(1);
  const [scoreBrasil, setscoreBrasil] = useState(0);
  const [matchMinute, setMatchMinute] = useState(72);
  const [campaignApproved, setCampaignApproved] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [liveGeneratedText, setLiveGeneratedText] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [toastCounter, setToastCounter] = useState(0);

  // 1. Initial Load: Fetch businesses and the active/latest sports event
  useEffect(() => {
    async function initData() {
      try {
        const { data: bizData, error: bizError } = await supabase
          .from("businesses")
          .select("*")
          .eq("is_active", true);

        if (bizError) throw bizError;
        if (bizData) setBusinesses(bizData);

        const { data: eventData, error: eventError } = await supabase
          .from("sports_events")
          .select("*")
          .order("starts_at", { ascending: false })
          .limit(1);

        if (eventError) throw eventError;

        const { data: crmFetch, error: crmError } = await supabase
          .from("v_pilot_crm_dashboard")
          .select("*")
          .order("registered_at", { ascending: false });

        if (!crmError && crmFetch) setCrmData(crmFetch);
        
        if (eventData && eventData.length > 0) {
          const mainEvent = eventData[0] as SportsEvent;
          setActiveEvent(mainEvent);
          setscoreColombia(mainEvent.home_score);
          setscoreBrasil(mainEvent.away_score);
          setMatchMinute(mainEvent.match_minute);
        }
      } catch (error) {
        console.error("Error loading initial Supabase data:", error);
      }
    }

    initData();
  }, []);

  // 2. Realtime Listener: Subscribe to changes in the active sports event
  useEffect(() => {
    if (!activeEvent?.id) return;

    const channel = supabase
      .channel(`sports-event-${activeEvent.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "sports_events",
          filter: `id=eq.${activeEvent.id}`,
        },
        (payload: any) => {
          const updatedEvent = payload.new as SportsEvent;
          setActiveEvent(updatedEvent);
          setscoreColombia(updatedEvent.home_score);
          setscoreBrasil(updatedEvent.away_score);
          setMatchMinute(updatedEvent.match_minute);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeEvent?.id]);

  // 2.5. Realtime Listener: Subscribe to changes in the active campaign
  useEffect(() => {
    if (!activeCampaign?.id) return;

    const channel = supabase
      .channel(`campaign-${activeCampaign.id}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "campaigns",
          filter: `id=eq.${activeCampaign.id}`,
        },
        (payload: any) => {
          const updatedCampaign = payload.new as Campaign;
          setActiveCampaign(updatedCampaign);
          setCampaignApproved(updatedCampaign.status === "published" || updatedCampaign.status === "approved");
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeCampaign?.id]);

  // 3. Campaign Sync: Fetch campaign and generations based on chosen neighborhood and event
  useEffect(() => {
    async function syncCampaign() {
      if (!activeEvent?.id || businesses.length === 0) return;

      const currentBiz = businesses.find(
        (b) => b.neighborhood.toLowerCase() === selectedNeighborhood.toLowerCase()
      );

      if (!currentBiz) return;

      try {
        const { data: campaignData, error: campaignError } = await supabase
          .from("campaigns")
          .select("*")
          .eq("business_id", currentBiz.id)
          .eq("sports_event_id", activeEvent.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (campaignError) throw campaignError;

        if (campaignData && campaignData.length > 0) {
          const campaign = campaignData[0] as Campaign;
          setActiveCampaign(campaign);
          setCampaignApproved(campaign.status === "published" || campaign.status === "approved");

          const { data: genData, error: genError } = await supabase
            .from("ai_generations")
            .select("*")
            .eq("campaign_id", campaign.id);

          if (genError) throw genError;
          if (genData) setAiGenerations(genData);
        } else {
          setActiveCampaign(null);
          setAiGenerations([]);
          setCampaignApproved(false);
        }
      } catch (error) {
        console.error("Error fetching campaign data:", error);
      }
    }

    syncCampaign();
  }, [selectedNeighborhood, activeEvent?.id, businesses]);

  // ── Toast helpers ─────────────────────────────────────────────────────────
  const addToast = useCallback((type: Toast["type"], message: string, durationMs = 4000) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, type, message }]);
    if (type !== "loading") {
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), durationMs);
    }
    return id;
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // Simulated copies based on settings (MOCK FALLBACKS — texto limpio)
  const copyOptions: Record<string, Record<string, string>> = {
    laureles: {
      paisa: "¡GOLAZO del Verde, parce! ⚽🔥 Celebra el gol de Colombia en *El Templo de Laureles*. Por los próximos 30 minutos, toda la cerveza Águila está a 2x1. ¡Caigan pues antes de que se acabe! 🍻💚 #Colombia #Laureles #PaisaVibes",
      premium: "¡Gol de Colombia! 🇨🇴✨ Vive la pasión del Mundial con nuestra promoción exclusiva: 2x1 en cócteles seleccionados por la próxima hora en nuestra terraza en Laureles. Reserva tu mesa ahora. 🍹⚽ #FanFestStyle #Laureles"
    },
    poblado: {
      paisa: "¡Qué golazo de mi Verde, mor! 💚 Estalló el Mundial en El Poblado. Vente ya para *FanFest Lounge* y celebra con Heineken en balde a mitad de precio por los próximos 30 min. ¡Se prendió esto! 🍻🔥 #ElPoblado #PaisaStyle",
      premium: "Goal by Colombia! ⚽🏆 Celebrate the World Cup at *FanFest Lounge Poblado*. Enjoy our premium draft beers with a 30% discount for the next hour. Premium vibe for real fans. 🍺🥂 #Poblado #SportsLounge"
    },
    envigado: {
      paisa: "¡Goooool del Verde, muchachos! ⚽🔥 Envigado se viste de fiesta. Por cada gol de Colombia, la segunda picada va con 50% de descuento en *La Fonda del Gol*. ¡Vengan pues que el partido está de infarto! 🥩🍻 #Envigado #Mundial2026",
      premium: "Colombia abre el marcador. ⚽ Disfruta de una experiencia gastronómica premium en Envigado: te obsequiamos una entrada de autor por consumos superiores a $100K durante el resto del encuentro. 🍽️⚽ #EnvigadoGourmet"
    }
  };

  const getCampaignCopy = () => {
    if (liveGeneratedText) return liveGeneratedText;

    if (aiGenerations.length > 0) {
      const matchedGen = aiGenerations.find((gen) => {
        const prompt = (gen.prompt_system || "").toLowerCase();
        if (selectedTone === "paisa") return prompt.includes("paisa");
        if (selectedTone === "premium") return prompt.includes("premium") || prompt.includes("bilingual");
        return gen.is_selected;
      });
      if (matchedGen?.response_text) return matchedGen.response_text;
    }

    return copyOptions[selectedNeighborhood]?.[selectedTone] || copyOptions.laureles.paisa;
  };

  const handleSimulateGoal = async () => {
    setIsGenerating(true);
    setCampaignApproved(false);

    const nextScore = scoreColombia + 1;
    const nextMinute = 78;

    if (activeEvent?.id) {
      try {
        const { error } = await supabase
          .from("sports_events")
          .update({
            home_score: nextScore,
            match_minute: nextMinute,
            status: "live",
          } as any)
          .eq("id", activeEvent.id);

        if (error) throw error;
      } catch (error) {
        console.error("Error updating match in Supabase:", error);
        setscoreColombia(nextScore);
        setMatchMinute(nextMinute);
      }
    } else {
      setscoreColombia(nextScore);
      setMatchMinute(nextMinute);
    }

    setLiveGeneratedText(null);
    setTimeout(() => {
      setIsGenerating(false);
    }, 800);
  };

  // ── Real Gemini Regenerate ────────────────────────────────────────────────
  const handleRegenerate = async () => {
    if (isRegenerating) return;

    const currentBiz = businesses.find(
      (b: Business) => b.neighborhood.toLowerCase() === selectedNeighborhood.toLowerCase()
    );

    if (!currentBiz) {
      addToast("error", "No se encontró el negocio seleccionado.");
      return;
    }

    setIsRegenerating(true);
    const loadingId = addToast("loading", "✨ Gemini está generando tu copy...");

    try {
      const requestBody = {
        business_id: currentBiz.id,
        campaign_id: activeCampaign?.id ?? undefined,
        sports_event_id: activeEvent?.id ?? undefined,
        tone: selectedTone as "paisa" | "premium",
        context: {
          business_name: currentBiz.name,
          neighborhood: currentBiz.neighborhood,
          home_team: activeEvent?.home_team ?? "Colombia",
          away_team: activeEvent?.away_team ?? "Brasil",
          score: `${scoreColombia}-${scoreBrasil}`,
          minute: matchMinute,
          scorer: (activeEvent as any)?.event_metadata?.goals?.slice(-1)[0]?.player ?? "Luis Díaz",
          discount: "2x1 en cerveza Águila",
          duration_minutes: 30,
        },
      };

      const res = await fetch(EDGE_FN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "apikey": SUPABASE_ANON_KEY,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error ?? "Error desconocido en la generación");
      }

      setLiveGeneratedText(data.generated_text);
      setCampaignApproved(false);

      if (data.campaign_id && (!activeCampaign || activeCampaign.id !== data.campaign_id)) {
        const { data: newCamp } = await supabase
          .from("campaigns")
          .select("*")
          .eq("id", data.campaign_id)
          .single();
        if (newCamp) setActiveCampaign(newCamp as Campaign);
      }

      removeToast(loadingId as unknown as number);
      addToast("success", `✅ Copy generado con ${data.model} (${data.tokens?.total ?? "?"} tokens)`);
    } catch (err: any) {
      console.error("Regenerate error:", err);
      removeToast(loadingId as unknown as number);
      addToast("error", `❌ ${err.message ?? "Error al generar copy"}`);
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApprove = async () => {
    if (activeCampaign?.id) {
      const loadingId = addToast("loading", "🚀 Enviando aprobación de campaña...");
      try {
        const { error } = await supabase
          .from("campaigns")
          .update({
            status: "approved",
            approved_at: new Date().toISOString(),
          } as any)
          .eq("id", activeCampaign.id);

        if (error) throw error;
        removeToast(loadingId as unknown as number);
        addToast("success", "✅ Campaña aprobada. Publicando en redes sociales...");
        setCampaignApproved(true);
      } catch (error: any) {
        console.error("Error approving campaign in Supabase:", error);
        removeToast(loadingId as unknown as number);
        addToast("error", `❌ Error al aprobar campaña: ${error.message || "Error desconocido"}`);
      }
    } else {
      setCampaignApproved(true);
    }
  };


  return (
    <div className="min-h-screen bg-[#07080b] text-[#e2e8f0] font-sans antialiased selection:bg-[#c6ff00] selection:text-black">

      {/* ── Toast Notifications ─────────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-sm font-medium shadow-2xl backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 duration-300 ${
              toast.type === "success"
                ? "bg-emerald-950/90 border-emerald-500/40 text-emerald-300"
                : toast.type === "error"
                ? "bg-red-950/90 border-red-500/40 text-red-300"
                : "bg-zinc-900/90 border-zinc-700/60 text-zinc-300"
            }`}
          >
            {toast.type === "loading" && (
              <span className="w-3.5 h-3.5 rounded-full border-2 border-zinc-500 border-t-[#c6ff00] animate-spin shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        ))}
      </div>

      {/* Background gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c6ff00]/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Navigation Header */}
      <header className="border-b border-zinc-800 bg-[#0c0d12]/80 backdrop-blur-md sticky top-0 z-50">
        {/* Demo mode banner */}
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-center">
          <p className="text-[11px] text-amber-400 font-medium">
            👁️ Modo Demo — Estás viendo datos de ejemplo.{" "}
            <a href="/login" className="underline font-bold hover:text-amber-300 transition-colors">
              Accede a tu panel real →
            </a>
          </p>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#c6ff00] text-black font-extrabold px-3 py-1 rounded-sm tracking-wider text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,255,0,0.25)]">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse"></span>
              FANFEST AI
            </div>
            <span className="text-xs text-zinc-500 hidden sm:inline">Demo Interactivo</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-xs bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
              Live Sports API Connected
            </div>
            <a
              href="/login"
              id="header-login-btn"
              className="text-xs font-bold text-[#c6ff00] border border-[#c6ff00]/30 px-4 py-2 rounded-lg hover:bg-[#c6ff00]/10 transition-colors"
            >
              Acceder
            </a>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            Dashboard de Marketing Contextual
          </h1>
          <p className="text-sm text-zinc-400">
            Automatización inteligente en tiempo real para tu negocio local basado en eventos deportivos en vivo.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT SIDEBAR: Settings & Live Game (4 Cols) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Widget 1: Live Match Ticker */}
            <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-5 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full blur-xl"></div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs text-zinc-400 font-semibold tracking-wider uppercase flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"></span>
                  En Vivo • MUNDIAL 2026
                </span>
                <span id="live-time" className="text-xs bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono">
                  {matchMinute}&apos;
                </span>
              </div>

              <div className="flex items-center justify-between gap-4 py-4 border-y border-zinc-800 mb-4">
                {/* Colombia */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <div className="w-12 h-12 rounded-full border border-emerald-500/30 flex items-center justify-center mb-2 overflow-hidden bg-zinc-900">
                    <img
                      src="https://flagcdn.com/w80/co.png"
                      alt="Colombia"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-bold text-white leading-tight">Colombia</span>
                </div>

                <div className="flex flex-col items-center gap-1">
                  <div className="text-3xl font-black font-mono tracking-wider text-white">
                    {scoreColombia} - {scoreBrasil}
                  </div>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-widest font-semibold">Marcador</span>
                </div>

                {/* Brasil */}
                <div className="flex flex-col items-center flex-1 text-center">
                  <div className="w-12 h-12 rounded-full border border-yellow-500/30 flex items-center justify-center mb-2 overflow-hidden bg-zinc-900">
                    <img
                      src="https://flagcdn.com/w80/br.png"
                      alt="Brasil"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <span className="text-sm font-bold text-white leading-tight">Brasil</span>
                </div>
              </div>

              <button
                id="simulate-goal-btn"
                onClick={handleSimulateGoal}
                className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs py-2 px-4 rounded-lg border border-zinc-700 transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
              >
                ⚽ Simular Gol de Colombia
              </button>
            </div>

            {/* Widget 2: Business Profile Configuration */}
            <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-5 shadow-xl">
              <h2 className="text-md font-bold text-white mb-4 flex items-center gap-2">
                ⚙️ Configuración del Negocio
              </h2>
              
              <div className="flex flex-col gap-4">
                {/* Neighborhood selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Sede / Barrio (Medellín)</label>
                  <select
                    id="neighborhood-select"
                    value={selectedNeighborhood}
                    onChange={(e) => setSelectedNeighborhood(e.target.value)}
                    className="bg-[#12131a] border border-zinc-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#c6ff00] transition-all cursor-pointer"
                  >
                    {businesses.length > 0 ? (
                      businesses.map((biz) => (
                        <option key={biz.id} value={biz.neighborhood.toLowerCase()}>
                          {biz.neighborhood.charAt(0).toUpperCase() + biz.neighborhood.slice(1)} ({biz.name})
                        </option>
                      ))
                    ) : (
                      <>
                        <option value="laureles">Laureles (El Templo Bar)</option>
                        <option value="poblado">El Poblado (FanFest Lounge)</option>
                        <option value="envigado">Envigado (La Fonda del Gol)</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Tone selector */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-zinc-400 font-medium">Tono y Dialecto (IA Gemini)</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="tone-paisa-btn"
                      onClick={() => setSelectedTone("paisa")}
                      className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                        selectedTone === "paisa"
                          ? "bg-[#c6ff00]/10 border-[#c6ff00] text-[#c6ff00]"
                          : "bg-[#12131a] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      🗣️ Dialecto Paisa
                    </button>
                    <button
                      id="tone-premium-btn"
                      onClick={() => setSelectedTone("premium")}
                      className={`text-xs py-2 px-3 rounded-lg border font-medium transition-all ${
                        selectedTone === "premium"
                          ? "bg-[#c6ff00]/10 border-[#c6ff00] text-[#c6ff00]"
                          : "bg-[#12131a] border-zinc-800 text-zinc-400 hover:border-zinc-700"
                      }`}
                    >
                      ✨ Premium / Neutro
                    </button>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="mt-2 pt-4 border-t border-zinc-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Instagram Business</span>
                    <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Vinculado
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Límite de API (Gemini Free)</span>
                    <span className="text-zinc-300 font-medium">9/1,500 reqs/día</span>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT CONTENT: Generated Campaign Preview (8 Cols) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* Generated Campaign Card */}
            <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl overflow-hidden shadow-xl flex flex-col">
              
              {/* Card Header */}
              <div className="bg-[#12131a] px-6 py-4 border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-[#c6ff00]/10 text-[#c6ff00] px-2 py-0.5 rounded font-mono font-semibold">
                      {activeCampaign
                        ? `CAMP-${activeCampaign.id.slice(0, 8).toUpperCase()}`
                        : "CAMP-MOCK-042"}
                    </span>
                    <span className="text-xs text-zinc-500">
                      Generado por {aiGenerations.length > 0
                        ? aiGenerations[0].model
                        : "Gemini 2.0 Flash"}
                    </span>
                  </div>
                  <h3 className="text-md font-bold text-white mt-1">Campaña Contextual Lista</h3>
                </div>
                {activeCampaign ? (
                  activeCampaign.status === "published" ? (
                    <div className="text-xs text-emerald-400 flex items-center gap-1.5 self-start sm:self-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                      Publicado
                    </div>
                  ) : activeCampaign.status === "approved" ? (
                    <div className="text-xs text-amber-400 flex items-center gap-1.5 self-start sm:self-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Publicando...
                    </div>
                  ) : (
                    <div className="text-xs text-zinc-400 flex items-center gap-1.5 self-start sm:self-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
                      Pendiente de Aprobación
                    </div>
                  )
                ) : (
                  <div className="text-xs text-zinc-400 flex items-center gap-1.5 self-start sm:self-center">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    Pendiente de Aprobación
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
                
                {/* Copy content */}
                <div className="md:col-span-7 flex flex-col justify-between gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold">Copy Recomendado</span>
                    {isGenerating ? (
                      <div className="space-y-2 animate-pulse py-2">
                        <div className="h-4 bg-zinc-800 rounded w-3/4"></div>
                        <div className="h-4 bg-zinc-800 rounded w-5/6"></div>
                        <div className="h-4 bg-zinc-800 rounded w-2/3"></div>
                      </div>
                    ) : (
                      <div className="bg-[#12131a] border border-zinc-800/80 rounded-lg p-4 text-sm text-zinc-200 leading-relaxed font-mono whitespace-pre-wrap select-all">
                        {getCampaignCopy()}
                      </div>
                    )}
                  </div>

                  <div className="bg-[#161d12] border border-emerald-950/60 rounded-lg p-3 text-xs text-emerald-400 flex gap-2.5">
                    <div className="text-base">🧠</div>
                    <div>
                      <span className="font-bold">Lógica Contextual Paisa:</span> Adaptación de jerga local paisa activa para la sede de {selectedNeighborhood.toUpperCase()}. Se añadió la promoción 2x1 en cerveza al detectar gol local.
                    </div>
                  </div>
                </div>

                {/* Image Preview mockup */}
                <div className="md:col-span-5">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider font-bold block mb-2">Visual del Post (Instagram Feed)</span>
                  
                  <div className="relative aspect-square w-full rounded-lg overflow-hidden border border-zinc-700 bg-gradient-to-br from-emerald-900 via-zinc-950 to-black flex flex-col justify-between p-5 shadow-2xl">
                    <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(198,255,0,0.1),transparent)] pointer-events-none"></div>
                    
                    {/* Poster Top */}
                    <div className="flex justify-between items-start z-10">
                      <div className="bg-black/60 backdrop-blur-md border border-zinc-800 px-2 py-1 rounded text-[9px] font-bold tracking-widest text-[#c6ff00] uppercase flex items-center gap-1.5">
                        <img src="https://flagcdn.com/w20/co.png" alt="🇨🇴" className="w-4 h-3 object-cover rounded-sm" />
                        COLOMBIA
                      </div>
                      <div className="bg-[#c6ff00] text-black text-[9px] font-black px-2 py-0.5 rounded shadow">
                        GOL DE LOCAL
                      </div>
                    </div>

                    {/* Poster Center */}
                    <div className="text-center my-auto z-10">
                      <h4 className="text-[#c6ff00] font-black text-4xl italic tracking-tighter uppercase drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)]">
                        ¡2X1 HOY!
                      </h4>
                      <p className="text-white text-xs font-semibold tracking-wide uppercase drop-shadow mt-1">
                        CERVEZA ÁGUILA
                      </p>
                      <p className="text-zinc-400 text-[9px] font-mono mt-2">
                        Válido por los próximos 30 minutos
                      </p>
                    </div>

                    {/* Poster Bottom */}
                    <div className="flex justify-between items-end border-t border-white/10 pt-2 z-10">
                      <span className="text-[10px] font-bold text-white tracking-tight">El Templo Bar</span>
                      <span className="text-[9px] text-[#c6ff00] font-mono">Medellín • Mundial 2026</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="bg-[#12131a] px-6 py-4 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    id="edit-copy-btn"
                    className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] border border-zinc-700"
                  >
                    ✏️ Editar Texto
                  </button>
                  <button
                    id="regenerate-btn"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="bg-zinc-800 hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed text-zinc-200 text-xs font-semibold py-2.5 px-4 rounded-lg transition-all active:scale-[0.98] border border-zinc-700 flex items-center gap-2"
                  >
                    {isRegenerating ? (
                      <>
                        <span className="w-3 h-3 rounded-full border-2 border-zinc-500 border-t-[#c6ff00] animate-spin" />
                        Generando...
                      </>
                    ) : (
                      <>🔄 Regenerar con Gemini</>
                    )}
                  </button>
                </div>

                <div>
                  {activeCampaign ? (
                    activeCampaign.status === "published" ? (
                      <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        ✅ ¡Publicado Exitosamente en Instagram!
                      </div>
                    ) : activeCampaign.status === "approved" ? (
                      <div className="bg-amber-500/10 text-amber-400 border border-amber-500/30 px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin mr-1" />
                        ⏳ Publicando en Instagram...
                      </div>
                    ) : (
                      <button
                        id="approve-publish-btn"
                        onClick={handleApprove}
                        className="bg-[#c6ff00] hover:bg-[#b0e000] text-black text-xs font-extrabold py-2.5 px-6 rounded-lg transition-all shadow-[0_4px_20px_rgba(198,255,0,0.35)] active:scale-[0.98] hover:shadow-[0_4px_25px_rgba(198,255,0,0.5)]"
                      >
                        🚀 Aprobar y Publicar en Instagram
                      </button>
                    )
                  ) : campaignApproved ? (
                    <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-5 py-2.5 rounded-lg text-xs font-bold flex items-center gap-2">
                      ✅ ¡Publicado Exitosamente en Instagram!
                    </div>
                  ) : (
                    <button
                      id="approve-publish-btn"
                      onClick={handleApprove}
                      className="bg-[#c6ff00] hover:bg-[#b0e000] text-black text-xs font-extrabold py-2.5 px-6 rounded-lg transition-all shadow-[0_4px_20px_rgba(198,255,0,0.35)] active:scale-[0.98] hover:shadow-[0_4px_25px_rgba(198,255,0,0.5)]"
                    >
                      🚀 Aprobar y Publicar en Instagram
                    </button>
                  )}
                </div>
              </div>

            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#c6ff00]/10 flex items-center justify-center text-lg text-[#c6ff00]">
                  📈
                </div>
                <div>
                  <div className="text-2xl font-black text-white">4.8%</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Engagement Promedio</div>
                </div>
              </div>

              <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#c6ff00]/10 flex items-center justify-center text-lg text-[#c6ff00]">
                  ⚡
                </div>
                <div>
                  <div className="text-2xl font-black text-white">12s</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Tiempo de Reacción</div>
                </div>
              </div>

              <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-5 shadow-xl flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#c6ff00]/10 flex items-center justify-center text-lg text-[#c6ff00]">
                  🔥
                </div>
                <div>
                  <div className="text-2xl font-black text-white">14</div>
                  <div className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">Campañas del Mes</div>
                </div>
              </div>

            </div>

          </div>

        </div>

        {/* CRM Dashboard Section (MVP Pilot) */}
        <div className="mt-12 bg-[#0c0d12] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
          <div className="bg-[#12131a] px-6 py-4 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                📋 CRM Piloto Medellín (WhatsApp)
              </h2>
              <p className="text-xs text-zinc-400 mt-1">Estado de onboarding y follow-up de negocios beta.</p>
            </div>
            <div className="text-xs bg-[#c6ff00]/10 text-[#c6ff00] px-3 py-1 rounded-full font-bold border border-[#c6ff00]/20">
              {crmData.length} Negocios Registrados
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#161720] text-zinc-400 text-xs uppercase tracking-wider font-semibold">
                  <th className="p-4 border-b border-zinc-800">Negocio</th>
                  <th className="p-4 border-b border-zinc-800">Sede</th>
                  <th className="p-4 border-b border-zinc-800">Status CRM</th>
                  <th className="p-4 border-b border-zinc-800">Bienvenida WA</th>
                  <th className="p-4 border-b border-zinc-800">Contenido Enviado</th>
                  <th className="p-4 border-b border-zinc-800">Follow-up Resp.</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {crmData.length > 0 ? (
                  crmData.map((row: any) => (
                    <tr key={row.business_id} className="border-b border-zinc-800/50 hover:bg-[#12131a]/50 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-white">{row.business_name}</div>
                        <div className="text-xs text-zinc-500">{row.owner_name} • {row.whatsapp}</div>
                      </td>
                      <td className="p-4">
                        <span className="capitalize">{row.neighborhood}</span>
                        <div className="text-xs text-zinc-500 capitalize">{row.business_type}</div>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold ${
                          row.crm_status === 'contacted' ? 'bg-amber-500/10 text-amber-500' :
                          row.crm_status === 'pilot_active' ? 'bg-[#c6ff00]/10 text-[#c6ff00]' :
                          'bg-zinc-800 text-zinc-400'
                        }`}>
                          {row.crm_status}
                        </span>
                      </td>
                      <td className="p-4">
                        {row.welcome_sent ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> Sí</span>
                        ) : (
                          <span className="text-zinc-500">Pendiente</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-zinc-300">{row.pre_match_contents_sent} Partidos</div>
                      </td>
                      <td className="p-4">
                        {row.confirmed_publications > 0 ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1.5">✅ Publicó ({row.confirmed_publications})</span>
                        ) : row.followups_sent > 0 ? (
                          <span className="text-amber-500">Esperando resp.</span>
                        ) : (
                          <span className="text-zinc-500">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-zinc-500 text-sm">
                      Aún no hay negocios registrados en el piloto. Envía la landing page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-900 bg-[#090a0f] py-8 mt-12 text-center text-xs text-zinc-600">
        <p>© 2026 FanFest AI. Hecho en Medellín, Colombia. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
