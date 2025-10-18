import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  recommendations: defineTable({
    hairType: v.string(),
    goals: v.array(v.string()),
    porosity: v.optional(v.string()),
    concerns: v.optional(v.array(v.string())),
    desiredStyle: v.optional(v.string()),
    ethnicity: v.string(),
    length: v.string(),
    timestamp: v.number(),
  }),
  
  styleGenerations: defineTable({
    hairType: v.string(),
    style: v.string(),
    ethnicity: v.string(),
    length: v.string(),
    vibe: v.string(),
    success: v.boolean(),
    timestamp: v.number(),
  }),
});

