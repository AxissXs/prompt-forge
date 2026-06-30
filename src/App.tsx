import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FormData, ProjectType, Session, PromptTemplate } from "./types";
import { defaultFormData } from "./constants/defaults";
import { DEFAULT_TEMPLATES } from "./constants/templates";
import { uid } from "./utils/uid";
import { classNames } from "./utils/classNames";
import { buildPrompt } from "./utils/buildPrompt";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { GlassPanel } from "./components/ui/GlassPanel";
import { StepVision } from "./components/steps/StepVision";
import { StepStrategy } from "./components/steps/StepStrategy";
import { StepAudience } from "./components/steps/StepAudience";
import { StepBrand } from "./components/steps/StepBrand";
import { StepFeatures } from "./components/steps/StepFeatures";
import { StepTech } from "./components/steps/StepTech";
import { StepData } from "./components/steps/StepData";
import { StepBusiness } from "./components/steps/StepBusiness";
import { StepDelivery } from "./components/steps/StepDelivery";
import { LiveBrief } from "./components/LiveBrief";
import { PromptStudio } from "./components/PromptStudio";
import { Explore } from "./components/Explore";
import { AuthModal } from "./components/auth/AuthModal";
import { ShareDialog } from "./components/ShareDialog";
import { SharedView } from "./components/SharedView";
import { ProfileEditor } from "./components/ProfileEditor";
import { ProfilePage } from "./components/ProfilePage";
import { useAuth } from "./context/AuthContext";
import {
  localPublishIdea,
  localUnpublishIdea,
  localIsIdeaPublic,
} from "./services/backend";
import type { PublicTemplate, PublicIdea } from "./types";

/* ===========================
   Built-in templates → PromptTemplate[]
   =========================== */
function builtInTemplates(): PromptTemplate[] {
  return (Object.keys(DEFAULT_TEMPLATES) as ProjectType[]).map((pt) => ({
    id: `builtin-${pt}`,
    name: `Default ${pt.toUpperCase()} template`,
    content: DEFAULT_TEMPLATES[pt],
    projectType: pt,
    createdAt: 0,
    updatedAt: 0,
  }));
}

type View = "builder" | "studio" | "explore";

export default function App() {
  const { user, token, logout } = useAuth();
  const [view, setView] = useState<View>("builder");
  const [authOpen, setAuthOpen] = useState(false);
  const [profileEditorOpen, setProfileEditorOpen] = useState(false);
  const [profileUsername, setProfileUsername] = useState<string | null>(null);
  const [shareSession, setShareSession] = useState<Session | null>(null);
  const [sharedToken, setSharedToken] = useState<string | null>(null);
  const [sessions, setSessions] = useLocalStorage<Session[]>(
    "promptforge_sessions_v3",
    [],
  );
  const [activeId, setActiveId] = useLocalStorage<string>(
    "promptforge_active_v3",
    "",
  );
  const [form, setForm] = useState<FormData>(defaultFormData);
  const [stepIdx, setStepIdx] = useState(0);

  // Custom templates (stored in LS), merged with built-ins on read
  const [customTemplates, setCustomTemplates] = useLocalStorage<
    PromptTemplate[]
  >("promptforge_custom_templates_v1", []);

  // Merged list: custom first, then built-ins (for listing & picking)
  const allTemplates = useMemo(() => {
    const builtins = builtInTemplates();
    // If a custom template has same id as builtin, custom wins
    const customIds = new Set(customTemplates.map((t) => t.id));
    return [
      ...customTemplates,
      ...builtins.filter((b) => !customIds.has(b.id)),
    ];
  }, [customTemplates]);

  // The Idea Builder picks a template to generate the prompt
  const [genTemplateId, setGenTemplateId] = useState<string>("builtin-webapp");
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [showSessions, setShowSessions] = useState(true);
  const [copied, setCopied] = useState(false);

  // ─── bootstrap session ───
  useEffect(() => {
    if (sessions.length === 0) {
      const s: Session = {
        id: uid(),
        name: "Untitled 1",
        updatedAt: Date.now(),
        data: defaultFormData,
      };
      setSessions([s]);
      setActiveId(s.id);
      setForm(s.data);
    } else {
      const active = sessions.find((s) => s.id === activeId);
      if (active) {
        setForm(active.data);
      } else if (sessions[0]) {
        setActiveId(sessions[0].id);
        setForm(sessions[0].data);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ─── autosave ───
  useEffect(() => {
    if (!activeId) return;
    const t = setTimeout(() => {
      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeId
            ? {
                ...s,
                updatedAt: Date.now(),
                data: form,
                name: form.vision.projectName || s.name || "Untitled",
              }
            : s,
        ),
      );
    }, 420);
    return () => clearTimeout(t);
  }, [form, activeId, setSessions]);

  // ─── updaters ───
  const update = <K extends keyof FormData>(
    section: K,
    patch: Partial<FormData[K]>,
  ) => setForm((f) => ({ ...f, [section]: { ...f[section], ...patch } }));
  const updateVision = (p: Partial<FormData["vision"]>) => update("vision", p);
  const updateStrategy = (p: Partial<FormData["strategy"]>) =>
    update("strategy", p);
  const updateAudience = (p: Partial<FormData["audience"]>) =>
    update("audience", p);
  const updateBrand = (p: Partial<FormData["brand"]>) => update("brand", p);
  const updateFeatures = (p: Partial<FormData["features"]>) =>
    update("features", p);
  const updateTech = (p: Partial<FormData["tech"]>) => update("tech", p);
  const updateData = (p: Partial<FormData["data"]>) => update("data", p);
  const updateBusiness = (p: Partial<FormData["business"]>) =>
    update("business", p);
  const updateDelivery = (p: Partial<FormData["delivery"]>) =>
    update("delivery", p);
  const updateMeta = (p: Partial<FormData["meta"]>) => update("meta", p);

  // ─── steps ───
  const steps = [
    { id: "vision", label: "Vision", sub: "Name • platform • pitch" },
    { id: "strategy", label: "Strategy", sub: "Framework-driven why" },
    { id: "audience", label: "Audience", sub: "Personas & markets" },
    { id: "brand", label: "Brand", sub: "Tone • palette • motion" },
    { id: "features", label: "Features", sub: "Scope & flows" },
    { id: "tech", label: "Tech Forge", sub: "Stack picker" },
    { id: "data", label: "Data", sub: "Models • APIs • trust" },
    { id: "business", label: "Business", sub: "Monetization • GTM" },
    { id: "delivery", label: "Delivery", sub: "Docs • quality • meta" },
    { id: "generate", label: "Generate", sub: "Template → prompt" },
  ];

  // ─── completion ───
  const completion = useMemo(() => {
    let s = 0;
    if (form.vision.projectName) s += 8;
    if (form.vision.oneLiner.length > 14) s += 8;
    if (form.strategy.problem || form.strategy.lean_problem) s += 8;
    if (form.audience.primaryAudience) s += 7;
    if (form.features.coreFeatures.length > 0) s += 9;
    if (form.tech.frontend.length) s += 9;
    if (form.tech.backend.length) s += 7;
    if (form.tech.database.length) s += 7;
    if (form.business.monetization.length) s += 7;
    if (form.delivery.docs.length) s += 6;
    if (form.brand.colorPrimary) s += 5;
    if (form.data.dataModels) s += 7;
    if (form.meta.extraInstructions) s += 5;
    return Math.min(100, s);
  }, [form]);

  // ─── session actions ───
  const newSession = () => {
    const data = JSON.parse(JSON.stringify(defaultFormData));
    const s: Session = {
      id: uid(),
      name: "Untitled " + (sessions.length + 1),
      updatedAt: Date.now(),
      data,
    };
    setSessions([s, ...sessions]);
    setActiveId(s.id);
    setForm(data);
    setStepIdx(0);
    setView("builder");
  };
  const duplicateSession = () => {
    if (!activeId) return;
    const cur = sessions.find((s) => s.id === activeId);
    if (!cur) return;
    const s: Session = {
      id: uid(),
      name: cur.name + " copy",
      updatedAt: Date.now(),
      data: JSON.parse(JSON.stringify(cur.data)),
    };
    setSessions([s, ...sessions]);
    setActiveId(s.id);
    setForm(s.data);
  };
  const deleteSession = (id: string) => {
    const next = sessions.filter((s) => s.id !== id);
    setSessions(next);
    if (activeId === id) {
      if (next[0]) {
        setActiveId(next[0].id);
        setForm(next[0].data);
      } else {
        setActiveId("");
        setForm(defaultFormData);
      }
    }
  };

  // ─── social: import from explore / shared ───
  const cloneIdea = (name: string, data: FormData) => {
    const s: Session = {
      id: uid(),
      name: name + " (clone)",
      updatedAt: Date.now(),
      data: JSON.parse(JSON.stringify(data)),
    };
    setSessions((prev) => [s, ...prev]);
    setActiveId(s.id);
    setForm(s.data);
    setStepIdx(0);
    setView("builder");
    setSharedToken(null);
  };
  const usePublicTemplate = (t: PublicTemplate) => {
    const tpl: PromptTemplate = {
      id: uid(),
      name: t.name + " (imported)",
      content: t.content,
      projectType: t.projectType,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    setCustomTemplates((prev) => [tpl, ...prev]);
    setView("studio");
  };
  const usePublicIdea = (i: PublicIdea) =>
    cloneIdea(i.projectName || i.name, i.data);
  const viewProfile = (username: string) => setProfileUsername(username);

  // ─── idea public toggle (builder quick action) ───
  const activeSession = sessions.find((s) => s.id === activeId) || null;
  const [ideaPubVersion, setIdeaPubVersion] = useState(0);
  const isActiveIdeaPublic = useMemo(
    () => (activeSession ? localIsIdeaPublic(activeSession.id) : false),
    [activeSession, ideaPubVersion, sessions],
  );
  const toggleIdeaPublic = () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (!activeSession) return;
    if (isActiveIdeaPublic) localUnpublishIdea(activeSession.id);
    else localPublishIdea(activeSession, user, form.vision.platformTarget);
    setIdeaPubVersion((v) => v + 1);
  };

  // ─── hash routing for shared links (#/shared/<token>) ───
  useEffect(() => {
    const parse = () => {
      const m = location.hash.match(/^#\/shared\/(.+)$/);
      setSharedToken(m ? m[1] : null);
    };
    parse();
    window.addEventListener("hashchange", parse);
    return () => window.removeEventListener("hashchange", parse);
  }, []);
  const closeShared = () => {
    location.hash = "";
    setSharedToken(null);
  };

  // ─── generate prompt for a chosen template ───
  const chosenTemplate = useMemo(
    () => allTemplates.find((t) => t.id === genTemplateId),
    [allTemplates, genTemplateId],
  );
  const renderPrompt = () => {
    // buildPrompt expects Record<ProjectType, string>, so build a temp map
    const tplMap = {
      [form.vision.projectType]:
        chosenTemplate?.content || DEFAULT_TEMPLATES[form.vision.projectType],
    } as Record<ProjectType, string>;
    return buildPrompt(form, tplMap);
  };

  // auto-generate when reaching the generate step
  useEffect(() => {
    if (stepIdx === 9) {
      setGeneratedPrompt(renderPrompt());
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIdx, genTemplateId, form]);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const download = (text: string, filename: string) => {
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── step renderer ───
  const renderStep = () => {
    switch (stepIdx) {
      case 0:
        return <StepVision form={form} updateVision={updateVision} />;
      case 1:
        return <StepStrategy form={form} updateStrategy={updateStrategy} />;
      case 2:
        return <StepAudience form={form} updateAudience={updateAudience} />;
      case 3:
        return <StepBrand form={form} updateBrand={updateBrand} />;
      case 4:
        return <StepFeatures form={form} updateFeatures={updateFeatures} />;
      case 5:
        return <StepTech form={form} updateTech={updateTech} />;
      case 6:
        return <StepData form={form} updateData={updateData} />;
      case 7:
        return <StepBusiness form={form} updateBusiness={updateBusiness} />;
      case 8:
        return (
          <StepDelivery
            form={form}
            updateDelivery={updateDelivery}
            updateMeta={updateMeta}
          />
        );
      case 9:
        return renderGenerateStep();
      default:
        return null;
    }
  };

  // ─── Generate step (last step in builder) ───
  const renderGenerateStep = () => {
    // Group templates by project type
    const byType: Record<string, PromptTemplate[]> = {};
    allTemplates.forEach((t) => {
      if (!byType[t.projectType]) byType[t.projectType] = [];
      byType[t.projectType].push(t);
    });
    const typeLabels: Record<ProjectType, string> = {
      webapp: "Web App",
      saas: "SaaS",
      mobile: "Mobile",
      api: "API",
      extension: "Extension",
      "ai-agent": "AI Agent",
    };

    return (
      <div>
        <div className="mb-5">
          <div className="text-[22px] font-[700] tracking-[-0.012em]">
            Generate Prompt
          </div>
          <div className="text-[13.5px] text-[#99afda]">
            Pick a template — built-in or your own — and preview the final
            prompt.
          </div>
        </div>

        {/* Template picker */}
        <div className="text-[11px] mono text-[#98b3de] tracking-wider mb-3">
          CHOOSE TEMPLATE
        </div>
        <div className="space-y-4 mb-6">
          {(Object.keys(byType) as ProjectType[]).map((pt) => (
            <div key={pt}>
              <div className="text-[10px] tracking-wider text-[#7d91bc] mono mb-[6px]">
                {typeLabels[pt]?.toUpperCase() || pt.toUpperCase()}
              </div>
              <div className="flex flex-wrap gap-[8px]">
                {byType[pt].map((t) => {
                  const active = t.id === genTemplateId;
                  const isBuiltin = t.id.startsWith("builtin-");
                  return (
                    <button
                      key={t.id}
                      onClick={() => setGenTemplateId(t.id)}
                      className={classNames(
                        "px-3 py-[8px] rounded-[12px] text-[12px] border transition text-left",
                        active
                          ? "bg-[#dcefff] text-[#0d2538] border-[#bbe2ff] shadow-[0_0_24px_rgba(125,200,255,.17)]"
                          : "glass-soft border-[#ffffff14] text-[#c5daf0] hover:bg-white/[.045]",
                      )}
                    >
                      <div className="font-[600] flex items-center gap-2">
                        {t.name}
                        {isBuiltin && (
                          <span className="text-[9px] px-[5px] py-[1px] rounded-full bg-[#b0ffe9] text-[#053529] mono">
                            BUILT-IN
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-[#7d91bc]">
                        {(t.content.length / 1000).toFixed(1)}k chars •{" "}
                        {typeLabels[t.projectType] || pt}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Prompt preview */}
        <div className="text-[11px] mono text-[#98b3de] tracking-wider mb-2 flex items-center justify-between">
          <span>RENDERED PROMPT</span>
          <span className="text-[#6f88b5]">
            {(generatedPrompt.length / 1000).toFixed(1)}k chars
          </span>
        </div>
        <textarea
          readOnly
          value={generatedPrompt}
          className="w-full h-[340px] rounded-[16px] bg-[#0a101c]/70 border border-[#ffffff18] p-4 text-[12.5px] leading-relaxed text-[#e3f1ff] mono scroll-fancy outline-none"
        />

        {/* Actions */}
        <div className="flex gap-2 mt-3 flex-wrap">
          <button
            onClick={() => handleCopy(generatedPrompt)}
            className={classNames(
              "px-5 py-[10px] rounded-full font-[600] text-[13px] transition",
              copied
                ? "bg-[#80ffd0] text-[#052b1f]"
                : "bg-[#cffff8] text-[#06271f]",
            )}
          >
            {copied ? "Copied!" : "Copy prompt"}
          </button>
          <button
            onClick={() =>
              download(
                generatedPrompt,
                `${form.vision.projectName || "prompt"}.txt`,
              )
            }
            className="px-4 py-[10px] rounded-full glass-soft text-[13px] text-[#a5d4ff] hover:bg-white/[.06]"
          >
            Download .txt
          </button>
          <button
            onClick={() =>
              download(
                JSON.stringify(form, null, 2),
                `${form.vision.projectName || "spec"}.json`,
              )
            }
            className="px-4 py-[10px] rounded-full glass-soft text-[13px] text-[#a5d4ff] hover:bg-white/[.06]"
          >
            Export spec JSON
          </button>
          <div className="flex-1" />
          <button
            onClick={() => {
              if (user) setShareSession(activeSession);
              else setAuthOpen(true);
            }}
            className="px-4 py-[10px] rounded-full glass-soft text-[13px] text-[#a5d4ff] hover:bg-white/[.06]"
          >
            🔗 Share
          </button>
          <button
            onClick={toggleIdeaPublic}
            className={classNames(
              "px-4 py-[10px] rounded-full text-[13px] font-[600] transition border",
              isActiveIdeaPublic
                ? "bg-[#80ffd0]/15 text-[#80ffd0] border-[#80ffd0]/30"
                : "glass-soft text-[#ffd8f7] border-transparent hover:bg-white/[.06]",
            )}
          >
            {isActiveIdeaPublic ? "🌍 Public on Explore" : "Make idea public"}
          </button>
        </div>

        <div className="mt-4 text-[12px] text-[#8fa7cf] leading-relaxed">
          Tip: Create custom templates in the <strong>Prompt Studio</strong>{" "}
          with your own placeholders and publish them to{" "}
          <strong>Explore</strong>. Sign in to share ideas via private link or
          make them public.
        </div>
      </div>
    );
  };

  const TYPE_LABELS: Record<string, string> = {
    webapp: "Web App",
    saas: "SaaS",
    mobile: "Mobile",
    api: "API",
    extension: "Extension",
    "ai-agent": "AI Agent",
  };

  // Profile view
  if (profileUsername) {
    return (
      <>
        <div className="relative min-h-screen text-[#e8f0ff]">
          <div className="mesh-bg" />
          <div className="relative z-10 max-w-[1380px] mx-auto px-5 md:px-9 py-7">
            <ProfilePage
              username={profileUsername}
              onBack={() => setProfileUsername(null)}
            />
            <footer className="text-center text-[11px] text-[#7288b1] mt-10 mb-6 mono">
              <a
                href="https://github.com/AxissXs/prompt-forge"
                target="_blank"
                rel="nofollow noreferrer"
                className="hover:underline"
              >
                PromptForge
              </a>{" "}
              — MIT licensed. Built with AI, reviewed by humans.
            </footer>
          </div>
        </div>
      </>
    );
  }

  // Shared private link view takes over the whole screen
  if (sharedToken) {
    return (
      <SharedView
        token={sharedToken}
        onClose={closeShared}
        onClone={cloneIdea}
      />
    );
  }

  return (
    <div className="relative min-h-screen text-[#e8f0ff]">
      <div className="mesh-bg" />
      <div className="relative z-10 max-w-[1380px] mx-auto px-5 md:px-9 py-7">
        {/* ═══════ TOP BAR ═══════ */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-11 h-11 rounded-[16px] glass shine flex items-center justify-center ring-sky">
              <div className="w-[22px] h-[22px] rounded-[7px] bg-gradient-to-br from-[#b7deff] to-[#ffb8f2] blur-[0px] opacity-95" />
            </div>
            <div>
              <div className="text-[11px] tracking-widest text-[#90a8d7] mono">
                PROMPTFORGE OS • v3.1
              </div>
              <div className="text-[26px] md:text-[30px] font-[650] leading-tight tracking-[-0.015em] glow-text">
                Idea → Agent Prompt
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 md:gap-3 flex-wrap">
            <div className="flex glass-soft rounded-full p-[4px]">
              <button
                onClick={() => setView("builder")}
                className={classNames(
                  "px-4 py-[8px] rounded-full text-[13px] font-[600] transition",
                  view === "builder"
                    ? "bg-[#dff3ff] text-[#0d2436] shadow-[0_0_18px_rgba(140,205,255,.22)]"
                    : "text-[#c5d8f5]",
                )}
              >
                Idea Builder
              </button>
              <button
                onClick={() => setView("studio")}
                className={classNames(
                  "px-4 py-[8px] rounded-full text-[13px] font-[600] transition",
                  view === "studio"
                    ? "bg-[#dff3ff] text-[#0d2436] shadow-[0_0_18px_rgba(140,205,255,.22)]"
                    : "text-[#c5d8f5]",
                )}
              >
                Prompt Studio
              </button>
              <button
                onClick={() => {
                  if (user) setView("explore");
                  else setAuthOpen(true);
                }}
                className={classNames(
                  "px-4 py-[8px] rounded-full text-[13px] font-[600] transition flex items-center gap-1",
                  view === "explore"
                    ? "bg-[#dff3ff] text-[#0d2436] shadow-[0_0_18px_rgba(140,205,255,.22)]"
                    : "text-[#c5d8f5]",
                )}
              >
                Explore{" "}
                {!user && <span className="text-[10px] opacity-60">🔒</span>}
              </button>
            </div>
            {view === "builder" && (
              <>
                <button
                  onClick={() => setShowSessions((v) => !v)}
                  className="px-4 py-[10px] rounded-full glass-soft text-[13px] hover:bg-white/[.055] transition"
                >
                  {showSessions ? "Hide sessions" : "Sessions"}
                </button>
                <button
                  onClick={duplicateSession}
                  className="px-4 py-[10px] rounded-full glass-soft text-[13px] hover:bg-white/[.055] transition"
                >
                  Duplicate
                </button>
                <button
                  onClick={() => {
                    if (user) setShareSession(activeSession);
                    else setAuthOpen(true);
                  }}
                  className="px-4 py-[10px] rounded-full glass-soft text-[13px] hover:bg-white/[.055] transition"
                >
                  Share
                </button>
              </>
            )}
            <button
              onClick={newSession}
              className="px-4 py-[10px] rounded-full bg-[#defffe] text-[#082026] text-[13px] font-[600] shadow-[0_8px_30px_rgba(150,255,255,.18)] hover:translate-y-[-1px] transition"
            >
              New idea
            </button>
            {user ? (
              <div className="flex items-center gap-2 pl-1">
                <button
                  onClick={() => setProfileEditorOpen(true)}
                  className="group relative"
                >
                  {user.avatarUrl ? (
                    <img
                      src={user.avatarUrl}
                      alt=""
                      className="w-9 h-9 rounded-full object-cover border border-white/[.15]"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-full bg-gradient-to-br from-[#b7deff] to-[#ffb8f2] flex items-center justify-center text-[#0d2436] text-[13px] font-[700]"
                      title={user.username}
                    >
                      {(user.displayName || user.username)
                        .slice(0, 1)
                        .toUpperCase()}
                    </div>
                  )}
                </button>
                <button
                  onClick={() => setProfileUsername(user.username)}
                  className="px-3 py-[9px] rounded-full glass-soft text-[12px] hover:bg-white/[.06] transition"
                >
                  Profile
                </button>
                <button
                  onClick={logout}
                  className="px-3 py-[9px] rounded-full glass-soft text-[12px] hover:bg-white/[.06] transition"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthOpen(true)}
                className="px-4 py-[10px] rounded-full glass-soft text-[13px] hover:bg-white/[.055] transition"
              >
                Sign in
              </button>
            )}
          </div>
        </div>

        {/* ═══════ VIEW CONTENT ═══════ */}
        <AnimatePresence mode="wait">
          {view === "builder" ? (
            <motion.div
              key="builder"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <div className="grid grid-cols-12 gap-6 items-start">
                {/* LEFT */}
                <div className="col-span-12 lg:col-span-3 space-y-4">
                  <AnimatePresence>
                    {showSessions && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                      >
                        <GlassPanel className="p-4">
                          <div className="text-[11px] tracking-wider text-[#9db2df] mono mb-3">
                            SESSIONS
                          </div>
                          <div className="space-y-2 max-h-[260px] overflow-auto pr-1 scroll-fancy">
                            {sessions.map((s) => (
                              <button
                                key={s.id}
                                onClick={() => {
                                  setActiveId(s.id);
                                  setForm(s.data);
                                }}
                                className={classNames(
                                  "w-full text-left px-3 py-[11px] rounded-[14px] transition group border",
                                  s.id === activeId
                                    ? "glass-strong border-[#aac6ff4d] ring-sky"
                                    : "glass-soft border-transparent hover:border-[#9dbbe733]",
                                )}
                              >
                                <div className="text-[13.5px] font-[600] truncate">
                                  {s.name || "Untitled"}
                                </div>
                                <div className="text-[11px] text-[#8ea5cf] flex justify-between">
                                  <span>
                                    {TYPE_LABELS[s.data.vision.projectType] ||
                                      s.data.vision.projectType}
                                  </span>
                                  <span
                                    className="opacity-0 group-hover:opacity-100 transition text-[#ffb8ba] hover:text-[#ff6b6b]"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      deleteSession(s.id);
                                    }}
                                  >
                                    delete
                                  </span>
                                </div>
                              </button>
                            ))}
                            {sessions.length === 0 && (
                              <div className="text-sm text-[#7d91b8]">
                                No sessions yet
                              </div>
                            )}
                          </div>
                        </GlassPanel>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <GlassPanel className="p-[10px]">
                    <div className="text-[11px] tracking-wider text-[#9db2df] mono px-3 pt-2 pb-2">
                      STEPS
                    </div>
                    <div className="space-y-[6px]">
                      {steps.map((st, i) => {
                        const active = i === stepIdx;
                        return (
                          <button
                            key={st.id}
                            onClick={() => setStepIdx(i)}
                            className={classNames(
                              "w-full flex items-center gap-3 px-3 py-[12px] rounded-[16px] text-left transition",
                              active
                                ? "glass-strong ring-sky"
                                : "hover:bg-white/[.034]",
                            )}
                          >
                            <div
                              className={classNames(
                                "w-[34px] h-[34px] rounded-[12px] flex items-center justify-center text-[12px] mono",
                                active
                                  ? "bg-[#cfe6ff] text-[#0a1f3a]"
                                  : "glass-soft text-[#9db6df]",
                              )}
                            >
                              {i + 1}
                            </div>
                            <div className="flex-1">
                              <div
                                className={classNames(
                                  "text-[14px] font-[600]",
                                  active && "glow-text",
                                )}
                              >
                                {st.label}
                              </div>
                              <div className="text-[11.5px] text-[#8197c6]">
                                {st.sub}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                    <div className="px-3 pb-3 pt-3">
                      <div className="flex items-center justify-between text-[11px] text-[#92a9d4] mono mb-2">
                        <span>READINESS</span>
                        <span>{completion}%</span>
                      </div>
                      <div className="h-[9px] w-full rounded-full bg-white/[.07] overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-[#8ebeff] via-[#ff96ec] to-[#80ffe0]"
                          initial={false}
                          animate={{ width: `${completion}%` }}
                          transition={{
                            type: "spring",
                            stiffness: 120,
                            damping: 18,
                          }}
                        />
                      </div>
                    </div>
                    <button
                      onClick={() => setView("studio")}
                      className="mx-3 mb-3 w-[calc(100%-24px)] px-3 py-[10px] rounded-[14px] bg-gradient-to-r from-[#bde3ff]/20 to-[#ffd8f7]/20 border border-[#ffffff14] text-[13px] font-[600] text-center hover:from-[#bde3ff]/30 hover:to-[#ffd8f7]/30 transition"
                    >
                      Template Studio →
                    </button>
                  </GlassPanel>
                </div>

                {/* CENTER */}
                <div className="col-span-12 lg:col-span-6">
                  <GlassPanel className="p-5 md:p-7 min-h-[680px]">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={stepIdx}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{
                          duration: 0.28,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                      >
                        {renderStep()}
                      </motion.div>
                    </AnimatePresence>

                    <div className="flex items-center justify-between mt-8 pt-5 border-t border-white/[.09]">
                      <button
                        disabled={stepIdx === 0}
                        onClick={() => setStepIdx((s) => Math.max(0, s - 1))}
                        className="px-4 py-[10px] rounded-full glass-soft text-[13px] disabled:opacity-40"
                      >
                        ← Back
                      </button>
                      <div className="text-[11px] text-[#8ea5ca] mono">
                        {stepIdx + 1} / {steps.length}
                      </div>
                      {stepIdx < steps.length - 1 ? (
                        <button
                          onClick={() =>
                            setStepIdx((s) => Math.min(steps.length - 1, s + 1))
                          }
                          className="px-[20px] py-[10px] rounded-full bg-gradient-to-r from-[#bde3ff] to-[#ffd8f7] text-[#142132] text-[13.5px] font-[650]"
                        >
                          Continue →
                        </button>
                      ) : (
                        <div /> /* last step has no forward button */
                      )}
                    </div>
                  </GlassPanel>
                </div>

                {/* RIGHT */}
                <div className="col-span-12 lg:col-span-3">
                  <LiveBrief
                    form={form}
                    promptLen={generatedPrompt.length}
                    onCopy={() => handleCopy(generatedPrompt)}
                  />
                </div>
              </div>
            </motion.div>
          ) : view === "studio" ? (
            <motion.div
              key="studio"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <PromptStudio
                templates={customTemplates}
                setTemplates={setCustomTemplates}
                onRequireAuth={() => setAuthOpen(true)}
              />
            </motion.div>
          ) : (
            <motion.div
              key="explore"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
            >
              <Explore
                onUseTemplate={usePublicTemplate}
                onUseIdea={usePublicIdea}
                onViewProfile={viewProfile}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="text-center text-[11px] text-[#7288b1] mt-10 mb-6 mono">
          <a href="https://github.com/AxissXs/prompt-forge" target="_blank" rel="nofollow noreferrer" className="hover:underline">PromptForge</a> — MIT licensed. Built with AI, reviewed by humans.
        </footer>
      </div>

      {/* Modals */}
      <AuthModal open={authOpen} onClose={() => setAuthOpen(false)} />
      <ShareDialog
        open={!!shareSession}
        onClose={() => setShareSession(null)}
        session={shareSession}
        user={user!}
        token={token!}
      />
      <ProfileEditor
        open={profileEditorOpen}
        onClose={() => setProfileEditorOpen(false)}
      />
    </div>
  );
}
