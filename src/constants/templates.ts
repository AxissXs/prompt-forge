import type { ProjectType } from "../types";

export const DEFAULT_TEMPLATES: Record<ProjectType, string> = {
  webapp: `You are a senior full-stack engineer building {{projectName}}.

MISSION
"{{oneLiner}}"
{{elevatorPitch}}

AUDIENCE
Primary: {{primaryAudience}}
Secondary: {{secondaryAudience}}

BRAND & UX
Visual direction: {{visualStyle}}
Tone: {{brandTone}}
Theme mode: {{themeMode}}. Colors – primary {{colorPrimary}}, accent {{colorAccent}}, neutral {{colorNeutral}}.
Typography: {{typographyVibe}}
Motion: {{motionPersonality}}

STRATEGY SNAPSHOT
Problem: {{problem}}
Solution: {{solution}}
Goal: {{goal}}
{{strategyBlock}}

CORE FEATURES
{{featuresList}}

APP FLOWS
{{userFlows}}

TECH STACK (respect exact choices)
Frontend: {{frontend}}
Styling: {{styling}}
Animation: {{animation}}
Icons: {{icons}}
State: {{state}}
Backend: {{backend}}
DB: {{database}}
Auth: {{auth}}
Realtime: {{realtime}}
Payments: {{payments}}
AI: {{ai}}
Storage: {{storage}}
Analytics: {{analytics}}
Testing: {{testing}}
Deploy: {{deployTarget}} – {{hostingNotes}}
API: {{apiStyle}}
Monorepo: {{monorepo}}
PM: {{packageManager}} / Strict TS: {{tsStrict}}

DATA
Models: {{dataModels}}
3rd-party: {{thirdPartyApis}}
Compliance: {{compliance}}
i18n: {{localization}}
Offline: {{offlineSupport}}
Caching: {{cachingStrategy}}

BUSINESS
Monetization: {{monetization}}
Pricing: {{pricingTiers}}
KPIs: {{kpis}}

DELIVERABLES
- Production-ready {{projectType}} in TypeScript
- Componentized UI, NO 1000-line files
- Tailwind + shadcn style system, dark+light if theme=both
- Auth, billing, analytics wired
- Accessibility WCAG {{accessibilityLevel}}
- Performance: {{performanceBudget}}
- Tests: {{testingStrategy}}
- Docs: {{docs}}
Repo: {{repoStructure}}

QUALITY GUIDELINES ({{codingAgent}} mode)
- {{codeStyle}}
- {{fileOrganization}}
- zod input validation, error boundaries, loading + empty states
- Framer-motion respecting prefers-reduced-motion
- Security: auth guards, rate-limit, env secrets in .env.example
- Create: {{docsFilesList}}

EXTRA
{{extraInstructions}}
Tone for code comments: {{promptTone}}

Now scaffold the full project with install commands, file tree, and initial code for each core file.`,

  saas: `You are building a production SaaS: {{projectName}} — {{tagline}}
"{{oneLiner}}"

VISION
{{elevatorPitch}}

PRODUCT THESIS ({{inputMode}} framework)
{{strategyBlock}}

CUSTOMERS
{{primaryAudience}} // {{personasSummary}}
Markets: {{geo}} / {{ageRange}} – {{techSavviness}} savvy
Accessibility: {{accessibilityNeeds}}

BRAND SYSTEM
{{visualStyle}} // {{brandTone}} // {{motionPersonality}}
Palette {{colorPrimary}} / {{colorAccent}} / {{colorNeutral}}
Type {{typographyVibe}} — theme {{themeMode}}

FEATURE MATRIX
{{featuresList}}
Must-have: {{mustHaves}}
Nice: {{niceToHaves}}
Out of scope: {{outOfScope}}
Admin: {{adminFeatures}}
Permissions: {{permissions}}

STACK LOCK-IN
FE: {{frontend}} + {{styling}} + {{animation}} + {{icons}}
State: {{state}}
BE: {{backend}} via {{apiStyle}}
DB: {{database}}
Auth: {{auth}} / Payments: {{payments}} / AI: {{ai}}
Realtime {{realtime}} / Storage {{storage}}
Analytics {{analytics}} / Testing {{testing}}
Deploy {{deployTarget}} ({{hostingNotes}})
TypeScript strict={{tsStrict}} / PM={{packageManager}} / {{monorepoLabel}}

DATA & TRUST
Entities: {{dataModels}}
APIs: {{thirdPartyApis}}
Compliance: {{compliance}} | i18n {{localization}} | offline {{offlineSupport}}
{{cachingStrategy}} | Rate: {{rateLimits}}

BUSINESS ENGINE
{{businessModel}} – {{monetization}}
{{pricingTiers}}
GTM: {{gtmChannels}}
KPIs: {{kpis}}
Competitors: {{competitors}}
Edge: {{differentiator}}

DELIVERY CONTRACT
Repo {{repoStructure}}
QA bars: {{qualityBars}}
{{testingStrategy}}
A11y {{accessibilityLevel}} / Perf {{performanceBudget}} / SEO {{seoNeeds}} / PWA {{pwa}}
Observability: {{observability}}
Documentation: {{docs}}

ENGINEERING PRINCIPLES: {{codingAgent}}
{{codeStyle}}
{{fileOrganization}}

INSTRUCTIONS
Generate a complete, modular Next.js 14 SaaS with app router, server actions, auth, Stripe, PostHog, AI nudge endpoints, Prisma schema, and all docs listed. Split components. Use server components where possible. No mega files.
{{extraInstructions}}
`,

  mobile: `Build a delightful mobile app: {{projectName}} ({{platformTarget}})
"{{oneLiner}}" – {{tagline}}

Problem → {{problem}}
Solution → {{solution}}
Outcome → {{goal}}

Who: {{primaryAudience}}
Personas: {{personasSummary}}

Brand: {{visualStyle}} / {{brandTone}} / {{motionPersonality}}
Colors {{colorPrimary}}, {{colorAccent}}
Theme {{themeMode}}

Features:
{{featuresList}}
Flows: {{userFlows}}

Tech (mobile-first):
React Native + Expo, TypeScript strict
UI: {{styling}} equivalent (NativeWind / tamagui)
Animation: react-native-reanimated
Icons: {{icons}}
State: {{state}}
Backend: {{backend}} / DB {{database}} / Auth {{auth}}
Push: Expo notifications / Realtime {{realtime}}
Analytics {{analytics}}
Deploy: EAS Build + OTA

Data: {{dataModels}}
Offline-first: {{offlineSupport}}, sync queue, secure storage
Compliance {{compliance}}

Business: {{monetization}} / {{pricingTiers}}
KPIs {{kpis}}

Docs: {{docs}}
Quality: {{qualityBars}} / {{accessibilityLevel}}

Deliver a production Expo app with typed API client, auth flow, habit logging in <7s, native haptics, reduced motion checks, and full documentation. Modular architecture, no 1-file screens. {{extraInstructions}}`,

  api: `You are generating a resilient typed API/service: {{projectName}}
Mission: {{oneLiner}}
{{elevatorPitch}}

Domain: {{appCategory}}
Consumers: {{primaryAudience}}

Endpoints derived from:
{{featuresList}}
Models: {{dataModels}}

Stack:
Runtime {{backend}}
Language: TypeScript strict
API style: {{apiStyle}}
DB: {{database}}
Auth: {{auth}}
Cache: {{cachingStrategy}}
Rate: {{rateLimits}}
Observability: {{observability}}
Testing: {{testing}}
Deploy: {{deployTarget}} – {{hostingNotes}}

Security: JWT / API keys, zod validation, Helmet, CORS allowlist, rate-limit, PII encryption, audit logs
Docs: OpenAPI 3.1 at /docs + {{docs}}

Scaffold:
- /src/routes (feature grouped)
- /src/services
- /src/db (prisma schema)
- /src/middleware
- tests/

Generate full server code, migration, seed, Dockerfile, CI, and all requested docs. {{extraInstructions}}`,

  extension: `Build a polished browser extension: {{projectName}}
"{{oneLiner}}"

Pitch: {{elevatorPitch}}
User: {{primaryAudience}}

Brand {{visualStyle}} // {{brandTone}}
Colors {{colorPrimary}} / {{colorAccent}}

Features:
{{featuresList}}
Flows: {{userFlows}}

Stack:
WXT + React + TypeScript
Styling: {{styling}}
Animation: {{animation}}
Icons: {{icons}}
State: {{state}}
Backend: {{backend}} if needed
Storage: chrome.storage.local + sync
Auth: {{auth}}
Analytics: {{analytics}}

MV3 manifest, content script isolated world, background service worker, popup glass UI, options page.
Permissions minimal. Tests: {{testing}}
Docs: {{docs}}

Output complete extension folder with manifest, build script, and all files split cleanly. {{extraInstructions}}`,

  "ai-agent": `You are architecting an AI agent system: {{projectName}}
"{{oneLiner}}"

Use case: {{problem}} → {{solution}}
Success: {{goal}} / {{successMetrics}}

Users: {{primaryAudience}}

Features / Tools:
{{featuresList}}
Flows: {{userFlows}}

AI stack: {{ai}}
Backend: {{backend}} / DB {{database}} ({{dataModels}})
Auth {{auth}}
Observability {{observability}}
Deploy {{deployTarget}}

Agent design:
- System prompt with safety rails
- Tool schemas (zod)
- Memory vector store (pgvector if available)
- Streaming responses
- Guardrails / moderation
- Eval harness

Deliver a typed agent server, tool registry, prompt files, eval set, and docs: {{docs}}. Code is modular, no giant handlers. {{extraInstructions}}`,
};
