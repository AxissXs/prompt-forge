export type ProjectType = "webapp" | "saas" | "mobile" | "api" | "extension" | "ai-agent";
export type InputMode = "simple" | "lean" | "bmc" | "jtbd" | "vp";
export type AgentTarget = "generic" | "cursor" | "copilot" | "cline" | "bolt" | "lovable";

export type Persona = { id: string; name: string; role: string; pain: string; goal: string };
export type FeatureItem = { id: string; title: string; description: string; priority: "P0" | "P1" | "P2" };

export type FormData = {
  vision: {
    projectName: string;
    oneLiner: string;
    appCategory: string;
    platformTarget: string[];
    projectType: ProjectType;
    elevatorPitch: string;
    tagline: string;
  };
  strategy: {
    inputMode: InputMode;
    problem: string;
    solution: string;
    goal: string;
    successMetrics: string;
    lean_problem: string;
    lean_solution: string;
    lean_uvp: string;
    lean_unfair: string;
    lean_channels: string;
    lean_metrics: string;
    lean_cost: string;
    lean_revenue: string;
    bmc_partners: string;
    bmc_activities: string;
    bmc_resources: string;
    bmc_value: string;
    bmc_relationships: string;
    bmc_channels: string;
    bmc_segments: string;
    bmc_cost: string;
    bmc_revenue: string;
    jtbd_situation: string;
    jtbd_motivation: string;
    jtbd_outcome: string;
    jtbd_anxieties: string;
    jtbd_habits: string;
    vp_pains: string;
    vp_gains: string;
    vp_jobs: string;
  };
  audience: {
    primaryAudience: string;
    secondaryAudience: string;
    personas: Persona[];
    geo: string;
    ageRange: string;
    techSavviness: string;
    accessibilityNeeds: string[];
    languages: string[];
  };
  brand: {
    brandTone: string[];
    visualStyle: string;
    colorPrimary: string;
    colorAccent: string;
    colorNeutral: string;
    typographyVibe: string;
    inspirationUrls: string;
    logoDirection: string;
    themeMode: "dark" | "light" | "auto" | "both";
    motionPersonality: string;
  };
  features: {
    coreFeatures: FeatureItem[];
    userFlows: string;
    mustHaves: string[];
    niceToHaves: string[];
    outOfScope: string;
    adminFeatures: string[];
    permissions: string;
  };
  tech: {
    frontend: string[];
    styling: string[];
    animation: string[];
    icons: string[];
    state: string[];
    backend: string[];
    database: string[];
    auth: string[];
    realtime: string[];
    payments: string[];
    ai: string[];
    storage: string[];
    analytics: string[];
    testing: string[];
    deployTarget: string;
    hostingNotes: string;
    apiStyle: string;
    monorepo: boolean;
    packageManager: string;
    tsStrict: boolean;
  };
  data: {
    dataModels: string;
    thirdPartyApis: string[];
    compliance: string[];
    localization: string[];
    offlineSupport: boolean;
    cachingStrategy: string;
    rateLimits: string;
  };
  business: {
    monetization: string[];
    pricingTiers: string;
    gtmChannels: string[];
    competitors: string;
    differentiator: string;
    kpis: string[];
    businessModel: string;
    tractionHypothesis: string;
  };
  delivery: {
    docs: string[];
    repoStructure: string;
    qualityBars: string[];
    testingStrategy: string;
    accessibilityLevel: string;
    performanceBudget: string;
    seoNeeds: boolean;
    i18n: boolean;
    pwa: boolean;
    observability: string[];
  };
  meta: {
    codingAgent: AgentTarget;
    codeStyle: string[];
    fileOrganization: string;
    extraInstructions: string;
    promptTone: string;
  };
};

export type Session = { id: string; name: string; updatedAt: number; data: FormData };

export type SavedPrompt = {
  id: string;
  name: string;
  sessionId: string;
  sessionName: string;
  projectType: ProjectType;
  agentTarget: AgentTarget;
  templateContent: string;
  renderedContent: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
};

export type PromptTemplate = {
  id: string;
  name: string;
  content: string;
  projectType: ProjectType;
  createdAt: number;
  updatedAt: number;
  isPublic?: boolean;
};

/* ─── Auth & social ─── */
export type User = {
  id: string;
  email: string;
  username: string;
  createdAt: number;
};

export type AuthSession = {
  token: string;
  user: User;
};

export type PublicTemplate = {
  id: string;            // public listing id
  templateId: string;    // source template id
  name: string;
  content: string;
  projectType: ProjectType;
  authorId: string;
  authorName: string;
  publishedAt: number;
  likes: number;
  uses: number;
};

export type PublicIdea = {
  id: string;            // public listing id
  sessionId: string;     // source session id
  name: string;
  projectName: string;
  oneLiner: string;
  projectType: ProjectType;
  tags: string[];
  data: FormData;        // full snapshot
  authorId: string;
  authorName: string;
  publishedAt: number;
  likes: number;
};

export type ShareLink = {
  token: string;         // unguessable token used in the URL
  kind: "idea";
  sessionId: string;
  name: string;
  data: FormData;
  ownerId: string;
  ownerName: string;
  createdAt: number;
};
