"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePostHog } from 'posthog-js/react';
import { supabase } from "../lib/supabaseClient";

type LoginStep = "form" | "sent" | "error";
type LoginMode = "magic_link" | "password";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loginMode, setLoginMode] = useState<LoginMode>("magic_link");
  const [step, setStep] = useState<LoginStep>("form");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [isLeadError, setIsLeadError] = useState(false);

  const posthog = usePostHog();

  // Load saved email on mount
  useEffect(() => {
    const savedEmail = localStorage.getItem("fanfest_login_email");
    if (savedEmail) {
      setEmail(savedEmail);
    }
  }, []);

  const trackEvent = (eventName: string, props: Record<string, any> = {}) => {
    if (posthog) {
      posthog.capture(eventName, props);
    }
  };

  const handleOAuthLogin = async (provider: 'google' | 'azure') => {
    trackEvent("sso_login_click", { provider });
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/app/dashboard`,
        }
      });
      if (error) throw error;
    } catch (err: any) {
      trackEvent("sso_login_error", { provider, error: err.message });
      setErrorMsg(err.message || `Hubo un error al conectar con ${provider}.`);
      setStep("error");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    // Save to local storage
    localStorage.setItem("fanfest_login_email", email.trim());
    
    trackEvent("login_submit", { mode: loginMode });
    setIsLoading(true);
    setErrorMsg("");
    setIsLeadError(false);

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
          trackEvent("login_error", { mode: "magic_link", error: error.message });
          if (error.message.includes("Signups not allowed")) {
            setIsLeadError(true);
            setErrorMsg("Acceso denegado: Tu negocio aún no está registrado.");
            setStep("error");
          } else {
            throw error;
          }
        } else {
          trackEvent("magic_link_sent");
          setStep("sent");
        }
      } else {
        // Password login mode
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim().toLowerCase(),
          password: password,
        });

        if (error) {
          trackEvent("login_error", { mode: "password", error: error.message });
          setErrorMsg("Correo o contraseña incorrectos. Verifica tus credenciales.");
          setStep("error");
        } else {
          trackEvent("login_success", { mode: "password" });
          window.location.href = "/app/dashboard";
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Hubo un error al iniciar sesión.";
      trackEvent("login_error", { mode: loginMode, error: msg });
      setErrorMsg(msg);
      setStep("error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || otpCode.length !== 6) return;

    trackEvent("otp_submit");
    setIsLoading(true);
    setErrorMsg("");

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode.trim(),
        type: 'email'
      });

      if (error) {
        trackEvent("otp_error", { error: error.message });
        setErrorMsg("El código es incorrecto o ha expirado. Intenta de nuevo.");
      } else {
        trackEvent("login_success", { mode: "otp" });
        window.location.href = "/app/dashboard";
      }
    } catch (err: unknown) {
      trackEvent("otp_error", { error: String(err) });
      setErrorMsg("Hubo un problema al verificar el código.");
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
          <Link href="/" className="inline-flex items-center gap-2 text-white font-black tracking-tighter text-2xl hover:opacity-80 transition-opacity">
            <span className="w-3 h-3 bg-[#c6ff00] rounded-sm" />
            FANFEST<span className="text-zinc-500">AI</span>
          </Link>
          <p className="text-zinc-500 text-sm mt-2">Panel de Gestión de Negocios</p>
        </div>

        {/* Card */}
        <div className="bg-[#0c0d12] border border-zinc-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#c6ff00]/5 rounded-full blur-[80px] pointer-events-none" />

          {/* === STEP: FORM === */}
          {(step === "form" || step === "error") && (
            <div className="relative z-10">
              <div className="mb-6">
                <h1 className="text-2xl font-black text-white mb-2">
                  Accede a tu Dashboard
                </h1>
                <p className="text-sm text-zinc-400 leading-relaxed">
                  Ingresa a tu cuenta para gestionar tu negocio.
                </p>
              </div>

              {/* SSO Buttons */}
              <div className="space-y-3 mb-6">
                <button 
                  onClick={() => handleOAuthLogin('google')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-black font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continuar con Google
                </button>
                <button 
                  onClick={() => handleOAuthLogin('azure')}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-3 bg-[#2F2F2F] hover:bg-[#3F3F3F] border border-zinc-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" viewBox="0 0 21 21">
                    <path fill="#f25022" d="M1 1h9v9H1z"/>
                    <path fill="#00a4ef" d="M1 11h9v9H1z"/>
                    <path fill="#7fba00" d="M11 1h9v9h-9z"/>
                    <path fill="#ffb900" d="M11 11h9v9h-9z"/>
                  </svg>
                  Continuar con Microsoft
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className="h-px bg-zinc-800 flex-1"></div>
                <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold">O ingresa con</span>
                <div className="h-px bg-zinc-800 flex-1"></div>
              </div>

              {/* Login Mode Tabs */}
              <div className="flex bg-[#12131a] p-1 rounded-lg mb-6 border border-zinc-800/50">
                <button
                  type="button"
                  onClick={() => setLoginMode("magic_link")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    loginMode === "magic_link" 
                      ? "bg-zinc-800 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Sin Contraseña
                </button>
                <button
                  type="button"
                  onClick={() => setLoginMode("password")}
                  className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                    loginMode === "password" 
                      ? "bg-zinc-800 text-white shadow-sm" 
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Contraseña
                </button>
              </div>

              {/* Error message / Lead Capture Banner */}
              {step === "error" && errorMsg && (
                <div className={`mb-6 p-4 rounded-lg flex flex-col gap-3 ${
                  isLeadError ? "bg-[#c6ff00]/10 border border-[#c6ff00]/30" : "bg-red-950/40 border border-red-500/30"
                }`}>
                  <div className="flex gap-2.5">
                    <span className={isLeadError ? "text-[#c6ff00]" : "text-red-400 mt-0.5"}>
                      {isLeadError ? "👋" : "⚠️"}
                    </span>
                    <span className={`text-sm ${isLeadError ? "text-[#c6ff00]" : "text-red-300"}`}>
                      {errorMsg}
                    </span>
                  </div>
                  {isLeadError && (
                    <Link href="/#beta-form" className="w-full bg-[#c6ff00] hover:bg-[#b3e600] text-black text-center text-sm font-bold py-2.5 rounded-md transition-colors">
                      Postular mi Negocio Ahora
                    </Link>
                  )}
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <label htmlFor="email" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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
                  />
                </div>

                {loginMode === "password" && (
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
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

                <button
                  id="submit-btn"
                  type="submit"
                  disabled={isLoading || !email.trim() || (loginMode === "password" && !password)}
                  className="w-full bg-[#c6ff00] hover:bg-[#b3e600] disabled:opacity-50 disabled:cursor-not-allowed text-black font-extrabold py-3.5 rounded-lg transition-all hover:shadow-[0_0_30px_rgba(198,255,0,0.3)] active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <span className="w-4 h-4 rounded-full border-2 border-black/30 border-t-black animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      {loginMode === "magic_link" ? "✉️ Recibir Enlace Seguro" : "🔑 Ingresar"}
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* === STEP: EMAIL SENT (MAGIC LINK / OTP) === */}
          {step === "sent" && (
            <div className="relative z-10 py-2">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-[#c6ff00]/10 border border-[#c6ff00]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-3xl">📬</span>
                </div>
                <h2 className="text-xl font-black text-white mb-2">
                  Revisa tu bandeja de entrada
                </h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-1">
                  Enviamos un enlace seguro y un código a:
                </p>
                <p className="text-[#c6ff00] font-bold break-all">
                  {email}
                </p>
              </div>

              {/* OTP Form */}
              <form onSubmit={handleOtpVerification} className="space-y-4 mb-6 bg-[#12131a] p-5 rounded-xl border border-zinc-800/50">
                <div>
                  <label htmlFor="otp" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider text-center mb-3">
                    Ingresa el código de 6 dígitos
                  </label>
                  <input
                    id="otp"
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    required
                    value={otpCode}
                    onChange={(e) => {
                      setOtpCode(e.target.value.replace(/\D/g, ''));
                      setErrorMsg("");
                    }}
                    className="w-full bg-[#0c0d12] border border-zinc-700 rounded-lg px-4 py-4 text-center text-2xl tracking-[0.5em] font-mono text-white placeholder-zinc-700 focus:outline-none focus:border-[#c6ff00] focus:ring-1 focus:ring-[#c6ff00]/30 transition-all"
                    placeholder="000000"
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>
                
                {errorMsg && (
                  <p className="text-xs text-red-400 text-center">{errorMsg}</p>
                )}

                <button
                  type="submit"
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  ) : "Verificar Código"}
                </button>
              </form>

              <div className="text-center">
                <p className="text-xs text-zinc-500 leading-relaxed mb-6">
                  ¿No ves el correo? Revisa tu carpeta de spam. Puedes hacer clic en el enlace del correo o usar el código arriba.
                </p>
                <button
                  onClick={() => {
                    setStep("form");
                    setOtpCode("");
                  }}
                  className="text-xs text-zinc-400 hover:text-white transition-colors underline underline-offset-2"
                >
                  Regresar y usar otro correo
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-zinc-600 mt-6">
          © 2026 FanFest AI · Acceso Seguro B2B
        </p>
      </div>
    </div>
  );
}
