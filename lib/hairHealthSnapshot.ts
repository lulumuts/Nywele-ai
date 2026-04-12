/**
 * Build and merge “how healthy is your hair” scan results into UserProfile for dashboard + profile UI.
 */

import type {
  HairHealthSnapshot,
  HairLength,
  HairPorosity,
  HairDensity,
  HairType,
  UserProfile,
} from '@/types/userProfile';

function clampScore(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

function visionHealthScore(hairAnalysis: Record<string, unknown>): number {
  const health = hairAnalysis.health as { healthScore?: number; score?: number } | undefined;
  const direct =
    typeof health?.healthScore === 'number'
      ? health.healthScore
      : typeof health?.score === 'number'
        ? health.score
        : undefined;
  const oq = hairAnalysis.overallQuality;
  if (typeof oq === 'number') return clampScore(oq);
  if (typeof direct === 'number') return clampScore(direct);
  return 60;
}

function mapGeminiPorosity(p: string | undefined): HairPorosity | '' {
  if (!p) return '';
  const x = p.toLowerCase();
  if (x === 'low') return 'low';
  if (x === 'medium') return 'normal';
  if (x === 'high') return 'high';
  return '';
}

function mapGeminiDensity(d: string | undefined): HairDensity | '' {
  if (!d) return '';
  const x = d.toLowerCase();
  if (x === 'low' || x === 'medium' || x === 'high') return x;
  return '';
}

function mapGeminiLength(len: string | undefined): HairLength | '' {
  if (!len) return '';
  const u = len.toLowerCase();
  if (u.includes('twa') || u === 'short') return 'short';
  if (u.includes('shoulder') || u.includes('apl')) return 'medium';
  if (u.includes('bsl') || u.includes('long')) return 'long';
  if (u.includes('medium')) return 'medium';
  return '';
}

function hairTypeFromStrings(visionType: unknown, curlPatternType: unknown): HairType | undefined {
  const candidates = [visionType, curlPatternType].filter(Boolean).map((s) => String(s).toLowerCase());
  for (const c of candidates) {
    const m = c.match(/\b(4[abc])\b/);
    if (m) return m[1] as HairType;
  }
  return undefined;
}

export function buildHairHealthSnapshot(
  hairAnalysis: Record<string, unknown> | null | undefined,
  geminiHealth: Record<string, unknown> | null | undefined,
  referenceImageDataUrl?: string | null,
): HairHealthSnapshot {
  const ha = hairAnalysis && typeof hairAnalysis === 'object' ? hairAnalysis : {};
  const gh = geminiHealth && typeof geminiHealth === 'object' ? geminiHealth : {};

  const visionScore = visionHealthScore(ha);
  const geminiScore =
    typeof gh.healthScore === 'number' ? clampScore(gh.healthScore as number) : undefined;

  const healthScore = geminiScore ?? visionScore;

  const curl = gh.curlPattern as { type?: string } | undefined;
  const damage = ha.damage as { severity?: string } | undefined;

  return {
    analyzedAt: new Date().toISOString(),
    healthScore,
    visionHealthScore: visionScore,
    geminiHealthScore: geminiScore,
    overallQuality: typeof ha.overallQuality === 'number' ? clampScore(ha.overallQuality as number) : undefined,
    damageSeverity: damage?.severity,
    hairTypeDetected: (() => {
      const ht = ha.hairType as { hairType?: string } | string | undefined;
      if (typeof ht === 'object' && ht?.hairType) return String(ht.hairType);
      if (typeof ht === 'string') return ht;
      return curl?.type;
    })(),
    curlPattern: curl?.type,
    porosity: typeof gh.porosity === 'string' ? gh.porosity : undefined,
    density: typeof gh.density === 'string' ? gh.density : undefined,
    strandThickness: typeof gh.strandThickness === 'string' ? gh.strandThickness : undefined,
    length: typeof gh.length === 'string' ? gh.length : undefined,
    moistureLevel: typeof gh.moistureLevel === 'string' ? gh.moistureLevel : undefined,
    scalpHealth: typeof gh.scalpHealth === 'string' ? gh.scalpHealth : undefined,
    ...(referenceImageDataUrl &&
    typeof referenceImageDataUrl === 'string' &&
    referenceImageDataUrl.length > 0
      ? { referenceImageDataUrl }
      : {}),
  };
}

/**
 * Writes latest scan snapshot and maps detectable fields onto profile (porosity, density, length, hair type).
 */
export function mergeScanIntoProfile(
  profile: UserProfile,
  hairAnalysis: Record<string, unknown> | null | undefined,
  geminiHealth: Record<string, unknown> | null | undefined,
  referenceImageDataUrl?: string | null,
): UserProfile {
  const snapshot = buildHairHealthSnapshot(hairAnalysis, geminiHealth, referenceImageDataUrl);
  const gh = geminiHealth && typeof geminiHealth === 'object' ? geminiHealth : {};
  const ha = hairAnalysis && typeof hairAnalysis === 'object' ? hairAnalysis : {};

  const ht = ha.hairType as { hairType?: string } | string | undefined;
  const visionHairStr = typeof ht === 'object' && ht?.hairType ? ht.hairType : typeof ht === 'string' ? ht : undefined;
  const curlType = (gh.curlPattern as { type?: string } | undefined)?.type;

  const mappedType = hairTypeFromStrings(visionHairStr, curlType);
  const mappedPorosity = mapGeminiPorosity(typeof gh.porosity === 'string' ? gh.porosity : undefined);
  const mappedDensity = mapGeminiDensity(typeof gh.density === 'string' ? gh.density : undefined);
  const mappedLength = mapGeminiLength(typeof gh.length === 'string' ? gh.length : undefined);

  return {
    ...profile,
    hairHealthSnapshot: snapshot,
    ...(mappedType ? { hairType: mappedType } : {}),
    ...(mappedPorosity ? { hairPorosity: mappedPorosity } : {}),
    ...(mappedDensity ? { hairDensity: mappedDensity } : {}),
    ...(mappedLength ? { hairLength: mappedLength } : {}),
  };
}
