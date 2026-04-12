'use client';

import { Suspense, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import IntroVideoFallback from '@/app/components/IntroVideoFallback';

/**
 * `/` — WebGL opening runs once in `RootAppWithIntro`. This route only steers
 * users to onboarding or dashboard (no second video intro).
 */
function HomeContent() {
  const router = useRouter();

  useEffect(() => {
    const hasProfile = localStorage.getItem('nywele-user-profile');
    router.replace(hasProfile ? '/dashboard' : '/onboarding');
  }, [router]);

  return <IntroVideoFallback />;
}

export default function Home() {
  return (
    <Suspense fallback={<IntroVideoFallback />}>
      <HomeContent />
    </Suspense>
  );
}
