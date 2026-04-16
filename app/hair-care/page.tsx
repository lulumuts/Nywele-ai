'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
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

function RoutineAccordionSection({
  title,
  icon: Icon,
  open,
  onToggle,
  children,
  bodyClassName = 'p-4 sm:p-5',
  bodyStyle,
  className = '',
}: {
  title: string;
  icon?: LucideIcon;
  open: boolean;
  onToggle: () => void;
  children: ReactNode;
  bodyClassName?: string;
  bodyStyle?: React.CSSProperties;
  className?: string;
}) {
  return (
    <div
      className={`overflow-hidden rounded-xl bg-white ${className}`.trim()}
      style={{ border: '2px solid rgba(175, 85, 0, 0.25)' }}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-white px-4 py-3.5 text-left transition-colors hover:bg-[rgba(100,49,0,0.06)] sm:px-5 sm:py-[1.125rem]"
        aria-expanded={open}
      >
        <span className="flex min-w-0 items-center gap-2 sm:gap-3">
          {Icon ? <Icon size={22} className="shrink-0 sm:h-7 sm:w-7" style={{ color: '#643100' }} aria-hidden /> : null}
          <span
            className="text-xs font-bold uppercase tracking-wide sm:text-sm"
            style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
      {open ? (
        <div className={`border-t border-[rgba(175,85,0,0.15)] ${bodyClassName}`} style={bodyStyle}>
          {children}
        </div>
      ) : null}
    </div>
  );
}

export default function HairCarePage() {
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
  /** Opening bust plays once, then text-only analysing UI until analysis finishes */
  const [analysisLoadingPhase, setAnalysisLoadingPhase] = useState<'bust' | 'text'>('bust');

  // New multi-step state
  const [currentStep, setCurrentStep] = useState(0); // 0=profile check, 1=name/email, 2=upload, 3=analysis, 4=results
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);
  const [routineAccordionOpen, setRoutineAccordionOpen] = useState({
    routine: true,
    maintenance: false,
    products: false,
    tips: false,
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
  };

  // Check for profile on mount and load viewing routine if exists
  useEffect(() => {
    // Check if we're viewing a saved routine via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isViewingSaved = urlParams.get('view') === 'saved';
    
    console.log('useEffect running:', { isViewingSaved, url: window.location.href, hasLoadedRoutine: hasLoadedRoutine.current });
    
    const scanIdParam = urlParams.get('scan');

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
      setShowProfilePrompt(true);
      setCurrentStep(0);
    } else {
      // If profile exists, skip to upload step
      const parsedProfile = normalizeUserProfile(JSON.parse(profile));
      setUserName(parsedProfile.name);
      setUserEmail(parsedProfile.email);
      setUserProfile(parsedProfile);
      setCurrentStep(2);
    }
  }, []);

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
      hairImageDataUrl: hairImage,
      hairAnalysis,
      geminiHealth,
      recommendation,
      currentStep,
    });
  }, [hairImage, hairAnalysis, geminiHealth, recommendation, currentStep, isAnalyzing]);

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
        
        // Analyze with Vision API
        setIsAnalyzing(true);
        try {
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              image: base64Image,
              imageType: 'current_hair'
            })
          });
          
          const result = await response.json();
          
          if (result.success) {
            const analysisData = result.data;
            
            // Enhance the analysis with extracted characteristics
            const enhancedAnalysis = {
              ...analysisData,
              // Use extracted characteristics, but prioritize hair type detection for texture
              texture: (() => {
                // If hair type is 4a/4b/4c, texture should be coily
                const hairType = analysisData.hairType?.hairType || analysisData.hairType;
                if (hairType && typeof hairType === 'string' && hairType.toLowerCase().startsWith('4')) {
                  return 'coily';
                }
                // Otherwise use extracted characteristics
                return analysisData.extractedCharacteristics?.texture || 
                       deriveTexture(analysisData) || 
                       null;
              })(),
              // Enhance length if not detected
              length: analysisData.length || 
                      (analysisData.extractedCharacteristics?.length ? {
                        length: analysisData.extractedCharacteristics.length,
                        confidence: 0.7
                      } : null),
              // Enhance density if not detected
              density: analysisData.density || 
                       (analysisData.extractedCharacteristics?.density ? {
                         density: analysisData.extractedCharacteristics.density,
                         confidence: 0.7
                       } : null),
            };
            
            setHairAnalysis(enhancedAnalysis);
            console.log('✅ Hair analysis complete:', enhancedAnalysis);
            console.log('📊 Extracted characteristics:', analysisData.extractedCharacteristics);
            console.log('🎨 UI Display Values:');
            console.log('  - Hair Type:', enhancedAnalysis.hairType?.hairType || enhancedAnalysis.hairType);
            console.log('  - Texture:', enhancedAnalysis.texture);
            console.log('  - Health:', enhancedAnalysis.health?.healthScore || enhancedAnalysis.health?.score);
            console.log('  - Length:', enhancedAnalysis.length?.length || enhancedAnalysis.extractedCharacteristics?.length);
            console.log('  - Density:', enhancedAnalysis.density?.density || enhancedAnalysis.extractedCharacteristics?.density);
            console.log('  - Overall Quality:', enhancedAnalysis.overallQuality);

            // Enrich with Gemini health analysis
            try {
              console.log('🔍 Calling Gemini hair-health API...');
              const hh = await fetch('/api/hair-health', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ image: base64Image }),
              });
              console.log('📥 Gemini API response status:', hh.status);
              const hhJson = await hh.json();
              console.log('📥 Gemini API response:', hhJson);
              if (hhJson.success && hhJson.data) {
                setGeminiHealth(hhJson.data);
                console.log('✅ Gemini hair-health set:', hhJson.data);
              } else {
                console.warn('⚠️ Gemini API returned unsuccessful:', hhJson);
                setGeminiHealth(null);
              }
            } catch (e) {
              console.error('❌ Gemini hair-health failed:', e);
              setGeminiHealth(null);
            }
          } else {
            console.warn('⚠️ Analysis failed; Vision API not configured or returned error');
            setHairAnalysis({});
          }
        } catch (error) {
          console.error('❌ Analysis error:', error);
          setHairAnalysis({});
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
          currentDamage: hairAnalysis.damage || [],
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
              <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h1
                    className="min-w-0 flex-1 text-3xl font-bold md:text-4xl"
                    style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}
                  >
                    How Healthy is your Hair?
                  </h1>
                </div>
                <p
                  className="mb-1 text-base md:mb-4"
                  style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Get immediate feedback with a quick selfie.
                </p>
                <div className="flex min-h-0 flex-none flex-col justify-start md:flex-none md:justify-start">
                  <div
                    className="mt-5 flex w-full max-h-[min(56rem,76dvh,calc(100dvh-8.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] min-h-[25rem] flex-none flex-col overflow-hidden rounded-2xl pt-5 pb-5 pl-5 pr-0 sm:mt-6 sm:pt-6 sm:pb-6 sm:pl-6 sm:pr-0 md:mt-8 md:max-h-[min(58rem,68dvh,calc(100dvh-7.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] md:min-h-[29rem] md:pt-7 md:pb-7 md:pl-7 md:pr-0"
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
                        How healthy is your hair
                      </h1>
                      <p className="mb-0 text-base md:mb-2" style={metricLabelStyle}>
                        From this scan
                        {geminiHealth ? ' · Enhanced analysis' : ''}
                      </p>
                    </div>
                  </div>
                )}
                <div
                  className={`relative flex min-h-0 w-full max-w-full flex-none flex-col overflow-hidden rounded-2xl pb-4 pt-3 sm:pb-5 sm:pt-4 md:pb-6 md:pt-4 ${
                    analysisReady && hairAnalysis ? 'mt-2' : 'mt-5 sm:mt-6 md:mt-8'
                  } max-h-[min(68dvh,calc(100dvh-7.5rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] md:max-h-[min(62dvh,calc(100dvh-6rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))]`}
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid rgba(175, 85, 0, 0.25)',
                    color: '#643100',
                  }}
                >
                  <div
                    className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain pl-4 pr-0 sm:pl-5 sm:pr-0 md:pl-6 md:pr-0 md:gap-5"
                    style={{ visibility: isAnalyzing || loading ? 'hidden' : 'visible' }}
                  >
                    <div className="mx-auto w-full max-w-2xl space-y-4 pr-4 sm:pr-5 md:pr-6">
                      {!analysisReady && <HairCareReferencePhoto src={hairImage} />}
                      {hairAnalysis && (
                        <div className="space-y-3">
                          {analysisReady && (
                            <>
                              <HairCareReferencePhoto
                                src={hairImage}
                                compact
                                headingColor="#643100"
                                bodyColor="#643100"
                              />
                            </>
                          )}

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

                          {/* Debug indicator - remove in production */}
                          {process.env.NODE_ENV === 'development' && (
                            <div className="rounded-lg p-2 text-xs" style={{ background: '#fee2e2', border: '1px solid #dc2626' }}>
                              <p>Debug: geminiHealth = {geminiHealth ? '✅ Set' : '❌ Not set'}</p>
                              <p>hairAnalysis keys: {Object.keys(hairAnalysis || {}).join(', ')}</p>
                            </div>
                          )}

                            {/* Hair Characteristics (Gemini) */}
                            {geminiHealth && (
                              <div className="rounded-lg p-4 space-y-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-semibold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>Hair Characteristics</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Porosity</p>
                                    <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.porosity || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Strand Thickness</p>
                                    <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.strandThickness || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Length</p>
                                    <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.length || 'Unknown'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Health Indicators (severity color-coded) */}
                            {geminiHealth && (
                              <div className="rounded-lg p-4 space-y-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-semibold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>Health Indicators</p>
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
                                          background: 'rgba(193, 114, 8, 0.22)',
                                          border: '1px solid rgba(193, 114, 8, 0.3)',
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
                                        background: 'rgba(193, 114, 8, 0.22)',
                                        border: '1px solid rgba(193, 114, 8, 0.3)',
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
                              </div>
                            )}

                            {/* Recommendations */}
                            {geminiHealth?.recommendations && (
                              <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-semibold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                                  Recommendations
                                </p>
                                <div className="mt-3 space-y-3">
                                  {Array.isArray(geminiHealth.recommendations.immediate) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#643100' }}>Immediate Actions</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#643100' }}>
                                        {geminiHealth.recommendations.immediate.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {Array.isArray(geminiHealth.recommendations.products) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#643100' }}>Product Suggestions</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#643100' }}>
                                        {geminiHealth.recommendations.products.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {Array.isArray(geminiHealth.recommendations.techniques) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#643100' }}>Techniques</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#643100' }}>
                                        {geminiHealth.recommendations.techniques.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {geminiHealth.recommendations.schedule && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#643100' }}>Maintenance Schedule</p>
                                      <p className="text-sm" style={{ color: '#643100' }}>{geminiHealth.recommendations.schedule}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Primary Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Length */}
                              {(hairAnalysis.length || hairAnalysis.extractedCharacteristics?.length) && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                  <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                    Length
                                  </p>
                                  <p className="text-xl font-bold capitalize" style={metricValueStyle}>
                                    {hairAnalysis.length?.length || hairAnalysis.extractedCharacteristics?.length || 'Unknown'}
                                  </p>
                                </div>
                              )}

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
                                {hairAnalysis.damage.damageTypes.length > 0 && (
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
                      )}

                      {/* Action Buttons - Only show when analysis is complete and not loading routine */}
                      {hairAnalysis && !isAnalyzing && !loading && (
                        <div className="mt-8 flex gap-4">
                          <button
                            type="button"
                            onClick={() => {
                              clearScanAndSession();
                              setCurrentStep(2);
                            }}
                            className="flex-1 rounded-xl bg-transparent px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-80 sm:py-4 md:text-base"
                            style={{
                              color: '#643100',
                              border: '2px solid #643100',
                              fontFamily: 'Bricolage Grotesque, sans-serif',
                            }}
                          >
                            Upload Different Photo
                          </button>
                          <button
                            type="button"
                            onClick={generateRoutine}
                            className="flex-1 rounded-xl px-6 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl sm:py-4 md:text-base"
                            style={{ background: '#643100', color: '#FFFFFF', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            Generate My Routine
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
            <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-1 sm:px-2 md:px-3">
              <div className="mx-auto mb-1 w-full max-w-4xl shrink-0 px-1 text-left sm:mb-2 sm:px-2 md:mb-2 md:px-3">
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
                className={`relative flex min-h-0 w-full max-w-full flex-1 flex-col overflow-hidden rounded-2xl pt-3 sm:pt-4 md:pt-4 ${
                  analysisReady && hairAnalysis ? 'mt-2 sm:mt-3' : 'mt-6 sm:mt-8 md:mt-10'
                } max-h-[min(70dvh,calc(100dvh-7.75rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))] md:max-h-[min(63dvh,calc(100dvh-6.25rem-env(safe-area-inset-top,0px)-env(safe-area-inset-bottom,0px)))]`}
                style={{
                  background: '#FFFFFF',
                  border: '2px solid rgba(175, 85, 0, 0.25)',
                  color: '#643100',
                }}
              >
                <div className="flex min-h-0 flex-1 flex-col">
                  <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5 md:px-6 md:gap-5">
                    <div className="mx-auto w-full max-w-4xl space-y-4">
                    <HairCareReferencePhoto
                      src={hairImage}
                      compact={analysisReady}
                      headingColor="#643100"
                      bodyColor="#643100"
                    />

                    <div
                      className="mt-4 overflow-hidden rounded-xl"
                      style={{ border: '1px solid rgba(175, 85, 0, 0.22)' }}
                    >
                      <div
                        className="px-4 py-3 sm:px-5 sm:py-4"
                        style={{ background: 'rgba(255, 254, 225, 0.35)' }}
                      >
                        <span className="flex min-w-0 items-center gap-2 sm:gap-3">
                          <TrendingUp size={22} className="shrink-0 sm:h-7 sm:w-7" style={{ color: '#643100' }} aria-hidden />
                          <span className="text-lg font-bold sm:text-xl" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            You can expect
                          </span>
                        </span>
                      </div>
                      <div
                        className="p-4 sm:p-5"
                        style={{ background: 'rgba(255, 254, 225, 0.43)' }}
                      >
                        <div className="mb-4 grid gap-4 md:grid-cols-2 md:gap-6">
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                              Timeline
                            </p>
                            <p className="text-lg font-semibold sm:text-xl" style={metricValueStyle}>
                              {recommendation?.expectedResults?.timeline}
                            </p>
                          </div>
                          <div>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                              Health improvement
                            </p>
                            <p className="text-lg font-semibold sm:text-xl" style={metricValueStyle}>
                              +{recommendation?.expectedResults?.metrics?.healthImprovement}%
                            </p>
                          </div>
                        </div>
                        <div>
                          <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                            Expected improvements
                          </p>
                          <ul className="space-y-2">
                            {recommendation?.expectedResults?.improvements?.map((improvement, idx) => (
                              <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                <CheckCircle size={18} className="mt-0.5 shrink-0" style={{ color: '#643100' }} aria-hidden />
                                <span>{improvement}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <RoutineAccordionSection
                      className="mt-4"
                      title="Your routine steps"
                      icon={Calendar}
                      open={routineAccordionOpen.routine}
                      onToggle={() => setRoutineAccordionOpen((s) => ({ ...s, routine: !s.routine }))}
                      bodyClassName="p-4 pt-3 sm:p-5 sm:pt-4"
                    >
                    <div className="relative mb-6 flex h-10 w-full overflow-hidden rounded-full border-2 border-[#643100] bg-white sm:h-11">
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
                      {tab} · {recommendation?.personalizedRoutine?.[tab]?.length ?? 0}
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
                    className="flex h-full flex-col rounded-xl p-4 transition-shadow"
                    style={{
                      background: 'rgba(221, 129, 6, 0.2)',
                      border: '1px solid rgba(221, 129, 6, 0.35)',
                    }}
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
                        style={{ background: '#603E12', color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
                        background: 'rgba(255, 255, 255, 0.42)',
                        border: '1px solid rgba(221, 129, 6, 0.28)',
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
                          background: 'rgba(255, 255, 255, 0.35)',
                          border: '1px solid rgba(221, 129, 6, 0.28)',
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

              <RoutineAccordionSection
                className="mt-4"
                title="Maintenance schedule"
                icon={Clock}
                open={routineAccordionOpen.maintenance}
                onToggle={() => setRoutineAccordionOpen((s) => ({ ...s, maintenance: !s.maintenance }))}
                bodyClassName="p-4 sm:p-5"
              >
                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div
                      className="flex flex-col rounded-xl p-3 sm:p-4"
                      style={{
                        background: 'rgba(221, 129, 6, 0.2)',
                        border: '1px solid rgba(221, 129, 6, 0.35)',
                      }}
                    >
                      <p
                        className="mb-1 text-[10px] font-semibold uppercase leading-tight tracking-wide opacity-80 sm:text-xs"
                        style={routineStepCardTextStyle}
                      >
                        Next deep condition
                      </p>
                      <p className="text-sm font-bold leading-snug sm:text-base" style={routineStepCardTextStyle}>
                        {recommendation?.maintenanceSchedule?.nextDeepCondition?.toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className="flex flex-col rounded-xl p-3 sm:p-4"
                      style={{
                        background: 'rgba(221, 129, 6, 0.2)',
                        border: '1px solid rgba(221, 129, 6, 0.35)',
                      }}
                    >
                      <p
                        className="mb-1 text-[10px] font-semibold uppercase leading-tight tracking-wide opacity-80 sm:text-xs"
                        style={routineStepCardTextStyle}
                      >
                        Next protein treatment
                      </p>
                      <p className="text-sm font-bold leading-snug sm:text-base" style={routineStepCardTextStyle}>
                        {recommendation?.maintenanceSchedule?.nextProteinTreatment?.toLocaleDateString()}
                      </p>
                    </div>
                    <div
                      className="flex flex-col rounded-xl p-3 sm:p-4"
                      style={{
                        background: 'rgba(221, 129, 6, 0.2)',
                        border: '1px solid rgba(221, 129, 6, 0.35)',
                      }}
                    >
                      <p
                        className="mb-1 text-[10px] font-semibold uppercase leading-tight tracking-wide opacity-80 sm:text-xs"
                        style={routineStepCardTextStyle}
                      >
                        Next trim
                      </p>
                      <p className="text-sm font-bold leading-snug sm:text-base" style={routineStepCardTextStyle}>
                        {recommendation?.maintenanceSchedule?.nextTrim?.toLocaleDateString()}
                      </p>
                    </div>
                    {recommendation?.maintenanceSchedule?.styleRefresh && (
                      <div
                        className="flex flex-col rounded-xl p-3 sm:p-4"
                        style={{
                          background: 'rgba(221, 129, 6, 0.2)',
                          border: '1px solid rgba(221, 129, 6, 0.35)',
                        }}
                      >
                        <p
                          className="mb-1 text-[10px] font-semibold uppercase leading-tight tracking-wide opacity-80 sm:text-xs"
                          style={routineStepCardTextStyle}
                        >
                          Style refresh
                        </p>
                        <p className="text-sm font-bold leading-snug sm:text-base" style={routineStepCardTextStyle}>
                          {recommendation?.maintenanceSchedule?.styleRefresh?.toLocaleDateString()}
                        </p>
                      </div>
                    )}
                  </div>
              </RoutineAccordionSection>

              {recommendation?.productRecommendations && recommendation?.productRecommendations?.essential?.length > 0 && (
                <RoutineAccordionSection
                  className="mt-4"
                  title="Recommended products"
                  icon={Package}
                  open={routineAccordionOpen.products}
                  onToggle={() => setRoutineAccordionOpen((s) => ({ ...s, products: !s.products }))}
                  bodyClassName="p-4 sm:p-5"
                >
                    <div className="grid gap-4 md:grid-cols-3">
                      {recommendation?.productRecommendations?.essential?.slice(0, 3).map((product, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl p-5 transition-shadow"
                          style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                        >
                          <div className="mb-3">
                            <span
                              className="inline-block rounded-full px-3 py-1 text-xs font-semibold"
                              style={{
                                background: 'rgba(100, 49, 0, 0.1)',
                                color: '#643100',
                                border: '1px solid rgba(175, 85, 0, 0.25)',
                                fontFamily: 'Bricolage Grotesque, sans-serif',
                              }}
                            >
                              Recommended
                            </span>
                        </div>
                          
                          <h3 className="mb-1 text-lg font-semibold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.brand}
                          </h3>
                          <p className="mb-3 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.name}
                          </p>
                          
                          <div className="mb-3 rounded-lg p-3" style={{ background: 'rgba(255, 254, 225, 0.43)', border: '1px solid rgba(175, 85, 0, 0.14)' }}>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                              Why we recommend
                            </p>
                            <p className="text-sm leading-snug" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              {product.purpose}
                            </p>
                      </div>

                          <div className="mb-3">
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

                          <div className="flex flex-col gap-3 border-t border-[rgba(175,85,0,0.2)] pt-3 sm:flex-row sm:items-center sm:justify-between">
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
                className="mt-4"
                title="Hair care tips"
                icon={Lightbulb}
                open={routineAccordionOpen.tips}
                onToggle={() => setRoutineAccordionOpen((s) => ({ ...s, tips: !s.tips }))}
                bodyClassName="p-4 sm:p-5"
              >
            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                      {/* Do's */}
                      <div className="rounded-xl p-5 sm:p-6" style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}>
                <div className="mb-4 flex items-center gap-2">
                          <CheckCircle size={22} className="shrink-0" style={{ color: '#643100' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Do&apos;s
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.dos?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#643100' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
                      <div className="rounded-xl p-5 sm:p-6" style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}>
                <div className="mb-4 flex items-center gap-2">
                          <AlertCircle size={22} className="shrink-0" style={{ color: '#643100' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Don&apos;ts
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.donts?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#643100' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tips */}
                      <div className="rounded-xl p-5 sm:p-6" style={routinePanelStyle}>
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb size={22} className="shrink-0" style={{ color: '#643100' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Pro tips
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.proTips?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <Star size={16} className="mt-0.5 shrink-0" style={{ color: '#643100' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
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
                        className="min-h-[3rem] min-w-0 flex-1 rounded-xl bg-transparent px-4 py-3 text-sm font-semibold transition-opacity hover:opacity-80 sm:px-6 sm:py-4 md:text-base"
                        style={{
                          color: '#643100',
                          border: '2px solid #643100',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        Analyze new photo
                      </button>
                      <button
                        type="button"
                        onClick={saveRoutine}
                        className="min-h-[3rem] min-w-0 flex-1 rounded-xl px-4 py-3 text-sm font-semibold shadow-lg transition-all hover:shadow-xl sm:px-6 sm:py-4 md:text-base"
                        style={{ background: '#643100', color: '#FFFFFF', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
          phasePreset="route"
          backgroundColor={APP_PAGE_BACKGROUND}
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
