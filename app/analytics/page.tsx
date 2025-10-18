'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getAnalyticsStats } from '@/lib/analytics';

export default function AnalyticsPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      const data = await getAnalyticsStats();
      setStats(data);
      setLoading(false);
    }
    loadStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Analytics Not Available</h2>
            <p className="text-gray-600 mb-6">
              Please set up the Supabase analytics table first.
            </p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Nywele.ai Analytics
            </h1>
            <p className="text-gray-600 mt-1">Real-time usage insights</p>
          </div>
          <Link 
            href="/"
            className="px-6 py-2 text-purple-600 hover:text-purple-700 font-semibold border-2 border-purple-600 hover:border-purple-700 rounded-lg transition-colors"
          >
            Back to App
          </Link>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Total Recommendations */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Recommendations</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalRecommendations}</p>
              </div>
              <div className="text-5xl">📊</div>
            </div>
          </div>

          {/* Style Generations */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Style Generations</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalStyleGenerations}</p>
              </div>
              <div className="text-5xl">🎨</div>
            </div>
          </div>

          {/* Product Clicks */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Product Clicks</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.totalProductClicks}</p>
              </div>
              <div className="text-5xl">🛍️</div>
            </div>
          </div>

          {/* AI Success Rate */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">AI Success Rate</p>
                <p className="text-4xl font-bold text-gray-900 mt-2">{stats.aiSuccessRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Gemini vs Fallback</p>
              </div>
              <div className="text-5xl">✅</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Popular Hair Types */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🌀</span>
              Most Popular Hair Types
            </h3>
            <div className="space-y-3">
              {stats.popularHairTypes.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-purple-600 mr-3">#{index + 1}</span>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                  </div>
                  <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium">
                    {item.count} uses
                  </span>
                </div>
              ))}
              {stats.popularHairTypes.length === 0 && (
                <p className="text-gray-500 text-center py-4">No data yet</p>
              )}
            </div>
          </div>

          {/* Popular Styles */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💇</span>
              Most Popular Styles
            </h3>
            <div className="space-y-3">
              {stats.popularStyles.map((item: any, index: number) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-pink-600 mr-3">#{index + 1}</span>
                    <span className="font-semibold text-gray-900">{item.name}</span>
                  </div>
                  <span className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-sm font-medium">
                    {item.count} times
                  </span>
                </div>
              ))}
              {stats.popularStyles.length === 0 && (
                <p className="text-gray-500 text-center py-4">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Products & Salons Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {/* Most Popular Products */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">🛍️</span>
              Most Popular Products
            </h3>
            <div className="space-y-3">
              {stats.popularProducts?.length > 0 ? (
                stats.popularProducts.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-green-600 mr-3">#{index + 1}</span>
                      <span className="font-semibold text-gray-900">{item.name}</span>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                      {item.count} clicks
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-center py-4">No product clicks yet</p>
              )}
            </div>
          </div>

          {/* Most Popular Salons */}
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">💈</span>
              Most Popular Salons
            </h3>
            <div className="space-y-3">
              {stats.popularSalons?.length > 0 ? (
                stats.popularSalons.map((item: any, index: number) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-orange-600 mr-3">#{index + 1}</span>
                      <span className="font-semibold text-gray-900">{item.name}</span>
                    </div>
                    <span className="bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-sm font-medium">
                      {item.count} views
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 mb-2">Salon feature coming soon!</p>
                  <p className="text-sm text-gray-400">When salons are added, you'll see the most viewed ones here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Suggested Products - Based on Popularity */}
        {stats.popularProducts?.length > 0 && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-2xl shadow-lg p-6 mb-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <span className="mr-2">✨</span>
              Suggested Products for Your Users
            </h3>
            <p className="text-gray-600 mb-4">
              Based on {stats.totalProductClicks} product clicks, these are the crowd favorites:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {stats.popularProducts.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-md">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl font-bold text-green-600">#{index + 1}</span>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      {item.count} clicks
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-lg">{item.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">Most clicked by users</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Appointment Scheduling CTA */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl shadow-2xl p-8 mb-12 text-white text-center">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-2xl font-bold mb-2">Ready to Schedule Your Next Appointment?</h3>
          <p className="text-lg opacity-90 mb-6">
            Based on your usage patterns, we recommend booking with a specialist who understands your hair type.
          </p>
          <div className="flex justify-center gap-4">
            <button className="px-8 py-3 bg-white text-purple-600 rounded-xl font-bold hover:shadow-xl transition-all">
              Browse Salons (Coming Soon)
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-xl font-bold hover:bg-white/10 transition-all">
              Set Reminder
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <span className="mr-2">📈</span>
            Recent Activity
          </h3>
          <div className="space-y-3">
            {stats.recentActivity.map((event: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {event.event_type === 'recommendation' ? '📊' : '🎨'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {event.event_type === 'recommendation' ? 'Recommendation' : 'Style Generation'}
                    </p>
                    <p className="text-sm text-gray-600">
                      {event.hair_type && `${event.hair_type} hair`}
                      {event.style && ` • ${event.style}`}
                      {event.success !== undefined && (event.success ? ' • AI Generated ✨' : ' • Fallback')}
                    </p>
                  </div>
                </div>
                <span className="text-xs text-gray-500">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {stats.recentActivity.length === 0 && (
              <p className="text-gray-500 text-center py-8">No activity yet. Try using the app!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

