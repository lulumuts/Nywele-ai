'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Star, Phone, DollarSign, Search, Filter } from 'lucide-react';
import Navbar from '../components/Navbar';
import { fetchAllSalons, fetchSalonsByArea, type Salon } from '@/lib/supabase-data';

export default function SalonsPage() {
  const [salons, setSalons] = useState<Salon[]>([]);
  const [filteredSalons, setFilteredSalons] = useState<Salon[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedArea, setSelectedArea] = useState('all');
  const [selectedSpecialty, setSelectedSpecialty] = useState('all');

  // Load salons on mount
  useEffect(() => {
    loadSalons();
  }, []);

  // Filter salons when filters change
  useEffect(() => {
    filterSalons();
  }, [salons, searchQuery, selectedArea, selectedSpecialty]);

  async function loadSalons() {
    setLoading(true);
    try {
      const data = await fetchAllSalons();
      setSalons(data);
      setFilteredSalons(data);
    } catch (error) {
      console.error('Error loading salons:', error);
    } finally {
      setLoading(false);
    }
  }

  function filterSalons() {
    let filtered = [...salons];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(salon =>
        salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        salon.services.some(service => service.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Filter by area
    if (selectedArea !== 'all') {
      filtered = filtered.filter(salon => salon.area === selectedArea);
    }

    // Filter by specialty
    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(salon =>
        salon.specialties.includes(selectedSpecialty) ||
        salon.services.some(service => service.toLowerCase().includes(selectedSpecialty.toLowerCase()))
      );
    }

    setFilteredSalons(filtered);
  }

  // Get unique areas for filter
  const areas = Array.from(new Set(salons.map(salon => salon.area))).sort();

  // Common specialties
  const specialties = [
    'Type 4A', 'Type 4B', 'Type 4C',
    'Braids', 'Natural', 'Locs', 'Twists',
    'Weaves', 'Wigs'
  ];

  const priceRangeIcons = {
    '$': 'Budget Friendly',
    '$$': 'Mid Range',
    '$$$': 'Premium'
  };

  return (
    <div className="min-h-screen" style={{ background: '#FDF4E8' }}>
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl md:text-6xl font-bold mb-4"
            style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
            Find Your Perfect Salon
          </h1>
          <p className="text-xl" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
            Discover expert stylists specializing in African hair care across Nairobi
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-6 mb-8 shadow-lg"
          style={{ background: 'white', border: '2px solid #914600' }}
        >
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <Search
                className="absolute left-4 top-1/2 transform -translate-y-1/2"
                size={20}
                style={{ color: '#914600' }}
              />
              <input
                type="text"
                placeholder="Search by name, service, or style..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 rounded-xl text-lg"
                style={{
                  background: '#FDF4E8',
                  border: '2px solid #914600',
                  color: '#643100',
                  fontFamily: 'Bricolage Grotesque, sans-serif'
                }}
              />
            </div>
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Area Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2"
                style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                <Filter size={16} className="inline mr-2" />
                Area
              </label>
              <select
                value={selectedArea}
                onChange={(e) => setSelectedArea(e.target.value)}
                className="w-full px-4 py-3 rounded-xl"
                style={{
                  background: '#FDF4E8',
                  border: '2px solid #914600',
                  color: '#643100',
                  fontFamily: 'Bricolage Grotesque, sans-serif'
                }}
              >
                <option value="all">All Areas</option>
                {areas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Specialty Filter */}
            <div>
              <label className="block text-sm font-semibold mb-2"
                style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                <Filter size={16} className="inline mr-2" />
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-3 rounded-xl"
                style={{
                  background: '#FDF4E8',
                  border: '2px solid #914600',
                  color: '#643100',
                  fontFamily: 'Bricolage Grotesque, sans-serif'
                }}
              >
                <option value="all">All Specialties</option>
                {specialties.map(specialty => (
                  <option key={specialty} value={specialty}>{specialty}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Results Count */}
        <div className="mb-6" style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
          Showing {filteredSalons.length} {filteredSalons.length === 1 ? 'salon' : 'salons'}
        </div>

        {/* Salons Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-solid border-current border-r-transparent"
              style={{ color: '#914600' }} />
            <p className="mt-4 text-lg" style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Loading salons...
            </p>
          </div>
        ) : filteredSalons.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-2xl mb-4" style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
              No salons found
            </p>
            <p style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
              Try adjusting your filters or search query
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredSalons.map((salon, index) => (
              <motion.div
                key={salon.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all cursor-pointer"
                style={{ background: 'white', border: '2px solid #914600' }}
              >
                {/* Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={salon.image_url}
                    alt={salon.name}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                  />
                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full flex items-center gap-1"
                    style={{ background: 'rgba(100, 49, 0, 0.9)' }}>
                    <Star className="fill-yellow-400 text-yellow-400" size={16} />
                    <span className="text-white font-bold text-sm">{salon.rating}</span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-2xl font-bold mb-2"
                    style={{ color: '#643100', fontFamily: 'Caprasimo, serif' }}>
                    {salon.name}
                  </h3>

                  <div className="flex items-center gap-2 mb-3"
                    style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    <MapPin size={16} />
                    <span>{salon.location}</span>
                  </div>

                  <p className="text-sm mb-4 line-clamp-2"
                    style={{ color: '#914600', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                    {salon.description}
                  </p>

                  {/* Services Tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {salon.services.slice(0, 3).map((service, idx) => (
                      <span
                        key={idx}
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ background: 'rgba(206, 147, 95, 0.2)', color: '#643100' }}
                      >
                        {service}
                      </span>
                    ))}
                    {salon.services.length > 3 && (
                      <span
                        className="text-xs px-2 py-1 rounded-full"
                        style={{ background: 'rgba(206, 147, 95, 0.2)', color: '#643100' }}
                      >
                        +{salon.services.length - 3} more
                      </span>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="flex items-center justify-between pt-4"
                    style={{ borderTop: '1px solid rgba(145, 70, 0, 0.2)' }}>
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} style={{ color: '#914600' }} />
                      <span className="text-sm font-semibold"
                        style={{ color: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}>
                        {priceRangeIcons[salon.price_range as keyof typeof priceRangeIcons]}
                      </span>
                    </div>

                    {salon.phone && (
                      <a
                        href={`tel:${salon.phone}`}
                        className="px-4 py-2 rounded-lg text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-2"
                        style={{ background: '#643100', fontFamily: 'Bricolage Grotesque, sans-serif' }}
                      >
                        <Phone size={14} />
                        Call
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


