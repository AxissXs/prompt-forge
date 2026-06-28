import { useEffect, useRef, useState } from "react";
import { loadRecaptcha, renderRecaptcha, resetRecaptcha, RECAPTCHA_SITE_KEY } from "../../services/recaptcha";
import { IS_LOCAL_BACKEND } from "../../services/backend";

/**
 * Renders the Google reCAPTCHA v2 checkbox.
 * In local/demo mode (no API) it also exposes a one-click "I'm not a robot"
 * fallback so the flow never blocks if the script is unavailable offline.
 */
export function Recaptcha({ onChange }: { onChange: (token: string | null) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const [failed, setFailed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    loadRecaptcha()
      .then(() => {
        const g = (window as any).grecaptcha;
        if (cancelled || !ref.current || !g) { setFailed(true); return; }
        g.ready(() => {
          if (cancelled || !ref.current) return;
          try {
            if (ref.current.childElementCount === 0) {
              widgetId.current = renderRecaptcha(ref.current, onChange);
            }
          } catch { setFailed(true); }
        });
      })
      .catch(() => setFailed(true));
    return () => { cancelled = true; if (widgetId.current !== null) resetRecaptcha(widgetId.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Offline/demo fallback checkbox
  if (failed && IS_LOCAL_BACKEND) {
    return (
      <button
        type="button"
        onClick={() => { const n = !checked; setChecked(n); onChange(n ? "demo-verified" : null); }}
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
      <div ref={ref} style={{ minHeight: 78 }} />
      {RECAPTCHA_SITE_KEY.startsWith("6LeIxAcT") && (
        <div className="text-[10px] text-[#6d84aa] mt-1">Using Google reCAPTCHA test key (always passes)</div>
      )}
    </div>
  );
}
