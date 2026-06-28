export function StepShell({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="mb-5">
        <div className="text-[22px] font-[700] tracking-[-0.012em]">{title}</div>
        <div className="text-[13.5px] text-[#99afda]">{desc}</div>
      </div>
      {children}
    </div>
  );
}
