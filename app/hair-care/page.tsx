'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Calendar,
  CheckCircle,
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
  
  // Active section state
  const [activeSection, setActiveSection] = useState<'routine' | 'maintenance' | 'products' | 'tips'>('routine');
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

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

  const healthStatus = (score?: number): string => {
    if (typeof score !== 'number') return 'unknown';
    if (score >= 80) return 'excellent';
    if (score >= 70) return 'healthy';
    if (score >= 55) return 'needs care';
    return 'damaged';
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
    console.log('Save routine called');
    console.log('Recommendation:', recommendation);
    console.log('Hair Analysis:', hairAnalysis);
    
    if (!recommendation || !hairAnalysis) {
      alert('No routine to save. Please generate a routine first.');
      return;
    }

    const storedProfile = localStorage.getItem('nywele-user-profile');
    console.log('Stored profile:', storedProfile);
    
    if (!storedProfile) {
      alert('Please create a profile first');
      return;
    }

    try {
      const profile = normalizeUserProfile(JSON.parse(storedProfile));
      console.log('Parsed profile:', profile);

      const newRoutine = {
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        hairAnalysis: {
          ...hairAnalysis,
          healthScore: hairAnalysis.health?.healthScore ?? hairAnalysis.health?.score ?? 60,
          damageSeverity: hairAnalysis.damage?.severity ?? 'none',
          overallQuality: hairAnalysis.overallQuality ?? (hairAnalysis.health?.healthScore ?? hairAnalysis.health?.score ?? 60),
        },
        routine: recommendation,
        notes: '',
        ...(hairImage && hairImage.startsWith('data:') ? { referenceImageDataUrl: hairImage } : {}),
      };

      const updatedProfile: UserProfile = {
        ...profile,
        profileVersion: PROFILE_VERSION,
        savedRoutines: [newRoutine, ...(profile.savedRoutines || [])]
      };

      localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
      console.log('Routine saved successfully. Total routines:', updatedProfile.savedRoutines?.length ?? 0);

      alert('✅ Routine saved successfully! View it in your profile.');
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('❌ Error saving routine. Please try again.');
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
          health: hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 60,
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

  const getImportancePillStyle = (importance: string) => {
    const base = { fontFamily: 'Bricolage Grotesque, sans-serif' as const };
    switch (importance) {
      case 'essential':
        return { ...base, background: 'rgba(96, 62, 18, 0.14)', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.35)' };
      case 'recommended':
        return { ...base, background: 'rgba(96, 62, 18, 0.08)', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.25)' };
      case 'optional':
        return { ...base, background: 'rgba(96, 62, 18, 0.05)', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.2)' };
      default:
        return { ...base, background: 'rgba(96, 62, 18, 0.06)', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.2)' };
    }
  };

  // Debug info
  console.log('HairCarePage render:', { currentStep, hasRecommendation: !!recommendation, hasHairAnalysis: !!hairAnalysis });

  useEffect(() => {
    if (isAnalyzing) setAnalysisLoadingPhase('bust');
  }, [isAnalyzing]);

  const lockPageScroll =
    (currentStep === 3 && hairImage && !recommendation) || (currentStep === 4 && !!recommendation);

  const metricLabelStyle = { color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' } as const;
  const metricValueStyle = { color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' } as const;

  return (
    <>
      <BottomNav />

      <div
        className={
          lockPageScroll
            ? 'relative flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden'
            : `relative min-h-screen ${
                currentStep === 2 && !hairImage ? 'md:pt-14' : 'md:pt-20'
              } ${
                currentStep === 2 && !hairImage
                  ? 'flex flex-col max-md:pb-0 md:pb-0'
                  : 'pb-24 md:pb-8'
              }`
        }
        style={{ background: '#FFFEE1' }}
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        `}</style>

        <div
          className={`relative z-10 ${
            lockPageScroll
              ? 'flex min-h-0 flex-1 flex-col overflow-hidden px-4 pb-[max(4.75rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] pt-20 md:px-6 md:pt-14'
              : currentStep === 2 && !hairImage
                ? 'flex min-h-0 flex-1 flex-col max-md:px-0 max-md:py-0 md:px-4 md:py-6'
                : 'px-4 py-12'
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
                  <h3 className="text-3xl font-bold mb-2" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                    Create Your Profile
                </h3>
                  <p className="mb-8" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                      style={{ border: '2px solid #914600', color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
                      style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
                    >
                      Let&apos;s get started
                    </h1>
                    <p className="text-lg md:text-xl" style={{ color: '#5C4A3D', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Tell us a bit about you so we can tailor your plan.
                    </p>
                  </div>

                  {/* Right Section - Form */}
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-8" 
                      style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                      Let's Create Your Profile
                    </h2>
                    
                    <div className="space-y-6">
                      <div>
                        <label className="block text-base font-medium mb-3" 
                          style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                            color: '#DD8106',
                            fontFamily: 'Bricolage Grotesque, sans-serif'
                          }}
                        />
                      </div>

                      <div>
                        <label className="block text-base font-medium mb-3" 
                          style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                            color: '#DD8106',
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
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-7 pb-[max(0.75rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] pt-32 sm:px-8 md:px-14 md:pb-10 md:pt-12 lg:px-16"
            >
              <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-3 sm:px-4 md:px-6 lg:px-8">
                <div className="mb-2 flex items-start justify-between gap-4">
                  <h1
                    className="min-w-0 flex-1 text-3xl font-bold md:text-4xl"
                    style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
                  >
                    How Healthy is your Hair?
                  </h1>
                </div>
                <p
                  className="mb-2 text-base md:mb-6"
                  style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Get immediate feedback with a quick selfie.
                </p>
                <div className="flex min-h-0 flex-1 flex-col justify-center md:flex-none md:justify-start">
                  <div
                    className="flex w-full max-h-[min(48rem,82dvh)] min-h-[22rem] flex-col overflow-hidden rounded-2xl p-5 md:max-h-[min(52rem,78dvh)] md:flex-none md:min-h-[26rem] md:p-6"
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid rgba(175, 85, 0, 0.25)',
                      color: '#C17208',
                    }}
                  >
                    <div className="flex min-h-0 max-h-full flex-1 flex-col gap-4 overflow-y-auto md:gap-5">
                      <div className="flex w-full flex-1 items-center justify-center py-2 md:py-4">
                        <div className="flex w-full max-w-xs flex-col rounded-2xl p-5 sm:max-w-sm md:max-w-4xl md:p-6">
                          <p
                            className="mb-5 text-center text-base md:mb-6 md:text-lg"
                            style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            Upload a clear photo of your hair for AI-powered analysis.
                          </p>
                          <label
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={handleHairPhotoDrop}
                            className="mx-auto flex aspect-square w-full max-w-[min(100%,17.5rem)] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-all hover:bg-opacity-80 md:max-w-xs"
                            style={{
                              borderColor: 'rgba(193, 114, 8, 0.45)',
                              background: 'rgba(193, 114, 8, 0.06)',
                            }}
                          >
                            <Camera className="h-11 w-11 shrink-0 md:h-14 md:w-14" style={{ color: '#C17208' }} aria-hidden />
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
                            style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
              className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 pb-1 pt-2 sm:px-5 md:px-8 md:pt-4 lg:px-10"
            >
              <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-1 sm:px-2 md:px-4">
                <div
                  className="relative flex min-h-0 max-h-[min(70dvh,calc(100dvh-9rem))] flex-1 flex-col overflow-hidden rounded-2xl p-4 md:p-6"
                  style={{
                    background: '#FFFFFF',
                    border: '2px solid rgba(175, 85, 0, 0.25)',
                    color: '#603E12',
                  }}
                >
                  <div
                    className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain md:gap-5"
                    style={{ visibility: isAnalyzing || loading ? 'hidden' : 'visible' }}
                  >
                    <div className="mx-auto w-full max-w-2xl space-y-6">
                      <HairCareReferencePhoto src={hairImage} />
                      {hairAnalysis && (
                        <div className="space-y-4">
                          <div className="mb-2 flex flex-wrap items-center gap-2 border-b border-[rgba(175,85,0,0.2)] pb-4">
                            <CheckCircle className="h-6 w-6 shrink-0" style={{ color: '#603E12' }} aria-hidden />
                            <h3 className="text-lg font-bold md:text-xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                              Analysis complete
                            </h3>
                            {geminiHealth && (
                              <span className="text-xs font-medium" style={{ color: '#6B5344' }}>
                                Enhanced
                              </span>
                            )}
                          </div>

                            {/* Debug indicator - remove in production */}
                            {process.env.NODE_ENV === 'development' && (
                              <div className="rounded-lg p-2 text-xs" style={{ background: '#fee2e2', border: '1px solid #dc2626' }}>
                                <p>Debug: geminiHealth = {geminiHealth ? '✅ Set' : '❌ Not set'}</p>
                                <p>hairAnalysis keys: {Object.keys(hairAnalysis || {}).join(', ')}</p>
                              </div>
                            )}
                            
                            {/* Overall Quality Score - Highlighted */}
                            {typeof hairAnalysis.overallQuality === 'number' && (
                              <div
                                className="rounded-lg p-4"
                                style={{
                                  background: 'rgba(255, 254, 225, 0.43)',
                                  border: '2px solid rgba(175, 85, 0, 0.25)',
                                }}
                              >
                                <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                  Overall Quality Score
                                </p>
                                <p className="text-4xl font-bold tabular-nums" style={metricValueStyle}>
                                  {hairAnalysis.overallQuality}/100
                                </p>
                              </div>
                            )}

                            {/* Primary Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Hair Type */}
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                Hair Type
                              </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-2xl font-bold" style={metricValueStyle}>
                                    {(() => {
                                      const raw = (hairAnalysis.hairType?.hairType || hairAnalysis.hairType || 'Unknown').toString().trim();
                                      if (!raw || raw.toLowerCase() === 'unknown') return 'Unknown';
                                      return raw.toUpperCase();
                                    })()}
                          </p>
                                  {typeof hairAnalysis.hairType?.confidence === 'number' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#FFFEE1', color: '#603E12' }}>
                                      {Math.round(hairAnalysis.hairType.confidence * 100)}%
                                    </span>
                                  )}
                        </div>
                              </div>

                              {/* Health Score */}
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                  Health
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-2xl font-bold tabular-nums" style={metricValueStyle}>
                                    {(hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 60)}/100
                                  </p>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize" style={{ background: '#FFFEE1', color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    {healthStatus(hairAnalysis.health?.healthScore ?? hairAnalysis.health?.score)}
                                  </span>
                        </div>
                              </div>

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

                              {/* Density */}
                              {(hairAnalysis.density || hairAnalysis.extractedCharacteristics?.density) && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                  <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                    Density
                                  </p>
                                  <p className="text-xl font-bold capitalize" style={metricValueStyle}>
                                    {hairAnalysis.density?.density || hairAnalysis.extractedCharacteristics?.density || 'Unknown'}
                                  </p>
                                </div>
                              )}

                              {/* Texture */}
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                                  Texture
                                </p>
                                <p className="text-xl font-bold capitalize" style={metricValueStyle}>
                                  {hairAnalysis.texture || 
                                   hairAnalysis.extractedCharacteristics?.texture || 
                                   deriveTexture(hairAnalysis) || 
                                   'Unknown'}
                                </p>
                              </div>

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

                            {/* Gemini Health Score (progress bar) */}
                            {geminiHealth?.healthScore !== undefined && (
                              <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-2 font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Health Score</p>
                                <div className="relative flex h-3 w-full overflow-hidden rounded-full border-2 border-[#603E12] bg-white">
                                  <div
                                    className="absolute inset-y-0 left-0 rounded-full bg-[#603E12]"
                                    style={{
                                      width: `${Math.max(0, Math.min(100, geminiHealth.healthScore))}%`,
                                    }}
                                  />
                                </div>
                                <p className="mt-1 text-xs tabular-nums" style={metricValueStyle}>{geminiHealth.healthScore}/100</p>
                              </div>
                            )}

                            {/* Hair Characteristics (Gemini) */}
                            {geminiHealth && (
                              <div className="rounded-lg p-4 space-y-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-semibold" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>Hair Characteristics</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Curl Pattern</p>
                                    <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.curlPattern?.type || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Porosity</p>
                                    <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.porosity || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Strand Thickness</p>
                                    <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.strandThickness || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>Density</p>
                                    <p className="text-sm font-semibold capitalize" style={metricValueStyle}>{geminiHealth.density || 'Unknown'}</p>
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
                                <p className="text-sm font-semibold" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>Health Indicators</p>
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
                                          background: 'rgba(255, 254, 225, 0.43)',
                                          border: '2px solid rgba(175, 85, 0, 0.25)',
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
                                        background: 'rgba(255, 254, 225, 0.43)',
                                        border: '2px solid rgba(175, 85, 0, 0.25)',
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
                                              color: '#603E12',
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

                            {/* Recommendations (expandable) */}
                            {geminiHealth?.recommendations && (
                              <details className="rounded-lg p-4" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <summary className="cursor-pointer text-sm font-semibold" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Recommendations</summary>
                                <div className="mt-3 space-y-3">
                                  {Array.isArray(geminiHealth.recommendations.immediate) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#603E12' }}>Immediate Actions</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#603E12' }}>
                                        {geminiHealth.recommendations.immediate.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {Array.isArray(geminiHealth.recommendations.products) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#603E12' }}>Product Suggestions</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#603E12' }}>
                                        {geminiHealth.recommendations.products.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {Array.isArray(geminiHealth.recommendations.techniques) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#603E12' }}>Techniques</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#603E12' }}>
                                        {geminiHealth.recommendations.techniques.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {geminiHealth.recommendations.schedule && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#603E12' }}>Maintenance Schedule</p>
                                      <p className="text-sm" style={{ color: '#603E12' }}>{geminiHealth.recommendations.schedule}</p>
                                    </div>
                                  )}
                                </div>
                              </details>
                            )}

                            {/* Damage Assessment */}
                            {hairAnalysis.damage && hairAnalysis.damage.severity !== 'none' && (
                              <div className="rounded-lg p-4" style={{ background: hairAnalysis.damage.severity === 'severe' ? '#fee2e2' : hairAnalysis.damage.severity === 'moderate' ? '#fef3c7' : '#f0fdf4', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-bold mb-2 capitalize" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                                  Damage: {hairAnalysis.damage.severity}
                                </p>
                                {hairAnalysis.damage.damageTypes.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {hairAnalysis.damage.damageTypes.map((type: string, i: number) => (
                                      <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: 'white', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.25)' }}>
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Detected Style */}
                            {hairAnalysis.detectedStyle?.style && (
                            <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                              <p className="text-sm mb-1" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Detected Style
                              </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xl font-bold capitalize" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.detectedStyle.style.replace(/-/g, ' ')}
                          </p>
                                  {typeof hairAnalysis.detectedStyle.confidence === 'number' && (
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#FFFEE1', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.25)' }}>
                                      {Math.round(hairAnalysis.detectedStyle.confidence * 100)}%
                                    </span>
                                  )}
                        </div>
                              </div>
                            )}

                            {/* Color Treatment */}
                            {hairAnalysis.colorTreatment && hairAnalysis.colorTreatment.hasColorTreatment && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Color Treatment
                                </p>
                                <p className="text-lg font-bold capitalize" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                                  {hairAnalysis.colorTreatment.treatmentType}
                                </p>
                              </div>
                            )}

                            {/* Product Residues */}
                            {hairAnalysis.productResidues && hairAnalysis.productResidues.visible && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Products Detected
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {hairAnalysis.productResidues.products.map((product: string, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: '#FFFEE1', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.25)' }}>
                                      {product}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scalp Health */}
                            {hairAnalysis.scalp && hairAnalysis.scalp.visible && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-xs mb-1" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Scalp Visibility
                                </p>
                                {hairAnalysis.scalp.health && (
                                  <p className="text-sm font-semibold capitalize" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.scalp.health}
                                  </p>
                                )}
                                {hairAnalysis.scalp.concerns.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {hairAnalysis.scalp.concerns.map((concern: string, i: number) => (
                                      <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: '#fee2e2', color: '#603E12' }}>
                                        {concern}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Top Features Labels */}
                            {(Array.isArray(hairAnalysis.labels) && hairAnalysis.labels.length > 0) && (
                              <div className="rounded-lg p-4 space-y-2" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-semibold" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Detected Features</p>
                                <div className="flex flex-wrap gap-2">
                                  {hairAnalysis.labels.slice(0, 10).map((l: any, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: '#FFFEE1', color: '#603E12', border: '1px solid rgba(175, 85, 0, 0.25)' }}>
                                      {(l.name || l.description || '').toString()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Dominant Colors */}
                            {(Array.isArray(hairAnalysis.colors) && hairAnalysis.colors.length > 0) && (
                              <div className="rounded-lg p-4 space-y-2" style={{ background: 'white', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                                <p className="text-sm font-semibold" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Dominant Colors</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {hairAnalysis.colors.slice(0, 6).map((c: any, i: number) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 shadow-sm" title={`${Math.round((c.score || 0) * 100)}%`}
                                      style={{ background: `rgb(${c.color?.red || 0}, ${c.color?.green || 0}, ${c.color?.blue || 0})`, borderColor: '#E7B58D' }} />
                                  ))}
                                </div>
                              </div>
                            )}
                        </div>
                      )}

                      {/* Action Buttons - Only show when analysis is complete and not loading routine */}
                      {hairAnalysis && !isAnalyzing && !loading && (
                        <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => {
                        clearScanAndSession();
                        setCurrentStep(2);
                      }}
                            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                      style={{ 
                              background: '#FFFEE1',
                              color: '#603E12',
                              border: '2px solid rgba(175, 85, 0, 0.25)',
                              fontFamily: 'Bricolage Grotesque, sans-serif'
                            }}
                    >
                      Upload Different Photo
                    </button>
                    <button
                      onClick={generateRoutine}
                            className="flex-1 px-8 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            style={{ background: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
            className="flex min-h-0 w-full min-w-0 flex-1 flex-col px-3 pb-1 pt-3 sm:px-5 sm:pt-4 md:px-8 md:pt-5 lg:px-10"
          >
            <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col px-1 sm:px-2 md:px-4">
              <div className="mx-auto mb-3 w-full max-w-4xl shrink-0 text-center sm:mb-4 md:mb-5">
                <h1 className="mb-2 text-2xl font-bold sm:text-3xl md:text-4xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                  Your routine
                </h1>
                <p className="text-base md:text-lg" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Here&apos;s what we recommend based on your profile.
                </p>
              </div>

              <div
                className="relative mt-2 flex min-h-0 max-h-[min(64dvh,calc(100dvh-11.5rem))] flex-1 flex-col overflow-hidden rounded-2xl p-4 sm:mt-3 md:mt-5 md:p-6"
                style={{
                  background: '#FFFFFF',
                  border: '2px solid rgba(175, 85, 0, 0.25)',
                  color: '#603E12',
                }}
              >
                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto overscroll-contain md:gap-5">
                  <div className="mx-auto w-full max-w-4xl space-y-6">
                    <HairCareReferencePhoto src={hairImage} />

                    {/* You can expect — always visible (cream inset, same as metrics) */}
                    <div className="rounded-xl p-4 sm:p-5" style={routinePanelStyle}>
                      <div className="mb-4 flex items-center gap-2 sm:mb-5 sm:gap-3">
                        <TrendingUp size={22} className="shrink-0 sm:h-7 sm:w-7" style={{ color: '#603E12' }} aria-hidden />
                        <h2 className="text-lg font-bold sm:text-xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                          You can expect
                        </h2>
                      </div>
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
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <CheckCircle size={18} className="mt-0.5 shrink-0" style={{ color: '#603E12' }} aria-hidden />
                              <span>{improvement}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Section Navigation */}
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
                      {(['routine', 'maintenance', 'products', 'tips'] as const).map((section) => (
                        <button
                          key={section}
                          type="button"
                          onClick={() => setActiveSection(section)}
                          className={`flex flex-col items-center gap-1.5 rounded-xl p-3 font-semibold transition-all sm:gap-2 sm:p-4 ${
                            activeSection === section ? 'shadow-sm' : ''
                          }`}
                          style={
                            activeSection === section
                              ? { background: '#603E12', color: '#FFFFFF', fontFamily: 'Bricolage Grotesque, sans-serif' }
                              : {
                                  background: 'rgba(255, 254, 225, 0.55)',
                                  color: '#603E12',
                                  border: '2px solid rgba(175, 85, 0, 0.25)',
                                  fontFamily: 'Bricolage Grotesque, sans-serif',
                                }
                          }
                        >
                          {section === 'routine' && <Calendar size={24} className="sm:h-7 sm:w-7" aria-hidden />}
                          {section === 'maintenance' && <Clock size={24} className="sm:h-7 sm:w-7" aria-hidden />}
                          {section === 'products' && <Package size={24} className="sm:h-7 sm:w-7" aria-hidden />}
                          {section === 'tips' && <Lightbulb size={24} className="sm:h-7 sm:w-7" aria-hidden />}
                          <span className="text-xs capitalize sm:text-sm">{section}</span>
                        </button>
                      ))}
                    </div>

              {/* Your Routine Section */}
              {activeSection === 'routine' && (
                <div>
              <div className="relative mb-6 flex h-10 w-full overflow-hidden rounded-full border-2 border-[#603E12] bg-white sm:h-11">
                <motion.div
                  aria-hidden
                  className="absolute inset-y-0 rounded-full bg-[#603E12]"
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
                      color: activeTab === tab ? '#FFFFFF' : '#603E12',
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
                    style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-2">
                      <div
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                        style={{ background: '#603E12', fontFamily: 'Caprasimo, serif' }}
                      >
                        {step.stepNumber}
                      </div>
                      <span
                        className="rounded-full px-2 py-0.5 text-xs font-semibold capitalize"
                        style={getImportancePillStyle(step.importance)}
                      >
                        {step.importance}
                      </span>
                    </div>

                    <h3 className="mb-1 text-base font-semibold leading-snug" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      {step.action}
                    </h3>
                    <p className="mb-3 text-xs" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif', opacity: 0.9 }}>
                      {step.frequency}
                    </p>

                    {step.duration && (
                      <div className="mb-3 flex items-center gap-2" style={{ color: '#3C270C' }}>
                        <Clock size={14} className="shrink-0" aria-hidden />
                        <span className="text-xs" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          {step.duration}
                        </span>
                      </div>
                    )}

                    <div
                      className="mb-3 flex-grow rounded-lg p-3"
                      style={{
                        background: 'rgba(255, 254, 225, 0.43)',
                        border: '1px solid rgba(175, 85, 0, 0.14)',
                      }}
                    >
                      <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                        Why
                      </p>
                      <p className="text-sm leading-snug" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {step.reasoning}
                      </p>
                    </div>

                    {step.product && (
                      <div
                        className="mt-auto flex items-start gap-2 rounded-lg border border-[rgba(175,85,0,0.2)] p-2"
                        style={{ background: 'rgba(255, 254, 225, 0.25)' }}
                      >
                        <Package className="mt-0.5 shrink-0" size={14} style={{ color: '#603E12' }} aria-hidden />
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                            Product
                          </p>
                          <p className="text-xs leading-snug" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {step.product}
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
              )}

              {/* Maintenance Schedule Section */}
              {activeSection === 'maintenance' && (
                <div>
                  <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                    Maintenance schedule
                  </h2>
                  <div className="grid gap-3 md:grid-cols-2 md:gap-4">
                      <div className="rounded-lg p-4" style={{ background: 'rgba(255, 254, 225, 0.43)', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                          Next deep condition
                        </p>
                        <p className="text-lg font-bold" style={metricValueStyle}>
                    {recommendation?.maintenanceSchedule?.nextDeepCondition?.toLocaleDateString()}
                  </p>
                </div>
                      <div className="rounded-lg p-4" style={{ background: 'rgba(255, 254, 225, 0.43)', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                          Next protein treatment
                        </p>
                        <p className="text-lg font-bold" style={metricValueStyle}>
                    {recommendation?.maintenanceSchedule?.nextProteinTreatment?.toLocaleDateString()}
                  </p>
                </div>
                      <div className="rounded-lg p-4" style={{ background: 'rgba(255, 254, 225, 0.43)', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                        <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                          Next trim
                        </p>
                        <p className="text-lg font-bold" style={metricValueStyle}>
                    {recommendation?.maintenanceSchedule?.nextTrim?.toLocaleDateString()}
                  </p>
                </div>
                {recommendation?.maintenanceSchedule?.styleRefresh && (
                        <div className="rounded-lg p-4" style={{ background: 'rgba(255, 254, 225, 0.43)', border: '2px solid rgba(175, 85, 0, 0.25)' }}>
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                            Style refresh
                          </p>
                          <p className="text-lg font-bold" style={metricValueStyle}>
                      {recommendation?.maintenanceSchedule?.styleRefresh?.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
              )}

                {/* Products Section */}
              {activeSection === 'products' && recommendation?.productRecommendations && recommendation?.productRecommendations?.essential?.length > 0 && (
                <div>
                  <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                    Recommended products
                  </h2>
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
                                background: 'rgba(96, 62, 18, 0.1)',
                                color: '#603E12',
                                border: '1px solid rgba(175, 85, 0, 0.25)',
                                fontFamily: 'Bricolage Grotesque, sans-serif',
                              }}
                            >
                              Recommended
                            </span>
                        </div>
                          
                          <h3 className="mb-1 text-lg font-semibold" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.brand}
                          </h3>
                          <p className="mb-3 text-sm" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.name}
                          </p>
                          
                          <div className="mb-3 rounded-lg p-3" style={{ background: 'rgba(255, 254, 225, 0.43)', border: '1px solid rgba(175, 85, 0, 0.14)' }}>
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                              Why we recommend
                            </p>
                            <p className="text-sm leading-snug" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              {product.purpose}
                            </p>
                      </div>

                          <div className="mb-3">
                            <p className="mb-1 text-xs font-semibold uppercase tracking-wide opacity-80" style={metricLabelStyle}>
                              Key benefits
                            </p>
                        <ul className="space-y-1">
                              {product.benefits.slice(0, 2).map((benefit, bidx) => (
                                <li key={bidx} className="flex items-start gap-2 text-xs" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  <span className="text-[#603E12]">•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                          <div className="flex flex-col gap-3 border-t border-[rgba(175,85,0,0.2)] pt-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <p className="text-lg font-bold tabular-nums" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                              </p>
                              <p className="text-xs" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.pricing.size}
                              </p>
                        </div>
                            <button
                              type="button"
                              className="rounded-lg px-4 py-2 text-sm font-semibold text-white transition-opacity hover:opacity-95"
                              style={{ background: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                            >
                          Buy now
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* Tips Section */}
              {activeSection === 'tips' && (
                <div>
                  <h2 className="mb-4 text-xl font-bold sm:mb-6 sm:text-2xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                    Hair care tips
                  </h2>
            <div className="grid gap-4 md:grid-cols-3 md:gap-6">
                      {/* Do's */}
                      <div className="rounded-xl p-5 sm:p-6" style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}>
                <div className="mb-4 flex items-center gap-2">
                          <CheckCircle size={22} className="shrink-0" style={{ color: '#603E12' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                            Do&apos;s
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.dos?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <CheckCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#603E12' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
                      <div className="rounded-xl p-5 sm:p-6" style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}>
                <div className="mb-4 flex items-center gap-2">
                          <AlertCircle size={22} className="shrink-0" style={{ color: '#603E12' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                            Don&apos;ts
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.donts?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <AlertCircle size={16} className="mt-0.5 shrink-0" style={{ color: '#603E12' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tips */}
                      <div className="rounded-xl p-5 sm:p-6" style={routinePanelStyle}>
                <div className="mb-4 flex items-center gap-2">
                  <Lightbulb size={22} className="shrink-0" style={{ color: '#603E12' }} aria-hidden />
                          <h3 className="text-lg font-bold sm:text-xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                            Pro tips
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.proTips?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <Star size={16} className="mt-0.5 shrink-0" style={{ color: '#603E12' }} aria-hidden />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
                  </div>
                </div>
              )}

                  <div className="rounded-xl p-5 text-center sm:p-6" style={routinePanelStyle}>
                    <h3 className="mb-2 text-xl font-bold sm:text-2xl" style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}>
                      Ready to transform your hair?
                    </h3>
                    <p className="mb-6 text-sm sm:text-base" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Start your personalized routine today and see results in weeks.
                    </p>
                    <div className="flex flex-wrap justify-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          clearScanAndSession();
                          setCurrentStep(2);
                        }}
                        className="rounded-xl px-6 py-3 text-sm font-semibold transition-opacity hover:opacity-90 sm:px-8"
                        style={{
                          background: '#FFFFFF',
                          color: '#603E12',
                          border: '2px solid rgba(175, 85, 0, 0.25)',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        Analyze new photo
                      </button>
                      <button
                        type="button"
                        onClick={saveRoutine}
                        className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 sm:px-8"
                        style={{ background: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Save my routine
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          window.location.href = '/dashboard';
                        }}
                        className="rounded-xl px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 sm:px-8"
                        style={{ background: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Go to dashboard
                      </button>
                    </div>
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
            titleStyle={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
            titleStyle={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          />
        </div>
      )}
    </>
  );
}
