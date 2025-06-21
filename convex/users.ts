import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const addOrUpdateUser = mutation({
  args: {
    fid: v.string(),
    address: v.optional(v.string()),
    username: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("fid"), args.fid))
      .first();

    if (existingUser) {
      await ctx.db.patch(existingUser._id, {
        address: args.address ?? existingUser.address,
        username: args.username ?? existingUser.username,
        lastUpdated: Date.now(),
      });
      return existingUser._id;
    } else {
      return await ctx.db.insert("users", {
        fid: args.fid,
        address: args.address,
        username: args.username,
        lastUpdated: Date.now(),
      });
    }
  },
});

export const getUserByFid = query({
  args: { fid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("fid"), args.fid))
      .first();
  },
});

export const getUserByAddress = query({
  args: { address: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("address"), args.address))
      .first();
  },
});