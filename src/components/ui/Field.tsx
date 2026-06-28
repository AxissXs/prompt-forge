import { classNames } from "../../utils/classNames";

export function Field({ label, hint, children, wide }: { label: string; hint?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className={classNames("space-y-2", wide && "md:col-span-2")}>
      <div className="flex items-baseline justify-between">
        <div className="text-[12.5px] tracking-wide text-[#c9d6f3] font-[500]">{label}</div>
        {hint && <div className="text-[11px] text-[#7f92bd]">{hint}</div>}
      </div>
      {children}
    </div>
  );
}
