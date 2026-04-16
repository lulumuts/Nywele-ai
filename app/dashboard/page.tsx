'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Package, Sparkles, Loader, ChevronDown, ChevronUp, Clock, HelpCircle, User } from 'lucide-react';
import {
  BottomNavHubShell,
  bottomNavHubInnerDashboardClass,
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
import { DASHBOARD_CARD_TEXT } from '@/lib/app-theme';
import { squashHairTypeDisplayLabel } from '@/lib/hairHealthSnapshot';
import HealthTrendChart from '@/app/components/charts/HealthTrendChart';
import ProductSpendDonut from '@/app/components/charts/ProductSpendDonut';
import GoalProgressChart from '@/app/components/charts/GoalProgressChart';

/** Same catalog as Product Compatibility (/products), default "Cleanse & Care" tab */
const DASHBOARD_RECOMMENDED = explorerProductsToCarousel('care', 3);

function carouselProductPriceLabel(product: ExplorerCarouselProduct): string | null {
  if (!product.pricing) return null;
  const { currency, amount } = product.pricing;
  return `${currency} ${amount.toLocaleString()}`;
}

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

function profileDisplayName(profile: UserProfile | null): string | null {
  const n = profile?.name?.trim();
  if (!n || n.toLowerCase() === 'guest') return null;
  return n;
}

/** Full onboarding wizard sets porosity + density; hair-care “basic profile” leaves them empty. */
function hasCompletedOnboarding(profile: UserProfile | null): boolean {
  if (!profile) return false;
  const p = profile.hairPorosity;
  const d = profile.hairDensity;
  const porosityOk = p === 'low' || p === 'normal' || p === 'high';
  const densityOk = d === 'low' || d === 'medium' || d === 'high';
  return porosityOk && densityOk;
}

export default function Dashboard() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'routine' | 'metrics'>('routine');
  const [recommendedProducts, setRecommendedProducts] = useState<ExplorerCarouselProduct[]>(DASHBOARD_RECOMMENDED);
  const [aiRecommendation, setAiRecommendation] = useState<{ routine: any; products: any[]; stylistTip: string } | null>(null);
  const [loadingAiRecommendation, setLoadingAiRecommendation] = useState(false);
  const [showAiRecommendation, setShowAiRecommendation] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem('nywele-user-profile');
    if (raw) {
      setUserProfile(normalizeUserProfile(JSON.parse(raw)));
    } else {
      setUserProfile(null);
    }
    setRecommendedProducts(explorerProductsToCarousel('care', 3));
  }, []);

  useEffect(() => {
    const refresh = () => {
      const raw = localStorage.getItem('nywele-user-profile');
      if (raw) {
        setUserProfile(normalizeUserProfile(JSON.parse(raw)));
      } else {
        setUserProfile(null);
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

  const greetingName = useMemo(() => profileDisplayName(userProfile), [userProfile]);
  const onboardingDone = useMemo(() => hasCompletedOnboarding(userProfile), [userProfile]);
  const hairHealthSnapshot = userProfile?.hairHealthSnapshot;
  const healthScorePercent =
    hairHealthSnapshot != null
      ? Math.round(Math.min(100, Math.max(0, hairHealthSnapshot.healthScore)))
      : null;

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
        /** Nudge greeting up on narrow phones only — tablet/desktop (768+) match layout at lg. */
        @media (max-width: 767px) {
          .dashboard-greeting-nudge-up {
            transform: translateY(-0.75rem);
          }
        }
      `}</style>
      <BottomNavHubShell
        mainAreaClassName={bottomNavHubMainDashboardClass}
        innerClassName={bottomNavHubInnerDashboardClass}
      >
        <div className="mb-0 shrink-0 lg:mb-3 lg:pt-10">
          <div className="flex flex-col gap-0 lg:mt-12 lg:flex-row lg:items-start lg:justify-between lg:gap-6 lg:pt-10">
            <h1
              className={`dashboard-greeting-nudge-up min-w-0 text-3xl font-bold md:text-4xl lg:flex-1 ${userProfile ? 'order-2 lg:order-1' : 'order-1'}`}
              style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
            >
              {!onboardingDone
                ? 'Welcome'
                : greetingName
                  ? `Hey ${greetingName},`
                  : 'Hey there,'}
            </h1>
            {userProfile ? (
              <div className="order-1 flex w-full justify-end max-md:pt-3 lg:order-2 lg:w-auto lg:shrink-0 lg:justify-end lg:pt-1">
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
            ) : null}
          </div>
        </div>

        {userProfile && (
        <div
          className="flex min-h-0 w-full min-w-0 flex-1 flex-col overflow-hidden rounded-2xl max-h-[min(76dvh,calc(100dvh-9.5rem))] lg:mt-2 lg:max-h-[min(72dvh,calc(100dvh-11.5rem))]"
          style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
        >
          {/* Segmented toggle — single track, sliding active thumb (tighter below when Metrics so first heading sits higher). */}
          <div
            className={[
              'shrink-0 px-2 pt-4 sm:px-3 sm:pt-5 lg:px-4',
              activeTab === 'metrics' ? 'lg:pt-4 pb-0 sm:pb-1 lg:pb-1' : 'lg:pt-7 pb-2 sm:pb-3 lg:pb-4',
            ].join(' ')}
          >
            <div
              role="tablist"
              aria-label="Dashboard view"
              className="relative flex h-11 w-full overflow-hidden rounded-full border-2 border-[#B26805] bg-white sm:h-12"
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
                className="relative z-10 flex flex-1 items-center justify-center px-2 py-0 text-sm font-semibold leading-tight transition-colors sm:px-3 sm:text-base"
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
                className="relative z-10 flex flex-1 items-center justify-center px-2 py-0 text-sm font-semibold leading-tight transition-colors sm:px-3 sm:text-base"
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

        {!onboardingDone && (
          <div
            className="shrink-0 border-b border-[rgba(175,85,0,0.22)] px-3 py-3 sm:px-4 md:px-5"
            style={{ background: 'rgba(255, 254, 225, 0.55)' }}
            role="status"
          >
            <p
              className="mb-2 text-sm font-medium leading-snug"
              style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Add porosity and density in onboarding to unlock the full personalized routine—or use Hair care and Metrics below.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-opacity hover:opacity-90"
                style={{ background: '#643100', color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Continue setup
              </button>
              <button
                type="button"
                onClick={() => router.push('/style-check')}
                className="rounded-xl border-2 px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-90"
                style={{
                  background: 'transparent',
                  borderColor: '#914600',
                  color: '#B26805',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                }}
              >
                Style Check
              </button>
            </div>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {activeTab === 'routine' && (
          <div
            role="tabpanel"
            id="dashboard-panel-routine"
            aria-labelledby="dashboard-tab-routine"
            className="dashboard-tab-panel-enter space-y-6 px-3 py-5 lg:space-y-8 lg:px-5 lg:py-6"
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
                className="rounded-xl p-4 md:p-5 min-h-[min(48dvh,22rem)] lg:min-h-0"
                style={{
                  background: 'rgba(255, 254, 225, 0.43)',
                  border: '1px solid rgba(175, 85, 0, 0.14)',
                }}
              >
                <div className="flex w-full min-w-0 flex-col gap-4 overflow-x-hidden lg:flex-row lg:flex-nowrap lg:gap-4 lg:overflow-x-auto lg:pb-1 scrollbar-hide">
                {routineCardsLive.map((card) => (
                  <div
                    key={card.id}
                    className="w-full max-w-full shrink-0 rounded-xl px-5 py-6 lg:w-[360px] lg:min-w-[360px] lg:max-w-none lg:px-8 lg:py-7"
                    style={{
                      background: `rgba(178, 104, 5, ${routineCardSurfaceOpacity(card.tag)})`,
                      border: '2px solid #DD8106',
                    }}
                  >
                    <div className="-mt-0.5 mb-0 flex items-start justify-between gap-2">
                      <span
                        className="min-w-0 text-sm font-bold leading-snug lg:text-[0.9375rem]"
                        style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        {card.title}
                      </span>
                      <span
                        className="-mt-1 shrink-0 self-start rounded-full px-2.5 py-1 text-[10px] font-semibold leading-tight sm:px-3 sm:py-1.5 sm:text-[11px]"
                        style={{ background: '#374151', color: '#FFFFFF' }}
                      >
                        {routineCardTagLabel(card.tag)}
                      </span>
                    </div>
                    <p
                      className="mb-2 mt-1.5 text-sm leading-tight"
                      style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                    >
                      {card.schedule}
                    </p>
                    <div className="mb-2">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" style={{ color: DASHBOARD_CARD_TEXT }} />
                        <span className="text-[11px] font-medium leading-tight" style={{ color: DASHBOARD_CARD_TEXT }}>Duration</span>
                      </div>
                      <p
                        className="mt-0.5 pl-4 text-[11px] leading-snug sm:pl-[calc(0.875rem+0.375rem)]"
                        style={{ color: DASHBOARD_CARD_TEXT }}
                      >
                        {card.duration}
                      </p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <HelpCircle className="h-3 w-3 shrink-0 sm:h-3.5 sm:w-3.5" style={{ color: DASHBOARD_CARD_TEXT }} />
                        <span className="text-[11px] font-medium leading-tight" style={{ color: DASHBOARD_CARD_TEXT }}>Why:</span>
                      </div>
                      <p
                        className="mt-0.5 pl-4 text-[11px] leading-snug sm:pl-[calc(0.875rem+0.375rem)]"
                        style={{ color: DASHBOARD_CARD_TEXT }}
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
                  style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Caprasimo, serif' }}
                >
                  Past hair scans
                </h3>
                <p className="mb-3 text-sm" style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                          color: DASHBOARD_CARD_TEXT,
                          fontFamily: 'Bricolage Grotesque, sans-serif',
                        }}
                      >
                        <span className="font-medium" style={{ color: DASHBOARD_CARD_TEXT }}>
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
                className="rounded-xl p-4 md:p-5 min-h-[min(44dvh,20rem)] lg:min-h-0"
                style={{
                  background: 'rgba(255, 254, 225, 0.43)',
                  border: '1px solid rgba(175, 85, 0, 0.14)',
                }}
              >
                <div className="flex w-full min-w-0 flex-col gap-5 sm:gap-6">
                  {productCarouselLive.map(
                    (product, i) => {
                      const priceLabel = carouselProductPriceLabel(product);
                      return (
                    <div
                      key={`${product.brand}-${product.name}-${i}`}
                      className="flex w-full max-w-full flex-col gap-4 rounded-xl p-3 sm:p-4"
                      style={{ background: 'rgba(175, 85, 0, 0.06)' }}
                    >
                      <div
                        className="h-40 w-full shrink-0 overflow-hidden rounded-lg sm:h-44"
                        style={{ background: 'rgba(175, 85, 0, 0.08)' }}
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
                            <Package className="h-10 w-10" style={{ color: DASHBOARD_CARD_TEXT }} />
                          </div>
                        )}
                      </div>
                      <div className="flex min-w-0 w-full flex-col gap-2 text-left">
                        {priceLabel ? (
                          <p
                            className="text-base font-bold tabular-nums leading-tight sm:text-lg"
                            style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            {priceLabel}
                          </p>
                        ) : null}
                        <p
                          className="w-full text-sm font-bold leading-snug break-words sm:text-base"
                          style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        >
                          {product.name}
                        </p>
                        {product.brand ? (
                          <p
                            className="text-[11px] font-semibold uppercase tracking-wide opacity-80"
                            style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            {product.brand}
                          </p>
                        ) : null}
                        {product.purpose ? (
                          <p
                            className="text-xs leading-relaxed break-words sm:text-sm"
                            style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            {product.purpose}
                          </p>
                        ) : null}
                      </div>
                    </div>
                      );
                    })}
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
            className="dashboard-tab-panel-enter space-y-5 px-3 pb-5 pt-4 lg:space-y-7 lg:px-5 lg:pb-6 lg:pt-5"
          >
            <>
              <div className="mb-0 mt-1 lg:mt-2">
                <h2
                  className="text-xl md:text-2xl font-bold mb-1 leading-tight"
                  style={{ color: '#B26805', fontFamily: 'Caprasimo, serif' }}
                >
                  How healthy is your hair
                </h2>
                <p className="text-sm" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  {hairHealthSnapshot ? (
                    <>
                      From your latest scan in Hair care
                      {hairHealthSnapshot.analyzedAt
                        ? ` · ${new Date(hairHealthSnapshot.analyzedAt).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}`
                        : ''}
                    </>
                  ) : (
                    'Complete a scan in Hair care to see your score, photo reference, and breakdown here.'
                  )}
                </p>
              </div>
              {hairHealthSnapshot ? (
                <div
                  className="rounded-xl px-4 pb-4 pt-3 md:px-5 md:pb-5 md:pt-4"
                  style={{
                    background: 'rgba(255, 254, 225, 0.43)',
                    border: '2px solid rgba(175, 85, 0, 0.25)',
                  }}
                >
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
                    <div className="shrink-0 lg:max-w-[200px]">
                      <HairCareReferencePhoto
                        src={hairHealthSnapshot.referenceImageDataUrl}
                        compact
                        alignStart
                        headingColor={DASHBOARD_CARD_TEXT}
                        bodyColor={DASHBOARD_CARD_TEXT}
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col gap-5 sm:gap-6 lg:pt-0.5">
                      <div>
                        <p
                          className="text-xs font-semibold uppercase tracking-wide opacity-80"
                          style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        >
                          Health score
                        </p>
                        <p
                          className="text-2xl font-bold tabular-nums leading-tight md:text-3xl"
                          style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        >
                          {healthScorePercent}
                          <span className="text-base font-semibold opacity-80 md:text-lg">%</span>
                        </p>
                      </div>
                      {(() => {
                        const typeLabel = squashHairTypeDisplayLabel(hairHealthSnapshot.hairTypeDetected);
                        return typeLabel ? (
                          <div>
                            <p
                              className="text-xs font-semibold uppercase tracking-wide opacity-80"
                              style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                            >
                              Type (detected)
                            </p>
                            <p
                              className="text-2xl font-bold capitalize leading-tight md:text-3xl"
                              style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                            >
                              {typeLabel}
                            </p>
                          </div>
                        ) : null;
                      })()}
                      {hairHealthSnapshot.moistureLevel ? (
                        <div>
                          <p
                            className="text-xs font-semibold uppercase tracking-wide opacity-80"
                            style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            Moisture
                          </p>
                          <p
                            className="text-2xl font-bold capitalize leading-tight md:text-3xl"
                            style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}
                          >
                            {hairHealthSnapshot.moistureLevel.replace(/-/g, ' ')}
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ) : (
                <div
                  className="rounded-xl px-4 py-5 md:px-5 md:py-6"
                  style={{
                    background: 'rgba(255, 254, 225, 0.43)',
                    border: '2px solid rgba(175, 85, 0, 0.25)',
                  }}
                >
                  <p className="mb-4 text-sm" style={{ color: DASHBOARD_CARD_TEXT, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    Your health snapshot will appear after you run Hair care with a reference photo.
                  </p>
                  <button
                    type="button"
                    onClick={() => router.push('/hair-care')}
                    className="w-full rounded-xl px-4 py-3 text-center text-sm font-semibold shadow-md transition-opacity hover:opacity-90 sm:w-auto sm:min-w-[12rem]"
                    style={{ background: '#643100', color: '#FFFEE1', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Go to Hair care
                  </button>
                </div>
              )}
            </>

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
              Set up your profile
            </h3>
            <p className="mb-2 max-w-md" style={{ color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Create a profile for personalized routines and product picks—or try Style Check first.
            </p>
            <div className="mt-6 flex w-full max-w-md flex-col gap-3 sm:flex-row sm:justify-center">
              <button
                type="button"
                onClick={() => router.push('/onboarding')}
                className="w-full px-8 py-4 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all sm:w-auto sm:min-w-[11rem]"
                style={{ background: '#643100', color: '#B26805', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Go to onboarding
              </button>
              <button
                type="button"
                onClick={() => router.push('/style-check')}
                className="w-full px-8 py-4 rounded-xl font-semibold border-2 transition-all sm:w-auto sm:min-w-[11rem]"
                style={{
                  background: 'transparent',
                  borderColor: '#914600',
                  color: '#B26805',
                  fontFamily: 'Bricolage Grotesque, sans-serif',
                }}
              >
                Style Check
              </button>
            </div>
          </motion.div>
        )}
      </BottomNavHubShell>
    </>
  );
}
