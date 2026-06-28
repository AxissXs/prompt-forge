import type { FormData, AgentTarget } from "../../types";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { ChipGroup } from "../ui/ChipGroup";
import { Toggle } from "../ui/Toggle";
import { StepShell } from "../ui/StepShell";

type Props = {
  form: FormData;
  updateDelivery: (p: Partial<FormData["delivery"]>) => void;
  updateMeta: (p: Partial<FormData["meta"]>) => void;
};

export function StepDelivery({ form, updateDelivery, updateMeta }: Props) {
  return (
    <StepShell title="Delivery & Quality" desc="Docs, quality bars, runtime constraints.">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Docs to generate" wide>
          <ChipGroup options={["README.md", "QUICKSTART.md", "ARCHITECTURE.md", "DEPLOYMENT.md", "API.md", "OPENAPI.json", "USAGE.md", "CONTRIBUTING.md", "CHANGELOG.md", "SECURITY.md", ".env.example"]} value={form.delivery.docs} onChange={(v) => updateDelivery({ docs: v })} />
        </Field>
        <Field label="Repo structure" wide>
          <Input value={form.delivery.repoStructure} onChange={(e) => updateDelivery({ repoStructure: e.target.value })} />
        </Field>
        <Field label="Quality bars" wide>
          <ChipGroup options={["eslint / prettier strict", "typecheck CI", "e2e 20 flows", "lighthouse 92+", "a11y pass", "100% typed API", "visual regression", "bundle <180kb"]} value={form.delivery.qualityBars} onChange={(v) => updateDelivery({ qualityBars: v })} />
        </Field>
        <Field label="Testing strategy" wide>
          <Input value={form.delivery.testingStrategy} onChange={(e) => updateDelivery({ testingStrategy: e.target.value })} />
        </Field>
        <Field label="Accessibility">
          <Select value={form.delivery.accessibilityLevel} onChange={(v) => updateDelivery({ accessibilityLevel: v })} options={[["WCAG 2.2 AA", "WCAG 2.2 AA"], ["WCAG 2.2 AAA", "WCAG 2.2 AAA"], ["WCAG 2.1 AA", "WCAG 2.1 AA"]]} />
        </Field>
        <Field label="Performance budget">
          <Input value={form.delivery.performanceBudget} onChange={(e) => updateDelivery({ performanceBudget: e.target.value })} />
        </Field>
        <Field label="Observability" wide>
          <ChipGroup options={["sentry", "vercel-analytics", "posthog", "datadog", "grafana", "opentelemetry"]} value={form.delivery.observability} onChange={(v) => updateDelivery({ observability: v })} />
        </Field>
        <Field label="Toggles" wide>
          <div className="flex flex-wrap gap-5 text-[13px]">
            <Toggle checked={form.delivery.seoNeeds} onChange={(v) => updateDelivery({ seoNeeds: v })} label="SEO required" />
            <Toggle checked={form.delivery.i18n} onChange={(v) => updateDelivery({ i18n: v })} label="i18n" />
            <Toggle checked={form.delivery.pwa} onChange={(v) => updateDelivery({ pwa: v })} label="PWA" />
          </div>
        </Field>

        <div className="md:col-span-2 border-t border-white/[.08] pt-5 mt-1 grid md:grid-cols-2 gap-5">
          <Field label="Coding agent target">
            <Select value={form.meta.codingAgent} onChange={(v) => updateMeta({ codingAgent: v as AgentTarget })} options={[["generic", "Generic"], ["cursor", "Cursor"], ["copilot", "Copilot Workspace"], ["cline", "Cline"], ["bolt", "Bolt"], ["lovable", "Lovable"]]} />
          </Field>
          <Field label="Prompt tone">
            <Input value={form.meta.promptTone} onChange={(e) => updateMeta({ promptTone: e.target.value })} />
          </Field>
          <Field label="Code style" wide>
            <ChipGroup options={["functional components", "server components where possible", "co-located tests", "zod validation", "feature folders", "atomic design", "clean architecture"]} value={form.meta.codeStyle} onChange={(v) => updateMeta({ codeStyle: v })} />
          </Field>
          <Field label="File organization" wide>
            <Input value={form.meta.fileOrganization} onChange={(e) => updateMeta({ fileOrganization: e.target.value })} />
          </Field>
          <Field label="Extra agent instructions" wide>
            <Textarea value={form.meta.extraInstructions} onChange={(e) => updateMeta({ extraInstructions: e.target.value })} placeholder="Anything else the coding agent must know…" />
          </Field>
        </div>
      </div>
    </StepShell>
  );
}
