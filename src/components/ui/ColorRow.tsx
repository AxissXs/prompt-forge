import { Input } from "./Input";

export function ColorRow({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-[46px] h-[36px] rounded-[10px] bg-transparent cursor-pointer"
      />
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}
