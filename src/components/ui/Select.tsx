export function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: [string, string][] }) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-[14px] glass-soft px-[14px] py-[11px] text-[14px] outline-none text-[#eaf2ff] focus:ring-sky"
    >
      {options.map(([v, l]) => (
        <option key={v} value={v} className="bg-[#121a2b]">{l}</option>
      ))}
    </select>
  );
}
