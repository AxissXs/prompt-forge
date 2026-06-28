# PromptForge — Deployment

PromptForge ships with a **real, deployable backend** (NeonDB + serverless API +
Google reCAPTCHA) and a **local fallback** so the static preview is fully
functional without any server.

## Architecture

```
src/services/backend.ts   ← single data layer
   ├── VITE_API_BASE set   → calls /api/* (Neon-backed serverless functions)
   └── not set (default)   → localStorage adapter (single-browser demo "DB")
```

Auth, Explore (public templates + ideas), publishing, and private share links
all work through this one abstraction, so going live only requires setting env
vars — no UI changes.

## 1. Database (NeonDB / Postgres)

1. Create a project at https://neon.tech and copy the connection string.
2. Apply the schema:
   ```bash
   psql "$DATABASE_URL" -f db/schema.sql
   ```
   Tables: `users`, `auth_sessions`, `ideas`, `templates`, `share_links`, `likes`.

## 2. Serverless API

Deployable handlers live in `api/` (Vercel/Netlify/Cloudflare edge compatible),
using `@neondatabase/serverless` over HTTP:

| Route          | Purpose                                            |
| -------------- | -------------------------------------------------- |
| `POST /api/auth`    | register / login / logout (+ reCAPTCHA verify) |
| `GET  /api/auth`    | resolve current user from bearer token         |
| `GET  /api/explore` | list public templates / ideas                  |
| `POST /api/explore` | publish / unpublish / like                     |
| `POST /api/share`   | create a private share link for an idea        |
| `GET  /api/share`   | resolve a shared idea by token                 |

Passwords are hashed with scrypt; sessions are opaque bearer tokens.

## 3. Google reCAPTCHA v2

- The demo uses Google's official **test site key** (always passes) so the
  widget renders out of the box.
- For production, register a key at https://www.google.com/recaptcha/admin and set:
  - `VITE_RECAPTCHA_SITE_KEY` (frontend)
  - `RECAPTCHA_SECRET_KEY` (serverless / verified server-side in `api/_lib.ts`)

## 4. Environment variables

```bash
# Frontend (build time)
VITE_API_BASE=https://your-app.vercel.app/api
VITE_RECAPTCHA_SITE_KEY=your_public_site_key

# Serverless (runtime)
DATABASE_URL=postgres://...neon.tech/...
RECAPTCHA_SECRET_KEY=your_secret_key
```

Without `VITE_API_BASE`, the app runs entirely client-side using localStorage —
ideal for local development and the static preview.

## Features enabled by sign-in

- **Explore** — browse community public templates & ideas, like, clone/import.
- **Publish templates** — make a Prompt Studio template public (appears in Explore).
- **Public ideas** — make a session public & explorable, with tags.
- **Private share links** — `#/shared/<token>` read-only view of an idea, cloneable.
