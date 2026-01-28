'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Camera, Package, RefreshCw, ArrowRight, User } from 'lucide-react';
import Navbar from '@/app/components/Navbar';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';

export default function Products() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const profileData = localStorage.getItem('nywele-user-profile');
    if (profileData) {
      try {
        const parsed = normalizeUserProfile(JSON.parse(profileData));
        setProfile(parsed);
      } catch (error) {
        console.error('Error parsing profile:', error);
      }
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{ background: '#FDF4E8' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#643100] mx-auto mb-4"></div>
            <p style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#FDF4E8' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-md w-full rounded-2xl shadow-xl p-8 text-center"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
              style={{ background: '#CE935F' }}>
              <User size={32} style={{ color: '#FDF4E8' }} />
            </div>
            <h2 className="text-2xl font-bold mb-4" 
              style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
              Create Your Hair Profile First
            </h2>
            <p className="mb-6" 
              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Create your hair profile to check product compatibility
            </p>
            <button
              onClick={() => router.push('/hair-care')}
              className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
              style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Get Started
              <ArrowRight size={20} />
            </button>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen relative" style={{ background: '#FDF4E8' }}>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Caprasimo&family=Bricolage+Grotesque:wght@400;500;600&display=swap');
        `}</style>

        <div className="relative z-10 max-w-7xl mx-auto px-4 py-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-12"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4" 
              style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
              Product Compatibility Checker
            </h1>
            <p className="text-xl" 
              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Scan or search products to see if they work with your hair profile
            </p>
          </motion.div>

          {/* Search Products Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-2xl shadow-xl p-8"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Search size={24} style={{ color: '#643100' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                🔍 Search Products
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Coming soon: Search by name or brand
            </p>
            <input
              type="text"
              placeholder="Search products..."
              disabled
              className="w-full px-4 py-3 rounded-xl border-2"
              style={{ 
                borderColor: '#CE935F',
                background: 'rgba(206, 147, 95, 0.1)',
                color: '#914600',
                fontFamily: 'Bricolage Grotesque, sans-serif'
              }}
            />
          </motion.section>

          {/* Scan Barcode Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-2xl shadow-xl p-8"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Camera size={24} style={{ color: '#643100' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                📷 Scan Barcode
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Coming soon: Use your camera to scan product barcodes
            </p>
            <button
              disabled
              className="px-6 py-3 rounded-xl font-semibold transition-all opacity-50 cursor-not-allowed flex items-center gap-2"
              style={{ 
                background: '#643100',
                color: '#FDF4E8',
                fontFamily: 'Bricolage Grotesque, sans-serif'
              }}
            >
              <Camera size={20} />
              Open Scanner
            </button>
          </motion.section>

          {/* My Products Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8 rounded-2xl shadow-xl p-8"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Package size={24} style={{ color: '#643100' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                💾 My Products
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Products you've saved will appear here
            </p>
            <div className="rounded-xl p-8 text-center"
              style={{ background: 'rgba(206, 147, 95, 0.1)', border: '2px dashed #CE935F' }}>
              <Package size={48} className="mx-auto mb-4" style={{ color: '#CE935F', opacity: 0.5 }} />
              <p style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                No products saved yet
              </p>
            </div>
          </motion.section>

          {/* Find Substitutes Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 rounded-2xl shadow-xl p-8"
            style={{ background: '#FDF4E8', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw size={24} style={{ color: '#643100' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                🔄 Find Substitutes
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Coming soon: Find local alternatives to products from home
            </p>
            <div className="rounded-xl p-6"
              style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
              <p className="text-sm" 
                style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                This feature will help you find compatible products available in your current location when you can't find your usual favorites.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}


