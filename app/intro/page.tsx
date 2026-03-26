'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

/**
 * Standalone intro page - always shows the video flow.
 * Use /intro to test the video transition without any skip logic.
 */
export default function IntroPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [skipRequested, setSkipRequested] = useState(false);
  const [showPlayPrompt, setShowPlayPrompt] = useState(false);
  const [videoError, setVideoError] = useState(false);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const hasNavigatedRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const VIDEO_ONLY_DURATION = 3.5;
  const CROSSFADE_DURATION = 1;

  const goToOnboarding = () => {
    if (hasNavigatedRef.current) return;
    hasNavigatedRef.current = true;
    router.push('/onboarding');
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || skipRequested) return;

    const video = videoRef.current;
    if (video) {
      video.play().catch((err) => {
        console.error('Video play error:', err);
        setShowPlayPrompt(true);
      });
      video.onended = () => {
        if (introTimelineRef.current) {
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
    tl.call(goToOnboarding, [], crossfadeStart + CROSSFADE_DURATION);

    return () => {
      introTimelineRef.current?.kill();
      introTimelineRef.current = null;
    };
  }, [mounted, skipRequested]);

  const handleSkip = () => {
    setSkipRequested(true);
    introTimelineRef.current?.kill();
    goToOnboarding();
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#FFFEE1' }}>
        <div className="animate-pulse" style={{ color: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Loading...</div>
      </div>
    );
  }

  return (
    <>
      <link href="https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap" rel="stylesheet" />
      <div
        className="intro-screen"
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          background: '#FFFEE1',
          zIndex: 9999,
          overflow: 'hidden',
        }}
      >
        {showPlayPrompt && !videoError ? (
          <button
            onClick={() => {
              const v = videoRef.current;
              if (v) v.play().then(() => setShowPlayPrompt(false)).catch(() => {});
            }}
            className="absolute inset-0 flex items-center justify-center w-full h-full z-20"
            style={{ background: 'rgba(255, 254, 225, 0.9)' }}
          >
            <span
              className="text-2xl font-bold px-8 py-4 rounded-full cursor-pointer"
              style={{ color: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif', border: '3px solid #AF5500' }}
            >
              Tap to play video
            </span>
          </button>
        ) : null}
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

        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '92%',
            height: '92%',
            maxWidth: '800px',
            maxHeight: '800px',
            minWidth: '280px',
            minHeight: '280px',
            borderRadius: '16px',
            overflow: 'hidden',
            background: '#FFFEE1',
          }}
        >
          <video
            ref={videoRef}
            className="intro-video"
            autoPlay
            muted
            playsInline
            preload="auto"
            onError={(e) => {
              console.error('Video failed to load:', e);
              setVideoError(true);
            }}
            onLoadedData={() => {
              const v = videoRef.current;
              if (v) {
                v.play().catch(() => setShowPlayPrompt(true));
              }
            }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              backgroundColor: '#FFFEE1',
            }}
          >
            <source src="/videos/final-nywele-video.mp4" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
          {showPlayPrompt && !videoError && (
            <button
              onClick={() => {
                const v = videoRef.current;
                if (v) {
                  v.play().catch(() => {});
                  setShowPlayPrompt(false);
                }
              }}
              className="absolute inset-0 flex items-center justify-center w-full h-full bg-black/50 z-10"
              style={{ fontFamily: 'Bricolage Grotesque, sans-serif', color: '#FFFEE1', fontSize: '1.25rem', fontWeight: 600 }}
            >
              Tap to play video
            </button>
          )}
          {videoError && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FFFEE1] z-10 gap-4 p-6">
              <p style={{ color: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Video couldn&apos;t load.</p>
              <button
                onClick={() => router.push('/onboarding')}
                className="px-6 py-3 rounded-full font-semibold"
                style={{ border: '2px solid #AF5500', color: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Continue to onboarding
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
