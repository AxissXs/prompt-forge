import { classNames } from "../../utils/classNames";

export function GlassPanel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={classNames("glass rounded-[22px]", className)}>{children}</div>;
}
