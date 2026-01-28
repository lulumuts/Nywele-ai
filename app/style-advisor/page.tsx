'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, Upload, Loader, X, CheckCircle, AlertTriangle, Download, ExternalLink, FileText } from 'lucide-react';
import { generateJobSpec, mapStyleToTemplateSlug, JobSpec } from '@/lib/specs';
import SpecSummary from '@/app/components/SpecSummary';
import Navbar from '@/app/components/Navbar';
import { downloadHairPassport } from '@/lib/hairPassport';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';
import { trackStyleAssessmentCompleted, trackExternalBookingLinkClick, trackPassportExport } from '@/lib/analytics';

export default function StyleAdvisor() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  
  // Style selection
  const [desiredStyleInput, setDesiredStyleInput] = useState('');
  const [uploadedStyleImage, setUploadedStyleImage] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [styleDetectionResult, setStyleDetectionResult] = useState<any>(null);
  
  const desiredStyle = desiredStyleInput;
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [inspirationPhoto, setInspirationPhoto] = useState<string | null>(null);
  const [hairType, setHairType] = useState<string>('');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  
  // Step 1: Style review
  const [jobSpec, setJobSpec] = useState<JobSpec | null>(null);
  const [styleCompatibility, setStyleCompatibility] = useState<'compatible' | 'risky' | 'unknown'>('unknown');
  const [compatibilityReason, setCompatibilityReason] = useState<string>('');

  useEffect(() => {
    // Load user profile
    const profileData = localStorage.getItem('nywele-user-profile');
    if (profileData) {
      try {
        const parsed = normalizeUserProfile(JSON.parse(profileData));
        setUserProfile(parsed);
      } catch (error) {
        console.error('Error parsing profile:', error);
      }
    }

    // Get uploaded photos from sessionStorage
    const photo = sessionStorage.getItem('userHairPhoto');
    const inspiration = sessionStorage.getItem('inspirationPhoto');
    setUserPhoto(photo);
    setInspirationPhoto(inspiration);

    // Get hair analysis if available
    const analysisStr = sessionStorage.getItem('hairAnalysis');
    if (analysisStr) {
      try {
        const analysis = JSON.parse(analysisStr);
        setHairType(analysis.hairType || '');
      } catch (error) {
        console.error('Error parsing hair analysis:', error);
      }
    }
  }, []);

  // Generate job spec and check compatibility when moving to step 1
  useEffect(() => {
    if (currentStep !== 1 || !desiredStyle) return;

    // Generate job spec
    const styleSlug = mapStyleToTemplateSlug(desiredStyle.toLowerCase().replace(/\s+/g, '-'));
    const spec = generateJobSpec(styleSlug);
    if (spec) {
      setJobSpec(spec);
    }

    // Check style compatibility
    checkStyleCompatibility();
  }, [currentStep, desiredStyle, userProfile, hairType]);

  // Track style assessment after compatibility is determined
  useEffect(() => {
    if (currentStep === 1 && desiredStyle && styleCompatibility !== 'unknown') {
      trackStyleAssessmentCompleted({
        style: desiredStyle,
        compatibility: styleCompatibility,
        hairType: userProfile?.hairType || hairType || undefined,
      }).catch(err => console.error('Analytics tracking failed:', err));
    }
  }, [currentStep, desiredStyle, styleCompatibility, userProfile, hairType]);

  const checkStyleCompatibility = () => {
    if (!userProfile && !hairType) {
      setStyleCompatibility('unknown');
      setCompatibilityReason('Complete your hair profile for compatibility analysis');
      return;
    }

    const profileHairType = userProfile?.hairType || hairType || '';
    const concerns = userProfile?.currentConcerns || [];
    const goals = userProfile?.hairGoals || [];

    // Basic compatibility logic
    // This is simplified - in production, this would be more sophisticated
    if (concerns.includes('breakage') && (desiredStyle.includes('Braids') || desiredStyle.includes('Twists'))) {
      setStyleCompatibility('risky');
      setCompatibilityReason('This style may cause tension on already fragile hair. Consider lighter protective styles or focus on strengthening first.');
    } else if (concerns.includes('dryness') && desiredStyle.includes('Locs')) {
      setStyleCompatibility('risky');
      setCompatibilityReason('Locs require consistent moisture. Address dryness concerns before installing locs.');
    } else {
      setStyleCompatibility('compatible');
      setCompatibilityReason('This style is compatible with your hair profile!');
    }
  };

  const getStyleImage = (styleName: string) => {
    const styleMap: Record<string, string> = {
      'Box Braids': '/images/styles/box-braids.jpg',
      'Knotless Braids': '/images/styles/knotless-braids.jpg',
      'Senegalese Twists': '/images/styles/senegalese-twists.jpg',
      'Faux Locs': '/images/styles/faux-locs.jpg',
      'Cornrows': '/images/styles/cornrows.jpg',
      'Two-Strand Twists': '/images/styles/two-strand-twists.jpg',
      'Passion Twists': '/images/styles/passion-twists.jpg',
      'Goddess Locs': '/images/styles/goddess-locs.jpg'
    };
    return styleMap[styleName] || '/images/styles/box-braids.jpg';
  };

  const getStyleCost = (styleName: string) => {
    const costMap: Record<string, { min: number; max: number; duration: string }> = {
      'Box Braids': { min: 150, max: 300, duration: '6-8 weeks' },
      'Knotless Braids': { min: 180, max: 350, duration: '6-8 weeks' },
      'Senegalese Twists': { min: 120, max: 250, duration: '6-8 weeks' },
      'Faux Locs': { min: 150, max: 300, duration: '6-8 weeks' },
      'Cornrows': { min: 50, max: 150, duration: '2-4 weeks' },
      'Two-Strand Twists': { min: 40, max: 100, duration: '1-2 weeks' },
      'Passion Twists': { min: 140, max: 280, duration: '6-8 weeks' },
      'Goddess Locs': { min: 180, max: 350, duration: '6-8 weeks' }
    };
    return costMap[styleName] || { min: 100, max: 200, duration: '4-6 weeks' };
  };

  const handleStyleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setUploadedStyleImage(base64Image);
      setAnalyzingImage(true);
      setStyleDetectionResult(null);

      try {
        const response = await fetch('/api/analyze-style', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();
        
        if (data.success && data.analysis) {
          setStyleDetectionResult(data.analysis);
          
          if (data.analysis.confidence !== 'low' && data.analysis.detectedStyle !== 'Unknown') {
            setDesiredStyleInput(data.analysis.detectedStyle);
          }
        }
      } catch (error) {
        console.error('Error analyzing style image:', error);
        alert('Failed to analyze image. Please try selecting from the dropdown.');
      } finally {
        setAnalyzingImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const clearStyleImage = () => {
    setUploadedStyleImage(null);
    setStyleDetectionResult(null);
    setDesiredStyleInput('');
  };

  const handleDownloadPassport = () => {
    if (!userProfile) {
      alert('Please create your profile first');
      router.push('/hair-care');
      return;
    }

    const analysisStr = sessionStorage.getItem('hairAnalysis');
    const analysis = analysisStr ? JSON.parse(analysisStr) : null;
    
    downloadHairPassport(userProfile, analysis);
    
    // Track passport export
    trackPassportExport({
      format: 'text',
      hairType: userProfile.hairType,
    }).catch(err => console.error('Analytics tracking failed:', err));
  };

  const styleCost = desiredStyle ? getStyleCost(desiredStyle) : null;

  return (
    <div className="min-h-screen" style={{ background: '#FDF4E8' }}>
      <Navbar />
      
      {/* Progress Steps */}
      {currentStep > 0 && (
        <div className="backdrop-blur-sm border-b" style={{ borderColor: 'rgba(145, 70, 0, 0.2)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-2">
              {[1, 2].map(step => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                    style={{
                      background: currentStep >= step ? '#643100' : '#E5D4C1',
                      color: currentStep >= step ? 'white' : '#914600',
                      fontFamily: 'Bricolage Grotesque, sans-serif'
                    }}>
                    {step}
                  </div>
                  {step < 2 && (
                    <div className={`w-12 h-1`} style={{ background: currentStep > step ? '#643100' : '#E5D4C1' }} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-2 text-center text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              {currentStep === 1 && 'Style Compatibility'}
              {currentStep === 2 && 'Export & Integration'}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Step 0: Style Selection */}
          {currentStep === 0 && (
          <motion.div
            key="step0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full min-h-[calc(100vh-200px)] flex items-center justify-center"
          >
            <div className="rounded-2xl shadow-2xl p-12 md:p-16 w-full max-w-[1300px]"
              style={{ background: '#FFFBF5', border: '2px solid #914600', minHeight: '750px' }}>
              <div className="grid md:grid-cols-2 gap-12 w-full">
                {/* Left Section */}
                <div className="flex flex-col justify-center">
                  <h1 className="text-5xl md:text-6xl font-bold mb-6" 
                    style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                    Get Style<br />Advice
                  </h1>
                  <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Check style compatibility<br />and get personalized recommendations
                  </p>
                </div>

                {/* Right Section - Form */}
                <div className="flex flex-col justify-center">
                  <h2 className="text-3xl font-bold mb-8" 
                    style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                    Choose Your Style
                  </h2>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-base font-medium mb-3" 
                        style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        Desired Style
                      </label>
                      <select
                        value={desiredStyleInput}
                        onChange={(e) => setDesiredStyleInput(e.target.value)}
                        className="w-full px-6 py-4 pr-12 rounded-xl text-lg appearance-none"
                        disabled={!!uploadedStyleImage}
                        style={{ 
                          backgroundColor: uploadedStyleImage ? '#E5D4C1' : '#FDF4E8', 
                          border: '2px solid #914600',
                          color: '#643100',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                          backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23914600' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                          backgroundPosition: 'right 1rem center',
                          backgroundRepeat: 'no-repeat',
                          backgroundSize: '1.5em 1.5em',
                          opacity: uploadedStyleImage ? 0.6 : 1
                        }}
                      >
                        <option value="">Select a style...</option>
                        <option value="Box Braids">Box Braids</option>
                        <option value="Knotless Braids">Knotless Braids</option>
                        <option value="Senegalese Twists">Senegalese Twists</option>
                        <option value="Faux Locs">Faux Locs</option>
                        <option value="Cornrows">Cornrows</option>
                        <option value="Two-Strand Twists">Two-Strand Twists</option>
                        <option value="Passion Twists">Passion Twists</option>
                        <option value="Goddess Locs">Goddess Locs</option>
                      </select>

                      {/* OR Divider */}
                      <div className="flex items-center gap-3 my-4">
                        <div className="flex-1 h-px" style={{ background: '#CE935F' }}></div>
                        <span className="text-sm font-medium" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>OR</span>
                        <div className="flex-1 h-px" style={{ background: '#CE935F' }}></div>
                      </div>

                      {/* Image Upload */}
                      {!uploadedStyleImage ? (
                        <label className="block cursor-pointer">
                          <div className="border-2 border-dashed rounded-xl p-6 text-center transition-all hover:border-solid hover:shadow-md"
                            style={{ borderColor: '#914600', backgroundColor: '#FDF4E8' }}>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleStyleImageUpload}
                              className="hidden"
                            />
                            <Upload size={32} style={{ color: '#914600' }} className="mx-auto mb-2" />
                            <p className="text-base font-medium mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Upload a photo of your desired style
                            </p>
                            <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              AI will identify the hairstyle for you
                            </p>
                          </div>
                        </label>
                      ) : (
                        <div className="rounded-xl p-4" style={{ background: 'rgba(206, 147, 95, 0.2)', border: '2px solid #914600' }}>
                          <div className="flex items-start gap-4">
                            <img src={uploadedStyleImage} alt="Uploaded style" className="w-24 h-24 rounded-lg object-cover" />
                            <div className="flex-1">
                              {analyzingImage ? (
                                <div className="flex items-center gap-2">
                                  <Loader className="animate-spin" size={20} style={{ color: '#914600' }} />
                                  <p className="text-sm font-medium" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Analyzing your photo...
                                  </p>
                                </div>
                              ) : styleDetectionResult ? (
                                <div>
                                  <p className="text-sm font-bold mb-1" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Detected: {styleDetectionResult.detectedStyle}
                                  </p>
                                  <p className="text-xs mb-2" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                    Confidence: {styleDetectionResult.confidence}
                                  </p>
                                  {styleDetectionResult.description && (
                                    <p className="text-xs" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                      {styleDetectionResult.description}
                                    </p>
                                  )}
                                </div>
                              ) : null}
                            </div>
                            <button
                              onClick={clearStyleImage}
                              className="p-2 rounded-lg hover:bg-white/50 transition-colors"
                              style={{ color: '#914600' }}
                            >
                              <X size={20} />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => {
                        if (!desiredStyleInput) {
                          alert('Please select or upload a style');
                          return;
                        }
                        setCurrentStep(1);
                      }}
                      disabled={!desiredStyleInput}
                      className="w-full py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      Check Compatibility
                      <ArrowRight size={20} className="inline ml-2" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}

          {/* Step 1: Style Compatibility */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl shadow-2xl"
              style={{ background: '#FFFBF5', border: '2px solid #914600', minHeight: 'calc(100vh - 250px)' }}
            >
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                  Style Compatibility Analysis
                </h2>
                
                <div className="max-w-xl mx-auto mb-8">
                  <div className="text-center">
                    {desiredStyle === 'custom-style' && inspirationPhoto ? (
                      <img
                        src={inspirationPhoto}
                        alt="Your inspiration"
                        className="w-full h-80 object-cover rounded-xl mb-6 shadow-lg"
                      />
                    ) : (
                      <img
                        src={getStyleImage(desiredStyle)}
                        alt={desiredStyle}
                        className="w-full h-80 object-cover rounded-xl mb-6 shadow-lg"
                      />
                    )}
                    <h3 className="text-3xl font-bold mb-4" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      {desiredStyle === 'custom-style' ? 'Custom Style' : desiredStyle}
                    </h3>
                    {styleCost && (
                      <div className="space-y-2 mb-6" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        <p><strong>Duration:</strong> Lasts {styleCost.duration}</p>
                        <p><strong>Estimated Cost:</strong> ${styleCost.min} - ${styleCost.max}</p>
                        <p><strong>Maintenance:</strong> Low</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Compatibility Status */}
                <div className={`rounded-xl p-6 mb-6 ${
                  styleCompatibility === 'compatible' 
                    ? 'bg-green-50 border-2 border-green-500' 
                    : styleCompatibility === 'risky'
                    ? 'bg-yellow-50 border-2 border-yellow-500'
                    : 'bg-gray-50 border-2 border-gray-400'
                }`}>
                  <div className="flex items-start gap-3">
                    {styleCompatibility === 'compatible' ? (
                      <CheckCircle size={32} className="text-green-600 flex-shrink-0" />
                    ) : styleCompatibility === 'risky' ? (
                      <AlertTriangle size={32} className="text-yellow-600 flex-shrink-0" />
                    ) : (
                      <AlertTriangle size={32} className="text-gray-600 flex-shrink-0" />
                    )}
                    <div>
                      <h4 className="text-xl font-bold mb-2" style={{ 
                        color: styleCompatibility === 'compatible' ? '#16a34a' : styleCompatibility === 'risky' ? '#d97706' : '#6b7280',
                        fontFamily: 'Caprasimo, serif'
                      }}>
                        {styleCompatibility === 'compatible' 
                          ? 'Great choice! This style works for your hair.'
                          : styleCompatibility === 'risky'
                          ? '⚠️ This style may damage your hair'
                          : 'Complete your profile for compatibility analysis'}
                      </h4>
                      <p style={{ 
                        color: styleCompatibility === 'compatible' ? '#15803d' : styleCompatibility === 'risky' ? '#b45309' : '#4b5563',
                        fontFamily: 'Bricolage Grotesque, sans-serif'
                      }}>
                        {compatibilityReason}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Job Specification */}
                {jobSpec && (
                  <div className="mb-8">
                    <SpecSummary spec={jobSpec} />
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => setCurrentStep(0)}
                    className="flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ background: '#FDF4E8', color: '#914600', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="flex-1 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                    style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Continue to Export Options
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 2: Export & Integration Options */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl shadow-2xl"
              style={{ background: '#FFFBF5', border: '2px solid #914600', minHeight: 'calc(100vh - 250px)' }}
            >
              <div className="p-8">
                <h2 className="text-3xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                  Export & Integration Options
                </h2>

                {styleCompatibility === 'compatible' ? (
                  <div className="space-y-6">
                    <p className="text-lg mb-8" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Your style is compatible! Choose how you'd like to proceed:
                    </p>

                    {/* Hair Passport */}
                    <motion.button
                      onClick={handleDownloadPassport}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-xl shadow-lg p-6 text-left transition-all hover:shadow-xl"
                      style={{ background: '#FDF4E8', border: '2px solid #914600' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(206, 147, 95, 0.2)' }}>
                          <FileText size={32} style={{ color: '#643100' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2" 
                            style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Download Hair Passport
                          </h3>
                          <p className="mb-3" 
                            style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Get a portable PDF with your hair profile to share with any stylist, anywhere in the world
                          </p>
                          <div className="flex items-center gap-2" style={{ color: '#914600' }}>
                            <Download size={16} />
                            <span className="text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Download Now
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>

                    {/* Fresha Integration */}
                    <motion.button
                      onClick={() => {
                        // Generate shareable profile URL/code
                        const profileCode = userProfile ? btoa(JSON.stringify({
                          name: userProfile.name,
                          hairType: userProfile.hairType,
                          style: desiredStyle,
                          timestamp: Date.now()
                        })).slice(0, 12) : 'guest';
                        
                        // Track external booking link click
                        trackExternalBookingLinkClick({
                          platform: 'fresha',
                          style: desiredStyle,
                          hairType: userProfile?.hairType || undefined,
                        }).catch(err => console.error('Analytics tracking failed:', err));
                        
                        // Open Fresha (placeholder - replace with actual Fresha integration)
                        window.open(`https://fresha.com/book?ref=nywele-${profileCode}`, '_blank');
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-xl shadow-lg p-6 text-left transition-all hover:shadow-xl"
                      style={{ background: '#FDF4E8', border: '2px solid #914600' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(206, 147, 95, 0.2)' }}>
                          <ExternalLink size={32} style={{ color: '#643100' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2" 
                            style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Book via Fresha
                          </h3>
                          <p className="mb-3" 
                            style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Book your appointment through Fresha with your hair profile automatically shared
                          </p>
                          <div className="flex items-center gap-2" style={{ color: '#914600' }}>
                            <ExternalLink size={16} />
                            <span className="text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Open Fresha
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>

                    {/* Braiding Nairobi Integration */}
                    <motion.button
                      onClick={() => {
                        // Generate shareable profile URL/code
                        const profileCode = userProfile ? btoa(JSON.stringify({
                          name: userProfile.name,
                          hairType: userProfile.hairType,
                          style: desiredStyle,
                          timestamp: Date.now()
                        })).slice(0, 12) : 'guest';
                        
                        // Track external booking link click
                        trackExternalBookingLinkClick({
                          platform: 'braiding-nairobi',
                          style: desiredStyle,
                          hairType: userProfile?.hairType || undefined,
                        }).catch(err => console.error('Analytics tracking failed:', err));
                        
                        // Open Braiding Nairobi (placeholder - replace with actual BN integration)
                        window.open(`https://braidingnairobi.com/book?ref=nywele-${profileCode}`, '_blank');
                      }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full rounded-xl shadow-lg p-6 text-left transition-all hover:shadow-xl"
                      style={{ background: '#FDF4E8', border: '2px solid #914600' }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ background: 'rgba(206, 147, 95, 0.2)' }}>
                          <ExternalLink size={32} style={{ color: '#643100' }} />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-2xl font-bold mb-2" 
                            style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Book via Braiding Nairobi
                          </h3>
                          <p className="mb-3" 
                            style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Connect with Braiding Nairobi stylists with your profile ready to share
                          </p>
                          <div className="flex items-center gap-2" style={{ color: '#914600' }}>
                            <ExternalLink size={16} />
                            <span className="text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                              Open Braiding Nairobi
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  </div>
                ) : (
                  <div className="rounded-xl p-6" style={{ background: 'rgba(254, 226, 226, 0.3)', border: '2px solid #fca5a5' }}>
                    <p className="text-lg mb-4" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      {styleCompatibility === 'risky' 
                        ? 'This style may not be suitable for your hair at this time. Consider focusing on hair health first, or try alternative styles.'
                        : 'Complete your hair profile to get personalized style recommendations and export options.'}
                    </p>
                    <button
                      onClick={() => router.push('/hair-care')}
                      className="px-6 py-3 rounded-xl font-semibold transition-all"
                      style={{ background: '#643100', color: '#FDF4E8', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      Complete Your Profile
                    </button>
                  </div>
                )}

                <div className="mt-8">
                  <button
                    onClick={() => setCurrentStep(1)}
                    className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                    style={{ background: '#FDF4E8', color: '#914600', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    <ArrowLeft size={20} />
                    Back
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

