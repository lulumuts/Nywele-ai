import type { HairCareRecommendation, RoutineStep } from '@/lib/hairCare';
import { parseHairCareRecommendation } from '@/lib/hair-care-session';
import type { ExplorerCarouselProduct } from '@/lib/productExplorerCatalog';
import { getProductImageUrl } from '@/lib/product-image';
import { getLatestScanWithRoutine } from '@/lib/hair-care-history';
import type { HairCareScanRecord, UserProfile } from '@/types/userProfile';

export type DashboardRoutineCard = {
  id: string;
  title: string;
  schedule: string;
  tag: string;
  duration: string;
  why: string;
};

const ROUTINE_DAILY_CARD_CAP = 8;
const ROUTINE_WEEKLY_CARD_CAP = 6;
const ROUTINE_MONTHLY_CARD_CAP = 4;

function stepToCard(s: RoutineStep, i: number, cadence: 'daily' | 'weekly' | 'monthly'): DashboardRoutineCard {
  return {
    id: `step-${cadence}-${s.stepNumber}-${i}`,
    title: s.action,
    schedule: s.frequency,
    tag: cadence,
    duration: s.duration || '—',
    why: s.reasoning,
  };
}

/** Routine step cards in fixed order: daily, then weekly, then monthly. */
export function routineCardsFromRecommendation(rec: HairCareRecommendation | null): DashboardRoutineCard[] {
  const pr = rec?.personalizedRoutine;
  if (!pr) return [];
  const daily = Array.isArray(pr.daily) ? pr.daily : [];
  const weekly = Array.isArray(pr.weekly) ? pr.weekly : [];
  const monthly = Array.isArray(pr.monthly) ? pr.monthly : [];
  if (daily.length === 0 && weekly.length === 0 && monthly.length === 0) return [];
  return [
    ...daily.slice(0, ROUTINE_DAILY_CARD_CAP).map((s, i) => stepToCard(s, i, 'daily')),
    ...weekly.slice(0, ROUTINE_WEEKLY_CARD_CAP).map((s, i) => stepToCard(s, i, 'weekly')),
    ...monthly.slice(0, ROUTINE_MONTHLY_CARD_CAP).map((s, i) => stepToCard(s, i, 'monthly')),
  ];
}

export type DashboardMaintenanceItem = {
  id: string;
  label: string;
  date: Date;
};

/** Upcoming maintenance milestones from the scan recommendation, soonest first. */
export function maintenanceItemsFromRecommendation(rec: HairCareRecommendation | null): DashboardMaintenanceItem[] {
  if (!rec?.maintenanceSchedule) return [];
  const ms = rec.maintenanceSchedule;
  const rows: DashboardMaintenanceItem[] = [];
  const push = (id: string, label: string, d: Date | undefined) => {
    if (!d || Number.isNaN(d.getTime())) return;
    rows.push({ id, label, date: d });
  };
  push('trim', 'Next trim', ms.nextTrim);
  push('deep', 'Next deep condition', ms.nextDeepCondition);
  push('protein', 'Next protein treatment', ms.nextProteinTreatment);
  if (ms.styleRefresh != null) push('style', 'Style refresh', ms.styleRefresh);
  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows;
}

export function productsFromHairCareRecommendation(rec: HairCareRecommendation | null): ExplorerCarouselProduct[] {
  const essential = rec?.productRecommendations?.essential;
  if (!Array.isArray(essential) || essential.length === 0) return [];
  return essential.slice(0, 6).map((p) => ({
    brand: p.brand,
    name: p.name,
    purpose: p.purpose || p.aiInsight || '',
    imageUrl: getProductImageUrl(p as unknown as Record<string, unknown>),
    pricing: p.pricing
      ? { currency: p.pricing.currency, amount: p.pricing.amount }
      : undefined,
  }));
}

export function getDashboardHairCareContext(profile: UserProfile | null): {
  scan: HairCareScanRecord | undefined;
  recommendation: HairCareRecommendation | null;
  scannedAtLabel: string | null;
} {
  const scan = getLatestScanWithRoutine(profile);
  if (!scan?.recommendation) {
    return { scan: undefined, recommendation: null, scannedAtLabel: null };
  }
  const recommendation =
    parseHairCareRecommendation(scan.recommendation) ?? (scan.recommendation as HairCareRecommendation | null);
  if (!recommendation?.personalizedRoutine) {
    return { scan: undefined, recommendation: null, scannedAtLabel: null };
  }
  const scannedAtLabel = new Date(scan.scannedAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  return { scan, recommendation, scannedAtLabel };
}
