import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { executeRecaptcha, onRecaptchaLoading } from "../../services/recaptcha";
import { registerSchema, loginSchema } from "../../utils/validation";

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { register, login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [recaptchaLoading, setRecaptchaLoading] = useState(false);

  useEffect(() => {
    return onRecaptchaLoading(setRecaptchaLoading);
  }, []);

  const reset = () => { setError(""); setPassword(""); };

  const [step, setStep] = useState<"auth" | "merge">("auth");
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const getLocalDataCount = () => {
    try {
      const localSessions = JSON.parse(localStorage.getItem("promptforge_sessions_v3") || "[]");
      const localTemplates = JSON.parse(localStorage.getItem("promptforge_custom_templates_v1") || "[]");
      const realSessions = localSessions.filter((s: any) => s.data?.vision?.projectName || s.name !== "Untitled 1");
      return { sessions: realSessions, templates: localTemplates, count: realSessions.length + localTemplates.length };
    } catch {
      return { sessions: [], templates: [], count: 0 };
    }
  };

  const submit = async () => {
    setError("");
    const trimmedEmail = email.trim();
    const trimmedUsername = username.trim();

    if (mode === "register") {
      const result = registerSchema.safeParse({ email: trimmedEmail, username: trimmedUsername, password });
      if (!result.success) {
        setError(result.error.issues[0]?.message || "Invalid input");
        return;
      }
    } else {
      const result = loginSchema.safeParse({ email: trimmedEmail, password });
      if (!result.success) {
        setError(result.error.issues[0]?.message || "Invalid input");
        return;
      }
    }

    setBusy(true);
    try {
      const action = mode === "register" ? "register" : "login";
      const token = await executeRecaptcha(action);

      if (mode === "register") {
        await register(trimmedEmail, trimmedUsername, password, token);
      } else {
        await login(trimmedEmail, password, token);
      }

      const { count } = getLocalDataCount();
      const currentSession = JSON.parse(localStorage.getItem("pf_auth_session") || "null");

      if (count > 0 && currentSession?.token) {
        setSessionToken(currentSession.token);
        setStep("merge");
      } else {
        onClose();
        setEmail(""); setUsername(""); reset();
      }
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const handleMerge = async (shouldMerge: boolean) => {
    setBusy(true);
    setError("");
    try {
      if (shouldMerge && sessionToken) {
        const { sessions, templates } = getLocalDataCount();
        const { backend } = await import("../../services/backend");
        await backend.sync(sessionToken, sessions, templates);
      }
      onClose();
      setEmail(""); setUsername(""); reset();
      setStep("auth");
    } catch (e: any) {
      setError(e.message || "Sync failed");
    } finally {
      setBusy(false);
    }
  };

  const buttonContent = () => {
    if (busy) {
      if (recaptchaLoading) return (
        <span className="flex items-center justify-center gap-2">
          <Spinner /> Loading reCAPTCHA…
        </span>
      );
      return (
        <span className="flex items-center justify-center gap-2">
          <Spinner /> {mode === "login" ? "Signing in…" : "Creating account…"}
        </span>
      );
    }
    return mode === "login" ? "Sign in" : "Create account";
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-[420px] glass-strong rounded-[22px] overflow-hidden"
          >
            <AnimatePresence mode="wait">
              {step === "auth" ? (
                <motion.div key="auth" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-[#b7deff] to-[#ffb8f2] opacity-90" />
                      <div className="text-[18px] font-[700]">{mode === "login" ? "Welcome back" : "Create your account"}</div>
                    </div>
                    <div className="text-[12.5px] text-[#99afda]">
                      {mode === "login" ? "Sign in to publish, explore and share." : "Join to publish templates and explore community ideas."}
                    </div>
                  </div>

                  <div className="px-6">
                    <div className="flex glass-soft rounded-full p-[4px]">
                      {(["login", "register"] as const).map((m) => (
                        <button key={m} onClick={() => { setMode(m); reset(); }}
                          className={`flex-1 px-4 py-[8px] rounded-full text-[13px] font-[600] capitalize transition ${mode === m ? "bg-[#dff3ff] text-[#0d2436]" : "text-[#c5d8f5]"}`}>
                          {m === "login" ? "Sign in" : "Register"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="px-6 py-5 space-y-3">
                    <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="Email"
                      className="w-full rounded-[12px] glass-soft px-4 py-[11px] text-[14px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3] focus:ring-sky" />
                    <AnimatePresence>
                      {mode === "register" && (
                        <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                          value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username"
                          className="w-full rounded-[12px] glass-soft px-4 py-[11px] text-[14px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3] focus:ring-sky" />
                      )}
                    </AnimatePresence>
                    <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password"
                      onKeyDown={(e) => { if (e.key === "Enter") submit(); }}
                      className="w-full rounded-[12px] glass-soft px-4 py-[11px] text-[14px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3] focus:ring-sky" />

                    {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12.5px] text-[#ff9ba0] bg-red-500/10 rounded-[10px] px-3 py-2">{error}</motion.div>}

                    <button onClick={submit} disabled={busy || !email || !password || (mode === "register" && !username)}
                      className="w-full px-5 py-[12px] rounded-[14px] bg-gradient-to-r from-[#bde3ff] to-[#ffd8f7] text-[#142132] text-[14px] font-[650] disabled:opacity-40 hover:translate-y-[-1px] transition">
                      {buttonContent()}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div key="merge" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="p-6 text-center space-y-4">
                  <div className="w-12 h-12 mx-auto rounded-[16px] glass flex items-center justify-center">
                    <span className="text-[24px]">🔄</span>
                  </div>
                  <div>
                    <div className="text-[18px] font-[700]">Sync local data?</div>
                    <div className="text-[13px] text-[#99afda] mt-1 max-w-[320px] mx-auto">
                      We detected {getLocalDataCount().count} custom template(s) and/or session ideas saved on this device. Would you like to merge them with your cloud account?
                    </div>
                  </div>

                  {error && <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="text-[12.5px] text-[#ff9ba0] bg-red-500/10 rounded-[10px] px-3 py-2">{error}</motion.div>}

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleMerge(false)} disabled={busy} className="flex-1 px-4 py-[11px] rounded-[12px] glass-soft text-[13px] font-[600]">{busy ? <span className="flex items-center justify-center gap-2"><Spinner /> Syncing…</span> : "Keep separate"}</button>
                    <button onClick={() => handleMerge(true)} disabled={busy} className="flex-1 px-4 py-[11px] rounded-[12px] bg-gradient-to-r from-[#bde3ff] to-[#ffd8f7] text-[#142132] text-[13px] font-[650]">
                      {busy ? <span className="flex items-center justify-center gap-2"><Spinner /> Syncing…</span> : "Yes, merge data"}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
