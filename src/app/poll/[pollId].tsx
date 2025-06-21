/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { useMiniApp } from "@neynar/react";
import { useRouter } from "next/router";
import { CheckCircle, Users, Badge } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/Button";
import Link from "next/link";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function PollPage() {
  const router = useRouter();
  const { pollId } = router.query; // Get pollId from URL
  const { context } = useMiniApp();
  const userFid = context?.user?.fid?.toString();
  console.log("User FID:", userFid);
  console.log("Poll ID from URL:", pollId);

  // Fetch poll and vote status
  const poll = useQuery(api.polls.getPoll, pollId ? { pollId: pollId as Id<"polls"> } : "skip");
  const voteStatus = useQuery(
    api.polls.hasVoted,
    userFid && pollId ? { pollId: pollId as Id<"polls">, userFid } : "skip"
  );

  const getPercentage = (votes: number, total: number): number => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  if (!pollId || !poll) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <p className="text-gray-500">Loading poll or poll not found...</p>
      </div>
    );
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
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Poll Results
            </p>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-xl font-bold text-gray-900 leading-tight">
                  {poll.title}
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm">{poll.description}</p>
              </div>
              <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors shrink-0">
                <Users className="w-3 h-3 mr-1" />
                {poll.totalVotes.toLocaleString()}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {poll.options.map((option: any, index: number) => {
              const percentage = getPercentage(option.votes, poll.totalVotes);
              const isUserVote = voteStatus?.userVote === option.id;

              return (
                <div key={option.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">
                      {option.text}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">
                        {option.votes.toLocaleString()} votes
                      </span>
                      <span className="text-sm font-semibold text-purple-600">
                        {percentage}%
                      </span>
                      {isUserVote && (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${
                          isUserVote
                            ? "bg-gradient-to-r from-green-400 to-green-500"
                            : "bg-gradient-to-r from-purple-400 to-purple-500"
                        }`}
                        style={{
                          width: `${percentage}%`,
                          animationDelay: `${index * 100}ms`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
            {voteStatus?.hasVoted && (
              <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center gap-2 text-green-700">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Thank you for voting!</span>
                </div>
                <p className="text-sm text-green-600 mt-1">
                  Your vote has been recorded. Results are updated in real-time.
                </p>
              </div>
            )}
            <div className="mt-4">
              <Link href="/">
                <Button className="w-full bg-gray-500 hover:bg-gray-600">
                  Back to All Polls
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="bg-white/50 backdrop-blur-sm border-t border-purple-100 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm">
            Powered by modern web technologies • Real-time results
          </p>
        </div>
      </div>
    </div>
  );
}