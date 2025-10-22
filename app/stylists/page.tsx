'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Star, Filter, Phone, Instagram, Globe, DollarSign, CheckCircle } from 'lucide-react';

interface Stylist {
  id: string;
  name: string;
  business_name?: string;
  bio: string;
  specialties: string[];
  location_city: string;
  location_state: string;
  phone?: string;
  instagram_handle?: string;
  website?: string;
  price_range: 'budget' | 'mid-range' | 'premium';
  average_rating: number;
  total_reviews: number;
  verified: boolean;
  profile_image_url?: string;
}

export default function StylistDirectory() {
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [filteredStylists, setFilteredStylists] = useState<Stylist[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState<string>('all');
  const [selectedPriceRange, setSelectedPriceRange] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  // Mock data (replace with Supabase query)
  useEffect(() => {
    const mockStylists: Stylist[] = [
      {
        id: '1',
        name: 'Amara Okonkwo',
        business_name: 'Braids by Amara',
        bio: 'Specializing in intricate braiding styles for over 10 years. Known for knotless braids and creative patterns.',
        specialties: ['braids', 'knotless-braids', 'cornrows'],
        location_city: 'Nairobi',
        location_state: 'Nairobi',
        phone: '+254712345678',
        instagram_handle: '@braidsby amara',
        price_range: 'mid-range',
        average_rating: 4.8,
        total_reviews: 127,
        verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=400'
      },
      {
        id: '2',
        name: 'Zainab Hassan',
        business_name: 'Natural Hair Haven',
        bio: 'Certified natural hair specialist. Expert in protective styles and hair health. Your hair will thank you!',
        specialties: ['natural-hair', 'twists', 'locs', 'wash-and-go'],
        location_city: 'Nairobi',
        location_state: 'Nairobi',
        phone: '+254723456789',
        instagram_handle: '@naturalhairhaven',
        price_range: 'premium',
        average_rating: 4.9,
        total_reviews: 203,
        verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=400'
      },
      {
        id: '3',
        name: 'Fatima Kimani',
        business_name: 'Kimani Styles',
        bio: 'Affordable braiding services for students and budget-conscious clients. Quality doesn\'t have to be expensive!',
        specialties: ['braids', 'box-braids', 'senegalese-twists'],
        location_city: 'Mombasa',
        location_state: 'Mombasa',
        phone: '+254734567890',
        instagram_handle: '@kimanistyles',
        price_range: 'budget',
        average_rating: 4.6,
        total_reviews: 89,
        verified: false,
        profile_image_url: 'https://images.unsplash.com/photo-1598217309180-a9ea0cb11175?w=400'
      },
      {
        id: '4',
        name: 'Thandiwe Mwangi',
        business_name: 'Locs of Love',
        bio: 'Traditional and faux locs specialist. Creating beautiful locs journeys for 8+ years.',
        specialties: ['locs', 'faux-locs', 'goddess-locs', 'loc-maintenance'],
        location_city: 'Kisumu',
        location_state: 'Kisumu',
        phone: '+254745678901',
        instagram_handle: '@locsoflove_ke',
        price_range: 'mid-range',
        average_rating: 4.7,
        total_reviews: 156,
        verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=400'
      },
      {
        id: '5',
        name: 'Njeri Wambui',
        business_name: 'Twist & Shout Salon',
        bio: 'Modern salon specializing in protective styles and scalp treatments. Book online!',
        specialties: ['twists', 'passion-twists', 'flat-twists', 'treatments'],
        location_city: 'Nairobi',
        location_state: 'Nairobi',
        phone: '+254756789012',
        instagram_handle: '@twistandshout_nairobi',
        website: 'https://twistandshout.co.ke',
        price_range: 'premium',
        average_rating: 4.8,
        total_reviews: 178,
        verified: true,
        profile_image_url: 'https://images.unsplash.com/photo-1616683693457-c45984ccb3ae?w=400'
      }
    ];

    setStylists(mockStylists);
    setFilteredStylists(mockStylists);
    setLoading(false);
  }, []);

  // Filter stylists
  useEffect(() => {
    let filtered = stylists;

    if (searchTerm) {
      filtered = filtered.filter(s => 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.business_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.bio.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSpecialty !== 'all') {
      filtered = filtered.filter(s => s.specialties.includes(selectedSpecialty));
    }

    if (selectedPriceRange !== 'all') {
      filtered = filtered.filter(s => s.price_range === selectedPriceRange);
    }

    if (selectedLocation !== 'all') {
      filtered = filtered.filter(s => s.location_city === selectedLocation);
    }

    setFilteredStylists(filtered);
  }, [searchTerm, selectedSpecialty, selectedPriceRange, selectedLocation, stylists]);

  const specialtyOptions = [
    { value: 'all', label: 'All Specialties' },
    { value: 'braids', label: 'Braids' },
    { value: 'knotless-braids', label: 'Knotless Braids' },
    { value: 'box-braids', label: 'Box Braids' },
    { value: 'cornrows', label: 'Cornrows' },
    { value: 'twists', label: 'Twists' },
    { value: 'locs', label: 'Locs' },
    { value: 'natural-hair', label: 'Natural Hair' },
    { value: 'treatments', label: 'Treatments' }
  ];

  const priceRangeLabels = {
    'budget': '$ Budget-Friendly',
    'mid-range': '$$ Mid-Range',
    'premium': '$$$ Premium'
  };

  const formatSpecialty = (specialty: string) => {
    return specialty.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Find Your Perfect Stylist
          </h1>
          <p className="text-gray-600 text-lg">
            Connect with verified hair specialists in your area
          </p>
        </motion.div>

        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-xl p-6 mb-8 border border-gray-100"
        >
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, business, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Filters */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline mr-2" size={16} />
                Specialty
              </label>
              <select
                value={selectedSpecialty}
                onChange={(e) => setSelectedSpecialty(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {specialtyOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <DollarSign className="inline mr-2" size={16} />
                Price Range
              </label>
              <select
                value={selectedPriceRange}
                onChange={(e) => setSelectedPriceRange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Price Ranges</option>
                <option value="budget">$ Budget-Friendly</option>
                <option value="mid-range">$$ Mid-Range</option>
                <option value="premium">$$$ Premium</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="inline mr-2" size={16} />
                Location
              </label>
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="all">All Locations</option>
                <option value="Nairobi">Nairobi</option>
                <option value="Mombasa">Mombasa</option>
                <option value="Kisumu">Kisumu</option>
              </select>
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredStylists.length} of {stylists.length} stylists
          </div>
        </motion.div>

        {/* Stylist Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading stylists...</p>
          </div>
        ) : filteredStylists.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl shadow-xl">
            <p className="text-gray-600">No stylists found matching your criteria</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedSpecialty('all');
                setSelectedPriceRange('all');
                setSelectedLocation('all');
              }}
              className="mt-4 text-purple-600 hover:text-purple-700 font-semibold"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStylists.map((stylist, index) => (
              <motion.div
                key={stylist.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow"
              >
                {/* Profile Image */}
                <div className="relative h-48 bg-gradient-to-br from-purple-200 to-pink-200">
                  {stylist.profile_image_url && (
                    <img
                      src={stylist.profile_image_url}
                      alt={stylist.name}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {stylist.verified && (
                    <div className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg">
                      <CheckCircle className="text-blue-500" size={20} />
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-800 mb-1">{stylist.name}</h3>
                  {stylist.business_name && (
                    <p className="text-sm text-purple-600 font-medium mb-3">{stylist.business_name}</p>
                  )}

                  {/* Rating */}
                  <div className="flex items-center gap-2 mb-3">
                    <div className="flex items-center">
                      <Star className="text-yellow-400 fill-yellow-400" size={16} />
                      <span className="ml-1 font-semibold text-gray-800">{stylist.average_rating.toFixed(1)}</span>
                    </div>
                    <span className="text-sm text-gray-500">({stylist.total_reviews} reviews)</span>
                  </div>

                  {/* Location */}
                  <div className="flex items-center text-gray-600 mb-3">
                    <MapPin size={16} className="mr-2" />
                    <span className="text-sm">{stylist.location_city}, {stylist.location_state}</span>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-sm rounded-full">
                      {priceRangeLabels[stylist.price_range]}
                    </span>
                  </div>

                  {/* Bio */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{stylist.bio}</p>

                  {/* Specialties */}
                  <div className="mb-4">
                    <p className="text-xs font-medium text-gray-500 mb-2">SPECIALTIES</p>
                    <div className="flex flex-wrap gap-2">
                      {stylist.specialties.slice(0, 3).map(specialty => (
                        <span
                          key={specialty}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                        >
                          {formatSpecialty(specialty)}
                        </span>
                      ))}
                      {stylist.specialties.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full">
                          +{stylist.specialties.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contact Actions */}
                  <div className="flex gap-2">
                    {stylist.phone && (
                      <a
                        href={`tel:${stylist.phone}`}
                        className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold text-center hover:shadow-lg transition-all flex items-center justify-center gap-2"
                      >
                        <Phone size={16} />
                        Call
                      </a>
                    )}
                    {stylist.instagram_handle && (
                      <a
                        href={`https://instagram.com/${stylist.instagram_handle.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-lg hover:shadow-lg transition-all flex items-center justify-center"
                      >
                        <Instagram size={16} />
                      </a>
                    )}
                    {stylist.website && (
                      <a
                        href={stylist.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all flex items-center justify-center"
                      >
                        <Globe size={16} />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* CTA for Stylists */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-8 text-center text-white"
        >
          <h3 className="text-2xl font-bold mb-3">Are you a hair stylist?</h3>
          <p className="mb-6 opacity-90">Join our directory and connect with clients looking for your expertise</p>
          <button className="px-8 py-3 bg-white text-purple-600 rounded-lg font-semibold hover:shadow-xl transition-all">
            Register Your Business
          </button>
        </motion.div>
      </div>
    </div>
  );
}

