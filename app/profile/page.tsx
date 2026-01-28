'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { User, Mail, Edit2, Save, ArrowRight, Calendar, Heart, Sparkles, Trash2, FileText, Plus } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { normalizeUserProfile, PROFILE_VERSION, type UserProfile, type SavedRoutine } from '@/types/userProfile';

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

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

  const densityOptions = [
    { id: 'low', label: 'Low' },
    { id: 'medium', label: 'Medium' },
    { id: 'high', label: 'High' }
  ] as const;

  const strandOptions = [
    { id: 'fine', label: 'Fine' },
    { id: 'medium', label: 'Medium' },
    { id: 'coarse', label: 'Coarse' }
  ] as const;

  const elasticityOptions = [
    { id: 'low', label: 'Low', description: 'Stretches a little, breaks easily' },
    { id: 'balanced', label: 'Balanced', description: 'Stretches and returns without breaking' },
    { id: 'high', label: 'High', description: 'Stretches a lot, may need strengthening' }
  ] as const;

  const scalpOptions = [
    { id: 'balanced', label: 'Balanced' },
    { id: 'dry', label: 'Dry' },
    { id: 'oily', label: 'Oily' },
    { id: 'flaky', label: 'Flaky' },
    { id: 'sensitive', label: 'Sensitive' }
  ] as const;

  const protectiveStyleOptions = [
    { id: 'rare', label: 'Rarely' },
    { id: 'occasional', label: 'Occasionally' },
    { id: 'regular', label: 'Regularly' },
    { id: 'continuous', label: 'Back-to-back' }
  ] as const;

  const activityOptions = [
    { id: 'low', label: 'Low' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'high', label: 'High / Very Active' }
  ] as const;

  const waterOptions = [
    { id: 'minimal', label: 'Minimal' },
    { id: 'hard-water', label: 'Hard Water' },
    { id: 'swimmer', label: 'Swimmer' },
    { id: 'frequent-chlorine', label: 'Frequent Chlorine' }
  ] as const;

  const allergyOptions = ['Coconut', 'Nut Oils', 'Aloe', 'Fragrance', 'Shea Butter'];
  const sensitivityOptions = ['Protein', 'Sulfates', 'Silicones', 'Drying Alcohols', 'Heavy Oils'];
  const preferenceOptions = ['Vegan', 'Cruelty Free', 'Sulfate Free', 'Silicone Free', 'Paraben Free'];

  const porosityOptions = [
    { id: 'low', label: 'Low', description: 'Resists moisture' },
    { id: 'normal', label: 'Normal', description: 'Balanced absorption' },
    { id: 'high', label: 'High', description: 'Absorbs quickly, loses moisture fast' }
  ] as const;

  const lengthOptions = [
    { id: 'short', label: 'Short', emoji: '✂️' },
    { id: 'medium', label: 'Medium', emoji: '💇🏾‍♀️' },
    { id: 'long', label: 'Long', emoji: '👩🏾‍🦱' }
  ] as const;

  const budgetOptions = [
    { id: 'low', label: 'Budget', description: 'Under KES 2,000' },
    { id: 'medium', label: 'Moderate', description: 'KES 2,000 - 5,000' },
    { id: 'high', label: 'Premium', description: 'Over KES 5,000' }
  ] as const;

  const climateOptions = [
    { id: 'dry', label: 'Dry', emoji: '☀️' },
    { id: 'humid', label: 'Humid', emoji: '💧' },
    { id: 'temperate', label: 'Temperate', emoji: '🌤️' }
  ] as const;

  const toggleSelectable = (value: string, list: string[], updater: (next: string[]) => void) => {
    updater(
      list.includes(value)
        ? list.filter((item: string) => item !== value)
        : [...list, value]
    );
  };

  const toggleEditedListValue = (
    field: 'currentConcerns' | 'ingredientAllergies' | 'ingredientSensitivities' | 'preferredProductAttributes',
    value: string
  ) => {
    setEditedProfile((prev: UserProfile | null) => {
      if (!prev) return prev;
      const existing = prev[field] || [];
      const next = existing.includes(value)
        ? existing.filter((item: string) => item !== value)
        : [...existing, value];
      return { ...prev, [field]: next } as UserProfile;
    });
  };

  useEffect(() => {
    // Set minimum loading time of 3 seconds (one full blob rotation)
    const minLoadingTimer = setTimeout(() => {
      setMinLoadingComplete(true);
    }, 3000);

    loadProfile();

    return () => clearTimeout(minLoadingTimer);
  }, []);

  const loadProfile = () => {
    const storedProfile = localStorage.getItem('nywele-user-profile');
    const bookingData = localStorage.getItem('nywele-latest-booking');
    
    if (storedProfile) {
      let normalizedProfile = normalizeUserProfile(JSON.parse(storedProfile));
      
      // Merge with booking data if available
      if (bookingData) {
        try {
        const booking = JSON.parse(bookingData);
          normalizedProfile = {
            ...normalizedProfile,
            lastBooking: {
          style: booking.desiredStyle,
          date: booking.date,
          stylist: booking.stylistInfo?.name || 'Stylist'
            }
          };
        } catch (error) {
          console.warn('Unable to parse latest booking information', error);
        }
      }

      const versionedProfile: UserProfile = {
        ...normalizedProfile,
        profileVersion: PROFILE_VERSION,
        savedRoutines: normalizedProfile.savedRoutines || []
      };

      localStorage.setItem('nywele-user-profile', JSON.stringify(versionedProfile));
      setProfile(versionedProfile);
    } else {
      // No profile - redirect to registration
      router.push('/register');
    }
  };

  const updateEditedProfile = (updates: Partial<UserProfile>) => {
    setEditedProfile((prev: UserProfile | null) => (prev ? { ...prev, ...updates } : prev));
  };

  const toggleGoal = (goalId: string) => {
    setEditedProfile((prev: UserProfile | null) => {
      if (!prev) return prev;
      const hasGoal = prev.hairGoals.includes(goalId);
      const updatedGoals = hasGoal
        ? prev.hairGoals.filter((goal: string) => goal !== goalId)
        : [...prev.hairGoals, goalId];
      return { ...prev, hairGoals: updatedGoals };
    });
  };

  const saveProfile = () => {
    if (!profile || !editedProfile) return;

    const mergedProfile = {
      ...profile,
      ...editedProfile,
      profileVersion: PROFILE_VERSION,
      savedRoutines: profile.savedRoutines || [],
      lastBooking: profile.lastBooking,
      createdAt: profile.createdAt
    };

    const normalized = normalizeUserProfile(mergedProfile);
    localStorage.setItem('nywele-user-profile', JSON.stringify(normalized));
    setProfile(normalized);
    setIsEditing(false);
    setEditedProfile(null);
  };

  const deleteRoutine = (routineId: string) => {
    if (!profile || !confirm('Are you sure you want to delete this routine?')) return;

    const updatedRoutines = profile.savedRoutines?.filter((routine: SavedRoutine) => routine.id !== routineId) || [];
    const updatedProfile = normalizeUserProfile({
      ...profile,
      profileVersion: PROFILE_VERSION,
      savedRoutines: updatedRoutines
    });

    localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  const updateRoutineNotes = (routineId: string, notes: string) => {
    if (!profile) return;

    const updatedRoutines = profile.savedRoutines?.map((r: SavedRoutine) => 
      r.id === routineId ? { ...r, notes } : r
    ) || [];

    const updatedProfile = normalizeUserProfile({
      ...profile,
      profileVersion: PROFILE_VERSION,
      savedRoutines: updatedRoutines
    });

    localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  const viewRoutine = (routine: SavedRoutine) => {
    // Store the routine in localStorage for the hair-care page to read
    localStorage.setItem('nywele-viewing-routine', JSON.stringify({
      hairAnalysis: routine.hairAnalysis,
      routine: routine.routine,
      isViewing: true
    }));
    
    // Navigate to hair-care page with query parameter to indicate viewing mode
    router.push('/hair-care?view=saved');
  };

  if (!profile || !minLoadingComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center relative" style={{ background: '#FDF4E8' }}>
        <style jsx>{`
          @keyframes blobPulse {
            0%, 100% {
              transform: translate(-50%, -50%) scale(1);
            }
            50% {
              transform: translate(-50%, -50%) scale(1.05);
            }
          }
        `}</style>
        
        <div style={{ position: 'relative', width: '400px', height: '400px' }}>
          {/* Outer Blob - Stroke Only */}
          <svg 
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'blobPulse 2s ease-in-out infinite',
              width: '340px',
              height: '340px',
              overflow: 'visible',
              opacity: 0.3
            }}
            viewBox="0 0 620 603" 
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M336.327 1.48572C414.231 9.60864 473.115 66.7872 518.604 130.55C574.65 209.11 638.43 296.033 612.844 389.082C584.309 492.855 495.991 583.359 389.609 599.667C291.749 614.669 219.14 525.124 143.712 460.998C79.7729 406.64 -0.331203 353.001 0.761041 269.085C1.81384 188.2 85.2711 142.397 148.515 91.962C205.675 46.3795 263.612 -6.09616 336.327 1.48572Z" 
              stroke="#643100" 
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {/* Middle Blob - Stroke Only */}
          <svg 
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'blobPulse 2s ease-in-out infinite 0.3s',
              width: '340px',
              height: '340px',
              overflow: 'visible',
              opacity: 0.5
            }}
            viewBox="0 0 604 606" 
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M377.17 5.77053C452.755 26.3143 501.678 92.217 536.323 162.465C579.008 249.014 627.981 345.062 587.766 432.786C542.917 530.62 441.195 605.745 333.575 604.736C234.577 603.807 177.311 503.753 113.175 428.333C58.8083 364.4 -11.6287 298.579 2.94255 215.931C16.9875 136.267 106.724 104.48 177.255 64.8706C241 29.0722 306.62 -13.4049 377.17 5.77053Z" 
              stroke="#643100" 
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {/* Inner Blob - Stroke Only */}
          <svg 
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
              animation: 'blobPulse 2s ease-in-out infinite 0.6s',
              width: '340px',
              height: '340px',
              overflow: 'visible',
              opacity: 0.7
            }}
            viewBox="0 0 624 605" 
            fill="none"
            preserveAspectRatio="xMidYMid meet"
          >
            <path 
              fillRule="evenodd" 
              clipRule="evenodd" 
              d="M390.524 3.70487C463.396 17.8137 515.846 77.3794 554.759 140.765C602.232 218.935 657.832 306.799 638.118 397.175C615.532 500.107 533.028 589.582 428.839 602.686C333.506 614.635 256.959 528.525 178.009 468.089C109.669 416.261 23.8254 368.185 7.61277 286.486C-7.94113 207.589 65.6438 152.13 128.074 97.3488C184.523 47.5069 322.675 -9.48221 390.524 3.70487Z" 
              stroke="#643100" 
              strokeWidth="2"
              fill="none"
            />
          </svg>

          {/* Loading Text */}
          <div style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center'
          }}>
            <span className="text-2xl font-bold" 
              style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
              Loading...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative" style={{ background: '#FDF4E8' }}>
        {/* Wavy Background Pattern */}
        <div style={{
          position: 'fixed',
          width: '150vmax',
          height: '150vmax',
          left: '27%',
          top: '103%',
          transform: 'translate(-50%, -50%) rotate(10deg)',
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='500' height='1024' viewBox='0 0 500 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M136.159 -64.5C495.422 135 532.329 334.5 246.879 534C-38.5715 733.5 -75.4781 933 136.159 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M149.069 -64.5C495.646 135 526.209 334.5 240.759 534C-44.6907 733.5 -75.2541 933 149.069 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M162.277 -64.5C496.167 135 520.387 334.5 234.937 534C-50.5129 733.5 -74.7329 933 162.277 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M175.761 -64.5C496.964 135 514.841 334.5 229.391 534C-56.0589 733.5 -73.9356 933 175.761 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M189.502 -64.5C498.019 135 509.552 334.5 224.102 534C-61.3482 733.5 -72.8815 933 189.502 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M203.482 -64.5C499.312 135 504.502 334.5 219.052 534C-66.3979 733.5 -71.5879 933 203.482 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M217.686 -64.5C500.829 135 499.676 334.5 214.226 534C-71.224 733.5 -70.0707 933 217.686 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M232.099 -64.5C502.556 135 495.059 334.5 209.609 534C-75.841 733.5 -68.3444 933 232.099 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M246.708 -64.5C504.478 135 490.638 334.5 205.188 534C-80.2623 733.5 -66.4223 933 246.708 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M261.5 -64.5C506.583 135 486.4 334.5 200.95 534C-84.4999 733.5 -64.3166 933 261.5 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M276.465 -64.5C508.862 135 482.335 334.5 196.885 534C-88.5651 733.5 -62.0384 933 276.465 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M291.592 -64.5C511.302 135 478.432 334.5 192.982 534C-92.4681 733.5 -59.5981 933 291.592 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M306.871 -64.5C513.895 135 474.681 334.5 189.231 534C-96.2186 733.5 -57.0052 933 306.871 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M322.295 -64.5C516.631 135 471.075 334.5 185.625 534C-99.8252 733.5 -54.2686 933 322.295 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M337.854 -64.5C519.504 135 467.604 334.5 182.154 534C-103.296 733.5 -51.3962 933 337.854 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M353.541 -64.5C522.504 135 464.261 334.5 178.811 534C-106.639 733.5 -48.3956 933 353.541 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M369.345 -64.5C525.622 135 461.035 334.5 175.585 534C-109.865 733.5 -45.2779 933 369.345 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M385.268 -64.5C528.858 135 457.928 334.5 172.478 534C-112.972 733.5 -42.0421 933 385.268 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M401.299 -64.5C532.202 135 454.929 334.5 169.479 534C-115.971 733.5 -38.6976 933 401.299 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M417.433 -64.5C535.65 135 452.033 334.5 166.583 534C-118.867 733.5 -35.25 933 417.433 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M433.665 -64.5C539.195 135 449.235 334.5 163.785 534C-121.665 733.5 -31.7046 933 433.665 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M449.991 -64.5C542.834 135 446.531 334.5 161.081 534C-124.369 733.5 -28.0661 933 449.991 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M466.404 -64.5C546.561 135 443.914 334.5 158.464 534C-126.986 733.5 -24.3393 933 466.404 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }} />

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        `}</style>

        <div className="relative z-10 max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ background: '#AF5500' }}>
            <User style={{ color: '#FDF4E8' }} size={40} />
          </div>
          <h2 className="text-4xl font-bold mb-2" 
            style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            Welcome back, {profile.name}!
          </h2>
          <p style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Manage your hair care profile
          </p>
        </motion.div>

        <div className="grid gap-6">
          {/* Basic Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl shadow-xl p-6"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                <User style={{ color: '#AF5500' }} size={24} />
                Profile Information
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Name
                </label>
                <p className="text-lg font-semibold" 
                  style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {profile.name}
                </p>
              </div>
              <div>
                <label className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Email
                </label>
                <p className="text-lg font-semibold" 
                  style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {profile.email}
                </p>
              </div>
              <div>
                <label className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Hair Type
                </label>
                <p className="text-lg font-semibold" 
                  style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {profile.hairType.toUpperCase()}
                </p>
              </div>
              <div>
                <label className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Member Since
                </label>
                <p className="text-lg font-semibold" 
                  style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
            className="rounded-2xl shadow-xl p-6"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                <Heart style={{ color: '#AF5500' }} size={24} />
                Hair Goals
              </h3>
              <div className="flex items-center gap-2">
                {isEditing && (
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditedProfile(null);
                    }}
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{ 
                      background: 'rgba(175, 85, 0, 0.1)', 
                      color: '#AF5500',
                      border: '1px solid #AF5500',
                      fontFamily: 'Bricolage Grotesque, sans-serif'
                    }}
                  >
                    Cancel
                  </button>
                )}
                <button
                  onClick={() => {
                    if (isEditing) {
                      saveProfile();
                    } else {
                      if (profile) {
                        setEditedProfile({ ...profile });
                        setIsEditing(true);
                      }
                    }
                  }}
                  className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                  style={{ 
                    background: '#AF5500', 
                    color: '#FDF4E8',
                    fontFamily: 'Bricolage Grotesque, sans-serif'
                  }}
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
            </div>

            {isEditing ? (
              <div className="grid grid-cols-2 gap-3">
                {hairGoalOptions.map((goal) => (
                  <button
                    key={goal.id}
                    onClick={() => toggleGoal(goal.id)}
                    className="p-3 rounded-xl border-2 transition-all text-left"
                    style={editedProfile?.hairGoals.includes(goal.id) ? {
                      borderColor: '#AF5500',
                      background: 'rgba(175, 85, 0, 0.1)'
                    } : {
                      borderColor: '#914600',
                      background: 'white'
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xl">{goal.emoji}</span>
                      <p className="text-sm font-semibold" 
                        style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {goal.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {profile.hairGoals.map((goalId: string) => {
                  const goal = hairGoalOptions.find(g => g.id === goalId);
                  return goal ? (
                    <div
                      key={goalId}
                      className="px-4 py-2 rounded-full flex items-center gap-2"
                      style={{ background: 'rgba(175, 85, 0, 0.2)', border: '1px solid #AF5500' }}
                    >
                      <span>{goal.emoji}</span>
                      <span className="text-sm font-medium" 
                        style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {goal.label}
                      </span>
                    </div>
                  ) : null;
                })}
              </div>
            )}
          </motion.div>

          {/* Hair Health Profile */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-2xl shadow-xl p-6"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
              <Sparkles style={{ color: '#AF5500' }} size={24} />
              Hair Health Profile
            </h3>

            {isEditing ? (
              editedProfile ? (
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Hair Porosity</p>
                      <div className="space-y-2">
                        {porosityOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ hairPorosity: option.id })}
                            className="w-full px-4 py-3 rounded-xl border-2 text-left transition-all"
                            style={editedProfile.hairPorosity === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold block" style={{ color: '#643100' }}>{option.label}</span>
                            <span className="text-xs" style={{ color: '#914600' }}>{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Hair Length</p>
                      <div className="flex flex-wrap gap-3">
                        {lengthOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ hairLength: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.hairLength === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="text-xl mr-2">{option.emoji}</span>
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Hair Density</p>
                      <div className="flex flex-wrap gap-3">
                        {densityOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ hairDensity: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.hairDensity === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Strand Thickness</p>
                      <div className="flex flex-wrap gap-3">
                        {strandOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ strandThickness: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.strandThickness === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Elasticity</p>
                      <div className="space-y-2">
                        {elasticityOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ elasticity: option.id })}
                            className="w-full px-4 py-3 rounded-xl border-2 text-left transition-all"
                            style={editedProfile.elasticity === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold block" style={{ color: '#643100' }}>{option.label}</span>
                            <span className="text-xs" style={{ color: '#914600' }}>{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Scalp Condition</p>
                      <div className="flex flex-wrap gap-3">
                        {scalpOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ scalpCondition: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.scalpCondition === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Current Concerns</p>
                    <div className="flex flex-wrap gap-2">
                      {concernOptions.map((concern) => (
                        <button
                          key={concern.id}
                          onClick={() => toggleEditedListValue('currentConcerns', concern.id)}
                          className="px-3 py-2 rounded-lg border-2 text-sm transition-all flex items-center gap-2"
                          style={editedProfile.currentConcerns.includes(concern.id)
                            ? { borderColor: '#9E6240', background: 'rgba(158, 98, 64, 0.2)', color: '#643100' }
                            : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white', color: '#914600' }}
                        >
                          <span>{concern.emoji}</span>
                          <span>{concern.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Budget</p>
                      <div className="space-y-2">
                        {budgetOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ budget: option.id })}
                            className="w-full px-4 py-3 rounded-xl border-2 text-left transition-all"
                            style={editedProfile.budget === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold block" style={{ color: '#643100' }}>{option.label}</span>
                            <span className="text-xs" style={{ color: '#914600' }}>{option.description}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Climate</p>
                      <div className="flex flex-wrap gap-3">
                        {climateOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ climate: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.climate === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="text-xl mr-2">{option.emoji}</span>
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Wash Frequency / Week</p>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step="0.5"
                        value={editedProfile.washFrequencyPerWeek ?? ''}
                        onChange={(event) => updateEditedProfile({
                          washFrequencyPerWeek: event.target.value === '' ? null : Number(event.target.value)
                        })}
                        className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent"
                        style={{ borderColor: '#9E6240', background: 'white', color: '#643100' }}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Protective Style Frequency</p>
                      <div className="flex flex-wrap gap-3">
                        {protectiveStyleOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ protectiveStyleFrequency: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.protectiveStyleFrequency === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-3">
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Activity Level</p>
                      <div className="flex flex-wrap gap-3">
                        {activityOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ activityLevel: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.activityLevel === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Water Exposure</p>
                      <div className="flex flex-wrap gap-3">
                        {waterOptions.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => updateEditedProfile({ waterExposure: option.id })}
                            className="px-4 py-3 rounded-xl border-2 transition-all"
                            style={editedProfile.waterExposure === option.id
                              ? { borderColor: '#9E6240', background: 'rgba(254, 244, 230, 0.8)' }
                              : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white' }}
                          >
                            <span className="font-semibold" style={{ color: '#643100' }}>{option.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Ingredient Allergies</p>
                    <div className="flex flex-wrap gap-2">
                      {allergyOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => toggleEditedListValue('ingredientAllergies', option)}
                          className="px-3 py-2 rounded-lg border-2 text-sm transition-all"
                          style={editedProfile.ingredientAllergies.includes(option)
                            ? { borderColor: '#9E6240', background: 'rgba(158, 98, 64, 0.2)', color: '#643100' }
                            : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white', color: '#914600' }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Sensitivities / Things to Limit</p>
                    <div className="flex flex-wrap gap-2">
                      {sensitivityOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => toggleEditedListValue('ingredientSensitivities', option)}
                          className="px-3 py-2 rounded-lg border-2 text-sm transition-all"
                          style={editedProfile.ingredientSensitivities.includes(option)
                            ? { borderColor: '#9E6240', background: 'rgba(158, 98, 64, 0.2)', color: '#643100' }
                            : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white', color: '#914600' }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Product Preferences</p>
                    <div className="flex flex-wrap gap-2">
                      {preferenceOptions.map((option) => (
                        <button
                          key={option}
                          onClick={() => toggleEditedListValue('preferredProductAttributes', option)}
                          className="px-3 py-2 rounded-lg border-2 text-sm transition-all"
                          style={editedProfile.preferredProductAttributes.includes(option)
                            ? { borderColor: '#9E6240', background: 'rgba(158, 98, 64, 0.2)', color: '#643100' }
                            : { borderColor: 'rgba(158, 98, 64, 0.3)', background: 'white', color: '#914600' }}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Current Routine Notes</p>
                    <textarea
                      value={editedProfile.currentRegimenNotes ?? ''}
                      onChange={(event) => updateEditedProfile({ currentRegimenNotes: event.target.value })}
                      rows={3}
                      className="w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:border-transparent"
                      style={{ borderColor: '#9E6240', background: 'white', color: '#643100', resize: 'vertical' }}
                      placeholder="Products you rotate, areas of focus, reactions to note..."
                    />
                  </div>
                </div>
              ) : null
            ) : (
              <div className="space-y-6">
                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Hair & Scalp Snapshot</p>
                  <div className="flex flex-wrap gap-2">
                    {[{
                      label: 'Porosity',
                      value: profile.hairPorosity
                    }, {
                      label: 'Length',
                      value: profile.hairLength
                    }, {
                      label: 'Density',
                      value: profile.hairDensity
                    }, {
                      label: 'Strand Thickness',
                      value: profile.strandThickness
                    }, {
                      label: 'Elasticity',
                      value: profile.elasticity
                    }, {
                      label: 'Scalp',
                      value: profile.scalpCondition
                    }].map((item) => (
                      <div
                        key={item.label}
                        className="px-3 py-2 rounded-full text-sm"
                        style={{ background: 'rgba(175, 85, 0, 0.2)', border: '1px solid #AF5500', color: '#643100' }}
                      >
                        <span className="font-semibold mr-1">{item.label}:</span>
                        <span className="capitalize">{item.value || 'Not set'}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Primary Concerns</p>
                  {profile.currentConcerns.length ? (
                    <div className="flex flex-wrap gap-2">
                      {profile.currentConcerns.map((concernId: string) => {
                        const concern = concernOptions.find((item) => item.id === concernId);
                        return concern ? (
                          <div key={concernId} className="px-3 py-2 rounded-full text-sm flex items-center gap-2"
                            style={{ background: 'rgba(175, 85, 0, 0.2)', border: '1px solid #AF5500', color: '#643100' }}>
                            <span>{concern.emoji}</span>
                            <span>{concern.label}</span>
                          </div>
                        ) : null;
                      })}
                    </div>
                  ) : (
                    <p className="text-sm" style={{ color: '#914600' }}>No concerns set yet.</p>
                  )}
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Budget & Climate</p>
                    <div className="space-y-1 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      <div><span className="font-semibold">Budget:</span> {profile.budget || 'Not set'}</div>
                      <div><span className="font-semibold">Climate:</span> {profile.climate || 'Not set'}</div>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Routine Overview</p>
                    <div className="space-y-1 text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      <div><span className="font-semibold">Wash Frequency:</span> {profile.washFrequencyPerWeek !== null ? `${profile.washFrequencyPerWeek} / week` : 'Not set'}</div>
                      <div><span className="font-semibold">Protective Styles:</span> {profile.protectiveStyleFrequency || 'Not set'}</div>
                      <div><span className="font-semibold">Activity Level:</span> {profile.activityLevel || 'Not set'}</div>
                      <div><span className="font-semibold">Water Exposure:</span> {profile.waterExposure || 'Not set'}</div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Ingredient Notes</p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs uppercase tracking-wide" style={{ color: '#AF5500' }}>Allergies</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.ingredientAllergies.length ? profile.ingredientAllergies.map((item: string) => (
                          <span key={item} className="px-3 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(175, 85, 0, 0.2)', border: '1px solid #AF5500', color: '#643100' }}>
                            {item}
                          </span>
                        )) : <span className="text-sm" style={{ color: '#914600' }}>None added</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide" style={{ color: '#AF5500' }}>Sensitivities</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.ingredientSensitivities.length ? profile.ingredientSensitivities.map((item: string) => (
                          <span key={item} className="px-3 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(175, 85, 0, 0.2)', border: '1px solid #AF5500', color: '#643100' }}>
                            {item}
                          </span>
                        )) : <span className="text-sm" style={{ color: '#914600' }}>None added</span>}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs uppercase tracking-wide" style={{ color: '#AF5500' }}>Preferences</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {profile.preferredProductAttributes.length ? profile.preferredProductAttributes.map((item: string) => (
                          <span key={item} className="px-3 py-1 rounded-full text-xs"
                            style={{ background: 'rgba(175, 85, 0, 0.2)', border: '1px solid #AF5500', color: '#643100' }}>
                            {item}
                          </span>
                        )) : <span className="text-sm" style={{ color: '#914600' }}>None added</span>}
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold mb-2" style={{ color: '#914600' }}>Routine Notes</p>
                  <p className="text-sm" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {profile.currentRegimenNotes ? profile.currentRegimenNotes : 'No notes captured yet.'}
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          {/* Last Booking Card */}
          {profile.lastBooking && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="rounded-2xl shadow-xl p-6"
              style={{ background: 'linear-gradient(135deg, #D49961 0%, #CE935F 100%)', border: '2px solid #914600' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold flex items-center gap-2"
                  style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                  <Calendar style={{ color: '#643100' }} size={24} />
                  Latest Booking
                </h3>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Style
                  </label>
                  <p className="text-lg font-semibold capitalize" 
                    style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {profile.lastBooking.style.replace(/-/g, ' ')}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Date
                  </label>
                  <p className="text-lg font-semibold" 
                    style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {profile.lastBooking.date}
                  </p>
                </div>
                <div>
                  <label className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Stylist
                  </label>
                  <p className="text-lg font-semibold" 
                    style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {profile.lastBooking.stylist}
                  </p>
                </div>
              </div>

              <button
                onClick={() => router.push('/')}
                className="mt-4 w-full py-3 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                style={{ 
                  background: '#643100', 
                  color: '#FDF4E8',
                  fontFamily: 'Bricolage Grotesque, sans-serif'
                }}
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
            className="rounded-2xl shadow-xl p-6"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold flex items-center gap-2"
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                <FileText style={{ color: '#AF5500' }} size={24} />
                Saved Routines
              </h3>
              <button
                onClick={() => router.push('/hair-care')}
                className="px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2"
                style={{ 
                  background: '#AF5500', 
                  color: '#FDF4E8',
                  fontFamily: 'Bricolage Grotesque, sans-serif'
                }}
              >
                <Plus size={16} />
                New Routine
              </button>
            </div>

            {!profile.savedRoutines || profile.savedRoutines.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto mb-3" style={{ color: '#CE935F' }} size={48} />
                <p className="mb-4" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  No saved routines yet
                </p>
                <button
                  onClick={() => router.push('/hair-care')}
                  className="px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                  style={{ 
                    background: '#643100', 
                    color: '#FDF4E8',
                    fontFamily: 'Bricolage Grotesque, sans-serif'
                  }}
                >
                  Create Your First Routine
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {profile.savedRoutines.map((routine: SavedRoutine, idx: number) => (
                  <div
                    key={routine.id}
                    className="rounded-xl p-4 hover:shadow-md transition-all"
                    style={{ background: 'white', border: '2px solid #914600' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          {new Date(routine.createdAt).toLocaleDateString('en', {
                            month: 'long',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <span className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(175, 85, 0, 0.2)', color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {routine.hairAnalysis?.hairType?.hairType || routine.hairAnalysis?.hairType || '4c'}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-semibold"
                            style={{ background: 'rgba(206, 147, 95, 0.3)', color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Health: {routine.hairAnalysis?.health?.healthScore || routine.hairAnalysis?.health?.score || 65}/100
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-2 rounded-lg transition-all"
                        style={{ color: '#914600' }}
                        title="Delete routine"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    {/* Routine Summary */}
                    <div className="rounded-lg p-3 mb-3"
                      style={{ background: 'rgba(206, 147, 95, 0.15)' }}>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-xs" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Daily Steps
                          </p>
                          <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            {routine.routine?.personalizedRoutine?.daily?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Weekly Steps
                          </p>
                          <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            {routine.routine?.personalizedRoutine?.weekly?.length || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            Monthly Steps
                          </p>
                          <p className="text-lg font-bold" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            {routine.routine?.personalizedRoutine?.monthly?.length || 0}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Notes */}
                    <div className="mb-3">
                      <label className="text-xs mb-1 block" 
                        style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        Notes:
                      </label>
                      <textarea
                        value={routine.notes || ''}
                        onChange={(e) => updateRoutineNotes(routine.id, e.target.value)}
                        placeholder="Add notes about this routine..."
                        className="w-full px-3 py-2 rounded-lg text-sm"
                        style={{ 
                          border: '2px solid #914600', 
                          color: '#643100',
                          fontFamily: 'Bricolage Grotesque, sans-serif'
                        }}
                        rows={2}
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)}
                        className="py-2 rounded-lg text-sm font-semibold transition-all"
                        style={{ 
                          background: 'rgba(175, 85, 0, 0.15)', 
                          color: '#643100',
                          border: '1px solid #AF5500',
                          fontFamily: 'Bricolage Grotesque, sans-serif'
                        }}
                      >
                        {expandedRoutine === routine.id ? 'Hide Details' : 'View Details'}
                      </button>
                      <button
                        onClick={() => viewRoutine(routine)}
                        className="py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                        style={{ 
                          background: '#643100', 
                          color: '#FDF4E8',
                          fontFamily: 'Bricolage Grotesque, sans-serif'
                        }}
                      >
                        View Full Routine
                        <ArrowRight size={16} />
                      </button>
                    </div>

                    {/* Expanded Details */}
                    {expandedRoutine === routine.id && (
                      <div className="mt-4 pt-4 space-y-3" style={{ borderTop: '2px solid #CE935F' }}>
                        <div>
                          <h4 className="font-semibold mb-2" 
                            style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Expected Results:
                          </h4>
                          <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {routine.routine?.expectedResults?.timeline || 'View your routine for details'}
                          </p>
                          {routine.routine?.expectedResults?.improvements && (
                            <ul className="mt-2 space-y-1">
                              {routine.routine.expectedResults.improvements.slice(0, 3).map((imp: string, i: number) => (
                                <li key={i} className="text-xs flex items-start gap-2" 
                                  style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                                  <span style={{ color: '#AF5500' }}>•</span>
                                  <span>{imp}</span>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2" 
                            style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                            Products Recommended:
                          </h4>
                          {routine.routine?.productRecommendations?.essential && (
                            <div className="space-y-1">
                              {routine.routine.productRecommendations.essential.slice(0, 3).map((product: any, i: number) => (
                                <p key={i} className="text-xs" 
                                  style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
              className="p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-left"
              style={{ background: '#FDF4E8', border: '2px solid #914600' }}
            >
              <Sparkles className="mb-3" style={{ color: '#AF5500' }} size={32} />
              <h4 className="font-bold mb-1" 
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                Daily Tips
              </h4>
              <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                View your personalized recommendations
              </p>
            </button>

            <button
              onClick={() => router.push('/stylists')}
              className="p-6 rounded-2xl shadow-xl hover:shadow-2xl transition-all text-left"
              style={{ background: '#FDF4E8', border: '2px solid #914600' }}
            >
              <User className="mb-3" style={{ color: '#AF5500' }} size={32} />
              <h4 className="font-bold mb-1" 
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                Find Stylists
              </h4>
              <p className="text-sm" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Browse verified professionals
              </p>
            </button>
          </motion.div>
        </div>
      </div>
      </div>
    </>
  );
}

