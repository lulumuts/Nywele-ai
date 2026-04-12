'use client';

import { useRouter } from 'next/navigation';
import { ArrowRight } from 'lucide-react';

const features = [
  {
    icon: '/icons/hair_profile_icon.svg',
    title: 'Build Your Hair Profile',
    description: 'Our goal is to give you the best and most detailed information based on your profile. Scan your hair and fill in a short survey to get started.',
  },
  {
    icon: '/icons/style_check_icon.svg',
    title: 'Understand Your Hair',
    description: 'Understand the best practices for you, including routines and hair styles that work best for your hair type.',
  },
  {
    icon: '/icons/personalised_icon.svg',
    title: 'Get Your Personalised Routine',
    description: 'Based on your profile and hair type, we can suggest products that will keep your hair your healthiest.',
  },
];

export default function OnboardingFeatures() {
  const router = useRouter();

  const handleNext = () => {
    router.push('/onboarding/profile');
  };

  const handleSkip = () => {
    router.push('/dashboard');
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8 py-12"
      style={{ background: '#FFFEE1' }}
    >
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
      `}</style>

      <div className="w-full max-w-[428px] mx-auto flex-1 flex flex-col">
        <div className="grid gap-5 md:gap-6 mb-8 text-center">
          {features.map((item, idx) => (
              <div key={idx} className="flex flex-col items-center gap-4">
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-xl flex items-center justify-center flex-shrink-0 p-1"
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="w-10 h-10 md:w-12 md:h-12 object-contain"
                  />
                </div>
                <div>
                  <h3
                    className="text-xl md:text-2xl font-bold mb-2"
                    style={{ color: '#C17208', fontFamily: 'Caprasimo, serif' }}
                  >
                    {item.title}
                  </h3>
                  <p
                    className="text-base md:text-lg leading-relaxed"
                    style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
        </div>

        <div className="flex items-center justify-between mt-auto pt-6 pb-4">
          <button
            onClick={handleSkip}
            className="text-base md:text-lg font-bold"
            style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Skip
          </button>
          <button
            onClick={handleNext}
            className="flex items-center gap-2 text-base md:text-lg font-bold"
            style={{ color: '#C17208', fontFamily: 'Bricolage Grotesque, sans-serif' }}
          >
            Next <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
