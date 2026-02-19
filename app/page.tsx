'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { gsap } from 'gsap';

export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isTestMode = searchParams.get('replay') === '1' || searchParams.get('test-video') === '1';
  const [showIntro, setShowIntro] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);
  const [welcomeClickable, setWelcomeClickable] = useState(false);
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

  useEffect(() => {
    // Allow testing the video flow via ?replay=1 or ?test-video=1 (bypasses skip check)
    const hasSkippedBefore = !isTestMode && localStorage.getItem('nywele-skip-intro') === 'true';
    if (hasSkippedBefore) {
      setShowIntro(false);
      const hasProfile = localStorage.getItem('nywele-user-profile');
      router.push(hasProfile ? '/dashboard' : '/onboarding');
      return;
    }
    const mountTimer = setTimeout(() => setMounted(true), 10);
    return () => clearTimeout(mountTimer);
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
    tl.fromTo('.intro-welcome-content',
      { opacity: 0, scale: 0.96 },
      {
        opacity: 1,
        scale: 1,
        duration: CROSSFADE_DURATION,
        ease: 'power2.out',
        clearProps: 'all',
      },
      crossfadeStart
    );
    tl.call(() => setWelcomeClickable(true), [], crossfadeStart + CROSSFADE_DURATION);

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

  const handleGetStarted = () => {
    localStorage.setItem('nywele-skip-intro', 'true');
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
          inset: 0;
          overflow: hidden;
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
        .intro-welcome-content {
          position: relative;
          text-align: center;
          z-index: 3;
          opacity: 0;
          pointer-events: none;
          transform-origin: center center;
          will-change: opacity, transform;
        }
        .intro-welcome-content.visible { pointer-events: auto; }
        .intro-welcome-card {
          padding: 2rem;
          border-radius: 1.5rem;
          background: rgba(255, 254, 225, 0.95);
          box-shadow: 0 8px 32px rgba(100, 49, 0, 0.12);
          backdrop-filter: blur(12px);
        }
        .welcome-coil {
          width: 100px;
          height: 95px;
          margin: 0 auto 24px;
          display: block;
        }
        .welcome-title {
          font-size: clamp(2.5rem, 6vw, 4rem);
          font-weight: 700;
          letter-spacing: -1px;
          color: #AF5500;
          font-family: 'Caprasimo', serif;
          margin-bottom: 12px;
        }
        .welcome-tagline {
          font-size: clamp(0.9rem, 2vw, 1.1rem);
          color: #DD8106;
          font-family: 'Bricolage Grotesque', sans-serif;
          margin-bottom: 40px;
          letter-spacing: 0.5px;
        }
        .welcome-btn {
          display: inline-block;
          padding: 16px 48px;
          background: transparent;
          border: 3px solid #AF5500;
          border-radius: 12px;
          color: #AF5500;
          font-size: 1.1rem;
          font-weight: 600;
          font-family: 'Bricolage Grotesque', sans-serif;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .welcome-btn:hover {
          background: #AF5500;
          color: #DD8106;
        }
        @media (max-width: 768px) {
          .welcome-title { font-size: 2.5rem; }
          .welcome-tagline { font-size: 0.95rem; }
          .welcome-btn { padding: 14px 36px; font-size: 1rem; }
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
              >
                <source src="/videos/final-nywele-video.mp4" type="video/mp4" />
              </video>
            </div>

            <div className={`intro-welcome-content ${welcomeClickable ? 'visible' : ''}`}>
              <div className="intro-welcome-card">
              <svg
                className="welcome-coil"
                viewBox="0 0 81 77"
                fill="none"
              >
                <path
                  d="M26.4168 1.50037C26.3153 1.546 18.9202 4.51235 16.9078 5.85052C14.8953 7.18868 12.4202 8.01234 10.9202 9.51236C9.42023 11.0124 8.92019 11.5124 6.92021 14.0124C4.92022 16.5124 3.29872 21.0124 2.42021 24.0124C1.54169 27.0124 1.41483 30.8501 1.54169 33.0124C1.67903 35.3533 2.35945 38.7601 4.92022 43.5124C6.74414 46.8972 11.2442 49.4796 13.8322 49.996C16.4202 50.5124 18.6592 51.5876 27.3516 51.4065C30.5874 51.3391 33.5272 50.3174 37.6659 48.861C42.8112 47.0503 45.8731 45.2287 46.7952 44.6319C49.4202 42.9329 50.6765 40.1097 51.39 37.8C51.9398 36.0201 51.1792 34.1978 50.0834 32.8321C48.2852 30.5912 43.5142 29.5747 38.9202 33.5124C35.4202 36.5124 35.0981 37.9497 33.2465 42.0648C31.0265 46.9984 30.649 50.9027 30.5387 52.7799C30.3967 55.1959 30.8062 57.0755 31.4161 58.8381C32.5781 62.1963 34.0986 64.9976 35.3568 66.8227C38.8309 71.8617 42.3911 73.0787 44.3932 73.7446C47.1911 74.6752 52.6891 73.4 57.825 71.8084C61.138 70.7816 65.6434 68.5963 68.0727 67.405C70.5019 66.2138 70.6566 65.9003 70.7175 65.5417C70.8435 64.7991 70.4997 63.933 69.9976 63.1524C69.7559 62.7767 69.3057 62.6225 68.9462 62.5451C66.9408 62.1136 64.4581 64.1761 63.6793 65.2848C62.124 67.499 65.2366 70.8731 66.8107 72.2277C69.7286 73.768 71.0565 74.011 72.9323 74.0274C74.2194 74.016 76.1871 73.9648 78.5749 73.4734"
                  stroke="#AF5500"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </svg>
              <h1 className="welcome-title">Nywele.ai</h1>
              <p className="welcome-tagline">AI-Powered African Hair Care</p>
              <button
                onClick={handleGetStarted}
                className="welcome-btn"
              >
                Get started
              </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
