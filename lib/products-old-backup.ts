// Product Information & Recommendation System
// Education-first approach: We inform, not sell

// ==================== INTERFACES ====================

export interface RetailerOption {
  retailer: string;
  type: 'online' | 'beauty-supply' | 'pharmacy' | 'supermarket';
  
  // Location info (for physical stores)
  locations?: {
    name: string; // e.g., "Carrefour Junction"
    address: string;
    area: string; // Westlands, CBD, etc.
    mapLink?: string;
  }[];
  
  // Online info
  website?: string;
  affiliateLink?: string; // Our tracking link
  
  // Availability
  stockReliability: 'high' | 'medium' | 'low';
  deliveryAvailable: boolean;
  estimatedDeliveryDays?: number;
  
  // Trust indicators
  verified: boolean;
  trustScore: number; // 1-100
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: 'extension' | 'styling' | 'care' | 'tool';
  subCategory: string;
  
  // Educational content (THE CORE VALUE)
  description: string;
  whyRecommended?: string[]; // Will be personalized based on user
  benefits: string[];
  howToUse: string; // Step-by-step instructions
  proTips?: string[]; // Expert advice
  
  // Suitability
  suitableFor: {
    hairTypes: string[];
    porosity: string[];
    concerns: string[];
    goals: string[];
  };
  
  // Pricing (informational, not transactional)
  pricing: {
    estimatedPrice: number; // Average market price
    currency: string;
    size: string;
    unit: string;
    priceRange?: { min: number; max: number }; // Price varies by retailer
  };
  
  // Quality indicators
  quality: 'budget' | 'mid-range' | 'premium';
  communityRating?: number; // Based on user feedback
  expertRating?: number; // Our assessment
  
  // Purchase Options (External Links)
  whereToFind: RetailerOption[];
  
  // Images
  images: string[];
  productImage?: string; // Main product shot
  
  // Compatibility
  stylesCompatible: string[];
  routineStep?: 'daily' | 'weekly' | 'monthly';
  
  // Ingredients (for care products)
  ingredients?: string[];
  
  // Alternatives
  alternatives?: {
    budget?: string; // Product ID of cheaper option
    premium?: string; // Product ID of higher quality option
  };
}

export interface ProductRecommendation {
  product: Product;
  score: number;
  confidence: number;
  reasons: string[];
  alternatives: Product[];
}

// ==================== PRODUCT DATABASE ====================

export const PRODUCT_DATABASE: Product[] = [
  // ===== HAIR EXTENSIONS =====
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
      {
        retailer: 'Beauty Supreme',
        type: 'beauty-supply',
        locations: [
          {
            name: 'Beauty Supreme Westlands',
            address: 'Woodvale Grove, Westlands',
            area: 'Westlands',
            mapLink: 'https://goo.gl/maps/example1'
          },
          {
            name: 'Beauty Supreme Junction',
            address: 'Junction Mall, Dagoretti Road',
            area: 'Dagoretti',
            mapLink: 'https://goo.gl/maps/example2'
          }
        ],
        stockReliability: 'high',
        deliveryAvailable: true,
        estimatedDeliveryDays: 1,
        verified: true,
        trustScore: 95
      },
      {
        retailer: 'Jumia Kenya',
        type: 'online',
        website: 'https://www.jumia.co.ke',
        affiliateLink: 'https://www.jumia.co.ke/xpression?ref=nywele_ai',
        stockReliability: 'high',
        deliveryAvailable: true,
        estimatedDeliveryDays: 2,
        verified: true,
        trustScore: 90
      },
      {
        retailer: 'Chandarana',
        type: 'supermarket',
        locations: [
          {
            name: 'Chandarana Westgate',
            address: 'Westgate Mall, Karuna Road',
            area: 'Westlands',
          },
          {
            name: 'Chandarana Prestige',
            address: 'Prestige Plaza, Ngong Road',
            area: 'Kilimani',
          }
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
      budget: 'ext_002',
      premium: 'ext_001'
    }
  },
  
  {
    id: 'ext_002',
    vendorId: 'vendor_001',
    name: 'Darling Yaki Pony',
    brand: 'Darling',
    category: 'extension',
    subCategory: 'braiding-hair',
    description: 'Soft, pre-stretched Yaki texture hair. Perfect for natural-looking styles.',
    suitableFor: {
      hairTypes: ['4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: [],
    },
    pricing: {
      amount: 250,
      currency: 'KES',
      unit: 'per pack',
      size: '52 inches',
      costPerUse: 250,
    },
    inStock: true,
    stockQuantity: 200,
    vendor: {
      name: 'Nairobi Hair Supply',
      location: 'Nairobi, CBD',
      rating: 4.7,
      verified: true,
    },
    quality: 'budget',
    rating: 4.5,
    reviewCount: 456,
    images: ['/products/darling-yaki.jpg'],
    benefits: ['Affordable', 'Soft texture', 'Easy to braid', 'Good for beginners'],
    stylesCompatible: ['Box Braids', 'Senegalese Twists', 'Passion Twists'],
    featured: false,
    sponsored: false,
  },

  // ===== STYLING PRODUCTS =====
  {
    id: 'style_001',
    vendorId: 'vendor_002',
    name: 'Got2B Glued Spiking Gel',
    brand: 'Got2B',
    category: 'styling',
    subCategory: 'edge-control',
    description: 'Strong hold gel perfect for sleek edges and flyaways.',
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: [],
    },
    pricing: {
      amount: 800,
      currency: 'KES',
      unit: 'per bottle',
      size: '150ml',
      costPerUse: 20,
    },
    inStock: true,
    stockQuantity: 80,
    vendor: {
      name: 'Beauty Plus Nairobi',
      location: 'Nairobi, Westlands',
      rating: 4.8,
      verified: true,
    },
    quality: 'mid-range',
    rating: 4.7,
    reviewCount: 189,
    images: ['/products/got2b-gel.jpg'],
    howToUse: 'Apply small amount to edges. Use edge brush to smooth. Set with scarf for 10 minutes.',
    benefits: ['Strong hold', 'No flakes', 'Long-lasting', 'Works on all hair types'],
    stylesCompatible: ['Box Braids', 'Cornrows', 'Ponytails', 'Sleek buns'],
    routineStep: 'daily',
    featured: true,
    sponsored: true,
    dealPrice: 700,
  },

  {
    id: 'style_002',
    vendorId: 'vendor_002',
    name: 'Eco Styler Olive Oil Gel',
    brand: 'Eco Styler',
    category: 'styling',
    subCategory: 'gel',
    description: 'Alcohol-free styling gel with olive oil for moisture and hold.',
    suitableFor: {
      hairTypes: ['3b', '3c', '4a', '4b', '4c'],
      porosity: ['medium', 'high'],
      concerns: ['dryness'],
    },
    pricing: {
      amount: 1200,
      currency: 'KES',
      unit: 'per tub',
      size: '473ml',
      costPerUse: 15,
    },
    inStock: true,
    stockQuantity: 120,
    vendor: {
      name: 'Beauty Plus Nairobi',
      location: 'Nairobi, Westlands',
      rating: 4.8,
      verified: true,
    },
    quality: 'mid-range',
    rating: 4.6,
    reviewCount: 312,
    images: ['/products/eco-styler-olive.jpg'],
    howToUse: 'Apply to damp hair for styling or edges. Can be used for twist-outs and braid-outs.',
    benefits: ['Maximum hold', 'Adds shine', 'No alcohol', 'Large size lasts long'],
    stylesCompatible: ['Twist-outs', 'Braid-outs', 'Sleek styles'],
    routineStep: 'daily',
    featured: false,
    sponsored: false,
  },

  // ===== HAIR CARE - SHAMPOOS =====
  {
    id: 'care_001',
    vendorId: 'vendor_003',
    name: 'Cantu Sulfate-Free Cleansing Cream Shampoo',
    brand: 'Cantu',
    category: 'care',
    subCategory: 'shampoo',
    description: 'Gentle, sulfate-free shampoo that cleanses without stripping natural oils.',
    ingredients: ['Shea Butter', 'Coconut Oil', 'Honey'],
    suitableFor: {
      hairTypes: ['3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['dryness', 'breakage'],
    },
    pricing: {
      amount: 1500,
      currency: 'KES',
      unit: 'per bottle',
      size: '400ml',
      costPerUse: 75,
    },
    inStock: true,
    stockQuantity: 95,
    vendor: {
      name: 'Healthy Hair Kenya',
      location: 'Nairobi, Karen',
      rating: 4.9,
      verified: true,
    },
    quality: 'mid-range',
    rating: 4.8,
    reviewCount: 567,
    images: ['/products/cantu-shampoo.jpg'],
    howToUse: 'Wet hair thoroughly. Apply to scalp and massage. Rinse. Follow with conditioner.',
    benefits: ['Sulfate-free', 'Moisturizes while cleansing', 'Reduces breakage', 'Gentle on color-treated hair'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly',
    featured: true,
    sponsored: false,
  },

  // ===== HAIR CARE - CONDITIONERS =====
  {
    id: 'care_002',
    vendorId: 'vendor_003',
    name: 'Shea Moisture Deep Treatment Masque',
    brand: 'Shea Moisture',
    category: 'care',
    subCategory: 'deep-conditioner',
    description: 'Intensive hydration deep conditioner with raw shea butter and argan oil.',
    ingredients: ['Shea Butter', 'Argan Oil', 'Sea Kelp'],
    suitableFor: {
      hairTypes: ['3c', '4a', '4b', '4c'],
      porosity: ['high'],
      concerns: ['dryness', 'breakage', 'damage'],
    },
    pricing: {
      amount: 2200,
      currency: 'KES',
      unit: 'per jar',
      size: '340g',
      costPerUse: 110,
    },
    inStock: true,
    stockQuantity: 67,
    vendor: {
      name: 'Healthy Hair Kenya',
      location: 'Nairobi, Karen',
      rating: 4.9,
      verified: true,
    },
    quality: 'premium',
    rating: 4.9,
    reviewCount: 423,
    images: ['/products/shea-moisture-mask.jpg'],
    howToUse: 'Apply generously to clean, damp hair. Cover with plastic cap. Leave for 20-30 mins. Use heat cap for better penetration. Rinse thoroughly.',
    benefits: ['Deep hydration', 'Repairs damage', 'Restores elasticity', 'Reduces breakage'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly',
    featured: true,
    sponsored: false,
  },

  // ===== HAIR CARE - OILS =====
  {
    id: 'care_003',
    vendorId: 'vendor_003',
    name: 'Jamaican Black Castor Oil',
    brand: 'Sunny Isle',
    category: 'care',
    subCategory: 'oil',
    description: 'Pure Jamaican Black Castor Oil for hair growth and thickness.',
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['thinning', 'slow growth', 'breakage'],
    },
    pricing: {
      amount: 1800,
      currency: 'KES',
      unit: 'per bottle',
      size: '118ml',
      costPerUse: 60,
    },
    inStock: true,
    stockQuantity: 145,
    vendor: {
      name: 'Healthy Hair Kenya',
      location: 'Nairobi, Karen',
      rating: 4.9,
      verified: true,
    },
    quality: 'premium',
    rating: 4.7,
    reviewCount: 678,
    images: ['/products/jbco.jpg'],
    howToUse: 'Apply to scalp and massage for 5-10 minutes. Can be used on ends. Use 2-3 times per week. Warm oil for better absorption.',
    benefits: ['Promotes growth', 'Thickens hair', 'Strengthens roots', 'Reduces shedding'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly',
    featured: true,
    sponsored: false,
  },

  {
    id: 'care_004',
    vendorId: 'vendor_003',
    name: 'Lightweight Hair Oil Blend',
    brand: 'Natural Blends Kenya',
    category: 'care',
    subCategory: 'oil',
    description: 'Blend of jojoba, argan, and grapeseed oils. Perfect for low porosity hair.',
    suitableFor: {
      hairTypes: ['3b', '3c', '4a', '4b', '4c'],
      porosity: ['low'],
      concerns: ['dryness'],
    },
    pricing: {
      amount: 1200,
      currency: 'KES',
      unit: 'per bottle',
      size: '100ml',
      costPerUse: 40,
    },
    inStock: true,
    stockQuantity: 88,
    vendor: {
      name: 'Healthy Hair Kenya',
      location: 'Nairobi, Karen',
      rating: 4.9,
      verified: true,
    },
    quality: 'mid-range',
    rating: 4.6,
    reviewCount: 234,
    images: ['/products/light-oil-blend.jpg'],
    howToUse: 'Apply 2-3 drops to damp hair. Can be used daily on scalp. Won\'t weigh down low porosity hair.',
    benefits: ['Lightweight', 'Absorbs quickly', 'Adds shine', 'No buildup'],
    stylesCompatible: ['All styles'],
    routineStep: 'daily',
    featured: false,
    sponsored: false,
  },

  // ===== TOOLS =====
  {
    id: 'tool_001',
    vendorId: 'vendor_004',
    name: 'Satin Bonnet - Adjustable',
    brand: 'African Pride',
    category: 'tool',
    subCategory: 'bonnet',
    description: 'Large, adjustable satin bonnet. Protects hair while sleeping.',
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['breakage', 'frizz'],
    },
    pricing: {
      amount: 500,
      currency: 'KES',
      unit: 'per piece',
      size: 'One size fits all',
      costPerUse: 2,
    },
    inStock: true,
    stockQuantity: 200,
    vendor: {
      name: 'Hair Tools Kenya',
      location: 'Nairobi, Tom Mboya',
      rating: 4.6,
      verified: true,
    },
    quality: 'budget',
    rating: 4.5,
    reviewCount: 345,
    images: ['/products/satin-bonnet.jpg'],
    howToUse: 'Wear before bed. Adjust elastic for comfortable fit. Replace every 3-6 months.',
    benefits: ['Prevents breakage', 'Maintains moisture', 'Reduces frizz', 'Preserves hairstyles'],
    stylesCompatible: ['All styles'],
    routineStep: 'daily',
    featured: false,
    sponsored: false,
  },

  {
    id: 'tool_002',
    vendorId: 'vendor_004',
    name: 'Wide-tooth Detangling Comb',
    brand: 'Denman',
    category: 'tool',
    subCategory: 'comb',
    description: 'Seamless wide-tooth comb. Perfect for detangling wet hair without breakage.',
    suitableFor: {
      hairTypes: ['3a', '3b', '3c', '4a', '4b', '4c'],
      porosity: ['low', 'medium', 'high'],
      concerns: ['breakage', 'tangles'],
    },
    pricing: {
      amount: 800,
      currency: 'KES',
      unit: 'per piece',
      size: 'Standard',
      costPerUse: 1,
    },
    inStock: true,
    stockQuantity: 150,
    vendor: {
      name: 'Hair Tools Kenya',
      location: 'Nairobi, Tom Mboya',
      rating: 4.6,
      verified: true,
    },
    quality: 'mid-range',
    rating: 4.8,
    reviewCount: 523,
    images: ['/products/wide-tooth-comb.jpg'],
    howToUse: 'Start detangling from ends, working your way up to roots. Use on wet, conditioned hair for best results.',
    benefits: ['Reduces breakage', 'Gentle detangling', 'Smooth seams', 'Durable'],
    stylesCompatible: ['All styles'],
    routineStep: 'weekly',
    featured: false,
    sponsored: false,
  },
];

// ==================== RECOMMENDATION ENGINE ====================

import type { HairCareProfile, HairCareRecommendation } from './hairCare';

export function recommendProductsForRoutine(
  profile: HairCareProfile,
  routine: HairCareRecommendation,
  budget?: { min: number; max: number }
): ProductRecommendation[] {
  // Filter products suitable for user's hair
  let suitableProducts = PRODUCT_DATABASE.filter(product => {
    // Hair type match
    const hairTypeMatch = product.suitableFor.hairTypes.includes(profile.hairAnalysis.type);
    
    // Porosity match
    const porosityMatch = product.suitableFor.porosity.includes(profile.hairAnalysis.porosity);
    
    // In stock
    const available = product.inStock;
    
    return hairTypeMatch && porosityMatch && available;
  });

  // Score each product
  const scored = suitableProducts.map(product => {
    const score = scoreProduct(product, profile, budget);
    const confidence = calculateProductConfidence(product, profile);
    const reasons = generateProductReasons(product, profile);
    
    // Find alternatives
    const alternatives = findAlternativeProducts(product, suitableProducts);
    
    return {
      product,
      score,
      confidence,
      reasons,
      alternatives,
    };
  });

  // Sort by score and filter by budget
  let recommended = scored.sort((a, b) => b.score - a.score);
  
  if (budget) {
    recommended = recommended.filter(r => 
      r.product.pricing.amount >= budget.min && 
      r.product.pricing.amount <= budget.max
    );
  }

  // Return top recommendations
  return recommended.slice(0, 10);
}

function scoreProduct(
  product: Product,
  profile: HairCareProfile,
  budget?: { min: number; max: number }
): number {
  let score = 0;

  // Hair type match (30 points)
  if (product.suitableFor.hairTypes.includes(profile.hairAnalysis.type)) {
    score += 30;
  }

  // Porosity match (20 points)
  if (product.suitableFor.porosity.includes(profile.hairAnalysis.porosity)) {
    score += 20;
  }

  // Goal alignment (20 points)
  const concernMatch = product.suitableFor.concerns.some(c => 
    profile.concerns.includes(c)
  );
  if (concernMatch) {
    score += 20;
  }

  // Price-value ratio (15 points)
  if (budget) {
    const budgetMid = (budget.min + budget.max) / 2;
    const priceDiff = Math.abs(product.pricing.amount - budgetMid) / budgetMid;
    score += Math.max(0, 15 - (priceDiff * 15));
  } else {
    score += 10;
  }

  // Rating & reviews (10 points)
  score += (product.rating / 5) * 10;

  // Vendor reputation (5 points)
  if (product.vendor.verified) {
    score += 3;
  }
  score += (product.vendor.rating / 5) * 2;

  // Featured/sponsored bonus
  if (product.featured) score += 2;
  if (product.sponsored) score += 1;

  return score;
}

function calculateProductConfidence(
  product: Product,
  profile: HairCareProfile
): number {
  let confidence = 50;

  // More reviews = higher confidence
  if (product.reviewCount > 100) confidence += 15;
  else if (product.reviewCount > 50) confidence += 10;
  else if (product.reviewCount > 10) confidence += 5;

  // High rating = higher confidence
  if (product.rating >= 4.5) confidence += 15;
  else if (product.rating >= 4.0) confidence += 10;

  // Verified vendor
  if (product.vendor.verified) confidence += 10;

  // Multiple compatibility factors
  if (product.suitableFor.hairTypes.length > 3) confidence += 5;
  if (product.suitableFor.porosity.length > 1) confidence += 5;

  return Math.min(100, confidence);
}

function generateProductReasons(
  product: Product,
  profile: HairCareProfile
): string[] {
  const reasons: string[] = [];

  // Hair type
  if (product.suitableFor.hairTypes.includes(profile.hairAnalysis.type)) {
    reasons.push(`Perfect for ${profile.hairAnalysis.type} hair`);
  }

  // Porosity
  if (product.suitableFor.porosity.includes(profile.hairAnalysis.porosity)) {
    reasons.push(`Works great with ${profile.hairAnalysis.porosity} porosity`);
  }

  // Concerns
  const matchedConcerns = product.suitableFor.concerns.filter(c =>
    profile.concerns.includes(c)
  );
  if (matchedConcerns.length > 0) {
    reasons.push(`Addresses your ${matchedConcerns[0]} concern`);
  }

  // Goals
  if (profile.goals.includes('growth') && product.benefits.some(b => 
    b.toLowerCase().includes('growth'))) {
    reasons.push('Promotes hair growth');
  }

  if (profile.goals.includes('moisture') && product.benefits.some(b => 
    b.toLowerCase().includes('moisture') || b.toLowerCase().includes('hydrat'))) {
    reasons.push('Provides deep moisture');
  }

  // High rating
  if (product.rating >= 4.5) {
    reasons.push(`Highly rated (${product.rating}★ from ${product.reviewCount} reviews)`);
  }

  // Price value
  if (product.quality === 'budget') {
    reasons.push('Great value for money');
  } else if (product.quality === 'premium') {
    reasons.push('Premium quality');
  }

  return reasons.slice(0, 3); // Top 3 reasons
}

function findAlternativeProducts(
  product: Product,
  allProducts: Product[]
): Product[] {
  // Find similar products (same category/subcategory)
  return allProducts
    .filter(p => 
      p.id !== product.id &&
      p.category === product.category &&
      p.subCategory === product.subCategory
    )
    .sort((a, b) => {
      // Sort by price similarity
      const aDiff = Math.abs(a.pricing.amount - product.pricing.amount);
      const bDiff = Math.abs(b.pricing.amount - product.pricing.amount);
      return aDiff - bDiff;
    })
    .slice(0, 3);
}

// ==================== STYLE-SPECIFIC PRODUCTS ====================

export function getProductsForStyle(styleName: string): Product[] {
  return PRODUCT_DATABASE.filter(product =>
    product.stylesCompatible.includes(styleName)
  );
}

// ==================== EXPORT ALL PRODUCTS BY CATEGORY ====================

export function getProductsByCategory(category: string): Product[] {
  return PRODUCT_DATABASE.filter(p => p.category === category);
}

export function getProductsBySubCategory(subCategory: string): Product[] {
  return PRODUCT_DATABASE.filter(p => p.subCategory === subCategory);
}

export function getFeaturedProducts(): Product[] {
  return PRODUCT_DATABASE.filter(p => p.featured).sort((a, b) => b.rating - a.rating);
}

