import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";

export const dynamic = "force-dynamic";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pollId = searchParams.get("pollId");

    if (!pollId) {
      return NextResponse.json({ error: "Invalid pollId" }, { status: 400 });
    }

    const poll = await convex.query(api.polls.getPoll, {
      pollId: pollId as Id<"polls">,
    });

    if (!poll) {
      return NextResponse.json({ error: "Poll not found" }, { status: 404 });
    }

    return NextResponse.json(poll);
  } catch (error) {
    console.error("Error fetching poll:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}