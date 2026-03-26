'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

export default function TestVideoPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasNavigatedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const navigateToTarget = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;

    gsap.to('.intro-overlay-content', {
      opacity: 0,
      duration: 0.45,
      ease: 'power2.inOut',
      onComplete: () => {
        router.push('/dashboard');
      }
    });
  };

  useEffect(() => {
    // Small delay to ensure React is fully hydrated
    const mountTimer = setTimeout(() => {
      setMounted(true);
    }, 10);

    return () => {
      clearTimeout(mountTimer);
    };
  }, []);

  // Video plays alone, then seamless crossfade to text + loading bar
  const VIDEO_ONLY_DURATION = 3.5; // seconds of video alone
  const CROSSFADE_DURATION = 0.9;  // seconds for video out / content in

  useEffect(() => {
    if (!mounted || skipRequested) return;

    if (videoRef.current) {
      videoRef.current.play().catch(err => {
        console.error('Error playing video:', err);
      });
    }

    const introTl = gsap.timeline();
    introTimelineRef.current = introTl;

    // Phase 1: Video only — fade in video (content stays hidden)
    introTl.to('.intro-video', {
      opacity: 1,
      duration: 0.6,
      ease: 'power2.out'
    }, 0);

    // Phase 2: After video-only time, crossfade — video out, text + loading bar in (same duration)
    const crossfadeStart = VIDEO_ONLY_DURATION;
    introTl.to('.intro-video', {
      opacity: 0,
      duration: CROSSFADE_DURATION,
      ease: 'power2.inOut'
    }, crossfadeStart);

    introTl.to('.intro-coil', {
      opacity: 1,
      duration: CROSSFADE_DURATION,
      ease: 'power2.out'
    }, crossfadeStart);

    introTl.to('.intro-title', {
      opacity: 1,
      y: 0,
      duration: CROSSFADE_DURATION,
      ease: 'power2.out'
    }, crossfadeStart);

    introTl.to('.intro-subtitle', {
      opacity: 1,
      duration: CROSSFADE_DURATION,
      ease: 'power2.out'
    }, crossfadeStart);

    introTl.to('.loading-bar-container', {
      opacity: 1,
      duration: CROSSFADE_DURATION,
      ease: 'power2.out'
    }, crossfadeStart);

    introTl.to('.loading-text', {
      opacity: 1,
      duration: CROSSFADE_DURATION,
      ease: 'power2.out'
    }, crossfadeStart);

    // Phase 3: Loading bar fills, then navigate
    const loadingBarStart = crossfadeStart + CROSSFADE_DURATION + 0.1;
    introTl.to('.loading-bar', {
      width: '100%',
      duration: 2,
      ease: 'power2.inOut',
      onComplete: () => {
        navigateToTarget();
      }
    }, loadingBarStart);

    return () => {
      introTimelineRef.current?.kill();
      introTimelineRef.current = null;
    };

  }, [mounted, router, skipRequested]);

  const handleSkip = () => {
    setSkipRequested(true);
    introTimelineRef.current?.kill();
    navigateToTarget();
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

        /* Intro Screen */
        .intro-screen {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: #FFFEE1;
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          overflow: hidden;
          opacity: 1;
          visibility: visible;
        }

        .intro-overlay-content {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: visible;
        }

        .video-container {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          overflow: hidden;
          z-index: 1;
        }

        /* Video is the only thing on the page: full viewport */
        .intro-video {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0;
          z-index: 2;
        }

        /* Content (text + loading bar) — hidden until crossfade */
        .intro-content {
          position: relative;
          text-align: center;
          z-index: 3;
          pointer-events: none;
        }

        .intro-content.visible {
          pointer-events: auto;
        }

        .intro-coil {
          width: 100px;
          height: 95px;
          margin: 0 auto 30px auto;
          display: block;
          opacity: 0;
        }

        .intro-title {
          font-size: 4em;
          font-weight: 700;
          letter-spacing: -2px;
          opacity: 0;
          transform: translateY(50px);
          color: #AF5500;
          font-family: 'Caprasimo', serif;
        }

        .intro-subtitle {
          font-size: 1.1em;
          font-weight: 300;
          margin-top: 8px;
          opacity: 0;
          letter-spacing: 2px;
          text-transform: uppercase;
          color: #AF5500;
          font-family: 'Bricolage Grotesque', sans-serif;
        }

        .loading-bar-container {
          position: absolute;
          bottom: 100px;
          left: 50%;
          transform: translateX(-50%);
          width: 300px;
          height: 2px;
          background: rgba(175, 85, 0, 0.2);
          border-radius: 2px;
          overflow: hidden;
          opacity: 0;
          z-index: 3;
        }

        .loading-bar {
          width: 0%;
          height: 100%;
          background: #AF5500;
          border-radius: 2px;
        }

        .loading-text {
          position: absolute;
          bottom: 120px;
          left: 50%;
          transform: translateX(-50%);
          font-size: 1em;
          letter-spacing: 3px;
          opacity: 0;
          color: #AF5500;
          font-family: 'Bricolage Grotesque', sans-serif;
          z-index: 3;
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .intro-title {
            font-size: 3em;
          }

          .intro-subtitle {
            font-size: 0.9em;
          }

          .loading-bar-container {
            width: 250px;
          }
        }

        @media (max-width: 480px) {
          .intro-title {
            font-size: 2.5em;
          }

          .intro-subtitle {
            font-size: 0.8em;
          }

          .loading-bar-container {
            width: 200px;
            bottom: 80px;
          }

          .loading-text {
            bottom: 100px;
            font-size: 0.9em;
          }
        }
      `}</style>

      {mounted && !skipRequested && (
        <div className="intro-screen">
          <div className="intro-overlay-content">
            {/* Skip Button - Top Right */}
            <button
              onClick={handleSkip}
              className="absolute top-6 right-6 px-4 py-2 rounded-lg font-medium transition-all hover:opacity-80 z-20"
              style={{ 
                background: 'rgba(255, 255, 255, 0.2)', 
                color: '#AF5500',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(175, 85, 0, 0.3)',
                fontFamily: 'Bricolage Grotesque, sans-serif'
              }}
            >
              Skip
            </button>

            {/* Video Container */}
            <div className="video-container">
              <video
                ref={videoRef}
                className="intro-video"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/videos/final-nywele-video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

            {/* Intro Content */}
            <div className="intro-content">
              {/* Coil SVG */}
              <svg 
                className="intro-coil"
                width="81" 
                height="77" 
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
              
              <h1 className="intro-title">Nywele.ai</h1>
              <p className="intro-subtitle">African Hair Care Powered by AI</p>
            </div>

            {/* Loading Bar */}
            <div className="loading-text">Loading Experience</div>
            <div className="loading-bar-container">
              <div className="loading-bar"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
