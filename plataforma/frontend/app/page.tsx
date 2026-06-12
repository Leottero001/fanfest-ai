"use client";

import { useState } from "react";
import { supabase } from "./lib/supabaseClient";

export default function LandingPage() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    // Responsable
    owner_name: "",
    owner_role: "",
    whatsapp: "",
    email: "",
    owner_instagram: "",
    
    // Negocio
    business_name: "",
    business_type: "",
    neighborhood: "",
    city: "Medellín",
    instagram: "",
    capacity_approx: "",
    will_stream_world_cup: true,
    
    // Validación
    current_promo_methods: [] as string[],
    world_cup_interest: [] as string[],
    wants_free_pilot: true,
    
    // Identidad Digital
    target_audience: [] as string[],
    communication_tone: "",
    specialties: "",
    usual_promos: "",
    preferred_hashtags: "",
    active_social_networks: [] as string[],
    preferred_language: "Español",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      
      // Handle arrays (multiple checkboxes)
      if (name === "current_promo_methods" || name === "world_cup_interest" || name === "target_audience" || name === "active_social_networks") {
        setFormData(prev => {
          const arr = prev[name];
          if (checked) {
            return { ...prev, [name]: [...arr, value] };
          } else {
            return { ...prev, [name]: arr.filter(item => item !== value) };
          }
        });
      } else {
        // Handle boolean checkboxes
        setFormData(prev => ({ ...prev, [name]: checked }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const nextStep = () => setStep(prev => prev + 1);
  const prevStep = () => setStep(prev => prev - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        specialties: formData.specialties.split(',').map(s => s.trim()).filter(Boolean),
        usual_promos: formData.usual_promos.split(',').map(s => s.trim()).filter(Boolean),
        preferred_hashtags: formData.preferred_hashtags.split(',').map(s => s.trim()).filter(Boolean)
      };

      const { error } = await (supabase.from('beta_businesses') as any).insert([
        submissionData,
      ]);

      if (error) throw error;
      
      setIsSuccess(true);
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Hubo un error enviando tu solicitud. Por favor intenta de nuevo.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[#0c0d12] border border-[#c6ff00]/30 rounded-2xl p-8 text-center shadow-[0_0_50px_rgba(198,255,0,0.1)]">
          <div className="w-20 h-20 bg-[#c6ff00]/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">🏆</span>
          </div>
          <h2 className="text-2xl font-black text-white mb-2">¡Solicitud Recibida!</h2>
          <p className="text-zinc-400 mb-6">
            Gracias por tu interés, {formData.owner_name}. Hemos registrado a {formData.business_name} en nuestra lista prioritaria para el piloto del Mundial 2026. Te contactaremos pronto por WhatsApp.
          </p>
          <a href="/dashboard" className="inline-block bg-[#c6ff00] text-black font-bold py-3 px-8 rounded-lg hover:scale-105 transition-transform">
            Ver Demo Interactiva
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-[#e2e8f0] font-sans selection:bg-[#c6ff00] selection:text-black overflow-x-hidden">
      
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-[#c6ff00]/10 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-[#0066cc]/10 rounded-full blur-[120px]"></div>
        <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] bg-[#ff0000]/5 rounded-full blur-[100px]"></div>
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="text-white font-black tracking-tighter text-2xl flex items-center gap-2">
          <span className="w-3 h-3 bg-[#c6ff00] rounded-sm"></span>
          FANFEST<span className="text-zinc-500">AI</span>
        </div>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-xs font-semibold text-zinc-400 hover:text-white transition-colors px-3 py-2">
            Acceder →
          </a>
          <a href="#beta-form" className="text-xs font-bold text-[#c6ff00] border border-[#c6ff00]/30 px-4 py-2 rounded-full hover:bg-[#c6ff00]/10 transition-colors">
            Acceso Beta
          </a>
        </div>
      </nav>

      <main className="relative z-10">
        {/* Hero Section */}
        <section className="pt-20 pb-32 px-6 max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-zinc-300 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              Programa Piloto: Copa Mundial 2026
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black text-white leading-[0.9] tracking-tighter mb-8">
              CADA GOL<br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c6ff00] to-emerald-400">
                ES UNA VENTA.
              </span>
            </h1>
            
            <p className="text-xl text-zinc-400 mb-10 leading-relaxed">
              Multiplica la rentabilidad de tu local durante los partidos de la <strong className="text-white">Selección Colombia</strong>. 
              FanFest AI detecta goles en tiempo real, crea promociones contextuales y las publica en el Instagram de tu negocio automáticamente.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#beta-form" className="bg-[#c6ff00] text-black font-extrabold text-lg px-8 py-4 rounded-xl shadow-[0_0_30px_rgba(198,255,0,0.2)] hover:shadow-[0_0_40px_rgba(198,255,0,0.4)] hover:-translate-y-1 transition-all text-center">
                Únete a la Beta Privada
              </a>
              <a href="/dashboard" className="bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold text-lg px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2">
                Ver Demo <span>→</span>
              </a>
            </div>
            
            <div className="mt-10 flex items-center gap-6 text-sm font-medium text-zinc-500">
              <div className="flex items-center gap-2"><span className="text-[#c6ff00]">✓</span> 100% Automático</div>
              <div className="flex items-center gap-2"><span className="text-[#c6ff00]">✓</span> IA Contextual</div>
              <div className="flex items-center gap-2"><span className="text-[#c6ff00]">✓</span> Cero hardware</div>
            </div>
          </div>
          
          {/* Aesthetic Visual / Typographic Art */}
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 shadow-2xl flex items-center justify-center p-8 group">
            <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1518091043644-c1d4457512c6?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-luminosity grayscale group-hover:grayscale-0 transition-all duration-1000"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
            
            <div className="relative z-10 w-full">
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl transform rotate-[-2deg] group-hover:rotate-0 transition-transform duration-500">
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 via-blue-500 to-red-500 p-0.5">
                      <div className="w-full h-full bg-black rounded-full border-2 border-black"></div>
                    </div>
                    <div>
                      <div className="text-white text-xs font-bold">La Fonda del Gol</div>
                      <div className="text-zinc-500 text-[10px]">Patrocinado</div>
                    </div>
                  </div>
                  <div className="text-white font-bold tracking-widest text-lg">...</div>
                </div>
                
                <div className="bg-zinc-900 aspect-square rounded-xl mb-4 flex flex-col items-center justify-center border border-zinc-800 overflow-hidden relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/20 via-transparent to-red-500/20"></div>
                  <h3 className="text-[#c6ff00] text-5xl font-black italic -skew-x-6 tracking-tighter mb-2 relative z-10">¡GOLAZO!</h3>
                  <p className="text-white font-bold text-xl uppercase tracking-widest relative z-10">Luis Díaz • 78'</p>
                  <div className="mt-6 bg-[#c6ff00] text-black text-xs font-black px-4 py-2 uppercase tracking-widest rounded shadow-lg relative z-10">
                    2X1 Cerveza Nacional
                  </div>
                </div>
                
                <p className="text-zinc-300 text-sm">
                  ¡Qué golazo de Lucho, parce! 🇨🇴🔥 Celebra la victoria tricolor en La Fonda del Gol. Por los próximos 30 minutos, toda la cerveza Águila está a 2x1. ¡Caigan ya! 🍻💛💙❤️ #Colombia #Mundial2026
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Lead Capture Form Section */}
        <section id="beta-form" className="py-24 bg-black relative border-t border-white/5">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-[#c6ff00]/50 to-transparent"></div>
          
          <div className="max-w-3xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-black text-white tracking-tight mb-4">Postula tu Negocio</h2>
              <p className="text-zinc-400">
                Estamos construyendo el programa piloto exclusivo para el Mundial 2026 en Medellín y Área Metropolitana. Cupos limitados.
              </p>
            </div>

            <div className="bg-[#0c0d12] border border-zinc-800/80 rounded-2xl p-8 sm:p-12 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#c6ff00]/5 rounded-full blur-[80px]"></div>
              
              <form onSubmit={handleSubmit} className="relative z-10">
                
                {/* Step Indicators */}
                <div className="flex gap-2 mb-10">
                  <div className={`h-1.5 flex-1 rounded-full ${step >= 1 ? 'bg-[#c6ff00]' : 'bg-zinc-800'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full ${step >= 2 ? 'bg-[#c6ff00]' : 'bg-zinc-800'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full ${step >= 3 ? 'bg-[#c6ff00]' : 'bg-zinc-800'}`}></div>
                  <div className={`h-1.5 flex-1 rounded-full ${step >= 4 ? 'bg-[#c6ff00]' : 'bg-zinc-800'}`}></div>
                </div>

                {/* STEP 1: Datos del Responsable */}
                {step === 1 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c6ff00]/20 text-[#c6ff00] flex items-center justify-center text-xs">1</span>
                      Tus Datos
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre Completo *</label>
                        <input required type="text" name="owner_name" value={formData.owner_name} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="Ej. Juan Pérez" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Cargo *</label>
                        <input required type="text" name="owner_role" value={formData.owner_role} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="Ej. Dueño, Gerente" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">WhatsApp *</label>
                        <input required type="tel" name="whatsapp" value={formData.whatsapp} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="+57 300 000 0000" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Correo Electrónico *</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="tu@correo.com" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tu Instagram Personal (Opcional)</label>
                      <input type="text" name="owner_instagram" value={formData.owner_instagram} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="@usuario" />
                    </div>

                    <button type="button" onClick={nextStep} className="w-full bg-white text-black font-bold py-3.5 rounded-lg hover:bg-zinc-200 transition-colors mt-8">
                      Continuar →
                    </button>
                  </div>
                )}

                {/* STEP 2: Datos del Negocio */}
                {step === 2 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c6ff00]/20 text-[#c6ff00] flex items-center justify-center text-xs">2</span>
                      Datos del Negocio
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nombre del Negocio *</label>
                        <input required type="text" name="business_name" value={formData.business_name} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tipo *</label>
                        <select required name="business_type" value={formData.business_type} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3.5 text-white focus:outline-none focus:border-[#c6ff00] transition-colors">
                          <option value="">Selecciona...</option>
                          <option value="Gastrobar">Gastrobar</option>
                          <option value="Bar">Bar</option>
                          <option value="Restaurante">Restaurante</option>
                          <option value="Discoteca">Discoteca</option>
                          <option value="Otro">Otro</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Municipio *</label>
                        <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Barrio / Sector *</label>
                        <input required type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="Ej. Laureles, Provenza" />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Instagram del Negocio *</label>
                        <input required type="text" name="instagram" value={formData.instagram} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="@negocio" />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Capacidad (Personas)</label>
                        <select name="capacity_approx" value={formData.capacity_approx} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3.5 text-white focus:outline-none focus:border-[#c6ff00] transition-colors">
                          <option value="">Selecciona...</option>
                          <option value="0-50">Menos de 50</option>
                          <option value="51-100">51 a 100</option>
                          <option value="101-200">101 a 200</option>
                          <option value="200+">Más de 200</option>
                        </select>
                      </div>
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-[#12131a] border border-zinc-800 rounded-lg cursor-pointer hover:border-zinc-600 transition-colors">
                      <input type="checkbox" name="will_stream_world_cup" checked={formData.will_stream_world_cup} onChange={handleChange} className="w-5 h-5 accent-[#c6ff00]" />
                      <span className="text-sm font-medium text-white">¿Transmitirás los partidos del Mundial 2026?</span>
                    </label>

                    <div className="flex gap-4 mt-8">
                      <button type="button" onClick={prevStep} className="px-6 bg-zinc-800 text-white font-bold py-3.5 rounded-lg hover:bg-zinc-700 transition-colors">
                        Atrás
                      </button>
                      <button type="button" onClick={nextStep} className="flex-1 bg-white text-black font-bold py-3.5 rounded-lg hover:bg-zinc-200 transition-colors">
                        Continuar →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 3: Identidad Digital */}
                {step === 3 && (
                  <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c6ff00]/20 text-[#c6ff00] flex items-center justify-center text-xs">3</span>
                      Identidad Digital (IA)
                    </h3>
                    
                    <p className="text-sm text-zinc-400 mb-6">Esta información ayudará a FanFest AI a generar mensajes que suenen exactamente como tu marca.</p>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-white block">Público Objetivo (Elige varios)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Jóvenes (18-25)', 'Adultos Jóvenes (25-35)', 'Adultos (35-50)', 'Familias', 'Ejecutivos', 'Turistas', 'Estudiantes'].map(audience => (
                          <label key={audience} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.target_audience.includes(audience) ? 'bg-[#c6ff00]/10 border-[#c6ff00]' : 'bg-[#12131a] border-zinc-800 hover:border-zinc-700'}`}>
                            <input type="checkbox" name="target_audience" value={audience} checked={formData.target_audience.includes(audience)} onChange={handleChange} className="hidden" />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.target_audience.includes(audience) ? 'bg-[#c6ff00] border-[#c6ff00]' : 'border-zinc-600'}`}>
                              {formData.target_audience.includes(audience) && <span className="text-black text-[10px]">✓</span>}
                            </div>
                            <span className="text-sm text-zinc-300">{audience}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tono de Comunicación *</label>
                        <select required name="communication_tone" value={formData.communication_tone} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors">
                          <option value="">Selecciona...</option>
                          <option value="Formal">Formal</option>
                          <option value="Informal">Informal / Relajado</option>
                          <option value="Humorístico">Humorístico</option>
                          <option value="Apasionado">Apasionado / Futbolero</option>
                          <option value="Sofisticado">Sofisticado / Premium</option>
                          <option value="paisa">Paisa / Local</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Idioma Principal *</label>
                        <select required name="preferred_language" value={formData.preferred_language} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors">
                          <option value="Español">Español</option>
                          <option value="Inglés">Inglés</option>
                          <option value="Bilingüe">Bilingüe</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-2 mt-6">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Especialidades de la Casa</label>
                      <input type="text" name="specialties" value={formData.specialties} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="Ej. Cerveza artesanal, Alitas BBQ, Pantalla gigante (Separado por comas)" />
                    </div>

                    <div className="space-y-2 mt-6">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Promociones Habituales</label>
                      <input type="text" name="usual_promos" value={formData.usual_promos} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="Ej. 2x1 en cócteles, Happy Hour, Descuento en picadas" />
                    </div>

                    <div className="space-y-2 mt-6">
                      <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Hashtags Preferidos (Opcional)</label>
                      <input type="text" name="preferred_hashtags" value={formData.preferred_hashtags} onChange={handleChange} className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#c6ff00] transition-colors" placeholder="Ej. #MiBar, #FutbolMedellin" />
                    </div>

                    <div className="flex gap-4 mt-8">
                      <button type="button" onClick={prevStep} className="px-6 bg-zinc-800 text-white font-bold py-3.5 rounded-lg hover:bg-zinc-700 transition-colors">
                        Atrás
                      </button>
                      <button type="button" onClick={nextStep} className="flex-1 bg-white text-black font-bold py-3.5 rounded-lg hover:bg-zinc-200 transition-colors">
                        Continuar →
                      </button>
                    </div>
                  </div>
                )}

                {/* STEP 4: Validación */}
                {step === 4 && (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#c6ff00]/20 text-[#c6ff00] flex items-center justify-center text-xs">4</span>
                      Tus Objetivos
                    </h3>
                    
                    <div className="space-y-4">
                      <label className="text-sm font-bold text-white block">¿Cómo promocionan actualmente sus eventos?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Instagram', 'WhatsApp', 'Facebook', 'TikTok', 'No hacemos promociones'].map(method => (
                          <label key={method} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.current_promo_methods.includes(method) ? 'bg-[#c6ff00]/10 border-[#c6ff00]' : 'bg-[#12131a] border-zinc-800 hover:border-zinc-700'}`}>
                            <input type="checkbox" name="current_promo_methods" value={method} checked={formData.current_promo_methods.includes(method)} onChange={handleChange} className="hidden" />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.current_promo_methods.includes(method) ? 'bg-[#c6ff00] border-[#c6ff00]' : 'border-zinc-600'}`}>
                              {formData.current_promo_methods.includes(method) && <span className="text-black text-[10px]">✓</span>}
                            </div>
                            <span className="text-sm text-zinc-300">{method}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-bold text-white block">¿Qué le interesa mejorar durante el Mundial?</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Más clientes', 'Más reservas', 'Más ventas en vivo', 'Más visibilidad', 'Fidelización'].map(interest => (
                          <label key={interest} className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${formData.world_cup_interest.includes(interest) ? 'bg-[#c6ff00]/10 border-[#c6ff00]' : 'bg-[#12131a] border-zinc-800 hover:border-zinc-700'}`}>
                            <input type="checkbox" name="world_cup_interest" value={interest} checked={formData.world_cup_interest.includes(interest)} onChange={handleChange} className="hidden" />
                            <div className={`w-4 h-4 rounded border flex items-center justify-center ${formData.world_cup_interest.includes(interest) ? 'bg-[#c6ff00] border-[#c6ff00]' : 'border-zinc-600'}`}>
                              {formData.world_cup_interest.includes(interest) && <span className="text-black text-[10px]">✓</span>}
                            </div>
                            <span className="text-sm text-zinc-300">{interest}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <label className="flex items-center gap-3 p-4 bg-[#c6ff00]/5 border border-[#c6ff00]/30 rounded-lg cursor-pointer hover:bg-[#c6ff00]/10 transition-colors">
                      <input type="checkbox" name="wants_free_pilot" checked={formData.wants_free_pilot} onChange={handleChange} className="w-5 h-5 accent-[#c6ff00]" />
                      <span className="text-sm font-bold text-white">Quiero participar en el programa piloto gratuito</span>
                    </label>

                    <div className="flex gap-4 mt-8">
                      <button type="button" onClick={prevStep} className="px-6 bg-zinc-800 text-white font-bold py-3.5 rounded-lg hover:bg-zinc-700 transition-colors">
                        Atrás
                      </button>
                      <button type="submit" disabled={isSubmitting} className="flex-1 bg-[#c6ff00] text-black font-black py-3.5 rounded-lg hover:bg-[#b3e600] hover:scale-[1.02] transition-all flex items-center justify-center gap-2">
                        {isSubmitting ? 'Enviando...' : 'Finalizar Solicitud 🚀'}
                      </button>
                    </div>
                  </div>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 border-t border-zinc-900 bg-[#07080b] py-12 px-6 text-center text-zinc-500">
        <div className="text-white font-black tracking-tighter text-xl mb-4">
          FANFEST<span className="text-zinc-500">AI</span>
        </div>
        <p className="text-xs">
          © 2026 FanFest AI. Hecho en Medellín, Colombia.<br/>
          Tecnología de automatización de marketing contextual para gastrobares.
        </p>
      </footer>
    </div>
  );
}
