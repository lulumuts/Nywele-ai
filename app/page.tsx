'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Info } from 'lucide-react';
import Link from 'next/link';

export default function RefinedHairProfileForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hairType: '',
    porosity: '',
    concerns: [] as string[],
    currentStyle: '',
    desiredStyle: '',
    length: '',
    vibe: '',
    duration: '',
    goals: [] as string[], // Keep for backward compatibility with API
    durationPreference: '30 minutes', // Keep for backward compatibility
    ethnicity: 'Black Woman' // Keep for backward compatibility
  });

  const [step, setStep] = useState(1);

  // Expanded hair type options with descriptions
  const hairTypes = [
    {
      code: '4c',
      name: 'Type 4C',
      description: 'Tightly coiled, Z-pattern, 75%+ shrinkage',
      visual: '🌀🌀🌀'
    },
    {
      code: '4b',
      name: 'Type 4B',
      description: 'Sharp Z-pattern coils, 70-75% shrinkage',
      visual: '🌀🌀'
    },
    {
      code: '4a',
      name: 'Type 4A',
      description: 'Defined S-curls, springy, 50-70% shrinkage',
      visual: '🌀'
    },
    {
      code: '3c',
      name: 'Type 3C',
      description: 'Tight corkscrew curls, 30-50% shrinkage',
      visual: '〰️〰️'
    },
    {
      code: '3b',
      name: 'Type 3B',
      description: 'Loose corkscrew curls, bouncy ringlets',
      visual: '〰️'
    },
    {
      code: '3a',
      name: 'Type 3A',
      description: 'Loose spiral curls, defined wave pattern',
      visual: '〰'
    }
  ];

  // Porosity options with quiz helper
  const porosityOptions = [
    {
      level: 'low',
      name: 'Low Porosity',
      description: 'Products sit on hair, water beads up',
      tip: 'Best with: Lightweight products, heat for absorption'
    },
    {
      level: 'normal',
      name: 'Normal Porosity',
      description: 'Balanced moisture, holds styles well',
      tip: 'Best with: Most products work great'
    },
    {
      level: 'high',
      name: 'High Porosity',
      description: 'Absorbs quickly, dries fast, prone to frizz',
      tip: 'Best with: Heavy sealants, protein treatments'
    },
    {
      level: 'unsure',
      name: "I'm Not Sure",
      description: "We'll recommend balanced products",
      tip: 'Tip: Drop hair in water - sinks fast = high, floats = low'
    }
  ];

  // African hair-specific concerns
  const concernOptions = [
    { id: 'dryness', label: 'Dryness & Brittle Ends', icon: '💧' },
    { id: 'shrinkage', label: 'Managing Shrinkage', icon: '📏' },
    { id: 'breakage', label: 'Breakage & Weak Strands', icon: '⚡' },
    { id: 'scalp', label: 'Scalp Health (Dryness/Itching)', icon: '🌿' },
    { id: 'edges', label: 'Thinning Edges', icon: '👑' },
    { id: 'growth', label: 'Length Retention', icon: '📈' },
    { id: 'definition', label: 'Curl Definition', icon: '✨' },
    { id: 'frizz', label: 'Frizz Control', icon: '🌪️' }
  ];

  // Categorized styles
  const styleCategories = {
    protective: {
      label: 'Protective Styles',
      subtitle: 'Low maintenance, hide natural texture',
      styles: [
        { name: 'Box Braids', duration: '6-8 weeks', maintenance: 'Low' },
        { name: 'Passion Twists', duration: '4-6 weeks', maintenance: 'Low' },
        { name: 'Senegalese Twists', duration: '6-8 weeks', maintenance: 'Low' },
        { name: 'Faux Locs', duration: '8-12 weeks', maintenance: 'Very Low' },
        { name: 'Cornrows', duration: '2-4 weeks', maintenance: 'Low' },
        { name: 'Knotless Braids', duration: '4-6 weeks', maintenance: 'Low' },
        { name: 'Goddess Locs', duration: '6-8 weeks', maintenance: 'Low' }
      ]
    },
    natural: {
      label: 'Natural Styles',
      subtitle: 'Show your texture, embrace shrinkage',
      styles: [
        { name: 'Wash and Go', duration: '3-5 days', maintenance: 'Medium' },
        { name: 'Twist Out', duration: '3-7 days', maintenance: 'Low' },
        { name: 'Bantu Knot Out', duration: '3-5 days', maintenance: 'Medium' },
        { name: 'Braid Out', duration: '5-7 days', maintenance: 'Low' },
        { name: 'High Puff', duration: '1-2 days', maintenance: 'Low' },
        { name: 'Afro/TWA', duration: 'Daily', maintenance: 'High' },
        { name: 'Finger Coils', duration: '1 week', maintenance: 'Medium' }
      ]
    },
    lowManipulation: {
      label: 'Low Manipulation',
      subtitle: 'Minimal styling, gentle on hair',
      styles: [
        { name: 'Two-Strand Twists', duration: '1-2 weeks', maintenance: 'Low' },
        { name: 'Bantu Knots', duration: '1 week', maintenance: 'Low' },
        { name: 'Mini Twists', duration: '2-4 weeks', maintenance: 'Very Low' },
        { name: 'Flat Twists', duration: '1-2 weeks', maintenance: 'Low' }
      ]
    }
  };

  // Length options with shrinkage context
  const lengthOptions = [
    { value: 'ear', label: 'Ear-Length', stretched: '2-4 inches', shrunken: 'Close-cropped when natural' },
    { value: 'chin', label: 'Chin-Length', stretched: '4-6 inches', shrunken: 'Ear-length when natural' },
    { value: 'shoulder', label: 'Shoulder-Length', stretched: '6-10 inches', shrunken: 'Chin-length when natural' },
    { value: 'bra-strap', label: 'Bra-Strap Length', stretched: '10-16 inches', shrunken: 'Shoulder-length when natural' },
    { value: 'mid-back', label: 'Mid-Back', stretched: '16-22 inches', shrunken: 'Bra-strap when natural' }
  ];

  // Culturally relevant vibes
  const vibeOptions = [
    { 
      id: 'professional', 
      name: 'Corporate Professional', 
      emoji: '💼',
      description: 'Office-ready, polished, clean aesthetic'
    },
    { 
      id: 'editorial', 
      name: 'Magazine Editorial', 
      emoji: '📸',
      description: 'Bold, fashion-forward, dramatic'
    },
    { 
      id: 'everyday', 
      name: 'Everyday Natural', 
      emoji: '☀️',
      description: 'Casual, authentic, comfortable'
    },
    { 
      id: 'celebration', 
      name: 'Special Occasion', 
      emoji: '✨',
      description: 'Weddings, events, elegant'
    },
    { 
      id: 'workout', 
      name: 'Active Lifestyle', 
      emoji: '💪',
      description: 'Gym-ready, practical, secure'
    }
  ];

  const handleConcernToggle = (concernId: string) => {
    setFormData(prev => ({
      ...prev,
      concerns: prev.concerns.includes(concernId)
        ? prev.concerns.filter(c => c !== concernId)
        : prev.concerns.length < 3
        ? [...prev.concerns, concernId]
        : prev.concerns
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hairType || !formData.desiredStyle || !formData.vibe) {
      alert('Please complete all required fields');
      return;
    }

    setLoading(true);

    try {
      // Map concerns to goals for backward compatibility
      const mappedGoals = formData.concerns.map(concern => {
        const mapping: Record<string, string> = {
          'dryness': 'Moisture',
          'shrinkage': 'Definition',
          'breakage': 'Strength',
          'scalp': 'Repair',
          'edges': 'Growth',
          'growth': 'Growth',
          'definition': 'Definition',
          'frizz': 'Shine'
        };
        return mapping[concern] || 'Moisture';
      });

      const apiPayload = {
        ...formData,
        goals: mappedGoals.length > 0 ? mappedGoals : ['Moisture', 'Growth'],
        currentStyle: formData.desiredStyle // Use desired style as current for API
      };

      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiPayload)
      });

      const result = await response.json();

      if (result.success) {
        // Store results and form data in sessionStorage
        sessionStorage.setItem('recommendation', JSON.stringify(result.data));
        sessionStorage.setItem('hairType', formData.hairType);
        sessionStorage.setItem('currentStyle', formData.desiredStyle);
        sessionStorage.setItem('ethnicity', formData.ethnicity);
        sessionStorage.setItem('length', formData.length);
        sessionStorage.setItem('vibe', formData.vibe);
        sessionStorage.setItem('porosity', formData.porosity);
        sessionStorage.setItem('concerns', JSON.stringify(formData.concerns));
        router.push('/results');
      } else {
        alert('Failed to generate recommendation. Please try again.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nywele.ai
            </h1>
            <p className="text-gray-600 mt-1">AI-Powered African Hair Care</p>
          </div>
          <Link 
            href="/how-it-works"
            className="px-6 py-2 text-purple-600 hover:text-purple-700 font-semibold border-2 border-purple-600 hover:border-purple-700 rounded-lg transition-colors"
          >
            How It Works
          </Link>
        </div>
      </header>

      <div className="max-w-3xl mx-auto py-12 px-4">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Step {step} of 4</span>
            <span className="text-sm text-gray-500">{Math.round((step / 4) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-xl p-8 max-h-[75vh] overflow-y-auto">
          {/* Step 1: Hair Profile */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Your Hair Profile</h2>
                <p className="text-gray-600">Let's understand your beautiful texture</p>
              </div>

              {/* Hair Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Hair Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {hairTypes.map(type => (
                    <button
                      key={type.code}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, hairType: type.code }))}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        formData.hairType === type.code
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="text-2xl mb-1">{type.visual}</div>
                      <div className="font-semibold text-gray-800">{type.name}</div>
                      <div className="text-xs text-gray-600 mt-1">{type.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Porosity */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Hair Porosity
                </label>
                <div className="flex items-center gap-2 mb-3 text-xs text-gray-600">
                  <Info className="w-4 h-4" />
                  <span>How well your hair absorbs and retains moisture</span>
                </div>
                <div className="space-y-2">
                  {porosityOptions.map(option => (
                    <button
                      key={option.level}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, porosity: option.level }))}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        formData.porosity === option.level
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="font-semibold text-gray-800">{option.name}</div>
                      <div className="text-sm text-gray-600 mt-1">{option.description}</div>
                      <div className="text-xs text-purple-600 mt-2">{option.tip}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Length */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Current Length (Stretched)
                </label>
                <div className="space-y-2">
                  {lengthOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, length: option.value }))}
                      className={`w-full p-3 rounded-xl border-2 text-left transition-all ${
                        formData.length === option.value
                          ? 'border-purple-600 bg-purple-50'
                          : 'border-gray-200 hover:border-purple-300'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-semibold text-gray-800">{option.label}</div>
                          <div className="text-xs text-gray-500">{option.stretched} stretched • {option.shrunken}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Concerns */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">What Are Your Goals?</h2>
                <p className="text-gray-600">Select up to 3 main concerns</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {concernOptions.map(concern => (
                  <button
                    key={concern.id}
                    type="button"
                    onClick={() => handleConcernToggle(concern.id)}
                    disabled={!formData.concerns.includes(concern.id) && formData.concerns.length >= 3}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      formData.concerns.includes(concern.id)
                        ? 'border-purple-600 bg-purple-50'
                        : formData.concerns.length >= 3
                        ? 'border-gray-200 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{concern.icon}</div>
                    <div className="font-semibold text-sm text-gray-800">{concern.label}</div>
                  </button>
                ))}
              </div>

              <div className="text-sm text-gray-600 text-center">
                {formData.concerns.length}/3 selected
              </div>
            </div>
          )}

          {/* Step 3: Style Selection */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Choose Your Style</h2>
                <p className="text-gray-600">What look are you going for?</p>
              </div>

              {Object.entries(styleCategories).map(([key, category]) => (
                <div key={key} className="space-y-3">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800">{category.label}</h3>
                    <p className="text-sm text-gray-600">{category.subtitle}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {category.styles.map(style => (
                      <button
                        key={style.name}
                        type="button"
                        onClick={() => setFormData(prev => ({ 
                          ...prev, 
                          desiredStyle: style.name,
                          duration: style.duration 
                        }))}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          formData.desiredStyle === style.name
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <div className="font-semibold text-gray-800">{style.name}</div>
                        <div className="text-xs text-gray-600 mt-1">
                          {style.duration} • {style.maintenance} maintenance
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Step 4: Vibe */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Set the Vibe</h2>
                <p className="text-gray-600">What's the occasion or aesthetic?</p>
              </div>

              <div className="space-y-3">
                {vibeOptions.map(vibe => (
                  <button
                    key={vibe.id}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, vibe: vibe.id }))}
                    className={`w-full p-5 rounded-xl border-2 text-left transition-all ${
                      formData.vibe === vibe.id
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{vibe.emoji}</div>
                      <div>
                        <div className="font-semibold text-gray-800">{vibe.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{vibe.description}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                disabled={loading}
                className="px-6 py-3 text-purple-600 hover:bg-purple-50 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Back
              </button>
            )}
            
            <div className="ml-auto">
              {step < 4 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  disabled={
                    (step === 1 && (!formData.hairType || !formData.porosity || !formData.length)) ||
                    (step === 2 && formData.concerns.length === 0) ||
                    (step === 3 && !formData.desiredStyle)
                  }
                  className="flex items-center gap-2 px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!formData.vibe || loading}
                  className="px-8 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Get My Recommendations ✨'
                  )}
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
