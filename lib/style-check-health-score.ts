import { getLatestHairHealthScore } from '@/lib/analyticsTransform';
import { normalizeUserProfile } from '@/types/userProfile';

/**
 * Same underlying 0–100 value as Dashboard → Metrics → “Health score” (latest Hair care scan).
 * Style Check shows it as a compatibility percentage in the UI.
 * Returns null when there is no profile or no `hairHealthSnapshot.healthScore`.
 */
export function readHairHealthScoreFromLocalProfile(): number | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('nywele-user-profile');
    if (!raw) return null;
    const profile = normalizeUserProfile(JSON.parse(raw));
    return getLatestHairHealthScore(profile);
  } catch {
    return null;
  }
}
