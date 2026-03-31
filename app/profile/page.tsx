'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit2, Save, X, ArrowRight, Calendar, Trash2, FileText, Plus } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import IntroVideoFallback from '@/app/components/IntroVideoFallback';
import { normalizeUserProfile, PROFILE_VERSION, type UserProfile, type SavedRoutine } from '@/types/userProfile';

const LOCATIONS = ['Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Uganda', 'Tanzania', 'Other'];

const HAIR_TYPES_UI = [
  { id: '4a' as const, label: '4a' },
  { id: '4b' as const, label: '4b' },
  { id: '4c' as const, label: '4c' },
];

const ONBOARDING_GOAL_TO_ID: Record<string, string> = {
  'Length Retention': 'retention',
  Moisture: 'moisture',
  'Curl Definition': 'styles',
  'Hair Growth': 'growth',
  'Scalp Health': 'health',
  'Low Maintenance': 'maintenance',
};

type EditingSection = 'personal' | 'hair' | 'goals' | null;

function initialsFromName(name: string): string {
  return (
    name
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((p) => p[0]?.toUpperCase())
      .join('') || '?'
  );
}

function formatClimate(profile: UserProfile): string {
  const c = profile.climate;
  if (!c) return '—';
  if (c === 'dry') return 'Dry';
  if (c === 'humid') return 'Humid';
  return 'Temperate';
}

function goalLineDisplay(goalKey: string, hairGoalOptions: { id: string; label: string }[]): string {
  const byId = hairGoalOptions.find((o) => o.id === goalKey);
  if (byId) {
    if (byId.id === 'moisture') return 'Moisture';
    return byId.label;
  }
  const byLabel = hairGoalOptions.find((o) => o.label === goalKey);
  if (byLabel) return goalLineDisplay(byLabel.id, hairGoalOptions);
  return goalKey;
}

function normalizeGoalsToIds(
  goals: string[],
  hairGoalOptions: { id: string; label: string }[],
): string[] {
  const idSet = new Set<string>();
  for (const g of goals) {
    const byId = hairGoalOptions.find((o) => o.id === g);
    if (byId) {
      idSet.add(byId.id);
      continue;
    }
    const byLabel = hairGoalOptions.find((o) => o.label === g);
    if (byLabel) {
      idSet.add(byLabel.id);
      continue;
    }
    const mapped = ONBOARDING_GOAL_TO_ID[g];
    if (mapped) idSet.add(mapped);
  }
  return [...idSet];
}

const titleSerif = { fontFamily: 'Caprasimo, serif', color: '#C17208' } as const;
const bodySans = { fontFamily: 'Bricolage Grotesque, sans-serif', color: '#C17208' } as const;

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [minLoadingComplete, setMinLoadingComplete] = useState(false);
  const [editingSection, setEditingSection] = useState<EditingSection>(null);
  const [editedProfile, setEditedProfile] = useState<UserProfile | null>(null);
  const [expandedRoutine, setExpandedRoutine] = useState<string | null>(null);

  const hairGoalOptions = [
    { id: 'growth', label: 'Hair Growth', emoji: '🌱' },
    { id: 'retention', label: 'Length Retention', emoji: '📏' },
    { id: 'moisture', label: 'Moisture Balance', emoji: '💧' },
    { id: 'health', label: 'Scalp Health', emoji: '✨' },
    { id: 'styles', label: 'Curl Definition', emoji: '🌀' },
    { id: 'maintenance', label: 'Low Maintenance', emoji: '⏱️' },
  ];

  const porosityOptions = [
    { id: 'low' as const, label: 'Low' },
    { id: 'normal' as const, label: 'Normal' },
    { id: 'high' as const, label: 'High' },
  ];

  const lengthOptions = [
    { id: 'short' as const, label: 'Short' },
    { id: 'medium' as const, label: 'Medium' },
    { id: 'long' as const, label: 'Long' },
  ];

  const densityOptions = [
    { id: 'low' as const, label: 'Low' },
    { id: 'medium' as const, label: 'Medium' },
    { id: 'high' as const, label: 'High' },
  ];

  const climateOptionsForEdit = [
    { id: 'dry' as const, label: 'Dry' },
    { id: 'humid' as const, label: 'Humid' },
    { id: 'temperate' as const, label: 'Temperate' },
  ];

  useEffect(() => {
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

      if (bookingData) {
        try {
          const booking = JSON.parse(bookingData);
          normalizedProfile = {
            ...normalizedProfile,
            lastBooking: {
              style: booking.desiredStyle,
              date: booking.date,
              stylist: booking.stylistInfo?.name || 'Stylist',
            },
          };
        } catch (error) {
          console.warn('Unable to parse latest booking information', error);
        }
      }

      const versionedProfile: UserProfile = {
        ...normalizedProfile,
        profileVersion: PROFILE_VERSION,
        savedRoutines: normalizedProfile.savedRoutines || [],
      };

      localStorage.setItem('nywele-user-profile', JSON.stringify(versionedProfile));
      setProfile(versionedProfile);
    } else {
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

  const startEdit = (section: Exclude<EditingSection, null>) => {
    if (!profile) return;
    if (section === 'goals') {
      setEditedProfile({
        ...profile,
        hairGoals: normalizeGoalsToIds(profile.hairGoals, hairGoalOptions),
      });
    } else {
      setEditedProfile({ ...profile });
    }
    setEditingSection(section);
  };

  const cancelEdit = () => {
    setEditingSection(null);
    setEditedProfile(null);
  };

  const saveProfile = () => {
    if (!profile || !editedProfile) return;

    const mergedProfile = {
      ...profile,
      ...editedProfile,
      profileVersion: PROFILE_VERSION,
      savedRoutines: profile.savedRoutines || [],
      lastBooking: profile.lastBooking,
      createdAt: profile.createdAt,
    };

    const normalized = normalizeUserProfile(mergedProfile);
    localStorage.setItem('nywele-user-profile', JSON.stringify(normalized));
    setProfile(normalized);
    setEditingSection(null);
    setEditedProfile(null);
  };

  const deleteRoutine = (routineId: string) => {
    if (!profile || !confirm('Are you sure you want to delete this routine?')) return;

    const updatedRoutines = profile.savedRoutines?.filter((routine: SavedRoutine) => routine.id !== routineId) || [];
    const updatedProfile = normalizeUserProfile({
      ...profile,
      profileVersion: PROFILE_VERSION,
      savedRoutines: updatedRoutines,
    });

    localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  const updateRoutineNotes = (routineId: string, notes: string) => {
    if (!profile) return;

    const updatedRoutines =
      profile.savedRoutines?.map((r: SavedRoutine) => (r.id === routineId ? { ...r, notes } : r)) || [];

    const updatedProfile = normalizeUserProfile({
      ...profile,
      profileVersion: PROFILE_VERSION,
      savedRoutines: updatedRoutines,
    });

    localStorage.setItem('nywele-user-profile', JSON.stringify(updatedProfile));
    setProfile(updatedProfile);
  };

  const viewRoutine = (routine: SavedRoutine) => {
    localStorage.setItem(
      'nywele-viewing-routine',
      JSON.stringify({
        hairAnalysis: routine.hairAnalysis,
        routine: routine.routine,
        isViewing: true,
      }),
    );

    router.push('/hair-care?view=saved');
  };

  if (!profile || !minLoadingComplete) {
    return <IntroVideoFallback />;
  }

  const p = profile;
  const ep = editedProfile;

  const row = (label: string, value: ReactNode) => (
    <div className="flex flex-wrap gap-x-2 text-[15px] leading-snug" style={bodySans}>
      <span className="font-semibold">{label}</span>
      <span className="font-semibold">:</span>
      <span className="font-normal">{value}</span>
    </div>
  );

  const subCardClass = 'rounded-2xl p-4 md:p-5';
  const subCardStyle = {
    background: '#FFFCF3',
    border: '1px solid rgba(193, 114, 8, 0.25)',
  } as const;

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#FFFEE1' }}>
      <BottomNav />
      <div
        className="flex flex-1 flex-col px-7 pb-[max(0.75rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] pt-32 sm:px-8 md:px-14 md:pb-10 md:pt-32 lg:px-16"
      >
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        `}</style>

        <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-3 sm:px-4 md:px-6 lg:px-8">
          <header className="mb-2 flex items-center justify-between gap-4 md:mb-6">
            <button
              type="button"
              onClick={() => router.back()}
              className="-ml-2 shrink-0 rounded-full p-2 transition-opacity hover:opacity-70 md:-ml-1"
              aria-label="Go back"
              style={{ color: '#C17208' }}
            >
              <ChevronLeft className="h-8 w-8 md:h-9 md:w-9" strokeWidth={2.25} />
            </button>
            <h1
              className="min-w-0 flex-1 text-right text-3xl font-bold md:text-4xl"
              style={{ fontFamily: 'Caprasimo, serif', color: '#603E12' }}
            >
              Your Profile
            </h1>
          </header>

          <div className="w-full min-w-0">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-2xl p-5 md:p-6"
            style={{
              background: '#FFFFFF',
              border: '2px solid rgba(175, 85, 0, 0.25)',
            }}
          >
            {/* Personal info */}
            <div className="relative border-b border-[rgba(96,62,18,0.1)] pb-5">
              <div className="absolute right-0 top-0 flex items-center gap-1">
                {editingSection === 'personal' ? (
                  <>
                    <button
                      type="button"
                      onClick={saveProfile}
                      className="rounded-lg p-2"
                      style={{ color: '#C17208' }}
                      aria-label="Save"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg p-2"
                      style={{ color: '#C17208' }}
                      aria-label="Cancel"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit('personal')}
                    className="rounded-lg p-2 transition-opacity hover:opacity-70 disabled:opacity-40"
                    style={{ color: '#C17208' }}
                    disabled={editingSection !== null}
                    aria-label="Edit personal information"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
              </div>

              <div className="flex gap-4 pr-10">
                <div
                  className="flex h-[4.5rem] w-[4.5rem] shrink-0 items-center justify-center rounded-full text-lg font-bold text-white md:h-[5rem] md:w-[5rem] md:text-xl"
                  style={{
                    background: 'linear-gradient(145deg, #9E6240 0%, #643100 100%)',
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  {initialsFromName(p.name)}
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="mb-3 text-lg font-bold md:text-xl" style={titleSerif}>
                    {editingSection === 'personal' && ep ? ep.name : p.name}
                  </h2>

                  {editingSection === 'personal' && ep ? (
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={ep.name}
                        onChange={(e) => updateEditedProfile({ name: e.target.value })}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'rgba(96, 62, 18, 0.25)', ...bodySans }}
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={ep.email}
                        onChange={(e) => updateEditedProfile({ email: e.target.value })}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'rgba(96, 62, 18, 0.25)', ...bodySans }}
                        placeholder="Email"
                      />
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={ep.age ?? ''}
                        onChange={(e) =>
                          updateEditedProfile({
                            age: e.target.value === '' ? undefined : parseInt(e.target.value, 10) || undefined,
                          })
                        }
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'rgba(96, 62, 18, 0.25)', ...bodySans }}
                        placeholder="Age"
                      />
                      <select
                        value={ep.location || ''}
                        onChange={(e) => updateEditedProfile({ location: e.target.value || undefined })}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'rgba(96, 62, 18, 0.25)', ...bodySans }}
                      >
                        <option value="">Location</option>
                        {LOCATIONS.map((loc) => (
                          <option key={loc} value={loc}>
                            {loc}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {row('Age', p.age != null ? String(p.age) : '—')}
                      {row('Email', p.email || '—')}
                      {row('Password', '••••••••')}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Your Hair Profile */}
            <div className={`${subCardClass} relative mt-5`} style={subCardStyle}>
              <div className="absolute right-3 top-3 flex items-center gap-1 md:right-4 md:top-4">
                {editingSection === 'hair' ? (
                  <>
                    <button type="button" onClick={saveProfile} className="rounded-lg p-2" style={{ color: '#C17208' }} aria-label="Save">
                      <Save className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={cancelEdit} className="rounded-lg p-2" style={{ color: '#C17208' }} aria-label="Cancel">
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit('hair')}
                    className="rounded-lg p-2 hover:opacity-70 disabled:opacity-40"
                    style={{ color: '#C17208' }}
                    disabled={editingSection !== null}
                    aria-label="Edit hair profile"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <h3 className="mb-4 pr-12 text-base font-bold md:text-lg" style={titleSerif}>
                Your Hair Profile
              </h3>

              {editingSection === 'hair' && ep ? (
                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80" style={bodySans}>
                      Type
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {HAIR_TYPES_UI.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateEditedProfile({ hairType: t.id })}
                          className="rounded-full border-2 px-3 py-1.5 text-sm font-semibold"
                          style={{
                            borderColor: ep.hairType === t.id ? '#603E12' : 'rgba(96,62,18,0.2)',
                            background: ep.hairType === t.id ? 'rgba(96,62,18,0.08)' : 'transparent',
                            ...bodySans,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80" style={bodySans}>
                      Porosity
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {porosityOptions.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateEditedProfile({ hairPorosity: t.id })}
                          className="rounded-full border-2 px-3 py-1.5 text-sm font-semibold"
                          style={{
                            borderColor: ep.hairPorosity === t.id ? '#603E12' : 'rgba(96,62,18,0.2)',
                            background: ep.hairPorosity === t.id ? 'rgba(96,62,18,0.08)' : 'transparent',
                            ...bodySans,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80" style={bodySans}>
                      Length
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lengthOptions.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateEditedProfile({ hairLength: t.id })}
                          className="rounded-full border-2 px-3 py-1.5 text-sm font-semibold"
                          style={{
                            borderColor: ep.hairLength === t.id ? '#603E12' : 'rgba(96,62,18,0.2)',
                            background: ep.hairLength === t.id ? 'rgba(96,62,18,0.08)' : 'transparent',
                            ...bodySans,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80" style={bodySans}>
                      Density
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {densityOptions.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateEditedProfile({ hairDensity: t.id })}
                          className="rounded-full border-2 px-3 py-1.5 text-sm font-semibold"
                          style={{
                            borderColor: ep.hairDensity === t.id ? '#603E12' : 'rgba(96,62,18,0.2)',
                            background: ep.hairDensity === t.id ? 'rgba(96,62,18,0.08)' : 'transparent',
                            ...bodySans,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80" style={bodySans}>
                      Location
                    </p>
                    <select
                      value={ep.location || ''}
                      onChange={(e) => updateEditedProfile({ location: e.target.value || undefined })}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{ borderColor: 'rgba(96, 62, 18, 0.25)', ...bodySans }}
                    >
                      <option value="">Select</option>
                      {LOCATIONS.map((loc) => (
                        <option key={loc} value={loc}>
                          {loc}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80" style={bodySans}>
                      Climate
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {climateOptionsForEdit.map((t) => (
                        <button
                          key={t.id}
                          type="button"
                          onClick={() => updateEditedProfile({ climate: t.id })}
                          className="rounded-full border-2 px-3 py-1.5 text-sm font-semibold"
                          style={{
                            borderColor: ep.climate === t.id ? '#603E12' : 'rgba(96,62,18,0.2)',
                            background: ep.climate === t.id ? 'rgba(96,62,18,0.08)' : 'transparent',
                            ...bodySans,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {row('Type', p.hairType?.toLowerCase() ?? '—')}
                  {row('Porosity', p.hairPorosity ? p.hairPorosity.charAt(0).toUpperCase() + p.hairPorosity.slice(1) : '—')}
                  {row('Length', p.hairLength ? p.hairLength.charAt(0).toUpperCase() + p.hairLength.slice(1) : '—')}
                  {row('Density', p.hairDensity ? p.hairDensity.charAt(0).toUpperCase() + p.hairDensity.slice(1) : '—')}
                  {row('Location', p.location || '—')}
                  {row('Climate', formatClimate(p))}
                </div>
              )}
            </div>

            {/* Your Goals */}
            <div className={`${subCardClass} relative mt-4`} style={subCardStyle}>
              <div className="absolute right-3 top-3 flex items-center gap-1 md:right-4 md:top-4">
                {editingSection === 'goals' ? (
                  <>
                    <button type="button" onClick={saveProfile} className="rounded-lg p-2" style={{ color: '#C17208' }} aria-label="Save">
                      <Save className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={cancelEdit} className="rounded-lg p-2" style={{ color: '#C17208' }} aria-label="Cancel">
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit('goals')}
                    className="rounded-lg p-2 hover:opacity-70 disabled:opacity-40"
                    style={{ color: '#C17208' }}
                    disabled={editingSection !== null}
                    aria-label="Edit goals"
                  >
                    <Edit2 className="h-5 w-5" />
                  </button>
                )}
              </div>
              <h3 className="mb-3 pr-12 text-base font-bold md:text-lg" style={titleSerif}>
                Your Goals
              </h3>

              {editingSection === 'goals' && ep ? (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {hairGoalOptions.map((goal) => (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => toggleGoal(goal.id)}
                      className="flex items-center gap-2 rounded-xl border-2 px-3 py-2.5 text-left text-sm transition-colors"
                      style={{
                        borderColor: ep.hairGoals.includes(goal.id) ? '#603E12' : 'rgba(96,62,18,0.2)',
                        background: ep.hairGoals.includes(goal.id) ? 'rgba(96,62,18,0.06)' : 'transparent',
                        ...bodySans,
                      }}
                    >
                      <span>{goal.emoji}</span>
                      <span className="font-medium">{goal.label}</span>
                    </button>
                  ))}
                </div>
              ) : (
                <ul className="space-y-2">
                  {p.hairGoals.length ? (
                    p.hairGoals.map((g) => (
                      <li key={g} className="text-[15px] font-normal" style={bodySans}>
                        {goalLineDisplay(g, hairGoalOptions)}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm opacity-70" style={bodySans}>
                      No goals selected yet.
                    </li>
                  )}
                </ul>
              )}
            </div>
          </motion.div>

          {/* Saved routines & booking — secondary */}
          {p.lastBooking && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="mt-6 rounded-2xl p-4 md:p-5"
              style={{
                background: '#FFFFFF',
                border: '2px solid rgba(175, 85, 0, 0.25)',
              }}
            >
              <h3 className="mb-3 flex items-center gap-2 text-base font-bold" style={titleSerif}>
                <Calendar className="h-5 w-5 shrink-0" />
                Latest booking
              </h3>
              <div className="space-y-1 text-sm" style={bodySans}>
                <p>
                  <span className="font-semibold">Style:</span> {p.lastBooking.style.replace(/-/g, ' ')}
                </p>
                <p>
                  <span className="font-semibold">Date:</span> {p.lastBooking.date}
                </p>
                <p>
                  <span className="font-semibold">Stylist:</span> {p.lastBooking.stylist}
                </p>
              </div>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-white"
                style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Book another style
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="mt-6 rounded-2xl p-4 md:p-5"
            style={{
              background: '#FFFFFF',
              border: '2px solid rgba(175, 85, 0, 0.25)',
            }}
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <h3 className="flex items-center gap-2 text-base font-bold" style={titleSerif}>
                <FileText className="h-5 w-5 shrink-0" />
                Saved routines
              </h3>
              <button
                type="button"
                onClick={() => router.push('/hair-care')}
                className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
                style={{ background: 'rgba(96,62,18,0.1)', color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                <Plus className="h-4 w-4" />
                New
              </button>
            </div>

            {!p.savedRoutines || p.savedRoutines.length === 0 ? (
              <p className="py-4 text-center text-sm" style={bodySans}>
                No saved routines yet.
              </p>
            ) : (
              <div className="space-y-3">
                {p.savedRoutines.map((routine: SavedRoutine) => (
                  <div
                    key={routine.id}
                    className="rounded-xl border p-3"
                    style={{ borderColor: 'rgba(96, 62, 18, 0.15)', background: '#FFFEF8' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs" style={{ ...bodySans, opacity: 0.85 }}>
                        {new Date(routine.createdAt).toLocaleDateString('en', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </p>
                      <button
                        type="button"
                        onClick={() => deleteRoutine(routine.id)}
                        className="p-1"
                        style={{ color: '#603E12' }}
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <textarea
                      value={routine.notes || ''}
                      onChange={(e) => updateRoutineNotes(routine.id, e.target.value)}
                      placeholder="Notes…"
                      rows={2}
                      className="mt-2 w-full rounded-lg border px-2 py-1.5 text-xs"
                      style={{ borderColor: 'rgba(96,62,18,0.2)', ...bodySans }}
                    />
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)}
                        className="flex-1 rounded-lg py-2 text-xs font-semibold"
                        style={{
                          border: '1px solid rgba(96,62,18,0.25)',
                          ...bodySans,
                        }}
                      >
                        {expandedRoutine === routine.id ? 'Hide' : 'Details'}
                      </button>
                      <button
                        type="button"
                        onClick={() => viewRoutine(routine)}
                        className="flex flex-1 items-center justify-center gap-1 rounded-lg py-2 text-xs font-semibold text-white"
                        style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Open
                        <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
        </div>
      </div>
    </div>
  );
}
