// GET  /api/explore?kind=templates|ideas      → public listings
// POST /api/explore  { action, ... }           → publish/unpublish/like
import { sql, getUserFromToken, json, getBody } from "./_lib.js";

// Uses default Vercel Node.js Serverless runtime (not edge) for full crypto compatibility

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "GET") {
    const kind = url.searchParams.get("kind") ?? "templates";
    if (kind === "templates") {
      const rows = await sql`
        select t.id, t.id as template_id, t.name, t.content, t.project_type,
               t.likes, t.uses, t.updated_at as published_at,
               u.id as author_id, u.username as author_name
        from templates t join users u on u.id = t.user_id
        where t.is_public order by t.likes desc, t.updated_at desc limit 100`;
      return json({ items: rows });
    }
    const rows = await sql`
      select i.id, i.id as session_id, i.name, i.data, i.updated_at as published_at,
             u.id as author_id, u.username as author_name
      from ideas i join users u on u.id = i.user_id
      where i.is_public order by i.updated_at desc limit 100`;
    return json({ items: rows });
  }

  if (req.method === "POST") {
    const user = await getUserFromToken(
      req.headers.get("authorization") ?? undefined,
    );
    if (!user) return json({ error: "unauthorized" }, 401);
    const body = await getBody(req);
    const { action } = body as { action?: string };

    if (action === "publishTemplate")
      await sql`update templates set is_public = true where id = ${body.id} and user_id = ${user.id}`;
    else if (action === "unpublishTemplate")
      await sql`update templates set is_public = false where id = ${body.id} and user_id = ${user.id}`;
    else if (action === "publishIdea")
      await sql`update ideas set is_public = true where id = ${body.id} and user_id = ${user.id}`;
    else if (action === "unpublishIdea")
      await sql`update ideas set is_public = false where id = ${body.id} and user_id = ${user.id}`;
    else if (action === "like") {
      await sql`insert into likes (user_id, item_kind, item_id) values (${user.id}, ${body.kind}, ${body.id})
                on conflict do nothing`;
      if (body.kind === "template")
        await sql`update templates set likes = likes + 1 where id = ${body.id}`;
      else await sql`update ideas set likes = likes + 1 where id = ${body.id}`;
    } else return json({ error: "unknown action" }, 400);

    return json({ ok: true });
  }

  return json({ error: "method not allowed" }, 405);
}
