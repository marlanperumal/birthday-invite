import { mutation, query, QueryCtx } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { Id } from "./_generated/dataModel";

export const submitRsvp = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    dietaryPreferences: v.array(v.string()),
    otherDietaryPreference: v.optional(v.string()),
    hasPlusOne: v.boolean(),
    plusOneName: v.optional(v.string()),
    plusOneEmail: v.optional(v.string()),
    plusOneDietaryPreferences: v.optional(v.array(v.string())),
    plusOneOtherDietaryPreference: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("User not authenticated");
    }

    // Check if user has already RSVP'd
    const existingRsvp = await ctx.db
      .query("rsvps")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingRsvp) {
      // Update existing RSVP
      await ctx.db.patch(existingRsvp._id, {
        name: args.name,
        email: args.email,
        dietaryPreferences: args.dietaryPreferences,
        otherDietaryPreference: args.otherDietaryPreference,
        hasPlusOne: args.hasPlusOne,
        plusOneName: args.hasPlusOne ? args.plusOneName : undefined,
        plusOneEmail: args.hasPlusOne ? args.plusOneEmail : undefined,
        plusOneDietaryPreferences: args.hasPlusOne
          ? args.plusOneDietaryPreferences
          : undefined,
        plusOneOtherDietaryPreference: args.hasPlusOne
          ? args.plusOneOtherDietaryPreference
          : undefined,
      });
      return existingRsvp._id;
    } else {
      // Insert new RSVP
      const rsvpId = await ctx.db.insert("rsvps", {
        userId,
        name: args.name,
        email: args.email,
        dietaryPreferences: args.dietaryPreferences,
        otherDietaryPreference: args.otherDietaryPreference,
        hasPlusOne: args.hasPlusOne,
        plusOneName: args.hasPlusOne ? args.plusOneName : undefined,
        plusOneEmail: args.hasPlusOne ? args.plusOneEmail : undefined,
        plusOneDietaryPreferences: args.hasPlusOne
          ? args.plusOneDietaryPreferences
          : undefined,
        plusOneOtherDietaryPreference: args.hasPlusOne
          ? args.plusOneOtherDietaryPreference
          : undefined,
      });
      return rsvpId;
    }
  },
});

export const getMyRsvp = query({
  args: {},
  handler: async (ctx: QueryCtx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    return await ctx.db
      .query("rsvps")
      .withIndex("by_userId", (q: any) => q.eq("userId", userId as Id<"users">))
      .unique();
  },
});

export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("rsvps").collect();
  },
});
