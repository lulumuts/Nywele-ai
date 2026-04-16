export type IngredientStatus = 'good' | 'warn' | 'bad';

export interface Ingredient {
  name: string;
  status: IngredientStatus;
}

export interface ExplorerProduct {
  brand: string;
  name: string;
  type: string;
  price: string;
  compat: number;
  initials: string;
  imageSrc?: string;
  ingredients: Ingredient[];
  note: string;
}

export type TabKey = 'care' | 'moisture' | 'style' | 'tools';

// ─── Data ─────────────────────────────────────────────────────────────────────

export const PRODUCTS: Record<TabKey, ExplorerProduct[]> = {
  care: [
    {
      brand: 'SheaMoisture',
      name: 'Manuka Honey & Mafura Oil Intensive Hydration Shampoo',
      type: 'Clarifying shampoo',
      price: 'KES 2,400',
      compat: 97,
      initials: 'SM',
      imageSrc:
        'https://images.unsplash.com/photo-1535585209827-a15fcdbc4c2d?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Manuka honey', status: 'good' },
        { name: 'Mafura oil', status: 'good' },
        { name: 'Baobab protein', status: 'good' },
        { name: 'Sulfate-free', status: 'good' },
      ],
      note:
        'Sulfate-free formula preserves natural oils — critical for 4c hair which dries out quickly. Manuka honey is a humectant, drawing moisture into the cortex.',
    },
    {
      brand: 'Cantu',
      name: 'Sulfate-Free Cleansing Cream Shampoo',
      type: 'Gentle shampoo',
      price: 'KES 1,500',
      compat: 91,
      initials: 'CA',
      imageSrc:
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Shea butter', status: 'good' },
        { name: 'Sulfate-free', status: 'good' },
        { name: 'Mineral oil', status: 'warn' },
      ],
      note:
        'Good budget-friendly option. Contains mineral oil which can cause buildup over time — clarify every 4–6 weeks if using regularly.',
    },
    {
      brand: 'African Pride',
      name: 'Black Castor Miracle Strengthen & Restore Shampoo',
      type: 'Strengthening shampoo',
      price: 'KES 1,200',
      compat: 83,
      initials: 'AP',
      imageSrc:
        'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Jamaican black castor oil', status: 'good' },
        { name: 'Ammonium lauryl sulfate', status: 'bad' },
        { name: 'Peppermint oil', status: 'good' },
      ],
      note:
        'Contains sulfates — not ideal for regular washing on 4c hair. Reserve for monthly clarifying sessions or post-scalp treatment rinse.',
    },
  ],
  moisture: [
    {
      brand: 'SheaMoisture',
      name: '100% Extra Virgin Coconut Oil Daily Hydration Masque',
      type: 'Deep conditioning treatment',
      price: 'KES 2,200',
      compat: 96,
      initials: 'SM',
      imageSrc:
        'https://images.unsplash.com/photo-1571781926291-c477ebfd024b?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Coconut oil', status: 'good' },
        { name: 'Shea butter', status: 'good' },
        { name: 'Silk protein', status: 'good' },
        { name: 'Niacinamide', status: 'good' },
      ],
      note:
        'Trichologist pick for 4c: protein-moisture balance is well-calibrated. Use under a heat cap for 30 mins to maximise penetration into tightly coiled strands.',
    },
    {
      brand: 'Sunny Isle',
      name: 'Jamaican Black Castor Oil — Extra Dark',
      type: 'Scalp & growth oil',
      price: 'KES 1,800',
      compat: 94,
      initials: 'SI',
      imageSrc:
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Ricinoleic acid', status: 'good' },
        { name: 'Omega-9', status: 'good' },
        { name: '100% pure', status: 'good' },
      ],
      note:
        'High ricinoleic acid content stimulates scalp circulation and strengthens the hair shaft. Best applied to the scalp 2–3x per week, not the length (too heavy for 4c coils).',
    },
    {
      brand: 'Natural Blends Kenya',
      name: 'Lightweight Hair Oil Blend',
      type: 'Sealing oil',
      price: 'KES 1,200',
      compat: 89,
      initials: 'NB',
      imageSrc:
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Argan oil', status: 'good' },
        { name: 'Marula oil', status: 'good' },
        { name: 'Jojoba oil', status: 'good' },
      ],
      note:
        'Local Kenya formulation. Lightweight oils like marula and jojoba closely mimic the hair\'s natural sebum — excellent for sealing after the LOC method on 4c hair.',
    },
    {
      brand: 'Aunt Jackie\'s',
      name: 'Don\'t Shrink Flaxseed Leave-In Defining Crème',
      type: 'Leave-in conditioner',
      price: 'KES 1,600',
      compat: 88,
      initials: 'AJ',
      imageSrc:
        'https://images.unsplash.com/photo-1556228578-8d97aa54cd9d?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Flaxseed extract', status: 'good' },
        { name: 'Shea butter', status: 'good' },
        { name: 'Hydrolyzed keratin', status: 'good' },
        { name: 'Glycerin', status: 'warn' },
      ],
      note:
        'Glycerin is a double-edged ingredient in humid climates like Nairobi — it pulls moisture from the air but can cause frizz and reversion. Works well in dry season.',
    },
  ],
  style: [
    {
      brand: 'Camille Rose',
      name: 'Curl Maker Whipped Marshmallow',
      type: 'Curl defining cream',
      price: 'KES 2,000',
      compat: 93,
      initials: 'CR',
      imageSrc:
        'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Marshmallow root', status: 'good' },
        { name: 'Honey', status: 'good' },
        { name: 'Agave nectar', status: 'good' },
        { name: 'Alcohol-free', status: 'good' },
      ],
      note:
        'Marshmallow root is a natural slip agent that reduces breakage during styling — ideal for detangling 4c coils. Alcohol-free formula won\'t strip moisture during diffusing or air drying.',
    },
    {
      brand: 'Eco Styler',
      name: 'Olive Oil Styling Gel',
      type: 'Hold gel',
      price: 'KES 1,200',
      compat: 79,
      initials: 'ES',
      imageSrc:
        'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Olive oil', status: 'good' },
        { name: 'Carbomer', status: 'warn' },
        { name: 'Triethanolamine', status: 'warn' },
      ],
      note:
        'Popular for edge control and wash-and-go styles. Carbomer can dry out the scalp with heavy use — mix with a butter or cream styler rather than applying alone to 4c hair.',
    },
    {
      brand: 'Got2B',
      name: 'Glued Spiking Gel',
      type: 'Strong-hold gel',
      price: 'KES 800',
      compat: 42,
      initials: 'G2',
      imageSrc:
        'https://images.unsplash.com/photo-1556228578-8d97aa54cd9d?auto=format&fit=crop&w=400&q=80',
      ingredients: [
        { name: 'Alcohol denat.', status: 'bad' },
        { name: 'PVP', status: 'warn' },
        { name: 'Panthenol', status: 'good' },
      ],
      note:
        'Not recommended for regular use on 4c hair. High alcohol content causes significant moisture loss and brittleness. Suitable for slicked styles on protective looks — not daily.',
    },
  ],
  tools: [
    {
      brand: 'Felicia Leatherwood',
      name: 'Detangler Brush',
      type: 'Wet detangling brush',
      price: 'KES 2,200',
      compat: 95,
      initials: 'FL',
      imageSrc:
        'https://images.unsplash.com/photo-1583884098485-8e9a6ee00eb3?auto=format&fit=crop&w=400&q=80',
      ingredients: [],
      note:
        'Trichologist-recommended for 4c and 4b. Flexible bristles mimic finger detangling and significantly reduce single-strand knots compared to combs on tightly coiled hair.',
    },
    {
      brand: 'Denman',
      name: 'D3 Medium Styling Brush',
      type: 'Detangling brush',
      price: 'KES 1,800',
      compat: 90,
      initials: 'DN',
      imageSrc:
        'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=400&q=80',
      ingredients: [],
      note:
        'Nylon pin spacing is ideal for 4c — sections the curl without pulling from the root. Always detangle from tip to root, section by section, on wet conditioned hair.',
    },
    {
      brand: 'African Pride',
      name: 'Satin Bonnet — Adjustable',
      type: 'Protective sleep cap',
      price: 'KES 500',
      compat: 99,
      initials: 'AP',
      imageSrc:
        'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?auto=format&fit=crop&w=400&q=80',
      ingredients: [],
      note:
        'Non-negotiable for 4c hair. Cotton pillowcases cause 3–5x more friction than satin. A satin bonnet retains overnight moisture and prevents the mechanical breakage that causes length retention failure.',
    },
    {
      brand: 'GranNaturals',
      name: 'Wide Tooth Comb',
      type: 'Detangling comb',
      price: 'KES 600',
      compat: 85,
      initials: 'GN',
      imageSrc:
        'https://images.unsplash.com/photo-1598457111964-47e0db313e33?auto=format&fit=crop&w=400&q=80',
      ingredients: [],
      note:
        'Seamless wide-tooth comb reduces snags compared to moulded plastic combs. Use only on wet hair loaded with conditioner — never dry combing on 4c coils.',
    },
  ],
};

export const TABS: { key: TabKey; label: string }[] = [
  { key: 'care', label: 'Cleanse & Care' },
  { key: 'moisture', label: 'Moisture' },
  { key: 'style', label: 'Style & Hold' },
  { key: 'tools', label: 'Tools' },
];

/** Same shape as dashboard "Your Recommended Products" cards */
export type ExplorerCarouselProduct = {
  brand: string;
  name: string;
  purpose: string;
  imageUrl: string | null;
  pricing?: { currency: string; amount: number };
};

/** Parse strings like "KES 2,400" */
export function parseExplorerPrice(price: string): { currency: string; amount: number } | undefined {
  const m = price.trim().match(/^([A-Z]{3})\s+([\d,]+(?:\.\d+)?)/);
  if (!m) return undefined;
  return { currency: m[1], amount: Number(m[2].replace(/,/g, '')) };
}

/** First `count` products from a Product Compatibility tab (same catalog as /products). */
export function explorerProductsToCarousel(tab: TabKey, count: number): ExplorerCarouselProduct[] {
  const list = PRODUCTS[tab] ?? [];
  return list.slice(0, count).map((p) => ({
    brand: p.brand,
    name: p.name,
    purpose: (p.note.trim() || p.name).trim(),
    imageUrl: p.imageSrc ?? null,
    pricing: parseExplorerPrice(p.price),
  }));
}
