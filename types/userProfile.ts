export type HairType = '4a' | '4b' | '4c';

export type HairPorosity = 'low' | 'normal' | 'high';
export type HairLength = 'short' | 'medium' | 'long';
export type HairDensity = 'low' | 'medium' | 'high';
export type StrandThickness = 'fine' | 'medium' | 'coarse';
export type Elasticity = 'low' | 'balanced' | 'high';
export type ScalpCondition = 'balanced' | 'dry' | 'oily' | 'flaky' | 'sensitive';
export type ProtectiveStyleFrequency = 'rare' | 'occasional' | 'regular' | 'continuous';
export type ActivityLevel = 'low' | 'moderate' | 'high';
export type WaterExposure = 'minimal' | 'hard-water' | 'swimmer' | 'frequent-chlorine';
export type BudgetLevel = 'low' | 'medium' | 'high';
export type ClimateProfile = 'dry' | 'humid' | 'temperate';

export interface SavedRoutine {
  id: string;
  createdAt: string;
  hairAnalysis: any;
  routine: any;
  notes?: string;
  /** Data URL of the photo used for this scan (when saved from Hair care). */
  referenceImageDataUrl?: string;
}

export interface LastBooking {
  style: string;
  date: string;
  stylist: string;
}

/** One hair-care session: Vision analysis, optional Gemini, optional generated routine (local history). */
export interface HairCareScanRecord {
  id: string;
  scannedAt: string;
  hairAnalysis: Record<string, unknown>;
  geminiHealth: Record<string, unknown> | null;
  recommendation: unknown | null;
  referenceImageDataUrl?: string;
}

/** Latest “how healthy is your hair” scan (Vision + optional AI enrichment), persisted for dashboard/profile */
export interface HairHealthSnapshot {
  analyzedAt: string;
  /** Primary score shown in UI (prefers AI health score when present) */
  healthScore: number;
  visionHealthScore?: number;
  geminiHealthScore?: number;
  overallQuality?: number;
  damageSeverity?: string;
  hairTypeDetected?: string;
  curlPattern?: string;
  porosity?: string;
  density?: string;
  strandThickness?: string;
  length?: string;
  moistureLevel?: string;
  scalpHealth?: string;
  /** Data URL or URL of the photo used for this scan (when available). */
  referenceImageDataUrl?: string;
}

export interface UserProfile {
  profileVersion: number;
  name: string;
  email: string;
  /** Optional; captured in onboarding profile flow */
  age?: number;
  /** Country / region label, e.g. Kenya */
  location?: string;
  phone?: string;
  hairType: HairType;
  hairGoals: string[];
  hairPorosity: HairPorosity | '';
  hairLength: HairLength | '';
  currentConcerns: string[];
  hairDensity: HairDensity | '';
  strandThickness: StrandThickness | '';
  elasticity: Elasticity | '';
  scalpCondition: ScalpCondition | '';
  ingredientAllergies: string[];
  ingredientSensitivities: string[];
  preferredProductAttributes: string[];
  washFrequencyPerWeek: number | null;
  protectiveStyleFrequency: ProtectiveStyleFrequency | '';
  activityLevel: ActivityLevel | '';
  waterExposure: WaterExposure | '';
  budget: BudgetLevel | '';
  climate: ClimateProfile | '';
  currentRegimenNotes?: string;
  createdAt: string;
  savedRoutines?: SavedRoutine[];
  lastBooking?: LastBooking;
  hairHealthSnapshot?: HairHealthSnapshot;
  /** Newest-first hair scans (analysis ± routine); used for dashboard + revisiting `/hair-care?scan=` */
  hairCareHistory?: HairCareScanRecord[];
}

export const PROFILE_VERSION = 3;

const VALID_HAIR_TYPES: HairType[] = ['4a', '4b', '4c'];
const VALID_POROSITY: HairPorosity[] = ['low', 'normal', 'high'];
const VALID_LENGTH: HairLength[] = ['short', 'medium', 'long'];
const VALID_DENSITY: HairDensity[] = ['low', 'medium', 'high'];
const VALID_STRAND: StrandThickness[] = ['fine', 'medium', 'coarse'];
const VALID_ELASTICITY: Elasticity[] = ['low', 'balanced', 'high'];
const VALID_SCALP: ScalpCondition[] = ['balanced', 'dry', 'oily', 'flaky', 'sensitive'];
const VALID_PROTECTIVE: ProtectiveStyleFrequency[] = ['rare', 'occasional', 'regular', 'continuous'];
const VALID_ACTIVITY: ActivityLevel[] = ['low', 'moderate', 'high'];
const VALID_WATER: WaterExposure[] = ['minimal', 'hard-water', 'swimmer', 'frequent-chlorine'];
const VALID_BUDGET: BudgetLevel[] = ['low', 'medium', 'high'];
const VALID_CLIMATE: ClimateProfile[] = ['dry', 'humid', 'temperate'];

function normalizeHairCareHistory(raw: unknown): HairCareScanRecord[] | undefined {
  if (!Array.isArray(raw)) return undefined;
  const out: HairCareScanRecord[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const o = item as Record<string, unknown>;
    if (typeof o.id !== 'string' || typeof o.scannedAt !== 'string') continue;
    if (!o.hairAnalysis || typeof o.hairAnalysis !== 'object') continue;
    out.push({
      id: o.id,
      scannedAt: o.scannedAt,
      hairAnalysis: o.hairAnalysis as Record<string, unknown>,
      geminiHealth:
        o.geminiHealth != null && typeof o.geminiHealth === 'object'
          ? (o.geminiHealth as Record<string, unknown>)
          : null,
      recommendation: o.recommendation ?? null,
      referenceImageDataUrl:
        typeof o.referenceImageDataUrl === 'string' && o.referenceImageDataUrl.length > 0
          ? o.referenceImageDataUrl
          : undefined,
    });
  }
  out.sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime());
  return out.length ? out : undefined;
}

function normalizeHairHealthSnapshot(raw: unknown): HairHealthSnapshot | undefined {
  if (!raw || typeof raw !== 'object') return undefined;
  const o = raw as Record<string, unknown>;
  if (typeof o.analyzedAt !== 'string' || typeof o.healthScore !== 'number') return undefined;
  const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));
  return {
    analyzedAt: o.analyzedAt,
    healthScore: clamp(o.healthScore as number),
    visionHealthScore: typeof o.visionHealthScore === 'number' ? clamp(o.visionHealthScore as number) : undefined,
    geminiHealthScore: typeof o.geminiHealthScore === 'number' ? clamp(o.geminiHealthScore as number) : undefined,
    overallQuality: typeof o.overallQuality === 'number' ? clamp(o.overallQuality as number) : undefined,
    damageSeverity: typeof o.damageSeverity === 'string' ? o.damageSeverity : undefined,
    hairTypeDetected: typeof o.hairTypeDetected === 'string' ? o.hairTypeDetected : undefined,
    curlPattern: typeof o.curlPattern === 'string' ? o.curlPattern : undefined,
    porosity: typeof o.porosity === 'string' ? o.porosity : undefined,
    density: typeof o.density === 'string' ? o.density : undefined,
    strandThickness: typeof o.strandThickness === 'string' ? o.strandThickness : undefined,
    length: typeof o.length === 'string' ? o.length : undefined,
    moistureLevel: typeof o.moistureLevel === 'string' ? o.moistureLevel : undefined,
    scalpHealth: typeof o.scalpHealth === 'string' ? o.scalpHealth : undefined,
    referenceImageDataUrl:
      typeof o.referenceImageDataUrl === 'string' && o.referenceImageDataUrl.length > 0
        ? o.referenceImageDataUrl
        : undefined,
  };
}

const toStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value.map((entry) => `${entry}`.trim()).filter(Boolean);
};

const toEnumOrEmpty = <T extends string>(value: unknown, validValues: readonly T[]): T | '' => {
  if (typeof value !== 'string') return '';
  return validValues.includes(value as T) ? (value as T) : '';
};

const toNumberOrNull = (value: unknown): number | null => {
  if (typeof value === 'number' && !Number.isNaN(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

export function normalizeUserProfile(raw: unknown): UserProfile {
  const source = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;

  const normalized: UserProfile = {
    profileVersion: typeof source.profileVersion === 'number' ? source.profileVersion : PROFILE_VERSION,
    name: typeof source.name === 'string' ? source.name : '',
    email: typeof source.email === 'string' ? source.email : '',
    age:
      typeof source.age === 'number' && !Number.isNaN(source.age)
        ? source.age
        : typeof source.age === 'string' && source.age.trim() !== ''
          ? parseInt(source.age, 10) || undefined
          : undefined,
    location: typeof source.location === 'string' && source.location.trim() ? source.location : undefined,
    phone: typeof source.phone === 'string' ? source.phone : undefined,
    hairType: VALID_HAIR_TYPES.includes(source.hairType as HairType) ? (source.hairType as HairType) : '4c',
    hairGoals: toStringArray(source.hairGoals),
    hairPorosity: toEnumOrEmpty(source.hairPorosity ?? source.porosity, VALID_POROSITY),
    hairLength: toEnumOrEmpty(source.hairLength ?? source.length, VALID_LENGTH),
    currentConcerns: toStringArray(source.currentConcerns),
    hairDensity: toEnumOrEmpty(source.hairDensity, VALID_DENSITY),
    strandThickness: toEnumOrEmpty(source.strandThickness, VALID_STRAND),
    elasticity: toEnumOrEmpty(source.elasticity, VALID_ELASTICITY),
    scalpCondition: toEnumOrEmpty(source.scalpCondition, VALID_SCALP),
    ingredientAllergies: toStringArray(source.ingredientAllergies),
    ingredientSensitivities: toStringArray(source.ingredientSensitivities),
    preferredProductAttributes: toStringArray(source.preferredProductAttributes),
    washFrequencyPerWeek: toNumberOrNull(source.washFrequencyPerWeek),
    protectiveStyleFrequency: toEnumOrEmpty(source.protectiveStyleFrequency, VALID_PROTECTIVE),
    activityLevel: toEnumOrEmpty(source.activityLevel, VALID_ACTIVITY),
    waterExposure: toEnumOrEmpty(source.waterExposure, VALID_WATER),
    budget: toEnumOrEmpty(source.budget, VALID_BUDGET),
    climate: toEnumOrEmpty(source.climate, VALID_CLIMATE),
    currentRegimenNotes: typeof source.currentRegimenNotes === 'string' ? source.currentRegimenNotes : '',
    createdAt: typeof source.createdAt === 'string' ? source.createdAt : new Date().toISOString(),
    savedRoutines: Array.isArray(source.savedRoutines) ? (source.savedRoutines as SavedRoutine[]) : [],
    lastBooking: typeof source.lastBooking === 'object' && source.lastBooking !== null
      ? (source.lastBooking as LastBooking)
      : undefined,
    hairHealthSnapshot: normalizeHairHealthSnapshot(source.hairHealthSnapshot),
    hairCareHistory: normalizeHairCareHistory(source.hairCareHistory),
  };

  return normalized;
}
