import type { FormData } from "../../types";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { ChipGroup, MultiFree } from "../ui/ChipGroup";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateBusiness: (p: Partial<FormData["business"]>) => void };

export function StepBusiness({ form, updateBusiness }: Props) {
  return (
    <StepShell title="Business" desc="Monetization, GTM, moat.">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Monetization" wide>
          <ChipGroup options={["subscription", "freemium", "one-time", "usage", "ads", "marketplace", "affiliate", "enterprise"]} value={form.business.monetization} onChange={(v) => updateBusiness({ monetization: v })} />
        </Field>
        <Field label="Pricing tiers" wide>
          <Textarea value={form.business.pricingTiers} onChange={(e) => updateBusiness({ pricingTiers: e.target.value })} />
        </Field>
        <Field label="GTM channels" wide>
          <ChipGroup options={["ProductHunt", "Hacker News", "TikTok", "Twitter/X", "Indie newsletter", "App Store", "SEO", "Paid ads", "Partnerships", "Community"]} value={form.business.gtmChannels} onChange={(v) => updateBusiness({ gtmChannels: v })} />
        </Field>
        <Field label="KPIs" wide>
          <MultiFree options={["D7 Retention > 30%", "DAU/MAU", "Conversion Rate", "Churn < 5%"]} value={form.business.kpis} onChange={(v) => updateBusiness({ kpis: v })} placeholder="Add KPI..." />
        </Field>
        <Field label="Competitors" wide><Input value={form.business.competitors} onChange={(e) => updateBusiness({ competitors: e.target.value })} /></Field>
        <Field label="Differentiator" wide><Input value={form.business.differentiator} onChange={(e) => updateBusiness({ differentiator: e.target.value })} /></Field>
        <Field label="Business model"><Input value={form.business.businessModel} onChange={(e) => updateBusiness({ businessModel: e.target.value })} /></Field>
        <Field label="Traction hypothesis"><Input value={form.business.tractionHypothesis} onChange={(e) => updateBusiness({ tractionHypothesis: e.target.value })} /></Field>
      </div>
    </StepShell>
  );
}
