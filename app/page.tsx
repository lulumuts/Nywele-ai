'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { gsap } from 'gsap';

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTestMode = searchParams?.get?.('replay') === '1' || searchParams?.get?.('test-video') === '1';
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasNavigatedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const VIDEO_ONLY_DURATION = 3.5;
  const CROSSFADE_DURATION = 1;

  const goToNext = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    const hasProfile = localStorage.getItem('nywele-user-profile');
    router.push(hasProfile ? '/dashboard' : '/onboarding');
  };

  const goToOnboardingAfterVideo = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    router.push('/onboarding');
  };

  useEffect(() => {
    const hasSkippedBefore = !isTestMode && localStorage.getItem('nywele-skip-intro') === 'true';
    if (hasSkippedBefore) {
      setShowIntro(false);
      const hasProfile = localStorage.getItem('nywele-user-profile');
      router.push(hasProfile ? '/dashboard' : '/onboarding');
      return;
    }
    setMounted(true);
  }, [router, isTestMode]);

  const runTransition = useRef(false);
  useEffect(() => {
    if (!mounted || skipRequested) return;

    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => console.error('Video play error:', err));
      video.onended = () => {
        if (!runTransition.current && introTimelineRef.current) {
          runTransition.current = true;
          introTimelineRef.current.play(VIDEO_ONLY_DURATION);
        }
      };
    }

    const tl = gsap.timeline();
    introTimelineRef.current = tl;

    const crossfadeStart = VIDEO_ONLY_DURATION;
    tl.to('.intro-video', {
      opacity: 0,
      duration: CROSSFADE_DURATION,
      ease: 'power2.inOut',
      onComplete: () => {
        const vid = videoRef.current;
        if (vid) vid.style.visibility = 'hidden';
      },
    }, crossfadeStart);
    tl.call(goToOnboardingAfterVideo, [], crossfadeStart + CROSSFADE_DURATION);

    return () => {
      introTimelineRef.current?.kill();
      introTimelineRef.current = null;
    };
  }, [mounted, skipRequested]);

  const handleSkip = () => {
    localStorage.setItem('nywele-skip-intro', 'true');
    setSkipRequested(true);
    introTimelineRef.current?.kill();
    goToNext();
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        body {
          margin: 0;
          padding: 0;
          min-height: 100vh;
          width: 100vw;
          background: #FFFEE1;
          font-family: 'Bricolage Grotesque', sans-serif;
          overflow: hidden;
        }
        .intro-screen {
          position: fixed;
          inset: 0;
          background: #FFFEE1;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
        }
        .intro-overlay-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .video-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 92%;
          height: 92%;
          max-width: 800px;
          max-height: 800px;
          border-radius: 16px;
          overflow: hidden;
          background: #FFFEE1;
          min-width: 280px;
          min-height: 280px;
          z-index: 1;
        }
        .intro-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 1;
          z-index: 2;
        }
      `}</style>

      {showIntro && mounted && !skipRequested && (
        <div className="intro-screen">
          <div className="intro-overlay-content">
            <button
              onClick={handleSkip}
              className="absolute top-6 right-6 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 z-20"
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

            <div className="video-container">
              <video
                ref={videoRef}
                className="intro-video"
                autoPlay
                muted
                playsInline
                preload="auto"
                style={{ width: '100%', height: '100%', objectFit: 'cover', backgroundColor: '#FFFEE1' }}
                onError={(e) => console.error('Video failed to load:', e)}
              >
                <source src="/videos/final-nywele-video.mp4" type="video/mp4" />
              </video>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFEE1' }}>
        <div className="animate-pulse" style={{ color: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Loading...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
