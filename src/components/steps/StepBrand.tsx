import type { FormData } from "../../types";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { ChipGroup } from "../ui/ChipGroup";
import { ColorRow } from "../ui/ColorRow";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateBrand: (p: Partial<FormData["brand"]>) => void };

export function StepBrand({ form, updateBrand }: Props) {
  return (
    <StepShell title="Brand & Experience" desc="Give your agent a strong creative brief.">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Visual style"><Input value={form.brand.visualStyle} onChange={(e) => updateBrand({ visualStyle: e.target.value })} placeholder="e.g. liquid-glass nebula, minimal flat…" /></Field>
        <Field label="Typography / Font names"><Input value={form.brand.typographyVibe} onChange={(e) => updateBrand({ typographyVibe: e.target.value })} placeholder="e.g. Inter, Geist, or minimal sans..." /></Field>
        <Field label="Brand tone" wide>
          <ChipGroup options={["playful-calm", "minimal", "bold", "friendly", "enterprise", "optimistic", "precise", "edgy", "lux"]} value={form.brand.brandTone} onChange={(v) => updateBrand({ brandTone: v })} />
        </Field>
        <Field label="Primary"><ColorRow value={form.brand.colorPrimary} onChange={(v) => updateBrand({ colorPrimary: v })} /></Field>
        <Field label="Accent"><ColorRow value={form.brand.colorAccent} onChange={(v) => updateBrand({ colorAccent: v })} /></Field>
        <Field label="Neutral / background" wide><ColorRow value={form.brand.colorNeutral} onChange={(v) => updateBrand({ colorNeutral: v })} /></Field>
        <Field label="Theme mode"><Select value={form.brand.themeMode} onChange={(v) => updateBrand({ themeMode: v as any })} options={[["dark", "Dark"], ["light", "Light"], ["both", "Dark + Light"], ["auto", "Auto"]]} /></Field>
        <Field label="Motion personality"><Input value={form.brand.motionPersonality} onChange={(e) => updateBrand({ motionPersonality: e.target.value })} placeholder="springy, soft ease…" /></Field>
        <Field label="Logo / mark direction" wide><Input value={form.brand.logoDirection} onChange={(e) => updateBrand({ logoDirection: e.target.value })} /></Field>
        <Field label="Inspiration URLs" wide><Input value={form.brand.inspirationUrls} onChange={(e) => updateBrand({ inspirationUrls: e.target.value })} placeholder="linear.app / raycast.com …" /></Field>
      </div>
    </StepShell>
  );
}
