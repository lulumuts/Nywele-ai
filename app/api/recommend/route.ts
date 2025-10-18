import { NextRequest, NextResponse } from 'next/server';
import { openai } from '@/lib/openai';
import { supabase } from '@/lib/supabase';
import { trackRecommendation } from '@/lib/convex';

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
  try {
    // Check if services are available
    if (!openai || !supabase) {
      return NextResponse.json(
        { error: 'Service configuration error' },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { hairType, goals, currentStyle, durationPreference } = body;

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

    // Build GPT-4 prompt
    const prompt = `You are an expert trichologist specializing in African hair care with 15 years of experience.

PROFILE:
- Hair Type: ${hairType}
- Current Style: ${currentStyle || 'None'}
- Goals: ${goals.join(', ')}
- Available Time: ${durationPreference || '30 minutes'}

AVAILABLE PRODUCTS:
${products?.map((p: Product) => `- ${p.brand} ${p.name}: ${p.description}`).join('\n')}

TASK:
Create a personalized hair care routine. Return your response in this EXACT JSON format:

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
      "reason": "Why this product works for their hair type and goals"
    }
  ],
  "stylistTip": "One expert tip for their specific hair type and goals"
}

IMPORTANT:
- Give 3-5 steps maximum
- Only recommend products from the available list
- Focus on their specific goals: ${goals.join(', ')}
- Keep instructions clear and actionable
- Consider hair type ${hairType} characteristics (porosity, curl pattern)`;

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

    // Track analytics with Convex (if configured)
    trackRecommendation({
      hairType,
      goals,
      currentStyle,
      ethnicity: body.ethnicity || 'Not specified',
      length: body.length || 'Not specified',
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