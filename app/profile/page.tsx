'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Edit2, Save, ArrowRight, Calendar, Heart, Sparkles, Trash2, FileText, Plus } from 'lucide-react';

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
  hairType: '4a' | '4b' | '4c';
  hairGoals: string[];
  createdAt: string;
  savedRoutines?: SavedRoutine[];
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
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

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

  const deleteRoutine = (routineId: string) => {
    if (!profile || !confirm('Are you sure you want to delete this routine?')) return;

    const updatedRoutines = profile.savedRoutines?.filter(r => r.id !== routineId) || [];
    const updatedProfile = {
      ...profile,
      savedRoutines: updatedRoutines
    };

    localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  const updateRoutineNotes = (routineId: string, notes: string) => {
    if (!profile) return;

    const updatedRoutines = profile.savedRoutines?.map(r => 
      r.id === routineId ? { ...r, notes } : r
    ) || [];

    const updatedProfile = {
      ...profile,
      savedRoutines: updatedRoutines
    };

    localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  const viewRoutine = (routine: SavedRoutine) => {
    // Store the routine to be viewed
    localStorage.setItem('nywele-viewing-routine', JSON.stringify({
      hairAnalysis: routine.hairAnalysis,
      routine: routine.routine,
      isViewing: true
    }));
    
    // Navigate to hair-care page
    router.push('/hair-care');
  };

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-peach">
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

          {/* Saved Routines */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                <FileText className="text-purple-600" size={24} />
                Saved Routines
              </h3>
              <button
                onClick={() => router.push('/hair-care')}
                className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-medium hover:bg-purple-200 transition-all flex items-center gap-2"
              >
                <Plus size={16} />
                New Routine
              </button>
            </div>

            {!profile.savedRoutines || profile.savedRoutines.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                <p className="text-gray-500 mb-4">No saved routines yet</p>
                <button
                  onClick={() => router.push('/hair-care')}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Create Your First Routine
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.savedRoutines.map((routine, idx) => (
                  <div
                    key={routine.id}
                    className="border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">
                          {new Date(routine.createdAt).toLocaleDateString('en', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-3 py-1 bg-purple-50 text-purple-600 rounded-full text-xs font-semibold">
                            {routine.hairAnalysis?.hairType?.hairType || routine.hairAnalysis?.hairType || '4c'}
                          </span>
                          <span className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs font-semibold">
                            Health: {routine.hairAnalysis?.health?.healthScore || routine.hairAnalysis?.health?.score || 65}/100
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete routine"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Routine Summary */}
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs text-gray-600">Daily Steps</p>
                          <p className="text-lg font-bold text-gray-800">
                            {routine.routine?.personalizedRoutine?.daily?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Weekly Steps</p>
                          <p className="text-lg font-bold text-gray-800">
                            {routine.routine?.personalizedRoutine?.weekly?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-600">Monthly Steps</p>
                          <p className="text-lg font-bold text-gray-800">
                            {routine.routine?.personalizedRoutine?.monthly?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label className="text-xs text-gray-600 mb-1 block">Notes:</label>
                      <textarea
                        value={routine.notes || ''}
                        onChange={(e) => updateRoutineNotes(routine.id, e.target.value)}
                        placeholder="Add notes about this routine..."
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        rows={2}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)}
                        className="py-2 bg-purple-50 text-purple-600 rounded-lg text-sm font-semibold hover:bg-purple-100 transition-all"
                      >
                        {expandedRoutine === routine.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        onClick={() => viewRoutine(routine)}
                        className="py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        View Full Routine
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedRoutine === routine.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200 space-y-3">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Expected Results:</h4>
                          <p className="text-sm text-gray-600">
                            {routine.routine?.expectedResults?.timeline || 'View your routine for details'}
                          </p>
                          {routine.routine?.expectedResults?.improvements && (
                            <ul className="mt-2 space-y-1">
                              {routine.routine.expectedResults.improvements.slice(0, 3).map((imp: string, i: number) => (
                                <li key={i} className="text-xs text-gray-600 flex items-start gap-2">
                                  <span className="text-purple-600">•</span>
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Products Recommended:</h4>
                          {routine.routine?.productRecommendations?.essential && (
                            <div className="space-y-1">
                              {routine.routine.productRecommendations.essential.slice(0, 3).map((product: any, i: number) => (
                                <p key={i} className="text-xs text-gray-600">
                                  • {product.brand} - {product.name}
                                </p>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </motion.div>

          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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

