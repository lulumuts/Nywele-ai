import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recommendations: defineTable({
    hairType: v.string(),
    goals: v.array(v.string()),
    currentStyle: v.optional(v.string()),
    ethnicity: v.string(),
    length: v.string(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  styleGenerations: defineTable({
    hairType: v.string(),
    style: v.string(),
    ethnicity: v.string(),
    length: v.string(),
    vibe: v.string(),
    success: v.boolean(),
    timestamp: v.number(),
  }).index("by_timestamp", ["timestamp"]),

  analytics: defineTable({
    eventType: v.string(), // "recommendation", "style_view", "product_click"
    metadata: v.optional(v.any()),
    timestamp: v.number(),
  }).index("by_event_type", ["eventType"]),
});

