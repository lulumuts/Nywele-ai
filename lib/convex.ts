import { ConvexHttpClient } from "convex/browser";

// Initialize Convex client
// To activate: Run `npx convex dev` and add NEXT_PUBLIC_CONVEX_URL to .env.local
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;

export const convex = convexUrl
  ? new ConvexHttpClient(convexUrl)
  : null;

// Helper function to safely track events
export async function trackRecommendation(data: {
  hairType: string;
  goals: string[];
  currentStyle?: string;
  ethnicity: string;
  length: string;
}) {
  if (!convex) {
    console.log('[Convex] Not configured - skipping tracking');
    return;
  }

  try {
    await convex.mutation('analytics:trackRecommendation' as any, data);
    console.log('[Convex] Tracked recommendation');
  } catch (error) {
    console.error('[Convex] Failed to track recommendation:', error);
  }
}

export async function trackStyleGeneration(data: {
  hairType: string;
  style: string;
  ethnicity: string;
  length: string;
  vibe: string;
  success: boolean;
}) {
  if (!convex) {
    console.log('[Convex] Not configured - skipping tracking');
    return;
  }

  try {
    await convex.mutation('analytics:trackStyleGeneration' as any, data);
    console.log('[Convex] Tracked style generation');
  } catch (error) {
    console.error('[Convex] Failed to track style generation:', error);
  }
}

export async function trackEvent(eventType: string, metadata?: any) {
  if (!convex) {
    console.log('[Convex] Not configured - skipping tracking');
    return;
  }

  try {
    await convex.mutation('analytics:trackEvent' as any, { eventType, metadata });
    console.log('[Convex] Tracked event:', eventType);
  } catch (error) {
    console.error('[Convex] Failed to track event:', error);
  }
}

