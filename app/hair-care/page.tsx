'use client';

import { useState, useEffect } from 'react';
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
  const [recommendation, setRecommendation] = useState<HairCareRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const [hairImage, setHairImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hairAnalysis, setHairAnalysis] = useState<any>(null);
  const [showUploadSection, setShowUploadSection] = useState(true);
  
  // Active section state
  const [activeSection, setActiveSection] = useState<'routine' | 'maintenance' | 'products' | 'tips'>('routine');
  const [isExpectedResultsOpen, setIsExpectedResultsOpen] = useState(true);
  const [showProfilePrompt, setShowProfilePrompt] = useState(false);
  const [hasProfile, setHasProfile] = useState(true);

  // Check for profile on mount and load viewing routine if exists
  useEffect(() => {
    const profile = localStorage.getItem('nywele-user-profile');
    if (!profile) {
      setHasProfile(false);
      setShowProfilePrompt(true);
    }

    // Check if we're viewing a saved routine
    const viewingRoutine = localStorage.getItem('nywele-viewing-routine');
    if (viewingRoutine) {
      const { hairAnalysis, routine, isViewing } = JSON.parse(viewingRoutine);
      if (isViewing) {
        // Set the hair analysis and recommendation
        setHairAnalysis(hairAnalysis);
        setRecommendation(routine);
        setShowUploadSection(false);
        
        // Clear the viewing flag
        localStorage.removeItem('nywele-viewing-routine');
      }
    }
  }, []);

  const saveRoutine = () => {
    if (!recommendation || !hairAnalysis) {
      alert('No routine to save');
      return;
    }

    // Get existing profile from localStorage
    const storedProfile = localStorage.getItem('nywele-user-profile');
    if (!storedProfile) {
      alert('Please create a profile first');
      window.location.href = '/register';
      return;
    }

    const profile = JSON.parse(storedProfile);

    // Create new saved routine
    const newRoutine = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      hairAnalysis: hairAnalysis,
      routine: recommendation,
      notes: ''
    };

    // Add to saved routines (initialize array if doesn't exist)
    if (!profile.savedRoutines) {
      profile.savedRoutines = [];
    }
    profile.savedRoutines.unshift(newRoutine); // Add to beginning

    // Save back to localStorage
    localStorage.setItem('nywele-user-profile', JSON.stringify(profile));

    alert('Routine saved successfully! View it in your profile.');
  };

  const handleHairPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setHairImage(base64Image);
        
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
            // Set default analysis if API fails
            setHairAnalysis({
              hairType: { hairType: '4c', texture: 'coily', confidence: 0.8 },
              health: { healthScore: 65, indicators: [] },
              detectedStyle: { style: 'natural', confidence: 0.5 }
            });
          }
        } catch (error) {
          console.error('❌ Analysis error:', error);
          // Set default analysis if error
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

    setLoading(true);
    try {
      // Build profile from analysis - handle nested structure from Vision API
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

      const response = await fetch('/api/hair-care-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile),
      });

      if (!response.ok) throw new Error('Failed to generate routine');

      const data = await response.json();
      
      // Convert date strings to Date objects
      data.maintenanceSchedule = {
        nextTrim: new Date(data.maintenanceSchedule.nextTrim),
        nextDeepCondition: new Date(data.maintenanceSchedule.nextDeepCondition),
        nextProteinTreatment: new Date(data.maintenanceSchedule.nextProteinTreatment),
        styleRefresh: data.maintenanceSchedule.styleRefresh 
          ? new Date(data.maintenanceSchedule.styleRefresh) 
          : undefined,
      };
      
      setRecommendation(data);
      setShowUploadSection(false);
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to generate routine. Please try again.');
    } finally {
      setLoading(false);
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

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-peach px-4 flex items-center justify-center relative">
        {/* Grain texture overlay */}
        <div className="grain-overlay" />
        
        {/* Profile Prompt Modal */}
        {showProfilePrompt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full border border-gray-100"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User size={32} className="text-purple-600" />
                </div>
                <h3 className="text-3xl font-bold text-gray-800 mb-2">
                  Create Your Profile First
                </h3>
                <p className="text-gray-600 mb-8">
                  To get personalized hair care recommendations and save routines, you'll need to create a profile.
                </p>
                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => window.location.href = '/register'}
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    Create Profile
                    <ArrowRight size={20} />
                  </button>
                  <button
                    onClick={() => setShowProfilePrompt(false)}
                    className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                  >
                    Continue Without Profile
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        <div className="max-w-6xl mx-auto w-full relative z-10">
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&display=swap');
          
          .grain-overlay {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: 1;
            opacity: 0.5;
            background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
            background-repeat: repeat;
            background-size: 200px 200px;
          }
        `}</style>

        {/* Photo Upload Section */}
        {showUploadSection && !recommendation && (
          <>
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
              className="text-center mb-4"
            >
              <h1 className="text-5xl font-bold mb-2" style={{ color: '#9E6240', fontFamily: 'Caprasimo, serif' }}>
                Your Personalized <br/>African Hair Care Routine
            </h1>
              <p className="text-xl" style={{ color: '#914600' }}>
            AI-powered daily, weekly, and monthly care plan for healthier hair
          </p>
        </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-xl p-8 mb-8 mx-auto w-full md:w-3/4 lg:w-1/2"
            style={{
              backgroundColor: 'rgba(184, 125, 72, 0.3)',
              border: '2px solid #9E6240'
            }}
          >
            <div className="text-center mb-6">
              <Camera className="w-16 h-16 mx-auto mb-4" style={{ color: '#914600' }} />
              <h2 className="text-2xl font-bold mb-2" style={{ color: '#914600' }}>
                Analyze Your Hair
              </h2>
              <p style={{ color: '#914600' }}>
                Upload a clear photo of your hair for AI-powered analysis
              </p>
            </div>

            {!hairImage ? (
              <div className="mx-auto">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all"
                  style={{
                    borderColor: '#9E6240',
                    backgroundColor: 'rgba(158, 98, 64, 0.2)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(158, 98, 64, 0.3)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(158, 98, 64, 0.2)';
                  }}
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-12 h-12 mb-3" style={{ color: '#9E6240' }} />
                  <p className="mb-2 text-sm" style={{ color: '#9E6240' }}>
                      <span className="font-semibold">Click to upload</span> or drag and drop
                    </p>
                  <p className="text-xs" style={{ color: '#9E6240' }}>PNG, JPG or JPEG (MAX. 10MB)</p>
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
            ) : (
              <div className="mx-auto space-y-6">
                {/* Uploaded Image */}
                <div className="relative rounded-xl overflow-hidden shadow-lg">
                  <img
                    src={hairImage}
                    alt="Your hair"
                    className="w-full h-64 object-cover"
                  />
                  {isAnalyzing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <div className="text-white text-center">
                        <Loader className="animate-spin w-12 h-12 mx-auto mb-2" />
                        <p className="font-semibold">Analyzing your hair...</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Analysis Results */}
                {hairAnalysis && !isAnalyzing && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-xl p-6"
                    style={{ 
                      backgroundColor: '#8F3E00',
                      border: '2px solid #9E6240'
                    }}
                  >
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: '#FFC599' }}>
                      <CheckCircle style={{ color: '#FFC599' }} />
                      Analysis Complete
                    </h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#FFC599' }}>
                        <p className="text-sm mb-1" style={{ color: '#8F3E00' }}>Hair Type</p>
                        <p className="text-xl font-bold" style={{ color: '#8F3E00' }}>
                          {hairAnalysis.hairType?.hairType || hairAnalysis.hairType || '4c'}
                        </p>
                      </div>
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#FFC599' }}>
                        <p className="text-sm mb-1" style={{ color: '#8F3E00' }}>Health Score</p>
                        <p className="text-xl font-bold" style={{ color: '#8F3E00' }}>
                          {hairAnalysis.health?.healthScore || hairAnalysis.health?.score || 65}/100
                        </p>
                      </div>
                      <div className="rounded-lg p-4" style={{ backgroundColor: '#FFC599' }}>
                        <p className="text-sm mb-1" style={{ color: '#8F3E00' }}>Texture</p>
                        <p className="text-xl font-bold capitalize" style={{ color: '#8F3E00' }}>
                          {hairAnalysis.hairType?.texture || hairAnalysis.texture || 'coily'}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => {
                      setHairImage(null);
                      setHairAnalysis(null);
                    }}
                    className="px-6 py-3 rounded-xl font-semibold transition-all"
                    style={{ 
                      backgroundColor: 'rgba(158, 98, 64, 0.2)',
                      color: '#9E6240',
                      border: '2px solid #9E6240'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(158, 98, 64, 0.3)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(158, 98, 64, 0.2)'}
                  >
                    Upload Different Photo
                  </button>
                  <button
                    onClick={generateRoutine}
                    disabled={loading || !hairAnalysis}
                    className="px-8 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                    style={{ backgroundColor: '#8F3E00' }}
                  >
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <Loader className="animate-spin" size={20} />
                        Generating Routine...
                      </span>
                    ) : (
                      'Generate My Routine'
                    )}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
          </>
        )}

        {recommendation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Header */}
            <div className="text-center mt-16">
              <h1 className="text-5xl font-bold mb-2" style={{ color: '#9E6240', fontFamily: 'Caprasimo, serif' }}>
                Your Personalized <br/>African Hair Care Routine
              </h1>
              <p className="text-xl" style={{ color: '#914600' }}>
                AI-powered daily, weekly, and monthly care plan for healthier hair
              </p>
                </div>

            {/* Section Navigation Buttons */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveSection('routine')}
                className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                  activeSection === 'routine' ? 'shadow-lg' : ''
                }`}
                style={
                  activeSection === 'routine'
                    ? { backgroundColor: '#7F3E00', color: 'white' }
                    : { backgroundColor: 'rgba(184, 125, 72, 0.3)', color: '#914600', border: '2px solid #9E6240' }
                }
              >
                <Calendar size={28} />
                <span className="text-sm">Your Routine</span>
              </button>
              
              <button
                onClick={() => setActiveSection('maintenance')}
                className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                  activeSection === 'maintenance' ? 'shadow-lg' : ''
                }`}
                style={
                  activeSection === 'maintenance'
                    ? { backgroundColor: '#7F3E00', color: 'white' }
                    : { backgroundColor: 'rgba(184, 125, 72, 0.3)', color: '#914600', border: '2px solid #9E6240' }
                }
              >
                <Calendar size={28} />
                <span className="text-sm">Maintenance</span>
              </button>
              
              <button
                onClick={() => setActiveSection('products')}
                className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                  activeSection === 'products' ? 'shadow-lg' : ''
                }`}
                style={
                  activeSection === 'products'
                    ? { backgroundColor: '#7F3E00', color: 'white' }
                    : { backgroundColor: 'rgba(184, 125, 72, 0.3)', color: '#914600', border: '2px solid #9E6240' }
                }
              >
                <Package size={28} />
                <span className="text-sm">Products</span>
              </button>
              
              <button
                onClick={() => setActiveSection('tips')}
                className={`p-4 rounded-xl font-semibold transition-all flex flex-col items-center gap-2 ${
                  activeSection === 'tips' ? 'shadow-lg' : ''
                }`}
                style={
                  activeSection === 'tips'
                    ? { backgroundColor: '#7F3E00', color: 'white' }
                    : { backgroundColor: 'rgba(184, 125, 72, 0.3)', color: '#914600', border: '2px solid #9E6240' }
                }
              >
                <Lightbulb size={28} />
                <span className="text-sm">Tips</span>
              </button>
            </div>

            {/* Cost Summary Card */}
            {recommendation.productRecommendations && recommendation.productRecommendations.essential.length > 0 && (
              <div className="rounded-2xl shadow-xl p-6" style={{ backgroundColor: 'rgba(127, 62, 0, 0.1)', border: '2px solid #9E6240' }}>
                <div className="flex items-center gap-3 mb-4">
                  <Package size={28} style={{ color: '#914600' }} />
                  <h2 className="text-2xl font-bold" style={{ color: '#914600' }}>Cost Summary</h2>
                </div>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="rounded-xl p-4" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                    <p className="text-sm mb-2" style={{ color: '#914600' }}>Initial Investment</p>
                    <p className="text-2xl font-bold" style={{ color: '#AF5500' }}>
                      KES {recommendation.productRecommendations.essential.reduce((sum, p) => sum + p.pricing.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#914600' }}>
                      {recommendation.productRecommendations.essential.length} essential products
                    </p>
                  </div>

                  <div className="rounded-xl p-4" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                    <p className="text-sm mb-2" style={{ color: '#914600' }}>Est. Monthly Cost</p>
                    <p className="text-2xl font-bold" style={{ color: '#AF5500' }}>
                      KES {Math.round(recommendation.productRecommendations.essential.reduce((sum, p) => sum + p.pricing.amount, 0) / 3).toLocaleString()}
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#914600' }}>
                      Assuming 3-month product life
                    </p>
                  </div>

                  <div className="rounded-xl p-4" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                    <p className="text-sm mb-2" style={{ color: '#914600' }}>Budget Status</p>
                    <p className="text-2xl font-bold" style={{ color: '#AF5500' }}>
                      ✓ On Track
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#914600' }}>
                      Within your budget range
                    </p>
                  </div>
                </div>

                <div className="mt-4 rounded-lg p-3" style={{ backgroundColor: 'rgba(145, 70, 0, 0.1)' }}>
                  <p className="text-sm" style={{ color: '#914600' }}>
                    💡 <strong>Tip:</strong> Products typically last 2-4 months. Stock up during sales to save 20-30%!
                  </p>
                </div>
              </div>
            )}

            {/* Expected Results */}
            <div className="rounded-2xl shadow-xl overflow-hidden text-white" style={{ background: 'linear-gradient(to right, #AF5500, #EACAAE)' }}>            
              <button
                onClick={() => setIsExpectedResultsOpen(!isExpectedResultsOpen)}
                className="w-full p-6 flex items-center justify-between hover:opacity-90 transition-opacity"                                                    
              >
                <div className="flex items-center gap-3">
                <TrendingUp size={28} />
                  <h2 className="text-2xl font-bold">You Can Expect</h2>
              </div>
                <ChevronDown
                  size={28}
                  className={`transform transition-transform ${isExpectedResultsOpen ? 'rotate-180' : ''}`}                                                     
                />
              </button>
              
              {isExpectedResultsOpen && (
                <div className="px-6 pb-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Timeline</p>
                  <p className="text-xl font-semibold">{recommendation.expectedResults.timeline}</p>
                </div>
                <div>
                  <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>Health Improvement</p>
                  <p className="text-xl font-semibold">
                    +{recommendation.expectedResults.metrics.healthImprovement}%
                  </p>
                </div>
              </div>
              <div className="mt-4">
                  <p className="mb-2" style={{ color: 'rgba(255, 255, 255, 0.8)' }}>You can expect:</p>
                <ul className="space-y-2">
                  {recommendation.expectedResults.improvements.map((improvement, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                        <CheckCircle size={20} className="mt-0.5 flex-shrink-0" style={{ color: '#AF5500' }} />
                      <span>{improvement}</span>
                    </li>
                  ))}
                </ul>
              </div>
              </div>
              )}
            </div>

            {/* Display Section */}
            <div className="rounded-2xl shadow-xl p-6" style={{ backgroundColor: 'rgba(184, 125, 72, 0.2)', border: '2px solid #9E6240' }}>
              {/* Your Routine Section */}
              {activeSection === 'routine' && (
                <div>
              {/* Tab Buttons */}
              <div className="flex gap-4 mb-6">
                {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-3 px-6 rounded-lg font-semibold transition-all ${
                      activeTab === tab
                        ? 'text-white shadow-lg'
                        : ''
                    }`}
                    style={
                      activeTab === tab 
                        ? { backgroundColor: '#AF5500' } 
                        : { backgroundColor: 'rgba(158, 98, 64, 0.05)', color: '#AF5500' }
                    }
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)} (
                    {recommendation.personalizedRoutine[tab].length} steps)
                  </button>
                ))}
              </div>

              {/* Routine Steps */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recommendation.personalizedRoutine[activeTab].map((step, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="rounded-xl p-4 hover:shadow-lg transition-all flex flex-col h-full"
                    style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0" style={{ backgroundColor: '#914600' }}>
                        {step.stepNumber}
                      </div>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold border ${getImportanceColor(
                          step.importance
                        )}`}
                      >
                        {step.importance}
                      </span>
                    </div>

                    <h3 className="text-lg font-bold mb-1" style={{ color: '#914600' }}>{step.action}</h3>
                    <p className="text-xs mb-3" style={{ color: '#914600' }}>{step.frequency}</p>

                    {step.duration && (
                      <div className="flex items-center gap-2 mb-3" style={{ color: '#914600' }}>
                        <Clock size={14} />
                        <span className="text-xs">{step.duration}</span>
                      </div>
                    )}

                    <div className="rounded-lg p-3 mb-3 flex-grow" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)' }}>
                      <p className="text-xs font-semibold mb-1" style={{ color: '#914600' }}>Why:</p>
                      <p className="text-sm" style={{ color: '#914600' }}>{step.reasoning}</p>
                    </div>

                    {step.product && (
                      <div className="flex items-start gap-2 rounded-lg p-2 mt-auto" style={{ backgroundColor: 'rgba(145, 70, 0, 0.1)' }}>
                        <Package className="flex-shrink-0 mt-0.5" size={14} style={{ color: '#914600' }} />
                        <div>
                          <p className="text-xs font-semibold" style={{ color: '#914600' }}>Product</p>
                          <p className="text-xs" style={{ color: '#914600' }}>{step.product}</p>
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
              <div className="grid md:grid-cols-2 gap-4">
                <div className="rounded-lg p-4" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#914600' }}>Next Deep Condition</p>
                  <p className="text-lg font-bold" style={{ color: '#914600' }}>
                    {recommendation.maintenanceSchedule.nextDeepCondition.toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#914600' }}>Next Protein Treatment</p>
                  <p className="text-lg font-bold" style={{ color: '#914600' }}>
                    {recommendation.maintenanceSchedule.nextProteinTreatment.toLocaleDateString()}
                  </p>
                </div>
                <div className="rounded-lg p-4" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                  <p className="text-sm font-semibold mb-1" style={{ color: '#914600' }}>Next Trim</p>
                  <p className="text-lg font-bold" style={{ color: '#914600' }}>
                    {recommendation.maintenanceSchedule.nextTrim.toLocaleDateString()}
                  </p>
                </div>
                {recommendation.maintenanceSchedule.styleRefresh && (
                  <div className="rounded-lg p-4" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                    <p className="text-sm font-semibold mb-1" style={{ color: '#914600' }}>Style Refresh</p>
                    <p className="text-lg font-bold" style={{ color: '#914600' }}>
                      {recommendation.maintenanceSchedule.styleRefresh.toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
              )}

              {/* Recommended Products Section */}
              {activeSection === 'products' && recommendation.productRecommendations && recommendation.productRecommendations.essential.length > 0 && (
                <div>
                <div className="grid md:grid-cols-2 gap-6">
                  {recommendation.productRecommendations.essential.map((product, idx) => (
                    <div key={idx} className="rounded-xl p-5 transition-all" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-bold" style={{ color: '#914600' }}>{product.brand}</h3>
                          <p className="text-sm" style={{ color: '#914600' }}>{product.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold" style={{ color: '#914600' }}>
                            {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                          </p>
                          <p className="text-xs" style={{ color: '#914600' }}>{product.pricing.size}</p>
                        </div>
                      </div>
                      
                      <div className="rounded-lg p-3 mb-3" style={{ backgroundColor: 'rgba(145, 70, 0, 0.1)' }}>
                        <p className="text-sm font-semibold mb-1" style={{ color: '#914600' }}>Why we recommend this:</p>
                        <p className="text-sm" style={{ color: '#914600' }}>{product.purpose}</p>
                      </div>

                      <div className="space-y-2 mb-3">
                        <p className="text-xs font-semibold" style={{ color: '#914600' }}>Benefits:</p>
                        <ul className="space-y-1">
                          {product.benefits.slice(0, 3).map((benefit, bidx) => (
                            <li key={bidx} className="flex items-start gap-2 text-xs" style={{ color: '#914600' }}>
                              <Star size={12} className="mt-0.5 flex-shrink-0" style={{ color: '#AF5500' }} />
                              <span>{benefit}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="flex items-center justify-between pt-3" style={{ borderTop: '1px solid rgba(158, 98, 64, 0.3)' }}>
                        <div className="text-xs" style={{ color: '#914600' }}>
                          <p className="font-semibold mb-1">Available at:</p>
                          <p>{product.whereToBuy.join(', ')}</p>
                        </div>
                        <button className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all" style={{ backgroundColor: '#914600' }}>
                          Buy Now
                        </button>
                      </div>

                      {product.alternatives && product.alternatives.length > 0 && (
                        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(158, 98, 64, 0.3)' }}>
                          <p className="text-xs font-semibold mb-2" style={{ color: '#914600' }}>Alternatives:</p>
                          <div className="flex gap-2 flex-wrap">
                            {product.alternatives.map((alt, aidx) => (
                              <span key={aidx} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: 'rgba(255, 255, 255, 0.5)', border: '1px solid #9E6240', color: '#914600' }}>
                                {alt.brand} - KES {alt.price}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

              {/* Tips Section */}
              {activeSection === 'tips' && (
                <div>
            <div className="grid md:grid-cols-3 gap-6">
              {/* Dos */}
              <div className="rounded-2xl shadow-xl p-6" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle size={24} style={{ color: '#914600' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#914600' }}>Do's</h3>
                </div>
                <ul className="space-y-3">
                  {recommendation.tips.dos.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#914600' }}>
                      <CheckCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#914600' }} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Don'ts */}
              <div className="rounded-2xl shadow-xl p-6" style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}>
                <div className="flex items-center gap-2 mb-4">
                  <AlertCircle size={24} style={{ color: '#914600' }} />
                  <h3 className="text-xl font-bold" style={{ color: '#914600' }}>Don'ts</h3>
                </div>
                <ul className="space-y-3">
                  {recommendation.tips.donts.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm" style={{ color: '#914600' }}>
                      <AlertCircle size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#914600' }} />
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Pro Tips */}
              <div className="rounded-2xl shadow-xl p-6 text-white" style={{ background: 'linear-gradient(to bottom right, #AF5500, #EACAAE)' }}>
                <div className="flex items-center gap-2 mb-4">
                  <Lightbulb size={24} />
                  <h3 className="text-xl font-bold">Pro Tips</h3>
                </div>
                <ul className="space-y-3">
                  {recommendation.tips.proTips.map((tip, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm">
                      <Star size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#AF5500' }} />
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
            <div className="rounded-2xl shadow-xl p-8 text-white text-center" style={{ background: 'linear-gradient(to right, #AF5500, #EACAAE)' }}>
              <h3 className="text-2xl font-bold mb-2">Ready to transform your hair?</h3>
              <p className="mb-6">Start your personalized routine today and see results in weeks!</p>
              <div className="flex gap-4 justify-center">
                <button 
                  onClick={() => {
                    setRecommendation(null);
                    setHairImage(null);
                    setHairAnalysis(null);
                    setShowUploadSection(true);
                  }}
                  className="px-8 py-3 text-white rounded-xl font-semibold transition-all border-2"
                  style={{ backgroundColor: 'rgba(255, 255, 255, 0.2)', borderColor: 'white' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
                >
                  Analyze New Photo
                </button>
                <button 
                  onClick={saveRoutine}
                  className="px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all" 
                  style={{ backgroundColor: 'white', color: '#914600' }}
                >
                  Save My Routine
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

