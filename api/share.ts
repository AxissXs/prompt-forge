// POST /api/share  { name, data }   → create idea + private share link
// GET  /api/share?token=...         → resolve a shared idea
import { sql, getUserFromToken, newToken, json, getBody } from "./_lib.js";

export async function fetch(req: Request): Promise<Response> {
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
    const user = await getUserFromToken(
      req.headers.get("authorization") ?? undefined,
    );
    if (!user) return json({ error: "unauthorized" }, 401);
    const { name, data } = await getBody(req);

    // Create the idea (client-side IDs like uid() are not valid PG UUIDs)
    const idea = await sql`
      insert into ideas (user_id, name, data, is_public)
      values (${user.id}, ${name ?? "Untitled"}, ${data ? JSON.stringify(data) : "{}"}, false)
      returning id`;
    const ideaId = idea[0].id;

    const token = newToken();
    await sql`insert into share_links (token, idea_id, owner_id) values (${token}, ${ideaId}, ${user.id})`;
    return json({ token });
  }

  return json({ error: "method not allowed" }, 405);
}
