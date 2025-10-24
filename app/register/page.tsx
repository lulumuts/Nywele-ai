'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Sparkles, ArrowRight, Check } from 'lucide-react';

interface SavedRoutine {
  id: string;
  createdAt: string;
  hairAnalysis: any;
  routine: any;
  notes?: string;
}

interface UserProfile {
  name: string;
  email: string;
  hairType: '4a' | '4b' | '4c' | '';
  hairGoals: string[];
  porosity?: 'low' | 'normal' | 'high' | '';
  length?: 'short' | 'medium' | 'long' | '';
  currentConcerns?: string[];
  budget?: 'low' | 'medium' | 'high' | '';
  climate?: 'dry' | 'humid' | 'temperate' | '';
  createdAt: string;
  savedRoutines?: SavedRoutine[];
}

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hairType, setHairType] = useState<'4a' | '4b' | '4c' | ''>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);
  const [porosity, setPorosity] = useState<'low' | 'normal' | 'high' | ''>('');
  const [length, setLength] = useState<'short' | 'medium' | 'long' | ''>('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [budget, setBudget] = useState<'low' | 'medium' | 'high' | ''>('');
  const [climate, setClimate] = useState<'dry' | 'humid' | 'temperate' | ''>('');

  const hairGoalOptions = [
    { id: 'growth', label: 'Hair Growth', emoji: '🌱' },
    { id: 'retention', label: 'Length Retention', emoji: '📏' },
    { id: 'moisture', label: 'Moisture Balance', emoji: '💧' },
    { id: 'health', label: 'Scalp Health', emoji: '✨' },
    { id: 'styles', label: 'Try New Styles', emoji: '💇🏾‍♀️' },
    { id: 'maintenance', label: 'Low Maintenance', emoji: '⏱️' }
  ];

  const concernOptions = [
    { id: 'dryness', label: 'Dryness', emoji: '🏜️' },
    { id: 'breakage', label: 'Breakage', emoji: '💔' },
    { id: 'thinning', label: 'Thinning', emoji: '📉' },
    { id: 'dandruff', label: 'Dandruff', emoji: '❄️' },
    { id: 'frizz', label: 'Frizz', emoji: '🌪️' },
    { id: 'tangles', label: 'Tangles', emoji: '🪢' }
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const toggleConcern = (concernId: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concernId)
        ? prev.filter(c => c !== concernId)
        : [...prev, concernId]
    );
  };

  const handleSubmit = () => {
    // Validate
    if (!name || !email || !hairType || selectedGoals.length === 0) {
      alert('Please complete all fields');
      return;
    }

    // Create user profile
    const profile: UserProfile = {
      name,
      email,
      hairType,
      hairGoals: selectedGoals,
      porosity: porosity || undefined,
      length: length || undefined,
      currentConcerns: selectedConcerns.length > 0 ? selectedConcerns : undefined,
      budget: budget || undefined,
      climate: climate || undefined,
      createdAt: new Date().toISOString(),
      savedRoutines: []
    };

    // Store in localStorage (will be Supabase later)
    localStorage.setItem('nywele-user-profile', JSON.stringify(profile));

    // Redirect to hair-care page
    router.push('/hair-care');
  };

  return (
    <div className="min-h-screen bg-peach">
      {/* Header */}
      <div className="bg-transparent backdrop-blur-sm border-b border-transparent">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <img src="/coil.svg" alt="Nywele.ai" className="w-8 h-8" />
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Caprasimo, serif', color: '#9E6240' }}>
              nywele.ai
          </h1>
          </div>
        </div>
      </div>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&display=swap');
      `}</style>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s === step 
                    ? 'text-white' 
                    : s < step 
                    ? 'text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}
                style={s <= step ? { backgroundColor: '#9E6240' } : {}}>
                  {s < step ? <Check size={20} /> : s}
                </div>
                {s < 5 && (
                  <div className={`w-12 h-1 ${s < step ? '' : 'bg-gray-200'}`} 
                    style={s < step ? { backgroundColor: '#9E6240' } : {}} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Step {step} of 5
            </p>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl shadow-xl p-8 border-2"
            style={{ backgroundColor: 'rgba(184, 125, 72, 0.3)', borderColor: '#9E6240' }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
                <User size={32} style={{ color: '#9E6240' }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#9E6240' }}>Welcome to Nywele.ai!</h2>
              <p style={{ color: '#914600' }}>Let's create your profile</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#914600' }}>
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent"
                  style={{ borderColor: '#9E6240', backgroundColor: 'white' }}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: '#914600' }}>
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent"
                  style={{ borderColor: '#9E6240', backgroundColor: 'white' }}
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name || !email}
                className="w-full py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#9E6240' }}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 2: Hair Type */}
        {step === 2 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl shadow-xl p-8 border-2"
            style={{ backgroundColor: 'rgba(184, 125, 72, 0.3)', borderColor: '#9E6240' }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
                <Sparkles size={32} style={{ color: '#9E6240' }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#9E6240' }}>What's Your Hair Type?</h2>
              <p style={{ color: '#914600' }}>This helps us personalize your recommendations</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {['4a', '4b', '4c'].map((type) => (
                <button
                  key={type}
                  onClick={() => setHairType(type as '4a' | '4b' | '4c')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    hairType === type
                      ? 'shadow-lg'
                      : ''
                  }`}
                  style={
                    hairType === type
                      ? { borderColor: '#9E6240', backgroundColor: 'rgba(254, 244, 230, 0.8)' }
                      : { borderColor: 'rgba(158, 98, 64, 0.3)', backgroundColor: 'white' }
                  }
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold mb-1" style={{ color: '#9E6240' }}>{type.toUpperCase()}</p>
                    <p className="text-xs" style={{ color: '#914600' }}>
                      {type === '4a' && 'Coily, S-pattern'}
                      {type === '4b' && 'Coily, Z-pattern'}
                      {type === '4c' && 'Tightly coiled'}
                    </p>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-4 border-2 rounded-xl font-semibold transition-all"
                style={{ borderColor: '#9E6240', color: '#914600', backgroundColor: 'white' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!hairType}
                className="flex-1 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#9E6240' }}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Hair Goals */}
        {step === 3 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl shadow-xl p-8 border-2"
            style={{ backgroundColor: 'rgba(184, 125, 72, 0.3)', borderColor: '#9E6240' }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
                <Sparkles size={32} style={{ color: '#9E6240' }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#9E6240' }}>What Are Your Hair Goals?</h2>
              <p style={{ color: '#914600' }}>Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {hairGoalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedGoals.includes(goal.id)
                      ? 'shadow-lg'
                      : ''
                  }`}
                  style={
                    selectedGoals.includes(goal.id)
                      ? { borderColor: '#9E6240', backgroundColor: 'rgba(254, 244, 230, 0.8)' }
                      : { borderColor: 'rgba(158, 98, 64, 0.3)', backgroundColor: 'white' }
                  }
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <p className="font-semibold" style={{ color: '#9E6240' }}>{goal.label}</p>
                    </div>
                    {selectedGoals.includes(goal.id) && (
                      <Check className="ml-auto" size={20} style={{ color: '#9E6240' }} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="rounded-xl p-4 mb-6" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
              <p className="text-sm text-center" style={{ color: '#914600' }}>
                Selected: <span className="font-bold">{selectedGoals.length}</span> goal(s)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 border-2 rounded-xl font-semibold transition-all"
                style={{ borderColor: '#9E6240', color: '#914600', backgroundColor: 'white' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={selectedGoals.length === 0}
                className="flex-1 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: '#9E6240' }}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 4: Hair Details */}
        {step === 4 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl shadow-xl p-8 border-2"
            style={{ backgroundColor: 'rgba(184, 125, 72, 0.3)', borderColor: '#9E6240' }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
                <Sparkles size={32} style={{ color: '#9E6240' }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#9E6240' }}>Tell Us More About Your Hair</h2>
              <p style={{ color: '#914600' }}>This helps us create better recommendations</p>
            </div>

            <div className="space-y-6">
              {/* Hair Porosity */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#914600' }}>Hair Porosity (Optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low' as const, label: 'Low', desc: 'Resists moisture' },
                    { value: 'normal' as const, label: 'Normal', desc: 'Balanced' },
                    { value: 'high' as const, label: 'High', desc: 'Absorbs quickly' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setPorosity(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all`}
                      style={
                        porosity === option.value
                          ? { borderColor: '#9E6240', backgroundColor: 'rgba(254, 244, 230, 0.8)' }
                          : { borderColor: 'rgba(158, 98, 64, 0.3)', backgroundColor: 'white' }
                      }
                    >
                      <p className="font-semibold mb-1" style={{ color: '#9E6240' }}>{option.label}</p>
                      <p className="text-xs" style={{ color: '#914600' }}>{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Hair Length */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#914600' }}>Current Hair Length (Optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'short' as const, label: 'Short', emoji: '✂️' },
                    { value: 'medium' as const, label: 'Medium', emoji: '💇🏾‍♀️' },
                    { value: 'long' as const, label: 'Long', emoji: '👩🏾‍🦱' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setLength(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all`}
                      style={
                        length === option.value
                          ? { borderColor: '#9E6240', backgroundColor: 'rgba(254, 244, 230, 0.8)' }
                          : { borderColor: 'rgba(158, 98, 64, 0.3)', backgroundColor: 'white' }
                      }
                    >
                      <p className="text-2xl mb-1">{option.emoji}</p>
                      <p className="font-semibold" style={{ color: '#9E6240' }}>{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Current Concerns */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#914600' }}>
                  Current Concerns (Optional)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {concernOptions.map((concern) => (
                    <button
                      key={concern.id}
                      onClick={() => toggleConcern(concern.id)}
                      className={`p-3 rounded-xl border-2 transition-all text-left`}
                      style={
                        selectedConcerns.includes(concern.id)
                          ? { borderColor: '#9E6240', backgroundColor: 'rgba(254, 244, 230, 0.8)' }
                          : { borderColor: 'rgba(158, 98, 64, 0.3)', backgroundColor: 'white' }
                      }
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{concern.emoji}</span>
                        <p className="text-sm font-semibold" style={{ color: '#9E6240' }}>{concern.label}</p>
                        {selectedConcerns.includes(concern.id) && (
                          <Check className="ml-auto" size={16} style={{ color: '#9E6240' }} />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setStep(3)}
                className="px-6 py-4 border-2 rounded-xl font-semibold transition-all"
                style={{ borderColor: '#9E6240', color: '#914600', backgroundColor: 'white' }}
              >
                Back
              </button>
              <button
                onClick={() => setStep(5)}
                className="flex-1 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: '#9E6240' }}
              >
                Continue
                <ArrowRight size={20} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 5: Budget & Environment */}
        {step === 5 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl shadow-xl p-8 border-2"
            style={{ backgroundColor: 'rgba(184, 125, 72, 0.3)', borderColor: '#9E6240' }}
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
                <Sparkles size={32} style={{ color: '#9E6240' }} />
              </div>
              <h2 className="text-3xl font-bold mb-2" style={{ color: '#9E6240' }}>Almost Done!</h2>
              <p style={{ color: '#914600' }}>Help us personalize product recommendations</p>
            </div>

            <div className="space-y-6">
              {/* Budget */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#914600' }}>
                  Monthly Hair Care Budget (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'low' as const, label: 'Budget', desc: 'Under KES 2,000' },
                    { value: 'medium' as const, label: 'Moderate', desc: 'KES 2,000 - 5,000' },
                    { value: 'high' as const, label: 'Premium', desc: 'Over KES 5,000' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setBudget(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all`}
                      style={
                        budget === option.value
                          ? { borderColor: '#9E6240', backgroundColor: 'rgba(254, 244, 230, 0.8)' }
                          : { borderColor: 'rgba(158, 98, 64, 0.3)', backgroundColor: 'white' }
                      }
                    >
                      <p className="font-semibold mb-1" style={{ color: '#9E6240' }}>{option.label}</p>
                      <p className="text-xs" style={{ color: '#914600' }}>{option.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Climate */}
              <div>
                <label className="block text-sm font-semibold mb-3" style={{ color: '#914600' }}>
                  Your Climate (Optional)
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'dry' as const, label: 'Dry', emoji: '☀️' },
                    { value: 'humid' as const, label: 'Humid', emoji: '💧' },
                    { value: 'temperate' as const, label: 'Temperate', emoji: '🌤️' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => setClimate(option.value)}
                      className={`p-4 rounded-xl border-2 transition-all`}
                      style={
                        climate === option.value
                          ? { borderColor: '#9E6240', backgroundColor: 'rgba(254, 244, 230, 0.8)' }
                          : { borderColor: 'rgba(158, 98, 64, 0.3)', backgroundColor: 'white' }
                      }
                    >
                      <p className="text-2xl mb-1">{option.emoji}</p>
                      <p className="font-semibold" style={{ color: '#9E6240' }}>{option.label}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-xl p-4 mt-6 mb-6" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
              <p className="text-sm text-center" style={{ color: '#914600' }}>
                🎉 You're all set! Click below to complete your registration
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(4)}
                className="px-6 py-4 border-2 rounded-xl font-semibold transition-all"
                style={{ borderColor: '#9E6240', color: '#914600', backgroundColor: 'white' }}
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
                style={{ backgroundColor: '#9E6240' }}
              >
                Complete Registration
                <Check size={20} />
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

