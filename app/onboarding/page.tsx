'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { gsap } from 'gsap';
import {
  NYWELE_INTRO_CROSSFADE_EVENT,
  OPENING_CROSSFADE_SEC,
  setIntroContentHoldPending,
} from '@/lib/intro-crossfade';

const ONBOARDING_HERO_SRC = '/images/intro-hey-there.png' as const;

const LINE1 = "Hey there,";
const LINE2 = "You don't have a profile set up yet.";

export default function OnboardingPrompt() {
  const router = useRouter();
  const [line1Display, setLine1Display] = useState('');
  const [line2Display, setLine2Display] = useState('');
  const imageRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    setIntroContentHoldPending(true);
    return () => setIntroContentHoldPending(false);
  }, []);

  useEffect(() => {
    const img = new Image();
    const done = () => setIntroContentHoldPending(false);
    img.onload = done;
    img.onerror = done;
    img.src = ONBOARDING_HERO_SRC;
    return () => {
      img.onload = null;
      img.onerror = null;
    };
  }, []);

  useEffect(() => {
    const img = imageRef.current;
    const heading = headingRef.current;
    const btn = buttonRef.current;
    const explore = exploreRef.current;

    if (!img || !heading || !btn || !explore) return;

    const proxy = { val: 0 };

    const runAfterImage = () => {
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });
      tl.fromTo(heading, { opacity: 0 }, { opacity: 1, duration: 0.2 })
        .to(proxy, {
          val: 1,
          duration: 0.8,
          ease: 'none',
          onUpdate: () => {
            const n = Math.floor(proxy.val * LINE1.length);
            setLine1Display(LINE1.slice(0, n));
          },
        })
        .set(proxy, { val: 0 })
        .to(proxy, {
          val: 1,
          duration: 1.2,
          ease: 'none',
          onUpdate: () => {
            setLine1Display(LINE1);
            const n = Math.floor(proxy.val * LINE2.length);
            setLine2Display(LINE2.slice(0, n));
          },
        })
        .fromTo(btn, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '+=0.2')
        .fromTo(explore, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '+=0.2');
    };

    const startImageCrossfade = () => {
      gsap.fromTo(
        img,
        { opacity: 0 },
        {
          opacity: 1,
          duration: OPENING_CROSSFADE_SEC,
          ease: 'power2.inOut',
          onComplete: runAfterImage,
        },
      );
    };

    let started = false;
    const tryStart = () => {
      if (started) return;
      started = true;
      startImageCrossfade();
    };

    const onCrossfade = () => tryStart();
    window.addEventListener(NYWELE_INTRO_CROSSFADE_EVENT, onCrossfade as EventListener);

    const t0 = window.setTimeout(() => {
      if (!document.querySelector('[data-nywele-opening-sequence]')) {
        tryStart();
      }
    }, 0);

    const fallback = window.setTimeout(() => {
      tryStart();
    }, 8000);

    return () => {
      clearTimeout(t0);
      clearTimeout(fallback);
      window.removeEventListener(NYWELE_INTRO_CROSSFADE_EVENT, onCrossfade as EventListener);
    };
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-transparent px-4 md:px-8">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>

      <div className="max-w-sm w-full text-left">
        <div ref={headingRef} className="opacity-0 relative">
          {/* Invisible placeholder to reserve space and prevent layout shift */}
          <div className="invisible" aria-hidden>
            <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ fontFamily: 'Caprasimo, serif' }}>
              {LINE1}
            </h1>
            <p className="text-lg md:text-xl mb-8 leading-relaxed" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              {LINE2}
            </p>
          </div>
          {/* Visible typewriter text, absolutely positioned over placeholder */}
          <div className="absolute inset-0">
            <h1
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ color: '#AF5500', fontFamily: 'Caprasimo, serif' }}
            >
              {line1Display}
            </h1>
            <p
              className="text-lg md:text-xl mb-8 leading-relaxed"
              style={{ color: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              {line2Display}
            </p>
          </div>
        </div>

        <div ref={imageRef} className="mb-8 flex justify-center opacity-0">
          <img
            src={ONBOARDING_HERO_SRC}
            alt="Woman with Bantu knots"
            className="w-72 h-80 md:w-80 md:h-96 object-contain rounded-2xl"
          />
        </div>

        <div className="text-center">
          <button
            ref={buttonRef}
            onClick={() => router.push('/onboarding/profile')}
            className="w-full py-3 px-5 rounded-full font-semibold text-base transition-all hover:shadow-lg opacity-0"
            style={{
              background: 'transparent',
              border: '2px solid #AF5500',
              color: '#AF5500',
              fontFamily: 'Bricolage Grotesque, sans-serif',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#AF5500';
              e.currentTarget.style.color = 'white';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#AF5500';
            }}
          >
            Let&apos;s fix that!
          </button>

          <div ref={exploreRef} className="mt-6 text-base md:text-lg opacity-0 text-center" style={{ color: '#AF5500', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            <p>Or</p>
            <Link
              href="/style-check"
              className="font-semibold underline hover:no-underline inline-block mt-1"
              style={{ color: '#AF5500' }}
            >
              Explore and Learn more →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
