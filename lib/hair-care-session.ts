/**
 * Persist hair-care scan + routine in localStorage so users can return to results and reference photo.
 */

import type { HairCareRecommendation } from '@/lib/hairCare';

export const HAIR_CARE_SESSION_KEY = 'nywele-hair-care-session';
export const HAIR_CARE_SESSION_VERSION = 1;

export interface HairCareSessionPayload {
  version: number;
  hairImageDataUrl: string | null;
  hairAnalysis: Record<string, unknown> | null;
  geminiHealth: Record<string, unknown> | null;
  recommendation: unknown | null;
  currentStep: number;
  savedAt: string;
}

/** Rehydrate dates on maintenanceSchedule after JSON.parse. */
export function parseHairCareRecommendation(raw: unknown): HairCareRecommendation | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown> & { maintenanceSchedule?: Record<string, unknown> };
  const base = { ...(r as unknown as HairCareRecommendation) };
  const ms = r.maintenanceSchedule;
  if (!ms || typeof ms !== 'object') {
    return base;
  }
  const d = (v: unknown) => (v != null ? new Date(v as string) : new Date());
  return {
    ...base,
    maintenanceSchedule: {
      nextTrim: d(ms.nextTrim),
      nextDeepCondition: d(ms.nextDeepCondition),
      nextProteinTreatment: d(ms.nextProteinTreatment),
      styleRefresh: ms.styleRefresh != null ? d(ms.styleRefresh) : undefined,
    },
  };
}

export function loadHairCareSession(): HairCareSessionPayload | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(HAIR_CARE_SESSION_KEY);
  if (!raw) return null;
  try {
    const p = JSON.parse(raw) as HairCareSessionPayload;
    if (p.version !== HAIR_CARE_SESSION_VERSION) return null;
    if (!p.hairAnalysis || typeof p.hairAnalysis !== 'object' || Object.keys(p.hairAnalysis).length === 0) {
      return null;
    }
    return p;
  } catch {
    return null;
  }
}

export function saveHairCareSession(data: {
  hairImageDataUrl: string | null;
  hairAnalysis: unknown;
  geminiHealth: unknown | null;
  recommendation: unknown | null;
  currentStep: number;
}): void {
  if (typeof window === 'undefined') return;
  const noAnalysis =
    !data.hairAnalysis ||
    (typeof data.hairAnalysis === 'object' && Object.keys(data.hairAnalysis as object).length === 0);
  if (noAnalysis) return;

  const buildPayload = (img: string | null): HairCareSessionPayload => ({
    version: HAIR_CARE_SESSION_VERSION,
    hairImageDataUrl: img,
    hairAnalysis: data.hairAnalysis as Record<string, unknown>,
    geminiHealth: (data.geminiHealth as Record<string, unknown> | null) ?? null,
    recommendation: data.recommendation,
    currentStep: data.currentStep,
    savedAt: new Date().toISOString(),
  });

  try {
    localStorage.setItem(HAIR_CARE_SESSION_KEY, JSON.stringify(buildPayload(data.hairImageDataUrl)));
  } catch {
    try {
      localStorage.setItem(HAIR_CARE_SESSION_KEY, JSON.stringify(buildPayload(null)));
    } catch {
      console.warn('hair-care: could not persist session');
    }
  }
}

export function clearHairCareSession(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(HAIR_CARE_SESSION_KEY);
  } catch {
    /* ignore */
  }
}
