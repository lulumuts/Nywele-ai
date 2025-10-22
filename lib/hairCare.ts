// Hair Care Recommendation System
// Generates personalized daily, weekly, and monthly routines

// ==================== INTERFACES ====================

export interface HairCareProfile {
  hairAnalysis: {
    type: string; // e.g., "4c", "3b"
    health: number; // 0-100
    texture: string; // coily, curly, wavy
    density: string; // thin, medium, thick
    porosity: "low" | "medium" | "high";
    elasticity?: "low" | "medium" | "high";
    currentDamage?: string[]; // split ends, breakage, dryness
  };
  currentStyle?: {
    name: string;
    installedDate: Date;
    maintenanceDue: Date;
  };
  goals: Array<"growth" | "moisture" | "strength" | "shine" | "protective">;
  concerns: string[]; // breakage, dryness, thinning, dandruff
  lifestyle: {
    activity: "low" | "moderate" | "high";
    climate: "humid" | "dry" | "temperate";
    budget: { min: number; max: number };
  };
  allergies?: string[];
}

export interface RoutineStep {
  stepNumber: number;
  action: string;
  product?: string;
  duration?: string;
  frequency: string;
  importance: "essential" | "recommended" | "optional";
  reasoning: string;
  videoTutorial?: string;
}

export interface ProductRecommendation {
  id: string;
  name: string;
  brand: string;
  category: "shampoo" | "conditioner" | "oil" | "treatment" | "styler" | "tool";
  purpose: string;
  benefits: string[];
  howToUse: string;
  frequency: string;
  pricing: {
    amount: number;
    currency: string;
    size: string;
    costPerUse: number;
  };
  alternatives: Array<{
    name: string;
    brand: string;
    price: number;
    quality: "budget" | "mid-range" | "premium";
  }>;
  whereToBuy: string[];
  aiInsight: string;
}

export interface HairCareRecommendation {
  routineId: string;
  confidence: number; // 0-100
  personalizedRoutine: {
    daily: RoutineStep[];
    weekly: RoutineStep[];
    monthly: RoutineStep[];
  };
  productRecommendations: {
    essential: ProductRecommendation[];
    optional: ProductRecommendation[];
    alternatives: ProductRecommendation[];
  };
  maintenanceSchedule: {
    nextTrim: Date;
    nextDeepCondition: Date;
    nextProteinTreatment: Date;
    styleRefresh?: Date;
  };
  tips: {
    dos: string[];
    donts: string[];
    proTips: string[];
  };
  expectedResults: {
    timeline: string; // "2-4 weeks"
    improvements: string[];
    metrics: {
      healthImprovement: number; // estimated % increase
      moistureLevel: string;
      strengthLevel: string;
    };
  };
}

// ==================== NEEDS ASSESSMENT ====================

export function identifyPrimaryNeeds(profile: HairCareProfile): string[] {
  const needs: string[] = [];

  // Based on health score
  if (profile.hairAnalysis.health < 50) {
    needs.push("repair", "moisture");
  } else if (profile.hairAnalysis.health < 70) {
    needs.push("maintenance", "protection");
  } else {
    needs.push("maintenance");
  }

  // Based on porosity
  if (profile.hairAnalysis.porosity === "high") {
    needs.push("protein", "sealing");
  } else if (profile.hairAnalysis.porosity === "low") {
    needs.push("hydration", "penetration");
  } else {
    needs.push("balance");
  }

  // Based on goals
  if (profile.goals.includes("growth")) {
    needs.push("scalp-care", "stimulation");
  }

  if (profile.goals.includes("moisture")) {
    needs.push("deep-conditioning", "hydration");
  }

  if (profile.goals.includes("strength")) {
    needs.push("protein", "fortifying");
  }

  if (profile.goals.includes("shine")) {
    needs.push("sealing", "smoothing");
  }

  // Based on concerns
  if (profile.concerns.includes("breakage")) {
    needs.push("protein", "strengthening");
  }

  if (profile.concerns.includes("dryness")) {
    needs.push("moisture", "oil-treatments");
  }

  if (profile.concerns.includes("thinning")) {
    needs.push("scalp-care", "growth-stimulation");
  }

  if (profile.concerns.includes("dandruff")) {
    needs.push("scalp-treatment", "clarifying");
  }

  // Remove duplicates
  return [...new Set(needs)];
}

// ==================== DAILY ROUTINE ====================

export function buildDailyRoutine(
  profile: HairCareProfile,
  needs: string[]
): RoutineStep[] {
  const routine: RoutineStep[] = [];

  // Morning routine
  if (profile.currentStyle?.name) {
    routine.push({
      stepNumber: 1,
      action: "Refresh your style",
      duration: "5-10 mins",
      frequency: "Every morning",
      importance: "recommended",
      reasoning: `Keep your ${profile.currentStyle.name} looking fresh throughout the day`,
      product: needs.includes("moisture")
        ? "Light leave-in conditioner or hair mist"
        : "Light styling cream or edge control",
    });
  }

  // Scalp care (always essential)
  routine.push({
    stepNumber: routine.length + 1,
    action: "Moisturize scalp",
    duration: "2-3 mins",
    frequency: "Daily (morning or night)",
    importance: "essential",
    reasoning: "Healthy hair starts with a healthy scalp - keeps it nourished and prevents dryness",
    product: needs.includes("scalp-care")
      ? "Growth-promoting scalp oil or serum"
      : "Lightweight hair oil (jojoba, tea tree, or peppermint)",
  });

  // Night routine - protection
  routine.push({
    stepNumber: routine.length + 1,
    action: "Protect hair before bed",
    duration: "5 mins",
    frequency: "Every night",
    importance: "essential",
    reasoning: "Prevents breakage, maintains moisture, and reduces frizz while sleeping",
    product: "Satin/silk bonnet, scarf, or pillowcase",
  });

  // Night oil treatment (if needed)
  if (needs.includes("moisture") || needs.includes("repair")) {
    routine.push({
      stepNumber: routine.length + 1,
      action: "Apply night oil treatment",
      duration: "3-5 mins",
      frequency: "Every night",
      importance: needs.includes("repair") ? "essential" : "recommended",
      reasoning: "Seals in moisture overnight for healthier, stronger hair",
      product: `Nourishing hair oil blend (coconut, jojoba, or argan)${
        profile.hairAnalysis.porosity === "low" ? " - use light oils" : ""
      }`,
    });
  }

  return routine;
}

// ==================== WEEKLY ROUTINE ====================

export function buildWeeklyRoutine(
  profile: HairCareProfile,
  needs: string[]
): RoutineStep[] {
  const routine: RoutineStep[] = [];

  // Cleanse scalp and hair
  routine.push({
    stepNumber: 1,
    action: "Cleanse scalp and hair",
    duration: "10-15 mins",
    frequency: profile.lifestyle.activity === "high" ? "2 times per week" : "Once per week",
    importance: "essential",
    reasoning: "Removes buildup, sweat, and product residue while maintaining natural oils",
    product: needs.includes("moisture")
      ? `Sulfate-free moisturizing shampoo for ${profile.hairAnalysis.type} hair`
      : needs.includes("clarifying")
      ? "Gentle clarifying shampoo (alternate with moisturizing)"
      : "Gentle cleansing shampoo",
  });

  // Deep conditioning
  routine.push({
    stepNumber: 2,
    action: "Deep condition",
    duration: "20-30 mins (with heat cap for best results)",
    frequency: "Once per week minimum",
    importance: "essential",
    reasoning: `Restores moisture, strengthens, and improves elasticity for ${profile.hairAnalysis.type} hair`,
    product:
      profile.hairAnalysis.porosity === "low"
        ? "Deep conditioning mask with heat (helps penetration for low porosity)"
        : "Deep conditioning mask or treatment",
  });

  // Protein treatment (if needed)
  if (
    needs.includes("protein") ||
    needs.includes("repair") ||
    needs.includes("strengthening")
  ) {
    routine.push({
      stepNumber: 3,
      action: "Protein treatment",
      duration: "15-20 mins",
      frequency: profile.hairAnalysis.health < 50 ? "Once per week" : "Every 2-3 weeks",
      importance: profile.hairAnalysis.health < 50 ? "essential" : "recommended",
      reasoning: "Rebuilds hair strength, reduces breakage, and restores protein-moisture balance",
      product: "Protein-rich hair mask or treatment (alternate with deep conditioner)",
    });
  }

  // Scalp treatment/massage
  if (needs.includes("scalp-care") || profile.goals.includes("growth")) {
    routine.push({
      stepNumber: 4,
      action: "Scalp massage with growth oil",
      duration: "10-15 mins",
      frequency: "2-3 times per week",
      importance: "recommended",
      reasoning: "Stimulates blood flow to hair follicles for faster, healthier growth",
      product: "Growth-promoting scalp oil (rosemary, peppermint, or castor oil blend)",
      videoTutorial: "scalp-massage-technique",
    });
  }

  // Leave-in treatment
  routine.push({
    stepNumber: routine.length + 1,
    action: "Apply leave-in conditioner",
    duration: "5 mins",
    frequency: "After every wash",
    importance: "essential",
    reasoning: "Provides ongoing moisture, detangles, and protects hair between washes",
    product: "Leave-in conditioner suitable for your hair type and porosity",
  });

  return routine;
}

// ==================== MONTHLY ROUTINE ====================

export function buildMonthlyRoutine(
  profile: HairCareProfile,
  needs: string[]
): RoutineStep[] {
  const routine: RoutineStep[] = [];

  // Clarifying wash
  routine.push({
    stepNumber: 1,
    action: "Clarifying wash",
    duration: "15 mins",
    frequency: "Once per month",
    importance: "recommended",
    reasoning: "Removes stubborn buildup from products, hard water, and environment for a fresh start",
    product: "Clarifying shampoo or apple cider vinegar rinse",
  });

  // Hot oil treatment
  if (
    needs.includes("moisture") ||
    needs.includes("repair") ||
    profile.hairAnalysis.porosity === "low"
  ) {
    routine.push({
      stepNumber: 2,
      action: "Hot oil treatment",
      duration: "30-45 mins",
      frequency: "1-2 times per month",
      importance: needs.includes("repair") ? "essential" : "recommended",
      reasoning:
        profile.hairAnalysis.porosity === "low"
          ? "Heat helps oils penetrate low porosity hair for deep moisture"
          : "Deeply penetrates hair shaft for maximum moisture and repair",
      product: "Natural oils (coconut, olive, avocado) - warm before application",
    });
  }

  // Trim ends
  const needsTrim =
    profile.hairAnalysis.health < 60 ||
    profile.hairAnalysis.currentDamage?.includes("split ends") ||
    profile.concerns.includes("breakage");

  if (needsTrim) {
    routine.push({
      stepNumber: 3,
      action: "Trim ends",
      duration: "30 mins",
      frequency: "Every 6-8 weeks",
      importance: "essential",
      reasoning: "Removes damaged ends to prevent further splitting and promote healthy growth",
      product: "Professional trim or DIY with sharp hair scissors (dust trim if growing out)",
    });
  } else if (profile.goals.includes("growth")) {
    routine.push({
      stepNumber: 3,
      action: "Dust/search and destroy",
      duration: "20 mins",
      frequency: "Every 8-12 weeks",
      importance: "recommended",
      reasoning: "Removes only damaged ends while retaining length for growth",
      product: "Sharp hair scissors - trim individual split ends only",
    });
  }

  // Porosity treatment (if high porosity)
  if (profile.hairAnalysis.porosity === "high") {
    routine.push({
      stepNumber: routine.length + 1,
      action: "Apple cider vinegar rinse",
      duration: "10 mins",
      frequency: "1-2 times per month",
      importance: "recommended",
      reasoning: "Helps close cuticles and seal moisture in high porosity hair",
      product: "Diluted apple cider vinegar (1 part ACV to 4 parts water)",
    });
  }

  return routine;
}

// ==================== MAINTENANCE SCHEDULE ====================

export function createMaintenanceSchedule(profile: HairCareProfile): {
  nextTrim: Date;
  nextDeepCondition: Date;
  nextProteinTreatment: Date;
  styleRefresh?: Date;
} {
  const now = new Date();

  // Calculate next trim (6-8 weeks based on health)
  const weeksUntilTrim = profile.hairAnalysis.health < 60 ? 6 : 8;
  const nextTrim = new Date(now);
  nextTrim.setDate(now.getDate() + weeksUntilTrim * 7);

  // Next deep condition (7 days)
  const nextDeepCondition = new Date(now);
  nextDeepCondition.setDate(now.getDate() + 7);

  // Next protein treatment (2-3 weeks based on health)
  const weeksUntilProtein = profile.hairAnalysis.health < 50 ? 1 : 2;
  const nextProteinTreatment = new Date(now);
  nextProteinTreatment.setDate(now.getDate() + weeksUntilProtein * 7);

  // Style refresh (if current style exists)
  let styleRefresh: Date | undefined;
  if (profile.currentStyle?.maintenanceDue) {
    styleRefresh = profile.currentStyle.maintenanceDue;
  }

  return {
    nextTrim,
    nextDeepCondition,
    nextProteinTreatment,
    styleRefresh,
  };
}

// ==================== PERSONALIZED TIPS ====================

export function generatePersonalizedTips(profile: HairCareProfile): {
  dos: string[];
  donts: string[];
  proTips: string[];
} {
  const dos: string[] = [];
  const donts: string[] = [];
  const proTips: string[] = [];

  // Universal dos
  dos.push("Drink plenty of water for hydrated hair from the inside out");
  dos.push("Sleep on satin or silk to reduce friction and breakage");
  dos.push("Detangle gently from ends to roots with a wide-tooth comb");

  // Universal don'ts
  donts.push("Don't use heat without a heat protectant");
  donts.push("Don't skip deep conditioning - it's essential for hair health");
  donts.push("Don't manipulate your hair too much - low manipulation = less breakage");

  // Porosity-specific
  if (profile.hairAnalysis.porosity === "low") {
    dos.push("Use heat when deep conditioning to help products penetrate");
    dos.push("Use lighter oils like jojoba, argan, or grapeseed");
    donts.push("Don't use heavy butters and thick oils - they sit on top");
    proTips.push("💡 Steam treatments work wonders for low porosity hair");
  } else if (profile.hairAnalysis.porosity === "high") {
    dos.push("Layer products: water-based leave-in, then oil, then butter (LOC method)");
    dos.push("Use protein treatments regularly to fill in gaps");
    donts.push("Don't skip the sealing step - your hair loses moisture quickly");
    proTips.push("💡 ACV rinses help close your cuticles and retain moisture");
  }

  // Health-specific
  if (profile.hairAnalysis.health < 50) {
    dos.push("Focus on protein-moisture balance - damaged hair needs both");
    dos.push("Protective styling is your friend right now");
    donts.push("Don't use heat tools - give your hair a break to recover");
    proTips.push("💡 Consider a protein treatment followed by deep moisture - watch your hair transform");
  }

  // Goal-specific
  if (profile.goals.includes("growth")) {
    dos.push("Massage your scalp daily to stimulate blood flow");
    dos.push("Protect your ends - they're the oldest part of your hair");
    proTips.push("💡 Inversion method: massage scalp upside down for 4 mins daily");
  }

  if (profile.goals.includes("moisture")) {
    dos.push("Use the greenhouse effect: apply moisturizer, then plastic cap overnight");
    proTips.push("💡 Refresh moisture daily with water + leave-in in a spray bottle");
  }

  // Lifestyle-specific
  if (profile.lifestyle.activity === "high") {
    dos.push("Rinse and co-wash more frequently to remove sweat");
    proTips.push("💡 Quick refresh: diluted leave-in spray after workouts keeps hair fresh");
  }

  if (profile.lifestyle.climate === "humid") {
    proTips.push("💡 Use gel or styling cream to define curls and fight frizz in humidity");
  } else if (profile.lifestyle.climate === "dry") {
    dos.push("Seal in moisture more frequently - dry climates rob hair of hydration");
    proTips.push("💡 Use a humidifier at night to keep moisture in the air");
  }

  return { dos, donts, proTips };
}

// ==================== EXPECTED RESULTS ====================

export function calculateExpectedResults(
  profile: HairCareProfile,
  needs: string[]
): {
  timeline: string;
  improvements: string[];
  metrics: {
    healthImprovement: number;
    moistureLevel: string;
    strengthLevel: string;
  };
} {
  const improvements: string[] = [];
  let timeline = "4-6 weeks";
  let healthImprovement = 0;

  // Calculate health improvement potential
  if (profile.hairAnalysis.health < 50) {
    healthImprovement = 30; // Damaged hair can improve significantly
    timeline = "6-8 weeks";
    improvements.push("Reduced breakage and shedding");
    improvements.push("Improved moisture retention");
    improvements.push("Stronger, more elastic hair");
  } else if (profile.hairAnalysis.health < 70) {
    healthImprovement = 20;
    timeline = "4-6 weeks";
    improvements.push("Enhanced shine and softness");
    improvements.push("Better curl definition");
  } else {
    healthImprovement = 10;
    timeline = "2-4 weeks";
    improvements.push("Maintained health and vitality");
    improvements.push("Enhanced natural shine");
  }

  // Goal-specific improvements
  if (profile.goals.includes("growth")) {
    improvements.push("Noticeable growth (expect 0.5-1 inch per month with healthy practices)");
  }

  if (profile.goals.includes("moisture")) {
    improvements.push("Deeply hydrated, softer hair");
  }

  if (profile.goals.includes("strength")) {
    improvements.push("Reduced breakage during styling");
  }

  // Moisture level prediction
  let moistureLevel = "moderate";
  if (needs.includes("moisture") || needs.includes("deep-conditioning")) {
    moistureLevel = "high";
  }

  // Strength level prediction
  let strengthLevel = "moderate";
  if (needs.includes("protein") || needs.includes("strengthening")) {
    strengthLevel = "improving to strong";
  }

  return {
    timeline,
    improvements,
    metrics: {
      healthImprovement,
      moistureLevel,
      strengthLevel,
    },
  };
}

// ==================== CONFIDENCE CALCULATION ====================

export function calculateConfidence(profile: HairCareProfile): number {
  let confidence = 50; // Base confidence

  // More data = higher confidence
  if (profile.hairAnalysis.health > 0) confidence += 10;
  if (profile.hairAnalysis.porosity) confidence += 10;
  if (profile.hairAnalysis.texture) confidence += 5;
  if (profile.hairAnalysis.density) confidence += 5;
  if (profile.goals.length > 0) confidence += 10;
  if (profile.concerns.length > 0) confidence += 5;
  if (profile.lifestyle) confidence += 5;

  return Math.min(100, confidence);
}

// ==================== MAIN GENERATOR ====================

export function generateHairCareRoutine(
  profile: HairCareProfile
): HairCareRecommendation {
  // Step 1: Assess needs
  const primaryNeeds = identifyPrimaryNeeds(profile);

  // Step 2: Build routines
  const dailyRoutine = buildDailyRoutine(profile, primaryNeeds);
  const weeklyRoutine = buildWeeklyRoutine(profile, primaryNeeds);
  const monthlyRoutine = buildMonthlyRoutine(profile, primaryNeeds);

  // Step 3: Create maintenance schedule
  const schedule = createMaintenanceSchedule(profile);

  // Step 4: Generate tips
  const tips = generatePersonalizedTips(profile);

  // Step 5: Calculate expected results
  const expectedResults = calculateExpectedResults(profile, primaryNeeds);

  // Step 6: Calculate confidence
  const confidence = calculateConfidence(profile);

  // Generate unique ID
  const routineId = `routine_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Note: Product recommendations will be added in the API layer
  // For now, return empty arrays
  return {
    routineId,
    confidence,
    personalizedRoutine: {
      daily: dailyRoutine,
      weekly: weeklyRoutine,
      monthly: monthlyRoutine,
    },
    productRecommendations: {
      essential: [],
      optional: [],
      alternatives: [],
    },
    maintenanceSchedule: schedule,
    tips,
    expectedResults,
  };
}

