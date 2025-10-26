import { NextRequest, NextResponse } from 'next/server';
import { generateHairCareRoutine, type HairCareProfile } from '@/lib/hairCare';
import { recommendProductsForRoutine } from '@/lib/products';
import { requireAuth } from '@/lib/apiAuth';

export async function POST(request: NextRequest) {
  // Check authentication
  const authError = await requireAuth(request);
  if (authError) return authError;

  try {
    const body = await request.json();

    // Validate required fields
    if (!body.hairAnalysis) {
      return NextResponse.json(
        { error: 'Hair analysis is required' },
        { status: 400 }
      );
    }

    // Convert string dates to Date objects if needed
    const profile: HairCareProfile = {
      hairAnalysis: body.hairAnalysis,
      currentStyle: body.currentStyle
        ? {
            name: body.currentStyle.name,
            installedDate: new Date(body.currentStyle.installedDate),
            maintenanceDue: new Date(body.currentStyle.maintenanceDue),
          }
        : undefined,
      goals: body.goals || [],
      concerns: body.concerns || [],
      lifestyle: body.lifestyle || {
        activity: 'moderate',
        climate: 'temperate',
        budget: { min: 1000, max: 5000 },
      },
      allergies: body.allergies || [],
    };

    // Generate routine
    const recommendation = generateHairCareRoutine(profile);

    // Generate product recommendations
    const productRecommendations = recommendProductsForRoutine(
      profile,
      recommendation,
      profile.lifestyle.budget
    );

    // Add products to recommendation
    recommendation.productRecommendations = {
      essential: productRecommendations.essential.map(p => ({
        id: p.product.id,
        name: p.product.name,
        brand: p.product.brand,
        category: p.product.category,
        purpose: p.purpose,
        benefits: p.product.benefits,
        howToUse: p.product.howToUse || '',
        frequency: p.routineStep || 'as needed',
        pricing: {
          amount: p.product.pricing.estimatedPrice,
          currency: p.product.pricing.currency,
          size: p.product.pricing.size,
          costPerUse: 0,
        },
        alternatives: p.alternatives?.map(alt => ({
          name: alt.name,
          brand: alt.brand,
          price: alt.pricing.estimatedPrice,
          quality: alt.quality,
        })) || [],
        whereToBuy: p.product.whereToFind?.map(w => w.retailer) || [],
        aiInsight: `Recommended for ${profile.hairAnalysis.type} hair`,
      })),
      optional: productRecommendations.optional.map(p => ({
        id: p.product.id,
        name: p.product.name,
        brand: p.product.brand,
        category: p.product.category,
        purpose: p.purpose,
        benefits: p.product.benefits,
        howToUse: p.product.howToUse || '',
        frequency: 'optional',
        pricing: {
          amount: p.product.pricing.estimatedPrice,
          currency: p.product.pricing.currency,
          size: p.product.pricing.size,
          costPerUse: 0,
        },
        alternatives: p.alternatives?.map(alt => ({
          name: alt.name,
          brand: alt.brand,
          price: alt.pricing.estimatedPrice,
          quality: alt.quality,
        })) || [],
        whereToBuy: p.product.whereToFind?.map(w => w.retailer) || [],
        aiInsight: `Good addition for extra care`,
      })),
      alternatives: [],
    };

    // Log for analytics (in production, save to database)
    console.log('💇 Hair care routine generated:', {
      routineId: recommendation.routineId,
      confidence: recommendation.confidence,
      hairType: profile.hairAnalysis.type,
      goals: profile.goals,
      productCount: productRecommendations.essential.length + productRecommendations.optional.length,
    });

    return NextResponse.json(recommendation);
  } catch (error) {
    console.error('Hair care routine generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate hair care routine' },
      { status: 500 }
    );
  }
}

