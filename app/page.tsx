'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Upload, Camera, Sparkles, ArrowRight, ArrowLeft, Image as ImageIcon, 
  DollarSign, Clock, Calendar, Check, Loader, ChevronRight 
} from 'lucide-react';
import { generateJobSpec, JobSpec } from '@/lib/specs';
import SpecSummary from '@/app/components/SpecSummary';
import { CURATED_STYLES } from '@/lib/imageLibrary';

// Mock stylist data (same as booking-flow)
const STYLISTS = [
  { id: '1', name: 'Amara', business_name: 'Elegant Braids Nairobi', phone: '+254712345678', skills: ['box-braids', 'knotless-braids', 'cornrows'], price_range: 'mid-range', availabilityHoursPerDay: 10, rating: 4.9, completedStyles: 127 },
  { id: '2', name: 'Nyambura', business_name: 'Natural Beauty Studio', phone: '+254723456789', skills: ['senegalese-twists', 'faux-locs', 'passion-twists'], price_range: 'premium', availabilityHoursPerDay: 8, rating: 4.8, completedStyles: 98 },
  { id: '3', name: 'Zawadi', business_name: 'Braiding Queens', phone: '+254734567890', skills: ['knotless-braids', 'goddess-locs', 'two-strand-twists'], price_range: 'budget', availabilityHoursPerDay: 12, rating: 4.7, completedStyles: 203 },
];

export default function Home() {
  const router = useRouter();
  
  // Multi-step form state
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;
  
  // Step 1: Style Selection
  const [desiredStyleSource, setDesiredStyleSource] = useState<'list' | 'upload'>('list');
  const [desiredStyle, setDesiredStyle] = useState('');
  const [inspirationImage, setInspirationImage] = useState<string | null>(null);
  const [budget, setBudget] = useState('');
  const [timePreference, setTimePreference] = useState('');
  const [currentHairImage, setCurrentHairImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [hairAnalysis, setHairAnalysis] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [jobSpec, setJobSpec] = useState<JobSpec | null>(null);
  
  // Step 2: Date/Time Selection
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  
  // Step 3: Stylist Selection
  const [matchedStylists, setMatchedStylists] = useState<typeof STYLISTS>([]);
  const [selectedStylist, setSelectedStylist] = useState<typeof STYLISTS[0] | null>(null);
  
  // Step 4: Confirmation
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  
  // Image loading state
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const [loadedImagesCount, setLoadedImagesCount] = useState(0);

  const popularStyles = [
    { name: 'Box Braids', slug: 'box-braids' },
    { name: 'Knotless Braids', slug: 'knotless-braids' },
    { name: 'Senegalese Twists', slug: 'senegalese-twists' },
    { name: 'Faux Locs', slug: 'faux-locs' },
    { name: 'Cornrows', slug: 'cornrows' },
    { name: 'Two-Strand Twists', slug: 'two-strand-twists' },
    { name: 'Passion Twists', slug: 'passion-twists' },
    { name: 'Goddess Locs', slug: 'goddess-locs' }
  ];
  
  // Get style image
  const getStyleImage = (styleName: string) => {
    const styleSlug = styleName.toLowerCase().replace(/\s+/g, '-');
    const styleData = CURATED_STYLES[styleSlug];
    return styleData?.images[0]?.url || '/images/styles/default-hair.jpg';
  };
  
  // Handle image load
  const handleImageLoad = () => {
    setLoadedImagesCount(prev => {
      const newCount = prev + 1;
      if (newCount === popularStyles.length) {
        setImagesLoaded(true);
      }
      return newCount;
    });
  };

  // Preload style images
  useEffect(() => {
    // Reset loading state when switching to list view
    if (desiredStyleSource === 'list') {
      setImagesLoaded(false);
      setLoadedImagesCount(0);
      
      // Preload images using native browser Image
      popularStyles.forEach((style) => {
        const img = document.createElement('img');
        img.src = getStyleImage(style.name);
      });
    }
  }, [desiredStyleSource]);

  // Generate job spec when style changes
  useEffect(() => {
    if (desiredStyle && desiredStyle !== 'custom-style') {
      const styleSlug = desiredStyle.toLowerCase().replace(/\s+/g, '-');
      const spec = generateJobSpec(styleSlug);
      if (spec) {
        setJobSpec(spec);
      }
    }
  }, [desiredStyle]);

  // Load matched stylists when moving to step 3
  useEffect(() => {
    if (currentStep === 3) {
      loadMatchedStylists();
    }
  }, [currentStep]);

  const loadMatchedStylists = () => {
    const styleSlug = desiredStyle.toLowerCase().replace(/\s+/g, '-');
    const requiredHours = jobSpec ? jobSpec.time_max_hours : 8;

    const budgetToPriceRange: Record<string, string[]> = {
      'KES 5,000-8,000': ['budget', 'mid-range'],
      'KES 8,000-12,000': ['mid-range'],
      'KES 12,000-15,000': ['mid-range', 'premium'],
      'KES 15,000+': ['premium']
    };

    const acceptablePriceRanges = budgetToPriceRange[budget] || ['budget', 'mid-range', 'premium'];

    const matched = STYLISTS.filter(stylist => {
      const hasSkill = stylist.skills.some(skill => 
        skill.includes(styleSlug) || styleSlug.includes(skill.split('-')[0])
      );
      const hasCapacity = stylist.availabilityHoursPerDay >= requiredHours;
      const inBudget = acceptablePriceRanges.includes(stylist.price_range);
      
      return hasSkill && hasCapacity && inBudget;
    }).sort((a, b) => b.rating - a.rating);

    setMatchedStylists(matched.length > 0 ? matched : STYLISTS.slice(0, 2));
  };

  const handleInspirationUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setInspirationImage(base64Image);
        setDesiredStyleSource('upload');
        
        setIsAnalyzing(true);
        try {
          const response = await fetch('/api/analyze-image', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, imageType: 'inspiration' })
          });

          const result = await response.json();

          if (result.success && result.data.detectedStyle) {
            const detectedStyle = result.data.detectedStyle.style;
            const matchedStyle = popularStyles.find(s => 
              s.slug === detectedStyle || s.name.toLowerCase().includes(detectedStyle.replace(/-/g, ' '))
            );
            
            if (matchedStyle) {
              setDesiredStyle(matchedStyle.name);
            } else {
              setDesiredStyle('custom-style');
            }
          } else {
            setDesiredStyle('custom-style');
          }
        } catch (error) {
          console.error('❌ Style detection error:', error);
          setDesiredStyle('custom-style');
        } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCurrentHairUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result as string;
        setCurrentHairImage(base64Image);
        
        setIsAnalyzing(true);
        setAnalysisError(null);
        try {
          const response = await fetch('/api/analyze-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64Image, imageType: 'current_hair' })
      });

      const result = await response.json();

      if (result.success) {
            setHairAnalysis(result.data);
            sessionStorage.setItem('hairType', result.data.hairType?.hairType || '4c');
      } else {
            setAnalysisError(result.message || 'Analysis failed');
      }
    } catch (error) {
          setAnalysisError('Vision API not configured. Continuing with manual selection.');
    } finally {
          setIsAnalyzing(false);
        }
      };
      reader.readAsDataURL(file);
    }
  };

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
    if (!jobSpec || !jobSpec.hair_extensions || !jobSpec.labor || !jobSpec.styling_products) {
      alert('Unable to generate job details for this style. Please try a different style or contact support.');
      return;
    }

    const bookingId = Date.now().toString();
    
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
      spec: jobSpec,
      status: 'pending_quote',
      bookedAt: new Date().toISOString()
    };

    localStorage.setItem('nywele-latest-booking', JSON.stringify(bookingInfo));

    const jobsInbox = JSON.parse(localStorage.getItem('nywele-jobs-inbox') || '[]');
    jobsInbox.push({
      bookingId,
      styleSlug: jobSpec.style_slug,
      styleName: jobSpec.style_name,
      spec: jobSpec,
      customerInfo: {
        hairType: hairAnalysis?.hairType?.hairType || 'Not specified',
        budget,
        timePreference,
        requestedDate: selectedDate,
        requestedTime: selectedTime
      },
      status: 'pending_quote',
      createdAt: new Date().toISOString()
    });
    localStorage.setItem('nywele-jobs-inbox', JSON.stringify(jobsInbox));

    setBookingConfirmed(true);
  };

  const canProceedToStep2 = desiredStyle && budget && timePreference;
  const canProceedToStep3 = selectedDate && selectedTime;
  const canProceedToStep4 = selectedStylist;

  const stepTitles = ['Choose Your Style', 'When Do You Want It?', 'Select Your Stylist', 'Confirm Booking'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        {/* Progress Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="text-center mb-6">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              Book Your Perfect Style
                </h1>
            <p className="text-gray-600">Complete the steps below to find your perfect salon match</p>
              </div>

          {/* Progress Bar */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      currentStep === step 
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white scale-110' 
                        : currentStep > step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}>
                      {currentStep > step ? <Check size={20} /> : step}
            </div>
                    <p className={`text-xs mt-2 text-center ${
                      currentStep === step ? 'text-purple-600 font-semibold' : 'text-gray-500'
                    }`}>
                      {stepTitles[index]}
                    </p>
                  </div>
                  {index < 3 && (
                    <div className={`h-1 flex-1 mx-2 transition-all ${
                      currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
              </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              {/* Hidden preloader images */}
              {desiredStyleSource === 'list' && !imagesLoaded && (
                <div className="hidden">
                  {popularStyles.map((style) => (
                    <Image
                      key={`preload-${style.slug}`}
                      src={getStyleImage(style.name)}
                      alt={style.name}
                      width={200}
                      height={200}
                      onLoad={handleImageLoad}
                      priority={true}
                    />
                  ))}
          </div>
              )}

              {/* Loading State - Show loader until images are ready */}
              {!imagesLoaded && desiredStyleSource === 'list' ? (
                <div className="flex flex-col items-center justify-center py-32">
                  <div className="w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mb-6"></div>
                  <p className="text-xl text-gray-600 font-medium">Loading styles...</p>
                  <p className="text-sm text-gray-500 mt-2">{loadedImagesCount} of {popularStyles.length} images loaded</p>
                </div>
              ) : (
                <>
              <h2 className="text-2xl font-bold text-gray-800 mb-6">What style do you want?</h2>

              {/* Style Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose how to select your style:</label>
                <div className="grid grid-cols-2 gap-4 mb-6">
              <button
                    onClick={() => setDesiredStyleSource('list')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      desiredStyleSource === 'list'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <Sparkles className={`mx-auto mb-2 ${desiredStyleSource === 'list' ? 'text-purple-600' : 'text-gray-400'}`} size={32} />
                    <p className="font-semibold text-gray-800">Choose from list</p>
                    <p className="text-xs text-gray-500 mt-1">Browse popular styles</p>
              </button>
              <button
                    onClick={() => setDesiredStyleSource('upload')}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      desiredStyleSource === 'upload'
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <ImageIcon className={`mx-auto mb-2 ${desiredStyleSource === 'upload' ? 'text-purple-600' : 'text-gray-400'}`} size={32} />
                    <p className="font-semibold text-gray-800">Upload inspiration</p>
                    <p className="text-xs text-gray-500 mt-1">Show us your desired look</p>
              </button>
                </div>

                {desiredStyleSource === 'list' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Select your desired style:</label>
                    
                    {/* Style Buttons with hidden images for preloading */}
                    <div className={`grid grid-cols-3 md:grid-cols-5 gap-5`}>
                      {popularStyles.map((style) => (
                        <button
                          key={style.slug}
                          onClick={() => setDesiredStyle(style.name)}
                          className={`group relative overflow-hidden rounded-full transition-shadow duration-200 ${
                            desiredStyle === style.name
                              ? 'ring-8 ring-purple-600 ring-offset-4'
                              : 'hover:ring-2 hover:ring-purple-300'
                          }`}
                        >
                          {/* Image Background */}
                          <div className="aspect-square relative pointer-events-none">
                            <Image
                              src={getStyleImage(style.name)}
                              alt={style.name}
                              fill
                              sizes="(max-width: 768px) 33vw, 20vw"
                              className="object-cover rounded-full"
                              priority={false}
                              quality={75}
                            />
                            {/* Gradient Overlay */}
                            <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-200 rounded-full ${
                              desiredStyle === style.name ? 'opacity-70' : 'opacity-50 group-hover:opacity-70'
                            }`} />
                            
                            {/* Style Name */}
                            <div className="absolute inset-0 flex items-center justify-center p-2">
                              <p className="text-white font-bold text-[10px] text-center drop-shadow-lg leading-tight">
                                {style.name}
                              </p>
            </div>
                            
                            {/* Selected Checkmark */}
                            {desiredStyle === style.name && (
                              <div className="absolute top-2 right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                <Check className="text-white" size={16} />
                              </div>
                            )}
          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Upload inspiration photo:</label>
                    {!inspirationImage ? (
                      <label className="block cursor-pointer">
                        <div className="border-2 border-dashed border-purple-300 rounded-xl p-12 text-center hover:border-purple-500 hover:bg-purple-50 transition-all">
                          <Upload className="mx-auto mb-3 text-purple-400" size={48} />
                          <p className="font-medium text-gray-700">Upload inspiration photo</p>
                          <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB</p>
          </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleInspirationUpload}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <div className="relative">
                        <img src={inspirationImage} alt="Inspiration" className="w-full h-64 object-cover rounded-xl" />
                        <button
                          onClick={() => {
                            setInspirationImage(null);
                            setDesiredStyle('');
                          }}
                          className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                        >
                          Remove
                        </button>
                        {desiredStyle && desiredStyle !== 'custom-style' && (
                          <div className="absolute bottom-4 left-4 bg-green-500 text-white px-4 py-2 rounded-lg text-sm">
                            Detected: {desiredStyle}
          </div>
                        )}
        </div>
                    )}
        </div>
                )}
              </div>

              {/* Optional: Current Hair Photo */}
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Optional: Upload your current hair photo
                </label>
                <p className="text-xs text-gray-500 mb-3">This helps stylists assess the work needed</p>
                {!currentHairImage ? (
                  <label className="block cursor-pointer">
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 hover:bg-white transition-all">
                      <Camera className="mx-auto mb-2 text-gray-400" size={36} />
                      <p className="font-medium text-gray-600 text-sm">Upload current hair</p>
                    </div>
                    <input type="file" accept="image/*" onChange={handleCurrentHairUpload} className="hidden" />
                  </label>
                ) : (
                  <div className="relative">
                    <img src={currentHairImage} alt="Current hair" className="w-full h-48 object-cover rounded-xl" />
                    <button
                      onClick={() => {
                        setCurrentHairImage(null);
                        setHairAnalysis(null);
                      }}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-lg text-xs"
                    >
                      Remove
                    </button>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-white/90 flex items-center justify-center rounded-xl">
                        <Loader className="animate-spin text-purple-600" size={32} />
                </div>
                    )}
              </div>
                )}
                </div>

              {/* Budget */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">What's your budget range?</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['KES 5,000-8,000', 'KES 8,000-12,000', 'KES 12,000-15,000', 'KES 15,000+'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setBudget(range)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        budget === range
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <DollarSign className="inline-block mr-1" size={16} />
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              {/* Time Preference */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">When are you available?</label>
                <div className="grid grid-cols-2 gap-3">
                  {['Morning (8AM-12PM)', 'Afternoon (12PM-5PM)', 'Evening (5PM-8PM)', 'Flexible'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setTimePreference(time)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        timePreference === time
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <Clock className="inline-block mr-1" size={16} />
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              {/* Job Spec Preview */}
              {jobSpec && (
                <div className="mb-8">
                  <SpecSummary spec={jobSpec} showTitle={true} />
            </div>
          )}

              {/* Navigation */}
              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!canProceedToStep2}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next: Choose Date & Time
                  <ArrowRight size={20} />
                </button>
              </div>
              </>
              )}
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">When do you want your style?</h2>

              {/* Selected Style Summary */}
              <div className="mb-6 p-4 bg-purple-50 rounded-xl">
                <p className="text-sm text-gray-600">Selected Style:</p>
                <p className="text-lg font-bold text-purple-600">{desiredStyle}</p>
                <p className="text-sm text-gray-600 mt-1">Budget: {budget}</p>
              </div>

              {/* Date Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose a date:</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {getAvailableDates().map((date) => (
                  <button
                      key={date.toISOString()}
                      onClick={() => setSelectedDate(date.toLocaleDateString('en-GB'))}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        selectedDate === date.toLocaleDateString('en-GB')
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      <Calendar className="inline-block mr-1" size={16} />
                      <div className="text-xs">{date.toLocaleDateString('en-US', { weekday: 'short' })}</div>
                      <div className="font-semibold">{date.getDate()}</div>
                      <div className="text-xs">{date.toLocaleDateString('en-US', { month: 'short' })}</div>
                  </button>
                ))}
                </div>
              </div>

              {/* Time Selection */}
              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-700 mb-3">Choose a time:</label>
                <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                  {['8:00 AM', '9:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '1:00 PM', '2:00 PM', '3:00 PM', '4:00 PM', '5:00 PM', '6:00 PM', '7:00 PM'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 transition-all text-sm ${
                        selectedTime === time
                          ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                          : 'border-gray-200 text-gray-700 hover:border-purple-300'
                      }`}
                    >
                      {time}
                    </button>
                  ))}
              </div>
            </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  disabled={!canProceedToStep3}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next: Choose Stylist
                  <ArrowRight size={20} />
                </button>
            </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Select your stylist</h2>

              {/* Booking Summary */}
              <div className="mb-6 p-4 bg-purple-50 rounded-xl grid md:grid-cols-3 gap-4">
              <div>
                  <p className="text-xs text-gray-600">Style:</p>
                  <p className="font-semibold text-purple-600">{desiredStyle}</p>
              </div>
                  <div>
                  <p className="text-xs text-gray-600">Date:</p>
                  <p className="font-semibold text-purple-600">{selectedDate}</p>
                  </div>
              <div>
                  <p className="text-xs text-gray-600">Time:</p>
                  <p className="font-semibold text-purple-600">{selectedTime}</p>
                </div>
              </div>

              {/* Stylists */}
              <div className="space-y-4 mb-8">
                {matchedStylists.map((stylist) => (
                  <motion.div
                    key={stylist.id}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setSelectedStylist(stylist)}
                    className={`p-6 rounded-xl border-2 cursor-pointer transition-all ${
                      selectedStylist?.id === stylist.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800">{stylist.name}</h3>
                        <p className="text-sm text-gray-600">{stylist.business_name}</p>
                        <div className="flex items-center gap-4 mt-3">
                          <div className="flex items-center gap-1">
                            <Sparkles className="text-yellow-500" size={16} />
                            <span className="text-sm font-semibold">{stylist.rating}</span>
                          </div>
                          <span className="text-sm text-gray-600">{stylist.completedStyles} styles completed</span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            stylist.price_range === 'budget' ? 'bg-green-100 text-green-700' :
                            stylist.price_range === 'mid-range' ? 'bg-blue-100 text-blue-700' :
                            'bg-purple-100 text-purple-700'
                          }`}>
                            {stylist.price_range}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-2">
                          Skills: {stylist.skills.map(s => s.replace(/-/g, ' ')).join(', ')}
                        </p>
                  </div>
                      {selectedStylist?.id === stylist.id && (
                        <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                          <Check className="text-white" size={20} />
                </div>
                      )}
                    </div>
                  </motion.div>
              ))}
            </div>

              {/* Navigation */}
              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
                >
                  <ArrowLeft size={20} />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  disabled={!canProceedToStep4}
                  className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  Next: Confirm Booking
                  <ArrowRight size={20} />
                </button>
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="bg-white rounded-2xl shadow-2xl p-8"
            >
              {!bookingConfirmed ? (
                <>
                  <h2 className="text-2xl font-bold text-gray-800 mb-6">Review and confirm your booking</h2>

                  {/* Full Booking Summary */}
                  <div className="space-y-6 mb-8">
                    <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
                      <h3 className="font-semibold text-gray-800 mb-4">Booking Details</h3>
                      <div className="grid md:grid-cols-2 gap-4">
                      <div>
                          <p className="text-sm text-gray-600">Style:</p>
                          <p className="font-semibold text-purple-600 text-lg">{desiredStyle}</p>
                      </div>
                  <div>
                          <p className="text-sm text-gray-600">Budget:</p>
                          <p className="font-semibold text-purple-600">{budget}</p>
                    </div>
                        <div>
                          <p className="text-sm text-gray-600">Date:</p>
                          <p className="font-semibold text-purple-600">{selectedDate}</p>
              </div>
                        <div>
                          <p className="text-sm text-gray-600">Time:</p>
                          <p className="font-semibold text-purple-600">{selectedTime}</p>
                        </div>
                  </div>
                </div>

                    {selectedStylist && (
                      <div className="p-6 bg-gray-50 rounded-xl">
                        <h3 className="font-semibold text-gray-800 mb-4">Your Stylist</h3>
                        <p className="text-lg font-bold text-gray-800">{selectedStylist.name}</p>
                        <p className="text-gray-600">{selectedStylist.business_name}</p>
                        <p className="text-gray-600 text-sm mt-2">{selectedStylist.phone}</p>
            </div>
          )}

                    {jobSpec && (
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-4">Cost Estimate</h3>
                        <SpecSummary spec={jobSpec} showTitle={false} />
                      </div>
                    )}
            </div>

                  {/* Navigation */}
                  <div className="flex justify-between">
              <button
                      onClick={() => setCurrentStep(3)}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
                    >
                      <ArrowLeft size={20} />
                Back
              </button>
                <button
                      onClick={handleConfirmBooking}
                      className="px-8 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
                    >
                      <Check size={20} />
                      Confirm Booking
                </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="text-center py-12"
                >
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="text-green-600" size={48} />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-4">Booking Confirmed!</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    Your booking request has been sent to {selectedStylist?.name}. You'll receive a quote soon.
                  </p>
                  <div className="flex gap-4 justify-center">
                <button
                      onClick={() => router.push('/dashboard')}
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
                    >
                      Go to Dashboard
                </button>
                    <button
                      onClick={() => router.push('/braiders')}
                      className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                    >
                      View Braider Dashboard
                </button>
            </div>
                </motion.div>
        )}
            </motion.div>
        )}
        </AnimatePresence>
      </div>
    </div>
  );
}
