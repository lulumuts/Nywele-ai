'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, Camera, Package, RefreshCw, ArrowRight, User } from 'lucide-react';
import BottomNav from '@/app/components/BottomNav';
import { normalizeUserProfile, type UserProfile } from '@/types/userProfile';
import { getProductsForHairTypeAsync, getAllProducts } from '@/lib/products';

export default function Products() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [browseProducts, setBrowseProducts] = useState<any[]>([]);

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

  useEffect(() => {
    if (!profile) {
      getAllProducts()
        .then((prods) => setBrowseProducts(prods))
        .catch(() => setBrowseProducts([]));
    } else {
      getProductsForHairTypeAsync(profile.hairType || '4c')
        .then((prods) => setBrowseProducts(prods))
        .catch(() => setBrowseProducts([]));
    }
  }, [profile]);

  if (loading) {
    return (
      <>
        <BottomNav />
        <div className="min-h-screen flex items-center justify-center pb-24 md:pt-20 md:pb-8" style={{ background: '#FFFEE1' }}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#643100] mx-auto mb-4"></div>
            <p style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <BottomNav />
        <div className="min-h-screen px-4 py-8 pb-24 md:pt-20 md:pb-8" style={{ background: '#FFFEE1' }}>
          <div className="max-w-2xl mx-auto space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl shadow-xl p-8 text-center"
              style={{ background: '#FFFEE1', border: '2px solid #914600' }}
            >
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ background: '#CE935F' }}>
                <User size={32} style={{ color: '#DD8106' }} />
              </div>
              <h2 className="text-2xl font-bold mb-4"
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                Create Your Hair Profile First
              </h2>
              <p className="mb-6"
                style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Create your hair profile to check product compatibility
              </p>
              <button
                onClick={() => router.push('/onboarding')}
                className="px-6 py-3 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 mx-auto"
                style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
              >
                Get Started
                <ArrowRight size={20} />
              </button>
            </motion.div>
            {browseProducts.length > 0 && (
              <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl shadow-xl p-8"
                style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
              >
                <h2 className="text-xl font-bold mb-2" style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                  Browse Products
                </h2>
                <p className="mb-6 text-sm" style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  Explore our catalog while you set up your profile
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {browseProducts.slice(0, 6).map((product: any, i: number) => (
                    <div
                      key={product.id ?? i}
                      className="flex gap-4 p-4 rounded-xl"
                      style={{ background: 'rgba(206, 147, 95, 0.15)', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                    >
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(206, 147, 95, 0.3)' }}>
                        <Package className="w-6 h-6" style={{ color: '#DD8106' }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold truncate text-sm" style={{ color: '#DD8106' }}>{product.brand}</p>
                        <p className="text-xs truncate" style={{ color: '#DD8106' }}>{product.name}</p>
                        <p className="text-xs font-semibold mt-1" style={{ color: '#AF5500' }}>
                          {product.pricing?.currency ?? product.currency ?? 'KES'}{' '}
                          {(product.pricing?.estimatedPrice ?? product.estimated_price ?? 0).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.section>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <BottomNav />
      <div className="min-h-screen relative pb-24 md:pt-20 md:pb-8" style={{ background: '#FFFEE1' }}>
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
              style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
              Product Compatibility Checker
            </h1>
            <p className="text-xl" 
              style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Scan or search products to see if they work with your hair profile
            </p>
          </motion.div>

          {/* Browse / Recommended Products */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mb-8 rounded-2xl shadow-xl p-8"
            style={{ background: '#FFFFFF', border: '2px solid rgba(175, 85, 0, 0.25)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Package size={24} style={{ color: '#DD8106' }} />
              <h2 className="text-2xl font-bold"
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                {profile ? 'Recommended for You' : 'Browse Products'}
              </h2>
            </div>
            <p className="mb-6"
              style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              {profile
                ? `Based on your ${profile.hairType || '4c'} hair type`
                : 'Explore products from our catalog'}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {browseProducts.length ? browseProducts.map((product: any, i: number) => (
                <div
                  key={product.id ?? i}
                  className="flex gap-4 p-4 rounded-xl transition-all hover:shadow-md"
                  style={{ background: 'rgba(206, 147, 95, 0.15)', border: '1px solid rgba(175, 85, 0, 0.2)' }}
                >
                  <div
                    className="w-16 h-16 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(206, 147, 95, 0.3)' }}
                  >
                    <Package className="w-8 h-8" style={{ color: '#DD8106' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate" style={{ color: '#DD8106' }}>{product.brand}</p>
                    <p className="text-sm truncate" style={{ color: '#DD8106' }}>{product.name}</p>
                    <p className="text-xs mt-1" style={{ color: '#AF5500' }}>
                      {product.category ?? product.subCategory ?? ''}
                    </p>
                    <p className="text-sm font-semibold mt-1" style={{ color: '#AF5500' }}>
                      {product.pricing?.currency ?? product.currency ?? 'KES'}{' '}
                      {(product.pricing?.estimatedPrice ?? product.estimated_price ?? product.pricing?.priceRange?.min ?? 0).toLocaleString()}
                    </p>
                  </div>
                </div>
              )) : (
                <div className="col-span-full rounded-xl p-8 text-center" style={{ background: 'rgba(206, 147, 95, 0.1)', border: '2px dashed #CE935F' }}>
                  <Package size={48} className="mx-auto mb-4" style={{ color: '#CE935F', opacity: 0.5 }} />
                  <p style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    No products to display yet
                  </p>
                </div>
              )}
            </div>
          </motion.section>

          {/* Search Products Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 rounded-2xl shadow-xl p-8"
            style={{ background: '#FFFEE1', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Search size={24} style={{ color: '#DD8106' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                🔍 Search Products
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                color: '#DD8106',
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
            style={{ background: '#FFFEE1', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Camera size={24} style={{ color: '#DD8106' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                📷 Scan Barcode
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Coming soon: Use your camera to scan product barcodes
            </p>
            <button
              disabled
              className="px-6 py-3 rounded-xl font-semibold transition-all opacity-50 cursor-not-allowed flex items-center gap-2"
              style={{ 
                background: '#643100',
                color: '#DD8106',
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
            style={{ background: '#FFFEE1', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <Package size={24} style={{ color: '#DD8106' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                💾 My Products
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Products you've saved will appear here
            </p>
            <div className="rounded-xl p-8 text-center"
              style={{ background: 'rgba(206, 147, 95, 0.1)', border: '2px dashed #CE935F' }}>
              <Package size={48} className="mx-auto mb-4" style={{ color: '#CE935F', opacity: 0.5 }} />
              <p style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
            style={{ background: '#FFFEE1', border: '2px solid #914600' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <RefreshCw size={24} style={{ color: '#DD8106' }} />
              <h2 className="text-2xl font-bold" 
                style={{ color: '#DD8106', fontFamily: 'Caprasimo, serif' }}>
                🔄 Find Substitutes
              </h2>
            </div>
            <p className="mb-4" 
              style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Coming soon: Find local alternatives to products from home
            </p>
            <div className="rounded-xl p-6"
              style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
              <p className="text-sm" 
                style={{ color: '#DD8106', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                This feature will help you find compatible products available in your current location when you can't find your usual favorites.
              </p>
            </div>
          </motion.section>
        </div>
      </div>
    </>
  );
}


