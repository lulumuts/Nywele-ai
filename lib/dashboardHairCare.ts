import type { HairCareRecommendation, RoutineStep } from '@/lib/hairCare';
import { parseHairCareRecommendation } from '@/lib/hair-care-session';
import type { ExplorerCarouselProduct } from '@/lib/productExplorerCatalog';
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

function stepToCard(s: RoutineStep, i: number): DashboardRoutineCard {
  return {
    id: `step-${s.stepNumber}-${i}`,
    title: s.action,
    schedule: s.frequency,
    tag: s.importance,
    duration: s.duration || '—',
    why: s.reasoning,
  };
}

export function routineCardsFromRecommendation(rec: HairCareRecommendation | null): DashboardRoutineCard[] {
  if (!rec?.personalizedRoutine?.daily?.length) return [];
  return rec.personalizedRoutine.daily.slice(0, 8).map(stepToCard);
}

export function productsFromHairCareRecommendation(rec: HairCareRecommendation | null): ExplorerCarouselProduct[] {
  const essential = rec?.productRecommendations?.essential;
  if (!Array.isArray(essential) || essential.length === 0) return [];
  return essential.slice(0, 6).map((p) => ({
    brand: p.brand,
    name: p.name,
    purpose: p.purpose || p.aiInsight || '',
    imageUrl: null,
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
