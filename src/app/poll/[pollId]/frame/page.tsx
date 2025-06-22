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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f0f4ff]">
        <p className="text-lg text-gray-600">Loading...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f0f4ff]">
        <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
          <h1 className="mb-2 text-center text-2xl font-bold text-[#5b21b6]">Fast Poll</h1>
          <p className="text-center text-gray-600">Error loading poll: {error || "Not found"}</p>
        </div>
      </div>
    );
  }

  const totalVotes = poll.totalVotes || 1;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-[#f0f4ff] p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-lg">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-xl font-bold text-[#5b21b6] sm:text-2xl">{poll.title.slice(0, 60)}</h1>
          <p className="mt-1 text-sm text-gray-600 sm:text-base">{poll.description.slice(0, 80)}</p>
          <p className="mt-1 text-sm font-bold text-[#5b21b6] sm:text-base">
            Total Votes: {totalVotes}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-3">
          {poll.options.slice(0, 4).map((option, index) => {
            const percentage = ((option.votes / totalVotes) * 100).toFixed(1);
            return (
              <div
                key={index}
                className="flex items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 p-3"
              >
                <div
                  className={`h-4 w-4 rounded-full border-2 border-[#5b21b6] ${
                    option.votes > 0 ? "bg-[#5b21b6]" : ""
                  }`}
                />
                <span className="flex-1 truncate text-sm sm:text-base">{option.text.slice(0, 30)}</span>
                <span className="text-sm font-bold text-[#5b21b6] sm:text-base">{percentage}%</span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="mt-4 text-center text-xs text-gray-600 sm:text-sm">
          Powered by Fast Poll
        </div>
      </div>
    </div>
  );
}