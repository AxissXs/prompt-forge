import { useEffect, useRef, useState } from "react";
import { loadRecaptcha, executeRecaptcha, RECAPTCHA_SITE_KEY } from "../../services/recaptcha";
import { IS_LOCAL_BACKEND } from "../../services/backend";

/**
 * Invisible reCAPTCHA v3.
 * Executes automatically on mount and returns a token via onChange.
 * In local/demo mode (no API) it exposes a one-click "I'm not a robot" fallback.
 */
export function Recaptcha({
  onChange,
  action = "submit",
}: { onChange: (token: string | null) => void; action?: string }) {
  const [failed, setFailed] = useState(false);
  const [checked, setChecked] = useState(false);
  const executed = useRef(false);

  useEffect(() => {
    let cancelled = false;
    loadRecaptcha()
      .then(() => {
        if (cancelled) return;
        const g = (window as any).grecaptcha;
        if (!g || !g.execute) {
          setFailed(true);
          return;
        }
        execute();
      })
      .catch(() => setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [action]);

  const execute = async () => {
    if (executed.current) return;
    try {
      const token = await executeRecaptcha(action);
      executed.current = true;
      onChange(token);
    } catch {
      setFailed(true);
    }
  };

  // Offline/demo fallback checkbox
  if (failed && IS_LOCAL_BACKEND) {
    return (
      <button
        type="button"
        onClick={() => {
          const n = !checked;
          setChecked(n);
          onChange(n ? "demo-verified" : null);
        }}
        className="flex items-center gap-3 w-full px-4 py-3 rounded-[12px] glass-soft border border-white/[.1] text-left"
      >
        <span className={`w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition ${checked ? "bg-[#5fd3a0] border-[#5fd3a0]" : "border-[#7d91bc]"}`}>
          {checked && <span className="text-[#05291d] text-[13px] font-bold">✓</span>}
        </span>
        <span className="text-[13px] text-[#cfe3ff]">I'm not a robot</span>
        <span className="ml-auto text-[9px] text-[#6d84aa] mono">demo</span>
      </button>
    );
  }

  return (
    <div>
      {RECAPTCHA_SITE_KEY.startsWith("6LeIxAcT") && (
        <div className="text-[10px] text-[#6d84aa] mt-1">Using Google reCAPTCHA test key (always passes)</div>
      )}
    </div>
  );
}