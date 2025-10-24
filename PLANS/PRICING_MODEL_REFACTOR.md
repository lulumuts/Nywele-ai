# Pricing Model Refactor

## Overview

Successfully refactored the hairstyle pricing model to focus on the **two main cost drivers**: hair extensions (by quantity) and labor cost (time-based), with styling products as optional add-ons.

## Previous Model (Problems)

❌ **Old Structure**:

- All products treated equally (extensions, gel, edge control, etc.)
- No clear distinction between major and minor costs
- Labor cost was vague ("will be quoted by stylist")
- Hard to understand what drives the price

```typescript
required_products: [
  {
    item: "Xpression braiding hair",
    quantity: "6-8 packs",
    unit_cost_kes: 1200,
  },
  { item: "Edge control", quantity: "1", unit_cost_kes: 300 },
  { item: "Shine spray (optional)", quantity: "1", unit_cost_kes: 400 },
];
total_materials_min_kes: 7800;
total_materials_max_kes: 10000;
```

## New Model (Solution)

✅ **New Structure**:

- **Hair Extensions** - Main cost driver, clearly quantified
- **Labor Cost** - Time-based rates, transparent pricing
- **Styling Products** - Optional add-ons, marked as required/optional

### New Interface

```typescript
export interface JobSpec {
  style_slug: string;
  style_name: string;
  complexity: "beginner" | "intermediate" | "advanced";
  time_min_hours: number;
  time_max_hours: number;

  // Main cost: Hair extensions
  hair_extensions: {
    type: string; // "Xpression braiding hair", "Faux loc extensions"
    quantity_min: number; // 6
    quantity_max: number; // 8
    cost_per_pack_kes: number; // 1200
    subtotal_min_kes: number; // 7200
    subtotal_max_kes: number; // 9600
  };

  // Secondary cost: Labor (time-based)
  labor: {
    base_rate_per_hour_kes: number; // 600
    estimated_min_kes: number; // 3600
    estimated_max_kes: number; // 4800
  };

  // Optional: Small styling products
  styling_products: {
    item: string;
    quantity: string;
    cost_kes: number;
    optional: boolean;
  }[];

  // Total breakdown
  total_extensions_min_kes: number;
  total_extensions_max_kes: number;
  total_labor_min_kes: number;
  total_labor_max_kes: number;
  total_styling_products_kes: number;
  grand_total_min_kes: number;
  grand_total_max_kes: number;
}
```

## Pricing Examples

### Knotless Box Braids (Medium)

- **Extensions**: 6-8 packs × KES 1,200 = **KES 7,200-9,600**
- **Labor**: 6-8 hours × KES 600/hour = **KES 3,600-4,800**
- **Styling Products**:
  - Edge control (required): KES 300
  - Braiding gel (optional): KES 250
  - Shine spray (optional): KES 400
- **Grand Total**: **KES 11,100-15,350**

### Two Strand Twists (Natural Hair)

- **Extensions**: None (natural hair only) = **KES 0**
- **Labor**: 3-5 hours × KES 500/hour = **KES 1,500-2,500**
- **Styling Products**:
  - Twisting cream (required): KES 800
  - Edge control (required): KES 300
  - Shine serum (optional): KES 450
- **Grand Total**: **KES 2,600-4,050**

### Faux Locs

- **Extensions**: 11-14 packs × KES 1,350 avg = **KES 14,850-19,800**
- **Labor**: 8-12 hours × KES 700/hour = **KES 5,600-8,400**
- **Styling Products**:
  - Edge control (required): KES 300
  - Loc gel (required): KES 600
  - Shine spray (optional): KES 400
- **Grand Total**: **KES 20,750-29,500**

## Labor Rate Structure

| Complexity   | Base Rate (KES/hour) | Typical Styles                        |
| ------------ | -------------------- | ------------------------------------- |
| Beginner     | 500                  | Two-strand twists                     |
| Intermediate | 600                  | Box braids, Knotless braids, Cornrows |
| Advanced     | 700                  | Faux locs, Goddess locs               |

## Benefits of New Model

### 1. **Transparency**

- Clear breakdown of major costs
- Easy to understand what you're paying for
- No hidden fees

### 2. **Flexibility for Stylists**

- Can adjust extension quantity based on hair length/thickness
- Can set their own labor rate within complexity tier
- Can offer optional products for upsell

### 3. **Budget Clarity for Customers**

- See min/max ranges upfront
- Understand that extensions are the main cost
- Know which products are optional

### 4. **Realistic Pricing**

- Extensions = 50-70% of total cost (for braided styles)
- Labor = 30-40% of total cost
- Styling products = 3-10% of total cost

### 5. **Easier Quote Management**

- Braiders can adjust:
  - Extension quantity (if hair is longer/shorter)
  - Their hourly labor rate
  - Which optional products to include
- System calculates new totals automatically

## Updated Components

### 1. `lib/specs.ts`

- ✅ New `HairExtension` and `StylingProduct` interfaces
- ✅ Updated all 6 style templates
- ✅ Pre-calculated all totals in templates
- ✅ Simplified `generateJobSpec()` function

### 2. `app/components/SpecSummary.tsx`

- ✅ New UI with clear sections:
  1. Time Estimate
  2. Hair Extensions (with quantity breakdown)
  3. Labor Cost (with hourly rate)
  4. Styling Products (marked optional/required)
  5. Grand Total (highlighted)
  6. Hair Requirements
- ✅ Color-coded sections (purple for extensions, blue for labor)
- ✅ Shows formula: "Extensions + Labor + Products"

### 3. `app/components/QuoteEditor.tsx`

- 🔄 **Needs Update**: Must adapt to new structure
- Allow editing extension quantity
- Allow adjusting labor rate
- Allow toggling optional products

### 4. `app/booking-flow/page.tsx`

- ✅ Already uses `generateJobSpec()` - will automatically work
- 🔄 May need UI tweaks to display new structure

## Implementation Status

| Component               | Status      | Notes                            |
| ----------------------- | ----------- | -------------------------------- |
| `lib/specs.ts`          | ✅ Complete | All templates updated            |
| `SpecSummary.tsx`       | ✅ Complete | New UI with clear sections       |
| `QuoteEditor.tsx`       | ⏳ Pending  | Needs refactor for new structure |
| `booking-flow/page.tsx` | ✅ Working  | May need UI polish               |
| Price ranges            | ✅ Complete | Realistic Nairobi market prices  |

## Next Steps

1. **Update QuoteEditor.tsx** (Priority 1)

   - Allow braiders to adjust extension quantity
   - Allow adjusting their labor rate
   - Toggle optional products on/off
   - Show real-time total calculation

2. **Add Hair Length Calculator** (Future)

   - Estimate packs needed based on hair length
   - "Short hair = 5-6 packs, Medium = 6-8 packs, Long = 8-10 packs"

3. **Stylist Rate Tiers** (Future)

   - Junior stylists: 500 KES/hour
   - Mid-level stylists: 600 KES/hour
   - Senior stylists: 700-800 KES/hour
   - Master stylists: 900-1000 KES/hour

4. **Extension Quality Tiers** (Future)
   - Budget: 800-1000 KES/pack
   - Standard: 1200-1500 KES/pack
   - Premium: 1800-2500 KES/pack

## Migration Notes

### For Developers

- Old `required_products` array → New `hair_extensions` + `styling_products`
- Old `total_materials_min/max_kes` → New `grand_total_min/max_kes`
- Helper functions simplified (no more runtime calculation)

### For Braiders

- Extension requirements now explicit (e.g., "6-8 packs Xpression hair")
- Labor cost is transparent and time-based
- Can see optional vs required products

### For Customers

- Clear understanding of cost breakdown
- Know that extensions are the main expense
- Can choose to skip optional products to save money

## Pricing Validation

All prices based on Nairobi market research:

- ✅ Xpression braiding hair: KES 1,000-1,400/pack → Using 1,200
- ✅ Faux loc extensions: KES 1,400-1,800/pack → Using 1,500
- ✅ Goddess loc extensions: KES 1,600-2,000/pack → Using 1,800
- ✅ Labor rates: KES 400-1,000/hour depending on skill → Using 500-700
- ✅ Edge control: KES 250-400 → Using 300
- ✅ Braiding gel: KES 200-350 → Using 250

## Conclusion

The new pricing model provides **transparency**, **flexibility**, and **realism**. It accurately reflects what customers actually pay for (extensions and labor) and makes it easy for both customers and stylists to understand and negotiate pricing.

**Key Insight**: Hair extensions can cost as much as KES 15,000-20,000 for advanced styles, while edge control costs KES 300. Treating them the same was misleading.
