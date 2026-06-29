import DOMPurify from "dompurify";

DOMPurify.setConfig({ ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

export function sanitize(str: string): string {
  if (!str) return str;
  return DOMPurify.sanitize(str, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
}

export function sanitizeMany<T extends Record<string, unknown>>(obj: T, keys: (keyof T)[]): T {
  const out = { ...obj };
  for (const key of keys) {
    const val = out[key];
    if (typeof val === "string") {
      out[key] = sanitize(val) as T[keyof T];
    }
  }
  return out;
}
