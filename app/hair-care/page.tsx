'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Sparkles,
  Calendar,
  CheckCircle,
  ChevronDown,
  TrendingUp,
  Heart,
  Droplet,
  Zap,
  Star,
  Clock,
  AlertCircle,
  Lightbulb,
  Package,
  Camera,
  Upload,
  User,
  ArrowRight,
  type LucideIcon,
} from 'lucide-react';
import type { HairCareProfile, HairCareRecommendation } from '@/lib/hairCare';
import { PRODUCTS as EXPLORER_PRODUCTS, type ExplorerProduct } from '@/lib/productExplorerCatalog';
import { getProductImageUrl } from '@/lib/product-image';
import BottomNav from '@/app/components/BottomNav';
import OpeningSequence from '@/components/OpeningSequence';
import { HairRoutineOpeningStatus } from '@/components/HairRoutineAnalysingLoader';
import { APP_PAGE_BACKGROUND } from '@/lib/app-theme';
import {
  clearHairCareSession,
  loadHairCareSession,
  parseHairCareRecommendation,
  saveHairCareSession,
} from '@/lib/hair-care-session';
import HairCareReferencePhoto from '@/app/components/HairCareReferencePhoto';
import { upsertHairCareScanRecord } from '@/lib/hair-care-history';
import { mergeScanIntoProfile } from '@/lib/hairHealthSnapshot';
import type { HairCareScanRecord } from '@/types/userProfile';
import { normalizeUserProfile, PROFILE_VERSION, type UserProfile } from '@/types/userProfile';

/** Same priority as `buildHairHealthSnapshot`: Gemini healthScore → overallQuality → health.healthScore/score → 60 */
function computeCanonicalHealthScore(hairAnalysis: unknown, geminiHealth: unknown): number {
  const gh = geminiHealth as { healthScore?: number } | null | undefined;
  const g = gh?.healthScore;
  if (typeof g === 'number') {
    return Math.max(0, Math.min(100, Math.round(g)));
  }
  const ha = hairAnalysis as {
    overallQuality?: number;
    health?: { healthScore?: number; score?: number };
  } | null | undefined;
  if (!ha || typeof ha !== 'object') return 60;
  if (typeof ha.overallQuality === 'number') {
    return Math.max(0, Math.min(100, Math.round(ha.overallQuality)));
  }
  const h = ha.health;
  if (typeof h?.healthScore === 'number') {
    return Math.max(0, Math.min(100, Math.round(h.healthScore)));
  }
  if (typeof h?.score === 'number') {
    return Math.max(0, Math.min(100, Math.round(h.score)));
  }
  return 60;
}

/** Title-style casing per word for recommendation lines from the model. */
function toTitleCaseLine(text: string): string {
  return String(text ?? '')
    .trim()
    .split(/\s+/)
    .map((word) => {
      if (!word) return word;
      const lower = word.toLowerCase();
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');
}

function RoutineAccordionSection({
  title,
  icon: Icon,
  open,
  onToggle,
  children,
  bodyClassName = 'p-4 sm:p-5',
  bodyStyle,
  className = '',
  collapsible = true,
  headerStyle,
  showDivider = true,
  containerStyle,
  titleStyle,
  titleClassName,
}: {
  title: string;
  icon?: LucideIcon;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  bodyClassName?: string;
  bodyStyle?: React.CSSProperties;
  className?: string;
  collapsible?: boolean;
  headerStyle?: React.CSSProperties;
  showDivider?: boolean;
  containerStyle?: React.CSSProperties;
  titleStyle?: React.CSSProperties;
  titleClassName?: string;
}) {
  const resolvedHeaderStyle: React.CSSProperties = {
    background: '#FFFFFF',
    ...headerStyle,
  };
  const resolvedContainerStyle: React.CSSProperties = {
    background: '#FFFFFF',
    border: '2px solid rgba(175, 85, 0, 0.25)',
    ...containerStyle,
  };
  return (
    <div
      className={`overflow-hidden rounded-xl ${className}`.trim()}
      style={resolvedContainerStyle}
    >
      {collapsible ? (
        <button
          type="button"
          onClick={onToggle}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-[rgba(100,49,0,0.06)] sm:px-5 sm:py-[1.125rem]"
          aria-expanded={open}
          style={resolvedHeaderStyle}
        >
          <span className="flex min-w-0 items-center gap-2 sm:gap-3">
            {Icon ? (
              <Icon size={22} className="shrink-0 sm:h-7 sm:w-7" style={{ color: '#643100' }} aria-hidden />
            ) : null}
            <span
              className={titleClassName ?? 'text-xs font-bold uppercase tracking-wide sm:text-sm'}
              style={{
                color: '#643100',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                ...(titleStyle ?? {}),
              }}
            >
              {title}
            </span>
          </span>
          <ChevronDown
            className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
            size={22}
            style={{ color: '#643100' }}
            aria-hidden
          />
        </button>
      ) : (
        <div
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left sm:px-5 sm:py-[1.125rem]"
          style={resolvedHeaderStyle}
        >
          <span className="flex min-w-0 items-center gap-2 sm:gap-3">
            {Icon ? (
              <Icon size={22} className="shrink-0 sm:h-7 sm:w-7" style={{ color: '#643100' }} aria-hidden />
            ) : null}
            <span
              className={titleClassName ?? 'text-xs font-bold uppercase tracking-wide sm:text-sm'}
              style={{
                color: '#643100',
                fontFamily: 'Bricolage Grotesque, sans-serif',
                ...(titleStyle ?? {}),
              }}
            >
              {title}
            </span>
          </span>
        </div>
      )}

      {collapsible ? (
        open ? (
          <div
            className={`${showDivider ? 'border-t border-[rgba(175,85,0,0.15)]' : ''} ${bodyClassName}`}
            style={bodyStyle}
          >
            {children}
          </div>
        ) : null
      ) : (
        <div
          className={`${showDivider ? 'border-t border-[rgba(175,85,0,0.15)]' : ''} ${bodyClassName}`}
          style={bodyStyle}
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default function HairCarePage() {
  const router = useRouter();
  const DASHBOARD_TEXT_COLOR = '#7A3500';
  const catalogProducts = Object.values(EXPLORER_PRODUCTS).flat() as ExplorerProduct[];

  const buildFallbackAnalysisFromHairHealth = (hh: any) => {
    const curlType = typeof hh?.curlPattern?.type === 'string' ? hh.curlPattern.type : undefined;
    const curlConf = typeof hh?.curlPattern?.confidence === 'number' ? hh.curlPattern.confidence : 0.65;
    const healthScore = typeof hh?.healthScore === 'number' ? hh.healthScore : undefined;

    const porosity = typeof hh?.porosity === 'string' ? hh.porosity : undefined;
    const density = typeof hh?.density === 'string' ? hh.density : undefined;
    const length = typeof hh?.length === 'string' ? hh.length : undefined;

    const texture =
      curlType && typeof curlType === 'string' && curlType.toLowerCase().startsWith('4') ? 'coily' : null;

    return {
      // Shape compatible with downstream UI + routine builder usage.
      hairType: curlType
        ? {
            hairType: curlType,
            confidence: Math.max(0, Math.min(1, curlConf)),
            texture: texture ?? undefined,
            porosity: porosity ?? undefined,
            density: density ?? undefined,
          }
        : null,
      detectedStyle: null,
      health: {
        healthScore: typeof healthScore === 'number' ? Math.max(0, Math.min(100, Math.round(healthScore))) : 60,
      },
      length: length ? { length, confidence: 0.65 } : null,
      density: density ? { density, confidence: 0.65 } : null,
      damage: { severity: 'none', damageTypes: [] as string[] },
      overallQuality:
        typeof healthScore === 'number' ? Math.max(0, Math.min(100, Math.round(healthScore))) : undefined,
      extractedCharacteristics: {
        texture: texture ?? undefined,
        length: length ?? undefined,
        density: density ?? undefined,
      },
      _source: 'hair-health-fallback',
    };
  };

  const resolveRecommendedProductImage = (product: Record<string, unknown>) => {
    const direct = getProductImageUrl(product);
    if (direct) return direct;

    const norm = (s: unknown) =>
      String(s ?? '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();

    const b = norm((product as any).brand);
    const n = norm((product as any).name);
    if (!b || !n) return '/images/product-compatibility-image.png';

    // Product-specific overrides when AI naming doesn't match catalog exactly.
    if (/\bwide tooth\b/.test(n) && /\bcomb\b/.test(n)) {
      // Use a real web image (not local fallback).
      return 'https://images.unsplash.com/photo-1598457111964-47e0db313e33?auto=format&fit=crop&w=1200&q=80';
    }

    const hit = catalogProducts.find((p) => {
      const pb = norm(p.brand);
      const pn = norm(p.name);
      if (!pb || !pn) return false;
      const brandOk = pb === b || pb.includes(b) || b.includes(pb);
      const nameOk = pn === n || pn.includes(n) || n.includes(pn);
      return brandOk && nameOk;
    });

    return hit?.imageSrc || '/images/product-compatibility-image.png';
  };
  const hasLoadedRoutine = useRef(false);
  /** Set for each new photo upload; used for hairCareHistory upsert + profile merge guard */
  const currentScanIdRef = useRef<string | null>(null);
  /** When true, do not write hairHealthSnapshot / history (e.g. viewing `/hair-care?scan=`). */
  const skipProfilePersistRef = useRef(false);
  const hairPhotoInputRef = useRef<HTMLInputElement>(null);
  const [recommendation, setRecommendation] = useState<HairCareRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hairImage, setHairImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hairAnalysis, setHairAnalysis] = useState<any>(null);
  const [geminiHealth, setGeminiHealth] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  /** Opening bust plays once, then text-only analysing UI until analysis finishes */
  const [analysisLoadingPhase, setAnalysisLoadingPhase] = useState<'bust' | 'text'>('bust');

  // New multi-step state
  const [currentStep, setCurrentStep] = useState(0); // 0=profile check, 1=name/email, 2=upload, 3=analysis, 4=results
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  const [checkedProfile, setCheckedProfile] = useState(false);
  const [routineAccordionOpen] = useState({
    routine: true,
    maintenance: true,
    products: true,
    tips: true,
  });
  /** In-page copy for save (alerts are often suppressed in PWAs / in-app browsers). */
  const [saveRoutineNotice, setSaveRoutineNotice] = useState<{ tone: 'success' | 'error'; text: string } | null>(
    null,
  );

  useEffect(() => {
    if (!saveRoutineNotice) return;
    const id = window.setTimeout(() => setSaveRoutineNotice(null), 8000);
    return () => window.clearTimeout(id);
  }, [saveRoutineNotice]);

  // Helpers: derive richer insights from Vision API output
  const deriveTexture = (analysis: any): string | null => {
    if (!analysis) return null;
    const type = analysis.hairType?.hairType || analysis.hairType || '';
    if (typeof type === 'string') {
      if (type.startsWith('4')) return 'coily';
      if (type.startsWith('3')) return 'curly';
      if (type.startsWith('2')) return 'wavy';
      if (type.startsWith('1')) return 'straight';
    }
    const labels: any[] = analysis.labels || [];
    const text = labels.map(l => (l.name || l.description || '').toLowerCase()).join(' ');
    if (/kinky|coily|afro|tight curl/.test(text)) return 'coily';
    if (/curl|curly|ringlet|perm/.test(text)) return 'curly';
    if (/wavy|wave/.test(text)) return 'wavy';
    if (/straight/.test(text)) return 'straight';
    return null;
  };

  const clearScanAndSession = () => {
    clearHairCareSession();
    currentScanIdRef.current = null;
    skipProfilePersistRef.current = false;
    setHairImage(null);
    setHairAnalysis(null);
    setGeminiHealth(null);
    setRecommendation(null);
    setAnalysisError(null);
  };

  // Check for profile on mount and load viewing routine if exists
  useEffect(() => {
    // Check if we're viewing a saved routine via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isViewingSaved = urlParams.get('view') === 'saved';
    const forceAnalyzeNew =
      urlParams.get('mode') === 'analyze' || urlParams.get('mode') === 'new' || urlParams.get('fresh') === '1';
    
    console.log('useEffect running:', { isViewingSaved, url: window.location.href, hasLoadedRoutine: hasLoadedRoutine.current });
    
    const scanIdParam = urlParams.get('scan');

    if (forceAnalyzeNew) {
      clearScanAndSession();
      localStorage.removeItem('nywele-viewing-routine');
      const profile = localStorage.getItem('nywele-user-profile');
      if (!profile) {
        setHasProfile(false);
        setShowProfilePrompt(false);
        setCheckedProfile(true);
        router.replace('/onboarding');
        return;
      }
      const parsedProfile = normalizeUserProfile(JSON.parse(profile));
      setUserName(parsedProfile.name);
      setUserEmail(parsedProfile.email);
      setUserProfile(parsedProfile);
      setHasProfile(true);
      setShowProfilePrompt(false);
      setCurrentStep(2); // Upload + analyze new photo
      setCheckedProfile(true);
      hasLoadedRoutine.current = true;
      return;
    }

    if (scanIdParam && !hasLoadedRoutine.current) {
      const profileRawEarly = localStorage.getItem('nywele-user-profile');
      if (profileRawEarly) {
        try {
          const prof = normalizeUserProfile(JSON.parse(profileRawEarly));
          const rec = prof.hairCareHistory?.find((r) => r.id === scanIdParam);
          if (rec) {
            skipProfilePersistRef.current = true;
            currentScanIdRef.current = null;
            setHairImage(rec.referenceImageDataUrl ?? null);
            setHairAnalysis(rec.hairAnalysis);
            setGeminiHealth(rec.geminiHealth);
            if (rec.recommendation) {
              const recParsed = parseHairCareRecommendation(rec.recommendation);
              setRecommendation(recParsed ?? (rec.recommendation as HairCareRecommendation));
              setCurrentStep(4);
            } else {
              setRecommendation(null);
              setCurrentStep(3);
            }
            setHasProfile(true);
            setShowProfilePrompt(false);
            hasLoadedRoutine.current = true;
            return;
          }
        } catch {
          /* fall through */
        }
      }
    }

    if (isViewingSaved && !hasLoadedRoutine.current) {
      // Check localStorage for the routine data
      const viewingRoutine = localStorage.getItem('nywele-viewing-routine');
      console.log('Checking localStorage for routine:', viewingRoutine);
      
      if (viewingRoutine) {
        try {
          const parsed = JSON.parse(viewingRoutine) as {
            hairAnalysis: unknown;
            routine: unknown;
            referenceImageDataUrl?: string;
            isViewing?: boolean;
          };
          const { hairAnalysis, routine, referenceImageDataUrl, isViewing } = parsed;
          if (isViewing) {
            console.log('✅ Loading saved routine...', { hairAnalysis, routine });
            skipProfilePersistRef.current = true;
            currentScanIdRef.current = null;
            setHairAnalysis(hairAnalysis);
            const rec = parseHairCareRecommendation(routine);
            setRecommendation(rec ?? (routine as HairCareRecommendation));
            if (referenceImageDataUrl) setHairImage(referenceImageDataUrl);
            setCurrentStep(4);
            setHasProfile(true);
            hasLoadedRoutine.current = true; // Mark as loaded
            
            // Clean up localStorage
            localStorage.removeItem('nywele-viewing-routine');
            return; // Exit early - we're viewing a routine
          }
        } catch (error) {
          console.error('❌ Error loading saved routine:', error);
        }
      } else {
        console.log('⚠️ No routine found in localStorage');
      }
    }

    // If we've already loaded a routine, don't run the profile check
    if (hasLoadedRoutine.current) {
      console.log('🔒 Already loaded routine, skipping profile check');
      return;
    }

    // Restore last hair-care session (analysis + optional routine + reference photo)
    const session = loadHairCareSession();
    if (session) {
      skipProfilePersistRef.current = false;
      currentScanIdRef.current = null;
      setHairImage(session.hairImageDataUrl);
      setHairAnalysis(session.hairAnalysis);
      setGeminiHealth(session.geminiHealth);
      if (session.recommendation) {
        const rec = parseHairCareRecommendation(session.recommendation);
        setRecommendation(rec ?? (session.recommendation as HairCareRecommendation));
        setCurrentStep(4);
      } else {
        setCurrentStep(3);
      }
      const profileRaw = localStorage.getItem('nywele-user-profile');
      if (profileRaw) {
        const parsedProfile = normalizeUserProfile(JSON.parse(profileRaw));
        setUserName(parsedProfile.name);
        setUserEmail(parsedProfile.email);
        setUserProfile(parsedProfile);
      }
      setHasProfile(true);
      setShowProfilePrompt(false);
      hasLoadedRoutine.current = true;
      return;
    }

    // If not viewing a routine, check for profile
    const profile = localStorage.getItem('nywele-user-profile');
    if (!profile) {
      setHasProfile(false);
      setShowProfilePrompt(false);
      setCheckedProfile(true);
      router.replace('/onboarding');
      return;
    } else {
      // If profile exists, skip to upload step
      const parsedProfile = normalizeUserProfile(JSON.parse(profile));
      setUserName(parsedProfile.name);
      setUserEmail(parsedProfile.email);
      setUserProfile(parsedProfile);
      setCurrentStep(2);
      setCheckedProfile(true);
    }
  }, [router]);

  if (checkedProfile && !hasProfile) {
    // Redirecting to onboarding — avoid showing the old “create your profile” prompt.
    return null;
  }

  // Persist latest hair scan to profile (dashboard metrics + profile page + scan history)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (skipProfilePersistRef.current) return;
    if (isAnalyzing) return;
    if (!hairAnalysis || typeof hairAnalysis !== 'object') return;
    if (Object.keys(hairAnalysis).length === 0) return;
    if (currentStep !== 3 && currentStep !== 4) return;
    const raw = localStorage.getItem('nywele-user-profile');
    if (!raw) return;

    try {
      const profile = normalizeUserProfile(JSON.parse(raw));
      let next = mergeScanIntoProfile(
        profile,
        hairAnalysis as Record<string, unknown>,
        geminiHealth as Record<string, unknown> | null,
        hairImage,
      );
      if (currentScanIdRef.current) {
        const record: HairCareScanRecord = {
          id: currentScanIdRef.current,
          scannedAt: new Date().toISOString(),
          hairAnalysis: hairAnalysis as Record<string, unknown>,
          geminiHealth: (geminiHealth as Record<string, unknown> | null) ?? null,
          recommendation: recommendation ?? null,
          referenceImageDataUrl: hairImage ?? undefined,
        };
        next = upsertHairCareScanRecord(next, record);
      }
      localStorage.setItem('nywele-user-profile', JSON.stringify(next));
    } catch (e) {
      console.warn('Failed to persist hair health snapshot', e);
    }
  }, [hairAnalysis, geminiHealth, isAnalyzing, currentStep, hairImage, recommendation]);

  // Persist scan + routine + reference image for return visits (same device)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (skipProfilePersistRef.current) return;
    if (isAnalyzing) return;
    if (!hairAnalysis || typeof hairAnalysis !== 'object' || Object.keys(hairAnalysis).length === 0) return;

    saveHairCareSession({
      profileEmail: userEmail,
      hairImageDataUrl: hairImage,
      hairAnalysis,
      geminiHealth,
      recommendation,
      currentStep,
    });
  }, [hairImage, hairAnalysis, geminiHealth, recommendation, currentStep, isAnalyzing, userEmail]);

  const handleNameEmailSubmit = () => {
    if (!userName.trim() || !userEmail.trim()) {
      alert('Please enter both name and email');
      return;
    }
    
    // Create basic profile
    const basicProfile: UserProfile = {
      profileVersion: PROFILE_VERSION,
      name: userName.trim(),
      email: userEmail.trim(),
      hairType: '4c', // Default, will be detected later
      hairGoals: ['moisture', 'growth'],
      hairPorosity: '',
      hairLength: '',
      currentConcerns: [],
      hairDensity: '',
      strandThickness: '',
      elasticity: '',
      scalpCondition: '',
      ingredientAllergies: [],
      ingredientSensitivities: [],
      preferredProductAttributes: [],
      washFrequencyPerWeek: null,
      protectiveStyleFrequency: '',
      activityLevel: '',
      waterExposure: '',
      budget: '',
      climate: '',
      currentRegimenNotes: '',
      createdAt: new Date().toISOString(),
      savedRoutines: []
    };
    
    localStorage.setItem('nywele-user-profile', JSON.stringify(basicProfile));
    setHasProfile(true);
    setCurrentStep(2); // Move to upload step
  };

  const saveRoutine = () => {
    setSaveRoutineNotice(null);
    if (!recommendation) {
      setSaveRoutineNotice({
        tone: 'error',
        text: 'No routine to save yet. Generate your routine first.',
      });
      return;
    }
    const hasAnalysis =
      hairAnalysis != null &&
      typeof hairAnalysis === 'object' &&
      Object.keys(hairAnalysis as object).length > 0;
    if (!hasAnalysis) {
      setSaveRoutineNotice({
        tone: 'error',
        text: 'We need your scan data to save. Run a photo analysis first.',
      });
      return;
    }

    const storedProfile = localStorage.getItem('nywele-user-profile');

    try {
      let profile: UserProfile;
      if (!storedProfile) {
        // "Continue without profile" never wrote `nywele-user-profile`; create a minimal one so save works.
        profile = {
          profileVersion: PROFILE_VERSION,
          name: userName.trim() || 'Guest',
          email: userEmail.trim() || '',
          hairType: '4c',
          hairGoals: ['moisture', 'growth'],
          hairPorosity: '',
          hairLength: '',
          currentConcerns: [],
          hairDensity: '',
          strandThickness: '',
          elasticity: '',
          scalpCondition: '',
          ingredientAllergies: [],
          ingredientSensitivities: [],
          preferredProductAttributes: [],
          washFrequencyPerWeek: null,
          protectiveStyleFrequency: '',
          activityLevel: '',
          waterExposure: '',
          budget: '',
          climate: '',
          currentRegimenNotes: '',
          createdAt: new Date().toISOString(),
          savedRoutines: [],
        };
      } else {
        profile = normalizeUserProfile(JSON.parse(storedProfile));
      }

      const score = computeCanonicalHealthScore(hairAnalysis, geminiHealth);
      const newRoutine = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        hairAnalysis: {
          ...hairAnalysis,
          healthScore: score,
          damageSeverity: hairAnalysis.damage?.severity ?? 'none',
          overallQuality: score,
          health: {
            ...hairAnalysis.health,
            healthScore: score,
          },
        },
        routine: recommendation,
        notes: '',
        ...(hairImage && hairImage.startsWith('data:') ? { referenceImageDataUrl: hairImage } : {}),
      };

      const updatedProfile: UserProfile = {
        ...profile,
        profileVersion: PROFILE_VERSION,
        savedRoutines: [newRoutine, ...(profile.savedRoutines || [])],
      };

      const tryWrite = (data: UserProfile): boolean => {
        try {
          localStorage.setItem('nywele-user-profile', JSON.stringify(data));
          return true;
        } catch {
          return false;
        }
      };

      let persisted: UserProfile = updatedProfile;
      let written = tryWrite(updatedProfile);
      if (!written) {
        persisted = {
          ...updatedProfile,
          savedRoutines: (updatedProfile.savedRoutines ?? []).map((r) => ({
            ...r,
            referenceImageDataUrl: undefined,
          })),
        };
        written = tryWrite(persisted);
        if (written) {
          setSaveRoutineNotice({
            tone: 'success',
            text: 'Routine saved (photo omitted — storage was full). Open Profile to view.',
          });
        }
      } else {
        setSaveRoutineNotice({
          tone: 'success',
          text: 'Saved to your profile. Open Profile to see your routines.',
        });
      }

      if (!written) {
        setSaveRoutineNotice({
          tone: 'error',
          text: 'Could not save — browser storage may be full. Free space or try another browser.',
        });
        return;
      }

      setUserProfile(normalizeUserProfile(persisted));
      setHasProfile(true);
    } catch (error) {
      console.error('Error saving routine:', error);
      setSaveRoutineNotice({
        tone: 'error',
        text: 'Something went wrong while saving. Please try again.',
      });
    }
  };

  const handleHairPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void handleHairPhotoFile(file);
    }
  };

  const handleHairPhotoFile = async (file: File) => {
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        clearHairCareSession();
        skipProfilePersistRef.current = false;
        currentScanIdRef.current =
          typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
            ? crypto.randomUUID()
            : `scan-${Date.now()}`;
        setRecommendation(null);
        setHairImage(base64Image);
        setCurrentStep(3); // Move to analysis step
        setAnalysisError(null);
        
        setIsAnalyzing(true);
        try {
          console.log('🔍 Calling hair-health API (Claude)...');
          const hh = await fetch('/api/hair-health', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image }),
          });
          const hhJson = await hh.json().catch(() => null);

          if (hh.ok && hhJson?.success && hhJson?.data) {
            setGeminiHealth(hhJson.data);
            const fallbackAnalysis = buildFallbackAnalysisFromHairHealth(hhJson.data);
            setHairAnalysis(fallbackAnalysis);
            setAnalysisError(null);
            console.log('✅ Hair analysis complete (Claude):', fallbackAnalysis);
          } else {
            const msg =
              hhJson?.message ||
              hhJson?.error ||
              `Could not analyze photo (${hh.status}). Please try again.`;
            console.warn('⚠️ Analysis failed:', msg);
            setHairAnalysis(null);
            setGeminiHealth(null);
            setAnalysisError(msg);
          }
        } catch (error) {
          console.error('❌ Analysis error:', error);
          const msg = error instanceof Error ? error.message : 'Could not analyze photo. Please try again.';
          setHairAnalysis(null);
          setGeminiHealth(null);
          setAnalysisError(msg);
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHairPhotoDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (!file?.type.startsWith('image/') || isAnalyzing) return;
    void handleHairPhotoFile(file);
  };

  const generateRoutine = async () => {
    if (!hairAnalysis) {
      alert('Please upload a photo of your hair first!');
      return;
    }

    console.log('🔄 Starting routine generation...');
    setLoading(true);
    try {
      const profile: HairCareProfile = {
        hairAnalysis: {
          type: hairAnalysis.hairType?.hairType || hairAnalysis.hairType || 'unknown',
          health: computeCanonicalHealthScore(hairAnalysis, geminiHealth),
          texture: hairAnalysis.hairType?.texture || deriveTexture(hairAnalysis) || 'unknown',
          density: hairAnalysis.hairType?.density || hairAnalysis.density || 'thick',
          porosity: hairAnalysis.hairType?.porosity || hairAnalysis.porosity || 'low',
          elasticity: 'medium',
          currentDamage: Array.isArray(hairAnalysis.damage?.damageTypes)
            ? (hairAnalysis.damage.damageTypes as string[])
            : Array.isArray(hairAnalysis.damage)
              ? (hairAnalysis.damage as string[])
              : [],
        },
        currentStyle: {
          name: hairAnalysis.detectedStyle?.style || 'Natural',
          installedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
          maintenanceDue: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000),
        },
        goals: (userProfile?.hairGoals || ['growth', 'moisture', 'strength']) as Array<"growth" | "moisture" | "strength" | "shine" | "protective">,
        concerns: userProfile?.currentConcerns || hairAnalysis.concerns || ['dryness'],
        lifestyle: {
          activity: (userProfile?.activityLevel || 'moderate') as 'low' | 'moderate' | 'high',
          climate: (userProfile?.climate || 'temperate') as 'humid' | 'dry' | 'temperate',
          budget: { 
            min: userProfile?.budget === 'low' ? 1000 : userProfile?.budget === 'high' ? 5000 : 2500,
            max: userProfile?.budget === 'low' ? 3000 : userProfile?.budget === 'high' ? 10000 : 8000
          },
        },
        allergies: [],
      };

      console.log('📤 Sending profile to API:', profile);
      const response = await fetch('/api/hair-care-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      console.log('📥 API response status:', response.status);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API error response:', errorText);
        throw new Error(`Failed to generate routine: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Routine data received:', data);
      
      data.maintenanceSchedule = {
        nextTrim: new Date(data.maintenanceSchedule.nextTrim),
        nextDeepCondition: new Date(data.maintenanceSchedule.nextDeepCondition),
        nextProteinTreatment: new Date(data.maintenanceSchedule.nextProteinTreatment),
        styleRefresh: data.maintenanceSchedule.styleRefresh 
          ? new Date(data.maintenanceSchedule.styleRefresh) 
          : undefined,
      };
      
      setRecommendation(data);
      setCurrentStep(4); // Move to results step
      console.log('✅ Routine generation complete!');
    } catch (error) {
      console.error('❌ Error generating routine:', error);
      alert(`Failed to generate routine: ${error instanceof Error ? error.message : 'Unknown error'}. Please try again.`);
    } finally {
      setLoading(false);
      console.log('🔄 Loading state reset');
    }
  };

  const routinePanelStyle = {
    background: 'rgba(255, 254, 225, 0.43)',
    border: '2px solid rgba(175, 85, 0, 0.25)',
  } as const;

  useEffect(() => {
    if (isAnalyzing) setAnalysisLoadingPhase('bust');
  }, [isAnalyzing]);

  const lockPageScroll =
    (currentStep === 3 && hairImage && !recommendation) || (currentStep === 4 && !!recommendation);

  const metricLabelStyle = { color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' } as const;
  const metricValueStyle = { color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' } as const;
  /** Routine step cards — dark brown copy on C17208 wash */
  const routineStepCardTextStyle = { color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' } as const;
  const analysisReady =
    !!hairAnalysis && typeof hairAnalysis === 'object' && Object.keys(hairAnalysis).length > 0;

  return (
    <>
      <BottomNav />

      <div
        className={
          lockPageScroll
            ? 'relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-transparent'
            : 'relative flex min-h-dvh min-h-0 flex-col bg-transparent'
        }
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        `}</style>

        <div
          className={`relative z-10 bottom-nav-hub-main flex min-h-0 flex-1 flex-col px-7 sm:px-8 md:px-14 lg:px-16 ${
            lockPageScroll
              ? 'overflow-hidden pt-20 lg:pt-32'
              : currentStep === 2 && !hairImage
                ? 'overflow-y-auto overflow-x-hidden pt-24 lg:pt-36'
                : 'overflow-y-auto pt-24 lg:pt-36'
          }`}
        >
          {/* Step 0: Profile Prompt Modal */}
          {currentStep === 0 && showProfilePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
                className="rounded-2xl shadow-2xl p-8 max-w-md w-full"
                style={{ background: '#FFFEE1', border: '2px solid #914600' }}
            >
              <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#643100' }}>
                    <User size={32} style={{ color: '#FFFFFF' }} />
                </div>
                  <h3 className="text-3xl font-bold mb-2" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                    Create Your Profile
                </h3>
                  <p className="mb-8" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Get personalized hair care recommendations and save your routines.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                      onClick={() => window.location.href = '/onboarding'}
                      className="w-full py-4 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                      Let's Start
                    <ArrowRight size={20} />
                  </button>
                  <button
                      onClick={() => { setShowProfilePrompt(false); setCurrentStep(2); }}
                      className="w-full py-3 rounded-2xl font-semibold transition-all"
                      style={{ border: '2px solid #914600', color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Continue Without Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

          {/* Step 1: Name & Email Form */}
          {currentStep === 1 && (
        <motion.div
              initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
              className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center px-4"
            >
              <div className="rounded-2xl shadow-xl p-12 md:p-16 min-h-[750px] flex items-center w-full max-w-[1300px]"
                style={{ background: '#FFFEE1', border: '2px solid #914600' }}>
                <div className="grid md:grid-cols-2 gap-12 w-full">
                  {/* Left Section */}
                  <div className="flex flex-col justify-center">
                    <h1
                      className="text-4xl md:text-5xl font-bold mb-4"
                      style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                    >
                      Let&apos;s get started
                    </h1>
                    <p className="text-lg md:text-xl" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Tell us a bit about you so we can tailor your plan.
                    </p>
                  </div>

                  {/* Right Section - Form */}
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-8" 
                      style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Let's Create Your Profile
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-medium mb-3" 
                          style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Your Name
                        </label>
                        <input
                          type="text"
                          value={userName}
                          onChange={(e) => setUserName(e.target.value)}
                          placeholder="Enter your name"
                          className="w-full px-6 py-4 rounded-xl text-lg"
                          style={{ 
                            background: 'white', 
                            border: '2px solid #914600',
                            color: '#643100',
                            fontFamily: 'Bricolage Grotesque, sans-serif'
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-base font-medium mb-3" 
                          style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Your Email
                        </label>
                        <input
                          type="email"
                          value={userEmail}
                          onChange={(e) => setUserEmail(e.target.value)}
                          placeholder="Enter your Email"
                          className="w-full px-6 py-4 rounded-xl text-lg"
                          style={{ 
                            background: 'white', 
                            border: '2px solid #914600',
                            color: '#643100',
                            fontFamily: 'Bricolage Grotesque, sans-serif'
                          }}
                        />
                      </div>

                      <button
                        onClick={handleNameEmailSubmit}
                        className="w-full py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all mt-6 text-lg"
                        style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Next
                      </button>
                    </div>
                  </div>
                </div>
              </div>
        </motion.div>
          )}

          {/* Step 2: upload card — same shell/inner as Style Check (!showGrid); file input via label */}
          {currentStep === 2 && !hairImage && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
            >
              <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 pt-14 sm:px-4 sm:pt-16 md:px-6 md:pt-0 lg:px-8">
                <div className="md:mx-auto md:w-full md:max-w-[560px]">
                  <div className="mb-2 flex items-start justify-between gap-4">
                    <h1
                      className="min-w-0 flex-1 text-3xl font-bold md:text-4xl"
                      style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                    >
                      How healthy is your hair?
                    </h1>
                  </div>
                  <p
                    className="mb-1 text-base md:mb-4"
                    style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Get immediate feedback with a quick selfie.
                  </p>
                </div>
                <div className="flex min-h-0 flex-none flex-col justify-start md:flex-none md:justify-start">
                  <div
                    className="mt-16 flex w-full max-h-[min(76dvh,calc(100dvh-9.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] flex-none flex-col overflow-hidden rounded-2xl pt-5 pb-5 pl-5 pr-0 sm:mt-20 sm:pt-6 sm:pb-6 sm:pl-6 sm:pr-0 md:mx-auto md:mt-14 md:aspect-square md:w-full md:max-w-[560px] md:max-h-none md:pt-7 md:pb-7 md:pl-7 md:pr-0"
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid rgba(175, 85, 0, 0.25)',
                      color: '#643100',
                    }}
                  >
                    <div className="flex min-h-0 max-h-full flex-1 flex-col gap-4 overflow-y-auto md:gap-5">
                      <div className="flex w-full flex-1 items-center justify-center py-2 pr-5 sm:pr-6 md:py-4 md:pr-7">
                        <div className="flex w-full max-w-xs flex-col rounded-2xl p-5 sm:max-w-sm md:max-w-4xl md:p-6">
                          <p
                            className="mb-5 text-center text-base md:mb-6 md:text-lg"
                            style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            Upload a clear photo of your hair for AI-powered analysis.
                          </p>
                          <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleHairPhotoDrop}
                            className="mx-auto flex aspect-square w-full max-w-[min(100%,17.5rem)] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all hover:bg-opacity-80 md:max-w-xs"
                            style={{
                              borderColor: 'rgba(100, 49, 0, 0.45)',
                              background: 'rgba(100, 49, 0, 0.06)',
                            }}
                          >
                            <Camera className="h-11 w-11 shrink-0 md:h-14 md:w-14" style={{ color: '#643100' }} aria-hidden />
                            <input
                              ref={hairPhotoInputRef}
                              type="file"
                              className="hidden"
                              accept="image/*"
                              onChange={handleHairPhotoUpload}
                              disabled={isAnalyzing}
                            />
                          </label>
                          <p
                            className="mt-5 px-2 text-center text-xs leading-snug md:mt-6 md:px-4 md:text-sm"
                            style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            Click to upload or drag and drop PNG, JPG or JPEG (max. 10MB)
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Analysis Results — hub layout like upload step */}
          {currentStep === 3 && hairImage && !recommendation && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch"
            >
              <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-1 sm:px-2 md:px-3">
                {analysisReady && hairAnalysis && (
                  <div className="mb-2 mt-0 flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <h1
                        className="mb-0.5 text-3xl font-bold md:text-4xl"
                        style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                      >
                        How healthy is your hair?
                      </h1>
                      <p className="mb-0 text-base md:mb-2" style={metricLabelStyle}>
                        From this scan
                        {geminiHealth ? ' · Enhanced analysis' : ''}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={`relative flex min-h-0 w-full max-w-full flex-none flex-col overflow-hidden rounded-2xl ${
                    analysisReady && hairAnalysis ? 'mt-2' : 'mt-5 sm:mt-6 md:mt-8'
                  } ${
                    analysisReady && hairAnalysis
                      ? 'hair-care-analysis-shell-enhanced'
                      : 'max-h-[min(68dvh,calc(100dvh-7.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))))] md:max-h-[min(62dvh,calc(100dvh-6rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))))] lg:max-h-[min(58dvh,calc(100dvh-6rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))))]'
                  }`}
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid rgba(175, 85, 0, 0.25)',
                    color: '#643100',
                  }}
                >
                  <div
                    className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-5 md:gap-5 md:p-6"
                    style={{ visibility: isAnalyzing || loading ? 'hidden' : 'visible' }}
                  >
                    <div className="mx-auto w-full max-w-6xl space-y-4 pr-4 sm:pr-5 md:pr-6">
                      {!analysisReady && <HairCareReferencePhoto src={hairImage} alignStart />}
                    {analysisError ? (
                      <div
                        role="status"
                        className="rounded-xl border-2 px-4 py-3 text-sm font-semibold"
                        style={{
                          background: '#fff1f2',
                          borderColor: 'rgba(185, 28, 28, 0.35)',
                          color: '#7f1d1d',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        {analysisError}
                      </div>
                    ) : null}
                      {hairAnalysis && (
                        <div
                          className={`grid gap-4 lg:gap-6 ${
                            analysisReady && geminiHealth
                              ? 'lg:grid-cols-[minmax(0,1.08fr)_minmax(0,0.92fr)]'
                              : 'lg:grid-cols-2'
                          }`}
                        >
                          <div
                            className={`space-y-4 ${
                              analysisReady && geminiHealth ? 'lg:pl-6 lg:pt-4 xl:pl-8 xl:pt-5' : ''
                            }`}
                          >
                          {analysisReady && geminiHealth ? (
                            <RoutineAccordionSection
                              title="Photo & hair characteristics"
                              open
                              onToggle={() => null}
                              collapsible={false}
                              headerStyle={{ background: 'rgba(255, 254, 225, 0.35)' }}
                              bodyStyle={{ background: 'rgba(255, 254, 225, 0.43)' }}
                              containerStyle={{ border: '1px solid rgba(175, 85, 0, 0.22)' }}
                              titleStyle={{ fontFamily: 'Caprasimo, serif' }}
                              titleClassName="text-sm font-bold uppercase tracking-wide sm:text-base"
                            >
                              <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px,1fr] md:items-start">
                                <div className="shrink-0 md:-mt-1">
                                  <HairCareReferencePhoto
                                    src={hairImage}
                                    compact
                                    headingColor="#643100"
                                    bodyColor="#643100"
                                    alignStart
                                  />
                                </div>
                                <div className="min-w-0">
                                  <div className="flex flex-col gap-3">
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Porosity</p>
                                      <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.porosity || 'Unknown'}</p>
                                    </div>
                                    <div>
                                      <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Strand Thickness</p>
                                      <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.strandThickness || 'Unknown'}</p>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </RoutineAccordionSection>
                          ) : analysisReady ? (
                            <HairCareReferencePhoto
                              src={hairImage}
                              compact
                              headingColor="#643100"
                              bodyColor="#643100"
                              alignStart
                            />
                          ) : null}

                            {/* Detected Style */}
                            {hairAnalysis.detectedStyle?.style && (
                              <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Detected Style
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xl font-bold capitalize" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.detectedStyle.style.replace(/-/g, ' ')}
                                  </p>
                                  {typeof hairAnalysis.detectedStyle.confidence === 'number' && (
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#FFFEE1', color: '#643100', border: '1px solid rgba(175, 85, 0, 0.25)' }}>
                                      {Math.round(hairAnalysis.detectedStyle.confidence * 100)}%
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}

                          {/* Debug indicator removed */}

                            {/* Hair Characteristics moved beside the photo above */}

                            {/* Health Indicators (severity color-coded) */}
                            {geminiHealth && (
                              <RoutineAccordionSection
                                title="Health indicators"
                                open
                                onToggle={() => null}
                                collapsible={false}
                                headerStyle={{ background: 'rgba(255, 254, 225, 0.35)' }}
                                bodyStyle={{ background: 'rgba(255, 254, 225, 0.43)', paddingBottom: 'calc(2rem + 2px)' }}
                                containerStyle={{ border: '1px solid rgba(175, 85, 0, 0.22)' }}
                                bodyClassName="p-4 pb-8 sm:p-5 sm:pb-10 md:pb-12"
                                titleStyle={{ fontFamily: 'Caprasimo, serif' }}
                                titleClassName="text-sm font-bold uppercase tracking-wide sm:text-base"
                              >
                                <div className="grid grid-cols-2 gap-3">
                                  {[
                                    { label: 'Moisture', key: 'moistureLevel' },
                                    { label: 'Protein Balance', key: 'proteinBalance' },
                                    { label: 'Scalp Health', key: 'scalpHealth' },
                                    { label: 'SSKs', key: 'ssks' },
                                    { label: 'Split Ends', key: 'splitEnds' },
                                    { label: 'Heat Damage', key: 'heatDamage' },
                                    { label: 'Chemical Processing', key: 'chemicalProcessing' },
                                  ].map((item, i) => {
                                    const val = geminiHealth[item.key];
                                    return (
                                      <div
                                        key={i}
                                        className="rounded-md p-2"
                                        style={{
                                          background: '#FFF4C2',
                                          border: '1px solid #F8DD65',
                                        }}
                                      >
                                        <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                          {item.label}
                                        </p>
                                        <p className="text-sm font-semibold capitalize" style={metricValueStyle}>
                                          {val || 'Unknown'}
                                        </p>
                                      </div>
                                    );
                                  })}
                                  {Array.isArray(geminiHealth.breakagePoints) && (
                                    <div
                                      className="rounded-md p-2"
                                      style={{
                                        background: '#FFF4C2',
                                        border: '1px solid #F8DD65',
                                      }}
                                    >
                                      <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                        Breakage Points
                                      </p>
                                      <div className="mt-1 flex flex-wrap gap-2">
                                        {geminiHealth.breakagePoints.map((bp: string, idx: number) => (
                                          <span
                                            key={idx}
                                            className="rounded-full border px-2 py-0.5 text-xs capitalize"
                                            style={{
                                              background: 'white',
                                              borderColor: 'rgba(175, 85, 0, 0.25)',
                                              color: '#643100',
                                              fontFamily: 'Bricolage Grotesque, sans-serif',
                                            }}
                                          >
                                            {bp}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </RoutineAccordionSection>
                            )}

                            {/* Primary Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Volume */}
                              {hairAnalysis.volume && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                  <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                    Volume
                                  </p>
                                  <p className="text-xl font-bold capitalize" style={metricValueStyle}>
                                    {hairAnalysis.volume.volume}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Condition Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Shine */}
                              {hairAnalysis.shine && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                  <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                    Shine
                                  </p>
                                  <p className="text-lg font-bold capitalize" style={metricValueStyle}>
                                    {hairAnalysis.shine.level}
                                  </p>
                                </div>
                              )}

                              {/* Frizz */}
                              {hairAnalysis.frizz && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                  <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                    Frizz
                                  </p>
                                  <p className="text-lg font-bold capitalize" style={metricValueStyle}>
                                    {hairAnalysis.frizz.level}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Damage Assessment */}
                            {hairAnalysis.damage && hairAnalysis.damage.severity !== 'none' && (
                              <div className="rounded-lg p-4" style={{ background: hairAnalysis.damage.severity === 'severe' ? '#fee2e2' : hairAnalysis.damage.severity === 'moderate' ? '#fef3c7' : '#f0fdf4', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-bold mb-2 capitalize" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                                  Damage: {hairAnalysis.damage.severity}
                                </p>
                                {Array.isArray(hairAnalysis.damage.damageTypes) && hairAnalysis.damage.damageTypes.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {hairAnalysis.damage.damageTypes.map((type: string, i: number) => (
                                      <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: 'white', color: '#643100', border: '1px solid rgba(175, 85, 0, 0.25)' }}>
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Color Treatment */}
                            {hairAnalysis.colorTreatment && hairAnalysis.colorTreatment.hasColorTreatment && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Color Treatment
                                </p>
                                <p className="text-lg font-bold capitalize" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                                  {hairAnalysis.colorTreatment.treatmentType}
                                </p>
                              </div>
                            )}

                            {/* Product Residues */}
                            {hairAnalysis.productResidues && hairAnalysis.productResidues.visible && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Products Detected
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {hairAnalysis.productResidues.products.map((product: string, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: '#FFFEE1', color: '#643100', border: '1px solid rgba(175, 85, 0, 0.25)' }}>
                                      {product}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scalp Health */}
                            {hairAnalysis.scalp && hairAnalysis.scalp.visible && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Scalp Visibility
                                </p>
                                {hairAnalysis.scalp.health && (
                                  <p className="text-sm font-semibold capitalize" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.scalp.health}
                                  </p>
                                )}
                                {hairAnalysis.scalp.concerns.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {hairAnalysis.scalp.concerns.map((concern: string, i: number) => (
                                      <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: '#fee2e2', color: '#643100' }}>
                                        {concern}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          <div
                            className={`h-full space-y-4 pb-2 md:pb-3 ${
                              analysisReady && geminiHealth ? 'lg:pl-6 lg:pt-4 xl:pl-8 xl:pt-5' : ''
                            }`}
                          >
                            {/* Recommendations */}
                            <RoutineAccordionSection
                              title="Recommendations"
                              open
                              onToggle={() => null}
                              collapsible={false}
                              className="flex h-full w-full flex-col"
                              headerStyle={{ background: 'rgba(255, 254, 225, 0.35)' }}
                              bodyStyle={{ background: 'rgba(255, 254, 225, 0.43)' }}
                              containerStyle={{ border: '1px solid rgba(175, 85, 0, 0.22)', height: 'calc(100% - 12px)' }}
                              bodyClassName="p-4 sm:p-5 flex-1 flex flex-col"
                              titleStyle={{ fontFamily: 'Caprasimo, serif' }}
                              titleClassName="text-sm font-bold uppercase tracking-wide sm:text-base"
                            >
                              <div className="flex-1 overflow-y-auto pr-1">
                                {geminiHealth?.recommendations ? (
                                  <div
                                    className={`w-full space-y-5 ${analysisReady && geminiHealth ? '' : 'mx-auto max-w-xl'}`}
                                  >
                                    {Array.isArray(geminiHealth.recommendations.immediate) && (
                                      <div>
                                        <p
                                          className="mb-2 text-sm font-bold tracking-wide sm:mb-3 sm:text-base"
                                          style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                                        >
                                          Immediate Actions
                                        </p>
                                        <ul className="list-inside list-disc space-y-2 text-xs sm:text-sm" style={{ color: '#643100' }}>
                                          {geminiHealth.recommendations.immediate.map((r: string, i: number) => (
                                            <li key={i}>{toTitleCaseLine(r)}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {Array.isArray(geminiHealth.recommendations.products) && (
                                      <div>
                                        <p
                                          className="mb-2 text-sm font-bold tracking-wide sm:mb-3 sm:text-base"
                                          style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                                        >
                                          Product Suggestions
                                        </p>
                                        <ul className="list-inside list-disc space-y-2 text-xs sm:text-sm" style={{ color: '#643100' }}>
                                          {geminiHealth.recommendations.products.map((r: string, i: number) => (
                                            <li key={i}>{toTitleCaseLine(r)}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {Array.isArray(geminiHealth.recommendations.techniques) && (
                                      <div>
                                        <p
                                          className="mb-2 text-sm font-bold tracking-wide sm:mb-3 sm:text-base"
                                          style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                                        >
                                          Techniques
                                        </p>
                                        <ul className="list-inside list-disc space-y-2 text-xs sm:text-sm" style={{ color: '#643100' }}>
                                          {geminiHealth.recommendations.techniques.map((r: string, i: number) => (
                                            <li key={i}>{toTitleCaseLine(r)}</li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                    {/* Maintenance schedule removed (shown on dashboard instead) */}
                                  </div>
                                ) : (
                                  <p
                                    className="text-sm leading-snug"
                                    style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                                  >
                                    We&apos;re preparing personalised recommendations from your photo. If this takes too long, you can still generate your routine.
                                  </p>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={generateRoutine}
                                disabled={!hairAnalysis || isAnalyzing || loading}
                                className="mx-auto mt-2 flex w-full max-w-[16rem] items-center justify-center gap-2 rounded-full px-2.5 py-3 text-sm font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-70 sm:max-w-xs sm:px-3 sm:py-4 md:text-base"
                                style={{
                                  background: '#643100',
                                  color: '#FFFFFF',
                                  border: '2px solid rgba(122, 53, 0, 0.25)',
                                  fontFamily: 'Bricolage Grotesque, sans-serif',
                                }}
                              >
                                {loading ? 'Generating…' : 'Generate My Routine'}
                              </button>
                            </RoutineAccordionSection>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons - Only show when analysis is complete and not loading routine */}
                      {hairAnalysis && !isAnalyzing && !loading && (
                        <div className="mt-8 flex justify-center">
                          <button
                            type="button"
                            onClick={() => {
                              clearScanAndSession();
                              setCurrentStep(2);
                            }}
                            className="flex w-full max-w-[16rem] items-center justify-center gap-2 rounded-full px-2.5 py-3 text-sm font-semibold transition-all hover:opacity-90 sm:max-w-xs sm:px-3 sm:py-4 md:text-base"
                            style={{
                              color: '#643100',
                              border: '2px solid #643100',
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            }}
                          >
                            Upload Different Photo
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
          </motion.div>
        )}

          {/* Step 4: Routine Results — same white shell + height cap as analysis */}
          {currentStep === 4 && recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex min-h-0 w-full min-w-0 flex-1 flex-col"
          >
            <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col">
              <div className="mx-auto mb-1 w-full max-w-4xl shrink-0 px-4 text-left sm:mb-2 sm:px-5 md:mb-2 md:px-6">
                <h1
                  className="mb-1 min-w-0 text-3xl font-bold md:text-4xl"
                  style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                >
                  Your routine
                </h1>
                <p
                  className="mb-0 text-base md:mb-2"
                  style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Here&apos;s what we recommend based on your profile.
                </p>
              </div>

              <div
                className={`relative mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-2xl ${
                  analysisReady && hairAnalysis ? 'mt-1 sm:mt-2' : 'mt-4 sm:mt-6 md:mt-8'
                } max-h-[min(64dvh,calc(100dvh-7.25rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))))] md:max-h-[min(58dvh,calc(100dvh-5.75rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))))] lg:max-h-[min(54dvh,calc(100dvh-5.75rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px))))]`}
                style={{
                  background: '#FFFFFF',
                  border: '2px solid rgba(175, 85, 0, 0.25)',
                  color: '#643100',
                }}
              >
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain p-4 sm:p-5 md:gap-5 md:p-6">
                    <div className="mx-auto w-full max-w-4xl space-y-4">
                    <div
                      className="mt-2 overflow-hidden rounded-xl pt-4 pr-4 pb-6 pl-6 sm:pt-5 sm:pr-5 sm:pb-8 sm:pl-8"
                      style={{
                        background: '#643100',
                        border: '1px solid rgba(122, 53, 0, 0.55)',
                      }}
                    >
                      <div className="grid grid-cols-1 gap-5 md:grid-cols-[200px,1fr] md:items-start">
                        <div className="shrink-0 pt-3 sm:pt-4 md:pt-5">
                          <HairCareReferencePhoto
                            src={hairImage}
                            compact
                            alignStart
                            headingColor="#FFFEE1"
                            bodyColor="#FFFEE1"
                          />
                        </div>

                        <div className="min-w-0 pt-2 sm:pt-3 md:pt-4">
                          <div className="mb-2 flex w-full items-center justify-start">
                            <span
                              className="text-lg font-bold uppercase tracking-wide sm:text-xl"
                              style={{ color: '#FFFEE1', fontFamily: 'Caprasimo, serif' }}
                            >
                              You can expect
                            </span>
                          </div>
                          <div className="mb-4 grid gap-4 md:grid-cols-2 md:gap-6">
                            <div>
                              <p
                                className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-90"
                                style={{ color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                              >
                                Timeline
                              </p>
                              <p
                                className="text-lg font-semibold sm:text-xl"
                                style={{ color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                              >
                                {recommendation?.expectedResults?.timeline}
                              </p>
                            </div>
                            <div>
                              <p
                                className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-90"
                                style={{ color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                              >
                                Health improvement
                              </p>
                              <p
                                className="text-lg font-semibold sm:text-xl"
                                style={{ color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                              >
                                +{recommendation?.expectedResults?.metrics?.healthImprovement}%
                              </p>
                            </div>
                          </div>
                          <div className="mt-6">
                            <p
                              className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-90"
                              style={{ color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                            >
                              Expected improvements
                            </p>
                            <ul className="space-y-2">
                              {recommendation?.expectedResults?.improvements?.map((improvement, idx) => (
                                <li
                                  key={idx}
                                  className="flex items-start gap-2 text-sm"
                                  style={{ color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                                >
                                  <CheckCircle
                                    size={18}
                                    className="mt-0.5 shrink-0"
                                    style={{ color: '#FFFEE1' }}
                                    aria-hidden
                                  />
                                  <span>{improvement}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <RoutineAccordionSection
                      className="mt-4"
                      title="Your routine steps"
                      icon={Calendar}
                      open={routineAccordionOpen.routine}
                      onToggle={() => {}}
                      collapsible={false}
                      titleStyle={{ fontFamily: 'Caprasimo, serif' }}
                      titleClassName="text-sm font-bold uppercase tracking-wide sm:text-base"
                      bodyClassName="p-4 pt-3 sm:p-5 sm:pt-4"
                      bodyStyle={{ background: 'rgba(255, 254, 225, 0.43)' }}
                      headerStyle={{ background: 'rgba(255, 254, 225, 0.43)' }}
                      showDivider={false}
                    >
                    <div
                      className="relative mb-8 flex h-10 w-full items-center justify-center overflow-hidden rounded-full border-2 border-[#643100] sm:h-11"
                      style={{ background: 'rgba(255, 254, 225, 0.43)' }}
                    >
                <motion.div
                  aria-hidden
                  className="absolute inset-y-0 rounded-full bg-[#643100]"
                  initial={false}
                  animate={{
                    left: `${
                      (activeTab === 'daily' ? 0 : activeTab === 'weekly' ? 1 : 2) * (100 / 3)
                    }%`,
                    width: `${100 / 3}%`,
                  }}
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
                {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="relative z-10 flex min-w-0 flex-1 items-center justify-center px-0.5 py-0 text-[10px] font-semibold capitalize leading-tight transition-colors sm:px-1 sm:text-xs"
                    style={{
                      color: activeTab === tab ? '#FFFFFF' : '#643100',
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                      background: 'transparent',
                    }}
                  >
                    <span className="truncate text-center">
                      {tab}
                    </span>
                  </button>
                ))}
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {recommendation?.personalizedRoutine?.[activeTab]?.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="flex h-full flex-col rounded-[32px] p-4 transition-shadow"
                    style={(() => {
                      // Match Dashboard routine card styling by cadence
                      if (activeTab === 'daily') {
                        return {
                          background: '#FDF8E1',
                          border: '1px solid #F8DD65',
                          boxShadow: '0 10px 22px rgba(122, 53, 0, 0.08)',
                        };
                      }
                      if (activeTab === 'weekly') {
                        return {
                          background: '#FFF4C2',
                          border: '1px solid #F8DD65',
                          boxShadow: '0 10px 22px rgba(122, 53, 0, 0.08)',
                        };
                      }
                      if (activeTab === 'monthly') {
                        return {
                          background: '#FFEFA8',
                          border: '1px solid #F8DD65',
                          boxShadow: '0 10px 22px rgba(122, 53, 0, 0.08)',
                        };
                      }
                      return {
                        background: 'rgba(221, 129, 6, 0.2)',
                        border: '1px solid rgba(221, 129, 6, 0.35)',
                      };
                    })()}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                        style={{ background: '#603E12', color: '#FFFEE1', fontFamily: 'Caprasimo, serif' }}
                      >
                        {step.stepNumber}
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
                        style={(() => {
                          const v = String(step.importance || '').toLowerCase();
                          if (v === 'recommended') {
                            return {
                              background: '#FB8C1C',
                              color: '#3B1C00',
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            };
                          }
                          if (v === 'essential') {
                            return {
                              background: '#C17208',
                              color: '#FFFEE1',
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            };
                          }
                          return {
                            background: '#603E12',
                            color: '#FFFEE1',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                          };
                        })()}
                      >
                        {step.importance}
                      </span>
                    </div>

                    <h3
                      className="mb-1 capitalize text-xs font-semibold leading-snug sm:text-sm"
                      style={routineStepCardTextStyle}
                    >
                      {step.action}
                    </h3>
                    <p className="mb-3 text-xs opacity-90" style={routineStepCardTextStyle}>
                      {step.frequency}
                    </p>

                    {step.duration && (
                      <div className="mb-3 flex items-center gap-2" style={routineStepCardTextStyle}>
                        <Clock size={14} className="shrink-0" style={{ color: '#643100' }} aria-hidden />
                        <span className="text-xs" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#643100' }}>
                          {step.duration}
                        </span>
                      </div>
                    )}

                    <div
                      className="mb-3 flex-grow rounded-lg p-3"
                      style={{
                        background: '#FFFFFF',
                        border: '1px solid rgba(175, 85, 0, 0.14)',
                      }}
                    >
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={routineStepCardTextStyle}>
                        Why
                      </p>
                      <p className="text-sm leading-snug" style={routineStepCardTextStyle}>
                        {step.reasoning}
                      </p>
                    </div>

                    {step.product && (
                      <div
                        className="mt-auto flex items-start gap-2 rounded-lg p-2"
                        style={{
                          background: '#FFFFFF',
                          border: '1px solid rgba(175, 85, 0, 0.14)',
                        }}
                      >
                        <Package className="mt-0.5 shrink-0" size={14} style={{ color: '#643100' }} aria-hidden />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={routineStepCardTextStyle}>
                            Product
                          </p>
                          <p className="text-xs leading-snug" style={routineStepCardTextStyle}>
                            {step.product}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
                    </RoutineAccordionSection>

              {/* Maintenance schedule moved to dashboard */}

              {recommendation?.productRecommendations && recommendation?.productRecommendations?.essential?.length > 0 && (
                <RoutineAccordionSection
                  className="mt-4"
                  title="Recommended products"
                  icon={Package}
                  open={routineAccordionOpen.products}
                  onToggle={() => {}}
                  collapsible={false}
                  titleStyle={{ fontFamily: 'Caprasimo, serif' }}
                  titleClassName="text-sm font-bold uppercase tracking-wide sm:text-base"
                  bodyClassName="px-4 pt-4 pb-2 sm:px-5 sm:pt-5 sm:pb-3"
                  bodyStyle={{ background: 'rgba(255, 254, 225, 0.43)' }}
                  headerStyle={{ background: 'rgba(255, 254, 225, 0.43)' }}
                  showDivider={false}
                >
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p
                        className="text-xs font-semibold uppercase tracking-wide opacity-80"
                        style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Showing results from your catalog
                      </p>
                      {(() => {
                        const hasUuid = recommendation.productRecommendations.essential.some(
                          (p) => typeof p.id === 'string' && p.id.includes('-')
                        );
                        return hasUuid ? (
                          <span
                            className="shrink-0 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                            style={{
                              background: 'rgba(255, 254, 225, 0.65)',
                              borderColor: 'rgba(175, 85, 0, 0.22)',
                              color: '#643100',
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            }}
                          >
                            Supabase
                          </span>
                        ) : null;
                      })()}
                    </div>
                    <div className="flex w-full items-stretch gap-4 overflow-x-auto overscroll-x-contain pr-1 [-webkit-overflow-scrolling:touch]">
                      {recommendation?.productRecommendations?.essential?.slice(0, 6).map((product, idx) => (
                        <div
                          key={idx}
                          className="flex h-full min-h-[26rem] w-[280px] min-w-[280px] shrink-0 flex-col rounded-xl p-5 transition-shadow sm:min-h-[28rem] sm:w-[320px] sm:min-w-[320px]"
                          style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                        >
                          <div
                            className="mb-4 h-40 w-full shrink-0 overflow-hidden rounded-xl"
                            style={{ background: 'rgba(100, 49, 0, 0.06)', border: '1px solid rgba(175, 85, 0, 0.14)' }}
                          >
                            {(() => {
                              const img = resolveRecommendedProductImage(product as unknown as Record<string, unknown>);
                              return img ? (
                                <img
                                  src={img}
                                  alt={`${product.brand} ${product.name}`}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                  decoding="async"
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center">
                                  <Package size={34} style={{ color: '#643100', opacity: 0.55 }} aria-hidden />
                                </div>
                              );
                            })()}
                          </div>
                          
                          <h3 className="mb-1 text-lg font-semibold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.brand}
                          </h3>
                          <p className="mb-3 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.name}
                          </p>

                          <div className="mb-3 flex shrink-0 flex-wrap gap-2">
                            <span
                              className="rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                              style={{
                                background: 'rgba(255, 254, 225, 0.55)',
                                borderColor: 'rgba(175, 85, 0, 0.22)',
                                color: '#643100',
                                fontFamily: 'Bricolage Grotesque, sans-serif',
                              }}
                            >
                              {product.category}
                            </span>
                            <span
                              className="rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide"
                              style={{
                                background: 'rgba(255, 254, 225, 0.55)',
                                borderColor: 'rgba(175, 85, 0, 0.22)',
                                color: '#643100',
                                fontFamily: 'Bricolage Grotesque, sans-serif',
                              }}
                            >
                              {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                            </span>
                          </div>
                          
                          <div className="flex min-h-0 flex-1 flex-col gap-3">
                            <div
                              className="rounded-lg p-3"
                              style={{ background: '#FDF8E1', border: '1px solid #F8DD65' }}
                            >
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                Why we recommend
                              </p>
                              <p className="text-sm leading-snug" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.purpose}
                              </p>
                            </div>

                            <div>
                              <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                Key benefits
                              </p>
                              <ul className="space-y-1">
                                {product.benefits.slice(0, 2).map((benefit, bidx) => (
                                  <li key={bidx} className="flex items-start gap-2 text-xs" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    <span className="text-[#643100]">•</span>
                                    <span>{benefit}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>

                          <div className="mt-auto flex flex-col gap-3 border-t border-[rgba(175,85,0,0.2)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-lg font-bold tabular-nums" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                              </p>
                              <p className="text-xs" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.pricing.size}
                              </p>
                            </div>
                            <button
                              type="button"
                              className="w-full shrink-0 rounded-xl bg-transparent px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80 sm:w-auto sm:py-3 md:text-base"
                              style={{
                                color: '#643100',
                                border: '2px solid #643100',
                                fontFamily: 'Bricolage Grotesque, sans-serif',
                              }}
                            >
                              Buy now
                            </button>
                          </div>
                        </div>
                  ))}
                </div>
                </RoutineAccordionSection>
              )}

              <RoutineAccordionSection
                className="mt-2 sm:mt-3"
                title="Hair care tips"
                icon={Lightbulb}
                open={routineAccordionOpen.tips}
                onToggle={() => {}}
                collapsible={false}
                titleStyle={{ fontFamily: 'Caprasimo, serif' }}
                titleClassName="text-sm font-bold uppercase tracking-wide sm:text-base"
                bodyClassName="p-4 sm:p-5"
              >
            <div className="flex flex-col gap-4 md:flex-row md:flex-wrap md:items-stretch md:gap-6">
                      {/* Do's */}
                      <div
                        className="flex w-full flex-col rounded-xl p-5 sm:p-6 md:basis-[calc(50%-0.75rem)]"
                        style={{ background: 'rgba(255, 254, 225, 0.43)', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                      >
                <div className="mb-4 flex items-center gap-2">
                          <CheckCircle size={22} className="shrink-0" style={{ color: '#643100' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Do&apos;s
                          </h3>
                </div>
                <ul className="flex-1 space-y-3">
                  {recommendation?.tips?.dos?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#643100' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
                      <div
                        className="flex w-full flex-col rounded-xl p-5 sm:p-6 md:basis-[calc(50%-0.75rem)]"
                        style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                      >
                <div className="mb-4 flex items-center gap-2">
                          <AlertCircle size={22} className="shrink-0" style={{ color: '#643100' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Don&apos;ts
                          </h3>
                </div>
                <ul className="flex-1 space-y-3">
                  {recommendation?.tips?.donts?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#643100' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tips */}
              {Array.isArray(recommendation?.tips?.proTips) && recommendation.tips.proTips.length > 0 ? (
                <div className="flex w-full flex-col rounded-xl p-5 sm:p-6 md:basis-full" style={routinePanelStyle}>
                  <div className="mb-4 flex items-center gap-2">
                    <Lightbulb size={22} className="shrink-0" style={{ color: '#643100' }} aria-hidden />
                    <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Pro tips
                    </h3>
                  </div>
                  <ul className="flex-1 space-y-3">
                    {recommendation.tips.proTips.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        <Star size={16} className="mt-0.5 shrink-0" style={{ color: '#643100' }} aria-hidden />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
                  </div>
              </RoutineAccordionSection>
                    </div>
                  </div>
                  <div className="shrink-0 border-t border-[rgba(175,85,0,0.18)] bg-white px-4 py-4 pb-[max(1rem,calc(0.5rem+env(safe-area-inset-bottom,0px)))] sm:px-5 sm:py-4 md:px-6">
                    {saveRoutineNotice ? (
                      <div
                        role="status"
                        aria-live="polite"
                        className="rounded-xl border-2 px-4 py-3 text-sm font-semibold sm:text-base"
                        style={{
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                          ...(saveRoutineNotice.tone === 'success'
                            ? {
                                background: 'rgba(255, 254, 225, 0.65)',
                                borderColor: 'rgba(100, 49, 0, 0.35)',
                                color: '#643100',
                              }
                            : {
                                background: '#fff1f2',
                                borderColor: 'rgba(185, 28, 28, 0.35)',
                                color: '#7f1d1d',
                              }),
                        }}
                      >
                        {saveRoutineNotice.text}
                      </div>
                    ) : null}
                    <div
                      className={`flex min-h-0 w-full max-w-4xl mx-auto flex-row gap-3 ${saveRoutineNotice ? 'mt-3' : ''}`}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          clearScanAndSession();
                          setCurrentStep(2);
                        }}
                        className="min-h-[44px] min-w-0 flex-1 rounded-full bg-transparent px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-80 sm:px-5 sm:py-3 md:text-base"
                        style={{
                          color: DASHBOARD_TEXT_COLOR,
                          border: `2px solid ${DASHBOARD_TEXT_COLOR}`,
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        Analyze new photo
                      </button>
                      <button
                        type="button"
                        onClick={saveRoutine}
                        className="min-h-[44px] min-w-0 flex-1 rounded-full px-4 py-2.5 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90 sm:px-5 sm:py-3 md:text-base"
                        style={{
                          background: '#643100',
                          color: '#FFFEE1',
                          border: '2px solid rgba(122, 53, 0, 0.25)',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        Save my routine
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}
      </div>
    </div>

      {isAnalyzing && analysisLoadingPhase === 'bust' && (
        <OpeningSequence
          phasePreset="full"
          backgroundColor={APP_PAGE_BACKGROUND}
          bustScaleMul={1.1}
          cameraPullbackMul={1}
          continuous
          holdUntilUnmount
          onComplete={() => setAnalysisLoadingPhase('text')}
        />
      )}
      {isAnalyzing && analysisLoadingPhase === 'text' && (
        <div
          className="fixed inset-0 z-[400001] flex items-center justify-center px-4"
          style={{ background: APP_PAGE_BACKGROUND }}
        >
          <HairRoutineOpeningStatus
            title="Analysing your hair…"
            description="We're analysing your image. This may take a moment."
            showChecklist={false}
            titleStyle={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          />
        </div>
      )}
      {loading && !isAnalyzing && (
        <div
          className="fixed inset-0 z-[400001] flex items-center justify-center px-4"
          style={{ background: APP_PAGE_BACKGROUND }}
        >
          <HairRoutineOpeningStatus
            title="Generating your routine..."
            description="We're building your personalised routine from your scan."
            showChecklist={false}
            titleStyle={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          />
        </div>
      )}
    </>
  );
}
