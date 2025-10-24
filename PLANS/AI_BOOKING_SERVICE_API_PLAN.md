# Nywele AI Booking Service - API Product Plan

## Vision

Create a standalone AI-powered booking service API that provides:

1. **Intelligent Hairstyle Recommendations** - Personalized style matching based on hair analysis
2. **Smart Product Suggestions** - AI-curated product lists for each style
3. **Hair Care Recommendations** - Personalized routines and product suggestions for hair health
4. **Proactive Rebooking System** - In-app notifications for style maintenance
5. **Complete E2E Booking Flow** - From photo upload to stylist matching

This becomes a **marketable B2B service** that salons, beauty apps, and hair care platforms can integrate.

---

## Core Value Proposition

### What Makes This Stand Out?

✅ **AI-Powered Hair Analysis** - Vision API detects hair type, health, porosity, and current style  
✅ **Personalized Style Matching** - ML algorithm scores styles based on 6+ factors  
✅ **Product Intelligence** - Auto-generate product lists with quantities and costs  
✅ **Hair Care Routines** - Generate personalized daily/weekly/monthly maintenance schedules  
✅ **Proactive Engagement** - Smart reminders based on style maintenance cycles  
✅ **Seamless Integration** - RESTful API that plugs into any platform

### The Competitive Edge

- **Traditional booking**: Manual browsing, no personalization, no product guidance, no ongoing care
- **Nywele AI**: Upload photo → Get AI recommendations → See exact products → Get personalized hair care routine → Book with confidence → Maintain healthy hair

---

## Product Architecture

### API Service (Core Offering)

```
┌─────────────────────────────────────────────────────────┐
│              NYWELE AI BOOKING SERVICE                  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────┐  ┌──────────────────┐            │
│  │  Hair Analysis  │  │  Style Matching  │            │
│  │  (Vision API)   │  │  (ML Algorithm)  │            │
│  └────────┬────────┘  └────────┬─────────┘            │
│           │                     │                       │
│           └──────────┬──────────┘                       │
│                      │                                  │
│           ┌──────────▼──────────┐                      │
│           │  Recommendation     │                      │
│           │  Engine             │                      │
│           └──────────┬──────────┘                      │
│                      │                                  │
│        ┌─────────────┴─────────────┐                  │
│        │                           │                   │
│  ┌─────▼──────┐           ┌───────▼────────┐         │
│  │  Product   │           │  Booking       │         │
│  │  Generator │           │  Orchestrator  │         │
│  └────────────┘           └────────────────┘         │
│                                                         │
└─────────────────────────────────────────────────────────┘
                         │
                         ▼
              ┌──────────────────┐
              │  Client Apps     │
              │  (Salons, Apps)  │
              └──────────────────┘
```

### Integration Points

```typescript
// External apps integrate via REST API
POST /api/v1/analyze-hair
POST /api/v1/recommend-styles
POST /api/v1/generate-products
POST /api/v1/create-booking
GET  /api/v1/booking-reminders/:userId
```

---

## Feature 1: AI-Powered Hairstyle Recommendations

### Current State

✅ Vision API analyzes hair photos  
✅ Basic style matching in booking flow  
⚠️ Limited personalization  
⚠️ No scoring transparency

### Enhanced Implementation

#### 1.1 Multi-Factor Recommendation Engine

```typescript
interface RecommendationFactors {
  hairAnalysis: {
    type: string; // From Vision API
    health: number; // 0-100 score
    texture: string; // From analysis
    density: string; // From analysis
  };
  userProfile: {
    lifestyle: "active" | "professional" | "casual";
    goals: string[]; // growth, protective, low-maintenance
    budget: { min: number; max: number };
    timeAvailable: number; // hours per styling session
  };
  bookingHistory: {
    previousStyles: string[];
    preferredMaintenance: number; // weeks
    averageSpend: number;
  };
  contextual: {
    season: string; // Summer/Winter recommendations
    trending: boolean; // Is this style popular now?
    occasion: string; // Casual, formal, special event
  };
}

interface StyleRecommendation {
  styleId: string;
  styleName: string;
  score: number; // 0-100
  confidence: number; // 0-100
  reasoning: {
    hairTypeMatch: { score: number; explanation: string };
    budgetFit: { score: number; explanation: string };
    maintenanceMatch: { score: number; explanation: string };
    healthCompatibility: { score: number; explanation: string };
    varietyScore: { score: number; explanation: string };
    trendingBonus: { score: number; explanation: string };
  };
  estimatedResults: {
    duration: string;
    maintenance: string;
    costRange: { min: number; max: number };
    timeToComplete: string;
  };
  visualPreview: {
    beforeAfterUrls: string[];
    similarResults: string[];
  };
  products: ProductList; // From Feature 2
}
```

#### 1.2 Scoring Algorithm (Enhanced)

```typescript
function scoreStyle(
  style: Style,
  factors: RecommendationFactors
): StyleRecommendation {
  const scores = {
    hairTypeMatch: 0,
    budgetFit: 0,
    maintenanceMatch: 0,
    healthCompatibility: 0,
    varietyScore: 0,
    trendingBonus: 0,
  };

  // Hair Type Match (35%) - Most important
  if (style.suitableHairTypes.includes(factors.hairAnalysis.type)) {
    scores.hairTypeMatch = 35;
    if (style.optimalHairTypes.includes(factors.hairAnalysis.type)) {
      scores.hairTypeMatch = 40; // Bonus for optimal match
    }
  }

  // Budget Fit (25%)
  const styleCost = (style.costRange.min + style.costRange.max) / 2;
  const userBudget =
    (factors.userProfile.budget.min + factors.userProfile.budget.max) / 2;
  const budgetDiff = Math.abs(styleCost - userBudget) / userBudget;
  scores.budgetFit = Math.max(0, 25 - budgetDiff * 25);

  // Maintenance Match (15%)
  const maintenanceWeeks =
    (style.maintenanceDuration.min + style.maintenanceDuration.max) / 2;
  const userPreference = factors.bookingHistory.preferredMaintenance || 6;
  const maintenanceDiff = Math.abs(maintenanceWeeks - userPreference);
  scores.maintenanceMatch = Math.max(0, 15 - maintenanceDiff * 2);

  // Health Compatibility (15%)
  // Low-manipulation styles score higher for damaged hair
  if (factors.hairAnalysis.health < 50 && style.isProtective) {
    scores.healthCompatibility = 15;
  } else if (factors.hairAnalysis.health >= 70) {
    scores.healthCompatibility = 12; // Any style works
  } else {
    scores.healthCompatibility = 8;
  }

  // Variety Score (5%)
  const recentStyles = factors.bookingHistory.previousStyles.slice(0, 3);
  if (!recentStyles.includes(style.name)) {
    scores.varietyScore = 5;
    // Extra bonus for trying different category
    const styleCategory = getStyleCategory(style.name);
    const recentCategories = recentStyles.map(getStyleCategory);
    if (!recentCategories.includes(styleCategory)) {
      scores.varietyScore = 7;
    }
  }

  // Trending Bonus (5%)
  if (style.isTrending && factors.contextual.trending) {
    scores.trendingBonus = 5;
  }

  const totalScore = Object.values(scores).reduce((a, b) => a + b, 0);
  const confidence = calculateConfidence(factors);

  return {
    styleId: style.id,
    styleName: style.name,
    score: totalScore,
    confidence,
    reasoning: {
      hairTypeMatch: {
        score: scores.hairTypeMatch,
        explanation: generateExplanation("hairType", style, factors),
      },
      budgetFit: {
        score: scores.budgetFit,
        explanation: generateExplanation("budget", style, factors),
      },
      // ... other explanations
    },
    estimatedResults: {
      /* ... */
    },
    visualPreview: {
      /* ... */
    },
    products: generateProductList(style, factors), // Feature 2
  };
}
```

#### 1.3 Confidence Scoring

```typescript
// How confident are we in this recommendation?
function calculateConfidence(factors: RecommendationFactors): number {
  let confidence = 50; // Base

  // More data = higher confidence
  if (factors.hairAnalysis.health > 0) confidence += 10;
  if (factors.userProfile.lifestyle) confidence += 10;
  if (factors.bookingHistory.previousStyles.length > 0) confidence += 15;
  if (factors.bookingHistory.previousStyles.length > 2) confidence += 10;
  if (factors.hairAnalysis.texture && factors.hairAnalysis.density)
    confidence += 5;

  return Math.min(100, confidence);
}
```

---

## Feature 2: Smart Product Suggestions

### Current State

✅ Job specs include product lists  
⚠️ Fixed quantities  
⚠️ No personalization  
⚠️ No alternatives

### Enhanced Implementation

#### 2.1 Dynamic Product Generation

```typescript
interface ProductSuggestion {
  id: string;
  name: string;
  category: "extension" | "gel" | "oil" | "treatment" | "tool";
  brand: string;
  quantity: {
    amount: number;
    unit: string;
    reasoning: string; // "Based on your hair length and density"
  };
  pricing: {
    unitPrice: number;
    totalPrice: number;
    currency: string;
    alternatives: Array<{
      brand: string;
      price: number;
      quality: "budget" | "mid-range" | "premium";
    }>;
  };
  purpose: string; // "For installing and securing braids"
  optional: boolean;
  aiRecommendation: {
    whyRecommended: string;
    expectedResults: string;
    warnings?: string[]; // e.g., "May cause buildup if overused"
  };
}

interface ProductList {
  styleId: string;
  styleName: string;
  totalCost: {
    min: number;
    max: number;
    breakdown: {
      materials: number;
      labor: number;
      optional: number;
    };
  };
  required: ProductSuggestion[];
  optional: ProductSuggestion[];
  alternatives: {
    budgetFriendly: ProductSuggestion[];
    premium: ProductSuggestion[];
  };
  shoppingList: {
    printable: string; // Formatted text
    shareable: string; // Link to share
  };
}
```

#### 2.2 Personalized Quantity Calculation

```typescript
function calculateProductQuantity(
  product: Product,
  style: Style,
  hairAnalysis: HairAnalysis,
  userProfile: UserProfile
): { amount: number; unit: string; reasoning: string } {
  let baseAmount = product.baseQuantity;
  let multiplier = 1.0;
  let reasons: string[] = [];

  // Adjust for hair length
  if (hairAnalysis.length === "long") {
    multiplier *= 1.3;
    reasons.push("extra for long hair");
  } else if (hairAnalysis.length === "short") {
    multiplier *= 0.8;
    reasons.push("less needed for short hair");
  }

  // Adjust for hair density
  if (hairAnalysis.density === "thick") {
    multiplier *= 1.2;
    reasons.push("thick hair requires more");
  } else if (hairAnalysis.density === "thin") {
    multiplier *= 0.9;
    reasons.push("thin hair needs less");
  }

  // Style-specific adjustments
  if (style.complexity === "high" && product.category === "extension") {
    multiplier *= 1.15;
    reasons.push("complex style needs extra");
  }

  const finalAmount = Math.ceil(baseAmount * multiplier);
  const reasoning =
    reasons.length > 0
      ? `Adjusted: ${reasons.join(", ")}`
      : "Standard amount for this style";

  return {
    amount: finalAmount,
    unit: product.unit,
    reasoning,
  };
}
```

#### 2.3 Budget-Aware Product Selection

```typescript
function selectProductsForBudget(
  requiredProducts: Product[],
  budget: { min: number; max: number },
  preferences: { quality: 'budget' | 'mid-range' | 'premium' }
): ProductList {
  let selectedProducts: ProductSuggestion[] = [];
  let totalCost = 0;

  for (const product of requiredProducts) {
    // Get all brand options
    const options = product.brandOptions.sort((a, b) => a.price - b.price);

    // Select based on budget and preference
    let selected;
    if (preferences.quality === 'budget') {
      selected = options[0]; // Cheapest
    } else if (preferences.quality === 'premium') {
      selected = options[options.length - 1]; // Most expensive
    } else {
      // Mid-range: find middle option
      selected = options[Math.floor(options.length / 2)];
    }

    // Calculate quantity
    const quantity = calculateProductQuantity(/* ... */);

    // Add to list
    selectedProducts.push({
      id: product.id,
      name: product.name,
      category: product.category,
      brand: selected.brand,
      quantity,
      pricing: {
        unitPrice: selected.price,
        totalPrice: selected.price * quantity.amount,
        currency: 'KES',
        alternatives: options.filter(o => o !== selected)
      },
      purpose: product.purpose,
      optional: product.optional,
      aiRecommendation: generateProductRecommendation(product, selected)
    });

    totalCost += selected.price * quantity.amount;
  }

  // If over budget, suggest swaps
  if (totalCost > budget.max) {
    selectedProducts = optimizeForBudget(selectedProducts, budget.max);
  }

  return {
    styleId: /* ... */,
    styleName: /* ... */,
    totalCost: { /* ... */ },
    required: selectedProducts.filter(p => !p.optional),
    optional: selectedProducts.filter(p => p.optional),
    alternatives: generateAlternatives(selectedProducts, budget),
    shoppingList: generateShoppingList(selectedProducts)
  };
}
```

---

## Feature 3: Hair Care Recommendations

### Current State

✅ Basic product recommendations exist  
⚠️ Not personalized to hair analysis  
⚠️ No routine generation  
⚠️ No maintenance schedules

### Enhanced Implementation

#### 3.1 Hair Care Recommendation Engine

```typescript
interface HairCareProfile {
  hairAnalysis: {
    type: string;
    health: number;
    texture: string;
    density: string;
    porosity: "low" | "medium" | "high";
    elasticity: "low" | "medium" | "high";
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

interface HairCareRecommendation {
  routineId: string;
  confidence: number;
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
    styleRefresh: Date;
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

interface RoutineStep {
  stepNumber: number;
  action: string;
  product?: string;
  duration?: string;
  frequency: string;
  importance: "essential" | "recommended" | "optional";
  reasoning: string;
  videoTutorial?: string;
}

interface ProductRecommendation {
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
  whereToBy: string[];
  aiInsight: string;
}
```

#### 3.2 Routine Generation Algorithm

```typescript
async function generateHairCareRoutine(
  profile: HairCareProfile
): Promise<HairCareRecommendation> {
  // Step 1: Assess hair health and needs
  const healthScore = profile.hairAnalysis.health;
  const primaryNeeds = identifyPrimaryNeeds(profile);

  // Step 2: Build daily routine
  const dailyRoutine = buildDailyRoutine(profile, primaryNeeds);

  // Step 3: Build weekly treatments
  const weeklyRoutine = buildWeeklyRoutine(profile, primaryNeeds);

  // Step 4: Build monthly deep treatments
  const monthlyRoutine = buildMonthlyRoutine(profile, primaryNeeds);

  // Step 5: Select products based on routine + budget
  const products = await selectProducts(
    { daily: dailyRoutine, weekly: weeklyRoutine, monthly: monthlyRoutine },
    profile.lifestyle.budget,
    profile.allergies
  );

  // Step 6: Create maintenance schedule
  const schedule = createMaintenanceSchedule(profile);

  // Step 7: Generate tips based on hair type and goals
  const tips = generatePersonalizedTips(profile);

  // Step 8: Calculate expected results
  const expectedResults = calculateExpectedResults(profile, primaryNeeds);

  return {
    routineId: generateId(),
    confidence: calculateConfidence(profile),
    personalizedRoutine: {
      daily: dailyRoutine,
      weekly: weeklyRoutine,
      monthly: monthlyRoutine,
    },
    productRecommendations: products,
    maintenanceSchedule: schedule,
    tips,
    expectedResults,
  };
}

function identifyPrimaryNeeds(profile: HairCareProfile): string[] {
  const needs: string[] = [];

  // Based on health score
  if (profile.hairAnalysis.health < 50) {
    needs.push("repair", "moisture");
  } else if (profile.hairAnalysis.health < 70) {
    needs.push("maintenance", "protection");
  }

  // Based on porosity
  if (profile.hairAnalysis.porosity === "high") {
    needs.push("protein", "sealing");
  } else if (profile.hairAnalysis.porosity === "low") {
    needs.push("hydration", "penetration");
  }

  // Based on goals
  if (profile.goals.includes("growth")) {
    needs.push("scalp-care", "stimulation");
  }

  if (profile.goals.includes("moisture")) {
    needs.push("deep-conditioning", "hydration");
  }

  // Based on concerns
  if (profile.concerns.includes("breakage")) {
    needs.push("protein", "strengthening");
  }

  if (profile.concerns.includes("dryness")) {
    needs.push("moisture", "oil-treatments");
  }

  return [...new Set(needs)]; // Remove duplicates
}

function buildDailyRoutine(
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
      reasoning: `Keep your ${profile.currentStyle.name} looking fresh`,
      product: needs.includes("moisture")
        ? "Light leave-in conditioner or hair mist"
        : "Light styling cream",
    });
  }

  routine.push({
    stepNumber: 2,
    action: "Moisturize scalp",
    duration: "2-3 mins",
    frequency: "Daily",
    importance: "essential",
    reasoning: "Healthy hair starts with a healthy scalp",
    product: "Lightweight hair oil or scalp serum",
  });

  // Night routine
  routine.push({
    stepNumber: 3,
    action: "Protect hair before bed",
    duration: "5 mins",
    frequency: "Every night",
    importance: "essential",
    reasoning: "Prevents breakage and moisture loss while sleeping",
    product: "Satin/silk bonnet or pillowcase",
  });

  if (needs.includes("moisture")) {
    routine.push({
      stepNumber: 4,
      action: "Apply night oil treatment",
      duration: "3 mins",
      frequency: "Every night",
      importance: "recommended",
      reasoning: "Seals in moisture overnight for healthier hair",
      product: "Nourishing hair oil (coconut, jojoba, or argan)",
    });
  }

  return routine;
}

function buildWeeklyRoutine(
  profile: HairCareProfile,
  needs: string[]
): RoutineStep[] {
  const routine: RoutineStep[] = [];

  // Wash day
  routine.push({
    stepNumber: 1,
    action: "Cleanse scalp and hair",
    duration: "10-15 mins",
    frequency: "1-2 times per week",
    importance: "essential",
    reasoning: "Removes buildup while maintaining natural oils",
    product: needs.includes("moisture")
      ? "Sulfate-free moisturizing shampoo"
      : "Gentle cleansing shampoo",
  });

  // Deep conditioning
  routine.push({
    stepNumber: 2,
    action: "Deep condition",
    duration: "20-30 mins",
    frequency: "Once per week",
    importance: "essential",
    reasoning: `Restores moisture and strengthens ${profile.hairAnalysis.type} hair`,
    product: "Deep conditioning mask or treatment",
  });

  // Protein treatment (if needed)
  if (needs.includes("protein") || needs.includes("repair")) {
    routine.push({
      stepNumber: 3,
      action: "Protein treatment",
      duration: "15-20 mins",
      frequency: "Every 2-3 weeks",
      importance: "recommended",
      reasoning: "Rebuilds hair strength and reduces breakage",
      product: "Protein-rich hair mask or treatment",
    });
  }

  // Scalp treatment
  if (needs.includes("scalp-care") || profile.goals.includes("growth")) {
    routine.push({
      stepNumber: 4,
      action: "Scalp massage with growth oil",
      duration: "10 mins",
      frequency: "2-3 times per week",
      importance: "recommended",
      reasoning: "Stimulates blood flow for faster, healthier growth",
      product: "Growth-promoting scalp oil",
    });
  }

  return routine;
}

function buildMonthlyRoutine(
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
    reasoning: "Removes stubborn buildup for a fresh start",
    product: "Clarifying shampoo",
  });

  // Hot oil treatment
  if (needs.includes("moisture") || needs.includes("repair")) {
    routine.push({
      stepNumber: 2,
      action: "Hot oil treatment",
      duration: "30-45 mins",
      frequency: "1-2 times per month",
      importance: "recommended",
      reasoning: "Deeply penetrates hair shaft for maximum moisture",
      product: "Natural oils (coconut, olive, avocado)",
    });
  }

  // Trim (if needed)
  if (
    profile.hairAnalysis.health < 60 ||
    profile.hairAnalysis.currentDamage?.includes("split ends")
  ) {
    routine.push({
      stepNumber: 3,
      action: "Trim ends",
      duration: "30 mins",
      frequency: "Every 6-8 weeks",
      importance: "essential",
      reasoning: "Removes damaged ends to promote healthy growth",
      product: "Professional trim or DIY with sharp scissors",
    });
  }

  return routine;
}
```

#### 3.3 Product Selection with Budget Optimization

```typescript
async function selectProducts(
  routine: {
    daily: RoutineStep[];
    weekly: RoutineStep[];
    monthly: RoutineStep[];
  },
  budget: { min: number; max: number },
  allergies?: string[]
): Promise<{
  essential: ProductRecommendation[];
  optional: ProductRecommendation[];
  alternatives: ProductRecommendation[];
}> {
  // Collect all product categories needed
  const categories = new Set<string>();
  [...routine.daily, ...routine.weekly, ...routine.monthly].forEach((step) => {
    if (step.product) {
      categories.add(categorizeProduct(step.product));
    }
  });

  // Get all available products
  const allProducts = await db.products.findMany({
    where: {
      category: { in: Array.from(categories) },
      allergens: allergies ? { notIn: allergies } : undefined,
    },
  });

  // Score and rank products
  const scoredProducts = allProducts.map((product) => ({
    product,
    score: scoreProduct(product, budget),
  }));

  // Select best products within budget
  const selectedProducts = optimizeProductSelection(scoredProducts, budget);

  // Generate alternatives
  const alternatives = generateAlternatives(selectedProducts, budget);

  return {
    essential: selectedProducts.filter((p) => p.importance === "essential"),
    optional: selectedProducts.filter((p) => p.importance === "optional"),
    alternatives,
  };
}
```

---

## Feature 4: Proactive In-App Notifications

### Current State

⚠️ No notification system  
⚠️ Users must manually return

### Implementation (In-App Only)

#### 4.1 Notification System Architecture

```typescript
interface Notification {
  id: string;
  userId: string;
  type: "style_reminder" | "new_recommendation" | "booking_update";
  priority: "low" | "medium" | "high";
  title: string;
  message: string;
  actionUrl: string;
  actionText: string;
  data: {
    styleId?: string;
    bookingId?: string;
    recommendations?: string[];
  };
  isRead: boolean;
  createdAt: Date;
  expiresAt: Date;
}

interface NotificationPreferences {
  userId: string;
  enabled: boolean;
  frequency: "realtime" | "daily" | "weekly";
  quietHours: { start: string; end: string };
}
```

#### 3.2 Notification Triggers

```typescript
// Trigger 1: Style Maintenance Approaching (2 weeks before)
async function checkMaintenanceReminders() {
  const twoWeeksFromNow = addWeeks(new Date(), 2);

  const bookingsNeedingAttention = await db.bookings.findMany({
    where: {
      maintenanceEndDate: {
        gte: twoWeeksFromNow,
        lte: addDays(twoWeeksFromNow, 1),
      },
      status: "active",
      reminderSent: false,
    },
    include: { user: true },
  });

  for (const booking of bookingsNeedingAttention) {
    // Generate personalized recommendations
    const recommendations = await generateRecommendationsForUser(booking.user);

    // Create notification
    await createNotification({
      userId: booking.userId,
      type: "style_reminder",
      priority: "medium",
      title: "✨ Time for a refresh!",
      message: `Your ${booking.styleName} will need attention in ~2 weeks. We've picked 3 perfect styles for you!`,
      actionUrl: `/recommendations/${booking.id}`,
      actionText: "See Recommendations",
      data: {
        bookingId: booking.id,
        recommendations: recommendations.slice(0, 3).map((r) => r.styleId),
      },
    });

    // Mark reminder as sent
    await db.bookings.update({
      where: { id: booking.id },
      data: { reminderSent: true },
    });
  }
}

// Trigger 2: New Trending Style Match
async function checkNewStyleMatches() {
  const users = await db.users.findMany({
    include: { profile: true, bookings: true },
  });

  const newTrendingStyles = await db.styles.findMany({
    where: {
      isTrending: true,
      addedAt: { gte: subDays(new Date(), 7) }, // Added this week
    },
  });

  for (const user of users) {
    for (const style of newTrendingStyles) {
      const score = scoreStyle(style, {
        hairAnalysis: user.profile.hairAnalysis,
        userProfile: user.profile,
        bookingHistory: user.bookings,
        contextual: { trending: true, season: getCurrentSeason() },
      });

      // If high score and not notified yet, create notification
      if (score.score > 70 && !hasSeenStyle(user.id, style.id)) {
        await createNotification({
          userId: user.id,
          type: "new_recommendation",
          priority: "low",
          title: `🔥 New style perfect for you!`,
          message: `${style.name} is trending and matches your ${user.profile.hairType} hair. Score: ${score.score}/100`,
          actionUrl: `/styles/${style.id}`,
          actionText: "View Style",
          data: { styleId: style.id },
        });
      }
    }
  }
}
```

#### 3.3 In-App Notification UI

```typescript
// Notification Bell Component
export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    loadNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(loadNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadNotifications = async () => {
    const data = await fetch("/api/notifications").then((r) => r.json());
    setNotifications(data);
    setUnreadCount(data.filter((n) => !n.isRead).length);
  };

  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="relative">
        <Bell size={24} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
            {unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <NotificationPanel
          notifications={notifications}
          onClose={() => setIsOpen(false)}
          onMarkRead={handleMarkRead}
        />
      )}
    </div>
  );
}
```

---

## Feature 5: Complete E2E API Flow

### Service API Endpoints

```typescript
// 1. Analyze Hair Photo
POST /api/v1/analyze-hair
Request: {
  image: string; // base64
  userId: string;
}
Response: {
  hairAnalysis: {
    type: string;
    health: number;
    texture: string;
    density: string;
    porosity: string;
    detectedStyle: string;
    confidence: number;
  };
  sessionId: string;
}

// 2. Get Style Recommendations
POST /api/v1/recommend-styles
Request: {
  sessionId: string;
  userId: string;
  preferences?: {
    budget?: { min: number; max: number };
    timeAvailable?: number;
    occasion?: string;
  };
}
Response: {
  recommendations: StyleRecommendation[];
  totalCount: number;
  confidence: number;
}

// 3. Get Product List for Style
POST /api/v1/generate-products
Request: {
  styleId: string;
  userId: string;
  budget?: { min: number; max: number };
  qualityPreference?: 'budget' | 'mid-range' | 'premium';
}
Response: {
  productList: ProductList;
  estimatedTotal: number;
  alternatives: ProductList[];
}

// 4. Get Hair Care Recommendations
POST /api/v1/hair-care-routine
Request: {
  userId: string;
  hairAnalysis: {
    type: string;
    health: number;
    texture: string;
    density: string;
    porosity: string;
  };
  currentStyle?: {
    name: string;
    installedDate: string;
  };
  goals: string[]; // ['growth', 'moisture', 'strength']
  concerns: string[]; // ['breakage', 'dryness', 'thinning']
  lifestyle: {
    activity: string;
    climate: string;
    budget: { min: number; max: number };
  };
  allergies?: string[];
}
Response: {
  routineId: string;
  confidence: number;
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
    nextTrim: string;
    nextDeepCondition: string;
    nextProteinTreatment: string;
    styleRefresh: string;
  };
  tips: {
    dos: string[];
    donts: string[];
    proTips: string[];
  };
  expectedResults: {
    timeline: string;
    improvements: string[];
    metrics: {
      healthImprovement: number;
      moistureLevel: string;
      strengthLevel: string;
    };
  };
}

// 5. Create Booking
POST /api/v1/create-booking
Request: {
  userId: string;
  styleId: string;
  productListId: string;
  preferredDate: string;
  preferredTime: string;
  budget: number;
}
Response: {
  bookingId: string;
  status: string;
  matchedStylists: Stylist[];
  estimatedCost: number;
  maintenanceEndDate: string;
}

// 6. Get Booking Reminders
GET /api/v1/booking-reminders/:userId
Response: {
  upcomingReminders: Array<{
    bookingId: string;
    styleName: string;
    maintenanceEndDate: string;
    daysUntilMaintenance: number;
    recommendations: StyleRecommendation[];
  }>;
}

// 7. Get User Hair Profile
GET /api/v1/user-profile/:userId
Response: {
  profile: {
    hairAnalysis: HairAnalysis;
    bookingHistory: Booking[];
    currentRoutine: HairCareRecommendation;
    preferences: UserPreferences;
  };
}
```

---

## Implementation Roadmap

### Phase 1: Core AI Features (Weeks 1-2)

- [ ] Enhance recommendation scoring algorithm with 6 factors
- [ ] Add confidence scoring to recommendations
- [ ] Implement reasoning/explanation generation
- [ ] Build dynamic product quantity calculator
- [ ] Create budget-aware product selection

### Phase 2: Product Intelligence (Weeks 3-4)

- [ ] Build product database with brand options
- [ ] Implement alternative product suggestions
- [ ] Create shopping list generator
- [ ] Add product swapping for budget optimization
- [ ] Build product explanation AI

### Phase 3: Hair Care Recommendations (Weeks 5-6)

- [ ] Build hair care profile data models
- [ ] Implement routine generation algorithm (daily/weekly/monthly)
- [ ] Create needs assessment logic (repair, moisture, growth, etc.)
- [ ] Build product selection for routines
- [ ] Generate maintenance schedules
- [ ] Create personalized tips generator
- [ ] Build expected results calculator

### Phase 4: In-App Notifications (Weeks 7-8)

- [ ] Create notification data models and DB tables
- [ ] Build notification trigger system (cron jobs)
- [ ] Implement notification bell UI component
- [ ] Create notification panel with actions
- [ ] Add notification preferences
- [ ] Build hair care reminder system

### Phase 5: API Service Layer (Weeks 9-10)

- [ ] Design RESTful API structure
- [ ] Implement authentication (API keys)
- [ ] Create rate limiting and quotas
- [ ] Build comprehensive API documentation
- [ ] Add webhooks for booking updates
- [ ] Create SDK for easy integration

### Phase 6: Integration & Testing (Weeks 11-12)

- [ ] E2E testing of full flow
- [ ] API integration testing
- [ ] Performance optimization
- [ ] Security audit
- [ ] Documentation and tutorials
- [ ] Beta testing with partner salons

---

## Monetization Strategy

### B2B API Service Tiers

**Starter** - KES 50,000/month

- 1,000 API calls/month
- Basic recommendations
- Standard product suggestions
- Email support

**Professional** - KES 150,000/month

- 10,000 API calls/month
- Advanced AI recommendations
- Personalized product lists
- Priority support
- Webhooks

**Enterprise** - Custom pricing

- Unlimited API calls
- White-label solution
- Custom ML model training
- Dedicated support
- SLA guarantee

---

## Success Metrics

### Technical KPIs

- API response time < 500ms
- Recommendation accuracy > 85%
- Product suggestion relevance > 90%
- System uptime > 99.9%

### Business KPIs

- Booking conversion rate > 40%
- Rebooking rate > 60%
- Customer satisfaction > 4.5/5
- API adoption rate (clients) > 20/quarter

---

## Conclusion

This positions Nywele AI as a **comprehensive AI booking service** that:

- ✅ Provides intelligent, explainable style recommendations
- ✅ Generates personalized product suggestions
- ✅ Creates customized hair care routines (daily/weekly/monthly)
- ✅ Offers maintenance schedules and expected results tracking
- ✅ Drives proactive engagement through in-app notifications
- ✅ Offers a complete E2E booking experience
- ✅ Scales as a B2B service API

The combination of AI-powered recommendations, smart product intelligence, and **personalized hair care routines** creates a **unique, marketable asset** that differentiates from competitors by providing ongoing value beyond just booking.
