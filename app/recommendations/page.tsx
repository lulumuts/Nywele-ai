'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lightbulb, Calendar, Droplet, Wind, Sun, Moon, Sparkles, ArrowRight, Check } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  hairType: '4a' | '4b' | '4c';
  hairGoals: string[];
  createdAt: string;
}

interface BookingData {
  hairType: string;
  desiredStyle: string;
  date: string;
  stylistInfo?: any;
}

interface DailyTip {
  id: string;
  category: 'routine' | 'product' | 'style' | 'health';
  title: string;
  description: string;
  icon: any;
}

export default function DailyRecommendations() {
  const router = useRouter();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    // Check for registered user profile
    const storedProfile = localStorage.getItem('nywele-user-profile');
    
    if (storedProfile) {
      const profile = JSON.parse(storedProfile);
      setUserProfile(profile);
      setHasProfile(true);
      
      // Also check for booking data to enhance recommendations
      const booking = localStorage.getItem('nywele-latest-booking');
      if (booking) {
        setBookingData(JSON.parse(booking));
      }
    }
  }, []);

  // Generate recommendations based on user profile + booking
  const getDailyTips = (): DailyTip[] => {
    if (!userProfile) return [];

    const hairType = userProfile.hairType.toUpperCase();
    const currentStyle = bookingData?.desiredStyle || 'your hairstyle';
    const styleName = currentStyle.replace(/-/g, ' ');

    // Base recommendations tailored to hair goals
    const allTips: DailyTip[] = [];

    // Always include basic care
    allTips.push({
      id: '1',
      category: 'routine',
      title: bookingData ? `Care Tips for Your ${styleName}` : `Care Tips for ${hairType} Hair`,
      description: bookingData 
        ? `With ${hairType} hair and ${styleName}, moisturize your scalp 2-3 times weekly. Use a light oil on edges to prevent breakage.`
        : `For ${hairType} hair, moisturize your scalp 2-3 times weekly. Keep your hair hydrated with regular deep conditioning sessions.`,
      icon: Droplet
    });

    // Moisture tips (if in goals)
    if (userProfile.hairGoals.includes('moisture')) {
      allTips.push({
        id: '2',
        category: 'product',
        title: 'Moisture is Key',
        description: `For ${hairType} hair, use the LOC method (Leave-in, Oil, Cream) daily. Focus on keeping your ends sealed to retain length.`,
        icon: Sparkles
      });
    }

    // Style-specific tips (if booking exists)
    if (bookingData) {
      allTips.push({
        id: '3',
        category: 'style',
        title: 'Style Maintenance Schedule',
        description: `${styleName} typically lasts 6-8 weeks. Refresh edges weekly and consider a deep condition every 2 weeks for best results.`,
        icon: Wind
      });
    }

    // Growth tips (if in goals)
    if (userProfile.hairGoals.includes('growth')) {
      allTips.push({
        id: '4',
        category: 'health',
        title: 'Promote Hair Growth',
        description: `Massage your scalp 3-5 minutes daily to stimulate blood flow. Eat protein-rich foods and stay hydrated for healthy growth.`,
        icon: Sun
      });
    }

    // Always include night care
    allTips.push({
      id: '5',
      category: 'health',
      title: 'Nighttime Hair Care',
      description: bookingData 
        ? `Protect your ${styleName} while sleeping! Use a satin bonnet or pillowcase to reduce friction and maintain moisture.`
        : `Always sleep with a satin bonnet or pillowcase to protect your hair and retain moisture overnight.`,
      icon: Moon
    });

    // Maintenance tips (if in goals)
    if (userProfile.hairGoals.includes('maintenance')) {
      allTips.push({
        id: '6',
        category: 'style',
        title: 'Low-Maintenance Tips',
        description: `Choose protective styles that last 4-8 weeks. Keep a simple routine: moisturize edges, oil scalp, wear bonnet at night.`,
        icon: Wind
      });
    }

    // Return first 4-5 tips
    return allTips.slice(0, 5);
  };

  const tips = getDailyTips();

  return (
    <div className="min-h-screen bg-peach">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Nywele.ai
          </h1>
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-800 text-sm font-medium"
          >
            ← Dashboard
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-2 mb-4">
            <Lightbulb className="text-yellow-600" size={32} />
            <h2 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Daily Recommendations
            </h2>
          </div>
          <p className="text-xl text-gray-600">
            Personalized hair care tips based on your profile
          </p>
        </motion.div>

        {!hasProfile ? (
          // Onboarding Prompt
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-2xl p-12 border border-gray-100 text-center"
          >
            <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lightbulb className="text-purple-600" size={48} />
            </div>
            
            <h3 className="text-3xl font-bold text-gray-800 mb-4">
              Create Your Profile
            </h3>
            <p className="text-lg text-gray-600 mb-8">
              Get personalized hair care recommendations by creating your profile
            </p>

            <div className="bg-purple-50 rounded-xl p-6 mb-8 text-left max-w-md mx-auto">
              <p className="text-gray-700 mb-3 font-semibold">We'll collect:</p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-center gap-2">
                  <Check className="text-purple-600" size={16} />
                  Your name and email
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-purple-600" size={16} />
                  Your hair type (4a, 4b, 4c)
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-purple-600" size={16} />
                  Your hair goals
                </li>
                <li className="flex items-center gap-2">
                  <Check className="text-purple-600" size={16} />
                  Daily care tips tailored to you
                </li>
              </ul>
            </div>

            <button
              onClick={() => router.push('/register')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
            >
              Create Profile
              <ArrowRight size={24} />
            </button>

            <p className="text-sm text-gray-500 mt-6">
              Takes less than 2 minutes • Start getting tips today
            </p>
          </motion.div>
        ) : (
          // Daily Recommendations
          <div>
            {/* Today's Date */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-4 mb-6 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <Calendar className="text-purple-600" size={24} />
                <div>
                  <p className="text-sm text-gray-500">Today</p>
                  <p className="font-semibold text-gray-800">
                    {new Date().toLocaleDateString('en', { weekday: 'long', month: 'long', day: 'numeric' })}
                  </p>
                </div>
              </div>
              <button
                onClick={() => router.push('/profile')}
                className="text-sm text-purple-600 hover:text-purple-700 font-medium"
              >
                View Profile
              </button>
            </motion.div>

            {/* Recommendations */}
            <div className="space-y-4">
              {tips.map((tip, index) => (
                <motion.div
                  key={tip.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 hover:shadow-2xl transition-all"
                >
                  <div className="flex gap-4">
                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${
                      tip.category === 'routine' ? 'from-blue-500 to-cyan-500' :
                      tip.category === 'product' ? 'from-purple-500 to-pink-500' :
                      tip.category === 'style' ? 'from-orange-500 to-red-500' :
                      'from-green-500 to-emerald-500'
                    } flex items-center justify-center flex-shrink-0`}>
                      <tip.icon className="text-white" size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-gray-800">{tip.title}</h3>
                        <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full uppercase">
                          {tip.category}
                        </span>
                      </div>
                      <p className="text-gray-600">{tip.description}</p>
                      <button
                        onClick={() => alert('Action tracking coming soon!')}
                        className="mt-4 text-purple-600 hover:text-purple-700 font-medium text-sm flex items-center gap-1"
                      >
                        Mark as Done
                        <Check size={16} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Coming Soon Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                <Sparkles className="text-yellow-600" size={20} />
                Coming Soon
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Weather-based recommendations (humidity, temperature)</li>
                <li>• Progress-based tips (hair growth milestones)</li>
                <li>• Style cycle reminders (when to refresh or take down)</li>
                <li>• Product inventory tracking (when to restock)</li>
                <li>• Personalized wash day schedules</li>
                <li>• Integration with your calendar and expenses</li>
              </ul>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}

