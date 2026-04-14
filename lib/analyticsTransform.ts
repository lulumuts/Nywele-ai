/**
 * Analytics data transformation for hair care dashboard charts.
 * Extracts chartable metrics from saved routines and user profile.
 */

import type { UserProfile, SavedRoutine } from '@/types/userProfile';
import { getLatestScanWithRoutine } from '@/lib/hair-care-history';
import { parseHairCareRecommendation } from '@/lib/hair-care-session';

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

function productAmountFromUnknown(p: unknown): number {
  if (!p || typeof p !== 'object') return 0;
  const pr = (p as { pricing?: Record<string, unknown> }).pricing;
  if (!pr || typeof pr !== 'object') return 0;
  const amount = Number(pr.amount);
  if (Number.isFinite(amount) && amount > 0) return amount;
  const ep = Number((pr as { estimatedPrice?: unknown }).estimatedPrice);
  if (Number.isFinite(ep) && ep > 0) return ep;
  const rng = (pr as { priceRange?: { min?: unknown } }).priceRange;
  const mn = Number(rng?.min);
  if (Number.isFinite(mn) && mn > 0) return mn;
  return 0;
}

function productLabelFromUnknown(p: unknown): string {
  if (!p || typeof p !== 'object') return 'Product';
  const o = p as { name?: unknown; brand?: unknown };
  const name = typeof o.name === 'string' && o.name.trim() ? o.name.trim() : 'Product';
  const brand = typeof o.brand === 'string' && o.brand.trim() ? o.brand.trim() : '';
  return brand ? `${brand} · ${name}` : name;
}

/** Up to three picks from latest Hair care scan, else saved routines (deduped). */
function collectTopThreeProducts(profile: UserProfile | null): { labels: string[]; values: number[] } | null {
  const scan = profile ? getLatestScanWithRoutine(profile) : undefined;
  if (scan?.recommendation) {
    const rec = parseHairCareRecommendation(scan.recommendation);
    const essential = rec?.productRecommendations?.essential;
    if (Array.isArray(essential) && essential.length > 0) {
      const picked = essential.slice(0, 3);
      return {
        labels: picked.map(productLabelFromUnknown),
        values: picked.map(productAmountFromUnknown),
      };
    }
  }

  const routines = profile?.savedRoutines ?? [];
  const seen = new Set<string>();
  const out: { label: string; value: number }[] = [];
  for (const r of routines) {
    const pr = r.routine?.productRecommendations;
    if (!pr) continue;
    const list = [...(pr.essential ?? []), ...(pr.optional ?? [])];
    for (const raw of list) {
      const label = productLabelFromUnknown(raw);
      const key = label.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      out.push({ label, value: productAmountFromUnknown(raw) });
      if (out.length >= 3) {
        return { labels: out.map((x) => x.label), values: out.map((x) => x.value) };
      }
    }
  }
  if (out.length === 0) return null;
  return { labels: out.map((x) => x.label), values: out.map((x) => x.value) };
}

/**
 * Donut data for “Your Best Products”: up to three recommended products and share of spend (or equal split if no prices).
 */
export function getProductSpendData(profile: UserProfile | null): {
  labels: string[];
  values: number[];
  total: number;
} {
  if (typeof window === 'undefined') {
    return { labels: [], values: [], total: 0 };
  }

  const trio = collectTopThreeProducts(profile);
  if (trio && trio.labels.length > 0) {
    const moneyTotal = trio.values.reduce((a, b) => a + b, 0);
    let values = trio.values;
    if (moneyTotal <= 0) {
      const n = trio.labels.length;
      const base = Math.floor(100 / n);
      const rem = 100 - base * n;
      values = trio.labels.map((_, i) => (i < n ? base + (i < rem ? 1 : 0) : 0));
    }
    return {
      labels: trio.labels,
      values,
      total: moneyTotal,
    };
  }

  return {
    labels: ['Hydrating cleanser', 'Leave-in conditioner', 'Sealant oil'],
    values: [704, 533, 367],
    total: 1604,
  };
}
