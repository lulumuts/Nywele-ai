'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import OpeningSequence from '@/components/OpeningSequence';

/**
 * Standalone intro page - shows the Nywele opening animation.
 * Use /intro to test the OpeningSequence transition.
 */
export default function IntroPage() {
  const router = useRouter();
  const hasNavigatedRef = useRef(false);

  const goToOnboarding = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    router.push('/onboarding');
  };

  useEffect(() => {
    // Reset guard when navigating back to /intro in dev.
    hasNavigatedRef.current = false;
  }, []);

  return (
    <>
      <OpeningSequence
        phasePreset="full"
        enableIntroTagline
        onComplete={goToOnboarding}
      />
      <button
        type="button"
        onClick={goToOnboarding}
        className="fixed right-5 top-5 z-[400010] rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-80"
        style={{
          background: 'rgba(255,255,255,0.2)',
          color: '#AF5500',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(175,85,0,0.3)',
          fontFamily: 'Bricolage Grotesque, sans-serif',
        }}
      >
        Skip
      </button>
    </>
  );
}
