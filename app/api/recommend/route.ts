import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { supabase } from '@/lib/supabase';
import { trackRecommendation } from '@/lib/analytics';
import { requireAuth } from '@/lib/apiAuth';

interface Product {
  id: string;
  name: string;
  brand: string;
  description: string;
  compatible_hair_types: string[];
  affiliate_link?: string;
  image_url?: string;
  price?: number;
}

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    // Check if services are available
    if (!openai || !supabase) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { hairType, goals, currentStyle, durationPreference, porosity, concerns, desiredStyle, budget } = body;

    // Validate input
    if (!hairType || !goals || goals.length === 0) {
      return NextResponse.json(
        { error: 'Hair type and goals are required' },
        { status: 400 }
      );
    }

    // Fetch relevant products from database
    const { data: products, error: dbError } = await supabase
      .from('products')
      .select('*')
      .contains('compatible_hair_types', [hairType])
      .limit(10);

    if (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { error: 'Failed to fetch products' },
        { status: 500 }
      );
    }

    // Build porosity-specific guidance
    const porosityGuidance: Record<string, string> = {
      'low': 'Low porosity hair needs lightweight products and heat for absorption. Avoid heavy oils that sit on the surface. Use clarifying treatments regularly to prevent buildup.',
      'normal': 'Normal porosity hair has balanced moisture retention. Most products work well. Focus on maintaining the natural moisture balance.',
      'high': 'High porosity hair absorbs quickly but loses moisture fast. Use heavy sealants, protein treatments, and the LOC/LCO method. Layer products to lock in moisture.',
      'unsure': 'Recommend balanced, versatile products suitable for various porosity levels.'
    };

    // Build budget-specific guidance
    const budgetGuidance: Record<string, string> = {
      'budget': 'Focus on affordable drugstore brands ($5-$15 per product). Recommend multi-use products and DIY alternatives. Suggest ways to stretch products longer. Typical monthly spend: $20-$40.',
      'mid-range': 'Balance quality and affordability with mid-tier brands ($15-$35 per product). Mix some drugstore staples with specialty products. Typical monthly spend: $40-$80.',
      'premium': 'Recommend high-end salon brands and specialty products ($35-$60+ per product). Focus on luxury ingredients and professional results. Typical monthly spend: $80-$150+.',
      'any': 'Provide 3 tiers: Budget-friendly options ($5-$15), mid-range alternatives ($15-$35), and premium choices ($35+). Let user choose based on budget.'
    };
    
    const budgetTier = budget || 'any';

    const concernsText = concerns?.length > 0 
      ? `- Main Concerns: ${concerns.join(', ')}` 
      : '';
    
    const styleText = desiredStyle 
      ? `- Desired Style: ${desiredStyle}` 
      : '';

    // Build GPT-4 prompt
    const prompt = `You are an expert trichologist specializing in African hair care with 15 years of experience.

PROFILE:
- Hair Type: ${hairType}
- Porosity: ${porosity || 'Not specified'}
- Current Style: ${currentStyle || 'None'}
${styleText}
- Goals: ${goals.join(', ')}
${concernsText}
- Available Time: ${durationPreference || '30 minutes'}
- Budget: ${budgetTier === 'any' ? 'Show all tiers' : budgetTier}

POROSITY-SPECIFIC GUIDANCE:
${porosityGuidance[porosity as string] || porosityGuidance['unsure']}

BUDGET GUIDANCE:
${budgetGuidance[budgetTier]}

AVAILABLE PRODUCTS:
${products?.map((p: Product) => `- ${p.brand} ${p.name}: ${p.description}`).join('\n')}

TASK:
Create a personalized hair care routine specifically optimized for ${porosity || 'balanced'} porosity hair and ${budgetTier} budget. Return your response in this EXACT JSON format:

{
  "routine": {
    "steps": [
      {
        "stepNumber": 1,
        "action": "Cleanse",
        "instructions": "Apply shampoo to wet hair...",
        "duration": "5 minutes",
        "productName": "Product name from list"
      }
    ],
    "totalTime": "30 minutes",
    "frequency": "Weekly"
  },
  "recommendedProducts": [
    {
      "name": "Product name",
      "brand": "Brand name",
      "reason": "Why this product works for their hair type, porosity, and goals"
    }
  ],
  "stylistTip": "One expert tip for their specific hair type, porosity, and goals"
}

IMPORTANT:
- Give 3-5 steps maximum
- Only recommend products from the available list
- Focus on their specific goals: ${goals.join(', ')}
- Tailor recommendations to ${porosity || 'balanced'} porosity characteristics
- Keep instructions clear and actionable
- Consider hair type ${hairType} characteristics (porosity, curl pattern)
- Address their main concerns: ${concerns?.join(', ') || 'general hair health'}`;

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert African hair care specialist. Always respond with valid JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    });

    const recommendation = JSON.parse(completion.choices[0].message.content || '{}');

    // Match recommended products with database products (for affiliate links)
    const enrichedProducts = recommendation.recommendedProducts?.map((recProd: any) => {
      const dbProduct = products?.find((p: Product) => 
        p.name.toLowerCase().includes(recProd.name.toLowerCase()) ||
        recProd.name.toLowerCase().includes(p.name.toLowerCase())
      );
      
      return {
        ...recProd,
        id: dbProduct?.id,
        affiliateLink: dbProduct?.affiliate_link || '#',
        imageUrl: dbProduct?.image_url,
        price: dbProduct?.price
      };
    }) || [];

    // Save recommendation to database
    const { error: saveError } = await supabase
      .from('recommendations')
      .insert({
        hair_type: hairType,
        goals: goals,
        routine: recommendation,
        products_recommended: enrichedProducts.map((p: any) => p.id).filter(Boolean)
      });

    if (saveError) {
      console.error('Failed to save recommendation:', saveError);
    }

    // Track analytics with Supabase
    trackRecommendation({
      hairType,
      goals,
      currentStyle,
      ethnicity: body.ethnicity || 'Not specified',
      length: body.length || 'Not specified',
      porosity: porosity || 'Not specified',
      concerns: concerns || [],
      desiredStyle: desiredStyle || 'Not specified',
    }).catch(err => console.error('Analytics tracking failed:', err));

    return NextResponse.json({
      success: true,
      data: {
        routine: recommendation.routine,
        products: enrichedProducts,
        stylistTip: recommendation.stylistTip
      }
    });

  } catch (error) {
    console.error('Recommendation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendation' },
      { status: 500 }
    );
  }
}