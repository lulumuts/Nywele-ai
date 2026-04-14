'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Package, Sparkles, Loader, ChevronDown, ChevronUp, Clock, HelpCircle, User } from 'lucide-react';
import {
  BottomNavHubShell,
  bottomNavHubMainDashboardClass,
} from '@/app/components/BottomNavHubLayout';
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
} from '@/lib/analyticsTransform';
import HealthTrendChart from '@/app/components/charts/HealthTrendChart';
import ProductSpendDonut from '@/app/components/charts/ProductSpendDonut';
import GoalProgressChart from '@/app/components/charts/GoalProgressChart';

/** Same catalog as Product Compatibility (/products), default "Cleanse & Care" tab */
const DASHBOARD_RECOMMENDED = explorerProductsToCarousel('care', 3);

const ROUTINE_CARDS = [
  { id: '1', title: 'Refresh Your Style', schedule: 'Every Morning', tag: 'Daily', duration: '5-10 Mins', why: 'Keep Your Afro Looking Fresh Throughout The Day' },
  { id: '2', title: 'Deep Condition', schedule: '2x Weekly', tag: 'Weekly', duration: '15-20 Mins', why: 'Restore moisture and strengthen your hair' },
  { id: '3', title: 'Oil & Shine', schedule: 'Once a month', tag: 'Monthly', duration: '2-3 Mins', why: 'Seal in moisture and add shine' },
];

/** Aligns with Hair care step importance when showing scan-based cards. */
function routineCardTagLabel(tag: string): string {
  const t = tag.toLowerCase();
  const map: Record<string, string> = {
    essential: 'Daily',
    recommended: 'Weekly',
    optional: 'Monthly',
    daily: 'Daily',
    weekly: 'Weekly',
    monthly: 'Monthly',
  };
  if (map[t]) return map[t];
  return tag ? tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase() : '';
}

/** #B26805 fill strength by cadence / importance (Monthly strongest → Daily lightest). */
function routineCardSurfaceOpacity(tag: string): number {
  const t = tag.toLowerCase();
  if (t === 'daily' || t === 'essential') return 0.16;
  if (t === 'weekly' || t === 'recommended') return 0.34;
  if (t === 'monthly' || t === 'optional') return 0.48;
  return 0.36;
}

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
    <>
      <style jsx global>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes dashboardTabPanelFromBottom {
          from {
            opacity: 0;
            transform: translate3d(0, 1.75rem, 0);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0);
          }
        }
        .dashboard-tab-panel-enter {
          animation: dashboardTabPanelFromBottom 0.45s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
      `}</style>
      <BottomNavHubShell mainAreaClassName={bottomNavHubMainDashboardClass}>
        <div className="mb-2 shrink-0 md:mb-3 md:pt-10">
          <div className="flex flex-col md:mt-12 md:pt-10 md:flex-row md:items-start md:justify-between md:gap-6">
            <h1
              className="order-2 mt-5 min-w-0 text-3xl font-bold md:order-1 md:mt-0 md:flex-1 md:text-4xl"
              style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
            >
              Hey {userName || 'Layla'},
            </h1>
            <div className="order-1 mt-5 flex justify-end md:order-2 md:mt-0 md:shrink-0 md:justify-end md:pt-1">
              <button
                type="button"
                onClick={() => router.push('/profile')}
                className="inline-flex min-h-[44px] shrink-0 items-center gap-2 border-0 bg-transparent p-0 text-sm font-semibold shadow-none transition-opacity hover:opacity-80 focus:outline-none focus-visible:underline md:text-base"
                style={{
                  color: '#B26805',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                }}
              >
                <User className="h-5 w-5 shrink-0" aria-hidden style={{ color: '#B26805' }} />
                View Profile
              </button>
            </div>
          </div>
        </div>

        {userProfile && (
        <div
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl max-h-[min(70dvh,calc(100dvh-10.5rem))] md:mt-2 md:max-h-[min(74dvh,calc(100dvh-11rem))]"
          style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
        >
          {/* Segmented toggle — single track, sliding active thumb */}
          <div className="shrink-0 px-4 pb-3 pt-5 sm:px-5 sm:pb-4 sm:pt-6 md:px-6 md:pb-4 md:pt-8">
            <div
              role="tablist"
              aria-label="Dashboard view"
              className="relative flex h-9 w-full overflow-hidden rounded-full border-2 border-[#B26805] bg-white sm:h-10"
            >
              <motion.div
                aria-hidden
                className="absolute inset-y-0 rounded-full bg-[#B26805]"
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
                  color: activeTab === 'routine' ? '#FFFFFF' : '#B26805',
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
                  color: activeTab === 'metrics' ? '#FFFFFF' : '#B26805',
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
          <div
            role="tabpanel"
            id="dashboard-panel-routine"
            aria-labelledby="dashboard-tab-routine"
            className="dashboard-tab-panel-enter space-y-8 p-6 md:p-8"
          >
            <div>
              <div className="mb-4">
                <h2
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
                >
                  Your current routine
                </h2>
                <p className="text-base mb-1" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {hairCareCtx.scannedAtLabel
                    ? `From your latest Hair care scan · ${hairCareCtx.scannedAtLabel}`
                    : 'Here is your regimented routine based on your most recent scan'}
                </p>
                {hairCareCtx.recommendation ? (
                  <p className="text-xs opacity-80" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Daily steps from your personalised routine. Full plan, products, and tips stay in Hair care.
                  </p>
                ) : null}
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
                    className="flex-shrink-0 w-[320px] px-6 py-5 md:w-[360px] md:px-8 md:py-7 rounded-xl"
                    style={{
                      background: `rgba(178, 104, 5, ${routineCardSurfaceOpacity(card.tag)})`,
                      border: '2px solid #DD8106',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2 mb-0">
                      <span
                        className="text-base font-semibold leading-tight"
                        style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {card.title}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-xs font-medium shrink-0"
                        style={{ background: '#374151', color: '#FFFFFF' }}
                      >
                        {routineCardTagLabel(card.tag)}
                      </span>
                    </div>
                    <p
                      className="text-sm mb-2 mt-0 leading-tight"
                      style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {card.schedule}
                    </p>
                    <div className="mb-2">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B26805' }} />
                        <span className="text-xs font-medium" style={{ color: '#B26805' }}>Duration</span>
                      </div>
                      <p
                        className="text-xs leading-snug mt-0.5 pl-[calc(0.875rem+0.375rem)]"
                        style={{ color: '#B26805' }}
                      >
                        {card.duration}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#B26805' }} />
                        <span className="text-xs font-medium" style={{ color: '#B26805' }}>Why:</span>
                      </div>
                      <p
                        className="text-xs leading-snug mt-0.5 pl-[calc(0.875rem+0.375rem)]"
                        style={{ color: '#B26805' }}
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
                  style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
                >
                  Past hair scans
                </h3>
                <p className="mb-3 text-sm" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                          color: '#B26805',
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        <span className="font-medium text-[#B26805]">
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
              <div className="mb-4">
                <h2
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
                >
                  Your recommended products
                </h2>
                <p className="text-base" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {hairCareCtx.recommendation &&
                  productsFromHairCareRecommendation(hairCareCtx.recommendation).length > 0
                    ? 'From your latest Hair care routine'
                    : 'Suggested products from our catalog when you have not run Hair care yet'}
                </p>
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
                            <Package className="h-10 w-10" style={{ color: '#B26805' }} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-bold" style={{ color: '#B26805' }}>{product.name}</p>
                      {product.brand ? (
                        <p className="text-[11px] font-semibold uppercase tracking-wide opacity-80" style={{ color: '#B26805' }}>
                          {product.brand}
                        </p>
                      ) : null}
                      <p className="mt-1 line-clamp-3 text-xs" style={{ color: '#B26805' }}>{product.purpose || ''}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {userProfile && (
              <div>
                <h2
                  className="text-xl md:text-2xl font-bold mb-2"
                  style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
                >
                  AI-Powered Recommendations
                </h2>
                <p className="text-sm mb-4" style={{ color: '#B26805' }}>
                  Get a personalized routine and product suggestions from our AI specialist
                </p>
                {!aiRecommendation ? (
                  <button
                    onClick={handleGetAiRecommendations}
                    disabled={loadingAiRecommendation}
                    className="w-full py-4 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ background: 'rgba(175, 85, 0, 0.2)', color: '#B26805', border: '2px solid #914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}
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
                      style={{ background: 'rgba(206, 147, 95, 0.15)', color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      <span className="font-semibold">{showAiRecommendation ? 'Hide' : 'Show'} AI routine</span>
                      {showAiRecommendation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                    </button>
                    {showAiRecommendation && (
                      <>
                        {aiRecommendation.stylistTip && (
                          <p className="text-sm p-3 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)', color: '#B26805' }}>
                            <strong>Expert tip:</strong> {aiRecommendation.stylistTip}
                          </p>
                        )}
                        {aiRecommendation.routine?.steps?.length > 0 && (
                          <ul className="list-decimal list-inside space-y-2" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            {aiRecommendation.routine.steps.map((s: any, i: number) => (
                              <li key={i}>
                                {s.action}: {s.instructions}
                                {s.productName && <span className="block text-sm" style={{ color: '#B26805' }}>→ {s.productName}</span>}
                              </li>
                            ))}
                          </ul>
                        )}
                        {aiRecommendation.products?.length > 0 && (
                          <div className="space-y-2">
                            <p className="font-semibold" style={{ color: '#B26805' }}>Recommended products:</p>
                            {aiRecommendation.products.map((p: any, i: number) => (
                              <div key={i} className="flex gap-3 p-3 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
                                <Package className="w-5 h-5 flex-shrink-0" style={{ color: '#B26805' }} />
                                <div>
                                  <p className="font-medium" style={{ color: '#B26805' }}>{p.brand} {p.name}</p>
                                  <p className="text-xs" style={{ color: '#B26805' }}>{p.reason}</p>
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
          </div>
        )}

        {activeTab === 'metrics' && (
          <div
            role="tabpanel"
            id="dashboard-panel-metrics"
            aria-labelledby="dashboard-tab-metrics"
            className="dashboard-tab-panel-enter space-y-8 p-6 md:p-8"
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
                  style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
                >
                  How healthy is your hair
                </h2>
                <p className="text-sm mb-4" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                    headingColor="#B26805"
                    bodyColor="#B26805"
                  />
                </div>
                <div className="flex flex-wrap items-end gap-6">
                  <div>
                    <p
                      className="text-xs font-semibold uppercase tracking-wide opacity-80"
                      style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      Health score
                    </p>
                    <p
                      className="text-2xl font-bold tabular-nums leading-tight md:text-3xl"
                      style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      85<span className="text-base font-semibold opacity-80 md:text-lg">%</span>
                    </p>
                  </div>
                  {userProfile.hairHealthSnapshot.hairTypeDetected && (
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide opacity-80"
                        style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Type (detected)
                      </p>
                      <p
                        className="text-2xl font-bold capitalize leading-tight md:text-3xl"
                        style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {String(userProfile.hairHealthSnapshot.hairTypeDetected)}
                      </p>
                    </div>
                  )}
                  {userProfile.hairHealthSnapshot.damageSeverity &&
                    userProfile.hairHealthSnapshot.damageSeverity !== 'none' && (
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wide opacity-80"
                          style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        >
                          Damage
                        </p>
                        <p
                          className="text-2xl font-bold capitalize leading-tight md:text-3xl"
                          style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        >
                          {userProfile.hairHealthSnapshot.damageSeverity}
                        </p>
                      </div>
                    )}
                  {userProfile.hairHealthSnapshot.moistureLevel && (
                    <div>
                      <p
                        className="text-xs font-semibold uppercase tracking-wide opacity-80"
                        style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        Moisture
                      </p>
                      <p
                        className="text-2xl font-bold capitalize leading-tight md:text-3xl"
                        style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
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
                style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
              >
                Your Daily Routine
              </h2>
              <p className="text-base mb-6" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Health trend from saved routines and your latest hair scan
              </p>
              <HealthTrendChart {...getHealthTrendData(userProfile)} />
            </div>

            <div>
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
              >
                Your Best Products
              </h2>
              <p className="text-base mb-6" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Your top three recommended products from Hair care (slice sizes follow price when available)
              </p>
              <ProductSpendDonut {...getProductSpendData(userProfile)} />
            </div>

            <div>
              <h2
                className="text-xl md:text-2xl font-bold mb-2"
                style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
              >
                Goal Progress
              </h2>
              <p className="text-sm mb-6" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                How your metrics align with your hair goals
              </p>
              <GoalProgressChart {...getGoalProgressData(userProfile)} />
            </div>
          </div>
        )}
        </div>
        </div>
        )}

        {!userProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-5 flex min-h-0 w-full max-h-[min(70dvh,calc(100dvh-10.5rem))] flex-1 flex-col items-center justify-center overflow-y-auto overscroll-contain rounded-2xl p-8 text-center md:mt-2 md:max-h-[min(74dvh,calc(100dvh-11rem))]"
            style={{ background: '#FFFEE1', border: '2px solid #914600' }}
          >
            <h3 className="text-2xl font-bold mb-2" style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}>
              Create Your Profile
            </h3>
            <p className="mb-6" style={{ color: '#B26805' }}>
              Get personalized hair care recommendations and product suggestions
            </p>
            <button
              onClick={() => router.push('/onboarding')}
              className="px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all"
              style={{ background: '#643100', color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Get Started
            </button>
          </motion.div>
        )}
      </BottomNavHubShell>
    </>
  );
}
