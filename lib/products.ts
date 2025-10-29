// Product Information & Recommendation System
// Education-first approach: We inform, not sell

// Import Supabase functions
import { fetchAllProducts as fetchSupabaseProducts, fetchProductsByCategory as fetchSupabaseCategoryProducts, fetchProductsForHairType as fetchSupabaseHairTypeProducts } from './supabase-data';

// ==================== INTERFACES ====================

export interface RetailerOption {
  retailer: string;
  type: 'online' | 'beauty-supply' | 'pharmacy' | 'supermarket';
  
  // Location info (for physical stores)
  locations?: {
    name: string;
    address: string;
    area: string;
    mapLink?: string;
  }[];
  
  // Online info
  website?: string;
  affiliateLink?: string;
  
  // Availability
  stockReliability: 'high' | 'medium' | 'low';
  deliveryAvailable: boolean;
  estimatedDeliveryDays?: number;
  
  // Trust indicators
  verified: boolean;
  trustScore: number;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'extension' | 'styling' | 'care' | 'tool';
  subCategory: string;
  
  // Educational content
  description: string;
  whyRecommended?: string[];
  benefits: string[];
  howToUse: string;
  proTips?: string[];
  
  // Suitability
  suitableFor: {
    hairTypes: string[];
    porosity: string[];
    concerns: string[];
    goals: string[];
  };
  
  // Pricing (informational)
  pricing: {
    estimatedPrice: number;
    currency: string;
    size: string;
    unit: string;
    priceRange?: { min: number; max: number };
  };
  
  // Quality indicators
  quality: 'budget' | 'mid-range' | 'premium';
  communityRating?: number;
  expertRating?: number;
  
  // Purchase Options
  whereToFind: RetailerOption[];
  
  // Images
  images: string[];
  productImage?: string;
  
  // Compatibility
  stylesCompatible: string[];
  routineStep?: 'daily' | 'weekly' | 'monthly';
  
  // Ingredients (for care products)
  ingredients?: string[];
  
  // Alternatives
  alternatives?: {
    budget?: string;
    premium?: string;
  };
}

export interface ProductRecommendation {
  product: Product;
  score: number;
  confidence: number;
  reasons: string[];
  alternatives: Product[];
}

// ==================== RETAILER DATABASE ====================

const COMMON_RETAILERS: { [key: string]: RetailerOption } = {
  jumia: {
    retailer: 'Jumia Kenya',
    type: 'online',
    website: 'https://www.jumia.co.ke',
    affiliateLink: 'https://www.jumia.co.ke?ref=nywele_ai',
    stockReliability: 'high',
    deliveryAvailable: true,
    estimatedDeliveryDays: 2,
    verified: true,
    trustScore: 90
  },
  beautySupreme: {
    retailer: 'Beauty Supreme',
    type: 'beauty-supply',
    locations: [
      {
        name: 'Beauty Supreme Westlands',
        address: 'Woodvale Grove, Westlands',
        area: 'Westlands'
      },
      {
        name: 'Beauty Supreme Junction',
        address: 'Junction Mall',
        area: 'Dagoretti'
      }
    ],
    website: 'https://www.beautysupreme.co.ke',
    affiliateLink: 'https://www.beautysupreme.co.ke?ref=nywele_ai',
    stockReliability: 'high',
    deliveryAvailable: true,
    estimatedDeliveryDays: 1,
    verified: true,
    trustScore: 95
  },
  healthyU: {
    retailer: 'Healthy U',
    type: 'pharmacy',
    locations: [
      {
        name: 'Healthy U Sarit',
        address: 'Sarit Centre',
        area: 'Westlands'
      },
      {
        name: 'Healthy U Village Market',
        address: 'Village Market',
        area: 'Gigiri'
      }
    ],
    stockReliability: 'high',
    deliveryAvailable: false,
    verified: true,
    trustScore: 92
  },
  carrefour: {
    retailer: 'Carrefour',
    type: 'supermarket',
    locations: [
      {
        name: 'Carrefour Junction',
        address: 'Junction Mall',
        area: 'Dagoretti'
      },
      {
        name: 'Carrefour Thika Road',
        address: 'Thika Road Mall',
        area: 'Kasarani'
      },
      {
        name: 'Carrefour Two Rivers',
        address: 'Two Rivers Mall',
        area: 'Ruaka'
      }
    ],
    stockReliability: 'medium',
    deliveryAvailable: false,
    verified: true,
    trustScore: 85
  },
  naivas: {
    retailer: 'Naivas',
    type: 'supermarket',
    locations: [
      {
        name: 'Naivas Westlands',
        address: 'Mpaka Road',
        area: 'Westlands'
      },
      {
        name: 'Naivas CBD',
        address: 'Tom Mboya Street',
        area: 'CBD'
      }
    ],
    stockReliability: 'medium',
    deliveryAvailable: false,
    verified: true,
    trustScore: 80
  }
};

// ==================== PRODUCT DATABASE ====================

export const MOCK_PRODUCTS: Product[] = [
  // HAIR EXTENSIONS
  {
    id: 'ext_001',
    name: 'X-pression Ultra Braid',
    brand: 'X-pression',
    category: 'extension',
    subCategory: 'braiding-hair',
    description: 'Pre-stretched, lightweight braiding hair. Perfect for box braids, knotless braids, and twists. Premium quality that lasts 6-8 weeks with proper care.',
    benefits: ['Tangle-free throughout wear', 'Light on scalp', 'Lasts 6-8 weeks', 'Natural look', 'Minimal frizz'],
    howToUse: 'Seal ends with hot water after braiding. Pre-stretch if needed for smoother installation. Use 6-8 packs for full head depending on thickness desired.',
    proTips: [
      'Buy all packs from same batch to ensure color consistency',
      'Dip in hot (not boiling) water to seal ends properly',
      'Store extras in original packaging away from sunlight'
    ],
    suitableFor: {
      hairTypes: ['4a', '4b', '4c', '3c'],
      porosity: ['low', 'medium', 'high'],
      concerns: [],
      goals: ['protective-styling', 'length-retention', 'low-maintenance']
    },
    pricing: {
      estimatedPrice: 300,
      currency: 'KES',
      unit: 'per pack',
      size: '48 inches',
      priceRange: { min: 280, max: 350 }
    },
    whereToFind: [
      COMMON_RETAILERS.beautySupreme,
      COMMON_RETAILERS.jumia,
      {
        retailer: 'Chandarana',
        type: 'supermarket',
        locations: [
          { name: 'Chandarana Westgate', address: 'Westgate Mall', area: 'Westlands' },
          { name: 'Chandarana Prestige', address: 'Prestige Plaza', area: 'Kilimani' }
        ],
        stockReliability: 'medium',
        deliveryAvailable: false,
        verified: true,
        trustScore: 85
      }
    ],
    quality: 'premium',
    communityRating: 4.8,
    expertRating: 4.7,
    images: ['/products/xpression-braid.jpg'],
    stylesCompatible: ['Box Braids', 'Knotless Braids', 'Feed-in Braids'],
    alternatives: {
      budget: 'ext_002'
    }
  },

  {
    id: 'ext_002',
    name: 'Darling Yaki Pony',
    brand: 'Darling',
    category: 'extension',
    subCategory: 'braiding-hair',
    description: 'Soft, pre-stretched Yaki texture hair. Affordable option perfect for natural-looking styles.',
    benefits: ['Affordable', 'Soft texture', 'Easy to braid', 'Good for beginners'],
    howToUse: 'Use 7-9 packs for full head. Seal ends with hot water. Great for practicing braiding techniques.',
    suitableFor: {
      hairTypes: ['4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: [],
      goals: ['protective-styling', 'budget-friendly']
    },
    pricing: {
      estimatedPrice: 250,
      currency: 'KES',
      unit: 'per pack',
      size: '52 inches',
      priceRange: { min: 200, max: 280 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      COMMON_RETAILERS.carrefour,
      {
        retailer: 'Beauty Supply Stores (CBD)',
        type: 'beauty-supply',
        locations: [{ name: 'Various CBD locations', address: 'Biashara Street area', area: 'CBD' }],
        stockReliability: 'high',
        deliveryAvailable: false,
        verified: false,
        trustScore: 75
      }
    ],
    quality: 'budget',
    communityRating: 4.5,
    images: ['/products/darling-yaki.jpg'],
    stylesCompatible: ['Box Braids', 'Senegalese Twists', 'Passion Twists'],
    alternatives: {
      premium: 'ext_001'
    }
  },

  // STYLING PRODUCTS
  {
    id: 'style_001',
    name: 'Got2B Glued Spiking Gel',
    brand: 'Got2B',
    category: 'styling',
    subCategory: 'edge-control',
    description: 'Strong hold gel perfect for sleek edges and flyaways. Humidity-resistant formula keeps edges laid all day.',
    benefits: ['Strong hold', 'No flakes', 'Long-lasting', 'Works on all hair types', 'Humidity resistant'],
    howToUse: 'Apply small amount to edges. Use edge brush to smooth. Tie down with scarf for 10 minutes for best results.',
    proTips: [
      'Less is more - start with tiny amount',
      'Use on slightly damp hair for easier application',
      'Remove with oil-based cleanser at night'
    ],
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['frizz', 'flyaways'],
      goals: ['sleek-styles', 'edge-control']
    },
    pricing: {
      estimatedPrice: 800,
      currency: 'KES',
      unit: 'per tube',
      size: '150ml',
      priceRange: { min: 700, max: 900 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      COMMON_RETAILERS.healthyU,
      COMMON_RETAILERS.carrefour
    ],
    quality: 'mid-range',
    communityRating: 4.7,
    expertRating: 4.6,
    images: ['/products/got2b-gel.jpg'],
    stylesCompatible: ['Box Braids', 'Cornrows', 'Ponytails', 'Sleek buns'],
    routineStep: 'daily'
  },

  {
    id: 'style_002',
    name: 'Eco Styler Olive Oil Gel',
    brand: 'Eco Styler',
    category: 'styling',
    subCategory: 'gel',
    description: 'Alcohol-free styling gel with olive oil for moisture and hold. Large size lasts for months.',
    benefits: ['Maximum hold', 'Adds shine', 'No alcohol', 'Large size lasts long', 'Adds moisture'],
    howToUse: 'Apply to damp hair for styling or edges. Can be used for twist-outs and braid-outs. Use generously for maximum hold.',
    suitableFor: {
      hairTypes: ['3b', '3c', '4a', '4b', '4c'],
      porosity: ['medium', 'high'],
      concerns: ['dryness', 'frizz'],
      goals: ['moisture', 'hold', 'definition']
    },
    pricing: {
      estimatedPrice: 1200,
      currency: 'KES',
      unit: 'per tub',
      size: '473ml',
      priceRange: { min: 1100, max: 1400 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      COMMON_RETAILERS.beautySupreme,
      COMMON_RETAILERS.naivas
    ],
    quality: 'mid-range',
    communityRating: 4.6,
    images: ['/products/eco-styler-olive.jpg'],
    stylesCompatible: ['Twist-outs', 'Braid-outs', 'Sleek styles'],
    routineStep: 'daily'
  },

  // HAIR CARE - SHAMPOO
  {
    id: 'care_001',
    name: 'Cantu Sulfate-Free Cleansing Cream Shampoo',
    brand: 'Cantu',
    category: 'care',
    subCategory: 'shampoo',
    description: 'Gentle, sulfate-free shampoo that cleanses without stripping natural oils. Infused with shea butter.',
    benefits: ['Sulfate-free', 'Moisturizes while cleansing', 'Reduces breakage', 'Gentle on color-treated hair', 'Pleasant scent'],
    howToUse: 'Wet hair thoroughly. Apply to scalp and massage gently. Work through length. Rinse completely. Follow with conditioner.',
    proTips: [
      'Focus on scalp, let runoff cleanse length',
      'Use weekly for most hair types',
      'Bi-weekly for very dry hair'
    ],
    ingredients: ['Shea Butter', 'Coconut Oil', 'Honey'],
    suitableFor: {
      hairTypes: ['3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['dryness', 'breakage'],
      goals: ['moisture', 'gentle-cleansing', 'retention']
    },
    pricing: {
      estimatedPrice: 1500,
      currency: 'KES',
      unit: 'per bottle',
      size: '400ml',
      priceRange: { min: 1400, max: 1700 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      COMMON_RETAILERS.healthyU,
      COMMON_RETAILERS.beautySupreme
    ],
    quality: 'mid-range',
    communityRating: 4.8,
    expertRating: 4.7,
    images: ['/products/cantu-shampoo.jpg'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly'
  },

  // HAIR CARE - DEEP CONDITIONER
  {
    id: 'care_002',
    name: 'Shea Moisture Deep Treatment Masque',
    brand: 'Shea Moisture',
    category: 'care',
    subCategory: 'deep-conditioner',
    description: 'Intensive hydration deep conditioner with raw shea butter and argan oil. Repairs damage and restores moisture.',
    benefits: ['Deep hydration', 'Repairs damage', 'Restores elasticity', 'Reduces breakage', 'Softens hair'],
    howToUse: 'Apply generously to clean, damp hair. Cover with plastic cap. Leave for 20-30 mins. Use heat cap for better penetration. Rinse thoroughly.',
    proTips: [
      'Use weekly for damaged hair',
      'Bi-weekly for healthy hair',
      'Add few drops of oil for extra moisture',
      'Steam treatment enhances results'
    ],
    ingredients: ['Shea Butter', 'Argan Oil', 'Sea Kelp'],
    suitableFor: {
      hairTypes: ['3c', '4a', '4b', '4c'],
      porosity: ['high'],
      concerns: ['dryness', 'breakage', 'damage'],
      goals: ['moisture', 'repair', 'softness']
    },
    pricing: {
      estimatedPrice: 2200,
      currency: 'KES',
      unit: 'per jar',
      size: '340g',
      priceRange: { min: 2000, max: 2500 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      {
        retailer: 'Zuri Kenya',
        type: 'online',
        website: 'https://www.zuri.co.ke',
        affiliateLink: 'https://www.zuri.co.ke?ref=nywele_ai',
        stockReliability: 'high',
        deliveryAvailable: true,
        estimatedDeliveryDays: 2,
        verified: true,
        trustScore: 92
      },
      COMMON_RETAILERS.healthyU
    ],
    quality: 'premium',
    communityRating: 4.9,
    expertRating: 4.8,
    images: ['/products/shea-moisture-mask.jpg'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly'
  },

  // HAIR CARE - OIL (STAR PRODUCT)
  {
    id: 'care_003',
    name: 'Jamaican Black Castor Oil',
    brand: 'Sunny Isle',
    category: 'care',
    subCategory: 'oil',
    description: 'Pure Jamaican Black Castor Oil for hair growth and thickness. Traditional formula that has been used for generations.',
    benefits: ['Promotes growth', 'Thickens hair', 'Strengthens roots', 'Reduces shedding', 'Improves scalp health'],
    howToUse: 'Warm 5-10 drops in hands. Part hair in sections. Massage gently into scalp for 5-10 minutes. Can be applied to ends. Use 2-3 times per week for best results.',
    proTips: [
      'Warm oil slightly for better absorption',
      'Mix with 2 drops peppermint oil to enhance penetration',
      'Apply at night, wash out in morning',
      'Consistency is key - results in 4-6 weeks',
      'Store in cool, dark place to prevent oxidation'
    ],
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['thinning', 'slow-growth', 'breakage', 'weak-roots'],
      goals: ['growth', 'thickness', 'strength', 'length-retention']
    },
    pricing: {
      estimatedPrice: 1800,
      currency: 'KES',
      unit: 'per bottle',
      size: '118ml',
      priceRange: { min: 1600, max: 2000 }
    },
    whereToFind: [
      {
        retailer: 'Zuri Kenya',
        type: 'online',
        website: 'https://www.zuri.co.ke',
        affiliateLink: 'https://www.zuri.co.ke/jbco?ref=nywele_ai',
        stockReliability: 'high',
        deliveryAvailable: true,
        estimatedDeliveryDays: 2,
        verified: true,
        trustScore: 92
      },
      COMMON_RETAILERS.jumia,
      COMMON_RETAILERS.beautySupreme,
      COMMON_RETAILERS.healthyU
    ],
    quality: 'premium',
    communityRating: 4.7,
    expertRating: 4.8,
    images: ['/products/jbco.jpg'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly',
    alternatives: {
      budget: 'care_004'
    }
  },

  {
    id: 'care_004',
    name: 'Lightweight Hair Oil Blend',
    brand: 'Natural Blends Kenya',
    category: 'care',
    subCategory: 'oil',
    description: 'Blend of jojoba, argan, and grapeseed oils. Perfect for low porosity hair that needs moisture without heaviness.',
    benefits: ['Lightweight', 'Absorbs quickly', 'Adds shine', 'No buildup', 'Daily use friendly'],
    howToUse: 'Apply 2-3 drops to damp hair after washing. Can be used daily on scalp. Won\'t weigh down low porosity hair.',
    proTips: [
      'Perfect for refreshing styles between wash days',
      'Mix with leave-in conditioner for extra slip'
    ],
    suitableFor: {
      hairTypes: ['3b', '3c', '4a', '4b', '4c'],
      porosity: ['low'],
      concerns: ['dryness', 'dullness'],
      goals: ['moisture', 'shine', 'softness']
    },
    pricing: {
      estimatedPrice: 1200,
      currency: 'KES',
      unit: 'per bottle',
      size: '100ml',
      priceRange: { min: 1000, max: 1400 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      COMMON_RETAILERS.beautySupreme,
      {
        retailer: 'Local Natural Hair Shops',
        type: 'beauty-supply',
        locations: [{ name: 'Various locations', address: 'Westlands, Kilimani', area: 'Nairobi' }],
        stockReliability: 'medium',
        deliveryAvailable: false,
        verified: false,
        trustScore: 75
      }
    ],
    quality: 'mid-range',
    communityRating: 4.6,
    images: ['/products/light-oil-blend.jpg'],
    stylesCompatible: ['All styles'],
    routineStep: 'daily',
    alternatives: {
      premium: 'care_003'
    }
  },

  // TOOLS
  {
    id: 'tool_001',
    name: 'Satin Bonnet - Adjustable',
    brand: 'African Pride',
    category: 'tool',
    subCategory: 'bonnet',
    description: 'Large, adjustable satin bonnet. Essential for protecting hair while sleeping. Single most important hair tool.',
    benefits: ['Prevents breakage', 'Maintains moisture', 'Reduces frizz', 'Preserves hairstyles', 'Lasts 6+ months'],
    howToUse: 'Wear every night before bed. Tuck all hair completely inside. Adjust elastic for comfortable but secure fit. Replace every 3-6 months when elastic weakens.',
    proTips: [
      'Buy 2 - wash one while wearing the other',
      'Double-lined offers better protection',
      'Essential for protective styles'
    ],
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['breakage', 'frizz', 'dryness'],
      goals: ['length-retention', 'style-preservation', 'moisture-retention']
    },
    pricing: {
      estimatedPrice: 500,
      currency: 'KES',
      unit: 'per piece',
      size: 'One size fits all',
      priceRange: { min: 350, max: 800 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      {
        retailer: 'Beauty Supply Stores',
        type: 'beauty-supply',
        locations: [
          { name: 'Various CBD locations', address: 'Tom Mboya, Moi Avenue', area: 'CBD' },
          { name: 'Westlands shops', address: 'Westlands area', area: 'Westlands' }
        ],
        stockReliability: 'high',
        deliveryAvailable: false,
        verified: false,
        trustScore: 80
      },
      {
        retailer: 'Market Stalls',
        type: 'beauty-supply',
        locations: [
          { name: 'Gikomba Market', address: 'Gikomba', area: 'Eastlands' },
          { name: 'Toi Market', address: 'Kibera Road', area: 'Kilimani' }
        ],
        stockReliability: 'high',
        deliveryAvailable: false,
        verified: false,
        trustScore: 70
      }
    ],
    quality: 'budget',
    communityRating: 4.5,
    expertRating: 5.0,
    images: ['/products/satin-bonnet.jpg'],
    stylesCompatible: ['All styles'],
    routineStep: 'daily'
  },

  {
    id: 'tool_002',
    name: 'Wide-tooth Detangling Comb',
    brand: 'Denman',
    category: 'tool',
    subCategory: 'comb',
    description: 'Seamless wide-tooth comb. Perfect for detangling wet hair without breakage. Essential tool for wash days.',
    benefits: ['Gentle detangling', 'No snagging', 'Durable', 'Works on wet or dry hair', 'Reduces breakage'],
    howToUse: 'Start from ends and work up to roots. Use on wet, conditioned hair for best results. Never force through tangles.',
    proTips: [
      'Always detangle from ends up',
      'Use with conditioner for slip',
      'Seamless teeth prevent snagging'
    ],
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['breakage', 'tangles', 'knots'],
      goals: ['gentle-detangling', 'length-retention']
    },
    pricing: {
      estimatedPrice: 800,
      currency: 'KES',
      unit: 'per piece',
      size: 'Standard',
      priceRange: { min: 600, max: 1000 }
    },
    whereToFind: [
      COMMON_RETAILERS.jumia,
      COMMON_RETAILERS.beautySupreme,
      COMMON_RETAILERS.carrefour
    ],
    quality: 'mid-range',
    communityRating: 4.8,
    expertRating: 4.9,
    images: ['/products/wide-tooth-comb.jpg'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly'
  }
];

// Re-export as PRODUCT_DATABASE for backward compatibility
export const PRODUCT_DATABASE = MOCK_PRODUCTS;

// ==================== HELPER FUNCTIONS ====================

export function findProduct(id: string): Product | undefined {
  return MOCK_PRODUCTS.find(p => p.id === id);
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return MOCK_PRODUCTS.filter(p => p.category === category);
}

export function getProductsForStyle(styleName: string): Product[] {
  return MOCK_PRODUCTS.filter(p => 
    p.stylesCompatible.some(s => s.toLowerCase().includes(styleName.toLowerCase()))
  );
}

// ==================== SUPABASE-INTEGRATED FUNCTIONS ====================

/**
 * Fetch all products from Supabase, with fallback to mock data
 */
export async function getAllProducts(): Promise<Product[]> {
  try {
    console.log('📦 Fetching products from Supabase...');
    const supabaseProducts = await fetchSupabaseProducts();
    
    if (supabaseProducts && supabaseProducts.length > 0) {
      console.log(`✅ Fetched ${supabaseProducts.length} products from Supabase`);
      return supabaseProducts;
    }
    
    console.log('⚠️ No Supabase products found, using mock data');
    return MOCK_PRODUCTS;
  } catch (error) {
    console.error('❌ Error fetching Supabase products, falling back to mock data:', error);
    return MOCK_PRODUCTS;
  }
}

/**
 * Fetch products by category from Supabase, with fallback to mock data
 */
export async function getProductsByCategoryAsync(category: Product['category']): Promise<Product[]> {
  try {
    console.log(`📦 Fetching ${category} products from Supabase...`);
    const supabaseProducts = await fetchSupabaseCategoryProducts(category);
    
    if (supabaseProducts && supabaseProducts.length > 0) {
      console.log(`✅ Fetched ${supabaseProducts.length} ${category} products from Supabase`);
      return supabaseProducts;
    }
    
    console.log(`⚠️ No Supabase ${category} products found, using mock data`);
    return getProductsByCategory(category);
  } catch (error) {
    console.error(`❌ Error fetching Supabase ${category} products, falling back to mock data:`, error);
    return getProductsByCategory(category);
  }
}

/**
 * Fetch products for specific hair type from Supabase, with fallback to mock data
 */
export async function getProductsForHairTypeAsync(hairType: string): Promise<Product[]> {
  try {
    console.log(`📦 Fetching products for hair type ${hairType} from Supabase...`);
    const supabaseProducts = await fetchSupabaseHairTypeProducts(hairType);
    
    if (supabaseProducts && supabaseProducts.length > 0) {
      console.log(`✅ Fetched ${supabaseProducts.length} products for ${hairType} from Supabase`);
      return supabaseProducts;
    }
    
    console.log(`⚠️ No Supabase products for ${hairType}, using mock data`);
    return MOCK_PRODUCTS.filter(p => p.suitableFor.hairTypes.includes(hairType));
  } catch (error) {
    console.error(`❌ Error fetching Supabase products for ${hairType}, falling back to mock data:`, error);
    return MOCK_PRODUCTS.filter(p => p.suitableFor.hairTypes.includes(hairType));
  }
}

// Affiliate link tracking
export function trackAffiliateClick(productId: string, retailer: string): void {
  // Log affiliate click for analytics
  console.log(`🔗 Affiliate click: Product ${productId} → ${retailer}`);
  // In production, send to analytics service
}

export function generateAffiliateLink(retailer: RetailerOption, productId: string): string {
  if (retailer.affiliateLink) {
    return `${retailer.affiliateLink}&product=${productId}&timestamp=${Date.now()}`;
  }
  return retailer.website || '#';
}

// ==================== PRODUCT RECOMMENDATION FOR HAIR CARE ====================

interface HairCareProfile {
  hairType: string;
  porosity: 'low' | 'medium' | 'high';
  currentCondition: {
    health: number;
    moisture: number;
    strength: number;
  };
  concerns: string[];
  goals: string[];
  lifestyle: {
    budget: { min: number; max: number };
  };
}

interface RoutineStep {
  step: string;
  frequency: string;
  products?: string[];
  duration?: string;
  tips?: string[];
}

interface HairCareRecommendation {
  routineId: string;
  confidence: number;
  personalizedRoutine: {
    daily: RoutineStep[];
    weekly: RoutineStep[];
    monthly: RoutineStep[];
  };
  maintenanceSchedule: any;
  tips: any;
  expectedResults: any;
}

interface ProductRecommendationForRoutine {
  product: Product;
  quantity: number;
  purpose: string;
  routineStep: string;
  priority: 'essential' | 'recommended' | 'optional';
  estimatedCost: number;
  alternatives?: Product[];
}

export interface ProductRecommendationResult {
  essential: ProductRecommendationForRoutine[];
  optional: ProductRecommendationForRoutine[];
  totalCost: number;
  budgetFit: 'under' | 'within' | 'over';
}

export async function recommendProductsForRoutine(
  profile: HairCareProfile,
  routine: HairCareRecommendation,
  budget: { min: number; max: number }
): Promise<ProductRecommendationResult> {
  const recommendations: ProductRecommendationForRoutine[] = [];
  
  // Fetch all products from Supabase (with fallback to mock data)
  console.log('🔍 Fetching products for routine recommendations...');
  const allProducts = await getAllProducts();
  console.log(`📊 Using ${allProducts.length} products for matching`);
  
  // Map routine steps to products
  const allRoutineSteps = [
    ...routine.personalizedRoutine.daily,
    ...routine.personalizedRoutine.weekly,
    ...routine.personalizedRoutine.monthly
  ];

  // Recommend products based on routine and hair needs
  allRoutineSteps.forEach(step => {
    const stepProducts = findProductsForStep(step, profile, allProducts);
    recommendations.push(...stepProducts);
  });

  // Score and sort products
  const scored = recommendations.map(rec => ({
    ...rec,
    score: scoreProductForProfile(rec.product, profile, budget)
  })).sort((a, b) => b.score - a.score);

  // Categorize by priority
  const essential = scored.filter(p => p.priority === 'essential').slice(0, 5);
  const optional = scored.filter(p => p.priority !== 'essential').slice(0, 3);

  const totalCost = [...essential, ...optional].reduce((sum, p) => sum + p.estimatedCost, 0);
  const budgetFit = totalCost < budget.min ? 'under' : totalCost > budget.max ? 'over' : 'within';

  console.log(`✅ Recommended ${essential.length} essential + ${optional.length} optional products (Total: KES ${totalCost})`);

  return {
    essential,
    optional,
    totalCost,
    budgetFit
  };
}

function findProductsForStep(step: any, profile: HairCareProfile, allProducts: Product[]): ProductRecommendationForRoutine[] {
  const products: ProductRecommendationForRoutine[] = [];
  const stepName = step.action?.toLowerCase() || '';

  // Match products to step type
  if (stepName.includes('moisturize') || stepName.includes('oil')) {
    const oils = allProducts.filter(p => p.subCategory === 'oil');
    oils.forEach(product => {
      products.push({
        product,
        quantity: 1,
        purpose: 'Scalp and hair moisturizing',
        routineStep: step.frequency || 'daily',
        priority: 'essential',
        estimatedCost: product.pricing.estimatedPrice,
        alternatives: findAlternatives(product, allProducts)
      });
    });
  }

  if (stepName.includes('shampoo') || stepName.includes('cleanse')) {
    const shampoos = allProducts.filter(p => p.subCategory === 'shampoo');
    shampoos.forEach(product => {
      products.push({
        product,
        quantity: 1,
        purpose: 'Gentle cleansing',
        routineStep: 'weekly',
        priority: 'essential',
        estimatedCost: product.pricing.estimatedPrice,
        alternatives: findAlternatives(product, allProducts)
      });
    });
  }

  if (stepName.includes('condition') || stepName.includes('deep')) {
    const conditioners = allProducts.filter(p => p.subCategory === 'deep-conditioner');
    conditioners.forEach(product => {
      products.push({
        product,
        quantity: 1,
        purpose: 'Deep conditioning and repair',
        routineStep: 'weekly',
        priority: 'essential',
        estimatedCost: product.pricing.estimatedPrice,
        alternatives: findAlternatives(product, allProducts)
      });
    });
  }

  if (stepName.includes('protect') || stepName.includes('bonnet')) {
    const tools = allProducts.filter(p => p.category === 'tool');
    tools.forEach(product => {
      products.push({
        product,
        quantity: 1,
        purpose: 'Hair protection',
        routineStep: 'daily',
        priority: 'essential',
        estimatedCost: product.pricing.estimatedPrice
      });
    });
  }

  return products;
}

function scoreProductForProfile(product: Product, profile: HairCareProfile, budget: { min: number; max: number }): number {
  let score = 0;

  // Hair type match (30 points)
  if (product.suitableFor.hairTypes.includes(profile.hairType)) {
    score += 30;
  }

  // Porosity match (20 points)
  if (product.suitableFor.porosity.includes(profile.porosity)) {
    score += 20;
  }

  // Goals alignment (20 points)
  const goalMatch = profile.goals.filter(goal => 
    product.suitableFor.goals.includes(goal)
  ).length;
  score += Math.min(goalMatch * 5, 20);

  // Concerns addressed (15 points)
  const concernMatch = profile.concerns.filter(concern =>
    product.suitableFor.concerns.includes(concern)
  ).length;
  score += Math.min(concernMatch * 5, 15);

  // Budget fit (10 points)
  if (product.pricing.estimatedPrice <= budget.max) {
    score += 10;
  }

  // Quality rating (5 points)
  if (product.communityRating) {
    score += (product.communityRating / 5) * 5;
  }

  return score;
}

function findAlternatives(product: Product, allProducts: Product[]): Product[] {
  const alternatives: Product[] = [];
  
  // Find budget alternative
  if (product.alternatives?.budget) {
    const budgetProduct = allProducts.find(p => p.id === product.alternatives?.budget);
    if (budgetProduct) alternatives.push(budgetProduct);
  }
  
  // Find premium alternative
  if (product.alternatives?.premium) {
    const premiumProduct = allProducts.find(p => p.id === product.alternatives?.premium);
    if (premiumProduct) alternatives.push(premiumProduct);
  }

  return alternatives;
}

