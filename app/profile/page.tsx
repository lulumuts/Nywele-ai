'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Edit2, Save, ArrowRight, Calendar, Heart, Sparkles } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  hairType: '4a' | '4b' | '4c';
  hairGoals: string[];
  createdAt: string;
  lastBooking?: {
    style: string;
    date: string;
    stylist: string;
  };
}

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedGoals, setEditedGoals] = useState<string[]>([]);

  const hairGoalOptions = [
    { id: 'growth', label: 'Hair Growth', emoji: '🌱' },
    { id: 'retention', label: 'Length Retention', emoji: '📏' },
    { id: 'moisture', label: 'Moisture Balance', emoji: '💧' },
    { id: 'health', label: 'Scalp Health', emoji: '✨' },
    { id: 'styles', label: 'Try New Styles', emoji: '💇🏾‍♀️' },
    { id: 'maintenance', label: 'Low Maintenance', emoji: '⏱️' }
  ];

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const storedProfile = localStorage.getItem('nywele-user-profile');
    const bookingData = localStorage.getItem('nywele-latest-booking');
    
    if (storedProfile) {
      const parsedProfile = JSON.parse(storedProfile);
      
      // Merge with booking data if available
      if (bookingData) {
        const booking = JSON.parse(bookingData);
        parsedProfile.lastBooking = {
          style: booking.desiredStyle,
          date: booking.date,
          stylist: booking.stylistInfo?.name || 'Stylist'
        };
      }
      
      setProfile(parsedProfile);
      setEditedGoals(parsedProfile.hairGoals);
    } else {
      // No profile - redirect to registration
      router.push('/register');
    }
  };

  const toggleGoal = (goalId: string) => {
    setEditedGoals(prev =>
      prev.includes(goalId)
        ? prev.filter(g => g !== goalId)
        : [...prev, goalId]
    );
  };

  const saveProfile = () => {
    if (!profile) return;

    const updatedProfile = {
      ...profile,
      hairGoals: editedGoals
    };

    localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
    setIsEditing(false);
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nywele.ai
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="text-white" size={40} />
          </div>
          <h2 className="text-4xl font-bold text-gray-800 mb-2">
            Welcome back, {profile.name}!
          </h2>
          <p className="text-gray-600">Manage your hair care profile</p>
        </motion.div>

        <div className="grid gap-6">
          {/* Basic Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <User className="text-purple-600" size={24} />
                Profile Information
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600">Name</label>
                <p className="text-lg font-semibold text-gray-800">{profile.name}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Email</label>
                <p className="text-lg font-semibold text-gray-800">{profile.email}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Hair Type</label>
                <p className="text-lg font-semibold text-gray-800">{profile.hairType.toUpperCase()}</p>
              </div>
              <div>
                <label className="text-sm text-gray-600">Member Since</label>
                <p className="text-lg font-semibold text-gray-800">
                  {new Date(profile.createdAt).toLocaleDateString('en', { 
                    month: 'long', 
                    day: 'numeric', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Hair Goals Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <Heart className="text-pink-600" size={24} />
                Hair Goals
              </h3>
              <button
                onClick={() => isEditing ? saveProfile() : setIsEditing(true)}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-medium hover:bg-purple-200 transition-all flex items-center gap-2"
              >
                {isEditing ? (
                  <>
                    <Save size={16} />
                    Save
                  </>
                ) : (
                  <>
                    <Edit2 size={16} />
                    Edit
                  </>
                )}
              </button>
            </div>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                {hairGoalOptions.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className={`p-3 rounded-xl border-2 transition-all text-left ${
                      editedGoals.includes(goal.id)
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-purple-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.emoji}</span>
                      <p className="text-sm font-semibold text-gray-800">{goal.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.hairGoals.map((goalId) => {
                  const goal = hairGoalOptions.find(g => g.id === goalId);
                  return goal ? (
                    <div
                      key={goalId}
                      className="px-4 py-2 bg-purple-50 border border-purple-200 rounded-full flex items-center gap-2"
                    >
                      <span>{goal.emoji}</span>
                      <span className="text-sm font-medium text-gray-800">{goal.label}</span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </motion.div>

          {/* Last Booking Card */}
          {profile.lastBooking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-xl p-6 border border-purple-200"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Calendar className="text-purple-600" size={24} />
                  Latest Booking
                </h3>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-sm text-gray-600">Style</label>
                  <p className="text-lg font-semibold text-gray-800 capitalize">
                    {profile.lastBooking.style.replace(/-/g, ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Date</label>
                  <p className="text-lg font-semibold text-gray-800">{profile.lastBooking.date}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Stylist</label>
                  <p className="text-lg font-semibold text-gray-800">{profile.lastBooking.stylist}</p>
                </div>
              </div>

              <button
                onClick={() => router.push('/')}
                className="mt-4 w-full py-3 bg-white text-purple-600 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                Book Another Style
                <ArrowRight size={20} />
              </button>
            </motion.div>
          )}

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="grid grid-cols-2 gap-4"
          >
            <button
              onClick={() => router.push('/recommendations')}
              className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all text-left"
            >
              <Sparkles className="text-yellow-600 mb-3" size={32} />
              <h4 className="font-bold text-gray-800 mb-1">Daily Tips</h4>
              <p className="text-sm text-gray-600">View your personalized recommendations</p>
            </button>

            <button
              onClick={() => router.push('/stylists')}
              className="p-6 bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all text-left"
            >
              <User className="text-purple-600 mb-3" size={32} />
              <h4 className="font-bold text-gray-800 mb-1">Find Stylists</h4>
              <p className="text-sm text-gray-600">Browse verified professionals</p>
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

