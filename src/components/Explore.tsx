import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import type { PublicTemplate, PublicIdea } from "../types";
import { backend } from "../services/backend";
import { useAuth } from "../context/AuthContext";
import { classNames } from "../utils/classNames";
import { GlassPanel } from "./ui/GlassPanel";

const TYPE_LABELS: Record<string, string> = {
  webapp: "Web App", saas: "SaaS", mobile: "Mobile", api: "API", extension: "Extension", "ai-agent": "AI Agent",
};

type Props = {
  onUseTemplate: (t: PublicTemplate) => void;
  onUseIdea: (i: PublicIdea) => void;
};

export function Explore({ onUseTemplate, onUseIdea }: Props) {
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
    <div className="space-y-5">
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
        <GlassPanel className="p-16 text-center text-[#8ea5cf]">Loading community content…</GlassPanel>
      ) : tab === "templates" ? (
        fT.length === 0 ? (
          <GlassPanel className="p-16 text-center">
            <div className="text-[15px] font-[600] mb-1">No public templates yet</div>
            <div className="text-[13px] text-[#8ea5cf]">Publish one from the Prompt Studio to share it here.</div>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fT.map((t) => (
              <motion.div key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <GlassPanel className="p-4 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[14px] font-[700] leading-snug">{t.name}</div>
                    <span className="text-[9px] px-[6px] py-[2px] rounded-full glass-soft text-[#a5c4e8] shrink-0">{TYPE_LABELS[t.projectType] || t.projectType}</span>
                  </div>
                  <div className="text-[11px] text-[#8ea5cf] mt-1">by {t.authorName} · {(t.content.length / 1000).toFixed(1)}k chars</div>
                  <pre className="mt-3 text-[10.5px] mono text-[#9fb6d8] leading-relaxed bg-[#0a101c]/50 rounded-[10px] p-3 h-[110px] overflow-hidden whitespace-pre-wrap">{t.content.slice(0, 360)}</pre>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[.07]">
                    <button onClick={() => like("template", t.id)} disabled={!user || liked.has(t.id)}
                      className={classNames("px-3 py-[6px] rounded-full text-[11.5px] glass-soft transition", liked.has(t.id) ? "text-[#ff9dec]" : "text-[#cfe3ff] hover:bg-white/[.06]", !user && "opacity-50")}>
                      ♥ {t.likes}
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => onUseTemplate(t)}
                      className="px-4 py-[6px] rounded-full bg-[#cffff8] text-[#06271f] text-[11.5px] font-[600] hover:translate-y-[-1px] transition">Use template</button>
                  </div>
                </GlassPanel>
              </motion.div>
            ))}
          </div>
        )
      ) : (
        fI.length === 0 ? (
          <GlassPanel className="p-16 text-center">
            <div className="text-[15px] font-[600] mb-1">No public ideas yet</div>
            <div className="text-[13px] text-[#8ea5cf]">Make an idea public from the Idea Builder to feature it here.</div>
          </GlassPanel>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {fI.map((i) => (
              <motion.div key={i.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <GlassPanel className="p-4 h-full flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <div className="text-[15px] font-[700] leading-snug">{i.projectName || i.name || "Untitled idea"}</div>
                    <span className="text-[9px] px-[6px] py-[2px] rounded-full glass-soft text-[#a5c4e8] shrink-0">{TYPE_LABELS[i.projectType] || i.projectType}</span>
                  </div>
                  <div className="text-[12px] text-[#aebfe0] mt-1 leading-relaxed line-clamp-3">{i.oneLiner || "—"}</div>
                  {i.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {i.tags.slice(0, 4).map((tg) => <span key={tg} className="text-[10px] px-[7px] py-[2px] rounded-full glass-soft text-[#9db6df]">{tg}</span>)}
                    </div>
                  )}
                  <div className="text-[11px] text-[#8ea5cf] mt-2">by {i.authorName}</div>
                  <div className="flex items-center gap-2 mt-3 pt-3 border-t border-white/[.07]">
                    <button onClick={() => like("idea", i.id)} disabled={!user || liked.has(i.id)}
                      className={classNames("px-3 py-[6px] rounded-full text-[11.5px] glass-soft transition", liked.has(i.id) ? "text-[#ff9dec]" : "text-[#cfe3ff] hover:bg-white/[.06]", !user && "opacity-50")}>
                      ♥ {i.likes}
                    </button>
                    <div className="flex-1" />
                    <button onClick={() => onUseIdea(i)}
                      className="px-4 py-[6px] rounded-full bg-[#cffff8] text-[#06271f] text-[11.5px] font-[600] hover:translate-y-[-1px] transition">Clone idea</button>
                  </div>
                </GlassPanel>
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
