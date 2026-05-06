'use client';

import { useState, useLayoutEffect, useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Edit2, Save, X, ArrowRight, Calendar, Trash2, FileText, Plus, Heart, History, User } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import HairCareReferencePhoto from '@/app/components/HairCareReferencePhoto';
import OpeningSequence from '@/components/OpeningSequence';
import { APP_PAGE_BACKGROUND, DASHBOARD_CARD_TEXT } from '@/lib/app-theme';
import { normalizeUserProfile, PROFILE_VERSION, type UserProfile, type SavedRoutine } from '@/types/userProfile';

/** Same as `DASHBOARD_CONTAINER_TEXT` on `app/dashboard/page.tsx` — routine cards + body copy. */
const PROFILE_DASH_TEXT = '#7A3500';

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

function buildProfileFromStorage(): UserProfile | null {
  if (typeof window === 'undefined') return null;
  const storedProfile = localStorage.getItem('nywele-user-profile');
  if (!storedProfile) return null;
  try {
    let normalizedProfile = normalizeUserProfile(JSON.parse(storedProfile));
    const bookingData = localStorage.getItem('nywele-latest-booking');
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
    return versionedProfile;
  } catch {
    return null;
  }
}

/** Match page title “Your Profile”: Caprasimo + brand brown */
const titleSerif = { fontFamily: 'Caprasimo, serif', color: DASHBOARD_CARD_TEXT } as const;
const bodySans = { fontFamily: 'Bricolage Grotesque, sans-serif', color: DASHBOARD_CARD_TEXT } as const;

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(() => buildProfileFromStorage());
  const [showScanPrompt, setShowScanPrompt] = useState(false);
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

  const loadProfile = () => {
    const next = buildProfileFromStorage();
    if (next) {
      setProfile(next);
    } else {
      router.push('/register');
    }
  };

  useLayoutEffect(() => {
    loadProfile();
  }, [router]);

  // Loader UI is handled by `app/profile/loading.tsx` so we don't stack multiple overlays.

  useEffect(() => {
    const onFocus = () => loadProfile();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    setShowScanPrompt(params.get('prompt') === 'scan');
  }, []);

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
        referenceImageDataUrl: routine.referenceImageDataUrl,
        isViewing: true,
      }),
    );

    router.push('/hair-care?view=saved');
  };

  if (!profile) {
    return (
      <OpeningSequence
        phasePreset="full"
        backgroundColor={APP_PAGE_BACKGROUND}
        holdUntilUnmount
        bustScaleMul={1.1}
        cameraPullbackMul={1}
        loadingLabel="Preparing your profile"
        continuous
      />
    );
  }

  const p = profile;
  const ep = editedProfile;

  const row = (label: string, value: ReactNode, textColor: string = DASHBOARD_CARD_TEXT) => (
    <div
      className="flex flex-wrap gap-x-2 text-[15px] leading-snug"
      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: textColor }}
    >
      <span className="font-semibold">{label}</span>
      <span className="font-semibold">:</span>
      <span className="font-normal">{value}</span>
    </div>
  );

  /** Inner tiles: dashboard Daily strip pale yellow (`app/dashboard/page.tsx`). */
  const profilePaleCardSurface = {
    background: '#FDF8E1',
    border: '1px solid #F8DD65',
    boxShadow: '0 10px 22px rgba(122, 53, 0, 0.08)',
  } as const;
  const profileWhiteCardClass = 'rounded-xl p-5';
  const profileWhiteCardStyle = profilePaleCardSurface;

  /** Same surface as other profile cards; larger radius for hair block. */
  const hairProfileDailyClass =
    'relative mt-5 w-full rounded-[32px] px-5 pb-6 pt-5 md:px-7 md:pb-6 md:pt-6';

  return (
    <div className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden bg-transparent">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>
      <BottomNav />
      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 pb-[max(7.5rem,calc(5.75rem+env(safe-area-inset-bottom,0px)))] pt-[calc(2rem+env(safe-area-inset-top))] lg:px-4 lg:pb-8 lg:pt-36">
        <header className="mb-2 flex shrink-0 items-center justify-between gap-3 pb-2 lg:mb-4 lg:gap-4 lg:pb-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="-ml-2 shrink-0 rounded-full p-2 transition-opacity hover:opacity-70 md:-ml-1"
            aria-label="Go back"
            style={{ color: DASHBOARD_CARD_TEXT }}
          >
            <ChevronLeft className="h-8 w-8 md:h-9 md:w-9" strokeWidth={2.25} />
          </button>
          <h1
            className="min-w-0 flex-1 text-right text-3xl font-bold md:text-4xl"
            style={{ fontFamily: 'Caprasimo, serif', color: DASHBOARD_CARD_TEXT }}
          >
            Your Profile
          </h1>
        </header>

        {showScanPrompt && (
          <div
            className="mb-3 shrink-0 rounded-xl p-5 lg:mb-5"
            style={{
              background: '#FB8C1C',
              border: '1px solid rgba(178, 104, 5, 0.25)',
            }}
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
              <div className="min-w-0">
                <div className="text-lg font-bold md:text-xl" style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Caprasimo, serif' }}>
                  Next step: scan your hair
                </div>
                <div
                  className="mt-1 text-sm leading-relaxed"
                  style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  To generate your routine and product recommendations, scan a photo of your hair.
                </div>
              </div>
              <button
                type="button"
                onClick={() => router.push('/hair-care?mode=analyze')}
                className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90 md:shrink-0"
                style={{
                  background: '#B26805',
                  color: '#FFFEE1',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                }}
              >
                Scan now
                <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>

          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex min-h-0 min-w-0 w-full flex-1 flex-col overflow-hidden rounded-2xl p-4 max-lg:max-h-none max-lg:pt-3.5 lg:max-h-[min(74dvh,calc(100dvh-13rem))] lg:p-6"
          style={{
            background: '#FFFFFF',
            border: '2px solid rgba(122, 53, 0, 0.25)',
          }}
        >
          <div className="min-h-0 min-w-0 flex-1 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
            {/* Personal info */}
            <div className="relative border-b border-[rgba(178, 104, 5,0.1)] pb-5">
              <div className="absolute right-0 top-0 flex items-center gap-1">
                {editingSection === 'personal' ? (
                  <>
                    <button
                      type="button"
                      onClick={saveProfile}
                      className="rounded-lg p-2"
                      style={{ color: DASHBOARD_CARD_TEXT }}
                      aria-label="Save"
                    >
                      <Save className="h-5 w-5" />
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="rounded-lg p-2"
                      style={{ color: DASHBOARD_CARD_TEXT }}
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
                    style={{ color: DASHBOARD_CARD_TEXT }}
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
                        style={{ borderColor: 'rgba(178, 104, 5, 0.25)', ...bodySans }}
                        placeholder="Name"
                      />
                      <input
                        type="email"
                        value={ep.email}
                        onChange={(e) => updateEditedProfile({ email: e.target.value })}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'rgba(178, 104, 5, 0.25)', ...bodySans }}
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
                        style={{ borderColor: 'rgba(178, 104, 5, 0.25)', ...bodySans }}
                        placeholder="Age"
                      />
                      <select
                        value={ep.location || ''}
                        onChange={(e) => updateEditedProfile({ location: e.target.value || undefined })}
                        className="w-full rounded-xl border px-3 py-2 text-sm"
                        style={{ borderColor: 'rgba(178, 104, 5, 0.25)', ...bodySans }}
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

            {/* Your Hair Profile — same surface as dashboard Daily card; header matches “How healthy…” row */}
            <div className={hairProfileDailyClass} style={profilePaleCardSurface}>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
                <h3 className="flex min-w-0 items-center gap-2 text-base font-bold md:text-lg" style={titleSerif}>
                  <User className="h-5 w-5 shrink-0" aria-hidden />
                  Your Hair Profile
                </h3>
                {editingSection === 'hair' ? (
                  <div className="flex shrink-0 items-center gap-3">
                    <button
                      type="button"
                      onClick={saveProfile}
                      className="text-sm font-semibold underline decoration-[rgba(122,53,0,0.35)] underline-offset-2 transition-opacity hover:opacity-80"
                      style={{ color: PROFILE_DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      className="text-sm font-semibold underline decoration-[rgba(122,53,0,0.35)] underline-offset-2 transition-opacity hover:opacity-80"
                      style={{ color: PROFILE_DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit('hair')}
                    disabled={editingSection !== null}
                    className="shrink-0 text-sm font-semibold underline decoration-[rgba(122,53,0,0.35)] underline-offset-2 transition-opacity hover:opacity-80 disabled:opacity-40"
                    style={{ color: PROFILE_DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Edit
                  </button>
                )}
              </div>

              {editingSection === 'hair' && ep ? (
                <div className="mt-4 space-y-4">
                  <div>
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                    >
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
                            borderColor: ep.hairType === t.id ? '#B26805' : 'rgba(178, 104, 5,0.2)',
                            background: ep.hairType === t.id ? 'rgba(178, 104, 5,0.08)' : 'transparent',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            color: PROFILE_DASH_TEXT,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                    >
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
                            borderColor: ep.hairPorosity === t.id ? '#B26805' : 'rgba(178, 104, 5,0.2)',
                            background: ep.hairPorosity === t.id ? 'rgba(178, 104, 5,0.08)' : 'transparent',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            color: PROFILE_DASH_TEXT,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                    >
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
                            borderColor: ep.hairLength === t.id ? '#B26805' : 'rgba(178, 104, 5,0.2)',
                            background: ep.hairLength === t.id ? 'rgba(178, 104, 5,0.08)' : 'transparent',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            color: PROFILE_DASH_TEXT,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                    >
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
                            borderColor: ep.hairDensity === t.id ? '#B26805' : 'rgba(178, 104, 5,0.2)',
                            background: ep.hairDensity === t.id ? 'rgba(178, 104, 5,0.08)' : 'transparent',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            color: PROFILE_DASH_TEXT,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                    >
                      Location
                    </p>
                    <select
                      value={ep.location || ''}
                      onChange={(e) => updateEditedProfile({ location: e.target.value || undefined })}
                      className="w-full rounded-xl border px-3 py-2 text-sm"
                      style={{
                        borderColor: 'rgba(178, 104, 5, 0.25)',
                        fontFamily: 'Bricolage Grotesque, sans-serif',
                        color: PROFILE_DASH_TEXT,
                      }}
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
                    <p
                      className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                    >
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
                            borderColor: ep.climate === t.id ? '#B26805' : 'rgba(178, 104, 5,0.2)',
                            background: ep.climate === t.id ? 'rgba(178, 104, 5,0.08)' : 'transparent',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            color: PROFILE_DASH_TEXT,
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="mt-4 space-y-2">
                  {row('Type', p.hairType?.toLowerCase() ?? '—', PROFILE_DASH_TEXT)}
                  {row('Porosity', p.hairPorosity ? p.hairPorosity.charAt(0).toUpperCase() + p.hairPorosity.slice(1) : '—', PROFILE_DASH_TEXT)}
                  {row('Length', p.hairLength ? p.hairLength.charAt(0).toUpperCase() + p.hairLength.slice(1) : '—', PROFILE_DASH_TEXT)}
                  {row('Density', p.hairDensity ? p.hairDensity.charAt(0).toUpperCase() + p.hairDensity.slice(1) : '—', PROFILE_DASH_TEXT)}
                  {row('Location', p.location || '—', PROFILE_DASH_TEXT)}
                  {row('Climate', formatClimate(p), PROFILE_DASH_TEXT)}
                </div>
              )}
            </div>

            {p.hairHealthSnapshot && (
              <div className={`${profileWhiteCardClass} mt-4`} style={profileWhiteCardStyle}>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold md:text-lg" style={titleSerif}>
                  <Heart className="h-5 w-5 shrink-0" aria-hidden />
                  How healthy is your hair
                </h3>
                <p
                  className="mb-3 text-xs opacity-80"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                >
                  Matches your most recent Hair care session (dashboard metrics use the same snapshot)
                  {p.hairHealthSnapshot.analyzedAt
                    ? ` · ${new Date(p.hairHealthSnapshot.analyzedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : ''}
                </p>
                <div className="mb-4">
                  <HairCareReferencePhoto
                    src={p.hairHealthSnapshot.referenceImageDataUrl}
                    compact
                    headingColor={PROFILE_DASH_TEXT}
                    bodyColor={PROFILE_DASH_TEXT}
                  />
                </div>
                <div className="space-y-2">
                  {row('Health score', `${p.hairHealthSnapshot.healthScore}/100`, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.overallQuality != null &&
                    row('Overall quality', `${p.hairHealthSnapshot.overallQuality}/100`, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.hairTypeDetected &&
                    row('Type (detected)', p.hairHealthSnapshot.hairTypeDetected, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.curlPattern &&
                    row('Curl pattern', p.hairHealthSnapshot.curlPattern, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.porosity && row('Porosity (scan)', p.hairHealthSnapshot.porosity, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.density && row('Density (scan)', p.hairHealthSnapshot.density, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.length && row('Length (scan)', p.hairHealthSnapshot.length, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.moistureLevel &&
                    row('Moisture', p.hairHealthSnapshot.moistureLevel.replace(/-/g, ' '), PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.scalpHealth && row('Scalp', p.hairHealthSnapshot.scalpHealth, PROFILE_DASH_TEXT)}
                  {p.hairHealthSnapshot.damageSeverity &&
                    p.hairHealthSnapshot.damageSeverity !== 'none' &&
                    row('Damage', p.hairHealthSnapshot.damageSeverity, PROFILE_DASH_TEXT)}
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/hair-care')}
                  className="mt-4 w-full rounded-xl py-3 text-sm font-semibold"
                  style={{
                    background: 'rgba(178, 104, 5,0.1)',
                    color: PROFILE_DASH_TEXT,
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  View full scan results in Hair care
                </button>
              </div>
            )}

            {p.hairCareHistory && p.hairCareHistory.length > 0 ? (
              <div className={`${profileWhiteCardClass} mt-4`} style={profileWhiteCardStyle}>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold md:text-lg" style={titleSerif}>
                  <History className="h-5 w-5 shrink-0" aria-hidden />
                  Past hair scans
                </h3>
                <p
                  className="mb-3 text-xs opacity-80"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                >
                  Open any previous scan or routine in Hair care.
                </p>
                <ul className="max-h-52 space-y-2 overflow-y-auto">
                  {p.hairCareHistory.slice(0, 15).map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/hair-care?scan=${encodeURIComponent(h.id)}`)}
                        className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:brightness-[1.03]"
                        style={{
                          borderColor: 'rgba(248, 221, 101, 0.9)',
                          background: '#FFF4C2',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                          color: PROFILE_DASH_TEXT,
                        }}
                      >
                        <span className="font-medium" style={{ color: PROFILE_DASH_TEXT }}>
                          {new Date(h.scannedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </span>
                        <span className="ml-2 opacity-90">
                          {h.recommendation ? 'Routine + scan' : 'Scan only'}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            {/* Your Goals */}
            <div className={`${profileWhiteCardClass} relative mt-4`} style={profileWhiteCardStyle}>
              <div className="absolute right-3 top-3 flex items-center gap-1 md:right-4 md:top-4">
                {editingSection === 'goals' ? (
                  <>
                    <button type="button" onClick={saveProfile} className="rounded-lg p-2" style={{ color: PROFILE_DASH_TEXT }} aria-label="Save">
                      <Save className="h-5 w-5" />
                    </button>
                    <button type="button" onClick={cancelEdit} className="rounded-lg p-2" style={{ color: PROFILE_DASH_TEXT }} aria-label="Cancel">
                      <X className="h-5 w-5" />
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => startEdit('goals')}
                    className="rounded-lg p-2 hover:opacity-70 disabled:opacity-40"
                    style={{ color: PROFILE_DASH_TEXT }}
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
                        borderColor: ep.hairGoals.includes(goal.id) ? '#B26805' : 'rgba(178, 104, 5,0.2)',
                        background: ep.hairGoals.includes(goal.id) ? 'rgba(178, 104, 5,0.06)' : 'transparent',
                        fontFamily: 'Bricolage Grotesque, sans-serif',
                        color: PROFILE_DASH_TEXT,
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
                      <li
                        key={g}
                        className="text-[15px] font-normal"
                        style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                      >
                        {goalLineDisplay(g, hairGoalOptions)}
                      </li>
                    ))
                  ) : (
                    <li
                      className="text-sm opacity-70"
                      style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                    >
                      No goals selected yet.
                    </li>
                  )}
                </ul>
              )}
            </div>

            {p.lastBooking && (
              <div className={`${profileWhiteCardClass} mt-4`} style={profileWhiteCardStyle}>
                <h3 className="mb-3 flex items-center gap-2 text-base font-bold" style={titleSerif}>
                  <Calendar className="h-5 w-5 shrink-0" />
                  Latest booking
                </h3>
                <div className="space-y-1 text-sm" style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}>
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
              </div>
            )}

            <div className={`${profileWhiteCardClass} mt-4`} style={profileWhiteCardStyle}>
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-base font-bold" style={titleSerif}>
                  <FileText className="h-5 w-5 shrink-0" />
                  Saved routines
                </h3>
                <button
                  type="button"
                  onClick={() => router.push('/hair-care')}
                  className="flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold"
                  style={{ background: 'rgba(178, 104, 5,0.1)', color: PROFILE_DASH_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                >
                  <Plus className="h-4 w-4" />
                  New
                </button>
              </div>

              {!p.savedRoutines || p.savedRoutines.length === 0 ? (
                <p
                  className="py-4 text-center text-sm"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT }}
                >
                  No saved routines yet.
                </p>
              ) : (
                <div className="space-y-3">
                  {p.savedRoutines.map((routine: SavedRoutine) => (
                    <div
                      key={routine.id}
                      className="rounded-xl border p-3 shadow-[0_4px_14px_rgba(122,53,0,0.06)]"
                      style={{ borderColor: '#F8DD65', background: '#FFF9CF' }}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className="text-xs"
                          style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: PROFILE_DASH_TEXT, opacity: 0.85 }}
                        >
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
                          style={{ color: PROFILE_DASH_TEXT }}
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
                        style={{
                          borderColor: 'rgba(175, 85, 0, 0.2)',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                          color: PROFILE_DASH_TEXT,
                        }}
                      />
                      <div className="mt-2 flex gap-2">
                        <button
                          type="button"
                          onClick={() => setExpandedRoutine(expandedRoutine === routine.id ? null : routine.id)}
                          className="flex-1 rounded-lg py-2 text-xs font-semibold"
                          style={{
                            border: '1px solid rgba(175, 85, 0, 0.25)',
                            fontFamily: 'Bricolage Grotesque, sans-serif',
                            color: PROFILE_DASH_TEXT,
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
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
