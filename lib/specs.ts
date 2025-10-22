// lib/specs.ts - Job specification generator from curated templates

export interface HairExtension {
  type: string; // "Xpression braiding hair", "Marley hair", "Havana twist hair"
  quantity_min: number; // minimum packs needed
  quantity_max: number; // maximum packs needed
  cost_per_pack_kes: number;
  subtotal_min_kes: number;
  subtotal_max_kes: number;
}

export interface StylingProduct {
  item: string;
  quantity: string;
  cost_kes: number;
  optional: boolean;
}

export interface JobSpec {
  style_slug: string;
  style_name: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  time_min_hours: number;
  time_max_hours: number;
  
  // Main cost: Hair extensions
  hair_extensions: HairExtension;
  
  // Secondary cost: Labor (time-based)
  labor: {
    base_rate_per_hour_kes: number;
    estimated_min_kes: number;
    estimated_max_kes: number;
  };
  
  // Optional: Small styling products
  styling_products: StylingProduct[];
  
  hair_requirements: {
    min_length: string;
    textures: string[];
  };
  skill_level: string;
  
  // Total breakdown
  total_extensions_min_kes: number;
  total_extensions_max_kes: number;
  total_labor_min_kes: number;
  total_labor_max_kes: number;
  total_styling_products_kes: number;
  grand_total_min_kes: number;
  grand_total_max_kes: number;
}

// Curated style templates (seed data)
const STYLE_TEMPLATES: Record<string, Omit<JobSpec, 'style_slug'>> = {
  'knotless-braids': {
    style_name: 'Knotless Box Braids (Medium)',
    complexity: 'intermediate',
    time_min_hours: 6,
    time_max_hours: 8,
    
    hair_extensions: {
      type: 'Xpression braiding hair',
      quantity_min: 6,
      quantity_max: 8,
      cost_per_pack_kes: 1200,
      subtotal_min_kes: 7200,  // 6 × 1200
      subtotal_max_kes: 9600,  // 8 × 1200
    },
    
    labor: {
      base_rate_per_hour_kes: 600,  // Mid-range rate
      estimated_min_kes: 3600,  // 6 hours × 600
      estimated_max_kes: 4800,  // 8 hours × 600
    },
    
    styling_products: [
      {
        item: 'Edge control',
        quantity: '1 jar',
        cost_kes: 300,
        optional: false,
      },
      {
        item: 'Braiding gel',
        quantity: '1 bottle',
        cost_kes: 250,
        optional: true,
      },
      {
        item: 'Shine spray',
        quantity: '1 bottle',
        cost_kes: 400,
        optional: true,
      },
    ],
    
    hair_requirements: {
      min_length: '2 inches',
      textures: ['4A', '4B', '4C'],
    },
    skill_level: 'intermediate',
    
    total_extensions_min_kes: 7200,
    total_extensions_max_kes: 9600,
    total_labor_min_kes: 3600,
    total_labor_max_kes: 4800,
    total_styling_products_kes: 950,  // 300 + 250 + 400
    grand_total_min_kes: 11100,  // 7200 + 3600 + 300 (required only)
    grand_total_max_kes: 15350,  // 9600 + 4800 + 950 (all products)
  },
  'box-braids': {
    style_name: 'Box Braids (Medium)',
    complexity: 'intermediate',
    time_min_hours: 5,
    time_max_hours: 7,
    
    hair_extensions: {
      type: 'Xpression braiding hair',
      quantity_min: 5,
      quantity_max: 7,
      cost_per_pack_kes: 1200,
      subtotal_min_kes: 6000,
      subtotal_max_kes: 8400,
    },
    
    labor: {
      base_rate_per_hour_kes: 600,
      estimated_min_kes: 3000,  // 5 × 600
      estimated_max_kes: 4200,  // 7 × 600
    },
    
    styling_products: [
      {
        item: 'Edge control',
        quantity: '1 jar',
        cost_kes: 300,
        optional: false,
      },
      {
        item: 'Scalp oil',
        quantity: '1 bottle',
        cost_kes: 350,
        optional: true,
      },
    ],
    
    hair_requirements: {
      min_length: '2 inches',
      textures: ['4A', '4B', '4C'],
    },
    skill_level: 'intermediate',
    
    total_extensions_min_kes: 6000,
    total_extensions_max_kes: 8400,
    total_labor_min_kes: 3000,
    total_labor_max_kes: 4200,
    total_styling_products_kes: 650,
    grand_total_min_kes: 9300,  // 6000 + 3000 + 300
    grand_total_max_kes: 13550, // 8400 + 4200 + 650
  },
  'two-strand-twists': {
    style_name: 'Two Strand Twists',
    complexity: 'beginner',
    time_min_hours: 3,
    time_max_hours: 5,
    
    hair_extensions: {
      type: 'None (natural hair only)',
      quantity_min: 0,
      quantity_max: 0,
      cost_per_pack_kes: 0,
      subtotal_min_kes: 0,
      subtotal_max_kes: 0,
    },
    
    labor: {
      base_rate_per_hour_kes: 500,  // Lower rate for simpler style
      estimated_min_kes: 1500,  // 3 × 500
      estimated_max_kes: 2500,  // 5 × 500
    },
    
    styling_products: [
      {
        item: 'Twisting cream',
        quantity: '1 jar',
        cost_kes: 800,
        optional: false,
      },
      {
        item: 'Edge control',
        quantity: '1 jar',
        cost_kes: 300,
        optional: false,
      },
      {
        item: 'Shine serum',
        quantity: '1 bottle',
        cost_kes: 450,
        optional: true,
      },
    ],
    
    hair_requirements: {
      min_length: '3 inches',
      textures: ['4A', '4B', '4C', '3C'],
    },
    skill_level: 'beginner',
    
    total_extensions_min_kes: 0,
    total_extensions_max_kes: 0,
    total_labor_min_kes: 1500,
    total_labor_max_kes: 2500,
    total_styling_products_kes: 1550,
    grand_total_min_kes: 2600,  // 0 + 1500 + 800 + 300
    grand_total_max_kes: 4050,  // 0 + 2500 + 1550
  },
  'cornrows': {
    style_name: 'Cornrows',
    complexity: 'intermediate',
    time_min_hours: 2,
    time_max_hours: 4,
    
    hair_extensions: {
      type: 'None (natural hair only)',
      quantity_min: 0,
      quantity_max: 0,
      cost_per_pack_kes: 0,
      subtotal_min_kes: 0,
      subtotal_max_kes: 0,
    },
    
    labor: {
      base_rate_per_hour_kes: 600,
      estimated_min_kes: 1200,  // 2 × 600
      estimated_max_kes: 2400,  // 4 × 600
    },
    
    styling_products: [
      {
        item: 'Edge control',
        quantity: '1 jar',
        cost_kes: 300,
        optional: false,
      },
      {
        item: 'Braiding gel',
        quantity: '1 bottle',
        cost_kes: 400,
        optional: false,
      },
      {
        item: 'Shine spray',
        quantity: '1 bottle',
        cost_kes: 400,
        optional: true,
      },
    ],
    
    hair_requirements: {
      min_length: '2 inches',
      textures: ['4A', '4B', '4C', '3C'],
    },
    skill_level: 'intermediate',
    
    total_extensions_min_kes: 0,
    total_extensions_max_kes: 0,
    total_labor_min_kes: 1200,
    total_labor_max_kes: 2400,
    total_styling_products_kes: 1100,
    grand_total_min_kes: 2200,  // 0 + 1200 + 300 + 400
    grand_total_max_kes: 3900,  // 0 + 2400 + 1100
  },
  'faux-locs': {
    style_name: 'Faux Locs',
    complexity: 'advanced',
    time_min_hours: 8,
    time_max_hours: 12,
    
    hair_extensions: {
      type: 'Faux loc extensions + Braiding hair base',
      quantity_min: 11,  // 8 faux loc + 3 braiding hair
      quantity_max: 14,  // 10 faux loc + 4 braiding hair
      cost_per_pack_kes: 1350,  // Average of 1500 and 1200
      subtotal_min_kes: 14850,  // Approx (8×1500) + (3×1200)
      subtotal_max_kes: 19800,  // Approx (10×1500) + (4×1200)
    },
    
    labor: {
      base_rate_per_hour_kes: 700,  // Higher rate for advanced skill
      estimated_min_kes: 5600,  // 8 × 700
      estimated_max_kes: 8400,  // 12 × 700
    },
    
    styling_products: [
      {
        item: 'Edge control',
        quantity: '1 jar',
        cost_kes: 300,
        optional: false,
      },
      {
        item: 'Loc gel',
        quantity: '1 bottle',
        cost_kes: 600,
        optional: false,
      },
      {
        item: 'Shine spray',
        quantity: '1 bottle',
        cost_kes: 400,
        optional: true,
      },
    ],
    
    hair_requirements: {
      min_length: '3 inches',
      textures: ['4A', '4B', '4C'],
    },
    skill_level: 'advanced',
    
    total_extensions_min_kes: 14850,
    total_extensions_max_kes: 19800,
    total_labor_min_kes: 5600,
    total_labor_max_kes: 8400,
    total_styling_products_kes: 1300,
    grand_total_min_kes: 20750,  // 14850 + 5600 + 300 + 600
    grand_total_max_kes: 29500,  // 19800 + 8400 + 1300
  },
  'goddess-locs': {
    style_name: 'Goddess Locs',
    complexity: 'advanced',
    time_min_hours: 6,
    time_max_hours: 10,
    
    hair_extensions: {
      type: 'Goddess loc extensions + Braiding hair',
      quantity_min: 8,  // 6 goddess loc + 2 braiding hair
      quantity_max: 11, // 8 goddess loc + 3 braiding hair
      cost_per_pack_kes: 1650,  // Average of 1800 and 1200
      subtotal_min_kes: 13200,  // Approx (6×1800) + (2×1200)
      subtotal_max_kes: 18000,  // Approx (8×1800) + (3×1200)
    },
    
    labor: {
      base_rate_per_hour_kes: 700,
      estimated_min_kes: 4200,  // 6 × 700
      estimated_max_kes: 7000,  // 10 × 700
    },
    
    styling_products: [
      {
        item: 'Edge control',
        quantity: '1 jar',
        cost_kes: 300,
        optional: false,
      },
      {
        item: 'Mousse',
        quantity: '1 bottle',
        cost_kes: 550,
        optional: false,
      },
      {
        item: 'Shine spray',
        quantity: '1 bottle',
        cost_kes: 400,
        optional: true,
      },
    ],
    
    hair_requirements: {
      min_length: '3 inches',
      textures: ['4A', '4B', '4C'],
    },
    skill_level: 'advanced',
    
    total_extensions_min_kes: 13200,
    total_extensions_max_kes: 18000,
    total_labor_min_kes: 4200,
    total_labor_max_kes: 7000,
    total_styling_products_kes: 1250,
    grand_total_min_kes: 17850,  // 13200 + 4200 + 300 + 550
    grand_total_max_kes: 26250,  // 18000 + 7000 + 1250
  },
};

/**
 * Generate job specification from style slug
 * All calculations are pre-computed in templates
 */
export function generateJobSpec(styleSlug: string): JobSpec | null {
  const template = STYLE_TEMPLATES[styleSlug];
  if (!template) {
    console.warn(`No template found for style: ${styleSlug}`);
    return null;
  }

  return {
    style_slug: styleSlug,
    ...template,
  };
}

/**
 * Get all available style slugs
 */
export function getAvailableStyles(): string[] {
  return Object.keys(STYLE_TEMPLATES);
}

/**
 * Get style name from slug
 */
export function getStyleName(styleSlug: string): string {
  return STYLE_TEMPLATES[styleSlug]?.style_name || styleSlug;
}

/**
 * Match style slug to existing imageLibrary keys
 * Maps booking flow style names to template keys
 */
export function mapStyleToTemplateSlug(styleFromBooking: string): string {
  const mapping: Record<string, string> = {
    'knotless-braids': 'knotless-braids',
    'box-braids': 'box-braids',
    'two-strand-twists': 'two-strand-twists',
    'cornrows': 'cornrows',
    'faux-locs': 'faux-locs',
    'goddess-locs': 'goddess-locs',
    // Add more mappings as needed
  };
  return mapping[styleFromBooking] || styleFromBooking;
}


