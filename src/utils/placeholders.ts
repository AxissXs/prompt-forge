/**
 * All available template placeholders, grouped by category.
 * Used by the PromptStudio insertion toolbar.
 */
export type Placeholder = { key: string; label: string; hint?: string };
export type PlaceholderCategory = { id: string; label: string; icon: string; items: Placeholder[] };

export const PLACEHOLDER_CATEGORIES: PlaceholderCategory[] = [
  {
    id: "vision", label: "Vision", icon: "💡",
    items: [
      { key: "projectName", label: "Project Name" },
      { key: "oneLiner", label: "One-Liner" },
      { key: "tagline", label: "Tagline" },
      { key: "elevatorPitch", label: "Elevator Pitch" },
      { key: "appCategory", label: "App Category" },
      { key: "platformTarget", label: "Platforms", hint: "comma-separated" },
      { key: "projectType", label: "Project Type" },
    ],
  },
  {
    id: "strategy", label: "Strategy", icon: "🎯",
    items: [
      { key: "inputMode", label: "Input Mode" },
      { key: "problem", label: "Problem" },
      { key: "solution", label: "Solution" },
      { key: "goal", label: "Goal" },
      { key: "successMetrics", label: "Success Metrics" },
      { key: "strategyBlock", label: "Strategy Block", hint: "full formatted block for chosen framework" },
    ],
  },
  {
    id: "audience", label: "Audience", icon: "👥",
    items: [
      { key: "primaryAudience", label: "Primary Audience" },
      { key: "secondaryAudience", label: "Secondary Audience" },
      { key: "personasSummary", label: "Personas Summary", hint: "name (role) list" },
      { key: "geo", label: "Geo / Markets" },
      { key: "ageRange", label: "Age Range" },
      { key: "techSavviness", label: "Tech Savviness" },
      { key: "accessibilityNeeds", label: "Accessibility Needs", hint: "comma-separated" },
    ],
  },
  {
    id: "brand", label: "Brand", icon: "🎨",
    items: [
      { key: "visualStyle", label: "Visual Style" },
      { key: "brandTone", label: "Brand Tone", hint: "comma-separated" },
      { key: "colorPrimary", label: "Primary Color" },
      { key: "colorAccent", label: "Accent Color" },
      { key: "colorNeutral", label: "Neutral Color" },
      { key: "typographyVibe", label: "Typography" },
      { key: "themeMode", label: "Theme Mode" },
      { key: "motionPersonality", label: "Motion Personality" },
    ],
  },
  {
    id: "features", label: "Features", icon: "⚡",
    items: [
      { key: "featuresList", label: "Features List", hint: "formatted list with priorities" },
      { key: "userFlows", label: "User Flows" },
      { key: "mustHaves", label: "Must-Haves", hint: "comma-separated" },
      { key: "niceToHaves", label: "Nice-to-Haves", hint: "comma-separated" },
      { key: "outOfScope", label: "Out of Scope" },
      { key: "adminFeatures", label: "Admin Features", hint: "comma-separated" },
      { key: "permissions", label: "Permissions / Roles" },
    ],
  },
  {
    id: "tech", label: "Tech Stack", icon: "🛠",
    items: [
      { key: "frontend", label: "Frontend", hint: "comma-separated" },
      { key: "styling", label: "Styling / UI", hint: "comma-separated" },
      { key: "animation", label: "Animation", hint: "comma-separated" },
      { key: "icons", label: "Icons", hint: "comma-separated" },
      { key: "state", label: "State Mgmt", hint: "comma-separated" },
      { key: "backend", label: "Backend", hint: "comma-separated" },
      { key: "database", label: "Database", hint: "comma-separated" },
      { key: "auth", label: "Auth", hint: "comma-separated" },
      { key: "realtime", label: "Realtime", hint: "comma-separated" },
      { key: "payments", label: "Payments", hint: "comma-separated" },
      { key: "ai", label: "AI Layer", hint: "comma-separated" },
      { key: "storage", label: "Storage / CDN", hint: "comma-separated" },
      { key: "analytics", label: "Analytics", hint: "comma-separated" },
      { key: "testing", label: "Testing", hint: "comma-separated" },
      { key: "deployTarget", label: "Deploy Target" },
      { key: "hostingNotes", label: "Hosting Notes" },
      { key: "apiStyle", label: "API Style" },
      { key: "monorepo", label: "Monorepo", hint: "yes / no" },
      { key: "monorepoLabel", label: "Monorepo Label", hint: "monorepo / single app" },
      { key: "packageManager", label: "Package Manager" },
      { key: "tsStrict", label: "TypeScript Strict", hint: "true / false" },
    ],
  },
  {
    id: "data", label: "Data & Trust", icon: "🗄",
    items: [
      { key: "dataModels", label: "Data Models" },
      { key: "thirdPartyApis", label: "Third-Party APIs", hint: "comma-separated" },
      { key: "compliance", label: "Compliance", hint: "comma-separated" },
      { key: "localization", label: "Localization", hint: "comma-separated" },
      { key: "offlineSupport", label: "Offline Support", hint: "yes / no" },
      { key: "cachingStrategy", label: "Caching Strategy" },
      { key: "rateLimits", label: "Rate Limits" },
    ],
  },
  {
    id: "business", label: "Business", icon: "💰",
    items: [
      { key: "monetization", label: "Monetization", hint: "comma-separated" },
      { key: "pricingTiers", label: "Pricing Tiers" },
      { key: "gtmChannels", label: "GTM Channels", hint: "comma-separated" },
      { key: "competitors", label: "Competitors" },
      { key: "differentiator", label: "Differentiator" },
      { key: "kpis", label: "KPIs", hint: "joined with •" },
      { key: "businessModel", label: "Business Model" },
      { key: "tractionHypothesis", label: "Traction Hypothesis" },
    ],
  },
  {
    id: "delivery", label: "Delivery", icon: "📦",
    items: [
      { key: "docs", label: "Documentation Files", hint: "comma-separated" },
      { key: "docsFilesList", label: "Docs Files List", hint: "same as docs" },
      { key: "repoStructure", label: "Repo Structure" },
      { key: "qualityBars", label: "Quality Bars", hint: "joined with •" },
      { key: "testingStrategy", label: "Testing Strategy" },
      { key: "accessibilityLevel", label: "Accessibility Level" },
      { key: "performanceBudget", label: "Performance Budget" },
      { key: "seoNeeds", label: "SEO Needed", hint: "yes / no" },
      { key: "i18n", label: "i18n", hint: "yes / no" },
      { key: "pwa", label: "PWA", hint: "yes / no" },
      { key: "observability", label: "Observability", hint: "comma-separated" },
    ],
  },
  {
    id: "meta", label: "Agent / Meta", icon: "🤖",
    items: [
      { key: "codingAgent", label: "Coding Agent" },
      { key: "codeStyle", label: "Code Style", hint: "joined with •" },
      { key: "fileOrganization", label: "File Organization" },
      { key: "extraInstructions", label: "Extra Instructions" },
      { key: "promptTone", label: "Prompt Tone" },
    ],
  },
];

/** Flat list of all placeholder keys */
export const ALL_PLACEHOLDER_KEYS = PLACEHOLDER_CATEGORIES.flatMap((c) => c.items.map((i) => i.key));

/** Get metadata for a placeholder key */
export function getPlaceholderMeta(key: string): Placeholder | undefined {
  for (const cat of PLACEHOLDER_CATEGORIES) {
    const found = cat.items.find((i) => i.key === key);
    if (found) return found;
  }
  return undefined;
}
