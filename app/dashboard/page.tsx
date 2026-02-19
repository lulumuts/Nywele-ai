'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Package, Sparkles, Loader, ChevronDown, ChevronUp } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';
import { getProductsForHairTypeAsync } from '@/lib/products';

const ROUTINE_STEPS = [
  { id: 'wash', label: 'Wash Your Hair Style', active: true },
  { id: 'condition', label: 'Deep Condition', active: true },
  { id: 'mask', label: 'Hair Mask', active: false },
  { id: 'oil', label: 'Oil & Shine', active: true },
];

const LINE_DATA = [
  { day: 'Mon', value: 52 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 71 },
  { day: 'Thu', value: 81 },
  { day: 'Fri', value: 68 },
  { day: 'Sat', value: 75 },
  { day: 'Sun', value: 70 },
];

const DONUT_DATA = [
  { label: 'Category A', value: 704, color: '#DD8106' },
  { label: 'Category B', value: 533, color: '#FDF4E8' },
  { label: 'Category C', value: 367, color: '#AF5500' },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Layla');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'routine' | 'health'>('routine');
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);
  const [aiRecommendation, setAiRecommendation] = useState<{ routine: any; products: any[]; stylistTip: string } | null>(null);
  const [loadingAiRecommendation, setLoadingAiRecommendation] = useState(false);
  const [showAiRecommendation, setShowAiRecommendation] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('nywele-user-profile');
    if (profile) {
      const parsed = normalizeUserProfile(JSON.parse(profile));
      setUserName(parsed.name || 'Layla');
      setUserProfile(parsed);
      const savedProds = parsed.savedRoutines?.[0]?.routine?.productRecommendations?.essential;
      if (savedProds && Array.isArray(savedProds) && savedProds.length > 0) {
        setRecommendedProducts(savedProds.slice(0, 3));
      } else {
        getProductsForHairTypeAsync(parsed.hairType || '4c')
          .then((prods) => {
            const mapped = prods.slice(0, 3).map((p) => ({
              brand: p.brand,
              name: p.name,
              purpose: p.description?.slice(0, 80) || '',
              pricing: {
                currency: p.pricing?.currency || 'KES',
                amount: p.pricing?.estimatedPrice ?? p.pricing?.priceRange?.min ?? 0,
              },
            }));
            setRecommendedProducts(mapped);
          })
          .catch(() => {
            setRecommendedProducts([
              { brand: 'Shea Moisture', name: 'Water Replenish Mist', purpose: 'Lightweight hydration', pricing: { currency: 'KES', amount: 1200 } },
              { brand: 'Mielle', name: 'Oil & Shine', purpose: 'Nourishing oil blend', pricing: { currency: 'KES', amount: 900 } },
            ]);
          });
      }
    }
  }, []);

  const maxVal = Math.max(...LINE_DATA.map((d) => d.value));
  const totalDonut = DONUT_DATA.reduce((s, d) => s + d.value, 0);

  const handleGetAiRecommendations = async () => {
    if (!userProfile) return;
    setLoadingAiRecommendation(true);
    setAiRecommendation(null);
    try {
      const response = await fetch('/api/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hairType: userProfile.hairType || '4c',
          goals: userProfile.hairGoals || ['moisture', 'growth'],
          currentStyle: userProfile.currentStyle || 'natural',
          porosity: userProfile.hairPorosity || 'unsure',
          concerns: userProfile.currentConcerns || [],
          desiredStyle: userProfile.desiredStyle,
          budget: userProfile.budget || 'any',
          durationPreference: '30 minutes',
        }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setAiRecommendation(result.data);
        setShowAiRecommendation(true);
      }
    } catch (error) {
      console.error('AI recommendation error:', error);
    } finally {
      setLoadingAiRecommendation(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#FFFEE1' }}>
      <BottomNav />

      <div className="flex-1 max-w-6xl mx-auto w-full px-4 py-6 md:py-8 pb-24 md:pb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h1
            className="text-3xl md:text-4xl font-bold"
            style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}
          >
            Hey {userName || 'Layla'},
          </h1>
          <button
            onClick={() => router.push('/profile')}
            className="px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg w-fit"
            style={{
              background: '#FFFEE1',
              color: '#DD8106',
              border: '2px solid #914600',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
          >
            View Profile
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          <button
            onClick={() => setActiveTab('routine')}
            className="px-5 py-2.5 rounded-xl font-semibold transition-all"
            style={{
              background: activeTab === 'routine' ? '#643100' : 'transparent',
              color: activeTab === 'routine' ? '#FDF4E8' : '#914600',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
          >
            Your Routine
          </button>
          <button
            onClick={() => setActiveTab('health')}
            className="px-5 py-2.5 rounded-xl font-semibold transition-all"
            style={{
              background: activeTab === 'health' ? '#643100' : 'transparent',
              color: activeTab === 'health' ? '#FDF4E8' : '#914600',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
          >
            Your Health
          </button>
        </div>

        {activeTab === 'routine' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
            >
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}
              >
                Your Current Routine
              </h2>
              <p className="text-sm mb-6" style={{ color: '#DD8106' }}>
                Here is your regimented routine based on your most recent scan
              </p>
              <div className="space-y-3">
                {ROUTINE_STEPS.map((step) => (
                  <div
                    key={step.id}
                    className="flex items-center justify-between py-2 px-4 rounded-xl"
                    style={{ background: 'rgba(206, 147, 95, 0.15)' }}
                  >
                    <span style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      {step.label}
                    </span>
                    <div
                      className={`w-12 h-6 rounded-full transition-colors ${
                        step.active ? 'bg-[#AF5500]' : 'bg-gray-300'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white mt-0.5 transition-all ${
                          step.active ? 'ml-6' : 'ml-0.5'
                        }`}
                        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
            >
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}
              >
                Your Recommended Products
              </h2>
              <p className="text-sm mb-6" style={{ color: '#DD8106' }}>
                Based on your hair profile and routine
              </p>
              <div className="grid md:grid-cols-2 gap-4">
                {(recommendedProducts.length ? recommendedProducts : [
                  { brand: 'Shea Moisture', name: 'Water Replenish Mist', pricing: { currency: 'KES', amount: 1200 } },
                  { brand: 'Mielle', name: 'Oil & Shine', pricing: { currency: 'KES', amount: 900 } },
                ]).map((product: any, i: number) => (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl"
                    style={{ background: 'rgba(206, 147, 95, 0.15)', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                  >
                    <div
                      className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(206, 147, 95, 0.3)' }}
                    >
                      <Package className="w-8 h-8" style={{ color: '#DD8106' }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold truncate" style={{ color: '#DD8106' }}>{product.brand}</p>
                      <p className="text-sm truncate" style={{ color: '#DD8106' }}>{product.name}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: '#AF5500' }}>
                        {product.pricing?.currency} {(product.pricing?.amount ?? product.pricing?.estimatedPrice ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {userProfile && (
              <div
                className="rounded-2xl p-6 md:p-8"
                style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
              >
                <h2
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}
                >
                  AI-Powered Recommendations
                </h2>
                <p className="text-sm mb-4" style={{ color: '#DD8106' }}>
                  Get a personalized routine and product suggestions from our AI specialist
                </p>
                {!aiRecommendation ? (
                  <button
                    onClick={handleGetAiRecommendations}
                    disabled={loadingAiRecommendation}
                    className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ background: 'rgba(175, 85, 0, 0.2)', color: '#DD8106', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {loadingAiRecommendation ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5" />
                        Get AI Recommendations
                      </>
                    )}
                  </button>
                ) : (
                  <div className="space-y-4">
                    <button
                      onClick={() => setShowAiRecommendation(!showAiRecommendation)}
                      className="w-full flex items-center justify-between py-3 px-4 rounded-xl"
                      style={{ background: 'rgba(206, 147, 95, 0.15)', color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      <span className="font-semibold">{showAiRecommendation ? 'Hide' : 'Show'} AI routine</span>
                      {showAiRecommendation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {showAiRecommendation && (
                      <>
                        {aiRecommendation.stylistTip && (
                          <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)', color: '#DD8106' }}>
                            <strong>Expert tip:</strong> {aiRecommendation.stylistTip}
                          </p>
                        )}
                        {aiRecommendation.routine?.steps?.length > 0 && (
                          <ul className="list-decimal list-inside space-y-2" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {aiRecommendation.routine.steps.map((s: any, i: number) => (
                              <li key={i}>
                                {s.action}: {s.instructions}
                                {s.productName && <span className="block text-sm" style={{ color: '#DD8106' }}>→ {s.productName}</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                        {aiRecommendation.products?.length > 0 && (
                          <div className="space-y-2">
                            <p className="font-semibold" style={{ color: '#DD8106' }}>Recommended products:</p>
                            {aiRecommendation.products.map((p: any, i: number) => (
                              <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
                                <Package className="w-5 h-5 flex-shrink-0" style={{ color: '#DD8106' }} />
                                <div>
                                  <p className="font-medium" style={{ color: '#DD8106' }}>{p.brand} {p.name}</p>
                                  <p className="text-xs" style={{ color: '#DD8106' }}>{p.reason}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === 'health' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
            >
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}
              >
                Your Daily Routine
              </h2>
              <p className="text-sm mb-6" style={{ color: '#DD8106' }}>
                Here is your regimented routine based on your most recent scan
              </p>
              <div className="h-48 flex items-end gap-2">
                {LINE_DATA.map((d, i) => (
                  <div key={d.day} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full rounded-t transition-all"
                      style={{
                        height: `${(d.value / maxVal) * 100}%`,
                        minHeight: '8px',
                        background: 'linear-gradient(180deg, #AF5500 0%, #643100 100%)',
                      }}
                    />
                    <span className="text-xs font-medium" style={{ color: '#DD8106' }}>{d.day}</span>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="rounded-2xl p-6 md:p-8"
              style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
            >
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}
              >
                Your Best Products
              </h2>
              <p className="text-sm mb-6" style={{ color: '#DD8106' }}>
                Here is your regimented routine based on your most recent scan
              </p>
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="relative w-40 h-40">
                  <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                    {DONUT_DATA.reduce<{ acc: number; els: JSX.Element[] }>(
                      (prev, d) => {
                        const pct = (d.value / totalDonut) * 100;
                        const dash = (pct / 100) * 251;
                        const els = [
                          ...prev.els,
                          <circle
                            key={d.label}
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={d.color}
                            strokeWidth="12"
                            strokeDasharray={`${dash} 251`}
                            strokeDashoffset={-(prev.acc / 100) * 251}
                          />,
                        ];
                        return { acc: prev.acc + pct, els };
                      },
                      { acc: 0, els: [] as JSX.Element[] }
                    ).els}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-2xl font-bold" style={{ color: '#DD8106' }}>KES 1,604</span>
                    <span className="text-xs" style={{ color: '#DD8106' }}>Total</span>
                  </div>
                </div>
                <div className="flex-1 space-y-2">
                  {DONUT_DATA.map((d) => (
                    <div key={d.label} className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded"
                        style={{ background: d.color }}
                      />
                      <span style={{ color: '#DD8106' }}>{d.value} {d.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!userProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 rounded-2xl p-8 text-center"
            style={{ background: '#FFFEE1', border: '2px solid #914600' }}
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
              Create Your Profile
            </h3>
            <p className="mb-6" style={{ color: '#DD8106' }}>
              Get personalized hair care recommendations and product suggestions
            </p>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-8 py-4 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Get Started
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
