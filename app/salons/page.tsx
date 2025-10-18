'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { trackSalonView } from '@/lib/analytics';
import Link from 'next/link';

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

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('All');
  const [userHairType, setUserHairType] = useState<string | null>(null);

  useEffect(() => {
    // Get user's hair type from session storage
    const hairType = sessionStorage.getItem('hairType');
    setUserHairType(hairType);

    // Fetch salons
    async function fetchSalons() {
      try {
        const { data, error } = await supabase
          .from('salons')
          .select('*')
          .order('rating', { ascending: false });

        if (error) throw error;
        setSalons(data || []);
      } catch (error) {
        console.error('Error fetching salons:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchSalons();
  }, []);

  const handleSalonClick = (salon: Salon) => {
    trackSalonView({
      salonName: salon.name,
      location: salon.area,
      services: salon.services,
      hairType: userHairType || undefined,
    });
  };

  const filteredSalons = filter === 'All' 
    ? salons 
    : salons.filter(salon => 
        salon.specialties.some(s => s.includes(filter))
      );

  const areas = ['All', 'Kilimani', 'Westlands', 'Karen', 'South B', 'Lavington', 'Ngong Road', 'Eastleigh', 'Parklands'];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading salons...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Find Your Perfect Salon
              </h1>
              <p className="text-gray-600 mt-1">
                {userHairType ? `Specialists for ${userHairType} hair in Nairobi` : 'African hair specialists in Nairobi'}
              </p>
            </div>
            <Link 
              href="/"
              className="px-6 py-2 text-purple-600 hover:text-purple-700 font-semibold border-2 border-purple-600 hover:border-purple-700 rounded-lg transition-colors"
            >
              Back to Home
            </Link>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setFilter(area)}
                className={`px-4 py-2 rounded-lg font-semibold whitespace-nowrap transition-all ${
                  filter === area
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-purple-50 border border-gray-200'
                }`}
              >
                {area}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Salons Grid */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        {userHairType && (
          <div className="mb-8 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl p-6 border-2 border-purple-200">
            <p className="text-purple-900 font-semibold">
              💡 Based on your {userHairType} hair, we recommend salons specializing in your hair type
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredSalons.map((salon) => {
            const matchesHairType = userHairType && salon.specialties.includes(userHairType);
            
            return (
              <div 
                key={salon.id} 
                className={`bg-white rounded-2xl shadow-lg overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-1 ${
                  matchesHairType ? 'ring-4 ring-purple-400' : ''
                }`}
              >
                {/* Salon Image */}
                <div className="relative h-48 overflow-hidden">
                  <img 
                    src={salon.image_url} 
                    alt={salon.name}
                    className="w-full h-full object-cover"
                  />
                  {matchesHairType && (
                    <div className="absolute top-3 right-3 bg-purple-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Recommended
                    </div>
                  )}
                  <div className="absolute bottom-3 left-3 flex items-center gap-2">
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                      ⭐ {salon.rating.toFixed(1)}
                    </span>
                    <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-bold text-gray-900">
                      {salon.price_range}
                    </span>
                  </div>
                </div>

                {/* Salon Info */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{salon.name}</h3>
                  
                  <div className="flex items-center text-gray-600 mb-3">
                    <span className="mr-2">📍</span>
                    <span>{salon.location}</span>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {salon.description}
                  </p>

                  {/* Specialties */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {salon.specialties.slice(0, 3).map((specialty, idx) => (
                        <span 
                          key={idx}
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            specialty === userHairType
                              ? 'bg-purple-200 text-purple-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {specialty}
                        </span>
                      ))}
                      {salon.specialties.length > 3 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          +{salon.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Services */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Services</p>
                    <div className="flex flex-wrap gap-2">
                      {salon.services.slice(0, 2).map((service, idx) => (
                        <span key={idx} className="text-sm text-gray-600">
                          ✨ {service}
                        </span>
                      ))}
                      {salon.services.length > 2 && (
                        <span className="text-sm text-gray-500">
                          +{salon.services.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Buttons */}
                  <div className="flex gap-3">
                    <a
                      href={`tel:${salon.phone}`}
                      onClick={() => handleSalonClick(salon)}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold text-center hover:shadow-lg transition-all"
                    >
                      📞 Call Now
                    </a>
                    <button
                      onClick={() => handleSalonClick(salon)}
                      className="flex-1 px-4 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredSalons.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">No salons found</h3>
            <p className="text-gray-600">Try selecting a different area</p>
          </div>
        )}
      </div>

      {/* Integration Note */}
      <div className="max-w-7xl mx-auto px-4 pb-12">
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-white text-center">
          <div className="text-5xl mb-4">🔗</div>
          <h3 className="text-2xl font-bold mb-2">Powered by Braiding Nairobi</h3>
          <p className="text-lg opacity-90">
            This salon network integrates with our existing Braiding Nairobi app, showing how Nywele.ai can plug into salon ecosystems.
          </p>
        </div>
      </div>
    </div>
  );
}

