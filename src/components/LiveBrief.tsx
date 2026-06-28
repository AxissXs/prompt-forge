import type { FormData } from "../types";
import { sumTech } from "../utils/buildPrompt";
import { GlassPanel } from "./ui/GlassPanel";
import { Badge } from "./ui/Badge";

type Props = { form: FormData; promptLen: number; onCopy: () => void };

export function LiveBrief({ form, promptLen, onCopy }: Props) {
  const wordCount = promptLen > 0 ? Math.round(promptLen / 5.2) : 0;
  return (
    <div className="space-y-4">
      <GlassPanel className="p-4">
        <div className="text-[11px] tracking-wider text-[#97b1dc] mono mb-3">LIVE BRIEF</div>
        <div className="text-[16px] font-[650]">{form.vision.projectName || "Untitled"}</div>
        <div className="text-[12.5px] text-[#a8bde0] mt-1">{form.vision.oneLiner || "—"}</div>
        <div className="flex flex-wrap gap-2 mt-3 text-[11px]">
          <Badge>{form.vision.projectType}</Badge>
          {form.vision.platformTarget.map((p) => <Badge key={p}>{p}</Badge>)}
        </div>
        <div className="mt-4 flex gap-2">
          <div className="w-[32px] h-[32px] rounded-[10px]" style={{ background: form.brand.colorPrimary }} />
          <div className="w-[32px] h-[32px] rounded-[10px]" style={{ background: form.brand.colorAccent }} />
          <div className="w-[32px] h-[32px] rounded-[10px] border border-white/[.13]" style={{ background: form.brand.colorNeutral }} />
        </div>
        <div className="text-[11px] text-[#8fa7cb] mt-3">
          {form.features.coreFeatures.filter((f) => f.title).length} features • {sumTech(form)} tech picks
        </div>
      </GlassPanel>

      <GlassPanel className="p-4">
        <div className="text-[11px] tracking-wider text-[#97b1dc] mono mb-2">AGENT TARGET</div>
        <div className="text-sm">{form.meta.codingAgent}</div>
        <div className="text-[11.5px] text-[#90a8ce] mt-2">{form.meta.promptTone}</div>
        <div className="mt-3 text-[11px] text-[#90a8ce]">
          Docs: {form.delivery.docs.slice(0, 4).join(", ")}{form.delivery.docs.length > 4 ? " …" : ""}
        </div>
      </GlassPanel>

      <GlassPanel className="p-[14px]">
        <div className="text-[11px] mono text-[#97b1dc] mb-2">PROMPT SIZE</div>
        <div className="text-[22px] font-[700]">{(promptLen / 1000).toFixed(1)}k</div>
        <div className="text-[11px] text-[#8ea5c8]">{wordCount.toLocaleString()} words • {promptLen.toLocaleString()} chars</div>
        <button onClick={onCopy} className="mt-3 w-full px-3 py-[9px] rounded-[12px] glass-soft text-[12.5px]">Copy prompt</button>
      </GlassPanel>

      <div className="text-[11px] text-[#6f83a8] px-2 leading-relaxed">
        PromptForge builds a deterministic, structured engineering brief your coding agent can ship from. Fields adapt to your chosen framework, stack, and platform. Go to <strong>Prompt Studio</strong> to edit templates, save multiple prompt versions, and export.
      </div>
    </div>
  );
}
