'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    hairType: '',
    goals: [] as string[],
    currentStyle: '',
    durationPreference: '30 minutes'
  });

  const hairTypes = ['1a', '1b', '1c', '2a', '2b', '2c', '3a', '3b', '3c', '4a', '4b', '4c'];
  const goalOptions = ['Growth', 'Moisture', 'Strength', 'Shine', 'Definition', 'Repair'];
  const durations = ['15 minutes', '30 minutes', '45 minutes', '1 hour', '1+ hours'];

  const handleGoalToggle = (goal: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.includes(goal)
        ? prev.goals.filter(g => g !== goal)
        : [...prev.goals, goal]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.hairType || formData.goals.length === 0) {
      alert('Please select your hair type and at least one goal');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success) {
        // Store results in sessionStorage and navigate
        sessionStorage.setItem('recommendation', JSON.stringify(result.data));
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nywele.ai
          </h1>
          <p className="text-gray-600 mt-1">AI-Powered African Hair Care</p>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-5xl font-bold text-gray-900 mb-4">
            Your Personalized Hair Care Journey
          </h2>
          <p className="text-xl text-gray-600">
            Get expert recommendations tailored specifically for your hair type and goals
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-3xl shadow-2xl p-8 md:p-12">
          {/* Hair Type */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              What's your hair type?
            </label>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
              {hairTypes.map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, hairType: type }))}
                  className={`py-3 px-4 rounded-xl font-semibold transition-all ${
                    formData.hairType === type
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Goals */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              What are your hair goals? (Select all that apply)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {goalOptions.map(goal => (
                <button
                  key={goal}
                  type="button"
                  onClick={() => handleGoalToggle(goal)}
                  className={`py-3 px-6 rounded-xl font-medium transition-all ${
                    formData.goals.includes(goal)
                      ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {goal}
                </button>
              ))}
            </div>
          </div>

          {/* Current Style */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              Current hairstyle (optional)
            </label>
            <input
              type="text"
              value={formData.currentStyle}
              onChange={(e) => setFormData(prev => ({ ...prev, currentStyle: e.target.value }))}
              placeholder="e.g., Box braids, Twist out, Natural afro..."
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-900"
            />
          </div>

          {/* Duration */}
          <div className="mb-8">
            <label className="block text-lg font-semibold text-gray-900 mb-4">
              How much time do you have for hair care?
            </label>
            <select
              value={formData.durationPreference}
              onChange={(e) => setFormData(prev => ({ ...prev, durationPreference: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-purple-500 focus:outline-none text-gray-900"
            >
              {durations.map(duration => (
                <option key={duration} value={duration}>{duration}</option>
              ))}
            </select>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !formData.hairType || formData.goals.length === 0}
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              loading || !formData.hairType || formData.goals.length === 0
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl hover:scale-105'
            }`}
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Generating Your Perfect Routine...
              </span>
            ) : (
              'Get My Personalized Routine ✨'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}