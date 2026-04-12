'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trackProductClick, trackSalonView } from '@/lib/analytics';
import { supabase } from '@/lib/supabase';
import { BottomNavHubShell } from '@/app/components/BottomNavHubLayout';
import { HairRoutineAnalysingLoader } from '@/components/HairRoutineAnalysingLoader';

const hubCardStyle = {
  background: '#FFFFFF',
  border: '2px solid rgba(175, 85, 0, 0.25)',
} as const;

const titleColor = '#603E12';
const bodyColor = '#3D2914';
const mutedColor = '#6B5344';

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
      <BottomNavHubShell>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center py-16">
          <HairRoutineAnalysingLoader />
        </div>
      </BottomNavHubShell>
    );
  }

  return (
    <BottomNavHubShell>
      <div className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-[max(6rem,calc(4.75rem+env(safe-area-inset-bottom,0px)))] pt-6 md:px-6 md:pb-10 md:pt-10">
        <div className="mb-6 flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-3">
            <img src="/icons/coil.svg" alt="" className="h-9 w-9 shrink-0" />
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl" style={{ color: titleColor, fontFamily: "Caprasimo, serif" }}>
                Your results
              </h1>
              <p className="text-sm sm:text-base" style={{ color: mutedColor, fontFamily: "Bricolage Grotesque, sans-serif" }}>
                Routine and picks based on your profile
              </p>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap items-center gap-4">
            <Link
              href="/how-it-works"
              className="text-sm font-semibold transition-opacity hover:opacity-80 sm:text-base"
              style={{ color: titleColor, fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              How it works
            </Link>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="text-sm font-semibold transition-opacity hover:opacity-80 sm:text-base"
              style={{ color: titleColor, fontFamily: "Bricolage Grotesque, sans-serif" }}
            >
              Start over
            </button>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto">
        {/* Stylist Tip */}
        <div className="rounded-2xl p-6 md:p-8" style={hubCardStyle}>
          <div className="flex items-start gap-4">
            <div className="text-3xl" aria-hidden>
              💡
            </div>
            <div>
              <h3 className="mb-2 text-xl font-bold md:text-2xl" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>
                Expert tip
              </h3>
              <p className="text-base leading-relaxed md:text-lg" style={{ color: bodyColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                {data.stylistTip}
              </p>
            </div>
          </div>
        </div>

        {/* Two Column Layout: Image (Left) + Routine (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Style Inspiration Section - AI-Generated (LEFT COLUMN) */}
          {loadingImage && (
            <div
              className="flex min-h-[28rem] items-center justify-center rounded-2xl p-8 md:min-h-[700px]"
              style={hubCardStyle}
            >
              <HairRoutineAnalysingLoader title="Generating your style…" showChecklist={false} />
            </div>
          )}

          {styleImage && !loadingImage && (
            <div className="max-h-[85vh] overflow-y-auto rounded-2xl p-6 md:p-8" style={hubCardStyle}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold md:text-3xl" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>Style inspiration</h2>
                <div className="px-4 py-2 rounded-full" style={{ background: 'rgba(206, 147, 95, 0.2)' }}>
                  <span className="text-sm font-semibold" style={{ color: titleColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>✨ AI-Powered by Gemini</span>
                </div>
              </div>
              <div className="relative">
                <img 
                  src={styleImage} 
                  alt="Hairstyle inspiration" 
                  className="w-full h-[700px] object-cover rounded-2xl shadow-lg"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 rounded-b-2xl">
                  <p className="text-white text-lg font-semibold">
                    Perfect for {sessionStorage.getItem('hairType')} hair
                  </p>
                </div>
              </div>
              <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)', border: '1px solid rgba(175, 85, 0, 0.2)' }}>
                <p className="text-center" style={{ color: titleColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  <span className="font-semibold">Style:</span> {sessionStorage.getItem('currentStyle') || 'Natural'}
                </p>
              </div>
              
              {/* AI Prompt Details - Shows advanced prompt engineering to judges */}
              <details className="mt-6">
                <summary className="cursor-pointer font-semibold flex items-center justify-center gap-2" style={{ color: titleColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                  🤖 View AI Prompt Engineering Details
                </summary>
                <div className="mt-4 p-6 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)', border: '2px solid rgba(175, 85, 0, 0.2)' }}>
                  <h4 className="font-bold mb-3" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>Advanced Prompt Engineering:</h4>
                  <p className="text-sm leading-relaxed mb-4" style={{ color: bodyColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    This image was generated with a detailed prompt tailored to your selections (style, length, and vibe).
                  </p>
                  <div className="p-4 rounded-lg" style={{ background: '#FFFEE1', border: '1px solid rgba(175, 85, 0, 0.2)' }}>
                    <p className="text-xs font-mono" style={{ color: titleColor }}>
                      {sessionStorage.getItem('aiPrompt') || 'Detailed prompt used for AI generation'}
                    </p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="p-3 rounded-lg" style={{ background: '#FFFEE1' }}>
                      <div className="font-semibold" style={{ color: titleColor }}>Hair Type</div>
                      <div style={{ color: titleColor }}>{sessionStorage.getItem('hairType')}</div>
                    </div>
                    <div className="p-3 rounded-lg" style={{ background: '#FFFEE1' }}>
                      <div className="font-semibold" style={{ color: titleColor }}>Vibe</div>
                      <div style={{ color: titleColor }}>{sessionStorage.getItem('vibe')}</div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Routine Section (RIGHT COLUMN) */}
          <div className="max-h-[85vh] overflow-y-auto rounded-2xl p-6 md:p-8" style={hubCardStyle}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold md:text-3xl" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>Your routine</h2>
            <div className="text-right">
              <div className="text-sm" style={{ color: titleColor }}>Total Time</div>
              <div className="text-2xl font-bold" style={{ color: titleColor }}>{data.routine.totalTime}</div>
              <div className="text-sm" style={{ color: titleColor }}>{data.routine.frequency}</div>
            </div>
          </div>

          <div className="space-y-6">
            {data.routine.steps.map((step, index) => (
              <div key={index} className="relative flex gap-4 p-6 rounded-2xl" style={{ border: '2px solid rgba(175, 85, 0, 0.3)', background: 'rgba(206, 147, 95, 0.1)' }}>
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm" style={{ border: '2px solid #AF5500', color: titleColor, background: '#FFFEE1' }}>
                    {step.stepNumber}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold mb-2 pr-20" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>{step.action}</h3>
                  <p className="mb-2" style={{ color: bodyColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>{step.instructions}</p>
                  {step.productName && (
                    <div className="text-sm">
                      <span style={{ color: titleColor }}>🧴 {step.productName}</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-6 right-6">
                  <span className="font-semibold text-sm" style={{ color: '#AF5500' }}>⏱️ {step.duration}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
        {/* End Two Column Layout */}

        {/* Products */}
        <div className="max-h-[80vh] overflow-y-auto rounded-2xl p-6 md:p-8" style={hubCardStyle}>
          <h2 className="mb-6 text-2xl font-bold md:text-3xl" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>Recommended products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.products.map((product, index) => (
              <div key={index} className="rounded-2xl p-6 transition-all hover:shadow-lg" style={{ border: '2px solid rgba(175, 85, 0, 0.3)', background: 'rgba(253, 244, 232, 0.5)' }}>
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <div className="text-sm font-semibold mb-1" style={{ color: titleColor }}>{product.brand}</div>
                <h3 className="text-lg font-bold mb-2" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>{product.name}</h3>
                <p className="text-sm mb-4" style={{ color: bodyColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>{product.reason}</p>
                <div className="flex items-center justify-between">
                  {product.price && (
                    <span className="text-2xl font-bold" style={{ color: titleColor }}>${product.price}</span>
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
                    className="px-6 py-2 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, #643100 0%, #AF5500 100%)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Salons Who Can Do It */}
        <div className="mt-8 max-h-[80vh] overflow-y-auto rounded-2xl p-6 md:p-8 md:mt-12" style={hubCardStyle}>
          <h2 className="mb-6 text-2xl font-bold md:text-3xl" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>Salons for this style</h2>

          {loadingSalons ? (
            <div className="flex justify-center py-10">
              <HairRoutineAnalysingLoader title="Finding salons…" showChecklist={false} />
            </div>
          ) : salons.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {salons.map((salon) => (
                <div 
                  key={salon.id}
                  className="rounded-2xl p-6 transition-all hover:shadow-lg"
                  style={{ border: '2px solid rgba(175, 85, 0, 0.3)', background: 'rgba(253, 244, 232, 0.5)' }}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold" style={{ color: titleColor, fontFamily: 'Caprasimo, serif' }}>{salon.name}</h3>
                      <div className="flex items-center text-sm mt-1" style={{ color: titleColor }}>
                        <span className="mr-1">📍</span>
                        <span>{salon.area}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-1 rounded-full text-xs font-bold" style={{ background: 'rgba(206, 147, 95, 0.3)', color: titleColor }}>
                        ⭐ {salon.rating.toFixed(1)}
                      </span>
                      <span className="font-semibold text-sm" style={{ color: '#AF5500' }}>
                        {salon.price_range}
                      </span>
                    </div>
                  </div>

                  <p className="text-sm mb-4 line-clamp-2" style={{ color: bodyColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
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
                    className="block w-full px-6 py-3 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
                    style={{ background: 'linear-gradient(135deg, #643100 0%, #AF5500 100%)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                  >
                    📞 Call to Book
                  </a>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 rounded-xl" style={{ background: 'rgba(206, 147, 95, 0.1)' }}>
              <div className="text-5xl mb-4">💈</div>
              <p style={{ color: titleColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                Salon recommendations will appear here after you complete the form
              </p>
            </div>
          )}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center space-y-4">
          <div className="flex justify-center gap-4 flex-wrap">
            <button
              onClick={() => {
                window.print();
              }}
              className="px-8 py-4 rounded-xl font-bold text-lg transition-all"
              style={{ background: '#FFFEE1', border: '2px solid #914600', color: titleColor, fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              📄 Save as PDF
            </button>
            <button
              onClick={() => router.push('/analytics')}
              className="px-8 py-4 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #643100 0%, #914600 100%)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              📊 View Analytics
            </button>
            <button
              onClick={() => router.push('/')}
              className="px-8 py-4 text-white rounded-xl font-bold text-lg hover:shadow-xl transition-all"
              style={{ background: 'linear-gradient(135deg, #643100 0%, #AF5500 100%)', fontFamily: 'Bricolage Grotesque, sans-serif' }}
            >
              Create Another Routine ✨
            </button>
          </div>
        </div>
        </div>
      </div>
    </BottomNavHubShell>
  );
}