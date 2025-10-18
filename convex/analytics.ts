import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const trackRecommendation = mutation({
  args: {
    hairType: v.string(),
    goals: v.array(v.string()),
    porosity: v.optional(v.string()),
    concerns: v.optional(v.array(v.string())),
    desiredStyle: v.optional(v.string()),
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

export const getRecommendationStats = query({
  handler: async (ctx) => {
    const recommendations = await ctx.db.query("recommendations").collect();
    const styleGenerations = await ctx.db.query("styleGenerations").collect();
    
    return {
      totalRecommendations: recommendations.length,
      totalStyleGenerations: styleGenerations.length,
      successRate: styleGenerations.length > 0 
        ? (styleGenerations.filter(s => s.success).length / styleGenerations.length) * 100
        : 0,
      recentActivity: recommendations.slice(-10).reverse(),
    };
  },
});

