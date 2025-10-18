'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackProductClick, trackSalonView } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';

interface Step {
  stepNumber: number;
  action: string;
  instructions: string;
  duration: string;
  productName?: string;
}

interface Routine {
  steps: Step[];
  totalTime: string;
  frequency: string;
}

interface Product {
  name: string;
  brand: string;
  reason: string;
  affiliateLink?: string;
  imageUrl?: string;
  price?: number;
}

interface Salon {
  id: string;
  name: string;
  location: string;
  area: string;
  phone: string;
  specialties: string[];
  services: string[];
  description: string;
  image_url: string;
  price_range: string;
  rating: number;
}

interface RecommendationData {
  routine: Routine;
  products: Product[];
  stylistTip: string;
}

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationData | null>(null);
  const [styleImage, setStyleImage] = useState<string | null>(null);
  const [loadingImage, setLoadingImage] = useState(false);
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loadingSalons, setLoadingSalons] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('recommendation');
    if (stored) {
      const recData = JSON.parse(stored);
      setData(recData);
      
      // Generate style inspiration image
      generateStyleImage(recData);
      
      // Fetch relevant salons
      fetchRelevantSalons();
    } else {
      router.push('/');
    }
  }, [router]);

  const fetchRelevantSalons = async () => {
    try {
      const desiredStyle = sessionStorage.getItem('desiredStyle');
      const hairType = sessionStorage.getItem('hairType');
      
      if (!supabase) {
        console.log('Supabase not configured');
        setLoadingSalons(false);
        return;
      }

      // Fetch all salons
      const { data: allSalons, error } = await supabase
        .from('salons')
        .select('*')
        .order('rating', { ascending: false });

      if (error) throw error;

      // Filter salons by services matching desired style or specialties matching hair type
      const relevantSalons = (allSalons || []).filter((salon: Salon) => {
        const hasMatchingService = desiredStyle && salon.services.some((service: string) => 
          service.toLowerCase().includes(desiredStyle.toLowerCase()) ||
          desiredStyle.toLowerCase().includes(service.toLowerCase())
        );
        const hasMatchingSpecialty = hairType && salon.specialties.includes(hairType);
        
        return hasMatchingService || hasMatchingSpecialty;
      });

      // If no matches, show top 3 salons
      setSalons(relevantSalons.length > 0 ? relevantSalons.slice(0, 3) : (allSalons || []).slice(0, 3));
    } catch (error) {
      console.error('Error fetching salons:', error);
    } finally {
      setLoadingSalons(false);
    }
  };

  const generateStyleImage = async (recData: RecommendationData) => {
    setLoadingImage(true);
    try {
      const hairType = sessionStorage.getItem('hairType') || '4c';
      const currentStyle = sessionStorage.getItem('currentStyle') || 'natural';
      const ethnicity = sessionStorage.getItem('ethnicity') || 'Black Woman';
      const length = sessionStorage.getItem('length') || 'Shoulder-Length';
      const vibe = sessionStorage.getItem('vibe') || 'Professional Studio Portrait';
      
      const response = await fetch('/api/style', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hairType,
          styleName: currentStyle,
          ethnicity,
          length,
          vibe
        })
      });

      const result = await response.json();
      if (result.success && result.data.imageUrl) {
        setStyleImage(result.data.imageUrl);
        // Store the prompt for display
        if (result.data.prompt) {
          sessionStorage.setItem('aiPrompt', result.data.prompt);
        }
      }
    } catch (error) {
      console.error('Failed to generate style image:', error);
    } finally {
      setLoadingImage(false);
    }
  };

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized routine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nywele.ai
            </h1>
            <p className="text-gray-600 mt-1">Your Personalized Hair Care Plan</p>
          </div>
          <div className="flex gap-3">
            <Link 
              href="/how-it-works"
              className="px-6 py-2 text-purple-600 hover:text-purple-700 font-semibold border-2 border-purple-600 hover:border-purple-700 rounded-lg transition-colors"
            >
              How It Works
            </Link>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Stylist Tip */}
        <div className="mb-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-8 text-white shadow-2xl">
          <div className="flex items-start gap-4">
            <div className="text-4xl">💡</div>
            <div>
              <h3 className="text-2xl font-bold mb-2">Expert Tip</h3>
              <p className="text-lg opacity-95">{data.stylistTip}</p>
            </div>
          </div>
        </div>

        {/* Routine */}
        <div className="mb-8 bg-white rounded-3xl shadow-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-gray-900">Your Hair Care Routine</h2>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Time</div>
              <div className="text-2xl font-bold text-purple-600">{data.routine.totalTime}</div>
              <div className="text-sm text-gray-500">{data.routine.frequency}</div>
            </div>
          </div>

          <div className="space-y-6">
            {data.routine.steps.map((step, index) => (
              <div key={index} className="flex gap-6 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {step.stepNumber}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{step.action}</h3>
                  <p className="text-gray-700 mb-2">{step.instructions}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-purple-600 font-semibold">⏱️ {step.duration}</span>
                    {step.productName && (
                      <span className="text-gray-600">🧴 {step.productName}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Style Inspiration Section - AI-Generated */}
        {loadingImage && (
          <div className="mb-8 bg-white rounded-3xl shadow-2xl p-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Style Inspiration</h2>
            <div className="animate-pulse">
              <div className="h-96 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl"></div>
              <p className="text-center mt-4 text-gray-500">✨ Generating your style inspiration...</p>
            </div>
          </div>
        )}

        {styleImage && !loadingImage && (
          <div className="mb-8 bg-white rounded-3xl shadow-2xl p-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Style Inspiration</h2>
              <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                <span className="text-sm font-semibold text-purple-700">✨ AI-Powered by Gemini</span>
              </div>
            </div>
            <div className="relative">
              <img 
                src={styleImage} 
                alt="Hairstyle inspiration" 
                className="w-full h-96 object-cover rounded-2xl shadow-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 rounded-b-2xl">
                <p className="text-white text-lg font-semibold">
                  Perfect for {sessionStorage.getItem('hairType')} hair
                </p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-purple-50 rounded-xl">
              <p className="text-gray-700 text-center">
                <span className="font-semibold">Style:</span> {sessionStorage.getItem('currentStyle') || 'Natural'}
              </p>
            </div>
            
            {/* AI Prompt Details - Shows advanced prompt engineering to judges */}
            <details className="mt-6">
              <summary className="cursor-pointer text-purple-600 font-semibold hover:text-purple-700 flex items-center justify-center gap-2">
                🤖 View AI Prompt Engineering Details
              </summary>
              <div className="mt-4 p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border-2 border-purple-200">
                <h4 className="font-bold text-gray-900 mb-3">Advanced Prompt Engineering:</h4>
                <p className="text-sm text-gray-700 leading-relaxed mb-4">
                  This image was generated using a highly-detailed, bias-countering prompt specifically designed for authentic African hair representation. Our system uses explicit ethnicity markers and detailed texture descriptions to counter AI biases and ensure culturally accurate results.
                </p>
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <p className="text-xs font-mono text-gray-600">
                    {sessionStorage.getItem('aiPrompt') || 'Detailed prompt used for AI generation'}
                  </p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div className="bg-white p-3 rounded-lg">
                    <span className="font-semibold text-purple-700">Hair Type:</span> {sessionStorage.getItem('hairType')}
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="font-semibold text-purple-700">Length:</span> {sessionStorage.getItem('length')}
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="font-semibold text-purple-700">Representation:</span> {sessionStorage.getItem('ethnicity')}
                  </div>
                  <div className="bg-white p-3 rounded-lg">
                    <span className="font-semibold text-purple-700">Style:</span> {sessionStorage.getItem('vibe')}
                  </div>
                </div>
              </div>
            </details>
          </div>
        )}

        {/* Products */}
        <div className="bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Recommended Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.products.map((product, index) => (
              <div key={index} className="border-2 border-gray-100 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <div className="text-sm text-purple-600 font-semibold mb-1">{product.brand}</div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{product.reason}</p>
                <div className="flex items-center justify-between">
                  {product.price && (
                    <span className="text-2xl font-bold text-gray-900">${product.price}</span>
                  )}
                  <a
                    href={product.affiliateLink || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => {
                      trackProductClick({
                        productName: product.name,
                        brand: product.brand,
                        hairType: sessionStorage.getItem('hairType') || undefined,
                        price: product.price,
                      });
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salons Who Can Do It */}
        <div className="mt-12 bg-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Salons Who Can Do This Style</h2>

          {loadingSalons ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Finding salons near you...</p>
            </div>
          ) : salons.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salons.map((salon) => (
                <div 
                  key={salon.id}
                  className="border-2 border-gray-100 rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{salon.name}</h3>
                      <div className="flex items-center text-gray-600 text-sm mt-1">
                        <span className="mr-1">📍</span>
                        <span>{salon.area}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                        ⭐ {salon.rating.toFixed(1)}
                      </span>
                      <span className="text-gray-600 font-semibold text-sm">
                        {salon.price_range}
                      </span>
                    </div>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {salon.description}
                  </p>

                  {/* Services */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Specializes In</p>
                    <div className="flex flex-wrap gap-2">
                      {salon.services.slice(0, 3).map((service, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          {service}
                        </span>
                      ))}
                      {salon.services.length > 3 && (
                        <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                          +{salon.services.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <a
                    href={`tel:${salon.phone}`}
                    onClick={() => {
                      trackSalonView({
                        salonName: salon.name,
                        location: salon.area,
                        services: salon.services,
                        hairType: sessionStorage.getItem('hairType') || undefined,
                      });
                    }}
                    className="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
                  >
                    📞 Call to Book
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-xl">
              <div className="text-5xl mb-4">💈</div>
              <p className="text-gray-600">
                Salon recommendations will appear here after you complete the form
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              window.print();
            }}
            className="px-8 py-4 bg-white border-2 border-purple-300 text-purple-600 rounded-xl font-bold text-lg hover:bg-purple-50 transition-all mr-4"
          >
            📄 Save as PDF
          </button>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
          >
            Create Another Routine ✨
          </button>
        </div>
      </div>
    </div>
  );
}