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
  Loader,
  ChevronDown,
  ChevronUp,
  User,
  ArrowRight,
} from 'lucide-react';
import type { HairCareProfile, HairCareRecommendation } from '@/lib/hairCare';
import BottomNav from '@/app/components/BottomNav';
import { normalizeUserProfile, PROFILE_VERSION, type UserProfile } from '@/types/userProfile';

export default function HairCarePage() {
  const hasLoadedRoutine = useRef(false);
  const hairPhotoInputRef = useRef<HTMLInputElement>(null);
  const [recommendation, setRecommendation] = useState<HairCareRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hairImage, setHairImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hairAnalysis, setHairAnalysis] = useState<any>(null);
  const [geminiHealth, setGeminiHealth] = useState<any>(null);
  
  // New multi-step state
  const [currentStep, setCurrentStep] = useState(0); // 0=profile check, 1=name/email, 2=upload, 3=analysis, 4=results
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Active section state
  const [activeSection, setActiveSection] = useState<'routine' | 'maintenance' | 'products' | 'tips'>('routine');
  const [isExpectedResultsOpen, setIsExpectedResultsOpen] = useState(false);
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

  // Check for profile on mount and load viewing routine if exists
  useEffect(() => {
    // Check if we're viewing a saved routine via URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const isViewingSaved = urlParams.get('view') === 'saved';
    
    console.log('useEffect running:', { isViewingSaved, url: window.location.href, hasLoadedRoutine: hasLoadedRoutine.current });
    
    if (isViewingSaved && !hasLoadedRoutine.current) {
      // Check localStorage for the routine data
      const viewingRoutine = localStorage.getItem('nywele-viewing-routine');
      console.log('Checking localStorage for routine:', viewingRoutine);
      
      if (viewingRoutine) {
        try {
          const { hairAnalysis, routine, isViewing } = JSON.parse(viewingRoutine);
          if (isViewing) {
            console.log('✅ Loading saved routine...', { hairAnalysis, routine });
            setHairAnalysis(hairAnalysis);
            setRecommendation(routine);
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
        notes: ''
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

  const getImportanceColor = (importance: string) => {
    switch (importance) {
      case 'essential':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'recommended':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'optional':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Debug info
  console.log('HairCarePage render:', { currentStep, hasRecommendation: !!recommendation, hasHairAnalysis: !!hairAnalysis });

  return (
    <>
      <BottomNav />

      <div
        className={`relative min-h-screen ${
          currentStep === 2 && !hairImage ? 'md:pt-14' : 'md:pt-20'
        } ${
          currentStep === 2 && !hairImage
            ? 'flex flex-col max-md:pb-0 md:pb-0'
            : 'pb-24 md:pb-8'
        }`}
        style={{ background: '#FFFEE1' }}
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        `}</style>

        <div
          className={`relative z-10 ${
            currentStep === 2 && !hairImage
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
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" 
                      style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                      Your<br />Personalised<br />African Hair<br />Care Routine
            </h1>
                    <p className="text-xl" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      AI-powered daily, weekly,<br />and monthly care plan for<br />healthier hair
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
                    className="flex w-full max-h-[min(56rem,90dvh)] min-h-[28rem] flex-col overflow-hidden rounded-2xl p-5 md:max-h-none md:flex-none md:min-h-[32rem] md:p-6"
                    style={{
                      background: '#FFFFFF',
                      border: '2px solid rgba(175, 85, 0, 0.25)',
                      color: '#C17208',
                    }}
                  >
                    <div className="flex min-h-0 max-h-full flex-1 flex-col gap-4 overflow-y-auto md:gap-5">
                      <div className="flex w-full flex-1 items-center justify-center py-2 md:py-4">
                        <div
                          className="flex w-full max-w-xs flex-col rounded-2xl p-5 sm:max-w-sm md:max-w-4xl md:p-6"
                          style={{
                            background: '#FFFCF3',
                            border: '1px solid rgba(193, 114, 8, 0.25)',
                          }}
                        >
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

          {/* Step 3: Analysis Results */}
          {currentStep === 3 && hairImage && !recommendation && (
                  <motion.div
              initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
              className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center px-4"
            >
              <div className="rounded-2xl shadow-xl p-12 md:p-16 relative w-full max-w-[1300px]"
                style={{ background: '#FFFEE1', border: '2px solid #914600', minHeight: '750px' }}>
                
                {/* Invisible spacer to maintain container dimensions */}
                <div className="grid md:grid-cols-2 gap-8 w-full" style={{ minHeight: '650px', visibility: 'hidden' }} aria-hidden="true">
                  <div className="flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" 
                      style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                      Your<br />Personalised<br />African Hair<br />Care Routine
                    </h1>
                    <p className="text-xl" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      AI-powered daily, weekly,<br />and monthly care plan for<br />healthier hair
                    </p>
                  </div>
                  <div className="flex flex-col justify-center space-y-6">
                    <div style={{ minHeight: '400px' }}></div>
                  </div>
                </div>
                
                {/* Analysing your hair... loading state (design 8) */}
                {(isAnalyzing || loading) && (
                  <div className="absolute inset-0 flex items-center justify-center z-20 bg-white/95 backdrop-blur-sm rounded-2xl">
                    <div className="text-center max-w-md px-4">
                      <svg className="w-20 h-20 mx-auto mb-4" viewBox="0 0 81 77" fill="none" style={{ color: '#AF5500' }}>
                        <path d="M26.4168 1.50037C26.3153 1.546 18.9202 4.51235 16.9078 5.85052C14.8953 7.18868 12.4202 8.01234 10.9202 9.51236C9.42023 11.0124 8.92019 11.5124 6.92021 14.0124C4.92022 16.5124 3.29872 21.0124 2.42021 24.0124C1.54169 27.0124 1.41483 30.8501 1.54169 33.0124C1.67903 35.3533 2.35945 38.7601 4.92022 43.5124C6.74414 46.8972 11.2442 49.4796 13.8322 49.996C16.4202 50.5124 18.6592 51.5876 27.3516 51.4065C30.5874 51.3391 33.5272 50.3174 37.6659 48.861C42.8112 47.0503 45.8731 45.2287 46.7952 44.6319C49.4202 42.9329 50.6765 40.1097 51.39 37.8C51.9398 36.0201 51.1792 34.1978 50.0834 32.8321C48.2852 30.5912 43.5142 29.5747 38.9202 33.5124C35.4202 36.5124 35.0981 37.9497 33.2465 42.0648C31.0265 46.9984 30.649 50.9027 30.5387 52.7799C30.3967 55.1959 30.8062 57.0755 31.4161 58.8381C32.5781 62.1963 34.0986 64.9976 35.3568 66.8227C38.8309 71.8617 42.3911 73.0787 44.3932 73.7446C47.1911 74.6752 52.6891 73.4 57.825 71.8084C61.138 70.7816 65.6434 68.5963 68.0727 67.405C70.5019 66.2138 70.6566 65.9003 70.7175 65.5417C70.8435 64.7991 70.4997 63.933 69.9976 63.1524C69.7559 62.7767 69.3057 62.6225 68.9462 62.5451C66.9408 62.1136 64.4581 64.1761 63.6793 65.2848C62.124 67.499 65.2366 70.8731 66.8107 72.2277C69.7286 73.768 71.0565 74.011 72.9323 74.0274C74.2194 74.016 76.1871 73.9648 78.5749 73.4734" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                      </svg>
                      <div className="flex items-center justify-center gap-2 mb-6">
                        <Loader className="animate-spin w-5 h-5" style={{ color: '#AF5500' }} />
                        <h3 className="text-xl font-bold" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                          Analysing your hair...
                        </h3>
                      </div>
                      <div className="text-left space-y-2">
                        <p className="flex items-center gap-2 text-sm" style={{ color: '#DD8106' }}><CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" /> Hair type & texture</p>
                        <p className="flex items-center gap-2 text-sm" style={{ color: '#DD8106' }}>... Health & moisture levels</p>
                        <p className="flex items-center gap-2 text-sm" style={{ color: '#DD8106' }}>... Porosity indicators</p>
                        <p className="flex items-center gap-2 text-sm" style={{ color: '#DD8106' }}>... Damage assessment</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Content - positioned absolutely to maintain container size */}
                <div className="absolute inset-12 md:inset-16 flex items-center z-10" style={{ visibility: (isAnalyzing || loading) ? 'hidden' : 'visible' }}>
                  <div className="grid md:grid-cols-2 gap-8 w-full">
                    {/* Left Section - Text only */}
                    <div className="flex flex-col justify-center">
                      <h1 className="text-5xl md:text-6xl font-bold mb-6" 
                        style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                        Your<br />Personalised<br />African Hair<br />Care Routine
                      </h1>
                      <p className="text-xl" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        AI-powered daily, weekly,<br />and monthly care plan for<br />healthier hair
                      </p>
                    </div>

                    {/* Right Section - Analysis Panel without Image */}
                    <div className="flex flex-col justify-center space-y-6 max-h-[80vh] overflow-y-auto pr-2">
                      {hairAnalysis && (
                        /* Analysis Complete */
                        <div className="rounded-xl p-6"
                          style={{ background: '#643100' }}>
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" 
                            style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                            <CheckCircle style={{ color: '#DD8106' }} />
                            Comprehensive Analysis Complete
                            {geminiHealth && <span className="text-xs ml-auto" style={{ color: '#DD8106' }}>✨ Enhanced</span>}
                          </h3>
                          
                          <div className="space-y-4">
                            {/* Debug indicator - remove in production */}
                            {process.env.NODE_ENV === 'development' && (
                              <div className="rounded-lg p-2 text-xs" style={{ background: '#fee2e2', border: '1px solid #dc2626' }}>
                                <p>Debug: geminiHealth = {geminiHealth ? '✅ Set' : '❌ Not set'}</p>
                                <p>hairAnalysis keys: {Object.keys(hairAnalysis || {}).join(', ')}</p>
                              </div>
                            )}
                            
                            {/* Overall Quality Score - Highlighted */}
                            {typeof hairAnalysis.overallQuality === 'number' && (
                              <div className="rounded-lg p-4" style={{ background: 'linear-gradient(135deg, #FFFEE1 0%, #E7B58D 100%)', border: '2px solid #914600' }}>
                                <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Overall Quality Score
                                </p>
                                <p className="text-4xl font-bold" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                  {hairAnalysis.overallQuality}/100
                                </p>
                              </div>
                            )}

                            {/* Primary Metrics Grid */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Hair Type */}
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                Hair Type
                              </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-2xl font-bold" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {(hairAnalysis.hairType?.hairType || hairAnalysis.hairType || 'Unknown').toString().toUpperCase()}
                          </p>
                                  {typeof hairAnalysis.hairType?.confidence === 'number' && (
                                    <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: '#FFFEE1', color: '#DD8106' }}>
                                      {Math.round(hairAnalysis.hairType.confidence * 100)}%
                                    </span>
                                  )}
                        </div>
                              </div>

                              {/* Health Score */}
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Health
                                </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-2xl font-bold" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {(hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 60)}/100
                                  </p>
                                  <span className="text-[10px] px-1.5 py-0.5 rounded-full capitalize" style={{ background: '#FFFEE1', color: '#DD8106' }}>
                                    {healthStatus(hairAnalysis.health?.healthScore ?? hairAnalysis.health?.score)}
                                  </span>
                        </div>
                              </div>

                              {/* Length */}
                              {(hairAnalysis.length || hairAnalysis.extractedCharacteristics?.length) && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                  <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Length
                                  </p>
                                  <p className="text-xl font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.length?.length || hairAnalysis.extractedCharacteristics?.length || 'Unknown'}
                                  </p>
                                </div>
                              )}

                              {/* Density */}
                              {(hairAnalysis.density || hairAnalysis.extractedCharacteristics?.density) && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                  <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Density
                                  </p>
                                  <p className="text-xl font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.density?.density || hairAnalysis.extractedCharacteristics?.density || 'Unknown'}
                                  </p>
                                </div>
                              )}

                              {/* Texture */}
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Texture
                                </p>
                                <p className="text-xl font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                  {hairAnalysis.texture || 
                                   hairAnalysis.extractedCharacteristics?.texture || 
                                   deriveTexture(hairAnalysis) || 
                                   'Unknown'}
                                </p>
                              </div>

                              {/* Volume */}
                              {hairAnalysis.volume && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                  <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Volume
                                  </p>
                                  <p className="text-xl font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.volume.volume}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Condition Metrics */}
                            <div className="grid grid-cols-2 gap-3">
                              {/* Shine */}
                              {hairAnalysis.shine && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                  <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Shine
                                  </p>
                                  <p className="text-lg font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.shine.level}
                                  </p>
                                </div>
                              )}

                              {/* Frizz */}
                              {hairAnalysis.frizz && (
                                <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                  <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Frizz
                                  </p>
                                  <p className="text-lg font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.frizz.level}
                                  </p>
                                </div>
                              )}
                            </div>

                            {/* Gemini Health Score (progress bar) */}
                            {geminiHealth?.healthScore !== undefined && (
                              <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-sm mb-2" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Health Score</p>
                                <div className="w-full h-3 rounded-full" style={{ background: '#FFFEE1', border: '1px solid #E7B58D' }}>
                                  <div
                                    className="h-3 rounded-full"
                                    style={{
                                      width: `${Math.max(0, Math.min(100, geminiHealth.healthScore))}%`,
                                      background: geminiHealth.healthScore >= 70 ? '#16a34a' : geminiHealth.healthScore >= 50 ? '#f59e0b' : '#dc2626',
                                    }}
                                  />
                                </div>
                                <p className="text-xs mt-1" style={{ color: '#DD8106' }}>{geminiHealth.healthScore}/100</p>
                              </div>
                            )}

                            {/* Hair Characteristics (Gemini) */}
                            {geminiHealth && (
                              <div className="rounded-lg p-4 space-y-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-sm font-semibold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Hair Characteristics</p>
                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <p className="text-xs" style={{ color: '#DD8106' }}>Curl Pattern</p>
                                    <p className="text-sm font-semibold capitalize" style={{ color: '#DD8106' }}>{geminiHealth.curlPattern?.type || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs" style={{ color: '#DD8106' }}>Porosity</p>
                                    <p className="text-sm font-semibold capitalize" style={{ color: '#DD8106' }}>{geminiHealth.porosity || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs" style={{ color: '#DD8106' }}>Strand Thickness</p>
                                    <p className="text-sm font-semibold capitalize" style={{ color: '#DD8106' }}>{geminiHealth.strandThickness || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs" style={{ color: '#DD8106' }}>Density</p>
                                    <p className="text-sm font-semibold capitalize" style={{ color: '#DD8106' }}>{geminiHealth.density || 'Unknown'}</p>
                                  </div>
                                  <div>
                                    <p className="text-xs" style={{ color: '#DD8106' }}>Length</p>
                                    <p className="text-sm font-semibold capitalize" style={{ color: '#DD8106' }}>{geminiHealth.length || 'Unknown'}</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Health Indicators (severity color-coded) */}
                            {geminiHealth && (
                              <div className="rounded-lg p-4 space-y-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-sm font-semibold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Health Indicators</p>
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
                                    const severity = typeof val === 'string' ? val.toLowerCase() : '';
                                    const bg = severity.includes('none') || severity.includes('balanced') || severity.includes('well') ? '#dcfce7' : severity.includes('moderate') || severity.includes('dry') || severity.includes('oily') ? '#fef9c3' : '#fee2e2';
                                    return (
                                      <div key={i} className="rounded-md p-2" style={{ background: bg, border: '1px solid #E7B58D' }}>
                                        <p className="text-xs" style={{ color: '#DD8106' }}>{item.label}</p>
                                        <p className="text-sm font-semibold capitalize" style={{ color: '#DD8106' }}>{val || 'Unknown'}</p>
                                      </div>
                                    );
                                  })}
                                  {Array.isArray(geminiHealth.breakagePoints) && (
                                    <div className="rounded-md p-2" style={{ background: '#fef9c3', border: '1px solid #E7B58D' }}>
                                      <p className="text-xs" style={{ color: '#DD8106' }}>Breakage Points</p>
                                      <div className="flex flex-wrap gap-2 mt-1">
                                        {geminiHealth.breakagePoints.map((bp: string, idx: number) => (
                                          <span key={idx} className="text-xs px-2 py-0.5 rounded-full capitalize" style={{ background: 'white', color: '#DD8106', border: '1px solid #E7B58D' }}>{bp}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Recommendations (expandable) */}
                            {geminiHealth?.recommendations && (
                              <details className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                                <summary className="cursor-pointer text-sm font-semibold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Recommendations</summary>
                                <div className="mt-3 space-y-3">
                                  {Array.isArray(geminiHealth.recommendations.immediate) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#DD8106' }}>Immediate Actions</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#DD8106' }}>
                                        {geminiHealth.recommendations.immediate.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {Array.isArray(geminiHealth.recommendations.products) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#DD8106' }}>Product Suggestions</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#DD8106' }}>
                                        {geminiHealth.recommendations.products.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {Array.isArray(geminiHealth.recommendations.techniques) && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#DD8106' }}>Techniques</p>
                                      <ul className="list-disc list-inside text-sm" style={{ color: '#DD8106' }}>
                                        {geminiHealth.recommendations.techniques.map((r: string, i: number) => <li key={i}>{r}</li>)}
                                      </ul>
                                    </div>
                                  )}
                                  {geminiHealth.recommendations.schedule && (
                                    <div>
                                      <p className="text-xs mb-1" style={{ color: '#DD8106' }}>Maintenance Schedule</p>
                                      <p className="text-sm" style={{ color: '#DD8106' }}>{geminiHealth.recommendations.schedule}</p>
                                    </div>
                                  )}
                                </div>
                              </details>
                            )}

                            {/* Damage Assessment */}
                            {hairAnalysis.damage && hairAnalysis.damage.severity !== 'none' && (
                              <div className="rounded-lg p-4" style={{ background: hairAnalysis.damage.severity === 'severe' ? '#fee2e2' : hairAnalysis.damage.severity === 'moderate' ? '#fef3c7' : '#f0fdf4', border: '2px solid #914600' }}>
                                <p className="text-sm font-bold mb-2 capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                  Damage: {hairAnalysis.damage.severity}
                                </p>
                                {hairAnalysis.damage.damageTypes.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {hairAnalysis.damage.damageTypes.map((type: string, i: number) => (
                                      <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: 'white', color: '#DD8106', border: '1px solid #E7B58D' }}>
                                        {type}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Detected Style */}
                            {hairAnalysis.detectedStyle?.style && (
                            <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                              <p className="text-sm mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Detected Style
                              </p>
                                <div className="flex items-baseline gap-2">
                                  <p className="text-xl font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.detectedStyle.style.replace(/-/g, ' ')}
                          </p>
                                  {typeof hairAnalysis.detectedStyle.confidence === 'number' && (
                                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: '#FFFEE1', color: '#DD8106', border: '1px solid #E7B58D' }}>
                                      {Math.round(hairAnalysis.detectedStyle.confidence * 100)}%
                                    </span>
                                  )}
                        </div>
                              </div>
                            )}

                            {/* Color Treatment */}
                            {hairAnalysis.colorTreatment && hairAnalysis.colorTreatment.hasColorTreatment && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Color Treatment
                                </p>
                                <p className="text-lg font-bold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                  {hairAnalysis.colorTreatment.treatmentType}
                                </p>
                              </div>
                            )}

                            {/* Product Residues */}
                            {hairAnalysis.productResidues && hairAnalysis.productResidues.visible && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Products Detected
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {hairAnalysis.productResidues.products.map((product: string, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: '#FFFEE1', color: '#DD8106', border: '1px solid #E7B58D' }}>
                                      {product}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Scalp Health */}
                            {hairAnalysis.scalp && hairAnalysis.scalp.visible && (
                              <div className="rounded-lg p-3" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-xs mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Scalp Visibility
                                </p>
                                {hairAnalysis.scalp.health && (
                                  <p className="text-sm font-semibold capitalize" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                                    {hairAnalysis.scalp.health}
                                  </p>
                                )}
                                {hairAnalysis.scalp.concerns.length > 0 && (
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {hairAnalysis.scalp.concerns.map((concern: string, i: number) => (
                                      <span key={i} className="text-xs px-2 py-1 rounded-full capitalize" style={{ background: '#fee2e2', color: '#DD8106' }}>
                                        {concern}
                                      </span>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Top Features Labels */}
                            {(Array.isArray(hairAnalysis.labels) && hairAnalysis.labels.length > 0) && (
                              <div className="rounded-lg p-4 space-y-2" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-sm font-semibold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Detected Features</p>
                                <div className="flex flex-wrap gap-2">
                                  {hairAnalysis.labels.slice(0, 10).map((l: any, i: number) => (
                                    <span key={i} className="text-xs px-2 py-1 rounded-full" style={{ background: '#FFFEE1', color: '#DD8106', border: '1px solid #E7B58D' }}>
                                      {(l.name || l.description || '').toString()}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Dominant Colors */}
                            {(Array.isArray(hairAnalysis.colors) && hairAnalysis.colors.length > 0) && (
                              <div className="rounded-lg p-4 space-y-2" style={{ background: 'white', border: '2px solid #914600' }}>
                                <p className="text-sm font-semibold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Dominant Colors</p>
                                <div className="flex items-center gap-2 flex-wrap">
                                  {hairAnalysis.colors.slice(0, 6).map((c: any, i: number) => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 shadow-sm" title={`${Math.round((c.score || 0) * 100)}%`}
                                      style={{ background: `rgb(${c.color?.red || 0}, ${c.color?.green || 0}, ${c.color?.blue || 0})`, borderColor: '#E7B58D' }} />
                                  ))}
                                </div>
                              </div>
                            )}
                      </div>
                        </div>
                      )}

                      {/* Action Buttons - Only show when analysis is complete and not loading routine */}
                      {hairAnalysis && !isAnalyzing && !loading && (
                        <div className="flex gap-4 mt-8">
                    <button
                      onClick={() => {
                        setHairImage(null);
                        setHairAnalysis(null);
                              setCurrentStep(2);
                      }}
                            className="flex-1 px-6 py-3 rounded-xl font-semibold transition-all"
                      style={{ 
                              background: '#FFFEE1',
                              color: '#DD8106',
                              border: '2px solid #914600',
                              fontFamily: 'Bricolage Grotesque, sans-serif'
                            }}
                    >
                      Upload Different Photo
                    </button>
                    <button
                      onClick={generateRoutine}
                            className="flex-1 px-8 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                            style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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

          {/* Step 4: Routine Results */}
          {(() => {
            const shouldShowStep4 = currentStep === 4 && recommendation;
            console.log('Step 4 check:', { currentStep, hasRecommendation: !!recommendation, shouldShowStep4 });
            return shouldShowStep4;
          })() && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              className="max-w-7xl mx-auto space-y-8"
          >
            {/* Header */}
              <div className="text-center">
                <h1 className="text-5xl font-bold mb-2" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                  Your Personalised<br />African Hair Care Routine
              </h1>
                <p className="text-xl" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                AI-powered daily, weekly, and monthly care plan for healthier hair
              </p>
                </div>

              {/* You Can Expect Section */}
              <div className="rounded-2xl shadow-xl overflow-hidden text-white"
                style={{ 
                  background: 'linear-gradient(135deg, #643100 0%, #AF5500 100%)'
                }}>
              <button
                onClick={() => setIsExpectedResultsOpen(!isExpectedResultsOpen)}
                className="w-full p-6 flex items-center justify-between hover:opacity-90 transition-opacity"                                                    
              >
                <div className="flex items-center gap-3">
                <TrendingUp size={28} />
                    <h2 className="text-2xl font-bold" style={{ fontFamily: 'Caprasimo, serif' }}>
                      You Can Expect
                    </h2>
              </div>
                <ChevronDown
                  size={28}
                  className={`transform transition-transform ${isExpectedResultsOpen ? 'rotate-180' : ''}`}                                                     
                />
              </button>
              
              {isExpectedResultsOpen && (
                <div className="px-6 pb-6">
                    <div className="grid md:grid-cols-2 gap-6 mb-4">
                <div>
                        <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Timeline
                        </p>
                        <p className="text-xl font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          {recommendation?.expectedResults?.timeline}
                        </p>
                </div>
                <div>
                        <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Health Improvement
                        </p>
                        <p className="text-xl font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    +{recommendation?.expectedResults?.metrics?.healthImprovement}%
                  </p>
                </div>
              </div>
                    <div>
                      <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        You can expect:
                      </p>
                <ul className="space-y-2">
                  {recommendation?.expectedResults?.improvements?.map((improvement, idx) => (
                          <li key={idx} className="flex items-start gap-2" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            <CheckCircle size={20} className="mt-0.5 flex-shrink-0" />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
              )}
            </div>

              {/* Section Navigation Tabs */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['routine', 'maintenance', 'products', 'tips'].map((section) => (
                  <button
                    key={section}
                    onClick={() => setActiveSection(section as any)}
                    className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                      activeSection === section ? 'shadow-lg' : ''
                    }`}
                    style={
                      activeSection === section
                        ? { background: '#643100', color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }
                        : { background: '#FFFEE1', color: '#DD8106', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }
                    }
                  >
                    {section === 'routine' && <Calendar size={28} />}
                    {section === 'maintenance' && <Clock size={28} />}
                    {section === 'products' && <Package size={28} />}
                    {section === 'tips' && <Lightbulb size={28} />}
                    <span className="text-sm capitalize">{section}</span>
                  </button>
                ))}
              </div>

              {/* Content Area */}
              <div className="rounded-2xl shadow-xl p-6" 
                style={{ background: '#FFFEE1', border: '2px solid #914600' }}>
              {/* Your Routine Section */}
              {activeSection === 'routine' && (
                <div>
              <div className="flex gap-4 mb-6">
                {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                            activeTab === tab ? 'text-white shadow-lg' : ''
                    }`}
                    style={
                      activeTab === tab 
                              ? { background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' } 
                              : { background: 'rgba(206, 147, 95, 0.2)', color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }
                    }
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                    {recommendation?.personalizedRoutine?.[tab]?.length || 0} steps)
                  </button>
                ))}
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendation?.personalizedRoutine?.[activeTab]?.map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl p-4 hover:shadow-lg transition-all flex flex-col h-full"
                          style={{ background: 'white', border: '2px solid #914600' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0"
                              style={{ background: '#643100', fontFamily: 'Caprasimo, serif' }}>
                        {step.stepNumber}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getImportanceColor(
                          step.importance
                        )}`}
                              style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {step.importance}
                      </span>
                    </div>

                          <h3 className="text-lg font-bold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {step.action}
                          </h3>
                          <p className="text-xs mb-3" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {step.frequency}
                          </p>

                    {step.duration && (
                      <div className="flex items-center gap-2 mb-3" style={{ color: '#DD8106' }}>
                        <Clock size={14} />
                              <span className="text-xs" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {step.duration}
                              </span>
                      </div>
                    )}

                          <div className="rounded-lg p-3 mb-3 flex-grow" 
                            style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Why:
                            </p>
                            <p className="text-sm" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              {step.reasoning}
                            </p>
                    </div>

                    {step.product && (
                            <div className="flex items-start gap-2 rounded-lg p-2 mt-auto" 
                              style={{ background: 'rgba(145, 70, 0, 0.1)' }}>
                        <Package className="flex-shrink-0 mt-0.5" size={14} style={{ color: '#DD8106' }} />
                        <div>
                                <p className="text-xs font-semibold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Product
                                </p>
                                <p className="text-xs" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                      Maintenance Schedule
                    </h2>
              <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Next Deep Condition
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {recommendation?.maintenanceSchedule?.nextDeepCondition?.toLocaleDateString()}
                  </p>
                </div>
                      <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Next Protein Treatment
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {recommendation?.maintenanceSchedule?.nextProteinTreatment?.toLocaleDateString()}
                  </p>
                </div>
                      <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Next Trim
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {recommendation?.maintenanceSchedule?.nextTrim?.toLocaleDateString()}
                  </p>
                </div>
                {recommendation?.maintenanceSchedule?.styleRefresh && (
                        <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                          <p className="text-sm font-semibold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Style Refresh
                          </p>
                          <p className="text-lg font-bold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                      Recommended Products
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {recommendation?.productRecommendations?.essential?.slice(0, 3).map((product, idx) => (
                        <div key={idx} className="rounded-xl p-5 transition-all hover:shadow-lg"
                          style={{ background: 'white', border: '2px solid #914600' }}>
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: '#AF5500', color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Recommended
                            </span>
                        </div>
                          
                          <h3 className="text-lg font-bold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.brand}
                          </h3>
                          <p className="text-sm mb-3" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.name}
                          </p>
                          
                          <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(145, 70, 0, 0.1)' }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Why we recommend:
                            </p>
                            <p className="text-sm" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              {product.purpose}
                            </p>
                      </div>

                          <div className="mb-3">
                            <p className="text-xs font-semibold mb-1" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Key Benefits:
                            </p>
                        <ul className="space-y-1">
                              {product.benefits.slice(0, 2).map((benefit, bidx) => (
                                <li key={bidx} className="flex items-start gap-2 text-xs" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  <span>•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(145, 70, 0, 0.3)' }}>
                            <div>
                              <p className="text-lg font-bold" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                              </p>
                              <p className="text-xs" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.pricing.size}
                              </p>
                        </div>
                            <button className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                              style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Buy Now
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
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                      Hair Care Tips
                    </h2>
            <div className="grid md:grid-cols-3 gap-6">
                      {/* Do's */}
                      <div className="rounded-2xl shadow-xl p-6" style={{ background: 'white', border: '2px solid #914600' }}>
                <div className="flex items-center gap-2 mb-4">
                          <CheckCircle size={24} style={{ color: '#DD8106' }} />
                          <h3 className="text-xl font-bold" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                            Do's
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.dos?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#DD8106' }} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
                      <div className="rounded-2xl shadow-xl p-6" style={{ background: 'white', border: '2px solid #914600' }}>
                <div className="flex items-center gap-2 mb-4">
                          <AlertCircle size={24} style={{ color: '#DD8106' }} />
                          <h3 className="text-xl font-bold" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                            Don'ts
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.donts?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#DD8106' }} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tips */}
                      <div className="rounded-2xl shadow-xl p-6 text-white" 
                        style={{ background: 'linear-gradient(135deg, #643100 0%, #AF5500 100%)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={24} />
                          <h3 className="text-xl font-bold" style={{ fontFamily: 'Caprasimo, serif' }}>
                            Pro Tips
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.proTips?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <Star size={16} className="mt-0.5 flex-shrink-0" />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
                  </div>
                </div>
              )}
            </div>

            {/* CTA */}
              <div className="rounded-2xl shadow-xl p-8 text-white text-center"
                style={{ background: 'linear-gradient(135deg, #643100 0%, #AF5500 100%)' }}>
                <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Caprasimo, serif' }}>
                  Ready to transform your hair?
                </h3>
                <p className="mb-6" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Start your personalized routine today and see results in weeks!
                </p>
                <div className="flex gap-4 justify-center flex-wrap">
                <button 
                  onClick={() => {
                    setRecommendation(null);
                    setHairImage(null);
                    setHairAnalysis(null);
                      setCurrentStep(2);
                  }}
                  className="px-8 py-3 text-white rounded-xl font-semibold transition-all border-2"
                    style={{ background: 'rgba(255, 255, 255, 0.2)', borderColor: 'white', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Analyze New Photo
                </button>
                <button 
                  onClick={saveRoutine}
                  className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" 
                    style={{ background: 'white', color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Save My Routine
                </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" 
                    style={{ background: 'white', color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Go to Dashboard
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
    </>
  );
}
