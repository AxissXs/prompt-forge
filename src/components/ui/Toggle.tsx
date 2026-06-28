import { motion } from "framer-motion";
import { classNames } from "../../utils/classNames";

export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center gap-3">
      <div
        className={classNames(
          "w-[52px] h-[30px] rounded-full p-[4px] transition relative border",
          checked ? "bg-[#cffff1] border-[#9eead5] neu-press" : "glass-soft border-[#ffffff22]",
        )}
      >
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 520, damping: 32 }}
          className={classNames(
            "w-[22px] h-[22px] rounded-full",
            checked ? "bg-[#0c3730] ml-[22px]" : "bg-[#b9d2f5]",
          )}
        />
      </div>
      <span className="text-[13px]">{label}</span>
    </button>
  );
}
