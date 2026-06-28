import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../context/AuthContext";
import { Recaptcha } from "./Recaptcha";

export function AuthModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { register, login } = useAuth();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captcha, setCaptcha] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const reset = () => { setError(""); setPassword(""); setCaptcha(null); };

  const [step, setStep] = useState<"auth" | "merge">("auth");
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const getLocalDataCount = () => {
    try {
      const localSessions = JSON.parse(localStorage.getItem("promptforge_sessions_v3") || "[]");
      const localTemplates = JSON.parse(localStorage.getItem("promptforge_custom_templates_v1") || "[]");
      // Filter out empty sessions
      const realSessions = localSessions.filter((s: any) => s.data?.vision?.projectName || s.name !== "Untitled 1");
      return { sessions: realSessions, templates: localTemplates, count: realSessions.length + localTemplates.length };
    } catch {
      return { sessions: [], templates: [], count: 0 };
    }
  };

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      if (!captcha) throw new Error("Please complete the reCAPTCHA");
      
      // Perform authentication
      if (mode === "register") {
        await register(email.trim(), username.trim(), password, captcha);
      } else {
        await login(email.trim(), password, captcha);
      }
      
      // Check for local storage data to merge
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
                  {/* Header */}
                  <div className="px-6 pt-6 pb-4">
                    <div className="flex items-center gap-3 mb-1">
                      <div className="w-9 h-9 rounded-[12px] bg-gradient-to-br from-[#b7deff] to-[#ffb8f2] opacity-90" />
                      <div className="text-[18px] font-[700]">{mode === "login" ? "Welcome back" : "Create your account"}</div>
                    </div>
                    <div className="text-[12.5px] text-[#99afda]">
                      {mode === "login" ? "Sign in to publish, explore and share." : "Join to publish templates and explore community ideas."}
                    </div>
                  </div>

                  {/* Tabs */}
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

                  {/* Form */}
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
                      onKeyDown={(e) => { if (e.key === "Enter" && captcha) submit(); }}
                      className="w-full rounded-[12px] glass-soft px-4 py-[11px] text-[14px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3] focus:ring-sky" />

                    <Recaptcha onChange={setCaptcha} />

                    {error && <div className="text-[12.5px] text-[#ff9ba0] bg-red-500/10 rounded-[10px] px-3 py-2">{error}</div>}

                    <button onClick={submit} disabled={busy || !email || !password || (mode === "register" && !username)}
                      className="w-full px-5 py-[12px] rounded-[14px] bg-gradient-to-r from-[#bde3ff] to-[#ffd8f7] text-[#142132] text-[14px] font-[650] disabled:opacity-40 hover:translate-y-[-1px] transition">
                      {busy ? "Please wait…" : mode === "login" ? "Sign in" : "Create account"}
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

                  {error && <div className="text-[12.5px] text-[#ff9ba0] bg-red-500/10 rounded-[10px] px-3 py-2">{error}</div>}

                  <div className="flex gap-2 pt-2">
                    <button onClick={() => handleMerge(false)} disabled={busy} className="flex-1 px-4 py-[11px] rounded-[12px] glass-soft text-[13px] font-[600]">Keep separate</button>
                    <button onClick={() => handleMerge(true)} disabled={busy} className="flex-1 px-4 py-[11px] rounded-[12px] bg-gradient-to-r from-[#bde3ff] to-[#ffd8f7] text-[#142132] text-[13px] font-[650]">
                      {busy ? "Syncing…" : "Yes, merge data"}
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
