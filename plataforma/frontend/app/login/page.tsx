"use client";

import { useState } from "react";
import { supabase } from "../lib/supabaseClient";

type LoginStep = "form" | "sent" | "error";
type LoginMode = "magic_link" | "password";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginMode, setLoginMode] = useState<LoginMode>("magic_link");
  const [step, setStep] = useState<LoginStep>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    setErrorMsg("");

    try {
      if (loginMode === "magic_link") {
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: {
            emailRedirectTo: `${window.location.origin}/app/dashboard`,
            shouldCreateUser: false, // Solo deja entrar a usuarios ya registrados
          },
        });

        if (error) {
          // "shouldCreateUser: false" causa error si el email no existe en auth.users
          if (error.message.includes("Signups not allowed")) {
            setErrorMsg(
              "Este correo no está registrado en FanFest AI. Postula tu negocio en la página principal para solicitar acceso."
            );
            setStep("error");
          } else {
            throw error;
          }
        } else {
          setStep("sent");
        }
      } else {
        // Password login mode
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (error) {
          setErrorMsg("Correo o contraseña incorrectos. Por favor, verifica tus credenciales e intenta de nuevo.");
          setStep("error");
        } else {
          // Redirige al dashboard privado de Next.js
          window.location.href = "/app/dashboard";
        }
      }
    } catch (err: any) {
      console.error("Login error:", err);
      setErrorMsg(err.message ?? "Hubo un error al iniciar sesión. Intenta de nuevo.");
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4 relative overflow-hidden">
      
      {/* Background glows */}
      <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#c6ff00]/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[40%] h-[40%] bg-[#0066cc]/8 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        
        {/* Logo */}
        <div className="text-center mb-10">
          <a href="/" className="inline-flex items-center gap-2 text-white font-black tracking-tighter text-2xl hover:opacity-80 transition-opacity">
            <span className="w-3 h-3 bg-[#c6ff00] rounded-sm" />
            FANFEST<span className="text-zinc-500">AI</span>
          </a>
          <p className="text-zinc-500 text-sm mt-2">Panel de Gestión de Negocios</p>
        </div>

        {/* Card */}
        <div className="bg-[#0c0d12] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#c6ff00]/5 rounded-full blur-[80px] pointer-events-none" />

          {/* === STEP: FORM === */}
          {(step === "form" || step === "error") && (
            <div className="relative z-10">
              <div className="mb-8">
                <h1 className="text-2xl font-black text-white mb-2">
                  Accede a tu Dashboard
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  {loginMode === "magic_link" 
                    ? "Te enviaremos un enlace mágico a tu correo. Sin contraseña, sin complicaciones."
                    : "Ingresa tu correo y contraseña registrados para acceder a tu panel."}
                </p>
              </div>

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label
                    htmlFor="email"
                    className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                  >
                    Correo Electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (step === "error") setStep("form");
                    }}
                    className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6ff00] focus:ring-1 focus:ring-[#c6ff00]/30 transition-all"
                    placeholder="tu@correo.com"
                    autoComplete="email"
                    autoFocus
                  />
                </div>

                {loginMode === "password" && (
                  <div className="space-y-2">
                    <label
                      htmlFor="password"
                      className="text-xs font-semibold text-zinc-400 uppercase tracking-wider"
                    >
                      Contraseña
                    </label>
                    <input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (step === "error") setStep("form");
                      }}
                      className="w-full bg-[#12131a] border border-zinc-800 rounded-lg px-4 py-3.5 text-white placeholder-zinc-600 focus:outline-none focus:border-[#c6ff00] focus:ring-1 focus:ring-[#c6ff00]/30 transition-all"
                      placeholder="••••••••"
                      autoComplete="current-password"
                    />
                  </div>
                )}

                {/* Error message */}
                {step === "error" && errorMsg && (
                  <div className="bg-red-950/40 border border-red-500/30 rounded-lg p-3 text-sm text-red-300 flex gap-2.5">
                    <span className="text-red-400 shrink-0 mt-0.5">⚠️</span>
                    <span>{errorMsg}</span>
                  </div>
                )}

                <button
                  id="submit-btn"
                  type="submit"
                  disabled={isLoading || !email.trim() || (loginMode === "password" && !password)}
                  className="w-full bg-[#c6ff00] hover:bg-[#b3e600] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold py-3.5 rounded-lg transition-all hover:shadow-[0_0_30px_rgba(198,255,0,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      {loginMode === "magic_link" ? "Enviando enlace..." : "Iniciando sesión..."}
                    </>
                  ) : (
                    <>
                      {loginMode === "magic_link" ? "✉️ Enviar Enlace Mágico" : "🔑 Iniciar Sesión"}
                    </>
                  )}
                </button>
              </form>

              {/* Login Mode Toggle */}
              <div className="mt-5 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMode(loginMode === "magic_link" ? "password" : "magic_link");
                    setErrorMsg("");
                    setStep("form");
                  }}
                  className="text-xs text-zinc-400 hover:text-[#c6ff00] transition-colors underline underline-offset-4"
                >
                  {loginMode === "magic_link"
                    ? "¿Prefieres acceder con contraseña? Ingresa aquí"
                    : "¿Prefieres acceder con Enlace Mágico? Enviar enlace"}
                </button>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
                <p className="text-xs text-zinc-500">
                  ¿Aún no tienes acceso?{" "}
                  <a
                    href="/#beta-form"
                    className="text-[#c6ff00] font-semibold hover:underline"
                  >
                    Postula tu negocio
                  </a>
                </p>
              </div>
            </div>
          )}

          {/* === STEP: EMAIL SENT === */}
          {step === "sent" && (
            <div className="relative z-10 text-center py-4">
              <div className="w-20 h-20 bg-[#c6ff00]/10 border border-[#c6ff00]/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl">📬</span>
              </div>
              <h2 className="text-2xl font-black text-white mb-3">
                ¡Revisa tu correo!
              </h2>
              <p className="text-sm text-zinc-400 leading-relaxed mb-2">
                Enviamos un enlace de acceso a:
              </p>
              <p className="text-[#c6ff00] font-bold text-lg mb-6 break-all">
                {email}
              </p>
              <p className="text-xs text-zinc-500 leading-relaxed mb-8">
                El enlace es válido por <strong className="text-zinc-300">60 minutos</strong>. 
                Si no ves el correo, revisa tu carpeta de spam.
              </p>

              <button
                onClick={() => {
                  setStep("form");
                  setEmail("");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors underline underline-offset-2"
              >
                Usar otro correo
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          © 2026 FanFest AI · Hecho en Medellín
        </p>
      </div>
    </div>
  );
}
