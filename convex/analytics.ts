import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const trackRecommendation = mutation({
  args: {
    hairType: v.string(),
    goals: v.array(v.string()),
    currentStyle: v.optional(v.string()),
    ethnicity: v.string(),
    length: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("recommendations", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const trackStyleGeneration = mutation({
  args: {
    hairType: v.string(),
    style: v.string(),
    ethnicity: v.string(),
    length: v.string(),
    vibe: v.string(),
    success: v.boolean(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("styleGenerations", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const trackEvent = mutation({
  args: {
    eventType: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("analytics", {
      ...args,
      timestamp: Date.now(),
    });
  },
});

export const getRecentRecommendations = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit ?? 10;
    return await ctx.db
      .query("recommendations")
      .order("desc")
      .take(limit);
  },
});

export const getAnalyticsSummary = query({
  handler: async (ctx) => {
    const recommendations = await ctx.db.query("recommendations").collect();
    const styleGenerations = await ctx.db.query("styleGenerations").collect();
    const events = await ctx.db.query("analytics").collect();

    return {
      totalRecommendations: recommendations.length,
      totalStyleGenerations: styleGenerations.length,
      totalEvents: events.length,
      successfulGenerations: styleGenerations.filter((s) => s.success).length,
    };
  },
});

