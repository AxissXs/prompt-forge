// POST /api/share  { ideaId }            → create private share link
// GET  /api/share?token=...               → resolve a shared idea
import { sql, getUserFromToken, newToken, json } from "./_lib";

// Uses default Vercel Node.js Serverless runtime (not edge) for full crypto compatibility

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "GET") {
    const token = url.searchParams.get("token");
    if (!token) return json({ error: "missing token" }, 400);
    const rows = await sql`
      select i.name, i.data, u.username as owner_name
      from share_links s join ideas i on i.id = s.idea_id join users u on u.id = s.owner_id
      where s.token = ${token} limit 1`;
    if (!rows.length) return json({ error: "not found" }, 404);
    return json({ item: rows[0] });
  }

  if (req.method === "POST") {
    const user = await getUserFromToken(req.headers.get("authorization") ?? undefined);
    if (!user) return json({ error: "unauthorized" }, 401);
    const { ideaId } = await req.json().catch(() => ({}));
    const owned = await sql`select 1 from ideas where id = ${ideaId} and user_id = ${user.id} limit 1`;
    if (!owned.length) return json({ error: "not found" }, 404);
    const token = newToken();
    await sql`insert into share_links (token, idea_id, owner_id) values (${token}, ${ideaId}, ${user.id})`;
    return json({ token });
  }

  return json({ error: "method not allowed" }, 405);
}
