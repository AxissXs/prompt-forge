import { classNames } from "../../utils/classNames";

export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={classNames(
        "w-full rounded-[14px] glass-soft px-[14px] py-[11px] text-[14.5px] outline-none text-[#eaf2ff] placeholder-[#8d9ec3] transition focus:ring-sky",
        props.className,
      )}
    />
  );
}
