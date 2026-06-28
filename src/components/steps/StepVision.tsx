import type { FormData, ProjectType } from "../../types";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Select } from "../ui/Select";
import { ChipGroup } from "../ui/ChipGroup";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateVision: (p: Partial<FormData["vision"]>) => void };

export function StepVision({ form, updateVision }: Props) {
  return (
    <StepShell title="Vision" desc="Anchor your product before any code.">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field label="Project name">
          <Input value={form.vision.projectName} onChange={(e) => updateVision({ projectName: e.target.value })} placeholder="NovaTrack" />
        </Field>
        <Field label="App category" hint="1-2 words">
          <Input value={form.vision.appCategory} onChange={(e) => updateVision({ appCategory: e.target.value })} placeholder="Productivity / Wellness" />
        </Field>
        <Field label="One-liner" wide>
          <Input value={form.vision.oneLiner} onChange={(e) => updateVision({ oneLiner: e.target.value })} placeholder="What is it in a sentence?" />
        </Field>
        <Field label="Tagline" hint="marketing">
          <Input value={form.vision.tagline} onChange={(e) => updateVision({ tagline: e.target.value })} placeholder="Light up your momentum." />
        </Field>
        <Field label="Project type" hint="drives template">
          <Select
            value={form.vision.projectType}
            onChange={(v) => updateVision({ projectType: v as ProjectType })}
            options={[
              ["webapp", "Web App"],
              ["saas", "SaaS Dashboard"],
              ["mobile", "Mobile App"],
              ["api", "API / Backend"],
              ["extension", "Browser Extension"],
              ["ai-agent", "AI Agent / Tool"],
            ]}
          />
        </Field>
        <Field label="Platforms">
          <ChipGroup
            options={["web", "ios", "android", "desktop", "api", "extension", "cli"]}
            value={form.vision.platformTarget}
            onChange={(v) => updateVision({ platformTarget: v })}
          />
        </Field>
        <Field label="Elevator pitch" wide>
          <Textarea
            value={form.vision.elevatorPitch}
            onChange={(e) => updateVision({ elevatorPitch: e.target.value })}
            placeholder="2–3 sentences. Pain → solution → why now."
          />
          <div className="text-[11px] text-[#7e92b9]">{form.vision.elevatorPitch.length}/480</div>
        </Field>
      </div>
    </StepShell>
  );
}
