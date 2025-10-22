'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Sparkles, ArrowRight, Check } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  hairType: '4a' | '4b' | '4c' | '';
  hairGoals: string[];
  createdAt: string;
}

export default function Register() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [hairType, setHairType] = useState<'4a' | '4b' | '4c' | ''>('');
  const [selectedGoals, setSelectedGoals] = useState<string[]>([]);

  const hairGoalOptions = [
    { id: 'growth', label: 'Hair Growth', emoji: '🌱' },
    { id: 'retention', label: 'Length Retention', emoji: '📏' },
    { id: 'moisture', label: 'Moisture Balance', emoji: '💧' },
    { id: 'health', label: 'Scalp Health', emoji: '✨' },
    { id: 'styles', label: 'Try New Styles', emoji: '💇🏾‍♀️' },
    { id: 'maintenance', label: 'Low Maintenance', emoji: '⏱️' }
  ];

  const toggleGoal = (goalId: string) => {
    setSelectedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
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
      createdAt: new Date().toISOString()
    };

    // Store in localStorage (will be Supabase later)
    localStorage.setItem('nywele-user-profile', JSON.stringify(profile));

    // Redirect to recommendations
    router.push('/recommendations');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nywele.ai
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                  s === step 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
                    : s < step 
                    ? 'bg-green-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {s < step ? <Check size={20} /> : s}
                </div>
                {s < 3 && (
                  <div className={`w-12 h-1 ${s < step ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-4">
            <p className="text-sm text-gray-600">
              Step {step} of 3
            </p>
          </div>
        </div>

        {/* Step 1: Basic Info */}
        {step === 1 && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="text-purple-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome to Nywele.ai!</h2>
              <p className="text-gray-600">Let's create your profile</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <button
                onClick={() => setStep(2)}
                disabled={!name || !email}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-purple-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">What's Your Hair Type?</h2>
              <p className="text-gray-600">This helps us personalize your recommendations</p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              {['4a', '4b', '4c'].map((type) => (
                <button
                  key={type}
                  onClick={() => setHairType(type as '4a' | '4b' | '4c')}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    hairType === type
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-800 mb-1">{type.toUpperCase()}</p>
                    <p className="text-xs text-gray-600">
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
                className="px-6 py-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!hairType}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
            className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100"
          >
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Sparkles className="text-purple-600" size={32} />
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">What Are Your Hair Goals?</h2>
              <p className="text-gray-600">Select all that apply</p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-8">
              {hairGoalOptions.map((goal) => (
                <button
                  key={goal.id}
                  onClick={() => toggleGoal(goal.id)}
                  className={`p-4 rounded-xl border-2 transition-all text-left ${
                    selectedGoals.includes(goal.id)
                      ? 'border-purple-600 bg-purple-50 shadow-lg'
                      : 'border-gray-200 hover:border-purple-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{goal.emoji}</span>
                    <div>
                      <p className="font-semibold text-gray-800">{goal.label}</p>
                    </div>
                    {selectedGoals.includes(goal.id) && (
                      <Check className="text-purple-600 ml-auto" size={20} />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="bg-purple-50 rounded-xl p-4 mb-6">
              <p className="text-sm text-gray-700 text-center">
                Selected: <span className="font-bold">{selectedGoals.length}</span> goal(s)
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-all"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={selectedGoals.length === 0}
                className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

