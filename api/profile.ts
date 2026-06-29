// GET  /api/profile?username=...  → view a user's public profile
// POST /api/profile               → update own profile (auth required)
import { sql, getUserFromToken, json, getBody } from "./_lib.js";

export async function fetch(req: Request): Promise<Response> {
  const url = new URL(req.url);

  if (req.method === "GET") {
    const username = url.searchParams.get("username");
    if (!username) return json({ error: "missing username" }, 400);
    const rows = await sql`
      select id, username, display_name, avatar_url, website_url, social_links, created_at
      from users where username = ${username} limit 1`;
    if (!rows.length) return json({ error: "user not found" }, 404);
    const u = rows[0];
    return json({
      id: u.id,
      username: u.username,
      displayName: u.display_name,
      avatarUrl: u.avatar_url,
      websiteUrl: u.website_url,
      socialLinks: u.social_links,
      createdAt: u.created_at,
    });
  }

  if (req.method === "POST") {
    const user = await getUserFromToken(req.headers.get("authorization") ?? undefined);
    if (!user) return json({ error: "unauthorized" }, 401);
    const body = await getBody(req);
    const { displayName, avatarUrl, websiteUrl, socialLinks } = body as {
      displayName?: string;
      avatarUrl?: string;
      websiteUrl?: string;
      socialLinks?: { platform: string; url: string }[];
    };
    await sql`
      update users set
        display_name = ${displayName ?? null},
        avatar_url = ${avatarUrl ?? null},
        website_url = ${websiteUrl ?? null},
        social_links = ${socialLinks ? JSON.stringify(socialLinks) : null}
      where id = ${user.id}`;
    return json({ ok: true });
  }

  return json({ error: "method not allowed" }, 405);
}
