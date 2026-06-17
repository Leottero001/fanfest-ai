"use client";

import { useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";

interface UserData {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  isAdmin: boolean;
}

interface BusinessData {
  id: string;
  name: string;
  neighborhood: string;
  slug: string;
  tone_default: string;
  instagram_handle: string | null;
  role: string;
}

interface Props {
  user: UserData;
  businesses: BusinessData[];
}

export default function AppDashboardClient({ user, businesses }: Props) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await (supabase as any).auth.signOut();
    router.push("/login");
  };

  const initials = user.fullName
    ? user.fullName.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-[#07080b] text-[#e2e8f0] font-sans antialiased">
      
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c6ff00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-[#0c0d12]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#c6ff00] text-black font-extrabold px-3 py-1 rounded-sm tracking-wider text-sm flex items-center gap-1.5 shadow-[0_0_15px_rgba(198,255,0,0.25)]">
              <span className="w-2 h-2 rounded-full bg-black animate-pulse" />
              FANFEST AI
            </div>
            <span className="text-xs text-zinc-500 hidden sm:inline">Mi Panel</span>
            
            {/* Paso 3: Renderizado condicional en UI */}
            {user.isAdmin && (
              <a href="/app/admin" className="ml-2 bg-zinc-800 text-[#c6ff00] border border-[#c6ff00]/30 hover:bg-zinc-700 text-xs font-bold px-3 py-1 rounded-md transition-colors flex items-center gap-1.5">
                <span>👑</span> Admin
              </a>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-xs font-semibold text-white leading-tight">
                {user.fullName || "Mi Cuenta"}
              </p>
              <p className="text-[11px] text-zinc-500">{user.email}</p>
            </div>
            
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-[#c6ff00]/10 border border-[#c6ff00]/30 flex items-center justify-center text-xs font-black text-[#c6ff00] select-none">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.avatarUrl} alt={initials} className="w-full h-full rounded-full object-cover" />
              ) : (
                initials
              )}
            </div>

            <button
              id="logout-btn"
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="text-xs text-zinc-500 hover:text-zinc-200 px-3 py-2 rounded-lg hover:bg-zinc-800 transition-all disabled:opacity-50"
            >
              {isLoggingOut ? "Saliendo..." : "Cerrar sesión"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Welcome */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mb-2">
            {user.fullName ? `Hola, ${user.fullName.split(" ")[0]} 👋` : "Bienvenido de nuevo 👋"}
          </h1>
          <p className="text-sm text-zinc-400">
            Gestiona las campañas y automatizaciones de tus negocios vinculados a FanFest AI.
          </p>
        </div>

        {/* Businesses Grid */}
        {businesses.length > 0 ? (
          <>
            <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-5">
              Mis Negocios ({businesses.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
              {businesses.map((biz) => (
                <div
                  key={biz.id}
                  className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-5 hover:border-zinc-600 transition-all group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#c6ff00]/5 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#c6ff00]/20 to-emerald-500/10 border border-[#c6ff00]/20 flex items-center justify-center text-lg">
                      🏪
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      biz.role === "owner"
                        ? "bg-[#c6ff00]/10 text-[#c6ff00] border border-[#c6ff00]/20"
                        : "bg-zinc-800 text-zinc-400"
                    }`}>
                      {biz.role === "owner" ? "Propietario" : biz.role}
                    </span>
                  </div>

                  <h3 className="text-white font-bold text-lg leading-tight mb-1">{biz.name}</h3>
                  <p className="text-zinc-500 text-xs capitalize mb-4">{biz.neighborhood} · Medellín</p>

                  {biz.instagram_handle && (
                    <p className="text-xs text-zinc-600 mb-4">
                      <span className="text-zinc-500">@</span>{biz.instagram_handle.replace("@", "")}
                    </p>
                  )}

                  <a
                    href={`/dashboard?neighborhood=${biz.neighborhood.toLowerCase()}&tone=${biz.tone_default.toLowerCase()}`}
                    className="w-full bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold py-2.5 px-4 rounded-lg transition-all flex items-center justify-center gap-1.5 group-hover:bg-[#c6ff00]/10 group-hover:text-[#c6ff00] group-hover:border group-hover:border-[#c6ff00]/20"
                  >
                    Ver Campañas →
                  </a>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Empty State — no businesses yet */
          <div className="bg-[#0c0d12] border border-zinc-800 border-dashed rounded-2xl p-12 text-center mb-12">
            <div className="text-5xl mb-4">🏗️</div>
            <h3 className="text-xl font-bold text-white mb-2">Tu cuenta está lista</h3>
            <p className="text-sm text-zinc-400 max-w-sm mx-auto mb-6 leading-relaxed">
              Aún no tienes negocios vinculados. El equipo de FanFest AI configurará tu perfil de negocio y te avisará por WhatsApp cuando esté listo.
            </p>
            <a
              href="mailto:hola@fanfestai.co"
              className="inline-flex items-center gap-2 bg-[#c6ff00]/10 text-[#c6ff00] border border-[#c6ff00]/20 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-[#c6ff00]/20 transition-colors"
            >
              Contactar al equipo
            </a>
          </div>
        )}

        {/* Quick Access — Link to Demo */}
        <div className="bg-gradient-to-r from-zinc-900 to-[#0c0d12] border border-zinc-800 rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-white font-bold mb-1">Panel de Demo Interactivo</h3>
            <p className="text-sm text-zinc-400">Explora todas las funcionalidades con datos de ejemplo del piloto.</p>
          </div>
          <a
            href="/dashboard"
            className="shrink-0 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-all border border-zinc-700 flex items-center gap-2"
          >
            Abrir Demo →
          </a>
        </div>
      </main>
    </div>
  );
}
