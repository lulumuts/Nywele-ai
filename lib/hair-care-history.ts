import type { HairCareScanRecord, UserProfile } from '@/types/userProfile';

const MAX_HISTORY = 30;

/** Insert or replace by id; list sorted newest first. */
export function upsertHairCareScanRecord(profile: UserProfile, record: HairCareScanRecord): UserProfile {
  const list = [...(profile.hairCareHistory ?? [])];
  const i = list.findIndex((r) => r.id === record.id);
  if (i >= 0) {
    list[i] = { ...record, scannedAt: list[i].scannedAt };
  } else list.unshift(record);
  list.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  return { ...profile, hairCareHistory: list.slice(0, MAX_HISTORY) };
}

export function findHairCareScanRecord(profile: UserProfile | null | undefined, id: string): HairCareScanRecord | undefined {
  return profile?.hairCareHistory?.find((r) => r.id === id);
}

/** Newest scan that includes a generated routine (for dashboard routine tab). */
export function getLatestScanWithRoutine(profile: UserProfile | null | undefined): HairCareScanRecord | undefined {
  const h = profile?.hairCareHistory ?? [];
  for (const r of h) {
    if (r.recommendation != null && typeof r.recommendation === 'object') return r;
  }
  return undefined;
}
