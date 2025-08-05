import { convexAuth, getAuthUserId } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
});

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }
    const user = await ctx.db.get(userId);
    if (!user) {
      return null;
    }
    return user;
  },
});

export const isAdmin = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    // Check if user has admin profile
    const userProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    return userProfile?.admin === true;
  },
});

export const checkAdminPassword = mutation({
  args: {
    adminPassword: v.string(),
  },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    // Check if the admin password matches the environment variable
    const expectedAdminPassword = process.env.ADMIN_PASSWORD;
    if (!expectedAdminPassword) {
      console.error("ADMIN_PASSWORD environment variable not set");
      return false;
    }
    return args.adminPassword === expectedAdminPassword;
  },
});

export const createAdminProfile = mutation({
  args: {
    adminPassword: v.string(),
  },
  returns: v.union(v.id("userProfiles"), v.null()),
  handler: async (ctx, args) => {
    // Check if the admin password matches the environment variable
    const expectedAdminPassword = process.env.ADMIN_PASSWORD;
    if (!expectedAdminPassword) {
      console.error("ADMIN_PASSWORD environment variable not set");
      return null;
    }

    if (args.adminPassword !== expectedAdminPassword) {
      return null;
    }

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    // Check if admin profile already exists
    const existingProfile = await ctx.db
      .query("userProfiles")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .unique();

    if (existingProfile) {
      return existingProfile._id;
    }

    // Create admin profile
    const profileId = await ctx.db.insert("userProfiles", {
      userId,
      admin: true,
    });

    return profileId;
  },
});
