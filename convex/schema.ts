// convex/schema.ts
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    fid: v.string(), // Farcaster ID
    address: v.optional(v.string()), // Connected wallet address
    username: v.optional(v.string()), // Farcaster username (optional)
    lastUpdated: v.number(), // Timestamp for last update
  }).index("by_fid", ["fid"]).index("by_address", ["address"]),

  polls: defineTable({
    creatorFid: v.string(), // FID of the poll creator
    title: v.string(), // Poll title
    description: v.string(), // Poll description
    options: v.array(
      v.object({
        id: v.string(), // Unique option ID
        text: v.string(), // Option text
        votes: v.number(), // Number of votes for this option
      })
    ),
    totalVotes: v.number(), // Total votes across all options
    createdAt: v.number(), // Timestamp for poll creation
  }).index("by_creatorFid", ["creatorFid"]),

  votes: defineTable({
    pollId: v.id("polls"), // Reference to the poll
    userFid: v.string(), // FID of the voter
    optionId: v.string(), // ID of the chosen option
    votedAt: v.number(), // Timestamp of the vote
  }).index("by_pollId_userFid", ["pollId", "userFid"]),
});