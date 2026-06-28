// Google reCAPTCHA v2 (checkbox) loader.
// Uses Google's official TEST site key by default (always passes) so the
// widget renders & works in the demo. Set VITE_RECAPTCHA_SITE_KEY for prod.
export const RECAPTCHA_SITE_KEY =
  (import.meta.env.VITE_RECAPTCHA_SITE_KEY as string) ||
  "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"; // Google test key

let loadPromise: Promise<void> | null = null;

export function loadRecaptcha(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).grecaptcha) return Promise.resolve();
  if (loadPromise) return loadPromise;
  loadPromise = new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load reCAPTCHA"));
    document.head.appendChild(s);
  });
  return loadPromise;
}

export function renderRecaptcha(
  el: HTMLElement,
  onChange: (token: string | null) => void,
): number | null {
  const g = (window as any).grecaptcha;
  if (!g || !g.render) return null;
  return g.render(el, {
    sitekey: RECAPTCHA_SITE_KEY,
    theme: "dark",
    callback: (token: string) => onChange(token),
    "expired-callback": () => onChange(null),
  });
}

export function resetRecaptcha(widgetId: number | null) {
  const g = (window as any).grecaptcha;
  if (g && widgetId !== null) g.reset(widgetId);
}
