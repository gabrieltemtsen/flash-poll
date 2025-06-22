"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface PollOption {
  text: string;
  votes: number;
}

interface Poll {
  title: string;
  description: string;
  totalVotes: number;
  options: PollOption[];
}

export default function PollFrame() {
  const { pollId } = useParams<{ pollId: string }>();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchPoll() {
      try {
        const response = await fetch(`/api/poll?pollId=${encodeURIComponent(pollId)}`);
        if (!response.ok) throw new Error("Poll not found");
        const data = await response.json();
        setPoll(data);
      } catch (err) {
        setError((err as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchPoll();
  }, [pollId]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f0f9ff]">
        <div className="flex items-center space-x-2">
          <div className="h-4 w-4 animate-pulse rounded-full bg-[#5b21b6]" />
          <p className="text-lg text-gray-600">Loading poll...</p>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f0f9ff]">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-center text-2xl font-bold text-[#5b21b6]">Fast Poll</h1>
          <p className="text-center text-gray-600">Error loading poll: {error || "Not found"}</p>
        </div>
      </div>
    );
  }

  const totalVotes = poll.totalVotes || 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f0f9ff] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-xl font-bold text-[#5b21b6] sm:text-2xl">
            {poll.title.slice(0, 60)}
          </h1>
          <p className="mt-2 text-sm text-gray-600 sm:text-base">
            {poll.description.slice(0, 80)}
          </p>
          <div className="mt-3 text-sm font-medium text-[#7c3aed]">
            {totalVotes} {totalVotes === 1 ? "vote" : "votes"}
          </div>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {poll.options.slice(0, 4).map((option, index) => {
            const percentage = Math.round((option.votes / totalVotes) * 100);
            return (
              <div key={index} className="group">
                <div className="mb-1 flex items-center justify-between px-1">
                  <span className="truncate text-sm font-medium text-gray-800 sm:text-base">
                    {option.text.slice(0, 30)}
                  </span>
                  <span className="text-sm font-semibold text-[#5b21b6]">
                    {percentage}%
                  </span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-[#5b21b6] transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Powered by <span className="font-medium text-[#5b21b6]">Fast Poll</span>
        </div>
      </div>
    </div>
  );
}