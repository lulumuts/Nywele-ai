/**
 * Supabase Styles Integration
 * 
 * This module provides helper functions to fetch hairstyles and their
 * recommended braiding hair/extension products from Supabase.
 */

import { supabase } from './supabase';

// ==================== TYPES ====================

export interface Style {
  id: number;
  name: string;
  category: 'braids' | 'twists' | 'locs' | 'natural';
  description: string;
  typical_duration_days: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced';
  maintenance_level: 'low' | 'medium' | 'high';
  image_url?: string;
  price_range_min: number;
  price_range_max: number;
  install_time_hours: number;
  hair_length_required: 'short' | 'medium' | 'long' | 'any';
  created_at?: string;
  updated_at?: string;
}

export interface StyleProductRecommendation {
  id: number;
  style_id: number;
  product_id: number;
  recommendation_type: 'essential' | 'recommended' | 'alternative';
  priority: number;
  quantity: number;
  notes?: string;
  // Joined data
  style?: Style;
  product?: any; // Will match Product interface from products.ts
}

export interface StyleWithProducts extends Style {
  essential_products: any[];
  recommended_products: any[];
  alternative_products: any[];
  total_estimated_cost: number;
}

// ==================== FETCH FUNCTIONS ====================

/**
 * Get all available hairstyles
 */
export async function getAllStyles(): Promise<Style[]> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .order('name');

    if (error) {
      console.error('❌ Error fetching styles:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} styles from Supabase`);
    return data as Style[];
  } catch (error) {
    console.error('❌ Exception fetching styles:', error);
    return [];
  }
}

/**
 * Get styles by category
 */
export async function getStylesByCategory(category: string): Promise<Style[]> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('category', category)
      .order('name');

    if (error) {
      console.error('❌ Error fetching styles by category:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} ${category} styles`);
    return data as Style[];
  } catch (error) {
    console.error('❌ Exception fetching styles by category:', error);
    return [];
  }
}

/**
 * Get a specific style by name
 */
export async function getStyleByName(styleName: string): Promise<Style | null> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('name', styleName)
      .single();

    if (error) {
      console.error('❌ Error fetching style by name:', error);
      return null;
    }

    return data as Style;
  } catch (error) {
    console.error('❌ Exception fetching style by name:', error);
    return null;
  }
}

/**
 * Get recommended products for a specific style
 * Returns products grouped by recommendation type (essential, recommended, alternative)
 */
export async function getProductsForStyle(styleName: string): Promise<{
  essential: any[];
  recommended: any[];
  alternative: any[];
  totalCost: number;
} | null> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return null;
  }

  try {
    console.log(`🔍 Fetching products for style: ${styleName}`);

    const { data, error } = await supabase
      .from('style_product_recommendations')
      .select(`
        *,
        styles!inner (
          id,
          name,
          category
        ),
        products (
          id,
          brand,
          name,
          category,
          description,
          estimated_price,
          currency,
          image_url,
          hair_types,
          tags,
          length,
          texture,
          color_code,
          color_name,
          community_rating,
          expert_rating
        )
      `)
      .eq('styles.name', styleName)
      .order('priority', { ascending: true });

    if (error) {
      console.error('❌ Error fetching style products:', error);
      return null;
    }

    if (!data || data.length === 0) {
      console.log(`⚠️ No products found for style: ${styleName}`);
      return {
        essential: [],
        recommended: [],
        alternative: [],
        totalCost: 0
      };
    }

    // Type for the joined query result
    type StyleProductQueryResult = {
      recommendation_type: 'essential' | 'recommended' | 'alternative';
      quantity: number;
      notes?: string;
      priority: number;
      products: {
        id: number;
        brand: string;
        name: string;
        category: string;
        description?: string;
        estimated_price: number;
        currency: string;
        image_url?: string;
        hair_types?: string[];
        tags?: string[];
        length?: string;
        texture?: string;
        color_code?: string;
        color_name?: string;
        community_rating?: number;
        expert_rating?: number;
      };
    };

    // Group products by recommendation type
    const essential = (data as StyleProductQueryResult[])
      .filter((item: StyleProductQueryResult) => item.recommendation_type === 'essential')
      .map((item: StyleProductQueryResult) => ({
        ...item.products,
        quantity: item.quantity,
        notes: item.notes,
        priority: item.priority,
        total_cost: item.products.estimated_price * item.quantity
      }));

    const recommended = (data as StyleProductQueryResult[])
      .filter((item: StyleProductQueryResult) => item.recommendation_type === 'recommended')
      .map((item: StyleProductQueryResult) => ({
        ...item.products,
        quantity: item.quantity,
        notes: item.notes,
        priority: item.priority,
        total_cost: item.products.estimated_price * item.quantity
      }));

    const alternative = (data as StyleProductQueryResult[])
      .filter((item: StyleProductQueryResult) => item.recommendation_type === 'alternative')
      .map((item: StyleProductQueryResult) => ({
        ...item.products,
        quantity: item.quantity,
        notes: item.notes,
        priority: item.priority,
        total_cost: item.products.estimated_price * item.quantity
      }));

    // Calculate total cost for essential products
    const totalCost = essential.reduce((sum: number, product: { total_cost: number }) => sum + product.total_cost, 0);

    console.log(`✅ Found products for ${styleName}:`);
    console.log(`   Essential: ${essential.length}`);
    console.log(`   Recommended: ${recommended.length}`);
    console.log(`   Alternative: ${alternative.length}`);
    console.log(`   Total Cost: KES ${totalCost}`);

    return {
      essential,
      recommended,
      alternative,
      totalCost
    };
  } catch (error) {
    console.error('❌ Exception fetching style products:', error);
    return null;
  }
}

/**
 * Get style with all its recommended products and pricing info
 */
export async function getStyleWithProducts(styleName: string): Promise<StyleWithProducts | null> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return null;
  }

  try {
    // Fetch the style
    const style = await getStyleByName(styleName);
    if (!style) {
      return null;
    }

    // Fetch the products
    const products = await getProductsForStyle(styleName);
    if (!products) {
      return null;
    }

    return {
      ...style,
      essential_products: products.essential,
      recommended_products: products.recommended,
      alternative_products: products.alternative,
      total_estimated_cost: products.totalCost
    };
  } catch (error) {
    console.error('❌ Exception fetching style with products:', error);
    return null;
  }
}

/**
 * Search styles by name or description
 */
export async function searchStyles(searchTerm: string): Promise<Style[]> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('name');

    if (error) {
      console.error('❌ Error searching styles:', error);
      return [];
    }

    console.log(`✅ Found ${data.length} styles matching "${searchTerm}"`);
    return data as Style[];
  } catch (error) {
    console.error('❌ Exception searching styles:', error);
    return [];
  }
}

/**
 * Get styles filtered by difficulty level
 */
export async function getStylesByDifficulty(
  difficulty: 'beginner' | 'intermediate' | 'advanced'
): Promise<Style[]> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .eq('difficulty_level', difficulty)
      .order('name');

    if (error) {
      console.error('❌ Error fetching styles by difficulty:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} ${difficulty} styles`);
    return data as Style[];
  } catch (error) {
    console.error('❌ Exception fetching styles by difficulty:', error);
    return [];
  }
}

/**
 * Get styles within a price range
 */
export async function getStylesByPriceRange(
  minPrice: number,
  maxPrice: number
): Promise<Style[]> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .gte('price_range_min', minPrice)
      .lte('price_range_max', maxPrice)
      .order('price_range_min');

    if (error) {
      console.error('❌ Error fetching styles by price range:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} styles in price range KES ${minPrice}-${maxPrice}`);
    return data as Style[];
  } catch (error) {
    console.error('❌ Exception fetching styles by price range:', error);
    return [];
  }
}

/**
 * Get popular styles (based on some criteria, e.g., most products recommended)
 * For now, returns braids and twists as they're most popular
 */
export async function getPopularStyles(limit: number = 10): Promise<Style[]> {
  if (!supabase) {
    console.error('❌ Supabase not initialized');
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('styles')
      .select('*')
      .in('category', ['braids', 'twists'])
      .order('name')
      .limit(limit);

    if (error) {
      console.error('❌ Error fetching popular styles:', error);
      return [];
    }

    console.log(`✅ Fetched ${data.length} popular styles`);
    return data as Style[];
  } catch (error) {
    console.error('❌ Exception fetching popular styles:', error);
    return [];
  }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Format price range for display
 */
export function formatPriceRange(style: Style): string {
  return `KES ${style.price_range_min.toLocaleString()} - ${style.price_range_max.toLocaleString()}`;
}

/**
 * Get estimated total cost (products + salon)
 */
export function getEstimatedTotalCost(
  style: Style,
  productsCost: number
): { min: number; max: number } {
  return {
    min: style.price_range_min + productsCost,
    max: style.price_range_max + productsCost
  };
}

/**
 * Format duration for display
 */
export function formatDuration(days: number): string {
  if (days < 7) return `${days} days`;
  const weeks = Math.floor(days / 7);
  return `${weeks} ${weeks === 1 ? 'week' : 'weeks'}`;
}


