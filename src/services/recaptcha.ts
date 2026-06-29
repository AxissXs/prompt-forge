// Google reCAPTCHA v3 (invisible) loader.
// Uses Google's official TEST site key by default (always passes) so the
// widget renders & works in the demo. Set VITE_RECAPTCHA_SITE_KEY for prod.
export const RECAPTCHA_SITE_KEY =
  (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) ||
  "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Google test key

let loadPromise: Promise<void> | null = null;
let _loading = false;
let _listeners: Array<(v: boolean) => void> = [];

export function onRecaptchaLoading(cb: (loading: boolean) => void) {
  _listeners.push(cb);
  cb(_loading);
  return () => { _listeners = _listeners.filter((l) => l !== cb); };
}

function setLoading(v: boolean) {
  _loading = v;
  for (const l of _listeners) l(v);
}

export function isLoading(): boolean {
  return _loading;
}

export function loadRecaptcha(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).grecaptcha) return Promise.resolve();
  if (loadPromise) return loadPromise;
  setLoading(true);
  loadPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = `https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`;
    s.async = true;
    s.defer = true;
    s.onload = () => { setLoading(false); resolve(); };
    s.onerror = () => { setLoading(false); reject(new Error("Failed to load reCAPTCHA")); };
    document.head.appendChild(s);
  });
  return loadPromise;
}

export async function executeRecaptcha(action: string): Promise<string> {
  await loadRecaptcha();
  const g = (window as any).grecaptcha;
  if (!g || !g.execute) throw new Error("reCAPTCHA not loaded");
  return g.execute(RECAPTCHA_SITE_KEY, { action });
}