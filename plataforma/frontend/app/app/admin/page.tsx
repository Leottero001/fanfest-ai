import Link from "next/link";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "../../lib/supabaseServer";

type CrmRow = {
  business_id: string;
  business_name: string;
  owner_name: string;
  whatsapp: string;
  neighborhood: string;
  business_type: string;
  crm_status: string;
  welcome_sent: boolean;
  pre_match_contents_sent: number;
  confirmed_publications: number;
  followups_sent: number;
};

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

  // Fetch CRM Data
  const { data: crmDataFetch } = await supabase
    .from("v_pilot_crm_dashboard")
    .select("*")
    .order("registered_at", { ascending: false });
    
  const crmData: CrmRow[] = (crmDataFetch as CrmRow[] | null) ?? [];

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
          <Link href="/app/dashboard" className="text-sm bg-zinc-800 hover:bg-zinc-700 px-5 py-2.5 rounded-lg border border-zinc-700 font-semibold transition-colors">
            ← Volver al Dashboard
          </Link>
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

        {/* CRM Dashboard Section (MVP Pilot) Movido al Admin */}
        <div className="mt-8 bg-[#0c0d12] border border-zinc-800 rounded-xl overflow-hidden shadow-xl">
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
                  crmData.map((row) => (
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

      </div>
    </div>
  );
}
