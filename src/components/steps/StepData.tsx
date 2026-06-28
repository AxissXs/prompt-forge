import type { FormData } from "../../types";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { ChipGroup, MultiFree } from "../ui/ChipGroup";
import { Toggle } from "../ui/Toggle";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateData: (p: Partial<FormData["data"]>) => void };

export function StepData({ form, updateData }: Props) {
  return (
    <StepShell title="Data & Integrations" desc="Models, trust, and pipes.">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Data models / entities" wide>
          <Input value={form.data.dataModels} onChange={(e) => updateData({ dataModels: e.target.value })} placeholder="User, Habit, LogEntry, …" />
        </Field>
        <Field label="Third-party APIs" wide>
          <MultiFree options={["stripe", "resend", "posthog", "openai", "aws-s3"]} value={form.data.thirdPartyApis} onChange={(v) => updateData({ thirdPartyApis: v })} placeholder="Add API..." />
        </Field>
        <Field label="Compliance">
          <ChipGroup options={["gdpr", "ccpa", "soc2", "hipaa", "a11y-wcag-2.2-aa", "iso27001"]} value={form.data.compliance} onChange={(v) => updateData({ compliance: v })} />
        </Field>
        <Field label="Localization">
          <ChipGroup options={["en", "es", "fr", "de", "ja", "ko", "zh", "pt", "ar"]} value={form.data.localization} onChange={(v) => updateData({ localization: v })} />
        </Field>
        <Field label="Caching strategy" wide>
          <Input value={form.data.cachingStrategy} onChange={(e) => updateData({ cachingStrategy: e.target.value })} />
        </Field>
        <Field label="Rate limits">
          <Input value={form.data.rateLimits} onChange={(e) => updateData({ rateLimits: e.target.value })} />
        </Field>
        <Field label="Offline support">
          <Toggle checked={form.data.offlineSupport} onChange={(v) => updateData({ offlineSupport: v })} label={form.data.offlineSupport ? "Enabled" : "Disabled"} />
        </Field>
      </div>
    </StepShell>
  );
}
