'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Package, Sparkles, Loader, ChevronDown, ChevronUp, Clock, HelpCircle, ChevronRight } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import HairCareReferencePhoto from '@/app/components/HairCareReferencePhoto';
import { explorerProductsToCarousel, type ExplorerCarouselProduct } from '@/lib/productExplorerCatalog';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';
import {
  getDashboardHairCareContext,
  productsFromHairCareRecommendation,
  routineCardsFromRecommendation,
} from '@/lib/dashboardHairCare';
import {
  getHealthTrendData,
  getProductSpendData,
  getGoalProgressData,
  getLatestHairHealthScore,
} from '@/lib/analyticsTransform';
import HealthTrendChart from '@/app/components/charts/HealthTrendChart';
import ProductSpendDonut from '@/app/components/charts/ProductSpendDonut';
import GoalProgressChart from '@/app/components/charts/GoalProgressChart';

/** Same catalog as Product Compatibility (/products), default "Cleanse & Care" tab */
const DASHBOARD_RECOMMENDED = explorerProductsToCarousel('care', 3);

const ROUTINE_CARDS = [
  { id: '1', title: 'Refresh Your Style', schedule: 'Every Morning', tag: 'Daily', duration: '5-10 Mins', why: 'Keep Your Afro Looking Fresh Throughout The Day' },
  { id: '2', title: 'Deep Condition', schedule: '2x Weekly', tag: 'Weekly', duration: '15-20 Mins', why: 'Restore moisture and strengthen your hair' },
  { id: '3', title: 'Oil & Shine', schedule: 'As Needed', tag: 'Daily', duration: '2-3 Mins', why: 'Seal in moisture and add shine' },
];

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string>('Layla');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'routine' | 'metrics'>('routine');
  const [recommendedProducts, setRecommendedProducts] = useState<ExplorerCarouselProduct[]>(DASHBOARD_RECOMMENDED);
  const [aiRecommendation, setAiRecommendation] = useState<{ routine: any; products: any[]; stylistTip: string } | null>(null);
  const [loadingAiRecommendation, setLoadingAiRecommendation] = useState(false);
  const [showAiRecommendation, setShowAiRecommendation] = useState(false);

  useEffect(() => {
    const profile = localStorage.getItem('nywele-user-profile');
    if (profile) {
      const parsed = normalizeUserProfile(JSON.parse(profile));
      setUserName(parsed.name || 'Layla');
      setUserProfile(parsed);
    }
    setRecommendedProducts(explorerProductsToCarousel('care', 3));
  }, []);

  useEffect(() => {
    const refresh = () => {
      const profile = localStorage.getItem('nywele-user-profile');
      if (profile) {
        const parsed = normalizeUserProfile(JSON.parse(profile));
        setUserName(parsed.name || 'Layla');
        setUserProfile(parsed);
      }
    };
    const onVisibility = () => {
      if (document.visibilityState === 'visible') refresh();
    };
    window.addEventListener('focus', refresh);
    document.addEventListener('visibilitychange', onVisibility);
    return () => {
      window.removeEventListener('focus', refresh);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  const hairCareCtx = useMemo(() => getDashboardHairCareContext(userProfile), [userProfile]);

  const routineCardsLive = useMemo(() => {
    const fromRec = routineCardsFromRecommendation(hairCareCtx.recommendation);
    return fromRec.length > 0 ? fromRec : ROUTINE_CARDS;
  }, [hairCareCtx.recommendation]);

  const productCarouselLive = useMemo(() => {
    const fromHc = productsFromHairCareRecommendation(hairCareCtx.recommendation);
    return fromHc.length > 0 ? fromHc : recommendedProducts;
  }, [hairCareCtx.recommendation, recommendedProducts]);

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
          currentStyle: 'natural',
          porosity: userProfile.hairPorosity || 'unsure',
          concerns: userProfile.currentConcerns || [],
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
    <div
      className="flex h-dvh max-h-dvh min-h-0 flex-col overflow-hidden"
      style={{ background: '#FFFEE1' }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      <BottomNav />

      <div className="mx-auto flex min-h-0 w-full max-w-6xl flex-1 flex-col overflow-hidden px-4 pb-[max(6rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] pt-20 md:px-4 md:pb-8 md:pt-36">
        <div className="mb-3 flex shrink-0 flex-row items-center justify-between gap-3 md:mb-4">
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-3">
            <img
              src="/icons/coil.svg"
              alt=""
              className="h-8 w-8 shrink-0 md:hidden"
            />
            <h1
              className="min-w-0 text-2xl font-bold sm:text-3xl md:text-4xl"
              style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
            >
              Hey {userName || 'Layla'},
            </h1>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="w-fit shrink-0 rounded-xl px-6 py-3 text-sm font-semibold transition-all hover:shadow-lg"
            style={{
              background: '#FFFEE1',
              color: '#3C270C',
              border: 'none',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
          >
            View Profile
          </button>
        </div>

        {userProfile && (
        <div
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl max-h-[min(70dvh,calc(100dvh-10.5rem))] md:max-h-[min(74dvh,calc(100dvh-11rem))]"
          style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
        >
          {/* Segmented toggle — single track, sliding active thumb */}
          <div className="shrink-0 px-4 pb-3 pt-5 sm:px-5 sm:pb-4 sm:pt-6 md:px-6 md:pb-4 md:pt-8">
            <div
              role="tablist"
              aria-label="Dashboard view"
              className="relative flex h-9 w-full overflow-hidden rounded-full border-2 border-[#603E12] bg-white sm:h-10"
            >
              <motion.div
                aria-hidden
                className="absolute inset-y-0 rounded-full bg-[#603E12]"
                initial={false}
                animate={{
                  left: activeTab === 'routine' ? '0%' : '50%',
                  width: '50%',
                }}
                transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              />
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'routine'}
                id="dashboard-tab-routine"
                onClick={() => setActiveTab('routine')}
                className="relative z-10 flex flex-1 items-center justify-center px-1 py-0 text-xs font-semibold leading-tight transition-colors sm:px-2 sm:text-sm"
                style={{
                  color: activeTab === 'routine' ? '#FFFFFF' : '#603E12',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  background: 'transparent',
                }}
              >
                Your Routine
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === 'metrics'}
                id="dashboard-tab-metrics"
                onClick={() => setActiveTab('metrics')}
                className="relative z-10 flex flex-1 items-center justify-center px-1 py-0 text-xs font-semibold leading-tight transition-colors sm:px-2 sm:text-sm"
                style={{
                  color: activeTab === 'metrics' ? '#FFFFFF' : '#603E12',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                  background: 'transparent',
                }}
              >
                Your Metrics
              </button>
            </div>
          </div>

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {activeTab === 'routine' && (
          <motion.div
            role="tabpanel"
            id="dashboard-panel-routine"
            aria-labelledby="dashboard-tab-routine"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-6 md:p-8"
          >
            <div>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-2"
                    style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
                  >
                    Your current routine
                  </h2>
                  <p className="text-base mb-1" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {hairCareCtx.scannedAtLabel
                      ? `From your latest Hair care scan · ${hairCareCtx.scannedAtLabel}`
                      : 'Here is your regimented routine based on your most recent scan'}
                  </p>
                  {hairCareCtx.recommendation ? (
                    <p className="text-xs opacity-80" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Daily steps from your personalised routine. Open Hair care for the full plan, products, and tips.
                    </p>
                  ) : null}
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/hair-care')}
                  className="shrink-0 rounded-xl px-4 py-2.5 text-sm font-semibold transition-opacity hover:opacity-90"
                  style={{
                    background: '#603E12',
                    color: '#FFFFFF',
                    fontFamily: 'Bricolage Grotesque, sans-serif',
                  }}
                >
                  Open Hair care
                </button>
              </div>
              <div
                className="rounded-xl p-4 md:p-5"
                style={{
                  background: 'rgba(255, 254, 225, 0.43)',
                  border: '1px solid rgba(175, 85, 0, 0.14)',
                }}
              >
                <div className="overflow-x-auto pb-1 flex gap-4 scrollbar-hide">
                {routineCardsLive.map((card) => (
                  <div
                    key={card.id}
                    className="flex-shrink-0 w-[320px] px-4 py-3 rounded-xl"
                    style={{ background: '#FFFFFF', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-0">
                      <span
                        className="text-lg font-semibold leading-tight"
                        style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {card.title}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{ background: '#374151', color: '#FFFFFF' }}
                      >
                        {card.tag}
                      </span>
                    </div>
                    <p
                      className="text-sm mb-2 mt-0 leading-tight"
                      style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {card.schedule}
                    </p>
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3C270C' }} />
                        <span className="text-xs font-medium" style={{ color: '#3C270C' }}>Duration</span>
                      </div>
                      <p
                        className="text-xs leading-snug mt-0.5 pl-[calc(0.875rem+0.375rem)]"
                        style={{ color: '#3C270C' }}
                      >
                        {card.duration}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#3C270C' }} />
                        <span className="text-xs font-medium" style={{ color: '#3C270C' }}>Why:</span>
                      </div>
                      <p
                        className="text-xs leading-snug mt-0.5 pl-[calc(0.875rem+0.375rem)]"
                        style={{ color: '#3C270C' }}
                      >
                        {card.why}
                      </p>
                    </div>
                  </div>
                ))}
                </div>
              </div>
            </div>

            {userProfile?.hairCareHistory && userProfile.hairCareHistory.length > 0 ? (
              <div
                className="rounded-xl p-4 md:p-5"
                style={{
                  background: 'rgba(255, 254, 225, 0.35)',
                  border: '1px solid rgba(175, 85, 0, 0.2)',
                }}
              >
                <h3
                  className="mb-2 text-base font-bold md:text-lg"
                  style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
                >
                  Past hair scans
                </h3>
                <p className="mb-3 text-sm" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Reopen any saved scan and routine in Hair care.
                </p>
                <ul className="max-h-40 space-y-2 overflow-y-auto pr-1 md:max-h-48">
                  {userProfile.hairCareHistory.slice(0, 12).map((h) => (
                    <li key={h.id}>
                      <button
                        type="button"
                        onClick={() => router.push(`/hair-care?scan=${encodeURIComponent(h.id)}`)}
                        className="w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors hover:bg-white/80"
                        style={{
                          borderColor: 'rgba(175, 85, 0, 0.25)',
                          color: '#3C270C',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        <span className="font-medium text-[#603E12]">
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

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2
                    className="text-xl md:text-2xl font-bold mb-2"
                    style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
                  >
                    Your recommended products
                  </h2>
                  <p className="text-base" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {hairCareCtx.recommendation &&
                    productsFromHairCareRecommendation(hairCareCtx.recommendation).length > 0
                      ? 'From your latest Hair care routine'
                      : 'Suggested products from our catalog when you have not run Hair care yet'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => router.push('/hair-care')}
                  className="flex shrink-0 items-center justify-center rounded-lg p-2 transition-opacity hover:opacity-80"
                  aria-label="Open Hair care"
                  style={{ color: '#643100' }}
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </div>
              <div
                className="rounded-xl p-4 md:p-5"
                style={{
                  background: 'rgba(255, 254, 225, 0.43)',
                  border: '1px solid rgba(175, 85, 0, 0.14)',
                }}
              >
                <div className="overflow-x-auto pb-1 flex gap-4 scrollbar-hide">
                  {productCarouselLive.map(
                    (product, i) => (
                    <div
                      key={`${product.brand}-${product.name}-${i}`}
                      className="flex w-[240px] shrink-0 flex-col rounded-xl p-4"
                      style={{ background: 'transparent' }}
                    >
                      <div
                        className="mb-3 h-24 w-full shrink-0 overflow-hidden rounded-lg"
                        style={{ background: 'rgba(175, 85, 0, 0.06)' }}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={`${product.brand} ${product.name}`}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <Package className="h-10 w-10" style={{ color: '#3C270C' }} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#3C270C' }}>{product.name}</p>
                      {product.brand ? (
                        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80" style={{ color: '#3C270C' }}>
                          {product.brand}
                        </p>
                      ) : null}
                      <p className="mt-1 line-clamp-3 text-xs" style={{ color: '#3C270C' }}>{product.purpose || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {userProfile && (
              <div>
                <h2
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
                >
                  AI-Powered Recommendations
                </h2>
                <p className="text-sm mb-4" style={{ color: '#3C270C' }}>
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
                          <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)', color: '#3C270C' }}>
                            <strong>Expert tip:</strong> {aiRecommendation.stylistTip}
                          </p>
                        )}
                        {aiRecommendation.routine?.steps?.length > 0 && (
                          <ul className="list-decimal list-inside space-y-2" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {aiRecommendation.routine.steps.map((s: any, i: number) => (
                              <li key={i}>
                                {s.action}: {s.instructions}
                                {s.productName && <span className="block text-sm" style={{ color: '#3C270C' }}>→ {s.productName}</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                        {aiRecommendation.products?.length > 0 && (
                          <div className="space-y-2">
                            <p className="font-semibold" style={{ color: '#3C270C' }}>Recommended products:</p>
                            {aiRecommendation.products.map((p: any, i: number) => (
                              <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
                                <Package className="w-5 h-5 flex-shrink-0" style={{ color: '#3C270C' }} />
                                <div>
                                  <p className="font-medium" style={{ color: '#3C270C' }}>{p.brand} {p.name}</p>
                                  <p className="text-xs" style={{ color: '#3C270C' }}>{p.reason}</p>
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

        {activeTab === 'metrics' && (
          <motion.div
            role="tabpanel"
            id="dashboard-panel-metrics"
            aria-labelledby="dashboard-tab-metrics"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8 p-6 md:p-8"
          >
            {userProfile?.hairHealthSnapshot && (
              <div
                className="rounded-xl p-4 md:p-5"
                style={{
                  background: 'rgba(255, 254, 225, 0.43)',
                  border: '2px solid rgba(175, 85, 0, 0.25)',
                }}
              >
                <h2
                  className="text-xl md:text-2xl font-bold mb-1"
                  style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
                >
                  How healthy is your hair
                </h2>
                <p className="text-sm mb-4" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  From your latest scan in Hair care
                  {userProfile.hairHealthSnapshot.analyzedAt
                    ? ` · ${new Date(userProfile.hairHealthSnapshot.analyzedAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}`
                    : ''}
                </p>
                <div className="mb-4">
                  <HairCareReferencePhoto
                    src={userProfile.hairHealthSnapshot.referenceImageDataUrl}
                    compact
                  />
                </div>
                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={{ color: '#3C270C' }}>
                      Health score
                    </p>
                    <p
                      className="text-4xl font-bold tabular-nums"
                      style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
                    >
                      {getLatestHairHealthScore(userProfile) ?? userProfile.hairHealthSnapshot.healthScore}
                      <span className="text-lg font-semibold opacity-80">/100</span>
                    </p>
                  </div>
                  {userProfile.hairHealthSnapshot.hairTypeDetected && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={{ color: '#3C270C' }}>
                        Type (detected)
                      </p>
                      <p className="text-lg font-bold" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {String(userProfile.hairHealthSnapshot.hairTypeDetected)}
                      </p>
                    </div>
                  )}
                  {userProfile.hairHealthSnapshot.damageSeverity &&
                    userProfile.hairHealthSnapshot.damageSeverity !== 'none' && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={{ color: '#3C270C' }}>
                          Damage
                        </p>
                        <p className="text-lg font-bold capitalize" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          {userProfile.hairHealthSnapshot.damageSeverity}
                        </p>
                      </div>
                    )}
                  {userProfile.hairHealthSnapshot.moistureLevel && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide opacity-80" style={{ color: '#3C270C' }}>
                        Moisture
                      </p>
                      <p className="text-lg font-bold capitalize" style={{ color: '#603E12', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {userProfile.hairHealthSnapshot.moistureLevel.replace(/-/g, ' ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div>
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
              >
                Your Daily Routine
              </h2>
              <p className="text-base mb-6" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Health trend from saved routines and your latest hair scan
              </p>
              <HealthTrendChart {...getHealthTrendData(userProfile)} />
            </div>

            <div>
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
              >
                Your Best Products
              </h2>
              <p className="text-base mb-6" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Here is your regimented routine based on your most recent scan
              </p>
              <ProductSpendDonut {...getProductSpendData(userProfile)} />
            </div>

            <div>
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#603E12', fontFamily: 'Caprasimo, serif' }}
              >
                Goal Progress
              </h2>
              <p className="text-sm mb-6" style={{ color: '#3C270C', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                How your metrics align with your hair goals
              </p>
              <GoalProgressChart {...getGoalProgressData(userProfile)} />
            </div>
          </motion.div>
        )}
        </div>
        </div>
        )}

        {!userProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-8 flex min-h-0 w-full max-h-[min(70dvh,calc(100dvh-10.5rem))] flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain rounded-2xl p-8 text-center md:max-h-[min(74dvh,calc(100dvh-11rem))]"
            style={{ background: '#FFFEE1', border: '2px solid #914600' }}
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
              Create Your Profile
            </h3>
            <p className="mb-6" style={{ color: '#3C270C' }}>
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
