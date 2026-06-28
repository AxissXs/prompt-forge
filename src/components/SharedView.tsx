import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { FormData } from "../types";
import { backend } from "../services/backend";
import { buildPrompt } from "../utils/buildPrompt";
import { DEFAULT_TEMPLATES } from "../constants/templates";
import { GlassPanel } from "./ui/GlassPanel";

type Shared = { name: string; data: FormData; owner_name: string } | null;

export function SharedView({ token, onClose, onClone }: {
  token: string; onClose: () => void; onClone: (name: string, data: FormData) => void;
}) {
  const [item, setItem] = useState<Shared>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    backend.resolveShare(token).then((r: any) => { setItem(r); setLoading(false); });
  }, [token]);

  const prompt = item ? buildPrompt(item.data, { [item.data.vision.projectType]: DEFAULT_TEMPLATES[item.data.vision.projectType] } as any) : "";

  return (
    <div className="relative min-h-screen text-[#e8f0ff]">
      <div className="mesh-bg" />
      <div className="relative z-10 max-w-[920px] mx-auto px-5 py-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] glass shine flex items-center justify-center">
              <div className="w-[20px] h-[20px] rounded-[6px] bg-gradient-to-br from-[#b7deff] to-[#ffb8f2]" />
            </div>
            <div className="text-[13px] tracking-widest text-[#90a8d7] mono">PROMPTFORGE • SHARED IDEA</div>
          </div>
          <button onClick={onClose} className="px-4 py-[9px] rounded-full glass-soft text-[13px] hover:bg-white/[.06]">← Back to app</button>
        </div>

        {loading ? (
          <GlassPanel className="p-16 text-center text-[#8ea5cf]">Loading shared idea…</GlassPanel>
        ) : !item ? (
          <GlassPanel className="p-16 text-center">
            <div className="text-[16px] font-[700] mb-1">Link not found</div>
            <div className="text-[13px] text-[#8ea5cf]">This shared idea may have been removed or the link is invalid.</div>
          </GlassPanel>
        ) : (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <GlassPanel className="p-6">
              <div className="text-[26px] font-[700] glow-text">{item.data.vision.projectName || item.name}</div>
              <div className="text-[14px] text-[#aebfe0] mt-1">{item.data.vision.oneLiner}</div>
              <div className="text-[12px] text-[#8ea5cf] mt-2">Shared by {item.owner_name}</div>
              <div className="flex flex-wrap gap-2 mt-4">
                <span className="text-[11px] px-[9px] py-[4px] rounded-full glass-soft text-[#b9d4ff]">{item.data.vision.projectType}</span>
                {item.data.vision.platformTarget.map((p) => <span key={p} className="text-[11px] px-[9px] py-[4px] rounded-full glass-soft text-[#b9d4ff]">{p}</span>)}
              </div>
              <div className="flex gap-2 mt-5">
                <button onClick={() => onClone(item.name, item.data)} className="px-5 py-[10px] rounded-full bg-[#cffff8] text-[#06271f] text-[13px] font-[650] hover:translate-y-[-1px] transition">Clone to my sessions</button>
                <button onClick={async () => { await navigator.clipboard.writeText(prompt); setCopied(true); setTimeout(() => setCopied(false), 1600); }}
                  className={`px-5 py-[10px] rounded-full text-[13px] font-[600] transition ${copied ? "bg-[#80ffd0] text-[#052b1f]" : "glass-soft text-[#a5d4ff] hover:bg-white/[.06]"}`}>{copied ? "Copied!" : "Copy generated prompt"}</button>
              </div>
            </GlassPanel>

            <GlassPanel className="p-5">
              <div className="text-[11px] mono text-[#98b3de] tracking-wider mb-2">GENERATED PROMPT</div>
              <pre className="text-[12px] mono text-[#d9ebff] leading-relaxed bg-[#0a101c]/60 rounded-[12px] p-4 max-h-[440px] overflow-auto scroll-fancy whitespace-pre-wrap">{prompt}</pre>
            </GlassPanel>
          </motion.div>
        )}
      </div>
    </div>
  );
}
