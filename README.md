# PromptForge — Idea → Agent Prompt

Turn a raw product idea into a structured, ready-to-use coding agent prompt in minutes.

## What it does

PromptForge is a single-page app that walks you through nine guided steps — Vision, Strategy, Audience, Brand, Features, Tech, Data, Business, and Delivery — and then renders everything into a detailed prompt for Cursor, Copilot, Cline, Bolt, Lovable, or any coding agent.

- **Structured brief builder** — Form sections with smart defaults, chip groups, color pickers, reusable personas, and feature prioritization (P0/P1/P2).
- **Strategy frameworks** — Choose from Simple, Lean Canvas, Business Model Canvas, Jobs-to-be-Done, or Value Proposition Canvas. Only the relevant fields show.
- **Tech catalog** — Curated picks across frontend, backend, database, auth, AI, storage, and more, with inline recommendations.
- **Prompt Studio** — Create and manage your own prompt templates with custom placeholders.
- **Explore** — Browse public templates and ideas published by the community. Like, clone, and import.
- **Auth** — Register/login with scrypt-hashed passwords and opaque bearer tokens, protected by Google reCAPTCHA.
- **Private share links** — Share a read-only view of any idea via an unguessable URL (`#/shared/<token>`).
- **User profiles** — Display name, avatar, website, and social links. All external links use `rel="nofollow noreferrer"`.
- **Local-first** — Works entirely offline with localStorage. Set `VITE_API_BASE` to connect the NeonDB-backed serverless API.
- **Single-file build** — All JS and CSS inlined into a single `index.html` via `vite-plugin-singlefile`.

## Quick start

```bash
npm install
npm run dev
```

Open the URL printed by Vite. The app runs fully client-side — no database or API keys needed to try it.

To deploy the backend, see [DEPLOYMENT.md](DEPLOYMENT.md).

## Tech stack

| Layer | What |
|-------|------|
| Frontend | React 19, TypeScript, Vite 7, Tailwind CSS 4, Framer Motion |
| Backend | Vercel/Netlify serverless functions (Node.js) |
| Database | Neon (Postgres) via `@neondatabase/serverless` |
| Auth | scrypt password hashing, opaque bearer tokens, Google reCAPTCHA v2 |
| Misc | Zod validation, DOMPurify sanitization, inlined build |

## Project structure

```
api/              Serverless functions (auth, explore, share, sync, profile)
db/schema.sql     Postgres schema
src/
  components/     React components (builder steps, UI primitives, modals)
  constants/      Default form data, tech catalog, prompt templates
  context/        AuthContext (login state, token management)
  hooks/          useLocalStorage
  services/       Backend abstraction (remote API or localStorage adapter)
  utils/          Prompt builder, sanitization, validation, class name helpers
  App.tsx         Main app shell, routing, session management
  types.ts        TypeScript types
```

## Contributing

This project is **almost entirely written by various AI models** and reviewed by humans. Contributions that fix bugs, improve accessibility, or polish the UX are very welcome.

1. Fork the repo.
2. Create a feature branch.
3. Make your changes.
4. Run `npm run build` to verify the build.
5. Open a pull request.

By submitting a pull request, you agree that your contributions may be used under the terms of the MIT license.

## License

MIT. See [LICENSE](LICENSE).
