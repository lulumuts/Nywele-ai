/**
 * Analytics data transformation for hair care dashboard charts.
 * Extracts chartable metrics from saved routines and user profile.
 */

import type { UserProfile, SavedRoutine } from '@/types/userProfile';

export type DamageSeverity = 'none' | 'mild' | 'moderate' | 'severe';

/**
 * Convert damage severity to a numeric score (0-100) for charting.
 * none=100, mild=70, moderate=40, severe=10
 */
export function severityToNumber(severity: string | undefined): number {
  const map: Record<string, number> = {
    none: 100,
    mild: 70,
    moderate: 40,
    severe: 10,
  };
  return map[severity?.toLowerCase() || 'none'] ?? 50;
}

/**
 * Extract health score from a saved routine's hairAnalysis.
 */
function getHealthScoreFromRoutine(routine: SavedRoutine): number {
  const h = routine.hairAnalysis?.health;
  const direct = routine.hairAnalysis?.healthScore;
  return direct ?? h?.healthScore ?? h?.score ?? 60;
}

/** Latest scan score from profile snapshot (same flow as hair-care “how healthy is your hair”). */
export function getLatestHairHealthScore(profile: UserProfile | null): number | null {
  const s = profile?.hairHealthSnapshot;
  if (!s || typeof s.healthScore !== 'number') return null;
  return Math.max(0, Math.min(100, s.healthScore));
}

/**
 * Get health trend data for line chart: dates and scores from saved routines.
 */
export function getHealthTrendData(profile: UserProfile | null): {
  dates: string[];
  scores: number[];
} {
  const routines = profile?.savedRoutines ?? [];
  const snap = profile?.hairHealthSnapshot;

  type Point = { t: number; label: string; score: number };
  const points: Point[] = [];

  for (const r of routines) {
    points.push({
      t: new Date(r.createdAt).getTime(),
      label: new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      score: getHealthScoreFromRoutine(r),
    });
  }

  if (snap?.analyzedAt && typeof snap.healthScore === 'number') {
    const t = new Date(snap.analyzedAt).getTime();
    const label = new Date(snap.analyzedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    points.push({
      t,
      label,
      score: Math.max(0, Math.min(100, snap.healthScore)),
    });
  }

  const history = profile?.hairCareHistory ?? [];
  for (const h of history) {
    const ha = h.hairAnalysis as { health?: { healthScore?: number; score?: number }; overallQuality?: number } | undefined;
    if (!ha || typeof ha !== 'object') continue;
    const health = ha.health?.healthScore ?? ha.health?.score ?? ha.overallQuality;
    if (typeof health !== 'number') continue;
    const t = new Date(h.scannedAt).getTime();
    const label = new Date(h.scannedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    points.push({
      t,
      label,
      score: Math.max(0, Math.min(100, Math.round(health))),
    });
  }

  if (points.length === 0) {
    return { dates: [], scores: [] };
  }

  points.sort((a, b) => a.t - b.t);

  const byDay = new Map<string, Point>();
  for (const p of points) {
    const day = new Date(p.t).toISOString().slice(0, 10);
    const prev = byDay.get(day);
    if (!prev || p.t >= prev.t) byDay.set(day, p);
  }
  const merged = [...byDay.values()].sort((a, b) => a.t - b.t);

  return {
    dates: merged.map((p) => p.label),
    scores: merged.map((p) => p.score),
  };
}

/**
 * Map user goals to trackable metrics from saved routines.
 */
export function getGoalProgressData(profile: UserProfile | null): {
  labels: string[];
  values: number[];
} {
  const routines = profile?.savedRoutines ?? [];
  const goals = profile?.hairGoals ?? [];

  if (goals.length === 0) {
    return { labels: [], values: [] };
  }

  const values = goals.map((goal) => {
    if (routines.length === 0 && !profile?.hairHealthSnapshot) return 0;

    const scores = routines.map((r) => {
      const health = getHealthScoreFromRoutine(r);
      const damage = severityToNumber(r.hairAnalysis?.damage?.severity);
      const quality = r.hairAnalysis?.overallQuality ?? health;

      switch (goal.toLowerCase()) {
        case 'length retention':
        case 'thickness\ndensity':
        case 'thickness/density':
          return health;
        case 'moisture':
          return (health + damage) / 2;
        case 'curl definition':
          return quality;
        case 'scalp health':
        case 'reduce breakage':
        case 'colour-treated care':
        case 'heat damage repair':
          return damage;
        default:
          return health;
      }
    });

    if (scores.length === 0) {
      const snap = profile?.hairHealthSnapshot;
      if (!snap) return 0;
      const health = snap.healthScore;
      const damage = severityToNumber(snap.damageSeverity);
      const quality = snap.overallQuality ?? health;
      switch (goal.toLowerCase()) {
        case 'length retention':
        case 'thickness\ndensity':
        case 'thickness/density':
          return health;
        case 'moisture':
          return (health + damage) / 2;
        case 'curl definition':
          return quality;
        case 'scalp health':
        case 'reduce breakage':
        case 'colour-treated care':
        case 'heat damage repair':
          return damage;
        default:
          return health;
      }
    }

    return scores.reduce((a, b) => a + b, 0) / scores.length;
  });

  return {
    labels: goals.map((g) => g.replace('\n', ' / ')),
    values,
  };
}

const PRODUCT_CATEGORIES = ['Products', 'Salon Visits', 'Tools & Equipment', 'Maintenance'];

/**
 * Get product spend data for donut chart.
 * Uses cost-tracker localStorage (nywele-expenses) when available,
 * otherwise derives from routine product recommendations or mock data.
 */
export function getProductSpendData(profile: UserProfile | null): {
  labels: string[];
  values: number[];
  total: number;
} {
  if (typeof window === 'undefined') {
    return {
      labels: PRODUCT_CATEGORIES,
      values: [0, 0, 0, 0],
      total: 0,
    };
  }

  const stored = localStorage.getItem('nywele-expenses');
  if (stored) {
    try {
      const expenses: { date?: string; category?: string; amount?: number }[] = JSON.parse(stored);
      const currentMonth = new Date().toISOString().slice(0, 7);
      const monthExpenses = expenses.filter(
        (e) => (e.date || '').toString().slice(0, 7) === currentMonth
      );

      const categoryMap: Record<string, number> = {
        product: 0,
        salon: 0,
        tools: 0,
        maintenance: 0,
      };

      for (const e of monthExpenses) {
        const cat = (e.category || 'product').toLowerCase();
        if (cat in categoryMap) {
          categoryMap[cat] += Number(e.amount) || 0;
        }
      }

      const values = [
        categoryMap.product,
        categoryMap.salon,
        categoryMap.tools,
        categoryMap.maintenance,
      ];
      const total = values.reduce((a, b) => a + b, 0);

      return {
        labels: PRODUCT_CATEGORIES,
        values,
        total,
      };
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: derive from routine product recommendations
  const routines = profile?.savedRoutines ?? [];
  let productTotal = 0;
  for (const r of routines) {
    const essential = r.routine?.productRecommendations?.essential ?? [];
    const optional = r.routine?.productRecommendations?.optional ?? [];
    for (const p of [...essential, ...optional]) {
      const amt = p.pricing?.amount ?? p.pricing?.estimatedPrice ?? p.pricing?.priceRange?.min ?? 0;
      productTotal += Number(amt) || 0;
    }
  }

  if (productTotal > 0) {
    return {
      labels: ['Products', 'Salon Visits', 'Tools & Equipment', 'Maintenance'],
      values: [productTotal, 0, 0, 0],
      total: productTotal,
    };
  }

  // Mock fallback for empty state (matches dashboard design)
  return {
    labels: PRODUCT_CATEGORIES,
    values: [704, 533, 367, 0],
    total: 1604,
  };
}
