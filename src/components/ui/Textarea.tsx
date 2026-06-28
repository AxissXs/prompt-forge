import { classNames } from "../../utils/classNames";

export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={classNames(
        "w-full min-h-[110px] rounded-[14px] glass-soft px-[14px] py-[12px] text-[14px] leading-relaxed outline-none text-[#eaf2ff] placeholder-[#8d9ec3] transition focus:ring-sky scroll-fancy",
        props.className,
      )}
    />
  );
}
