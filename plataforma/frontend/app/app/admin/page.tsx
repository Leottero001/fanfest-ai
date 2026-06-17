import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

export default async function AdminPage() {
  const supabase = await createSupabaseServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // Verificación is_admin a nivel Servidor (Paso 2)
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_admin")
    .eq("id", user.id)
    .single();

  if (!profile?.is_admin) {
    redirect("/app/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-[#e2e8f0] font-sans antialiased p-8">
      {/* Background glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#c6ff00]/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold text-[#c6ff00] flex items-center gap-3">
              <span className="text-4xl">👑</span> Panel de Administración
            </h1>
            <p className="text-zinc-400 mt-2">Área restringida exclusiva para equipo interno de FanFest AI.</p>
          </div>
          <a href="/app/dashboard" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-lg border border-zinc-700 font-semibold transition-colors">
            ← Volver al Dashboard
          </a>
        </header>

        <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-8 shadow-xl mb-8">
          <p className="text-zinc-300 mb-6">Has verificado correctamente tu acceso como administrador. Aquí podrás construir la gestión de negocios, promociones, o cualquier herramienta interna.</p>
        </div>

        {/* Status Indicators Movidos desde el Demo */}
        <div className="bg-[#0c0d12] border border-zinc-800 rounded-xl p-8 shadow-xl">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            🔌 Estado de Integraciones Globales
          </h2>
          <div className="flex flex-col gap-4 max-w-md">
            <div className="flex items-center justify-between text-sm bg-[#12131a] p-4 rounded-lg border border-zinc-800/80">
              <span className="text-zinc-400">WhatsApp Business API</span>
              <span className="text-[#c6ff00] font-semibold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#c6ff00] shadow-[0_0_8px_#c6ff00]"></span> Activo
              </span>
            </div>
            <div className="flex items-center justify-between text-sm bg-[#12131a] p-4 rounded-lg border border-zinc-800/80">
              <span className="text-zinc-400">Límite de API (Gemini Free)</span>
              <div className="flex items-center gap-3">
                <div className="w-24 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full w-[1%]"></div>
                </div>
                <span className="text-zinc-300 font-medium font-mono text-xs">9 / 1,500 reqs/día</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
