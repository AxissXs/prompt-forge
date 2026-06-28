import type { FormData, ProjectType } from "../types";

export function sumTech(form: FormData) {
  return Object.values(form.tech).reduce(
    (acc: number, v) => acc + (Array.isArray(v) ? v.length : 0),
    0,
  );
}

export function buildPrompt(form: FormData, templates: Record<ProjectType, string>): string {
  const tpl = templates[form.vision.projectType] || templates.webapp;
  const fList = form.features.coreFeatures
    .filter((x) => x.title)
    .map((x) => `• ${x.title} [${x.priority}] — ${x.description}`)
    .join("\n") || "• TBD";

  const strategyBlock = (() => {
    const s = form.strategy;
    switch (s.inputMode) {
      case "lean":
        return `Lean: Problem: ${s.lean_problem}\nSolution: ${s.lean_solution}\nUVP: ${s.lean_uvp}\nUnfair: ${s.lean_unfair}\nChannels: ${s.lean_channels}\nMetrics: ${s.lean_metrics}\nCost: ${s.lean_cost}\nRevenue: ${s.lean_revenue}`;
      case "bmc":
        return `BMC:\nPartners: ${s.bmc_partners}\nActivities: ${s.bmc_activities}\nResources: ${s.bmc_resources}\nValue: ${s.bmc_value}\nRelationships: ${s.bmc_relationships}\nChannels: ${s.bmc_channels}\nSegments: ${s.bmc_segments}\nCost: ${s.bmc_cost}\nRevenue: ${s.bmc_revenue}`;
      case "jtbd":
        return `JTBD:\nSituation: ${s.jtbd_situation}\nMotivation: ${s.jtbd_motivation}\nOutcome: ${s.jtbd_outcome}\nAnxieties: ${s.jtbd_anxieties}\nHabits: ${s.jtbd_habits}`;
      case "vp":
        return `Value Prop:\nJobs: ${s.vp_jobs}\nPains: ${s.vp_pains}\nGains: ${s.vp_gains}`;
      default:
        return `Problem: ${s.problem}\nSolution: ${s.solution}\nGoal: ${s.goal}\nMetrics: ${s.successMetrics}`;
    }
  })();

  const replaceMap: Record<string, string> = {
    projectName: form.vision.projectName,
    oneLiner: form.vision.oneLiner,
    tagline: form.vision.tagline,
    elevatorPitch: form.vision.elevatorPitch,
    appCategory: form.vision.appCategory,
    platformTarget: form.vision.platformTarget.join(", "),
    projectType: form.vision.projectType,
    inputMode: form.strategy.inputMode,
    problem: form.strategy.problem || form.strategy.lean_problem,
    solution: form.strategy.solution || form.strategy.lean_solution,
    goal: form.strategy.goal,
    successMetrics: form.strategy.successMetrics,
    strategyBlock,
    primaryAudience: form.audience.primaryAudience,
    secondaryAudience: form.audience.secondaryAudience,
    personasSummary: form.audience.personas.map((p) => `${p.name} (${p.role})`).join("; "),
    geo: form.audience.geo,
    ageRange: form.audience.ageRange,
    techSavviness: form.audience.techSavviness,
    accessibilityNeeds: form.audience.accessibilityNeeds.join(", "),
    visualStyle: form.brand.visualStyle,
    brandTone: form.brand.brandTone.join(", "),
    colorPrimary: form.brand.colorPrimary,
    colorAccent: form.brand.colorAccent,
    colorNeutral: form.brand.colorNeutral,
    typographyVibe: form.brand.typographyVibe,
    themeMode: form.brand.themeMode,
    motionPersonality: form.brand.motionPersonality,
    featuresList: fList,
    userFlows: form.features.userFlows,
    mustHaves: form.features.mustHaves.join(", "),
    niceToHaves: form.features.niceToHaves.join(", "),
    outOfScope: form.features.outOfScope,
    adminFeatures: form.features.adminFeatures.join(", "),
    permissions: form.features.permissions,
    frontend: form.tech.frontend.join(", "),
    styling: form.tech.styling.join(", "),
    animation: form.tech.animation.join(", "),
    icons: form.tech.icons.join(", "),
    state: form.tech.state.join(", "),
    backend: form.tech.backend.join(", "),
    database: form.tech.database.join(", "),
    auth: form.tech.auth.join(", "),
    realtime: form.tech.realtime.join(", "),
    payments: form.tech.payments.join(", "),
    ai: form.tech.ai.join(", "),
    storage: form.tech.storage.join(", "),
    analytics: form.tech.analytics.join(", "),
    testing: form.tech.testing.join(", "),
    deployTarget: form.tech.deployTarget,
    hostingNotes: form.tech.hostingNotes,
    apiStyle: form.tech.apiStyle,
    monorepo: form.tech.monorepo ? "yes" : "no",
    monorepoLabel: form.tech.monorepo ? "monorepo" : "single app",
    packageManager: form.tech.packageManager,
    tsStrict: form.tech.tsStrict ? "true" : "false",
    dataModels: form.data.dataModels,
    thirdPartyApis: form.data.thirdPartyApis.join(", "),
    compliance: form.data.compliance.join(", "),
    localization: form.data.localization.join(", "),
    offlineSupport: form.data.offlineSupport ? "yes" : "no",
    cachingStrategy: form.data.cachingStrategy,
    rateLimits: form.data.rateLimits,
    monetization: form.business.monetization.join(", "),
    pricingTiers: form.business.pricingTiers,
    gtmChannels: form.business.gtmChannels.join(", "),
    competitors: form.business.competitors,
    differentiator: form.business.differentiator,
    kpis: form.business.kpis.join(" • "),
    businessModel: form.business.businessModel,
    tractionHypothesis: form.business.tractionHypothesis,
    docs: form.delivery.docs.join(", "),
    docsFilesList: form.delivery.docs.join(", "),
    repoStructure: form.delivery.repoStructure,
    qualityBars: form.delivery.qualityBars.join(" • "),
    testingStrategy: form.delivery.testingStrategy,
    accessibilityLevel: form.delivery.accessibilityLevel,
    performanceBudget: form.delivery.performanceBudget,
    seoNeeds: form.delivery.seoNeeds ? "yes" : "no",
    i18n: form.delivery.i18n ? "yes" : "no",
    pwa: form.delivery.pwa ? "yes" : "no",
    observability: form.delivery.observability.join(", "),
    codingAgent: form.meta.codingAgent,
    codeStyle: form.meta.codeStyle.join(" • "),
    fileOrganization: form.meta.fileOrganization,
    extraInstructions: form.meta.extraInstructions || "(none)",
    promptTone: form.meta.promptTone,
  };

  let out = tpl;
  Object.entries(replaceMap).forEach(([k, v]) => {
    out = out.split(`{{${k}}}`).join(String(v ?? ""));
  });
  out = out.replace(/\{\{.*?\}\}/g, "");
  return out;
}
