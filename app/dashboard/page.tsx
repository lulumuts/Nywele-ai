'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  User,
  ArrowRight,
  Lightbulb,
  ShoppingBag,
  Package,
  Sparkles,
  Search,
  BookOpen
} from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';

interface DailyTip {
  id: string;
  category: 'routine' | 'health';
  title: string;
  description: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [dailyTips, setDailyTips] = useState<DailyTip[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  useEffect(() => {
    const profile = localStorage.getItem('nywele-user-profile');
    if (profile) {
      const parsedProfile = normalizeUserProfile(JSON.parse(profile));
      setUserName(parsedProfile.name);
      setUserProfile(parsedProfile);
      
      generateDailyTips(parsedProfile);
      getProductRecommendations(parsedProfile);
    }
  }, []);

  const dedupeProducts = (products: any[]) => {
    const seen = new Set<string>();

    return products.filter((product) => {
      if (!product) return false;

      const key = `${(product.brand || '').toLowerCase()}-${(product.name || '').toLowerCase()}`;

      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  };

  const getProductRecommendations = (profile: UserProfile) => {
    if (profile.savedRoutines && profile.savedRoutines.length > 0) {
      const latestRoutine = profile.savedRoutines[0];
      if (latestRoutine.routine?.productRecommendations?.essential) {
        const uniqueRecommended = dedupeProducts(latestRoutine.routine.productRecommendations.essential).slice(0, 3);

        if (uniqueRecommended.length > 0) {
          setRecommendedProducts(uniqueRecommended);
          return;
        }
      }
    }

    const defaultProducts = dedupeProducts([
      {
        brand: 'Shea Moisture',
        name: 'Strengthen & Restore Leave-In Conditioner',
        purpose: 'Moisturises & repairs brittle hair',
        pricing: { currency: 'KES', amount: 2200, size: '312ml' },
        benefits: ['Deep hydration', 'Strengthens weak strands'],
        whereToBuy: ['Carrefour', 'Naivas', 'Online stores']
      },
      {
        brand: 'Mielle Organics',
        name: 'Rosemary Mint Scalp & Hair Strengthening Oil',
        purpose: 'Stimulates the scalp & reduces breakage',
        pricing: { currency: 'KES', amount: 1850, size: '59ml' },
        benefits: ['Encourages growth', 'Reduces shedding'],
        whereToBuy: ['Super Cosmetics', 'Healthy U', 'Online stores']
      },
      {
        brand: "Aunt Jackie's",
        name: 'Quench Moisture Intensive Leave-In Conditioner',
        purpose: 'Leave-in hydration for coils & curls',
        pricing: { currency: 'KES', amount: 1600, size: '355ml' },
        benefits: ['Softens coils', 'Reduces tangles'],
        whereToBuy: ['Best Lady', 'Super Cosmetics', 'Jumia']
      }
    ]);

    setRecommendedProducts(defaultProducts.slice(0, 3));
  };

  const generateDailyTips = (profile: UserProfile) => {
    const hairType = profile.hairType.toUpperCase();

    const tips: DailyTip[] = [
      {
      id: '1',
      category: 'routine',
        title: `Care tips for ${hairType} Hair`,
        description: `For ${hairType} hair, moisturise your scalp 2-3 times weekly. Keep your hair hydrated with regular deep conditioning.`
      },
      {
        id: '2',
        category: 'health',
        title: 'Promote Hair Growth',
        description: `For ${hairType} hair, moisturise your scalp 2-3 times weekly. Keep your hair hydrated with regular deep conditioning.`
      },
      {
        id: '3',
        category: 'routine',
        title: `Care tips for ${hairType} Hair`,
        description: `For ${hairType} hair, moisturise your scalp 2-3 times weekly. Keep your hair hydrated with regular deep conditioning.`
      }
    ];

    setDailyTips(tips);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative" style={{ background: '#FDF4E8' }}>
        {/* Wavy Background Pattern */}
        <div style={{
          position: 'fixed',
          width: '150vmax',
          height: '150vmax',
          left: '27%',
          top: '50%',
          transform: 'translate(-50%, -50%) rotate(10deg)',
          zIndex: 1,
          pointerEvents: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='500' height='1024' viewBox='0 0 500 1024' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M136.159 -64.5C495.422 135 532.329 334.5 246.879 534C-38.5715 733.5 -75.4781 933 136.159 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M149.069 -64.5C495.646 135 526.209 334.5 240.759 534C-44.6907 733.5 -75.2541 933 149.069 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M162.277 -64.5C496.167 135 520.387 334.5 234.937 534C-50.5129 733.5 -74.7329 933 162.277 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M175.761 -64.5C496.964 135 514.841 334.5 229.391 534C-56.0589 733.5 -73.9356 933 175.761 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M189.502 -64.5C498.019 135 509.552 334.5 224.102 534C-61.3482 733.5 -72.8815 933 189.502 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M203.482 -64.5C499.312 135 504.502 334.5 219.052 534C-66.3979 733.5 -71.5879 933 203.482 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M217.686 -64.5C500.829 135 499.676 334.5 214.226 534C-71.224 733.5 -70.0707 933 217.686 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M232.099 -64.5C502.556 135 495.059 334.5 209.609 534C-75.841 733.5 -68.3444 933 232.099 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M246.708 -64.5C504.478 135 490.638 334.5 205.188 534C-80.2623 733.5 -66.4223 933 246.708 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M261.5 -64.5C506.583 135 486.4 334.5 200.95 534C-84.4999 733.5 -64.3166 933 261.5 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M276.465 -64.5C508.862 135 482.335 334.5 196.885 534C-88.5651 733.5 -62.0384 933 276.465 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M291.592 -64.5C511.302 135 478.432 334.5 192.982 534C-92.4681 733.5 -59.5981 933 291.592 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M306.871 -64.5C513.895 135 474.681 334.5 189.231 534C-96.2186 733.5 -57.0052 933 306.871 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M322.295 -64.5C516.631 135 471.075 334.5 185.625 534C-99.8252 733.5 -54.2686 933 322.295 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M337.854 -64.5C519.504 135 467.604 334.5 182.154 534C-103.296 733.5 -51.3962 933 337.854 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M353.541 -64.5C522.504 135 464.261 334.5 178.811 534C-106.639 733.5 -48.3956 933 353.541 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M369.345 -64.5C525.622 135 461.035 334.5 175.585 534C-109.865 733.5 -45.2779 933 369.345 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M385.268 -64.5C528.858 135 457.928 334.5 172.478 534C-112.972 733.5 -42.0421 933 385.268 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M401.299 -64.5C532.202 135 454.929 334.5 169.479 534C-115.971 733.5 -38.6976 933 401.299 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M417.433 -64.5C535.65 135 452.033 334.5 166.583 534C-118.867 733.5 -35.25 933 417.433 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M433.665 -64.5C539.195 135 449.235 334.5 163.785 534C-121.665 733.5 -31.7046 933 433.665 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M449.991 -64.5C542.834 135 446.531 334.5 161.081 534C-124.369 733.5 -28.0661 933 449.991 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3Cpath d='M466.404 -64.5C546.561 135 443.914 334.5 158.464 534C-126.986 733.5 -24.3393 933 466.404 1132.5' stroke='%23CE935F' stroke-width='0.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: '100% 100%',
        }} />

        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        `}</style>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold" 
              style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
              Welcome back, {userName || 'Guest'}
            </h1>
            <button
              onClick={() => router.push('/profile')}
              className="px-6 py-3 rounded-xl font-semibold transition-all hover:shadow-lg"
              style={{ 
                background: '#FDF4E8', 
                color: '#914600', 
                border: '2px solid #914600',
                fontFamily: 'Bricolage Grotesque, sans-serif'
              }}
            >
              View Profile
            </button>
          </motion.div>

          {/* Daily Hair Tips Section */}
          {userProfile && dailyTips.length > 0 && (
          <motion.div
              initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mb-12"
            >
              <div className="rounded-2xl shadow-xl p-8"
                style={{ background: 'rgba(175, 85, 0, 0.7)', border: '2px solid #FDF4E8', backdropFilter: 'blur(6px)' }}>
                <h2 className="text-3xl font-bold mb-6"
                  style={{ color: '#FDF4E8', fontFamily: 'Caprasimo, serif' }}>
                  Your Daily Hair Tips
                </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                  {dailyTips.map((tip, index) => (
          <motion.div
                      key={tip.id}
                      initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + index * 0.1 }}
                      className="rounded-xl p-6"
                      style={{ background: 'rgba(253, 244, 232, 0.12)', border: '2px solid #FDF4E8', backdropFilter: 'blur(4px)' }}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold"
                          style={{ color: '#FDF4E8', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          {tip.title}
                  </h3>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ 
                            background: tip.category === 'routine' ? '#643100' : '#AF5500',
                            color: 'white',
                            fontFamily: 'Bricolage Grotesque, sans-serif'
                          }}>
                          {tip.category.charAt(0).toUpperCase() + tip.category.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm"
                        style={{ color: 'rgba(255, 255, 255, 0.85)', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {tip.description}
                      </p>
                    </motion.div>
                  ))}
              </div>
            </div>
          </motion.div>
        )}

          {/* Recommended Products Section */}
          {userProfile && recommendedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
              <div className="rounded-2xl shadow-xl p-8"
                style={{ background: 'rgba(212, 153, 97, 0.6)', border: '2px solid #AF5500' }}>
                <h2 className="text-3xl font-bold mb-6" 
                  style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                  Recommended Products for you
                  </h2>
                
                <div className="grid md:grid-cols-3 gap-6">
                {recommendedProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 + index * 0.1 }}
                      className="rounded-xl p-6 transition-all hover:shadow-lg"
                      style={{ background: '#FDF4E8', border: '2px solid #914600' }}
                    >
                      <div className="mb-4">
                        <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold"
                          style={{ background: '#AF5500', color: 'white', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Recommended
                          </span>
                        </div>

                      {/* Product Image Placeholder */}
                      <div className="mb-4 h-32 rounded-lg flex items-center justify-center"
                        style={{ background: 'rgba(206, 147, 95, 0.2)' }}>
                        <Package size={48} style={{ color: '#914600' }} />
                    </div>

                      <h3 className="text-lg font-bold mb-1" 
                        style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {product.brand}
                      </h3>
                      <p className="text-sm mb-3" 
                        style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {product.name}
                      </p>
                      
                      <div className="rounded-lg p-3 mb-3" 
                        style={{ background: 'rgba(145, 70, 0, 0.1)' }}>
                        <p className="text-xs font-semibold mb-1" 
                          style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Why we recommend:
                        </p>
                        <p className="text-sm" 
                          style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {product.purpose}
                      </p>
                    </div>

                      <div className="mb-4">
                        <p className="text-xs font-semibold mb-2" 
                          style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          Key benefits:
                      </p>
                      <ul className="space-y-1">
                          {product.benefits.map((benefit: string, idx: number) => (
                            <li key={idx} className="flex items-start gap-2 text-xs" 
                              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                            <span>•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                      <div className="flex items-center justify-between pt-3" 
                        style={{ borderTop: '1px solid rgba(145, 70, 0, 0.3)' }}>
                      <div>
                          <p className="text-xl font-bold" 
                            style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                          {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                        </p>
                      </div>
                      <button 
                        className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                          style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                        onClick={() => {
                          alert(`Available at: ${product.whereToBuy.join(', ')}`);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

          {/* Education-First CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="grid md:grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Primary CTA: Understand Your Hair */}
              <motion.button
                onClick={() => router.push('/hair-care')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="lg:col-span-2 rounded-2xl shadow-xl p-8 text-left transition-all hover:shadow-2xl"
                style={{ 
                  background: 'linear-gradient(135deg, #643100 0%, #AF5500 100%)',
                  border: '2px solid #914600'
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(253, 244, 232, 0.2)' }}>
                    <Lightbulb size={32} style={{ color: '#FDF4E8' }} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-2" 
                      style={{ color: '#FDF4E8', fontFamily: 'Caprasimo, serif' }}>
                      Understand Your Hair
                    </h3>
                    <p className="mb-4 text-lg" 
                      style={{ color: 'rgba(253, 244, 232, 0.9)', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Get AI-powered hair analysis and personalized care routines
                    </p>
                    <div className="flex items-center gap-2 text-white font-semibold">
                      <span style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Get Started</span>
                      <ArrowRight size={20} />
                    </div>
                  </div>
                </div>
              </motion.button>

              {/* Secondary CTA: Check a Product */}
              <motion.button
                onClick={() => router.push('/products')}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl shadow-xl p-6 text-left transition-all hover:shadow-2xl"
                style={{ 
                  background: '#FDF4E8',
                  border: '2px solid #914600'
                }}
              >
                <div className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                  style={{ background: 'rgba(206, 147, 95, 0.2)' }}>
                  <Search size={24} style={{ color: '#643100' }} />
                </div>
                <h4 className="text-xl font-bold mb-2" 
                  style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                  Check a Product
                </h4>
                <p className="text-sm mb-3" 
                  style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  See if products work with your hair profile
                </p>
                <div className="flex items-center gap-2" style={{ color: '#914600' }}>
                  <span className="text-sm font-semibold" style={{ fontFamily: 'Bricolage Grotesque, sans-serif' }}>Explore</span>
                  <ArrowRight size={16} />
                </div>
              </motion.button>
            </div>

            {/* Tertiary CTA: Style Advisor */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-6"
            >
              <button
                onClick={() => router.push('/style-advisor')}
                className="w-full rounded-xl shadow-lg p-4 text-left transition-all hover:shadow-xl flex items-center justify-between"
                style={{ 
                  background: 'rgba(212, 153, 97, 0.3)',
                  border: '1px solid #CE935F'
                }}
              >
                <div className="flex items-center gap-3">
                  <Sparkles size={20} style={{ color: '#914600' }} />
                  <div>
                    <p className="font-semibold" 
                      style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Get Style Advice
                    </p>
                    <p className="text-xs" 
                      style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                      Check style compatibility and get recommendations
                    </p>
                  </div>
                </div>
                <ArrowRight size={16} style={{ color: '#914600' }} />
              </button>
            </motion.div>
          </motion.div>

          {/* Call to Action for New Users */}
          {!userProfile && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="rounded-2xl shadow-xl p-8 text-center"
              style={{ background: '#FDF4E8', border: '2px solid #914600' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#CE935F' }}>
                <User size={32} style={{ color: '#FDF4E8' }} />
              </div>
              <h3 className="text-3xl font-bold mb-2" 
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                Create Your Profile
              </h3>
              <p className="mb-6" 
                style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Get personalized hair care recommendations and product suggestions
              </p>
              <button
                onClick={() => router.push('/hair-care')}
                className="px-8 py-4 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
                style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Get Started
                <ArrowRight size={20} />
              </button>
        </motion.div>
          )}
        </div>
      </div>
    </>
  );
}
