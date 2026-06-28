import type { FormData, Persona } from "../../types";
import { uid } from "../../utils/uid";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ChipGroup } from "../ui/ChipGroup";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateAudience: (p: Partial<FormData["audience"]>) => void };

export function StepAudience({ form, updateAudience }: Props) {
  return (
    <StepShell title="Audience & Market" desc="Who you're building for and how they behave.">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Primary audience" wide><Input value={form.audience.primaryAudience} onChange={(e) => updateAudience({ primaryAudience: e.target.value })} /></Field>
        <Field label="Secondary audience" wide><Input value={form.audience.secondaryAudience} onChange={(e) => updateAudience({ secondaryAudience: e.target.value })} /></Field>
        <Field label="Geo / markets"><Input value={form.audience.geo} onChange={(e) => updateAudience({ geo: e.target.value })} /></Field>
        <Field label="Age range"><Input value={form.audience.ageRange} onChange={(e) => updateAudience({ ageRange: e.target.value })} /></Field>
        <Field label="Tech savviness">
          <Select value={form.audience.techSavviness} onChange={(v) => updateAudience({ techSavviness: v })} options={[["Low", "Low"], ["Medium", "Medium"], ["High", "High"], ["Expert", "Expert"]]} />
        </Field>
        <Field label="Languages">
          <ChipGroup options={["en", "es", "fr", "de", "pt", "ja", "ko", "zh", "ar", "hi"]} value={form.audience.languages} onChange={(v) => updateAudience({ languages: v })} />
        </Field>
        <Field label="Accessibility needs" wide>
          <ChipGroup options={["Keyboard nav", "Screen reader", "Reduced motion", "High contrast", "Dyslexia font", "Color-blind safe", "Large touch targets"]} value={form.audience.accessibilityNeeds} onChange={(v) => updateAudience({ accessibilityNeeds: v })} />
        </Field>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[13px] font-[600] text-[#d6e6ff]">Personas</div>
          <button onClick={() => { const p: Persona = { id: uid(), name: "", role: "", pain: "", goal: "" }; updateAudience({ personas: [...form.audience.personas, p] }); }} className="text-[12px] px-3 py-[7px] rounded-full glass-soft hover:bg-white/[.05]">+ Add</button>
        </div>
        <div className="space-y-4">
          {form.audience.personas.map((p, idx) => (
            <div key={p.id} className="glass-soft rounded-[18px] p-4">
              <div className="grid md:grid-cols-2 gap-3">
                <Input placeholder="Name" value={p.name} onChange={(e) => { const arr = [...form.audience.personas]; arr[idx] = { ...p, name: e.target.value }; updateAudience({ personas: arr }); }} />
                <Input placeholder="Role / archetype" value={p.role} onChange={(e) => { const arr = [...form.audience.personas]; arr[idx] = { ...p, role: e.target.value }; updateAudience({ personas: arr }); }} />
                <Input placeholder="Pain" value={p.pain} onChange={(e) => { const arr = [...form.audience.personas]; arr[idx] = { ...p, pain: e.target.value }; updateAudience({ personas: arr }); }} />
                <Input placeholder="Goal" value={p.goal} onChange={(e) => { const arr = [...form.audience.personas]; arr[idx] = { ...p, goal: e.target.value }; updateAudience({ personas: arr }); }} />
              </div>
              <div className="text-right mt-2">
                <button className="text-[11px] text-[#87a7d8] hover:text-[#ffb8ba]" onClick={() => updateAudience({ personas: form.audience.personas.filter((x) => x.id !== p.id) })}>remove</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </StepShell>
  );
}
