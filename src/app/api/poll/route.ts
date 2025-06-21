/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextApiRequest, NextApiResponse } from "next";
import { convex } from "../../../lib/convex"; // Adjust path to your Convex client
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { pollId }: any = req.query as any 

  if (typeof pollId !== "string") {
    return res.status(400).json({ error: "Invalid pollId" });
  }

  try {
    const poll = await convex.query(api.polls.getPoll, { pollId: pollId as Id<"polls"> });
    if (!poll) {
      return res.status(404).json({ error: "Poll not found" });
    }
    res.status(200).json(poll);
  } catch (error) {
    console.error("Error fetching poll:", error);
    res.status(500).json({ error: "Internal server error" });
  }
}