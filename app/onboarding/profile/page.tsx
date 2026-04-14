'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Circle, Globe, Cloud } from 'lucide-react';
import FormCard from '@/app/components/FormCard';
import { normalizeUserProfile, PROFILE_VERSION, type UserProfile } from '@/types/userProfile';

const TOTAL_STEPS = 6;
const HAIR_GOALS: { label: string; emoji: string }[] = [
  { label: 'Length Retention', emoji: '📏' },
  { label: 'Moisture', emoji: '💧' },
  { label: 'Thickness\nDensity', emoji: '🌿' },
  { label: 'Curl Definition', emoji: '🌀' },
  { label: 'Scalp Health', emoji: '💆' },
  { label: 'Reduce Breakage', emoji: '🛡️' },
  { label: 'Colour-treated care', emoji: '🎨' },
  { label: 'Heat Damage Repair', emoji: '🔥' },
];
const HAIR_TYPES = [
  { id: '4a', label: '4a' },
  { id: '4b', label: '4b' },
  { id: '4c', label: '4c' },
];
const POROSITY_OPTIONS = [
  { id: 'low', label: 'Low', icon: 1 },
  { id: 'normal', label: 'Medium', icon: 2 },
  { id: 'high', label: 'High', icon: 3 },
];
const DENSITY_OPTIONS = [
  { id: 'low', label: 'Low', icon: 1 },
  { id: 'medium', label: 'Medium', icon: 2 },
  { id: 'high', label: 'High', icon: 3 },
];
const LOCATIONS = ['Kenya', 'Nigeria', 'South Africa', 'Ghana', 'Uganda', 'Tanzania', 'Other'];
const CLIMATES = ['Dry', 'Humid', 'Dry/Humid', 'Temperate'];

function PorosityIcon({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg width="38" height="51" viewBox="0 0 38 51" fill="none" className={className} style={style}>
      <path d="M18.583 0L16.2601 2.60162C16.2601 2.60162 12.2958 7.09251 8.30041 12.9152C4.30506 18.7379 0 25.7065 0 32.3964C0 37.3249 1.95785 42.0516 5.44284 45.5365C8.92783 49.0215 13.6545 50.9794 18.583 50.9794C23.5115 50.9794 28.2382 49.0215 31.7232 45.5365C35.2082 42.0516 37.166 37.3249 37.166 32.3964C37.166 25.7065 32.861 18.7379 28.8656 12.9152C24.8703 7.09251 20.9059 2.60162 20.9059 2.60162L18.583 0ZM18.583 9.69414C19.9458 11.3047 21.1846 12.6364 23.7863 16.415C27.5338 21.866 30.9717 28.8037 30.9717 32.3964C30.9717 39.2721 25.4587 44.785 18.583 44.785C11.7073 44.785 6.19434 39.2721 6.19434 32.3964C6.19434 28.8037 9.63219 21.866 13.3798 16.415C15.9814 12.6364 17.2203 11.3047 18.583 9.69414Z" fill="currentColor"/>
    </svg>
  );
}

export default function OnboardingProfile() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [hairGoals, setHairGoals] = useState<string[]>([]);
  const [hairType, setHairType] = useState<string>('');
  const [porosity, setPorosity] = useState<string>('');
  const [density, setDensity] = useState<string>('');
  const [location, setLocation] = useState('');
  const [climate, setClimate] = useState('');

  const progress = ((step + 1) / TOTAL_STEPS) * 100;

  const toggleGoal = (goal: string) => {
    setHairGoals((prev) =>
      prev.includes(goal) ? prev.filter((g) => g !== goal) : [...prev, goal]
    );
  };

  const saveAndFinish = () => {
    const profile: Partial<UserProfile> & Record<string, unknown> = {
      profileVersion: PROFILE_VERSION,
      name: name.trim() || 'Guest',
      email: email.trim(),
      hairType: (hairType || '4c') as UserProfile['hairType'],
      hairGoals,
      hairPorosity: (porosity || '') as UserProfile['hairPorosity'],
      hairDensity: (density || '') as UserProfile['hairDensity'],
      climate: (climate === 'Dry' ? 'dry' : climate === 'Humid' ? 'humid' : climate === 'Temperate' ? 'temperate' : climate === 'Dry/Humid' ? 'temperate' : '') as UserProfile['climate'],
      createdAt: new Date().toISOString(),
    };
    if (age.trim()) profile.age = parseInt(age, 10) || undefined;
    if (location.trim()) profile.location = location;
    if (phone.trim()) profile.phone = phone.trim();

    localStorage.setItem('nywele-user-profile', JSON.stringify(profile));
    router.push('/dashboard');
  };

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0;
    if (step === 1) return hairType !== '';
    if (step === 2) return porosity !== '';
    if (step === 3) return density !== '';
    if (step === 4) return hairGoals.length > 0;
    return true;
  };

  const handleNext = () => {
    if (step === TOTAL_STEPS - 1) {
      saveAndFinish();
    } else {
      setStep((s) => s + 1);
    }
  };

  return (
    <div className="flex min-h-dvh flex-col bg-transparent px-4 md:px-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>

      <div className="flex min-h-0 flex-1 flex-col pb-8 md:pb-12 pt-8 md:pt-12">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="flex min-h-full flex-col justify-center py-2">
            <div className="mx-auto flex w-full max-w-[428px] flex-col">
              <h1
                className="mb-2 text-3xl font-bold md:text-4xl"
                style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
              >
                Set up Your Profile
              </h1>
              <p className="mb-6" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Fill in the short form below to get the best out of our service!
              </p>

              <FormCard progress={progress} className="flex flex-col">
          {step === 0 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#573203' }}>
                  Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full px-4 py-3 rounded-xl border border-[#CE935F] focus:ring-2 focus:ring-[#AF5500] focus:border-transparent outline-none"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#573203' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#573203' }}>
                  Age
                </label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  placeholder="Your age"
                  className="w-full px-4 py-3 rounded-xl border border-[#CE935F] focus:ring-2 focus:ring-[#AF5500] focus:border-transparent outline-none"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#573203' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#573203' }}>
                  Email (Optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  className="w-full px-4 py-3 rounded-xl border border-[#CE935F] focus:ring-2 focus:ring-[#AF5500] focus:border-transparent outline-none"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#573203' }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: '#573203' }}>
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Your phone number"
                  className="w-full px-4 py-3 rounded-xl border border-[#CE935F] focus:ring-2 focus:ring-[#AF5500] focus:border-transparent outline-none"
                  style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#573203' }}
                />
              </div>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#573203' }}>
                What&apos;s your hair type?
              </h2>
              <p className="text-sm mb-10" style={{ color: '#573203' }}>(Don&apos;t worry, we&apos;ll confirm with photo analysis)</p>
              <div className="grid grid-cols-2 gap-4">
                {HAIR_TYPES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setHairType(t.id)}
                    className="rounded-xl border-2 flex flex-col items-center gap-0 transition-all overflow-hidden p-0"
                    style={{
                      borderColor: hairType === t.id ? '#DD8106' : '#CE935F',
                      backgroundColor: 'transparent',
                      color: hairType === t.id ? '#DD8106' : '#573203',
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                    }}
                  >
                    <div
                      className="w-full h-28 relative flex items-center justify-center"
                      style={{ backgroundColor: hairType === t.id ? 'rgba(249, 160, 40, 0.4)' : 'transparent' }}
                    >
                      <img
                        src={`/icons/${t.id}_hair.svg`}
                        alt={`Hair type ${t.label}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div
                      className="w-full flex items-center justify-center font-semibold py-1.5 pb-3 text-sm"
                      style={{
                        backgroundColor: hairType === t.id ? 'rgba(249, 160, 40, 0.4)' : 'transparent',
                        color: hairType === t.id ? '#DD8106' : undefined,
                      }}
                    >
                      {t.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#573203' }}>
                What is your hair Porosity?
              </h2>
              <p className="text-sm mb-10" style={{ color: '#573203' }}>(Don&apos;t worry, we&apos;ll confirm with photo analysis)</p>
              <div className="grid grid-cols-2 gap-4">
                {POROSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setPorosity(opt.id)}
                    className="rounded-xl border-2 flex flex-col items-center gap-0 transition-all overflow-hidden p-0"
                    style={{
                      borderColor: porosity === opt.id ? '#DD8106' : '#CE935F',
                      backgroundColor: 'transparent',
                      color: porosity === opt.id ? '#DD8106' : '#573203',
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                    }}
                  >
                    <div
                      className="w-full h-32 relative flex items-center justify-center gap-0.5"
                      style={{ backgroundColor: porosity === opt.id ? 'rgba(249, 160, 40, 0.4)' : 'transparent' }}
                    >
                      {Array.from({ length: opt.icon }).map((_, i) => (
                        <PorosityIcon key={i} className="w-8 h-auto flex-shrink-0" style={{ color: porosity === opt.id ? '#DD8106' : '#AF5500' }} />
                      ))}
                    </div>
                    <div
                      className="w-full flex items-center justify-center font-semibold py-1.5 pb-3 text-sm"
                      style={{
                        backgroundColor: porosity === opt.id ? 'rgba(249, 160, 40, 0.4)' : 'transparent',
                        color: porosity === opt.id ? '#DD8106' : '#AF5500',
                      }}
                    >
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#573203' }}>
                What is your Hair Density?
              </h2>
              <p className="text-sm mb-10" style={{ color: '#573203' }}>(Don&apos;t worry, we&apos;ll confirm with photo analysis)</p>
              <div className="grid grid-cols-2 gap-4">
                {DENSITY_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setDensity(opt.id)}
                    className="rounded-xl border-2 flex flex-col items-center gap-0 transition-all overflow-hidden p-0"
                    style={{
                      borderColor: density === opt.id ? '#DD8106' : '#CE935F',
                      backgroundColor: 'transparent',
                      color: density === opt.id ? '#DD8106' : '#573203',
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                    }}
                  >
                    <div
                      className="w-full h-32 relative flex items-center justify-center pt-6"
                      style={{ backgroundColor: density === opt.id ? 'rgba(249, 160, 40, 0.4)' : 'transparent' }}
                    >
                      <div className="flex items-center justify-center gap-1.5">
                        {Array.from({ length: opt.icon }).map((_, i) => (
                          <Circle key={i} className="w-6 h-6 flex-shrink-0 fill-none" style={{ stroke: density === opt.id ? '#DD8106' : '#AF5500' }} />
                        ))}
                      </div>
                    </div>
                    <div
                      className="w-full flex items-center justify-center font-semibold py-1.5 pb-3 text-sm"
                      style={{
                        backgroundColor: density === opt.id ? 'rgba(249, 160, 40, 0.4)' : 'transparent',
                        color: density === opt.id ? '#DD8106' : '#AF5500',
                      }}
                    >
                      {opt.label}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <h2 className="text-xl font-bold mb-2" style={{ color: '#573203' }}>
                What are your hair goals?
              </h2>
              <p className="text-sm mb-10" style={{ color: '#573203' }}>Select all that apply</p>
              <div className="grid grid-cols-2 gap-3 [&>button]:min-h-[72px]">
                {HAIR_GOALS.map(({ label, emoji }) => (
                  <button
                    key={label}
                    onClick={() => toggleGoal(label)}
                    className="h-[60px] px-4 rounded-xl border-2 text-left font-medium transition-all flex items-center gap-2"
                    style={{
                      borderColor: hairGoals.includes(label) ? '#DD8106' : '#CE935F',
                      backgroundColor: hairGoals.includes(label) ? 'rgba(249, 160, 40, 0.4)' : 'transparent',
                      color: hairGoals.includes(label) ? '#DD8106' : '#573203',
                      fontFamily: 'Bricolage Grotesque, sans-serif',
                    }}
                  >
                    <span className="text-lg flex-shrink-0">{emoji}</span>
                    <span className="text-sm leading-tight line-clamp-2 whitespace-pre-line">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 5 && (
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Globe className="w-5 h-5" style={{ color: '#AF5500' }} />
                  <label className="text-sm font-medium" style={{ color: '#573203' }}>
                    Where are you Located?
                  </label>
                </div>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#CE935F] focus:ring-2 focus:ring-[#AF5500] outline-none bg-white appearance-none bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center]"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    color: '#573203',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23573203' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="">Select location</option>
                  {LOCATIONS.map((loc) => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Cloud className="w-5 h-5" style={{ color: '#AF5500' }} />
                  <label className="text-sm font-medium" style={{ color: '#573203' }}>
                    What climate are you in?
                  </label>
                </div>
                <select
                  value={climate}
                  onChange={(e) => setClimate(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 rounded-xl border border-[#CE935F] focus:ring-2 focus:ring-[#AF5500] outline-none bg-white appearance-none bg-no-repeat bg-[length:1.25rem] bg-[right_0.75rem_center]"
                  style={{
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                    color: '#573203',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%23573203' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                  }}
                >
                  <option value="">Select climate</option>
                  {CLIMATES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
              </FormCard>

              <div className="mt-6 flex justify-end">
                <button
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className="flex items-center gap-2 rounded-xl px-6 py-3 font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50"
                  style={{
                    color: canProceed() ? '#573203' : '#9CA3AF',
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  {step === TOTAL_STEPS - 1 ? 'Finish' : 'Next'}{' '}
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
