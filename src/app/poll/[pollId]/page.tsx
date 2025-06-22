/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useQuery } from "convex/react";
import { useMiniApp } from "@neynar/react";
import { useParams, notFound } from "next/navigation";
import { PollCard } from "~/components/poll/PollCard";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import Link from "next/link";

type PollPageParams = {
  pollId: string;
};



export default function PollPage() {
  const { pollId } = useParams<PollPageParams>();
  const { context } = useMiniApp();
  const userFid = context?.user?.fid?.toString();

  // Fetch poll and vote status using useQuery
  const poll = useQuery(api.polls.getPoll, pollId ? { pollId: pollId as Id<"polls"> } : "skip");

  // Defer notFound() to useEffect to avoid render-time side effects
  useEffect(() => {
    if (!pollId || (poll === null && poll !== undefined)) {
      console.error("Poll not found or invalid pollId:", pollId);
      notFound();
    }
  }, [pollId, poll]);

  // Handle loading state
  if (!pollId || poll === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading...</p>
      </div>
    );
  }

  // Poll is null (not found) or undefined (still loading), handled above
  if (!poll) {
    return null; // This won't be reached due to useEffect, but kept for type safety
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="bg-white/70 backdrop-blur-md border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <Link href="/">
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent cursor-pointer">
                Flash Poll
              </h1>
            </Link>
            <p className="text-gray-600 mt-2 text-sm md:text-base">Poll Results</p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <PollCard poll={poll} userFid={userFid} showShareButton />
      </div>
      <div className="bg-white/50 backdrop-blur-sm border-t border-purple-100 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm">Powered by Lisk</p>
        </div>
      </div>
    </div>
  );
}