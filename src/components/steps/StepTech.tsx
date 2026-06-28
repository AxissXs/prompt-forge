import type { FormData } from "../../types";
import { classNames } from "../../utils/classNames";
import { TECH_CATALOG } from "../../constants/techCatalog";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Toggle } from "../ui/Toggle";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateTech: (p: Partial<FormData["tech"]>) => void };

export function StepTech({ form, updateTech }: Props) {
  return (
    <StepShell title="Tech Forge" desc="Pick your stack. Recommendations tagged.">
      <div className="space-y-6">
        {Object.entries(TECH_CATALOG).map(([key, cat]) => {
          const selectedIds: string[] = (form.tech as any)[key] || [];
          const customIds = selectedIds.filter((id) => !cat.opts.find((o) => o.id === id));
          return (
            <div key={key}>
              <div className="text-[12px] tracking-wider text-[#a9c2ed] mono mb-[10px]">{cat.label.toUpperCase()}</div>
              <div className="flex flex-wrap gap-[10px]">
                {cat.opts.map((opt) => {
                  const selected = selectedIds.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => {
                        const next = selected ? selectedIds.filter((x) => x !== opt.id) : [...selectedIds, opt.id];
                        updateTech({ [key]: next } as any);
                      }}
                      className={classNames(
                        "relative px-[14px] py-[10px] rounded-[14px] text-[13px] border transition text-left",
                        selected
                          ? "bg-[#dcefff] text-[#0d2538] border-[#bbe2ff] shadow-[0_0_24px_rgba(125,200,255,.17)]"
                          : "glass-soft border-[#ffffff14] text-[#d6e7ff] hover:bg-white/[.045]",
                      )}
                    >
                      <div className="font-[600] flex items-center gap-2">
                        {opt.name}
                        {opt.rec && <span className="text-[10px] px-[7px] py-[2px] rounded-full bg-[#b0ffe9] text-[#053529] mono">RECOMMENDED</span>}
                        {opt.tag && !opt.rec && <span className="text-[10px] text-[#8cb4e2] mono">{opt.tag}</span>}
                      </div>
                      <div className={classNames("text-[11px]", selected ? "text-[#2b5168]" : "text-[#8aa7cd]")}>{opt.blurb}</div>
                    </button>
                  );
                })}
                {customIds.map((cId) => (
                  <button
                    key={cId}
                    type="button"
                    onClick={() => updateTech({ [key]: selectedIds.filter((x) => x !== cId) } as any)}
                    className="relative px-[14px] py-[10px] rounded-[14px] text-[13px] border transition text-left bg-[#dcefff] text-[#0d2538] border-[#bbe2ff] shadow-[0_0_24px_rgba(125,200,255,.17)]"
                  >
                    <div className="font-[600] flex items-center gap-2">{cId} <span className="opacity-60 hover:opacity-100 ml-1">×</span></div>
                    <div className="text-[11px] text-[#2b5168]">Custom option</div>
                  </button>
                ))}
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder={`Add other ${cat.label.toLowerCase()}...`}
                    className="h-[36px] bg-transparent border border-white/[.15] rounded-[12px] px-3 text-[12px] text-[#eaf2ff] placeholder-[#7d91bc] outline-none focus:border-sky-400 focus:bg-white/[.04] transition w-[160px]"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = e.currentTarget.value.trim();
                        if (val && !selectedIds.includes(val)) {
                          updateTech({ [key]: [...selectedIds, val] } as any);
                          e.currentTarget.value = "";
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
        <div className="grid md:grid-cols-3 gap-5 pt-2">
          <Field label="Deploy target">
            <Select value={form.tech.deployTarget} onChange={(v) => updateTech({ deployTarget: v })} options={[["vercel", "Vercel"], ["netlify", "Netlify"], ["cloudflare", "Cloudflare Pages"], ["railway", "Railway"], ["fly", "Fly.io"], ["aws", "AWS"], ["docker", "Docker / self-host"]]} />
          </Field>
          <Field label="API style">
            <Select value={form.tech.apiStyle} onChange={(v) => updateTech({ apiStyle: v })} options={[["tRPC typed + REST webhooks", "tRPC + REST"], ["REST OpenAPI", "REST OpenAPI"], ["GraphQL", "GraphQL"], ["gRPC", "gRPC"]]} />
          </Field>
          <Field label="Package manager">
            <Select value={form.tech.packageManager} onChange={(v) => updateTech({ packageManager: v })} options={[["pnpm", "pnpm"], ["npm", "npm"], ["yarn", "yarn"], ["bun", "bun"]]} />
          </Field>
          <Field label="Hosting notes" wide>
            <Input value={form.tech.hostingNotes} onChange={(e) => updateTech({ hostingNotes: e.target.value })} placeholder="Edge runtimes, cron, regions…" />
          </Field>
          <Field label="Options" wide>
            <div className="flex flex-wrap gap-4 text-[13px] text-[#cfe2ff]">
              <Toggle checked={form.tech.monorepo} onChange={(v) => updateTech({ monorepo: v })} label="Monorepo" />
              <Toggle checked={form.tech.tsStrict} onChange={(v) => updateTech({ tsStrict: v })} label="TypeScript strict" />
            </div>
          </Field>
        </div>
      </div>
    </StepShell>
  );
}
