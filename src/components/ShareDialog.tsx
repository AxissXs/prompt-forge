import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Session, User } from "../types";
import { backend, localPublishIdea, localUnpublishIdea, localIsIdeaPublic, IS_LOCAL_BACKEND } from "../services/backend";

export function ShareDialog({ open, onClose, session, user }: {
  open: boolean; onClose: () => void; session: Session | null; user: User;
}) {
  const [isPublic, setIsPublic] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (session) setIsPublic(IS_LOCAL_BACKEND ? localIsIdeaPublic(session.id) : false);
    setShareUrl(""); setCopied(false);
  }, [session, open]);

  if (!session) return null;

  const togglePublic = async () => {
    setBusy(true);
    try {
      if (!isPublic) {
        if (IS_LOCAL_BACKEND) localPublishIdea(session, user, tags);
        else { await backend.setIdeaPublic("", session.id, true); }
        setIsPublic(true);
      } else {
        if (IS_LOCAL_BACKEND) localUnpublishIdea(session.id);
        else { await backend.setIdeaPublic("", session.id, false); }
        setIsPublic(false);
      }
    } finally { setBusy(false); }
  };

  const makeLink = async () => {
    setBusy(true);
    try {
      const token = await (backend as any).createShareLink("", session.id, { name: session.name, data: session.data, owner: user });
      const url = `${location.origin}${location.pathname}#/shared/${token}`;
      setShareUrl(url);
    } finally { setBusy(false); }
  };

  const copy = async () => { await navigator.clipboard.writeText(shareUrl); setCopied(true); setTimeout(() => setCopied(false), 1600); };

  const addTag = () => { const t = tagInput.trim(); if (t && !tags.includes(t)) setTags([...tags, t]); setTagInput(""); };

  return (
    <AnimatePresence>
      {open && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
          <motion.div initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.92, y: 20 }}
            onClick={(e) => e.stopPropagation()} className="w-full max-w-[480px] glass-strong rounded-[22px] overflow-hidden">
            <div className="px-6 pt-5 pb-4 border-b border-white/[.08] flex items-center justify-between">
              <div>
                <div className="text-[17px] font-[700]">Share "{session.name || "Untitled"}"</div>
                <div className="text-[12px] text-[#99afda]">Publish publicly or create a private link.</div>
              </div>
              <button onClick={onClose} className="w-8 h-8 rounded-[10px] glass-soft flex items-center justify-center text-[#99afda] hover:text-white text-[16px]">×</button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Private link */}
              <div>
                <div className="text-[13px] font-[600] mb-1">🔗 Private link</div>
                <div className="text-[12px] text-[#99afda] mb-2">Anyone with the link can view this idea (read-only).</div>
                {shareUrl ? (
                  <div className="flex gap-2">
                    <input readOnly value={shareUrl} className="flex-1 rounded-[10px] glass-soft px-3 py-[9px] text-[12px] mono text-[#cfe3ff] outline-none" />
                    <button onClick={copy} className={`px-4 rounded-[10px] text-[12px] font-[600] transition ${copied ? "bg-[#80ffd0] text-[#052b1f]" : "bg-[#cffff8] text-[#06271f]"}`}>{copied ? "Copied!" : "Copy"}</button>
                  </div>
                ) : (
                  <button onClick={makeLink} disabled={busy} className="px-4 py-[9px] rounded-[10px] glass-soft text-[12.5px] text-[#a5d4ff] hover:bg-white/[.06] transition disabled:opacity-50">Create private link</button>
                )}
              </div>

              <div className="h-px bg-white/[.07]" />

              {/* Public toggle */}
              <div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[13px] font-[600]">🌍 Public on Explore</div>
                    <div className="text-[12px] text-[#99afda]">Featured in the community Explore section.</div>
                  </div>
                  <button onClick={togglePublic} disabled={busy}
                    className={`w-[52px] h-[30px] rounded-full p-[4px] transition relative border ${isPublic ? "bg-[#cffff1] border-[#9eead5]" : "glass-soft border-[#ffffff22]"}`}>
                    <motion.div layout transition={{ type: "spring", stiffness: 520, damping: 32 }}
                      className={`w-[22px] h-[22px] rounded-full ${isPublic ? "bg-[#0c3730] ml-[22px]" : "bg-[#b9d2f5]"}`} />
                  </button>
                </div>
                {!isPublic && (
                  <div className="mt-3">
                    <div className="text-[11px] text-[#8ea5cf] mb-1">Tags (help others find it)</div>
                    <div className="flex gap-2 mb-2">
                      <input value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
                        placeholder="Add a tag…" className="flex-1 rounded-[10px] glass-soft px-3 py-[8px] text-[12px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3]" />
                      <button onClick={addTag} className="px-3 rounded-[10px] glass-soft text-[12px]">Add</button>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {tags.map((t) => <span key={t} className="text-[11px] px-[8px] py-[3px] rounded-full bg-[#e9f7ff] text-[#0e2837] flex items-center gap-1">{t}<button onClick={() => setTags(tags.filter((x) => x !== t))}>×</button></span>)}
                    </div>
                  </div>
                )}
                {isPublic && <div className="mt-2 text-[12px] text-[#80ffd0]">✓ This idea is live on Explore.</div>}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
