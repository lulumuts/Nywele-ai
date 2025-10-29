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
import Navbar from '@/app/components/Navbar';

export default function HairCarePage() {
  const hasLoadedRoutine = useRef(false);
  const [recommendation, setRecommendation] = useState<HairCareRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hairImage, setHairImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hairAnalysis, setHairAnalysis] = useState<any>(null);
  
  // New multi-step state
  const [currentStep, setCurrentStep] = useState(0); // 0=profile check, 1=name/email, 2=upload, 3=analysis, 4=results
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  
  // Active section state
  const [activeSection, setActiveSection] = useState<'routine' | 'maintenance' | 'products' | 'tips'>('routine');
  const [isExpectedResultsOpen, setIsExpectedResultsOpen] = useState(false);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

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
      const parsedProfile = JSON.parse(profile);
      setUserName(parsedProfile.name);
      setUserEmail(parsedProfile.email);
      setCurrentStep(2);
    }
  }, []);

  const handleNameEmailSubmit = () => {
    if (!userName.trim() || !userEmail.trim()) {
      alert('Please enter both name and email');
      return;
    }
    
    // Create basic profile
    const basicProfile = {
      name: userName,
      email: userEmail,
      hairType: '4c', // Default, will be detected
      hairGoals: ['moisture', 'growth'],
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
    const profile = JSON.parse(storedProfile);
      console.log('Parsed profile:', profile);

    const newRoutine = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      hairAnalysis: hairAnalysis,
      routine: recommendation,
      notes: ''
    };

    if (!profile.savedRoutines) {
      profile.savedRoutines = [];
    }
      profile.savedRoutines.unshift(newRoutine);

    localStorage.setItem('nywele-user-profile', JSON.stringify(profile));
      console.log('Routine saved successfully. Total routines:', profile.savedRoutines.length);

      alert('✅ Routine saved successfully! View it in your profile.');
    } catch (error) {
      console.error('Error saving routine:', error);
      alert('❌ Error saving routine. Please try again.');
    }
  };

  const handleHairPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
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
            setHairAnalysis(result.data);
            console.log('✅ Hair analysis complete:', result.data);
          } else {
            console.warn('⚠️ Analysis failed, using defaults');
            setHairAnalysis({
              hairType: { hairType: '4c', texture: 'coily', confidence: 0.8 },
              health: { healthScore: 65, indicators: [] },
              detectedStyle: { style: 'natural', confidence: 0.5 }
            });
          }
        } catch (error) {
          console.error('❌ Analysis error:', error);
          setHairAnalysis({
            hairType: { hairType: '4c', texture: 'coily', confidence: 0.8 },
            health: { healthScore: 65, indicators: [] },
            detectedStyle: { style: 'natural', confidence: 0.5 }
          });
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
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
          type: hairAnalysis.hairType?.hairType || hairAnalysis.hairType || '4c',
          health: hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 65,
          texture: hairAnalysis.hairType?.texture || hairAnalysis.texture || 'coily',
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
        goals: ['growth', 'moisture', 'strength'],
        concerns: hairAnalysis.concerns || ['dryness'],
        lifestyle: {
          activity: 'moderate',
          climate: 'dry',
          budget: { min: 2000, max: 5000 },
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
      <Navbar />
      <div className="min-h-screen relative" style={{ background: '#FDF4E8' }}>
        {/* Wavy Background Pattern */}
        <div style={{
          position: 'fixed',
          width: '150vmax',
          height: '150vmax',
          left: '27%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(10deg)',
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='500' height='1024' viewBox='0 0 500 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M136.159 -64.5C495.422 135 532.329 334.5 246.879 534C-38.5715 733.5 -75.4781 933 136.159 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M149.069 -64.5C495.646 135 526.209 334.5 240.759 534C-44.6907 733.5 -75.2541 933 149.069 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M162.277 -64.5C496.167 135 520.387 334.5 234.937 534C-50.5129 733.5 -74.7329 933 162.277 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M175.761 -64.5C496.964 135 514.841 334.5 229.391 534C-56.0589 733.5 -73.9356 933 175.761 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M189.502 -64.5C498.019 135 509.552 334.5 224.102 534C-61.3482 733.5 -72.8815 933 189.502 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M203.482 -64.5C499.312 135 504.502 334.5 219.052 534C-66.3979 733.5 -71.5879 933 203.482 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M217.686 -64.5C500.829 135 499.676 334.5 214.226 534C-71.224 733.5 -70.0707 933 217.686 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M232.099 -64.5C502.556 135 495.059 334.5 209.609 534C-75.841 733.5 -68.3444 933 232.099 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M246.708 -64.5C504.478 135 490.638 334.5 205.188 534C-80.2623 733.5 -66.4223 933 246.708 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M261.5 -64.5C506.583 135 486.4 334.5 200.95 534C-84.4999 733.5 -64.3166 933 261.5 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M276.465 -64.5C508.862 135 482.335 334.5 196.885 534C-88.5651 733.5 -62.0384 933 276.465 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M291.592 -64.5C511.302 135 478.432 334.5 192.982 534C-92.4681 733.5 -59.5981 933 291.592 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M306.871 -64.5C513.895 135 474.681 334.5 189.231 534C-96.2186 733.5 -57.0052 933 306.871 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M322.295 -64.5C516.631 135 471.075 334.5 185.625 534C-99.8252 733.5 -54.2686 933 322.295 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M337.854 -64.5C519.504 135 467.604 334.5 182.154 534C-103.296 733.5 -51.3962 933 337.854 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M353.541 -64.5C522.504 135 464.261 334.5 178.811 534C-106.639 733.5 -48.3956 933 353.541 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M369.345 -64.5C525.622 135 461.035 334.5 175.585 534C-109.865 733.5 -45.2779 933 369.345 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M385.268 -64.5C528.858 135 457.928 334.5 172.478 534C-112.972 733.5 -42.0421 933 385.268 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M401.299 -64.5C532.202 135 454.929 334.5 169.479 534C-115.971 733.5 -38.6976 933 401.299 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M417.433 -64.5C535.65 135 452.033 334.5 166.583 534C-118.867 733.5 -35.25 933 417.433 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M433.665 -64.5C539.195 135 449.235 334.5 163.785 534C-121.665 733.5 -31.7046 933 433.665 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M449.991 -64.5C542.834 135 446.531 334.5 161.081 534C-124.369 733.5 -28.0661 933 449.991 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M466.404 -64.5C546.561 135 443.914 334.5 158.464 534C-126.986 733.5 -24.3393 933 466.404 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }} />

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
          
          @keyframes blob-pulse {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -50%) scale(1.05); }
          }
        `}</style>

        <div className="relative z-10 px-4 py-12">
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
                style={{ background: '#FDF4E8', border: '2px solid #914600' }}
            >
              <div className="text-center">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: '#643100' }}>
                    <User size={32} style={{ color: '#FFFFFF' }} />
                </div>
                  <h3 className="text-3xl font-bold mb-2" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                    Create Your Profile
                </h3>
                  <p className="mb-8" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Get personalized hair care recommendations and save your routines.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                      onClick={() => window.location.href = '/register'}
                      className="w-full py-4 text-white rounded-2xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                      style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                      Let's Start
                    <ArrowRight size={20} />
                  </button>
                  <button
                      onClick={() => { setShowProfilePrompt(false); setCurrentStep(2); }}
                      className="w-full py-3 rounded-2xl font-semibold transition-all"
                      style={{ border: '2px solid #914600', color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
                style={{ background: '#FDF4E8', border: '2px solid #914600' }}>
                <div className="grid md:grid-cols-2 gap-12 w-full">
                  {/* Left Section */}
                  <div className="flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" 
                      style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Your<br />Personalised<br />African Hair<br />Care Routine
            </h1>
                    <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      AI-powered daily, weekly,<br />and monthly care plan for<br />healthier hair
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
                          style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                          style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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

          {/* Step 2: Photo Upload */}
          {currentStep === 2 && !hairImage && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center px-4"
            >
              <div className="rounded-2xl shadow-xl p-12 md:p-16 min-h-[750px] flex items-center w-full max-w-[1300px]"
                style={{ background: '#FDF4E8', border: '2px solid #914600' }}>
                <div className="grid md:grid-cols-2 gap-12 w-full">
                  {/* Left Section */}
                  <div className="flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" 
                      style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Your<br />Personalised<br />African Hair<br />Care Routine
                    </h1>
                    <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      AI-powered daily, weekly,<br />and monthly care plan for<br />healthier hair
                    </p>
                  </div>

                  {/* Right Section - Upload */}
                  <div className="flex flex-col justify-center">
                    <div className="text-center mb-8">
                      <Camera className="w-24 h-24 mx-auto mb-6" style={{ color: '#643100' }} />
                      <h2 className="text-3xl font-bold mb-3" 
                        style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                        Let's Analyse Your Hair
              </h2>
                      <p className="text-lg" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Upload a clear photo of your hair for AI-powered analysis
              </p>
            </div>

                    <label className="flex flex-col items-center justify-center w-full h-80 border-2 border-dashed rounded-xl cursor-pointer transition-all hover:bg-opacity-50"
                      style={{ borderColor: '#914600', background: 'rgba(206, 147, 95, 0.1)' }}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-20 h-20 mb-4" style={{ color: '#914600' }} />
                        <p className="mb-3 text-base" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                        <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          PNG, JPG or JPEG (MAX. 10MB)
                        </p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleHairPhotoUpload}
                    disabled={isAnalyzing}
                  />
                </label>
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
                style={{ background: '#FDF4E8', border: '2px solid #914600', minHeight: '750px' }}>
                
                {/* Invisible spacer to maintain container dimensions */}
                <div className="grid md:grid-cols-2 gap-8 w-full" style={{ minHeight: '650px', visibility: 'hidden' }} aria-hidden="true">
                  <div className="flex flex-col justify-center">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6" 
                      style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Your<br />Personalised<br />African Hair<br />Care Routine
                    </h1>
                    <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      AI-powered daily, weekly,<br />and monthly care plan for<br />healthier hair
                    </p>
                  </div>
                  <div className="flex flex-col justify-center space-y-6">
                    <div style={{ minHeight: '400px' }}></div>
                  </div>
                </div>
                
                {/* Centered Loader Overlay */}
                {(isAnalyzing || loading) && (
                  <div className="absolute inset-0 flex items-center justify-center z-20">
                    <div style={{ position: 'relative', width: '300px', height: '300px' }}>
                      {/* Outer Blob - Stroke Only */}
                      <svg 
                        style={{ 
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          animation: 'blob-pulse 2s ease-in-out infinite',
                          width: '240px',
                          height: '240px',
                          overflow: 'visible',
                          opacity: 0.3
                        }}
                        viewBox="0 0 620 603" 
                        fill="none"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path 
                          fillRule="evenodd" 
                          clipRule="evenodd" 
                          d="M336.327 1.48572C414.231 9.60864 473.115 66.7872 518.604 130.55C574.65 209.11 638.43 296.033 612.844 389.082C584.309 492.855 495.991 583.359 389.609 599.667C291.749 614.669 219.14 525.124 143.712 460.998C79.7729 406.64 -0.331203 353.001 0.761041 269.085C1.81384 188.2 85.2711 142.397 148.515 91.962C205.675 46.3795 263.612 -6.09616 336.327 1.48572Z" 
                          stroke="#643100" 
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>

                      {/* Middle Blob - Stroke Only */}
                      <svg 
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          animation: 'blob-pulse 2s ease-in-out infinite 0.3s',
                          width: '240px',
                          height: '240px',
                          overflow: 'visible',
                          opacity: 0.5
                        }}
                        viewBox="0 0 604 606" 
                        fill="none"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path 
                          fillRule="evenodd" 
                          clipRule="evenodd" 
                          d="M377.17 5.77053C452.755 26.3143 501.678 92.217 536.323 162.465C579.008 249.014 627.981 345.062 587.766 432.786C542.917 530.62 441.195 605.745 333.575 604.736C234.577 603.807 177.311 503.753 113.175 428.333C58.8083 364.4 -11.6287 298.579 2.94255 215.931C16.9875 136.267 106.724 104.48 177.255 64.8706C241 29.0722 306.62 -13.4049 377.17 5.77053Z" 
                          stroke="#643100" 
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>

                      {/* Inner Blob - Stroke Only */}
                      <svg 
                        style={{
                          position: 'absolute',
                          left: '50%',
                          top: '50%',
                          transform: 'translate(-50%, -50%)',
                          animation: 'blob-pulse 2s ease-in-out infinite 0.6s',
                          width: '240px',
                          height: '240px',
                          overflow: 'visible',
                          opacity: 0.7
                        }}
                        viewBox="0 0 624 605" 
                        fill="none"
                        preserveAspectRatio="xMidYMid meet"
                      >
                        <path 
                          fillRule="evenodd" 
                          clipRule="evenodd" 
                          d="M390.524 3.70487C463.396 17.8137 515.846 77.3794 554.759 140.765C602.232 218.935 657.832 306.799 638.118 397.175C615.532 500.107 533.028 589.582 428.839 602.686C333.506 614.635 256.959 528.525 178.009 468.089C109.669 416.261 23.8254 368.185 7.61277 286.486C-7.94113 207.589 65.6438 152.13 128.074 97.3488C184.523 47.5069 322.675 -9.48221 390.524 3.70487Z" 
                          stroke="#643100" 
                          strokeWidth="2"
                          fill="none"
                        />
                      </svg>

                      {/* Loading Text */}
                      <div style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center'
                      }}>
                        <span className="text-2xl font-bold" 
                          style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                          Loading...
                        </span>
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
                        style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                        Your<br />Personalised<br />African Hair<br />Care Routine
                      </h1>
                      <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        AI-powered daily, weekly,<br />and monthly care plan for<br />healthier hair
                      </p>
                    </div>

                    {/* Right Section - Analysis Panel without Image */}
                    <div className="flex flex-col justify-center space-y-6">
                      {hairAnalysis && (
                        /* Analysis Complete */
                        <div className="rounded-xl p-6"
                          style={{ background: '#643100' }}>
                          <h3 className="text-lg font-bold mb-4 flex items-center gap-2" 
                            style={{ color: '#FDF4E8', fontFamily: 'Caprasimo, serif' }}>
                            <CheckCircle style={{ color: '#FDF4E8' }} />
                        Analysis Complete
                      </h3>
                          <div className="space-y-4">
                            <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                              <p className="text-sm mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                Hair Type
                              </p>
                              <p className="text-3xl font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            {hairAnalysis.hairType?.hairType || hairAnalysis.hairType || '4c'}
                          </p>
                        </div>
                            <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                              <p className="text-sm mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                Health Score
                              </p>
                              <p className="text-3xl font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            {hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 65}/100
                          </p>
                        </div>
                            <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                              <p className="text-sm mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                Texture
                              </p>
                              <p className="text-3xl font-bold capitalize" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            {hairAnalysis.hairType?.texture || hairAnalysis.texture || 'coily'}
                          </p>
                        </div>
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
                              background: '#FDF4E8',
                              color: '#914600',
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
                <h1 className="text-5xl font-bold mb-2" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                  Your Personalised<br />African Hair Care Routine
              </h1>
                <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                        ? { background: '#643100', color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif' }
                        : { background: '#FDF4E8', color: '#914600', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }
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
                style={{ background: '#FDF4E8', border: '2px solid #914600' }}>
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
                              : { background: 'rgba(206, 147, 95, 0.2)', color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }
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

                          <h3 className="text-lg font-bold mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {step.action}
                          </h3>
                          <p className="text-xs mb-3" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {step.frequency}
                          </p>

                    {step.duration && (
                      <div className="flex items-center gap-2 mb-3" style={{ color: '#914600' }}>
                        <Clock size={14} />
                              <span className="text-xs" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {step.duration}
                              </span>
                      </div>
                    )}

                          <div className="rounded-lg p-3 mb-3 flex-grow" 
                            style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
                            <p className="text-xs font-semibold mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Why:
                            </p>
                            <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              {step.reasoning}
                            </p>
                    </div>

                    {step.product && (
                            <div className="flex items-start gap-2 rounded-lg p-2 mt-auto" 
                              style={{ background: 'rgba(145, 70, 0, 0.1)' }}>
                        <Package className="flex-shrink-0 mt-0.5" size={14} style={{ color: '#914600' }} />
                        <div>
                                <p className="text-xs font-semibold" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  Product
                                </p>
                                <p className="text-xs" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Maintenance Schedule
                    </h2>
              <div className="grid md:grid-cols-2 gap-4">
                      <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Next Deep Condition
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {recommendation?.maintenanceSchedule?.nextDeepCondition?.toLocaleDateString()}
                  </p>
                </div>
                      <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Next Protein Treatment
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {recommendation?.maintenanceSchedule?.nextProteinTreatment?.toLocaleDateString()}
                  </p>
                </div>
                      <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Next Trim
                        </p>
                        <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {recommendation?.maintenanceSchedule?.nextTrim?.toLocaleDateString()}
                  </p>
                </div>
                {recommendation?.maintenanceSchedule?.styleRefresh && (
                        <div className="rounded-lg p-4" style={{ background: 'white', border: '2px solid #914600' }}>
                          <p className="text-sm font-semibold mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Style Refresh
                          </p>
                          <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Recommended Products
                    </h2>
                    <div className="grid md:grid-cols-3 gap-4">
                      {recommendation?.productRecommendations?.essential?.slice(0, 3).map((product, idx) => (
                        <div key={idx} className="rounded-xl p-5 transition-all hover:shadow-lg"
                          style={{ background: 'white', border: '2px solid #914600' }}>
                          <div className="mb-3">
                            <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                              style={{ background: '#AF5500', color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Recommended
                            </span>
                        </div>
                          
                          <h3 className="text-lg font-bold mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.brand}
                          </h3>
                          <p className="text-sm mb-3" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {product.name}
                          </p>
                          
                          <div className="rounded-lg p-3 mb-3" style={{ background: 'rgba(145, 70, 0, 0.1)' }}>
                            <p className="text-sm font-semibold mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Why we recommend:
                            </p>
                            <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              {product.purpose}
                            </p>
                      </div>

                          <div className="mb-3">
                            <p className="text-xs font-semibold mb-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Key Benefits:
                            </p>
                        <ul className="space-y-1">
                              {product.benefits.slice(0, 2).map((benefit, bidx) => (
                                <li key={bidx} className="flex items-start gap-2 text-xs" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  <span>•</span>
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                          <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(145, 70, 0, 0.3)' }}>
                            <div>
                              <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                              </p>
                              <p className="text-xs" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                    <h2 className="text-2xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Hair Care Tips
                    </h2>
            <div className="grid md:grid-cols-3 gap-6">
                      {/* Do's */}
                      <div className="rounded-2xl shadow-xl p-6" style={{ background: 'white', border: '2px solid #914600' }}>
                <div className="flex items-center gap-2 mb-4">
                          <CheckCircle size={24} style={{ color: '#643100' }} />
                          <h3 className="text-xl font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Do's
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.dos?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <CheckCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#643100' }} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
                      <div className="rounded-2xl shadow-xl p-6" style={{ background: 'white', border: '2px solid #914600' }}>
                <div className="flex items-center gap-2 mb-4">
                          <AlertCircle size={24} style={{ color: '#643100' }} />
                          <h3 className="text-xl font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Don'ts
                          </h3>
                </div>
                <ul className="space-y-3">
                  {recommendation?.tips?.donts?.map((tip, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#643100' }} />
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
                    style={{ background: 'white', color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Save My Routine
                </button>
                  <button 
                    onClick={() => window.location.href = '/dashboard'}
                    className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" 
                    style={{ background: 'white', color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
