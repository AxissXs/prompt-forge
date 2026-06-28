import { useState } from "react";
import { Input } from "./Input";

export function ChipGroup({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [temp, setTemp] = useState("");
  const handleAdd = (v: string) => {
    const trimmed = v.trim();
    if (trimmed && !value.includes(trimmed)) onChange([...value, trimmed]);
    setTemp("");
  };
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Input
          value={temp}
          onChange={(e) => setTemp(e.target.value)}
          placeholder={placeholder || "Add custom..."}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); handleAdd(temp); } }}
        />
        <button
          type="button"
          className="px-4 rounded-[12px] glass-soft text-[12px] font-[500] hover:bg-white/[.08] transition"
          onClick={() => handleAdd(temp)}
        >
          Add
        </button>
      </div>
      <div className="flex flex-wrap gap-[8px]">
        {value.map((v) => (
          <span
            key={v}
            className="px-[12px] py-[7px] rounded-full text-[12.5px] border bg-[#e9f7ff] text-[#0e2837] border-[#bbebff] shadow-[0_4px_18px_rgba(115,198,255,.13)] font-[500] flex items-center gap-1"
          >
            {v}
            <button type="button" className="opacity-60 hover:opacity-100 ml-1" onClick={() => onChange(value.filter((x) => x !== v))}>×</button>
          </span>
        ))}
        {options.filter((opt) => !value.includes(opt)).map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => handleAdd(opt)}
            className="px-[12px] py-[7px] rounded-full text-[12.5px] border transition glass-soft border-[#ffffff19] text-[#a4bed4] hover:text-[#e4f0ff] hover:bg-white/[.045]"
          >
            + {opt}
          </button>
        ))}
      </div>
    </div>
  );
}

export function MultiFree({ value, onChange, placeholder, options }: { value: string[]; onChange: (v: string[]) => void; placeholder?: string; options?: string[] }) {
  return <ChipGroup options={options || []} value={value} onChange={onChange} placeholder={placeholder} />;
}
