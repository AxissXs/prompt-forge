import { AnimatePresence, motion } from "framer-motion";
import type { FormData } from "../../types";
import { classNames } from "../../utils/classNames";
import { Field } from "../ui/Field";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { StepShell } from "../ui/StepShell";

type Props = { form: FormData; updateStrategy: (p: Partial<FormData["strategy"]>) => void };

export function StepStrategy({ form, updateStrategy }: Props) {
  return (
    <StepShell title="Strategy" desc="Choose your thinking framework — only relevant fields show.">
      <div className="mb-4 flex flex-wrap gap-2">
        {([
          ["simple", "Simple"],
          ["lean", "Lean Canvas"],
          ["bmc", "Business Model Canvas"],
          ["jtbd", "Jobs-to-be-Done"],
          ["vp", "Value Prop"],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => updateStrategy({ inputMode: k })}
            className={classNames(
              "px-4 py-[9px] rounded-full text-[13px] border transition",
              form.strategy.inputMode === k
                ? "bg-[#dff3ff] text-[#0d2436] border-[#bfe6ff] shadow-[0_0_18px_rgba(140,205,255,.22)]"
                : "glass-soft border-[#ffffff18] text-[#c9d9f7] hover:bg-white/[.05]",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={form.strategy.inputMode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
          {form.strategy.inputMode === "simple" && (
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Problem" wide><Textarea value={form.strategy.problem} onChange={(e) => updateStrategy({ problem: e.target.value })} /></Field>
              <Field label="Solution" wide><Textarea value={form.strategy.solution} onChange={(e) => updateStrategy({ solution: e.target.value })} /></Field>
              <Field label="Primary goal"><Input value={form.strategy.goal} onChange={(e) => updateStrategy({ goal: e.target.value })} /></Field>
              <Field label="Success metrics"><Input value={form.strategy.successMetrics} onChange={(e) => updateStrategy({ successMetrics: e.target.value })} /></Field>
            </div>
          )}
          {form.strategy.inputMode === "lean" && (
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Problem"><Textarea value={form.strategy.lean_problem} onChange={(e) => updateStrategy({ lean_problem: e.target.value })} /></Field>
              <Field label="Solution"><Textarea value={form.strategy.lean_solution} onChange={(e) => updateStrategy({ lean_solution: e.target.value })} /></Field>
              <Field label="Unique Value Prop"><Input value={form.strategy.lean_uvp} onChange={(e) => updateStrategy({ lean_uvp: e.target.value })} /></Field>
              <Field label="Unfair Advantage"><Input value={form.strategy.lean_unfair} onChange={(e) => updateStrategy({ lean_unfair: e.target.value })} /></Field>
              <Field label="Channels"><Input value={form.strategy.lean_channels} onChange={(e) => updateStrategy({ lean_channels: e.target.value })} /></Field>
              <Field label="Key Metrics"><Input value={form.strategy.lean_metrics} onChange={(e) => updateStrategy({ lean_metrics: e.target.value })} /></Field>
              <Field label="Cost Structure"><Input value={form.strategy.lean_cost} onChange={(e) => updateStrategy({ lean_cost: e.target.value })} /></Field>
              <Field label="Revenue Streams"><Input value={form.strategy.lean_revenue} onChange={(e) => updateStrategy({ lean_revenue: e.target.value })} /></Field>
            </div>
          )}
          {form.strategy.inputMode === "bmc" && (
            <div className="grid md:grid-cols-2 gap-5">
              {([
                ["bmc_partners", "Key Partners"], ["bmc_activities", "Key Activities"], ["bmc_resources", "Key Resources"],
                ["bmc_value", "Value Propositions"], ["bmc_relationships", "Customer Relationships"], ["bmc_channels", "Channels"],
                ["bmc_segments", "Customer Segments"], ["bmc_cost", "Cost Structure"], ["bmc_revenue", "Revenue Streams"],
              ] as const).map(([k, label]) => (
                <Field key={k} label={label}>
                  <Textarea value={(form.strategy as any)[k]} onChange={(e) => updateStrategy({ [k]: e.target.value } as any)} />
                </Field>
              ))}
            </div>
          )}
          {form.strategy.inputMode === "jtbd" && (
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="When / Situation"><Textarea value={form.strategy.jtbd_situation} onChange={(e) => updateStrategy({ jtbd_situation: e.target.value })} /></Field>
              <Field label="Motivation"><Textarea value={form.strategy.jtbd_motivation} onChange={(e) => updateStrategy({ jtbd_motivation: e.target.value })} /></Field>
              <Field label="Desired Outcome"><Textarea value={form.strategy.jtbd_outcome} onChange={(e) => updateStrategy({ jtbd_outcome: e.target.value })} /></Field>
              <Field label="Anxieties"><Input value={form.strategy.jtbd_anxieties} onChange={(e) => updateStrategy({ jtbd_anxieties: e.target.value })} /></Field>
              <Field label="Current Habits" wide><Input value={form.strategy.jtbd_habits} onChange={(e) => updateStrategy({ jtbd_habits: e.target.value })} /></Field>
            </div>
          )}
          {form.strategy.inputMode === "vp" && (
            <div className="grid md:grid-cols-2 gap-5">
              <Field label="Customer Jobs"><Textarea value={form.strategy.vp_jobs} onChange={(e) => updateStrategy({ vp_jobs: e.target.value })} /></Field>
              <Field label="Pains"><Textarea value={form.strategy.vp_pains} onChange={(e) => updateStrategy({ vp_pains: e.target.value })} /></Field>
              <Field label="Gains" wide><Textarea value={form.strategy.vp_gains} onChange={(e) => updateStrategy({ vp_gains: e.target.value })} /></Field>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </StepShell>
  );
}
