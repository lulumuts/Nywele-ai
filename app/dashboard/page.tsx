'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Sparkles, 
  MapPin, 
  TrendingUp,
  Users,
  Heart,
  ArrowRight,
  User,
  Briefcase,
  CheckCircle,
  X,
  Clock,
  Phone,
  Calendar,
  Lightbulb,
  Package,
  ShoppingBag
} from 'lucide-react';

// Removed feature cards - now in navbar

interface SavedRoutine {
  id: string;
  createdAt: string;
  hairAnalysis: any;
  routine: any;
  notes?: string;
}

interface UserProfile {
  name: string;
  email: string;
  hairType: '4a' | '4b' | '4c';
  hairGoals: string[];
  savedRoutines?: SavedRoutine[];
}

interface BookingData {
  desiredStyle: string;
  date: string;
  time?: string;
  stylistInfo?: {
    name?: string;
    business?: string;
    phone?: string;
  };
  status?: string;
  bookedAt?: string;
}

interface DailyTip {
  id: string;
  category: 'routine' | 'product' | 'style' | 'health';
  title: string;
  description: string;
}

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [showBookingNotification, setShowBookingNotification] = useState(false);
  const [dailyTips, setDailyTips] = useState<DailyTip[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<any[]>([]);

  useEffect(() => {
    // Check if user is registered
    const profile = localStorage.getItem('nywele-user-profile');
    if (profile) {
      const parsedProfile = JSON.parse(profile);
      setUserName(parsedProfile.name);
      setUserProfile(parsedProfile);
      
      // Check for booking data
      const booking = localStorage.getItem('nywele-latest-booking');
      if (booking) {
        const parsedBooking = JSON.parse(booking);
        setBookingData(parsedBooking);
        
        // Show notification if booking is recent (within last 24 hours)
        if (parsedBooking.bookedAt) {
          const bookedTime = new Date(parsedBooking.bookedAt).getTime();
          const now = Date.now();
          const hoursSinceBooking = (now - bookedTime) / (1000 * 60 * 60);
          setShowBookingNotification(hoursSinceBooking < 24);
        }
      }
      
      // Generate daily tips
      generateDailyTips(parsedProfile, booking ? JSON.parse(booking) : null);
      
      // Get product recommendations
      getProductRecommendations(parsedProfile);
    }
  }, []);

  const getProductRecommendations = (profile: UserProfile) => {
    // Check if user has saved routines with product recommendations
    if (profile.savedRoutines && profile.savedRoutines.length > 0) {
      const latestRoutine = profile.savedRoutines[0];
      if (latestRoutine.routine?.productRecommendations?.essential) {
        setRecommendedProducts(latestRoutine.routine.productRecommendations.essential.slice(0, 3));
        return;
      }
    }

    // Default product recommendations based on hair type
    const hairType = profile.hairType;
    const defaultProducts = [
      {
        brand: 'Shea Moisture',
        name: 'Jamaican Black Castor Oil Strengthen & Restore Leave-In Conditioner',
        purpose: `Perfect for ${hairType.toUpperCase()} hair, this leave-in provides deep moisture and strengthens hair`,
        pricing: { currency: 'KES', amount: 1500, size: '312ml' },
        benefits: ['Moisturizes deeply', 'Reduces breakage', 'Promotes hair growth'],
        whereToBuy: ['Carrefour', 'Naivas', 'Online stores']
      },
      {
        brand: 'Cantu',
        name: 'Shea Butter Natural Hair Curl Activator Cream',
        purpose: 'Defines curls and reduces frizz while maintaining moisture',
        pricing: { currency: 'KES', amount: 1200, size: '355ml' },
        benefits: ['Defines curls', 'Reduces frizz', 'Adds shine'],
        whereToBuy: ['Zucchini', 'Healthy U', 'Chandarana']
      },
      {
        brand: 'African Pride',
        name: 'Olive Miracle Deep Conditioning Treatment',
        purpose: 'Weekly deep conditioning for maximum hydration and softness',
        pricing: { currency: 'KES', amount: 800, size: '355ml' },
        benefits: ['Deep conditioning', 'Restores moisture', 'Improves elasticity'],
        whereToBuy: ['Naivas', 'Carrefour', 'Tuskys']
      }
    ];

    setRecommendedProducts(defaultProducts);
  };

  const generateDailyTips = (profile: UserProfile, booking: BookingData | null) => {
    const hairType = profile.hairType.toUpperCase();
    const currentStyle = booking?.desiredStyle || 'your hairstyle';
    const styleName = currentStyle.replace(/-/g, ' ');

    const tips: DailyTip[] = [];

    // Always include basic care
    tips.push({
      id: '1',
      category: 'routine',
      title: booking ? `Care Tips for Your ${styleName}` : `Care Tips for ${hairType} Hair`,
      description: booking 
        ? `With ${hairType} hair and ${styleName}, moisturize your scalp 2-3 times weekly. Use a light oil on edges to prevent breakage.`
        : `For ${hairType} hair, moisturize your scalp 2-3 times weekly. Keep your hair hydrated with regular deep conditioning.`
    });

    // Moisture tips (if in goals)
    if (profile.hairGoals.includes('moisture')) {
      tips.push({
        id: '2',
        category: 'product',
        title: 'Moisture is Key',
        description: `For ${hairType} hair, use the LOC method (Leave-in, Oil, Cream) daily. Focus on keeping your ends sealed.`
      });
    }

    // Growth tips (if in goals)
    if (profile.hairGoals.includes('growth')) {
      tips.push({
        id: '3',
        category: 'health',
        title: 'Promote Hair Growth',
        description: `Massage your scalp 3-5 minutes daily to stimulate blood flow. Eat protein-rich foods and stay hydrated.`
      });
    }

    // Always include night care
    tips.push({
      id: '4',
      category: 'health',
      title: 'Nighttime Protection',
      description: booking 
        ? `Protect your ${styleName} while sleeping! Use a satin bonnet or pillowcase to reduce friction.`
        : `Always sleep with a satin bonnet or pillowcase to protect your hair and retain moisture overnight.`
    });

    setDailyTips(tips.slice(0, 3)); // Show top 3 on dashboard
  };

  return (
    <div className="min-h-screen bg-peach py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* User Profile Banner */}
        {userName ? (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-4 mb-8 border border-gray-100 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center">
                <User className="text-white" size={24} />
              </div>
              <div>
                <p className="text-sm text-gray-600">Welcome back,</p>
                <p className="text-lg font-bold text-gray-800">{userName}</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/profile')}
              className="px-4 py-2 bg-purple-100 text-purple-600 rounded-lg font-medium hover:bg-purple-200 transition-all"
            >
              View Profile
            </button>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl shadow-lg p-4 mb-8 border border-purple-200 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <User className="text-purple-600" size={24} />
              </div>
              <div>
                <p className="text-lg font-bold text-gray-800">Create Your Profile</p>
                <p className="text-sm text-gray-600">Get personalized hair care recommendations</p>
              </div>
            </div>
            <button
              onClick={() => router.push('/register')}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all flex items-center gap-2"
            >
              Sign Up
              <ArrowRight size={16} />
            </button>
          </motion.div>
        )}

        {/* Booking Notification */}
        {showBookingNotification && bookingData && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 relative"
          >
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg">
              <button
                onClick={() => setShowBookingNotification(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="text-white" size={28} />
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    🎉 Booking Confirmed!
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Your appointment for <span className="font-semibold">{bookingData.desiredStyle.replace(/-/g, ' ')}</span> has been booked
                  </p>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Calendar className="text-green-600" size={18} />
                      <span className="text-sm">
                        <strong>Date:</strong> {new Date(bookingData.date).toLocaleDateString('en-US', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>

                    {bookingData.time && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Clock className="text-green-600" size={18} />
                        <span className="text-sm">
                          <strong>Time:</strong> {bookingData.time}
                        </span>
                      </div>
                    )}

                    {bookingData.stylistInfo?.business && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Sparkles className="text-green-600" size={18} />
                        <span className="text-sm">
                          <strong>Salon:</strong> {bookingData.stylistInfo.business}
                        </span>
                      </div>
                    )}

                    {bookingData.stylistInfo?.phone && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <Phone className="text-green-600" size={18} />
                        <span className="text-sm">
                          <strong>Contact:</strong> {bookingData.stylistInfo.phone}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <Clock className="text-yellow-600 flex-shrink-0" size={20} />
                    <p className="text-sm text-yellow-800">
                      <strong>Status:</strong> {
                        bookingData.status === 'pending_quote' ? 'Waiting for quote from stylist' :
                        bookingData.status === 'quote_submitted' ? 'Quote received - review now!' :
                        bookingData.status === 'confirmed' ? 'Confirmed and ready!' :
                        'Processing your request'
                      }
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Personalized Daily Tips */}
        {userProfile && dailyTips.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-12"
          >
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 border border-yellow-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Lightbulb className="text-yellow-600" size={28} />
                  <h2 className="text-2xl font-bold text-gray-800">Your Daily Hair Tips</h2>
                </div>
                <Link 
                  href="/recommendations"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {dailyTips.map((tip, index) => (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="bg-white rounded-xl p-4 border border-gray-100 hover:shadow-lg transition-all"
                  >
                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${
                      tip.category === 'routine' ? 'bg-blue-100 text-blue-700' :
                      tip.category === 'product' ? 'bg-purple-100 text-purple-700' :
                      tip.category === 'style' ? 'bg-orange-100 text-orange-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {tip.category === 'routine' && '💧'}
                      {tip.category === 'product' && '✨'}
                      {tip.category === 'style' && '💇🏾‍♀️'}
                      {tip.category === 'health' && '💚'}
                      <span className="uppercase">{tip.category}</span>
                    </div>
                    <h3 className="font-bold text-gray-800 mb-2">{tip.title}</h3>
                    <p className="text-sm text-gray-600">{tip.description}</p>
                  </motion.div>
                ))}
              </div>
              
              {bookingData && (
                <div className="mt-4 p-3 bg-white rounded-lg border border-yellow-200">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">Current Style:</span> {bookingData.desiredStyle.replace(/-/g, ' ')}
                    {' • '}
                    <span className="font-semibold">Next Appointment:</span> {new Date(bookingData.date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Product Recommendations */}
        {userProfile && recommendedProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="rounded-2xl p-6 border-2" style={{ backgroundColor: 'rgba(184, 125, 72, 0.3)', borderColor: '#9E6240' }}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <ShoppingBag size={28} style={{ color: '#9E6240' }} />
                  <h2 className="text-2xl font-bold" style={{ color: '#9E6240' }}>
                    Recommended Products for You
                  </h2>
                </div>
                <Link 
                  href="/hair-care"
                  className="text-sm font-medium flex items-center gap-1 hover:underline"
                  style={{ color: '#914600' }}
                >
                  Get Full Routine
                  <ArrowRight size={16} />
                </Link>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4">
                {recommendedProducts.map((product, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="rounded-xl p-5 transition-all hover:shadow-lg"
                    style={{ backgroundColor: 'white', border: '2px solid #9E6240' }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Package size={16} style={{ color: '#914600' }} />
                          <span className="text-xs font-semibold" style={{ color: '#914600' }}>
                            RECOMMENDED
                          </span>
                        </div>
                        <h3 className="text-lg font-bold mb-1" style={{ color: '#9E6240' }}>
                          {product.brand}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#914600' }}>
                          {product.name}
                        </p>
                      </div>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs mb-2" style={{ color: '#914600' }}>
                        <strong>Why we recommend:</strong>
                      </p>
                      <p className="text-xs" style={{ color: '#914600' }}>
                        {product.purpose}
                      </p>
                    </div>

                    <div className="mb-3">
                      <p className="text-xs font-semibold mb-1" style={{ color: '#914600' }}>
                        Key Benefits:
                      </p>
                      <ul className="space-y-1">
                        {product.benefits.slice(0, 2).map((benefit: string, idx: number) => (
                          <li key={idx} className="text-xs flex items-start gap-1" style={{ color: '#914600' }}>
                            <span>•</span>
                            <span>{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: 'rgba(158, 98, 64, 0.3)' }}>
                      <div>
                        <p className="text-lg font-bold" style={{ color: '#9E6240' }}>
                          {product.pricing.currency} {product.pricing.amount.toLocaleString()}
                        </p>
                        <p className="text-xs" style={{ color: '#914600' }}>
                          {product.pricing.size}
                        </p>
                      </div>
                      <button 
                        className="px-4 py-2 text-white rounded-lg text-sm font-semibold transition-all hover:shadow-lg"
                        style={{ backgroundColor: '#914600' }}
                        onClick={() => {
                          // Could link to where to buy or product details
                          alert(`Available at: ${product.whereToBuy.join(', ')}`);
                        }}
                      >
                        Buy Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {userProfile.savedRoutines && userProfile.savedRoutines.length > 0 && (
                <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'rgba(158, 98, 64, 0.2)' }}>
                  <p className="text-sm text-center" style={{ color: '#914600' }}>
                    💡 These products are from your latest saved routine • 
                    <Link href="/profile" className="font-semibold hover:underline ml-1">
                      View all your routines
                    </Link>
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Features moved to navbar for better navigation */}

        {/* Footer Note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center text-gray-500 text-sm"
        >
          <p>✨ Powered by AI • Built with love for African hair • All features free to use</p>
        </motion.div>
      </div>
    </div>
  );
}

