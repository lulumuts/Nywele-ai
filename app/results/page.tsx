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
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your personalized routine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <svg version="1.1" viewBox="0 0 848 1008" className="w-8 h-10">
              <defs>
                <linearGradient id="navCoilGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              <path fill="url(#navCoilGradient)" opacity="1.000000" stroke="none" 
                d="
M418.117828,82.304749 
	C404.651764,81.515762 394.465210,88.399132 383.992218,94.581772 
	C359.878662,108.816994 338.972656,127.187943 318.192749,145.691010 
	C302.386749,159.765137 286.923401,174.249374 272.343567,189.581802 
	C246.035187,217.248169 223.680328,247.910080 206.158173,281.854980 
	C198.114990,297.436646 194.355682,314.717285 189.169281,331.410522 
	C182.785477,351.957855 180.235367,372.968597 179.913193,394.428802 
	C179.690659,409.252350 179.618134,424.085541 179.184708,438.900909 
	C178.281845,469.763153 186.642181,498.486420 198.455032,526.489929 
	C206.883560,546.470642 218.715195,564.327942 232.702301,580.804565 
	C234.367706,582.766418 235.674911,585.264648 238.476730,586.019226 
	C240.384613,584.573792 239.688141,582.590942 239.688858,580.873413 
	C239.698700,557.377991 239.947403,533.887573 240.881210,510.407990 
	C242.309753,474.488831 252.971863,441.984192 274.675323,412.876129 
	C295.616180,384.790833 319.419495,360.024811 349.261200,341.386047 
	C365.827026,331.039154 384.501923,326.778473 403.240692,322.748199 
	C427.770203,317.472443 452.575409,318.927429 477.379395,319.655701 
	C507.850922,320.550385 538.198303,322.332764 568.317566,327.494446 
	C582.934631,329.999481 593.243164,337.823273 600.820984,350.047424 
	C611.572327,367.390900 617.071960,386.817322 623.227539,406.008240 
	C631.604065,432.123657 629.974304,458.994843 629.717896,485.788696 
	C629.537415,504.660980 627.961670,523.328613 623.602539,541.774902 
	C617.798340,566.335815 608.503296,589.404175 594.938538,610.652039 
	C578.891174,635.788757 555.139038,651.508850 528.426941,663.075439 
	C503.086182,674.048218 476.224152,678.638550 448.784698,680.270569 
	C428.789032,681.459778 408.809113,680.913818 388.893250,679.174377 
	C364.149139,677.013245 339.782379,672.496704 315.823120,665.883850 
	C314.554565,665.533691 313.345551,664.901672 311.303162,665.429993 
	C312.162201,668.201172 313.001526,670.969116 313.877411,673.725403 
	C325.634399,710.723450 346.172882,742.794434 370.867615,772.157532 
	C386.789520,791.089294 407.589325,802.785522 432.628784,805.733826 
	C451.362793,807.939758 470.226440,808.612793 489.003113,807.494446 
	C505.027740,806.540161 520.104431,801.922424 531.853088,789.797913 
	C536.765198,784.728577 540.126648,778.922546 541.317688,771.992249 
	C542.163025,767.073975 545.570068,767.229797 549.215698,767.462219 
	C553.671387,767.746216 553.542725,770.872375 553.154053,773.965637 
	C550.737183,793.197693 538.778137,804.412292 521.606873,811.071533 
	C510.917633,815.216919 499.593323,816.665039 488.301727,816.942627 
	C461.333405,817.605530 434.335938,818.136719 407.499847,814.197388 
	C375.967682,809.568787 346.379059,799.429199 323.749146,776.445740 
	C296.003845,748.266846 273.125000,716.346619 259.508240,678.549988 
	C255.212784,666.626892 250.879181,654.752014 247.934921,642.417236 
	C247.369247,640.047424 246.505768,638.183167 244.254913,636.827881 
	C215.599762,619.575317 192.255234,596.254517 171.097549,570.827393 
	C145.984390,540.646606 130.934052,505.462006 123.311707,467.070862 
	C121.652916,458.716095 121.786186,450.169952 121.756691,441.663971 
	C121.665985,415.507629 121.288910,389.326569 124.729012,363.325684 
	C127.589836,341.703125 135.684204,321.504883 142.505615,300.970306 
	C150.082764,278.160736 163.581146,258.832031 177.570282,239.642654 
	C215.386780,187.768494 262.744202,145.687057 313.580444,107.345352 
	C333.028320,92.677368 354.748749,81.281487 378.705200,75.465942 
	C396.491638,71.148209 414.672607,71.821228 432.836578,73.318634 
	C456.962494,75.307526 479.785675,82.503700 502.552734,90.028885 
	C504.379120,90.632561 506.564209,90.957016 507.099030,93.993576 
	C501.213318,98.428444 494.401642,97.984306 487.840759,96.376236 
	C474.267242,93.049362 460.975159,88.616318 447.283478,85.711258 
	C437.821289,83.703598 428.273956,82.380119 418.117828,82.304749 
M435.981049,329.291046 
	C417.536926,332.752014 400.459503,339.300476 385.691376,351.233093 
	C364.549896,368.315552 346.615936,388.176208 330.990906,410.498444 
	C310.881897,439.226593 299.998108,470.542664 298.810730,505.582825 
	C298.336609,519.573608 298.536560,533.573303 297.803375,547.548340 
	C296.235901,577.427185 296.885406,607.156006 303.371002,636.528442 
	C303.931793,639.068298 304.766449,641.157593 307.476776,642.294373 
	C317.152008,646.352234 326.567627,651.103699 336.421295,654.647949 
	C369.508575,666.549255 403.682037,672.033325 438.882568,670.895874 
	C465.173218,670.046265 490.882324,666.636414 515.215881,655.702698 
	C537.728333,645.587280 559.584717,634.321899 575.729675,615.147095 
	C599.557922,586.847107 612.102173,553.326660 617.674805,517.128784 
	C620.829041,496.640503 619.693176,475.895020 619.689331,455.246521 
	C619.687012,442.908386 618.783630,430.654938 615.770996,418.586517 
	C610.608765,397.906891 603.283936,378.114380 591.508850,360.269409 
	C582.792969,347.060638 571.274475,336.434204 555.100037,334.426483 
	C515.877502,329.557861 476.414825,328.336761 435.981049,329.291046 
z"/>
            </svg>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Nywele.ai
              </h1>
              <p className="text-gray-600 text-sm">Your Personalized Hair Care Plan</p>
            </div>
          </div>
          <div className="flex gap-6 items-center">
            <Link 
              href="/how-it-works"
              className="font-semibold hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4"
              style={{ color: '#c22a9f' }}
            >
              How It Works
            </Link>
            <button
              onClick={() => router.push('/')}
              className="font-semibold hover:opacity-80 transition-opacity underline decoration-2 underline-offset-4"
              style={{ color: '#c22a9f' }}
            >
              Start Over
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
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

        {/* Two Column Layout: Image (Left) + Routine (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Style Inspiration Section - AI-Generated (LEFT COLUMN) */}
          {loadingImage && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-[#E9A96A] mb-6">Style Inspiration</h2>
              <div className="animate-pulse">
                <div className="h-96 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl"></div>
                <p className="text-center mt-4 text-gray-500">✨ Generating your style inspiration...</p>
              </div>
            </div>
          )}

          {styleImage && !loadingImage && (
            <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-[#E9A96A]">Style Inspiration</h2>
                <div className="px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                  <span className="text-sm font-semibold text-purple-700">✨ AI-Powered by Gemini</span>
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
                  <h4 className="font-bold text-[#E9A96A] mb-3">Advanced Prompt Engineering:</h4>
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
                      <div className="font-semibold text-purple-700">Hair Type</div>
                      <div className="text-gray-600">{sessionStorage.getItem('hairType')}</div>
                    </div>
                    <div className="bg-white p-3 rounded-lg">
                      <div className="font-semibold text-purple-700">Vibe</div>
                      <div className="text-gray-600">{sessionStorage.getItem('vibe')}</div>
                    </div>
                  </div>
                </div>
              </details>
            </div>
          )}

          {/* Routine Section (RIGHT COLUMN) */}
          <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-h-[85vh] overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-bold text-[#C87726]">Your Hair Care Routine</h2>
            <div className="text-right">
              <div className="text-sm text-gray-500">Total Time</div>
              <div className="text-2xl font-bold text-purple-600">{data.routine.totalTime}</div>
              <div className="text-sm text-gray-500">{data.routine.frequency}</div>
            </div>
          </div>

          <div className="space-y-6">
            {data.routine.steps.map((step, index) => (
              <div key={index} className="relative flex gap-4 p-6 border-2 border-[#E9A96A] rounded-2xl bg-transparent">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 border-2 border-[#E9A96A] rounded-full flex items-center justify-center text-[#E9A96A] font-bold text-sm bg-transparent">
                    {step.stepNumber}
                  </div>
                </div>
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-[#C87726] mb-2 pr-20">{step.action}</h3>
                  <p className="text-[#C87726] mb-2">{step.instructions}</p>
                  {step.productName && (
                    <div className="text-sm">
                      <span className="text-[#C87726]">🧴 {step.productName}</span>
                    </div>
                  )}
                </div>
                <div className="absolute top-6 right-6">
                  <span className="text-purple-600 font-semibold text-sm">⏱️ {step.duration}</span>
                </div>
              </div>
            ))}
          </div>
          </div>
        </div>
        {/* End Two Column Layout */}

        {/* Products */}
        <div className="bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-[#E9A96A] mb-6">Recommended Products</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.products.map((product, index) => (
              <div key={index} className="border-2 border-[#E9A96A] rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-48 object-cover rounded-xl mb-4"
                  />
                )}
                <div className="text-sm text-purple-600 font-semibold mb-1">{product.brand}</div>
                <h3 className="text-lg font-bold text-[#E9A96A] mb-2">{product.name}</h3>
                <p className="text-[#E9A96A] text-sm mb-4">{product.reason}</p>
                <div className="flex items-center justify-between">
                  {product.price && (
                    <span className="text-2xl font-bold text-[#E9A96A]">${product.price}</span>
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
        <div className="mt-12 bg-white/60 backdrop-blur-sm rounded-3xl shadow-2xl p-8 max-h-[80vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-[#E9A96A] mb-6">Salons Who Can Do This Style</h2>

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
                  className="border-2 border-[#E9A96A] rounded-2xl p-6 hover:border-purple-300 hover:shadow-lg transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-[#E9A96A]">{salon.name}</h3>
                      <div className="flex items-center text-[#E9A96A] text-sm mt-1">
                        <span className="mr-1">📍</span>
                        <span>{salon.area}</span>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-bold">
                        ⭐ {salon.rating.toFixed(1)}
                      </span>
                      <span className="text-[#E9A96A] font-semibold text-sm">
                        {salon.price_range}
                      </span>
                    </div>
                  </div>

                  <p className="text-[#E9A96A] text-sm mb-4 line-clamp-2">
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