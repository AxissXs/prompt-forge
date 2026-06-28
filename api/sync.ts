// POST /api/sync — Bulk merges/uploads local templates & ideas into Postgres DB
import { sql, getUserFromToken, json } from "./_lib";

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const user = await getUserFromToken(req.headers.get("authorization") ?? undefined);
  if (!user) return json({ error: "unauthorized" }, 401);

  const { sessions, templates } = await req.json().catch(() => ({}));

  try {
    // ── Merge templates ──
    if (Array.isArray(templates) && templates.length > 0) {
      for (const t of templates) {
        // Upsert by template ID or name
        await sql`
          insert into templates (user_id, name, content, project_type, is_public)
          values (${user.id}, ${t.name}, ${t.content}, ${t.projectType}, ${!!t.isPublic})
          on conflict do nothing`;
      }
    }

    // ── Merge sessions/ideas ──
    if (Array.isArray(sessions) && sessions.length > 0) {
      for (const s of sessions) {
        // Upsert by name or ID
        await sql`
          insert into ideas (user_id, name, data, is_public)
          values (${user.id}, ${s.name}, ${JSON.stringify(s.data)}, false)
          on conflict do nothing`;
      }
    }

    return json({ ok: true });
  } catch (err: any) {
    return json({ error: err.message || "Sync failed" }, 500);
  }
}
