import { supabase } from './supabase';

// Type for analytics events from Supabase
interface AnalyticsEvent {
  id: string;
  event_type: string;
  hair_type?: string;
  porosity?: string;
  concerns?: string[];
  style?: string;
  success?: boolean;
  product_name?: string;
  salon_name?: string;
  metadata?: any;
  created_at: string;
}

// Helper function to safely track recommendation events
export async function trackRecommendation(data: {
  hairType: string;
  goals: string[];
  currentStyle?: string;
  ethnicity: string;
  length: string;
  porosity?: string;
  concerns?: string[];
  desiredStyle?: string;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'recommendation',
        hair_type: data.hairType,
        porosity: data.porosity,
        concerns: data.concerns,
        style: data.desiredStyle,
        metadata: {
          goals: data.goals,
          currentStyle: data.currentStyle,
          ethnicity: data.ethnicity,
          length: data.length,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track recommendation:', error);
    } else {
      console.log('[Analytics] ✅ Tracked recommendation');
    }
  } catch (error) {
    console.error('[Analytics] Failed to track recommendation:', error);
  }
}

// Helper function to safely track style generation events
export async function trackStyleGeneration(data: {
  hairType: string;
  style: string;
  ethnicity: string;
  length: string;
  vibe: string;
  success: boolean;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'style_generation',
        hair_type: data.hairType,
        style: data.style,
        success: data.success,
        metadata: {
          ethnicity: data.ethnicity,
          length: data.length,
          vibe: data.vibe,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track style generation:', error);
    } else {
      console.log(`[Analytics] ✅ Tracked style generation (${data.success ? 'AI' : 'fallback'})`);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track style generation:', error);
  }
}

// Track product clicks
export async function trackProductClick(data: {
  productName: string;
  brand?: string;
  hairType?: string;
  price?: number;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'product_click',
        product_name: data.productName,
        hair_type: data.hairType,
        metadata: {
          brand: data.brand,
          price: data.price,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track product click:', error);
    } else {
      console.log('[Analytics] ✅ Tracked product click:', data.productName);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track product click:', error);
  }
}

// Track salon views (for future use)
export async function trackSalonView(data: {
  salonName: string;
  location?: string;
  services?: string[];
  hairType?: string;
}) {
  if (!supabase) {
    console.log('[Analytics] Supabase not configured - skipping tracking');
    return;
  }

  try {
    const { error } = await supabase
      .from('analytics_events')
      .insert({
        event_type: 'salon_view',
        salon_name: data.salonName,
        hair_type: data.hairType,
        metadata: {
          location: data.location,
          services: data.services,
        }
      });

    if (error) {
      console.error('[Analytics] Failed to track salon view:', error);
    } else {
      console.log('[Analytics] ✅ Tracked salon view:', data.salonName);
    }
  } catch (error) {
    console.error('[Analytics] Failed to track salon view:', error);
  }
}

// Get analytics stats
export async function getAnalyticsStats() {
  if (!supabase) {
    return null;
  }

  try {
    const { data: events, error } = await supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Analytics] Failed to fetch stats:', error);
      return null;
    }

    const recommendations = events?.filter((e: AnalyticsEvent) => e.event_type === 'recommendation') || [];
    const styleGenerations = events?.filter((e: AnalyticsEvent) => e.event_type === 'style_generation') || [];
    const productClicks = events?.filter((e: AnalyticsEvent) => e.event_type === 'product_click') || [];
    const salonViews = events?.filter((e: AnalyticsEvent) => e.event_type === 'salon_view') || [];
    const successfulAI = styleGenerations.filter((e: AnalyticsEvent) => e.success === true);

    return {
      totalRecommendations: recommendations.length,
      totalStyleGenerations: styleGenerations.length,
      totalProductClicks: productClicks.length,
      totalSalonViews: salonViews.length,
      aiSuccessRate: styleGenerations.length > 0 
        ? Math.round((successfulAI.length / styleGenerations.length) * 100)
        : 0,
      recentActivity: events?.slice(0, 10) || [],
      popularHairTypes: getPopularItems(recommendations, 'hair_type'),
      popularStyles: getPopularItems(styleGenerations, 'style'),
      popularProducts: getPopularItems(productClicks, 'product_name'),
      popularSalons: getPopularItems(salonViews, 'salon_name'),
    };
  } catch (error) {
    console.error('[Analytics] Failed to fetch stats:', error);
    return null;
  }
}

// Helper to get popular items from events
function getPopularItems(events: any[], field: string) {
  const counts: Record<string, number> = {};
  
  events.forEach(event => {
    const value = event[field];
    if (value) {
      counts[value] = (counts[value] || 0) + 1;
    }
  });

  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([name, count]) => ({ name, count }));
}

