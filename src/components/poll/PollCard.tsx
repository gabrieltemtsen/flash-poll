import { useQuery } from "convex/react";
import Link from "next/link";
import { CheckCircle, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/Button";
import { ShareButton } from "../ui/Share";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";
import { APP_URL } from "~/lib/constants";

type PollOption = {
  id: string;
  text: string;
  votes: number;
};

export interface Poll {
  _id: Id<"polls">;
  title: string;
  description: string;
  options: PollOption[];
  totalVotes: number;
  creatorFid: string;
  createdAt: number;
}

interface PollCardProps {
  poll: Poll;
  userFid?: string | null;
  onVote?: (pollId: Id<"polls">, optionId: string) => void;
  isVoting?: boolean;
  showShareButton?: boolean;
}

export function PollCard({ poll, userFid, onVote, isVoting = false, showShareButton = false }: PollCardProps) {
  const voteStatus = useQuery(
    api.polls.hasVoted,
    userFid ? { pollId: poll._id, userFid } : "skip"
  );

  const castConfig = {
    text: `Check out this poll: ${poll.title} on Flash Poll by @gabedev.eth!`,
    embeds: [
      {
        path: `/poll/${poll._id}`,
        imageUrl: async () => `${APP_URL}/api/opengraph-image?pollId=${poll._id}`,
      },
    ],
  };

  const getPercentage = (votes: number, total: number): number =>
    total > 0 ? Math.round((votes / total) * 100) : 0;

  const showResults = voteStatus?.hasVoted || !onVote;

  return (
    <Card className="w-full max-w-2xl mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <Link href={`/poll/${poll._id}`}>
              <CardTitle className="text-xl font-bold text-gray-900 leading-tight hover:underline">
                {poll.title}
              </CardTitle>
            </Link>
            <p className="text-gray-600 mt-2 text-sm">{poll.description}</p>
          </div>
          <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-200 transition-colors shrink-0">
            <Users className="w-3 h-3 mr-1" />
            {poll.totalVotes.toLocaleString()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {poll.options.map((option, index) => {
          const percentage = getPercentage(option.votes, poll.totalVotes);
          const isUserVote = voteStatus?.userVote === option.id;

          return (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">{option.text}</span>
                {showResults && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      {option.votes.toLocaleString()} votes
                    </span>
                    <span className="text-sm font-semibold text-purple-600">
                      {percentage}%
                    </span>
                    {isUserVote && <CheckCircle className="w-4 h-4 text-green-500" />}
                  </div>
                )}
              </div>
              {showResults ? (
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ease-out ${
                        isUserVote
                          ? "bg-gradient-to-r from-green-400 to-green-500"
                          : "bg-gradient-to-r from-purple-400 to-purple-500"
                      }`}
                      style={{ width: `${percentage}%`, animationDelay: `${index * 100}ms` }}
                    />
                  </div>
                </div>
              ) : (
                <Button
                  onClick={() => onVote && onVote(poll._id, option.id)}
                  disabled={isVoting || !userFid}
                  className="w-full bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white border-0 h-12 rounded-xl font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isVoting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Voting...
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Vote for {option.text}
                    </div>
                  )}
                </Button>
              )}
            </div>
          );
        })}
        {voteStatus?.hasVoted && (
          <div className="mt-6 p-4 bg-green-50 rounded-xl border border-green-200">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Thank you for voting!</span>
            </div>
            <p className="text-sm text-green-600 mt-1">Your vote has been recorded. Results are updated in real-time.</p>
          </div>
        )}
        <div className="mt-4 flex gap-2">
          {onVote && (
            <ShareButton
              buttonText="Share Poll"
              cast={castConfig}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              isLoading={false}
            />
          )}
          {showShareButton && !onVote && (
            <ShareButton
              buttonText="Share Poll"
              cast={castConfig}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              isLoading={false}
            />
          )}
          {!onVote && (
            <Link href="/" className="flex-1">
              <Button className="w-full bg-gray-500 hover:bg-gray-600">Back to All Polls</Button>
            </Link>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
