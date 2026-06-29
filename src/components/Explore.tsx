import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { PublicTemplate, PublicIdea } from "../types";
import { backend } from "../services/backend";
import { useAuth } from "../context/AuthContext";
import { classNames } from "../utils/classNames";
import { GlassPanel } from "./ui/GlassPanel";
import { sanitize } from "../utils/sanitize";

const TYPE_LABELS: Record<string, string> = {
  webapp: "Web App", saas: "SaaS", mobile: "Mobile", api: "API", extension: "Extension", "ai-agent": "AI Agent",
};

const TYPE_ICONS: Record<string, string> = {
  webapp: "🌐", saas: "☁️", mobile: "📱", api: "🔌", extension: "🧩", "ai-agent": "🤖",
};

type Props = {
  onUseTemplate: (t: PublicTemplate) => void;
  onUseIdea: (i: PublicIdea) => void;
  onViewProfile?: (username: string) => void;
};

function CardSkeleton() {
  return (
    <div className="rounded-[18px] glass-soft p-4 animate-pulse space-y-3">
      <div className="h-4 bg-white/[.06] rounded-full w-2/3" />
      <div className="h-3 bg-white/[.04] rounded-full w-1/3" />
      <div className="h-20 bg-white/[.04] rounded-[10px]" />
      <div className="flex gap-2 pt-2">
        <div className="h-7 bg-white/[.04] rounded-full w-16" />
        <div className="h-7 bg-white/[.04] rounded-full w-20" />
      </div>
    </div>
  );
}

export function Explore({ onUseTemplate, onUseIdea, onViewProfile }: Props) {
  const { user, token } = useAuth();
  const [tab, setTab] = useState<"templates" | "ideas">("templates");
  const [templates, setTemplates] = useState<PublicTemplate[]>([]);
  const [ideas, setIdeas] = useState<PublicIdea[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    setLoading(true);
    const [t, i] = await Promise.all([backend.listPublicTemplates(), backend.listPublicIdeas()]);
    setTemplates(t); setIdeas(i); setLoading(false);
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const like = async (kind: "template" | "idea", id: string) => {
    if (!token || liked.has(id)) return;
    await backend.like(token, kind, id);
    setLiked((p) => new Set(p).add(id));
    refresh();
  };

  const q = search.toLowerCase();
  const fT = templates.filter((t) => !q || t.name.toLowerCase().includes(q) || t.authorName.toLowerCase().includes(q) || t.projectType.includes(q));
  const fI = ideas.filter((i) => !q || i.projectName.toLowerCase().includes(q) || i.oneLiner.toLowerCase().includes(q) || i.authorName.toLowerCase().includes(q) || i.tags.some((x) => x.toLowerCase().includes(q)));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[22px] font-[700] glow-text">Explore</div>
          <div className="text-[13px] text-[#99afda]">Discover community templates and public ideas.</div>
        </div>
        <div className="flex gap-2 items-center">
          <div className="relative">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search…"
              className="rounded-[12px] glass-soft pl-9 pr-3 py-[9px] text-[13px] outline-none text-[#eaf2ff] placeholder-[#7d91bc] focus:ring-sky w-[200px]" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] text-[#7d91bc]" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" /></svg>
          </div>
          <div className="flex glass-soft rounded-full p-[4px]">
            {(["templates", "ideas"] as const).map((t) => (
              <button key={t} onClick={() => setTab(t)}
                className={classNames("px-4 py-[7px] rounded-full text-[12.5px] font-[600] capitalize transition", tab === t ? "bg-[#dff3ff] text-[#0d2436]" : "text-[#c5d8f5]")}>
                {t} <span className="opacity-60">({t === "templates" ? templates.length : ideas.length})</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : tab === "templates" ? (
        fT.length === 0 ? (
          <GlassPanel className="p-16 text-center">
            <div className="text-[32px] mb-3 opacity-40">📝</div>
            <div className="text-[15px] font-[600] mb-1">No public templates yet</div>
            <div className="text-[13px] text-[#8ea5cf]">Publish one from the Prompt Studio to share it here.</div>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fT.map((t, idx) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <div className="group rounded-[18px] glass-soft p-4 h-full flex flex-col border border-transparent hover:border-[#aac6ff33] hover:shadow-[0_0_32px_rgba(100,180,255,.08)] transition-all duration-300">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[18px] shrink-0">{TYPE_ICONS[t.projectType] || "📄"}</span>
                      <div className="text-[14px] font-[700] leading-snug truncate">{sanitize(t.name)}</div>
                    </div>
                    <span className="text-[9px] px-[6px] py-[2px] rounded-full glass-soft text-[#a5c4e8] shrink-0">{TYPE_LABELS[t.projectType] || t.projectType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8ea5cf] mb-3">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#b7deff] to-[#ffb8f2] flex items-center justify-center text-[8px] font-[700] text-[#0d2436] shrink-0">
                      {sanitize(t.authorName).slice(0, 1).toUpperCase()}
                    </span>
                    {onViewProfile ? (
                      <button onClick={() => onViewProfile(t.authorName)} className="hover:underline text-left">by {sanitize(t.authorName)}</button>
                    ) : (
                      <span>by {sanitize(t.authorName)}</span>
                    )}
                    <span>·</span>
                    <span>{(t.content.length / 1000).toFixed(1)}k chars</span>
                    <span>·</span>
                    <span>♥ {t.likes}</span>
                  </div>
                  <div className="relative flex-1">
                    <pre className="text-[10.5px] mono text-[#9fb6d8] leading-relaxed bg-[#0a101c]/50 rounded-[12px] p-3 h-[110px] overflow-hidden whitespace-pre-wrap">{sanitize(t.content.slice(0, 360))}</pre>
                    <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#0a101c]/80 to-transparent rounded-b-[12px]" />
                  </div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[.07]">
                    <button onClick={() => like("template", t.id)} disabled={!user || liked.has(t.id)}
                      className={classNames(
                        "px-3 py-[6px] rounded-full text-[11.5px] glass-soft transition flex items-center gap-1.5",
                        liked.has(t.id) ? "text-[#ff9dec] bg-[#ff9dec]/10" : "text-[#cfe3ff] hover:bg-white/[.06]",
                        !user && "opacity-50",
                      )}>
                      <span className={classNames("transition", liked.has(t.id) ? "scale-110" : "")}>♥</span>
                      {t.likes}
                    </button>
                    <div className="flex-1" />
                    <motion.button onClick={() => onUseTemplate(t)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="px-4 py-[6px] rounded-full bg-[#cffff8] text-[#06271f] text-[11.5px] font-[600] hover:shadow-[0_0_20px_rgba(100,255,220,.2)] transition">Use template</motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        fI.length === 0 ? (
          <GlassPanel className="p-16 text-center">
            <div className="text-[32px] mb-3 opacity-40">💡</div>
            <div className="text-[15px] font-[600] mb-1">No public ideas yet</div>
            <div className="text-[13px] text-[#8ea5cf]">Make an idea public from the Idea Builder to feature it here.</div>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fI.map((i, idx) => (
              <motion.div key={i.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.03 }}>
                <div className="group rounded-[18px] glass-soft p-4 h-full flex flex-col border border-transparent hover:border-[#aac6ff33] hover:shadow-[0_0_32px_rgba(100,180,255,.08)] transition-all duration-300">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-[18px] shrink-0">{TYPE_ICONS[i.projectType] || "💡"}</span>
                      <div className="text-[15px] font-[700] leading-snug truncate">{sanitize(i.projectName || i.name || "Untitled idea")}</div>
                    </div>
                    <span className="text-[9px] px-[6px] py-[2px] rounded-full glass-soft text-[#a5c4e8] shrink-0">{TYPE_LABELS[i.projectType] || i.projectType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-[#8ea5cf] mb-2">
                    <span className="w-5 h-5 rounded-full bg-gradient-to-br from-[#b7deff] to-[#ffb8f2] flex items-center justify-center text-[8px] font-[700] text-[#0d2436] shrink-0">
                      {sanitize(i.authorName).slice(0, 1).toUpperCase()}
                    </span>
                    {onViewProfile ? (
                      <button onClick={() => onViewProfile(i.authorName)} className="hover:underline text-left">by {sanitize(i.authorName)}</button>
                    ) : (
                      <span>by {sanitize(i.authorName)}</span>
                    )}
                    {i.likes > 0 && <><span>·</span><span>♥ {i.likes}</span></>}
                  </div>
                  <div className="text-[12px] text-[#aebfe0] leading-relaxed line-clamp-3 mb-2">{sanitize(i.oneLiner || "—")}</div>
                  {i.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {i.tags.slice(0, 4).map((tg) => (
                        <span key={tg} className="text-[10px] px-[7px] py-[2px] rounded-full glass-soft text-[#9db6df] border border-white/[.06]">{sanitize(tg)}</span>
                      ))}
                      {i.tags.length > 4 && (
                        <span className="text-[10px] px-[7px] py-[2px] rounded-full glass-soft text-[#6d84aa]">+{i.tags.length - 4}</span>
                      )}
                    </div>
                  )}
                  <div className="flex-1" />
                  <div className="flex items-center gap-2 pt-3 border-t border-white/[.07]">
                    <button onClick={() => like("idea", i.id)} disabled={!user || liked.has(i.id)}
                      className={classNames(
                        "px-3 py-[6px] rounded-full text-[11.5px] glass-soft transition flex items-center gap-1.5",
                        liked.has(i.id) ? "text-[#ff9dec] bg-[#ff9dec]/10" : "text-[#cfe3ff] hover:bg-white/[.06]",
                        !user && "opacity-50",
                      )}>
                      <span className={classNames("transition", liked.has(i.id) ? "scale-110" : "")}>♥</span>
                      {i.likes}
                    </button>
                    <div className="flex-1" />
                    <motion.button onClick={() => onUseIdea(i)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                      className="px-4 py-[6px] rounded-full bg-[#cffff8] text-[#06271f] text-[11.5px] font-[600] hover:shadow-[0_0_20px_rgba(100,255,220,.2)] transition">Clone idea</motion.button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )
      )}

      {!user && (
        <GlassPanel className="p-4 text-center text-[12.5px] text-[#9db6df]">
          Sign in to like, publish your own templates, and share ideas with the community.
        </GlassPanel>
      )}
    </div>
  );
}
