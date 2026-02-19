'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function OnboardingPrompt() {
  const router = useRouter();

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8"
      style={{ background: '#FFFEE1' }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>

      <Link
        href="/"
        className="absolute top-6 left-6 flex items-center gap-2 text-[#914600] hover:text-[#643100] transition-colors"
        style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}
      >
        <ArrowLeft className="w-5 h-5" />
        <span className="text-sm font-medium">Back</span>
      </Link>

      <div className="max-w-lg w-full text-center">
        <h1
          className="text-4xl md:text-5xl font-bold mb-6"
          style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}
        >
          Hey there,
        </h1>
        <p
          className="text-lg md:text-xl mb-8 leading-relaxed"
          style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}
        >
          You don&apos;t have a profile set up yet.
        </p>

        <div className="mb-8 flex justify-center">
          <img
            src="/images/intro-hey-there.png"
            alt="Woman with Bantu knots"
            className="w-48 h-56 object-contain rounded-2xl"
          />
        </div>

        <button
          onClick={() => router.push('/onboarding/profile')}
          className="w-full max-w-sm mx-auto block py-4 px-6 rounded-full font-semibold text-lg transition-all hover:shadow-lg"
          style={{
            background: 'transparent',
            border: '2px solid #AF5500',
            color: '#AF5500',
            fontFamily: 'Bricolage Grotesque, sans-serif',
          }}
        >
          Let&apos;s fix that!
        </button>

        <p className="mt-6 text-sm" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Or{' '}
          <Link
            href="/onboarding/features"
            className="font-semibold underline hover:no-underline"
            style={{ color: '#AF5500' }}
          >
            Explore and Learn more →
          </Link>
        </p>
      </div>
    </div>
  );
}
