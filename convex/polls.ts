/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

export const createPoll = mutation({
  args: {
    creatorFid: v.string(),
    title: v.string(),
    description: v.string(),
    options: v.array(v.object({ id: v.string(), text: v.string() })),
  },
  handler: async (ctx, args) => {
    // Verify user exists
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("fid"), args.creatorFid))
      .first();
    if (!user) throw new Error("User not found");

    // Insert poll with initial vote counts of 0
    const pollId = await ctx.db.insert("polls", {
      creatorFid: args.creatorFid,
      title: args.title,
      description: args.description,
      options: args.options.map((opt) => ({ ...opt, votes: 0 })),
      totalVotes: 0,
      createdAt: Date.now(),
    });

    return pollId;
  },
});

export const vote = mutation({
  args: {
    pollId: v.id("polls"),
    userFid: v.string(),
    optionId: v.string(),
  },
  handler: async (ctx, args) => {
    // Verify poll exists
    const poll = await ctx.db.get(args.pollId);
    if (!poll) throw new Error("Poll not found");

    // Verify user exists
    const user = await ctx.db
      .query("users")
      .filter((q) => q.eq(q.field("fid"), args.userFid))
      .first();
    if (!user) throw new Error("User not found");

    // Verify option exists
    const option = poll.options.find((opt: any) => opt.id === args.optionId);
    if (!option) throw new Error("Invalid option");

    // Check if user has already voted
    const existingVote = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("pollId"), args.pollId))
      .filter((q) => q.eq(q.field("userFid"), args.userFid))
      .first();
    if (existingVote) throw new Error("User has already voted");

    // Record the vote
    await ctx.db.insert("votes", {
      pollId: args.pollId,
      userFid: args.userFid,
      optionId: args.optionId,
      votedAt: Date.now(),
    });

    // Update poll with new vote
    const updatedOptions = poll.options.map((opt: any) =>
      opt.id === args.optionId ? { ...opt, votes: opt.votes + 1 } : opt
    );
    await ctx.db.patch(args.pollId, {
      options: updatedOptions,
      totalVotes: poll.totalVotes + 1,
    });

    return { pollId: args.pollId, optionId: args.optionId };
  },
});

export const getPoll = query({
  args: { pollId: v.id("polls") },
  handler: async (ctx, args) => {
    const poll = await ctx.db.get(args.pollId);
    return poll;
  },
});

export const getPollsByCreator = query({
  args: { creatorFid: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("polls")
      .filter((q) => q.eq(q.field("creatorFid"), args.creatorFid))
      .order("desc")
      .collect();
  },
});

export const getAllPolls = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("polls")
      .order("desc")
      .take(args.limit ?? 50);
  },
});

export const hasVoted = query({
  args: { pollId: v.id("polls"), userFid: v.string() },
  handler: async (ctx, args) => {
    const vote = await ctx.db
      .query("votes")
      .filter((q) => q.eq(q.field("pollId"), args.pollId))
      .filter((q) => q.eq(q.field("userFid"), args.userFid))
      .first();
    return vote
      ? { hasVoted: true, userVote: vote.optionId }
      : { hasVoted: false };
  },
});