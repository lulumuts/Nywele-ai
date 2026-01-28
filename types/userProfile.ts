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
}

export interface LastBooking {
  style: string;
  date: string;
  stylist: string;
}

export interface UserProfile {
  profileVersion: number;
  name: string;
  email: string;
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
}

export const PROFILE_VERSION = 2;

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
      : undefined
  };

  return normalized;
}
