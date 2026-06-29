// ===========================================================================
// Shared helpers for PromptForge serverless API (Vercel / Netlify / Cloudflare)
// Uses Neon's serverless driver over HTTP — works in edge & node runtimes.
// Required env vars:
//   DATABASE_URL          — Neon connection string
//   RECAPTCHA_SECRET_KEY  — Google reCAPTCHA v3 secret
// ===========================================================================
import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export const sql = neon(process.env.DATABASE_URL!);

// ── Password hashing (scrypt) ──
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  const hashBuf = Buffer.from(hash, "hex");
  const test = scryptSync(password, salt, 64);
  return hashBuf.length === test.length && timingSafeEqual(hashBuf, test);
}

export function newToken(): string {
  return randomBytes(32).toString("base64url");
}

// ── Google reCAPTCHA v3 verification ──
export async function verifyRecaptcha(token: string, expectedAction?: string): Promise<boolean> {
  if (!token) return false;
  const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      secret: process.env.RECAPTCHA_SECRET_KEY!,
      response: token,
    }),
  });
  const data = (await res.json()) as {
    success: boolean;
    score?: number;
    action?: string;
    "error-codes"?: string[];
  };
  if (!data.success) return false;
  // For v3, verify score (threshold 0.5) and action
  if (data.score !== undefined && data.score < 0.5) return false;
  if (expectedAction && data.action !== expectedAction) return false;
  return true;
}

// ── Resolve a bearer token → user ──
export async function getUserFromToken(authHeader?: string) {
  const token = authHeader?.replace(/^Bearer\s+/i, "");
  if (!token) return null;
  const rows = await sql`
    select u.id, u.email, u.username, u.created_at
    from auth_sessions s join users u on u.id = s.user_id
    where s.token = ${token} and s.expires_at > now()
    limit 1`;
  return rows[0] ?? null;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "access-control-allow-origin": "*" },
  });
}
