import type { FormData, FeatureItem } from "../../types";
import { uid } from "../../utils/uid";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { MultiFree } from "../ui/ChipGroup";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateFeatures: (p: Partial<FormData["features"]>) => void };

export function StepFeatures({ form, updateFeatures }: Props) {
  return (
    <StepShell title="Features & Scope" desc="Prioritize with P0/P1/P2. Keep agent focused.">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[13px] text-[#cfe1ff] font-[600]">Core features</div>
        <button
          className="text-[12px] px-3 py-[7px] rounded-full glass-soft hover:bg-white/[.05]"
          onClick={() => {
            const f: FeatureItem = { id: uid(), title: "", description: "", priority: "P1" };
            updateFeatures({ coreFeatures: [...form.features.coreFeatures, f] });
          }}
        >
          + Add feature
        </button>
      </div>
      <div className="space-y-3 mb-7">
        {form.features.coreFeatures.map((ft, idx) => (
          <div key={ft.id} className="glass-soft rounded-[16px] p-3">
            <div className="flex gap-2">
              <select
                value={ft.priority}
                onChange={(e) => {
                  const arr = [...form.features.coreFeatures];
                  arr[idx] = { ...ft, priority: e.target.value as any };
                  updateFeatures({ coreFeatures: arr });
                }}
                className="rounded-[10px] glass-soft px-2 py-[8px] text-[12px] mono text-[#bfe0ff]"
              >
                <option>P0</option><option>P1</option><option>P2</option>
              </select>
              <Input
                placeholder="Feature name"
                value={ft.title}
                onChange={(e) => { const arr = [...form.features.coreFeatures]; arr[idx] = { ...ft, title: e.target.value }; updateFeatures({ coreFeatures: arr }); }}
              />
              <button className="text-[11px] text-[#8aa7d2] px-2" onClick={() => updateFeatures({ coreFeatures: form.features.coreFeatures.filter((x) => x.id !== ft.id) })}>✕</button>
            </div>
            <Textarea
              className="mt-2 min-h-[72px]"
              placeholder="What it does, edge cases, acceptance criteria"
              value={ft.description}
              onChange={(e) => { const arr = [...form.features.coreFeatures]; arr[idx] = { ...ft, description: e.target.value }; updateFeatures({ coreFeatures: arr }); }}
            />
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="User flows" wide><Textarea value={form.features.userFlows} onChange={(e) => updateFeatures({ userFlows: e.target.value })} /></Field>
        <Field label="Must-haves"><MultiFree options={["Auth", "Billing", "Onboarding", "Dashboard"]} value={form.features.mustHaves} onChange={(v) => updateFeatures({ mustHaves: v })} placeholder="Add feature..." /></Field>
        <Field label="Nice-to-haves"><MultiFree options={["Teams", "Themes", "Apple Health", "Export to CSV"]} value={form.features.niceToHaves} onChange={(v) => updateFeatures({ niceToHaves: v })} placeholder="Add nice-to-have..." /></Field>
        <Field label="Admin features" wide><MultiFree options={["Impersonate", "Coupon manager", "Flag abuse", "Analytics"]} value={form.features.adminFeatures} onChange={(v) => updateFeatures({ adminFeatures: v })} placeholder="Add admin feature..." /></Field>
        <Field label="Out of scope" wide><Textarea value={form.features.outOfScope} onChange={(e) => updateFeatures({ outOfScope: e.target.value })} /></Field>
        <Field label="Permissions / roles" wide><Input value={form.features.permissions} onChange={(e) => updateFeatures({ permissions: e.target.value })} /></Field>
      </div>
    </StepShell>
  );
}
