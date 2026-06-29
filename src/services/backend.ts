import type {
  AuthSession, User, FormData, PromptTemplate, Session,
  PublicTemplate, PublicIdea,
} from "../types";
import { uid } from "../utils/uid";
import { sanitize } from "../utils/sanitize";

/**
 * Backend abstraction.
 * - When VITE_API_BASE is set, talks to the real Neon-backed serverless API.
 * - Otherwise uses a localStorage-backed adapter so the app is fully
 *   functional in the static preview (single-browser "shared DB").
 */
const API_BASE = import.meta.env.VITE_API_BASE;
export const IS_LOCAL_BACKEND = !API_BASE;

/* ============================ REMOTE ADAPTER ============================ */
function authHeaders(token?: string): Record<string, string> {
  return token ? { authorization: `Bearer ${token}` } : {};
}

const remote = {
  async register(email: string, username: string, password: string, recaptchaToken: string) {
    const r = await fetch(`${API_BASE}/auth`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "register", email, username, password, recaptchaToken }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Register failed");
    return (await r.json()) as AuthSession;
  },
  async login(email: string, password: string, recaptchaToken: string) {
    const r = await fetch(`${API_BASE}/auth`, {
      method: "POST", headers: { "content-type": "application/json" },
      body: JSON.stringify({ action: "login", email, password, recaptchaToken }),
    });
    if (!r.ok) throw new Error((await r.json()).error || "Login failed");
    return (await r.json()) as AuthSession;
  },
  async logout(token: string) {
    await fetch(`${API_BASE}/auth`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ action: "logout" }) });
  },
  async listPublicTemplates() {
    const r = await fetch(`${API_BASE}/explore?kind=templates`);
    return ((await r.json()).items ?? []) as PublicTemplate[];
  },
  async listPublicIdeas() {
    const r = await fetch(`${API_BASE}/explore?kind=ideas`);
    return ((await r.json()).items ?? []) as PublicIdea[];
  },
  async setTemplatePublic(token: string, id: string, pub: boolean) {
    await fetch(`${API_BASE}/explore`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ action: pub ? "publishTemplate" : "unpublishTemplate", id }) });
  },
  async setIdeaPublic(token: string, id: string, pub: boolean) {
    await fetch(`${API_BASE}/explore`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ action: pub ? "publishIdea" : "unpublishIdea", id }) });
  },
  async like(token: string, kind: "template" | "idea", id: string) {
    await fetch(`${API_BASE}/explore`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ action: "like", kind, id }) });
  },
  async createShareLink(token: string, ideaId: string) {
    const r = await fetch(`${API_BASE}/share`, { method: "POST", headers: { "content-type": "application/json", ...authHeaders(token) }, body: JSON.stringify({ ideaId }) });
    return (await r.json()).token as string;
  },
  async resolveShare(token: string) {
    const r = await fetch(`${API_BASE}/share?token=${encodeURIComponent(token)}`);
    if (!r.ok) return null;
    return (await r.json()).item as { name: string; data: FormData; owner_name: string };
  },
  async sync(token: string, sessions: any[], templates: any[]) {
    await fetch(`${API_BASE}/sync`, {
      method: "POST",
      headers: { "content-type": "application/json", ...authHeaders(token) },
      body: JSON.stringify({ sessions, templates }),
    });
  },
};

/* ============================ LOCAL ADAPTER ============================ */
const LS = {
  users: "pf_users", pubT: "pf_public_templates", pubI: "pf_public_ideas",
  shares: "pf_shares", likes: "pf_likes",
};
type StoredUser = User & { passwordHash: string };
const read = <T,>(k: string, d: T): T => { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } };
const write = (k: string, v: unknown) => localStorage.setItem(k, JSON.stringify(v));
const hash = (s: string) => { let h = 0; for (let i = 0; i < s.length; i++) { h = (h << 5) - h + s.charCodeAt(i); h |= 0; } return String(h); };
const delay = (ms = 280) => new Promise((r) => setTimeout(r, ms));

function sanitizeStrings<T>(obj: T): T {
  if (typeof obj === "string") return sanitize(obj) as T;
  if (Array.isArray(obj)) return obj.map(sanitizeStrings) as T;
  if (obj && typeof obj === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
      out[k] = sanitizeStrings(v);
    }
    return out as T;
  }
  return obj;
}

const local = {
  async register(email: string, username: string, password: string, recaptchaToken: string): Promise<AuthSession> {
    await delay();
    if (!recaptchaToken) throw new Error("Please complete the reCAPTCHA");
    const users = read<StoredUser[]>(LS.users, []);
    if (users.some((u) => u.email === email)) throw new Error("Email already registered");
    if (users.some((u) => u.username === username)) throw new Error("Username already taken");
    const user: User = { id: uid(), email, username, createdAt: Date.now() };
    users.push({ ...user, passwordHash: hash(password) });
    write(LS.users, users);
    return { token: `local-${user.id}`, user };
  },
  async login(email: string, password: string, recaptchaToken: string): Promise<AuthSession> {
    await delay();
    if (!recaptchaToken) throw new Error("Please complete the reCAPTCHA");
    const users = read<StoredUser[]>(LS.users, []);
    const u = users.find((x) => x.email === email);
    if (!u || u.passwordHash !== hash(password)) throw new Error("Invalid email or password");
    const { passwordHash, ...user } = u;
    return { token: `local-${user.id}`, user };
  },
  async logout() { /* no-op locally */ },
  async listPublicTemplates(): Promise<PublicTemplate[]> {
    await delay(120);
    return read<PublicTemplate[]>(LS.pubT, []).sort((a, b) => b.likes - a.likes || b.publishedAt - a.publishedAt).map((t) => sanitizeStrings(t));
  },
  async listPublicIdeas(): Promise<PublicIdea[]> {
    await delay(120);
    return read<PublicIdea[]>(LS.pubI, []).sort((a, b) => b.publishedAt - a.publishedAt).map((i) => sanitizeStrings(i));
  },
  async setTemplatePublic(_t: string, _id: string, _pub: boolean) { /* handled by publishTemplate */ },
  async setIdeaPublic(_t: string, _id: string, _pub: boolean) { /* handled by publishIdea */ },
  async like(_token: string, kind: "template" | "idea", id: string) {
    if (kind === "template") {
      const list = read<PublicTemplate[]>(LS.pubT, []);
      const i = list.findIndex((x) => x.id === id); if (i >= 0) { list[i].likes++; write(LS.pubT, list); }
    } else {
      const list = read<PublicIdea[]>(LS.pubI, []);
      const i = list.findIndex((x) => x.id === id); if (i >= 0) { list[i].likes++; write(LS.pubI, list); }
    }
  },
  async createShareLink(_token: string, ideaId: string, payload?: { name: string; data: FormData; owner: User }) {
    const token = uid() + uid();
    const shares = read<Record<string, any>>(LS.shares, {});
    shares[token] = { name: payload?.name, data: payload?.data, owner_name: payload?.owner.username, sessionId: ideaId };
    write(LS.shares, shares);
    return token;
  },
  async resolveShare(token: string) {
    await delay(120);
    const shares = read<Record<string, any>>(LS.shares, {});
    const item = shares[token] ?? null;
    return item ? sanitizeStrings(item) : null;
  },
  async sync(_token: string, _sessions: any[], _templates: any[]) {
    await delay(350); // simulation delay
  },
};

/* ─── Local-only helpers for publish (need full payload client-side) ─── */
export function localPublishTemplate(t: PromptTemplate, author: User) {
  const list = read<PublicTemplate[]>(LS.pubT, []);
  const existing = list.findIndex((x) => x.templateId === t.id);
  const entry: PublicTemplate = {
    id: existing >= 0 ? list[existing].id : uid(),
    templateId: t.id, name: t.name, content: t.content, projectType: t.projectType,
    authorId: author.id, authorName: author.username, publishedAt: Date.now(),
    likes: existing >= 0 ? list[existing].likes : 0, uses: existing >= 0 ? list[existing].uses : 0,
  };
  if (existing >= 0) list[existing] = entry; else list.unshift(entry);
  write(LS.pubT, list);
}
export function localUnpublishTemplate(templateId: string) {
  write(LS.pubT, read<PublicTemplate[]>(LS.pubT, []).filter((x) => x.templateId !== templateId));
}
export function localPublishIdea(s: Session, author: User, tags: string[]) {
  const list = read<PublicIdea[]>(LS.pubI, []);
  const existing = list.findIndex((x) => x.sessionId === s.id);
  const entry: PublicIdea = {
    id: existing >= 0 ? list[existing].id : uid(),
    sessionId: s.id, name: s.name, projectName: s.data.vision.projectName,
    oneLiner: s.data.vision.oneLiner, projectType: s.data.vision.projectType, tags,
    data: s.data, authorId: author.id, authorName: author.username,
    publishedAt: Date.now(), likes: existing >= 0 ? list[existing].likes : 0,
  };
  if (existing >= 0) list[existing] = entry; else list.unshift(entry);
  write(LS.pubI, list);
}
export function localUnpublishIdea(sessionId: string) {
  write(LS.pubI, read<PublicIdea[]>(LS.pubI, []).filter((x) => x.sessionId !== sessionId));
}
export function localIsTemplatePublic(templateId: string) {
  return read<PublicTemplate[]>(LS.pubT, []).some((x) => x.templateId === templateId);
}
export function localIsIdeaPublic(sessionId: string) {
  return read<PublicIdea[]>(LS.pubI, []).some((x) => x.sessionId === sessionId);
}

export const backend = API_BASE ? remote : local;
