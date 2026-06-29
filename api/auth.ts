// POST /api/auth — { action: 'register' | 'login' | 'logout' | 'me', ... }
import {
  sql,
  hashPassword,
  verifyPassword,
  newToken,
  verifyRecaptcha,
  getUserFromToken,
  json,
  getBody,
} from "./_lib.js";

// Uses default Vercel Node.js Serverless runtime (not edge) for full crypto compatibility

export default async function handler(req: Request): Promise<Response> {
  if (req.method === "GET") {
    const user = await getUserFromToken(
      req.headers.get("authorization") ?? undefined,
    );
    return json({ user });
  }
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const body = await getBody(req);
  const { action } = body as { action?: string };

  if (action === "register") {
    const { email, username, password, recaptchaToken } = body;
    if (!(await verifyRecaptcha(recaptchaToken, "register")))
      return json({ error: "reCAPTCHA failed" }, 400);
    if (!email || !username || !password)
      return json({ error: "missing fields" }, 400);
    const existing =
      await sql`select 1 from users where email = ${email} or username = ${username} limit 1`;
    if (existing.length)
      return json({ error: "email or username already taken" }, 409);
    const rows = await sql`
      insert into users (email, username, password_hash)
      values (${email}, ${username}, ${hashPassword(password)})
      returning id, email, username, created_at`;
    const user = rows[0];
    const token = newToken();
    await sql`insert into auth_sessions (token, user_id) values (${token}, ${user.id})`;
    return json({ token, user });
  }

  if (action === "login") {
    const { email, password, recaptchaToken } = body;
    if (!(await verifyRecaptcha(recaptchaToken, "login")))
      return json({ error: "reCAPTCHA failed" }, 400);
    const rows = await sql`select * from users where email = ${email} limit 1`;
    const u = rows[0];
    if (!u || !verifyPassword(password, u.password_hash))
      return json({ error: "invalid credentials" }, 401);
    const token = newToken();
    await sql`insert into auth_sessions (token, user_id) values (${token}, ${u.id})`;
    return json({
      token,
      user: {
        id: u.id,
        email: u.email,
        username: u.username,
        created_at: u.created_at,
      },
    });
  }

  if (action === "logout") {
    const token = (req.headers.get("authorization") ?? "").replace(
      /^Bearer\s+/i,
      "",
    );
    if (token) await sql`delete from auth_sessions where token = ${token}`;
    return json({ ok: true });
  }

  return json({ error: "unknown action" }, 400);
}
