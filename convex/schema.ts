import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  rsvps: defineTable({
    name: v.string(),
    email: v.string(),
    dietaryPreferences: v.array(v.string()),
    otherDietaryPreference: v.optional(v.string()),
    hasPlusOne: v.boolean(),
    plusOneName: v.optional(v.string()),
    plusOneEmail: v.optional(v.string()),
    plusOneDietaryPreferences: v.optional(v.array(v.string())),
    plusOneOtherDietaryPreference: v.optional(v.string()),
    userId: v.id("users"),
  }).index("by_userId", ["userId"]),
  
  // Custom users table to extend auth users with admin functionality
  userProfiles: defineTable({
    userId: v.id("users"),
    admin: v.boolean(),
  }).index("by_userId", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
