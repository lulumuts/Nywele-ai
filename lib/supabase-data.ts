// Supabase Data Fetching Functions
import { supabase } from './supabase';
import { Product } from './products-new';

// ==================== PRODUCTS ====================

export interface SupabaseProduct {
  id: string;
  name: string;
  brand: string;
  category: string;
  sub_category: string;
  description: string;
  benefits: string[];
  how_to_use: string;
  pro_tips: string[];
  hair_types: string[];
  porosity: string[];
  concerns: string[];
  goals: string[];
  estimated_price: number;
  currency: string;
  size: string;
  unit: string;
  price_min: number;
  price_max: number;
  quality: string;
  community_rating: number;
  expert_rating: number;
  images: string[];
  product_image: string;
  styles_compatible: string[];
  routine_step: string;
  ingredients: string[];
}

export async function fetchAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('community_rating', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    // Transform Supabase format to Product format
    return data.map(transformSupabaseProduct);
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

export async function fetchProductsByCategory(category: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('community_rating', { ascending: false });

    if (error) {
      console.error('Error fetching products by category:', error);
      return [];
    }

    return data.map(transformSupabaseProduct);
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

export async function fetchProductsForHairType(hairType: string): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .contains('hair_types', [hairType]);

    if (error) {
      console.error('Error fetching products for hair type:', error);
      return [];
    }

    return data.map(transformSupabaseProduct);
  } catch (error) {
    console.error('Error fetching products for hair type:', error);
    return [];
  }
}

export async function fetchProductById(id: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      return null;
    }

    return transformSupabaseProduct(data);
  } catch (error) {
    console.error('Error fetching product:', error);
    return null;
  }
}

function transformSupabaseProduct(data: any): Product {
  return {
    id: data.id,
    name: data.name,
    brand: data.brand,
    category: data.category as 'extension' | 'styling' | 'care' | 'tool',
    subCategory: data.sub_category,
    description: data.description,
    benefits: data.benefits || [],
    howToUse: data.how_to_use,
    proTips: data.pro_tips || [],
    suitableFor: {
      hairTypes: data.hair_types || [],
      porosity: data.porosity || [],
      concerns: data.concerns || [],
      goals: data.goals || []
    },
    pricing: {
      estimatedPrice: data.estimated_price,
      currency: data.currency || 'KES',
      size: data.size,
      unit: data.unit,
      priceRange: data.price_min && data.price_max ? {
        min: data.price_min,
        max: data.price_max
      } : undefined
    },
    quality: data.quality as 'budget' | 'mid-range' | 'premium',
    communityRating: data.community_rating,
    expertRating: data.expert_rating,
    whereToFind: [], // TODO: Fetch from retailers table
    images: data.images || [],
    productImage: data.product_image,
    stylesCompatible: data.styles_compatible || [],
    routineStep: data.routine_step as 'daily' | 'weekly' | 'monthly',
    ingredients: data.ingredients || []
  };
}

// ==================== SALONS ====================

export interface Salon {
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
  created_at: string;
}

export async function fetchAllSalons(): Promise<Salon[]> {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching salons:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching salons:', error);
    return [];
  }
}

export async function fetchSalonsByArea(area: string): Promise<Salon[]> {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('area', area)
      .order('rating', { ascending: false});

    if (error) {
      console.error('Error fetching salons by area:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching salons by area:', error);
    return [];
  }
}

export async function fetchSalonsBySpecialty(specialty: string): Promise<Salon[]> {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .contains('specialties', [specialty])
      .order('rating', { ascending: false });

    if (error) {
      console.error('Error fetching salons by specialty:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching salons by specialty:', error);
    return [];
  }
}

export async function fetchSalonById(id: string): Promise<Salon | null> {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching salon:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching salon:', error);
    return null;
  }
}

// ==================== RETAILERS ====================

export interface Retailer {
  id: string;
  name: string;
  type: 'online' | 'beauty-supply' | 'pharmacy' | 'supermarket';
  website?: string;
  affiliate_link?: string;
  stock_reliability: 'high' | 'medium' | 'low';
  delivery_available: boolean;
  estimated_delivery_days?: number;
  verified: boolean;
  trust_score: number;
  locations?: RetailerLocation[];
}

export interface RetailerLocation {
  id: string;
  retailer_id: string;
  name: string;
  address: string;
  area: string;
  map_link?: string;
}

export async function fetchRetailersForProduct(productId: string): Promise<Retailer[]> {
  try {
    const { data, error } = await supabase
      .from('product_retailers')
      .select(`
        retailer_id,
        retailers (
          *,
          retailer_locations (*)
        )
      `)
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching retailers for product:', error);
      return [];
    }

    return data.map((item: any) => ({
      ...item.retailers,
      locations: item.retailers.retailer_locations
    })) || [];
  } catch (error) {
    console.error('Error fetching retailers for product:', error);
    return [];
  }
}


