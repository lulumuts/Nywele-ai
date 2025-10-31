'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, Star, Phone, Instagram, DollarSign, Check, ArrowRight, ArrowLeft, Clock, Sparkles, Upload, Loader, X, Image as ImageIcon } from 'lucide-react';
import { generateJobSpec, mapStyleToTemplateSlug, JobSpec } from '@/lib/specs';
import SpecSummary from '@/app/components/SpecSummary';
import Navbar from '@/app/components/Navbar';
import { getAllStyles, getProductsForStyle } from '@/lib/supabase-styles';

interface Stylist {
  id: string;
  name: string;
  business_name: string;
  location_city: string;
  specialties: string[];
  skills: string[]; // For matching
  average_rating: number;
  total_reviews: number;
  price_range: string;
  phone: string;
  instagram_handle: string;
  profile_image_url: string;
  availableSlots: string[];
  availabilityHoursPerDay: number; // Max hours they can work per day
}

function BookingFlowContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [currentStep, setCurrentStep] = useState(0); // Start at 0 now
  
  // User data from home page or form - start fresh without pre-filling
  const [desiredStyleInput, setDesiredStyleInput] = useState('');
  const [budgetInput, setBudgetInput] = useState('');
  const [timePreferenceInput, setTimePreferenceInput] = useState('');
  
  // Image upload for style detection
  const [uploadedStyleImage, setUploadedStyleImage] = useState<string | null>(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const [styleDetectionResult, setStyleDetectionResult] = useState<any>(null);
  
  // Styles from Supabase
  const [availableStyles, setAvailableStyles] = useState<any[]>([]);
  const [selectedStyleProducts, setSelectedStyleProducts] = useState<any>(null);
  
  const desiredStyle = desiredStyleInput;
  const budget = budgetInput;
  const timePreference = timePreferenceInput;
  
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [inspirationPhoto, setInspirationPhoto] = useState<string | null>(null);
  const [hairType, setHairType] = useState<string>('');
  
  // Step 1: Review style
  const [styleConfirmed, setStyleConfirmed] = useState(false);
  const [jobSpec, setJobSpec] = useState<JobSpec | null>(null);
  
  // Step 2: Choose date
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Step 3: Choose stylist
  const [matchedStylists, setMatchedStylists] = useState<Stylist[]>([]);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  
  // Step 4: Confirmation
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingStatus, setBookingStatus] = useState('pending_quote');
  const [quote, setQuote] = useState<any>(null);

  useEffect(() => {
    // Clear any previous booking data to start fresh
    sessionStorage.removeItem('userHairPhoto');
    sessionStorage.removeItem('inspirationPhoto');
    sessionStorage.removeItem('hairAnalysis');
    
    // Always start at step 0 so user can control the flow
    setCurrentStep(0);
    
    // Fetch available styles from Supabase
    async function loadStyles() {
      const styles = await getAllStyles();
      setAvailableStyles(styles);
    }
    loadStyles();
  }, []);
  
  // Load products when style is selected
  useEffect(() => {
    if (desiredStyleInput) {
      async function loadProducts() {
        const products = await getProductsForStyle(desiredStyleInput);
        setSelectedStyleProducts(products);
        console.log('✅ Loaded products for', desiredStyleInput, ':', products);
      }
      loadProducts();
    } else {
      setSelectedStyleProducts(null);
    }
  }, [desiredStyleInput]);

  // Generate job spec and load stylists when moving to step 1
  useEffect(() => {
    if (currentStep !== 1 || !desiredStyle) return;

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

    // Generate job spec
    const styleSlug = mapStyleToTemplateSlug(desiredStyle.toLowerCase().replace(/\s+/g, '-'));
    const spec = generateJobSpec(styleSlug);
    if (spec) {
      setJobSpec(spec);
    } else {
      console.warn('⚠️ Could not generate job spec for style:', desiredStyle);
    }

    // Load matched stylists based on desired style, budget, and time
    if (budget && timePreference) {
    loadMatchedStylists();
    }
  }, [currentStep, desiredStyle, budget, timePreference]);

  const loadMatchedStylists = () => {
    // Mock stylists with skills and availability
    const allStylists: Stylist[] = [
      {
        id: '1',
        name: 'Amara Okonkwo',
        business_name: 'Braids by Amara',
        location_city: 'Nairobi',
        specialties: ['braids', 'knotless-braids', 'box-braids', 'cornrows'],
        skills: ['knotless-braids', 'box-braids', 'cornrows', 'braids'],
        average_rating: 4.8,
        total_reviews: 127,
        price_range: 'mid-range',
        phone: '+254712345678',
        instagram_handle: '@braidsamara',
        profile_image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400',
        availableSlots: ['10:00 AM', '2:00 PM', '4:00 PM'],
        availabilityHoursPerDay: 10
      },
      {
        id: '2',
        name: 'Thandiwe Mwangi',
        business_name: 'Locs of Love',
        location_city: 'Nairobi',
        specialties: ['locs', 'faux-locs', 'goddess-locs'],
        skills: ['faux-locs', 'goddess-locs', 'locs'],
        average_rating: 4.7,
        total_reviews: 156,
        price_range: 'mid-range',
        phone: '+254745678901',
        instagram_handle: '@locsoflove_ke',
        profile_image_url: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400',
        availableSlots: ['9:00 AM', '12:00 PM', '3:00 PM'],
        availabilityHoursPerDay: 12
      },
      {
        id: '3',
        name: 'Njeri Wambui',
        business_name: 'Twist & Shout Salon',
        location_city: 'Nairobi',
        specialties: ['twists', 'passion-twists', 'senegalese-twists', 'two-strand-twists'],
        skills: ['two-strand-twists', 'passion-twists', 'senegalese-twists', 'twists'],
        average_rating: 4.9,
        total_reviews: 178,
        price_range: 'premium',
        phone: '+254756789012',
        instagram_handle: '@twistandshout_nairobi',
        profile_image_url: 'https://images.unsplash.com/photo-1616683693457-c45984ccb3ae?w=400',
        availableSlots: ['11:00 AM', '1:00 PM', '5:00 PM'],
        availabilityHoursPerDay: 8
      }
    ];

    // Smart matching logic
    const styleSlug = mapStyleToTemplateSlug(desiredStyle.toLowerCase().replace(/\s+/g, '-'));
    const requiredHours = jobSpec ? jobSpec.time_max_hours : 8;

    // Map budget to price range
    const budgetToPriceRange: Record<string, string[]> = {
      'Under KES 3,000': ['budget'],
      'KES 3,000-5,000': ['budget', 'mid-range'],
      'KES 5,000-8,000': ['mid-range', 'premium'],
      'KES 8,000+': ['premium']
    };
    const acceptablePriceRanges = budgetToPriceRange[budget] || ['budget', 'mid-range', 'premium'];

    // Filter stylists by skill match, availability, and budget
    const matched = allStylists.filter(stylist => {
      // Must have the skill
      const hasSkill = stylist.skills.includes(styleSlug);
      // Must have enough hours available
      const hasTimeAvailable = stylist.availabilityHoursPerDay >= requiredHours;
      // Must be within budget
      const isAffordable = acceptablePriceRanges.includes(stylist.price_range);
      return hasSkill && hasTimeAvailable && isAffordable;
    });

    // Sort by fit score: skill match (hard filter) → rating → price proximity
    const sorted = matched.sort((a, b) => {
      // Higher rating first
      if (a.average_rating !== b.average_rating) {
        return b.average_rating - a.average_rating;
      }
      // Prefer price ranges closer to budget
      const priceScore = (s: Stylist) => s.price_range === 'mid-range' ? 2 : s.price_range === 'budget' ? 1 : 0;
      return priceScore(b) - priceScore(a);
    });

    setMatchedStylists(sorted.length > 0 ? sorted : allStylists.slice(0, 2));
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

  // Generate next 14 days
  const getAvailableDates = () => {
    const dates = [];
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const handleConfirmBooking = () => {
    // Validate that we have a complete job spec before confirming
    if (!jobSpec || !jobSpec.hair_extensions || !jobSpec.labor || !jobSpec.styling_products) {
      alert('Unable to generate job details for this style. Please try a different style or contact support.');
      console.error('❌ Cannot confirm booking without complete job spec:', { jobSpec, desiredStyle });
      return;
    }

    const bookingId = Date.now().toString();
    
    // Save booking info for recommendations with spec and status
    const bookingInfo = {
      id: bookingId,
      desiredStyle,
      budget,
      timePreference,
      stylistInfo: {
        name: selectedStylist?.name,
        business: selectedStylist?.business_name,
        phone: selectedStylist?.phone
      },
      date: selectedDate,
      time: selectedTime,
      cost: getStyleCost(desiredStyle),
      spec: jobSpec,
      status: 'pending_quote',
      bookedAt: new Date().toISOString()
    };

    // Save to localStorage for recommendations page
    localStorage.setItem('nywele-latest-booking', JSON.stringify(bookingInfo));

    // Push job to braider inbox with validated spec
    const jobsInbox = JSON.parse(localStorage.getItem('nywele-jobs-inbox') || '[]');
    jobsInbox.push({
      bookingId,
      styleSlug: jobSpec.style_slug,
      styleName: jobSpec.style_name,
      spec: jobSpec,
      customerInfo: {
        hairType: hairType || 'Not specified',
        budget,
        timePreference,
        requestedDate: selectedDate,
        requestedTime: selectedTime
      },
      status: 'pending_quote',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('nywele-jobs-inbox', JSON.stringify(jobsInbox));

    console.log('✅ Booking confirmed with complete spec:', { bookingId, styleSlug: jobSpec.style_slug });
    setBookingConfirmed(true);
  };

  const priceRangeLabels = {
    'budget': '$',
    'mid-range': '$$',
    'premium': '$$$'
  };

  const styleCost = getStyleCost(desiredStyle);

  // Handle style image upload and analysis
  const handleStyleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Read file as base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Image = reader.result as string;
      setUploadedStyleImage(base64Image);
      setAnalyzingImage(true);
      setStyleDetectionResult(null);

      try {
        // Call API to analyze image
        const response = await fetch('/api/analyze-style', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64Image })
        });

        const data = await response.json();
        
        if (data.success && data.analysis) {
          setStyleDetectionResult(data.analysis);
          
          // Auto-fill the style if detected with high confidence
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

  return (
    <div className="min-h-screen" style={{ background: '#FDF4E8' }}>
      {/* Use the same Navbar as other pages */}
      <Navbar />
      
      {/* Progress Steps - Only show when past step 0 */}
      {currentStep > 0 && (
        <div className="backdrop-blur-sm border-b" style={{ borderColor: 'rgba(145, 70, 0, 0.2)' }}>
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4].map(step => (
              <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold`}
                    style={{
                      background: currentStep >= step ? '#643100' : '#E5D4C1',
                      color: currentStep >= step ? 'white' : '#914600',
                      fontFamily: 'Bricolage Grotesque, sans-serif'
                    }}>
                  {step}
                </div>
                {step < 4 && (
                    <div className={`w-12 h-1`} style={{ background: currentStep > step ? '#643100' : '#E5D4C1' }} />
                )}
              </div>
            ))}
          </div>
            <div className="mt-2 text-center text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            {currentStep === 1 && 'Confirm Your Style'}
            {currentStep === 2 && 'Choose Date & Time'}
            {currentStep === 3 && 'Select Your Stylist'}
            {currentStep === 4 && 'Confirm Booking'}
          </div>
        </div>
      </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {/* Step 0: Initial Booking Form */}
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
                      Book Your<br />Perfect<br />Braiding<br />Style
                    </h1>
                    <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Connect with expert stylists<br />and get your dream hairstyle
                    </p>
                  </div>

                  {/* Right Section - Form */}
                  <div className="flex flex-col justify-center">
                    <h2 className="text-3xl font-bold mb-8" 
                      style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                      Let's Get Started
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
                          {availableStyles.map((style) => (
                            <option key={style.id} value={style.name}>
                              {style.name}
                            </option>
                          ))}
                        </select>
                        
                        {/* Show recommended products when style is selected */}
                        {selectedStyleProducts && (
                          <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.2)', border: '2px solid #914600' }}>
                            <p className="text-sm font-bold mb-2" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                              Recommended Products for {desiredStyleInput}
                            </p>
                            {selectedStyleProducts.essential && selectedStyleProducts.essential.length > 0 && (
                              <div className="space-y-2">
                                {selectedStyleProducts.essential.map((product: any, idx: number) => (
                                  <div key={idx} className="text-xs" style={{ color: '#914600' }}>
                                    ✅ {product.brand} {product.name} ({product.quantity} packs) - KES {product.total_cost}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

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

                <div>
                        <label className="block text-base font-medium mb-3" 
                          style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Budget
                        </label>
                        <select
                          value={budgetInput}
                          onChange={(e) => setBudgetInput(e.target.value)}
                          className="w-full px-6 py-4 pr-12 rounded-xl text-lg appearance-none"
                          style={{ 
                            backgroundColor: '#FDF4E8', 
                            border: '2px solid #914600',
                            color: '#643100',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23914600' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 1rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          <option value="">Select your budget...</option>
                          <option value="Under KES 3,000">Under KES 3,000</option>
                          <option value="KES 3,000-5,000">KES 3,000-5,000</option>
                          <option value="KES 5,000-8,000">KES 5,000-8,000</option>
                          <option value="KES 8,000+">KES 8,000+</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-base font-medium mb-3" 
                          style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Time Preference
                        </label>
                        <select
                          value={timePreferenceInput}
                          onChange={(e) => setTimePreferenceInput(e.target.value)}
                          className="w-full px-6 py-4 pr-12 rounded-xl text-lg appearance-none"
                          style={{ 
                            backgroundColor: '#FDF4E8', 
                            border: '2px solid #914600',
                            color: '#643100',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23914600' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                            backgroundPosition: 'right 1rem center',
                            backgroundRepeat: 'no-repeat',
                            backgroundSize: '1.5em 1.5em'
                          }}
                        >
                          <option value="">Select preferred time...</option>
                          <option value="Morning">Morning (9AM-12PM)</option>
                          <option value="Afternoon">Afternoon (12PM-5PM)</option>
                          <option value="Evening">Evening (5PM-8PM)</option>
                          <option value="Flexible">Flexible</option>
                        </select>
                      </div>

                      <button
                        onClick={() => {
                          if (!desiredStyleInput || !budgetInput || !timePreferenceInput) {
                            alert('Please fill in all fields');
                            return;
                          }
                          // Trigger re-render with new data
                          setCurrentStep(1);
                        }}
                        disabled={!desiredStyleInput || !budgetInput || !timePreferenceInput}
                        className="w-full py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all mt-6 disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Continue to Booking
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 1: Style Confirmation */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl shadow-2xl"
              style={{ background: '#FFFBF5', border: '2px solid #914600', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}
            >
              <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>Your Style Choice</h2>
              
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
                  <div className="space-y-2" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    <p><strong>Duration:</strong> Lasts {styleCost.duration}</p>
                    <p><strong>Maintenance:</strong> Low</p>
                    <p><strong>Budget:</strong> {budget}</p>
                    <p><strong>Time Preference:</strong> {timePreference}</p>
                  </div>
                </div>
              </div>

              {/* Job Specification */}
              {jobSpec && (
                <div className="mb-8">
                  <SpecSummary spec={jobSpec} />
                </div>
              )}

              <button
                onClick={() => setCurrentStep(2)}
                className="w-full mt-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Continue to Date Selection
                <ArrowRight size={24} />
              </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time Selection */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl shadow-2xl"
              style={{ background: '#FFFBF5', border: '2px solid #914600', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}
            >
              <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>When Would You Like Your Appointment?</h2>
              
              <div className="mb-8">
                <h3 className="text-lg font-semibold mb-4" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Choose a Date</h3>
                <div className="grid grid-cols-7 gap-2">
                  {getAvailableDates().map(date => {
                    const dateString = date.toISOString().split('T')[0];
                    const isSelected = selectedDate === dateString;
                    return (
                    <button
                      key={date.toISOString()}
                        onClick={() => setSelectedDate(dateString)}
                        className="p-3 rounded-lg border-2 text-center transition-all"
                        style={{
                          borderColor: isSelected ? '#643100' : '#E5D4C1',
                          background: isSelected ? 'rgba(206, 147, 95, 0.2)' : '#FFFBF5',
                          fontFamily: 'Bricolage Grotesque, sans-serif'
                        }}
                      >
                        <p className="text-xs" style={{ color: '#914600' }}>{date.toLocaleDateString('en', { weekday: 'short' })}</p>
                        <p className="text-lg font-bold" style={{ color: '#643100' }}>{date.getDate()}</p>
                    </button>
                    );
                  })}
                </div>
              </div>

              {selectedDate && (
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Preferred Time</h3>
                  <div className="grid grid-cols-4 gap-3">
                    {['9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM'].map(time => {
                      const isSelected = selectedTime === time;
                      return (
                      <button
                        key={time}
                        onClick={() => setSelectedTime(time)}
                          className="p-3 rounded-lg border-2 font-semibold flex items-center justify-center gap-2 transition-all"
                          style={{
                            borderColor: isSelected ? '#643100' : '#E5D4C1',
                            background: isSelected ? 'rgba(206, 147, 95, 0.2)' : '#FFFBF5',
                            color: isSelected ? '#643100' : '#914600',
                            fontFamily: 'Bricolage Grotesque, sans-serif'
                          }}
                      >
                        <Clock size={16} />
                        {time}
                      </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: '#FDF4E8', color: '#914600', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedDate || !selectedTime}
                  className="flex-1 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Find Stylists
                  <ArrowRight size={20} />
                </button>
              </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Stylist Selection */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl shadow-2xl"
              style={{ background: '#FFFBF5', border: '2px solid #914600', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}
            >
              <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>Available Stylists for {desiredStyle}</h2>
              <p className="mb-6" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })} at {selectedTime}
              </p>

              <div className="space-y-4 mb-8">
                {matchedStylists.map(stylist => {
                  const isSelected = selectedStylist?.id === stylist.id;
                  return (
                  <div
                    key={stylist.id}
                      className="border-2 rounded-xl p-6 cursor-pointer transition-all hover:shadow-md"
                      style={{
                        borderColor: isSelected ? '#643100' : '#E5D4C1',
                        background: isSelected ? 'rgba(206, 147, 95, 0.1)' : '#FFFBF5'
                      }}
                    onClick={() => setSelectedStylist(stylist)}
                  >
                    <div className="flex gap-6">
                      <img
                        src={stylist.profile_image_url}
                        alt={stylist.name}
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                          <h3 className="text-xl font-bold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{stylist.name}</h3>
                          <p className="font-medium mb-2" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{stylist.business_name}</p>
                        
                          <div className="flex items-center gap-4 text-sm mb-3" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          <span className="flex items-center gap-1">
                            <Star className="text-yellow-400 fill-yellow-400" size={16} />
                            {stylist.average_rating} ({stylist.total_reviews} reviews)
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={16} />
                            {stylist.location_city}
                          </span>
                          <span className="font-semibold">
                            {priceRangeLabels[stylist.price_range as keyof typeof priceRangeLabels]}
                          </span>
                        </div>

                        <div className="flex gap-2 mb-3">
                          {stylist.specialties.slice(0, 3).map(specialty => (
                            <span
                              key={specialty}
                                className="text-xs px-2 py-1 rounded-full"
                                style={{ background: 'rgba(206, 147, 95, 0.2)', color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                            >
                              {specialty}
                            </span>
                          ))}
                        </div>

                        <div className="flex gap-2">
                          <a
                            href={`tel:${stylist.phone}`}
                              className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
                              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            <Phone size={14} />
                            Call
                          </a>
                          <a
                            href={`https://instagram.com/${stylist.instagram_handle.replace('@', '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm hover:opacity-80 transition-opacity"
                              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            <Instagram size={14} />
                            Instagram
                          </a>
                        </div>
                      </div>

                        {isSelected && (
                        <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#643100' }}>
                            <Check className="text-white" size={20} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  );
                })}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: '#FDF4E8', color: '#914600', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!selectedStylist}
                  className="flex-1 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Continue to Confirmation
                  <ArrowRight size={20} />
                </button>
              </div>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && !bookingConfirmed && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="rounded-2xl shadow-2xl"
              style={{ background: '#FFFBF5', border: '2px solid #914600', height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column' }}
            >
              <div className="p-8 overflow-y-auto flex-1">
              <h2 className="text-3xl font-bold mb-6" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>Confirm Your Booking</h2>

              <div className="rounded-xl p-6 mb-6" style={{ background: 'linear-gradient(135deg, rgba(206, 147, 95, 0.2), rgba(175, 85, 0, 0.1))' }}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Style</h3>
                    <p className="text-2xl font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>{desiredStyle}</p>
                    <p className="mt-2" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Estimated: ${styleCost.min} - ${styleCost.max}</p>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Date & Time</h3>
                    <p className="text-lg font-semibold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      {new Date(selectedDate).toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </p>
                    <p className="text-lg" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{selectedTime}</p>
                  </div>
                </div>
              </div>

              {selectedStylist && (
                <div className="rounded-xl p-6 mb-6" style={{ border: '2px solid #CE935F' }}>
                  <h3 className="font-semibold mb-4" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Your Stylist</h3>
                  <div className="flex items-center gap-4">
                    <img
                      src={selectedStylist.profile_image_url}
                      alt={selectedStylist.name}
                      className="w-20 h-20 rounded-xl object-cover"
                    />
                    <div>
                      <p className="text-xl font-bold" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{selectedStylist.name}</p>
                      <p className="font-medium" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>{selectedStylist.business_name}</p>
                      <p className="flex items-center gap-1 mt-1" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        <MapPin size={14} />
                        {selectedStylist.location_city}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-xl p-4 mb-6" style={{ background: 'rgba(255, 200, 100, 0.2)', border: '2px solid rgba(255, 200, 100, 0.5)' }}>
                <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  <strong>Note:</strong> This booking will be saved to your calendar and expenses will be tracked automatically. 
                  Contact the stylist directly to confirm availability.
                </p>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2"
                  style={{ background: '#FDF4E8', color: '#914600', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(135deg, #16a34a 0%, #059669 100%)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  <Check size={24} />
                  Confirm Booking
                </button>
              </div>
              </div>
            </motion.div>
          )}

          {/* Success Confirmation */}
          {bookingConfirmed && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl shadow-2xl p-12 text-center"
              style={{ background: '#FFFBF5', border: '2px solid #914600' }}
            >
              <div className="w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(22, 163, 74, 0.1)' }}>
                <Check className="text-green-600" size={48} />
              </div>

              <h2 className="text-4xl font-bold mb-4" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>Booking Confirmed! 🎉</h2>
              <p className="text-xl mb-4" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Your appointment has been saved
              </p>

              {/* Status Badge */}
              <div className="flex items-center justify-center gap-2 mb-8">
                <div className={`px-4 py-2 rounded-full text-sm font-semibold`}
                  style={{
                    background: bookingStatus === 'pending_quote' 
                      ? 'rgba(255, 200, 100, 0.3)' 
                    : bookingStatus === 'quote_submitted'
                      ? 'rgba(59, 130, 246, 0.2)'
                      : 'rgba(22, 163, 74, 0.2)',
                    color: bookingStatus === 'pending_quote'
                      ? '#92400e'
                    : bookingStatus === 'quote_submitted'
                      ? '#1e40af'
                      : '#15803d',
                    fontFamily: 'Bricolage Grotesque, sans-serif'
                  }}>
                  {bookingStatus === 'pending_quote' && '⏳ Waiting for Quote'}
                  {bookingStatus === 'quote_submitted' && '💰 Quote Received'}
                  {bookingStatus === 'confirmed' && '✅ Confirmed'}
                </div>
                {bookingStatus === 'quote_submitted' && (
                  <button
                    onClick={() => {
                      const bookingInfo = JSON.parse(localStorage.getItem('nywele-latest-booking') || '{}');
                      setQuote(bookingInfo.quote);
                    }}
                    className="text-sm font-medium underline hover:opacity-80 transition-opacity"
                    style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    View Quote
                  </button>
                )}
              </div>

              <div className="rounded-xl p-6 mb-8 text-left max-w-md mx-auto" style={{ background: 'rgba(206, 147, 95, 0.1)', border: '2px solid #CE935F' }}>
                <p className="mb-2" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}><strong>Style:</strong> {desiredStyle}</p>
                <p className="mb-2" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}><strong>Date:</strong> {new Date(selectedDate).toLocaleDateString()}</p>
                <p className="mb-2" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}><strong>Time:</strong> {selectedTime}</p>
                <p style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}><strong>Stylist:</strong> {selectedStylist?.name}</p>
              </div>

              {/* Quote Details Modal */}
              {quote && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setQuote(null)}>
                  <div className="rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto" style={{ background: '#FFFBF5' }} onClick={(e) => e.stopPropagation()}>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Quote from {selectedStylist?.name}</h3>
                    
                    {/* Products */}
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-800 mb-3">Products:</h4>
                      <div className="space-y-2">
                        {quote.products.map((p: any, idx: number) => (
                          <div key={idx} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">{p.item}</p>
                              <p className="text-sm text-gray-600">Qty: {p.quantity}</p>
                            </div>
                            <p className="font-semibold">KES {(p.subtotal_max || 0).toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Labor */}
                    <div className="p-4 rounded-lg mb-6" style={{ background: 'rgba(206, 147, 95, 0.2)' }}>
                      <div className="flex justify-between mb-2">
                        <span className="font-semibold" style={{ color: '#643100' }}>Labor Cost:</span>
                        <span className="font-bold" style={{ color: '#643100' }}>KES {quote.labor_cost_kes.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-lg">
                        <span className="font-bold" style={{ color: '#643100' }}>Total:</span>
                        <span className="font-bold" style={{ color: '#914600' }}>KES {quote.total_kes.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Notes */}
                    {quote.notes && (
                      <div className="p-4 bg-gray-50 rounded-lg mb-6">
                        <p className="text-sm font-semibold text-gray-700 mb-1">Notes:</p>
                        <p className="text-sm text-gray-600">{quote.notes}</p>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                      <button
                        onClick={() => {
                          const bookingInfo = JSON.parse(localStorage.getItem('nywele-latest-booking') || '{}');
                          bookingInfo.status = 'confirmed';
                          localStorage.setItem('nywele-latest-booking', JSON.stringify(bookingInfo));
                          setBookingStatus('confirmed');
                          setQuote(null);
                          alert('Booking confirmed! Your stylist will be notified.');
                        }}
                        className="flex-1 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                      >
                        ✅ Approve Quote
                      </button>
                      <button
                        onClick={() => setQuote(null)}
                        className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-3 max-w-md mx-auto">
                <button
                  onClick={() => router.push('/dashboard')}
                  className="py-3 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  <Sparkles size={20} />
                  View My Dashboard
                </button>
                {selectedStylist?.phone && (
                  <a
                    href={`tel:${selectedStylist.phone}`}
                    className="py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all flex items-center justify-center gap-2"
                    style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    📞 Call {selectedStylist.name}
                  </a>
                )}
                <button
                  onClick={() => {
                    // Clear the current booking data and reload the page
                    window.location.href = '/booking-flow';
                  }}
                  className="py-3 rounded-xl font-semibold transition-all"
                  style={{ background: '#FDF4E8', color: '#914600', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  Book Another Style
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function BookingFlow() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', backgroundColor: '#FFFBF5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <Loader className="animate-spin mx-auto mb-4" size={40} style={{ color: '#914600' }} />
          <p style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Loading booking flow...</p>
        </div>
      </div>
    }>
      <BookingFlowContent />
    </Suspense>
  );
}

