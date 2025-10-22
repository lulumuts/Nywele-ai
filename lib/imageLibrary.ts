// lib/imageLibrary.ts
/**
 * Curated Image Library for Authentic African Hairstyle Representation
 * 
 * Priority: Use real photos of Black women instead of biased AI generation
 * All images should be properly licensed (Unsplash, Pexels, or user-submitted with consent)
 */

export interface StyleImage {
  url: string;
  source: 'local' | 'unsplash' | 'pexels' | 'user-submitted';
  attribution?: string;
  hairTypes: string[]; // e.g., ['4a', '4b', '4c']
  length: string; // 'short', 'medium', 'long'
  angle: 'back' | 'side' | 'front' | 'top';
  quality: 'high' | 'medium';
}

export interface StyleImageSet {
  styleName: string;
  aliases: string[]; // Alternative names for the style
  images: StyleImage[];
  description: string;
  typicalDuration: string;
  maintenance: string;
  costEstimate: { min: number; max: number }; // USD
}

export const CURATED_STYLES: Record<string, StyleImageSet> = {
  'box-braids': {
    styleName: 'Box Braids',
    aliases: ['box braids', 'individual braids', 'single braids'],
    description: 'Individual braids in neat, box-shaped sections',
    typicalDuration: '6-8 weeks',
    maintenance: 'Low',
    costEstimate: { min: 150, max: 300 },
    images: [
      {
        url: '/images/styles/box-braids.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'back',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1594824476967-48c8b964273f?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'cornrows': {
    styleName: 'Cornrows',
    aliases: ['cornrows', 'canerows', 'rows'],
    description: 'Braids plaited close to the scalp in continuous rows',
    typicalDuration: '2-4 weeks',
    maintenance: 'Low',
    costEstimate: { min: 50, max: 150 },
    images: [
      {
        url: '/images/styles/cornrows.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'back',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'short',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'senegalese-twists': {
    styleName: 'Senegalese Twists',
    aliases: ['senegalese twists', 'rope twists'],
    description: 'Smooth, rope-like twists using synthetic hair',
    typicalDuration: '6-8 weeks',
    maintenance: 'Low',
    costEstimate: { min: 120, max: 250 },
    images: [
      {
        url: '/images/styles/senegalese-twists.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'side',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1598217309180-a9ea0cb11175?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'two-strand-twists': {
    styleName: 'Two-Strand Twists',
    aliases: ['two-strand twists', 'twists', 'natural twists'],
    description: 'Twists using only natural hair, no extensions',
    typicalDuration: '1-2 weeks',
    maintenance: 'Low',
    costEstimate: { min: 40, max: 100 },
    images: [
      {
        url: '/images/styles/two-strand-twists.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'back',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'short',
        angle: 'side',
        quality: 'high'
      }
    ]
  },
  'twist-out': {
    styleName: 'Twist Out',
    aliases: ['twist out', 'twist-out', 'twistout'],
    description: 'Defined curls achieved by unraveling two-strand twists',
    typicalDuration: '3-7 days',
    maintenance: 'Medium',
    costEstimate: { min: 0, max: 30 },
    images: [
      {
        url: '/images/styles/twist-out.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'side',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1616683693457-c45984ccb3ae?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'front',
        quality: 'high'
      }
    ]
  },
  'afro': {
    styleName: 'Afro',
    aliases: ['afro', 'natural', 'fro', 'afro/natural', 'twa', 'afro/twa'],
    description: 'Full, rounded natural hair style',
    typicalDuration: 'Daily styling',
    maintenance: 'High',
    costEstimate: { min: 0, max: 20 },
    images: [
      {
        url: '/images/styles/afro-twa.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'short',
        angle: 'front',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'side',
        quality: 'high'
      }
    ]
  },
  'bantu-knots': {
    styleName: 'Bantu Knots',
    aliases: ['bantu knots', 'zulu knots', 'nubian knots'],
    description: 'Small, coiled buns distributed across the scalp',
    typicalDuration: '1 week',
    maintenance: 'Low',
    costEstimate: { min: 30, max: 80 },
    images: [
      {
        url: '/images/styles/bantu-knots.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'top',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1583884098485-8e9a6ee00eb3?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'short',
        angle: 'side',
        quality: 'high'
      }
    ]
  },
  'bantu-knot-out': {
    styleName: 'Bantu Knot Out',
    aliases: ['bantu knot out', 'bantu knot-out'],
    description: 'Defined curls from unraveled Bantu knots',
    typicalDuration: '3-5 days',
    maintenance: 'Medium',
    costEstimate: { min: 0, max: 20 },
    images: [
      {
        url: '/images/styles/bantu-knot-out.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'side',
        quality: 'high'
      }
    ]
  },
  'faux-locs': {
    styleName: 'Faux Locs',
    aliases: ['faux locs', 'fake locs', 'temporary locs'],
    description: 'Temporary locs installed with extensions',
    typicalDuration: '6-8 weeks',
    maintenance: 'Low',
    costEstimate: { min: 150, max: 300 },
    images: [
      {
        url: '/images/styles/faux-locs.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'back',
        quality: 'high'
      },
      {
        url: 'https://images.unsplash.com/photo-1609505848912-b7c3b8b4beda?w=300&q=75',
        source: 'unsplash',
        attribution: 'Photo by Unsplash',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'side',
        quality: 'high'
      }
    ]
  },
  'goddess-locs': {
    styleName: 'Goddess Locs',
    aliases: ['goddess locs', 'goddess locks'],
    description: 'Faux locs with curly ends',
    typicalDuration: '6-8 weeks',
    maintenance: 'Low',
    costEstimate: { min: 180, max: 350 },
    images: [
      {
        url: '/images/styles/goddess-locs.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'braid-out': {
    styleName: 'Braid Out',
    aliases: ['braid out', 'braid-out', 'braidout'],
    description: 'Wavy texture from unraveled braids',
    typicalDuration: '5-7 days',
    maintenance: 'Low',
    costEstimate: { min: 0, max: 15 },
    images: [
      {
        url: '/images/styles/braid-out.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'mini-twists': {
    styleName: 'Mini Twists',
    aliases: ['mini twists', 'mini-twists'],
    description: 'Small two-strand twists for long-lasting style',
    typicalDuration: '2-4 weeks',
    maintenance: 'Very Low',
    costEstimate: { min: 60, max: 150 },
    images: [
      {
        url: '/images/styles/mini-twists.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'flat-twists': {
    styleName: 'Flat Twists',
    aliases: ['flat twists', 'flat-twists'],
    description: 'Two-strand twists flat against the scalp',
    typicalDuration: '1-2 weeks',
    maintenance: 'Low',
    costEstimate: { min: 40, max: 100 },
    images: [
      {
        url: '/images/styles/flat-twists.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'passion-twists': {
    styleName: 'Passion Twists',
    aliases: ['passion twists', 'passion-twists'],
    description: 'Bohemian-style twists with textured extensions',
    typicalDuration: '6-8 weeks',
    maintenance: 'Low',
    costEstimate: { min: 140, max: 280 },
    images: [
      {
        url: '/images/styles/passion-twists.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'knotless-braids': {
    styleName: 'Knotless Braids',
    aliases: ['knotless braids', 'knotless box braids'],
    description: 'Box braids with no knot at the base',
    typicalDuration: '6-8 weeks',
    maintenance: 'Low',
    costEstimate: { min: 180, max: 350 },
    images: [
      {
        url: '/images/styles/knotless-braids.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'long',
        angle: 'back',
        quality: 'high'
      }
    ]
  },
  'wash-and-go': {
    styleName: 'Wash and Go',
    aliases: ['wash and go', 'wash-and-go', 'wash n go'],
    description: 'Natural curl pattern enhanced with products',
    typicalDuration: '3-5 days',
    maintenance: 'Medium',
    costEstimate: { min: 0, max: 25 },
    images: [
      {
        url: '/images/styles/wash-and-go.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'side',
        quality: 'high'
      }
    ]
  },
  'high-puff': {
    styleName: 'High Puff',
    aliases: ['high puff', 'puff', 'afro puff'],
    description: 'Hair gathered into a high ponytail puff',
    typicalDuration: '1-2 days',
    maintenance: 'Low',
    costEstimate: { min: 0, max: 10 },
    images: [
      {
        url: '/images/styles/high-puff.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'medium',
        angle: 'side',
        quality: 'high'
      }
    ]
  },
  'finger-coils': {
    styleName: 'Finger Coils',
    aliases: ['finger coils', 'coils', 'comb coils'],
    description: 'Defined coils created by wrapping hair around fingers',
    typicalDuration: '1 week',
    maintenance: 'Medium',
    costEstimate: { min: 50, max: 120 },
    images: [
      {
        url: '/images/styles/finger-coils.jpg',
        source: 'local',
        hairTypes: ['4a', '4b', '4c'],
        length: 'short',
        angle: 'top',
        quality: 'high'
      }
    ]
  },
};

/**
 * Find the best matching image for a given style and preferences
 */
export function findStyleImage(
  styleName: string,
  hairType?: string,
  length?: string,
  preferredAngle?: 'back' | 'side' | 'front' | 'top'
): StyleImage | null {
  // Normalize style name
  const styleKey = styleName.toLowerCase().trim().replace(/\s+/g, '-');
  
  // Try direct match
  let styleSet = CURATED_STYLES[styleKey];
  
  // Try alias match
  if (!styleSet) {
    for (const [key, set] of Object.entries(CURATED_STYLES)) {
      if (set.aliases.some(alias => 
        alias.toLowerCase() === styleName.toLowerCase() ||
        styleName.toLowerCase().includes(alias.toLowerCase()) ||
        alias.toLowerCase().includes(styleName.toLowerCase())
      )) {
        styleSet = set;
        break;
      }
    }
  }
  
  if (!styleSet || styleSet.images.length === 0) {
    return null;
  }
  
  // Filter images by preferences
  let candidateImages = styleSet.images;
  
  if (hairType) {
    const filtered = candidateImages.filter(img => 
      img.hairTypes.includes(hairType)
    );
    if (filtered.length > 0) candidateImages = filtered;
  }
  
  if (length) {
    const filtered = candidateImages.filter(img => img.length === length);
    if (filtered.length > 0) candidateImages = filtered;
  }
  
  if (preferredAngle) {
    const filtered = candidateImages.filter(img => img.angle === preferredAngle);
    if (filtered.length > 0) candidateImages = filtered;
  }
  
  // Prefer local images over external sources
  const localImages = candidateImages.filter(img => img.source === 'local');
  if (localImages.length > 0) {
    return localImages[0];
  }
  
  // Return first available image
  return candidateImages[0];
}

/**
 * Get cost estimate for a style
 */
export function getStyleCostEstimate(styleName: string): { min: number; max: number } | null {
  const styleKey = styleName.toLowerCase().trim().replace(/\s+/g, '-');
  const styleSet = CURATED_STYLES[styleKey];
  
  if (!styleSet) {
    // Try alias match
    for (const set of Object.values(CURATED_STYLES)) {
      if (set.aliases.some(alias => alias.toLowerCase() === styleName.toLowerCase())) {
        return set.costEstimate;
      }
    }
    return null;
  }
  
  return styleSet.costEstimate;
}

/**
 * Get maintenance info for a style
 */
export function getStyleInfo(styleName: string): Pick<StyleImageSet, 'typicalDuration' | 'maintenance'> | null {
  const styleKey = styleName.toLowerCase().trim().replace(/\s+/g, '-');
  const styleSet = CURATED_STYLES[styleKey];
  
  if (!styleSet) {
    // Try alias match
    for (const set of Object.values(CURATED_STYLES)) {
      if (set.aliases.some(alias => alias.toLowerCase() === styleName.toLowerCase())) {
        return { typicalDuration: set.typicalDuration, maintenance: set.maintenance };
      }
    }
    return null;
  }
  
  return { typicalDuration: styleSet.typicalDuration, maintenance: styleSet.maintenance };
}

/**
 * Get all available styles for display
 */
export function getAllStyles(): StyleImageSet[] {
  return Object.values(CURATED_STYLES);
}


