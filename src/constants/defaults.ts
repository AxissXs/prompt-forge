import type { FormData } from "../types";

export const defaultFormData: FormData = {
  vision: {
    projectName: "",
    oneLiner: "",
    appCategory: "",
    platformTarget: [],
    projectType: "webapp",
    elevatorPitch: "",
    tagline: "",
  },
  strategy: {
    inputMode: "simple",
    problem: "", solution: "", goal: "", successMetrics: "",
    lean_problem: "", lean_solution: "", lean_uvp: "", lean_unfair: "", lean_channels: "", lean_metrics: "", lean_cost: "", lean_revenue: "",
    bmc_partners: "", bmc_activities: "", bmc_resources: "", bmc_value: "", bmc_relationships: "", bmc_channels: "", bmc_segments: "", bmc_cost: "", bmc_revenue: "",
    jtbd_situation: "", jtbd_motivation: "", jtbd_outcome: "", jtbd_anxieties: "", jtbd_habits: "",
    vp_pains: "", vp_gains: "", vp_jobs: "",
  },
  audience: {
    primaryAudience: "", secondaryAudience: "", personas: [], geo: "", ageRange: "", techSavviness: "High", accessibilityNeeds: [], languages: [],
  },
  brand: {
    brandTone: [], visualStyle: "", colorPrimary: "#8eaaff", colorAccent: "#ff9dec", colorNeutral: "#0f1424", typographyVibe: "", inspirationUrls: "", logoDirection: "", themeMode: "both", motionPersonality: "",
  },
  features: {
    coreFeatures: [], userFlows: "", mustHaves: [], niceToHaves: [], outOfScope: "", adminFeatures: [], permissions: "",
  },
  tech: {
    frontend: [], styling: [], animation: [], icons: [], state: [], backend: [], database: [], auth: [], realtime: [], payments: [], ai: [], storage: [], analytics: [], testing: [], deployTarget: "vercel", hostingNotes: "", apiStyle: "tRPC typed + REST webhooks", monorepo: false, packageManager: "pnpm", tsStrict: true,
  },
  data: {
    dataModels: "", thirdPartyApis: [], compliance: [], localization: [], offlineSupport: true, cachingStrategy: "", rateLimits: "",
  },
  business: {
    monetization: [], pricingTiers: "", gtmChannels: [], competitors: "", differentiator: "", kpis: [], businessModel: "", tractionHypothesis: "",
  },
  delivery: {
    docs: [], repoStructure: "", qualityBars: [], testingStrategy: "", accessibilityLevel: "WCAG 2.2 AA", performanceBudget: "", seoNeeds: true, i18n: true, pwa: true, observability: [],
  },
  meta: {
    codingAgent: "generic", codeStyle: [], fileOrganization: "", extraInstructions: "", promptTone: "Crisp, senior engineer brief",
  },
};
