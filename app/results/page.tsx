'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

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

interface RecommendationData {
  routine: Routine;
  products: Product[];
  stylistTip: string;
}

export default function Results() {
  const router = useRouter();
  const [data, setData] = useState<RecommendationData | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem('recommendation');
    if (stored) {
      setData(JSON.parse(stored));
    } else {
      router.push('/');
    }
  }, [router]);

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
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-white border-2 border-purple-200 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
          >
            Start Over
          </button>
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
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Shop Now
                  </a>
                </div>
              </div>
            ))}
          </div>
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