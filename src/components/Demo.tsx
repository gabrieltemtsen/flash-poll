/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, signOut } from "next-auth/react";
import sdk from "@farcaster/frame-sdk";
import { useAccount, useSendTransaction, useSignTypedData, useWaitForTransactionReceipt, useDisconnect, useConnect, useSwitchChain, useChainId } from "wagmi";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";
import { ShareButton } from "./ui/Share";
import { CheckCircle, Users, TrendingUp, Badge, Plus } from "lucide-react";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, degen, mainnet, optimism, unichain } from "wagmi/chains";
import { BaseError, UserRejectedRequestError } from "viem";
import { useMiniApp } from "@neynar/react";
import { APP_NAME, APP_URL } from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

export type Tab = "home" | "actions" | "context" | "wallet";

interface NeynarUser {
  fid: string;
  score: number;
}

export default function Demo({ title = "Flash Poll" }: { title?: string }) {
  const { isSDKLoaded, context, added, notificationDetails, actions } = useMiniApp();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sendNotificationResult, setSendNotificationResult] = useState("");
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null);
  const [isCreatePollOpen, setIsCreatePollOpen] = useState(false);
  const [pollForm, setPollForm] = useState({
    title: "",
    description: "",
    options: [{ text: "" }, { text: "" }],
  });
  const [createPollError, setCreatePollError] = useState<string | null>(null);
  const [sharedCast, setSharedCast] = useState<any | null>(null);
  const [isShareContext, setIsShareContext] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Convex queries and mutations
  const polls = useQuery(api.polls.getAllPolls, { limit: 10 }) || [];
  const addOrUpdateUser = useMutation(api.users.addOrUpdateUser);
  const voteMutation = useMutation(api.polls.vote);
  const createPollMutation = useMutation(api.polls.createPoll);
  const [votingStates, setVotingStates] = useState<Record<string, boolean>>({});

  // Register user with Convex when authenticated
  useEffect(() => {
    if (context?.user?.fid && isConnected && address) {
      addOrUpdateUser({
        fid: context.user.fid.toString(),
        address,
        username: context.user.username,
      }).catch((error) => console.error("Failed to register user:", error));
    }
  }, [context?.user?.fid, context?.user?.username, address, isConnected, addOrUpdateUser]);

  // Fetch Neynar user object
  useEffect(() => {
    const fetchNeynarUserObject = async () => {
      if (context?.user?.fid) {
        try {
          const response = await fetch(`/api/users?fids=${context.user.fid}`);
          const data = await response.json();
          if (data.users?.[0]) {
            setNeynarUser(data.users[0]);
          }
        } catch (error) {
          console.error("Failed to fetch Neynar user object:", error);
        }
      }
    };
    fetchNeynarUserObject();
  }, [context?.user?.fid]);

  // Handle shared casts
  useEffect(() => {
    const checkSharedCast = async () => {
      const context = await sdk.context;
      if (context?.location?.type === "cast_share") {
        setIsShareContext(true);
        setSharedCast(context.location.cast);
      }
    };
    checkSharedCast();
  }, []);

  // Wallet-related hooks
  const { sendTransaction, error: sendTxError, isError: isSendTxError, isPending: isSendTxPending } = useSendTransaction();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash as `0x${string}` });
  const { signTypedData, error: signTypedError, isError: isSignTypedError, isPending: isSignTypedPending } = useSignTypedData();
  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const { switchChain, error: switchChainError, isError: isSwitchChainError, isPending: isSwitchChainPending } = useSwitchChain();

  const nextChain = useMemo(() => {
    if (chainId === base.id) return optimism;
    else if (chainId === optimism.id) return degen;
    else if (chainId === degen.id) return mainnet;
    else if (chainId === mainnet.id) return unichain;
    else return base;
  }, [chainId]);

  const handleSwitchChain = useCallback(() => {
    switchChain({ chainId: nextChain.id });
  }, [switchChain, nextChain.id]);

  const sendNotification = useCallback(async () => {
    setSendNotificationResult("");
    if (!notificationDetails || !context) return;
    try {
      const response = await fetch("/api/send-notification", {
        method: "POST",
        mode: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fid: context.user.fid,
          notificationDetails,
        }),
      });
      if (response.status === 200) {
        setSendNotificationResult("Success");
      } else if (response.status === 429) {
        setSendNotificationResult("Rate limited");
      } else {
        const data = await response.text();
        setSendNotificationResult(`Error: ${data}`);
      }
    } catch (error) {
      setSendNotificationResult(`Error: ${error}`);
    }
  }, [context, notificationDetails]);

  const sendTx = useCallback(() => {
    sendTransaction(
      {
        to: "0x4bBFD120d9f352A0BEd7a014bd67913a2007a878",
        data: "0x9846cd9efc000023c0",
      },
      {
        onSuccess: (hash) => setTxHash(hash),
      }
    );
  }, [sendTransaction]);

  const signTyped = useCallback(() => {
    signTypedData({
      domain: { name: APP_NAME, version: "1", chainId },
      types: { Message: [{ name: "content", type: "string" }] },
      message: { content: `Hello from ${APP_NAME}!` },
      primaryType: "Message",
    });
  }, [chainId, signTypedData]);

  const toggleContext = useCallback(() => {
    setIsContextOpen((prev) => !prev);
  }, []);

  const handleVote = async (pollId: Id<"polls">, optionId: string) => {
    if (!context?.user?.fid) {
      setCreatePollError("Please sign in with Farcaster to vote");
      return;
    }
    setVotingStates((prev) => ({ ...prev, [pollId]: true }));
    try {
      await voteMutation({
        pollId,
        userFid: context.user.fid.toString(),
        optionId,
      });
    } catch (error: any) {
      console.error("Failed to vote:", error.message);
      setCreatePollError(error.message || "Failed to vote");
    } finally {
      setVotingStates((prev) => ({ ...prev, [pollId]: false }));
    }
  };

  const handleCreatePoll = async () => {
    if (!context?.user?.fid) {
      setCreatePollError("Please sign in with Farcaster to create a poll");
      return;
    }
    if (!pollForm.title || !pollForm.description) {
      setCreatePollError("Title and description are required");
      return;
    }
    const validOptions = pollForm.options.filter((opt) => opt.text.trim());
    if (validOptions.length < 2) {
      setCreatePollError("At least two valid options are required");
      return;
    }

    try {
      await createPollMutation({
        creatorFid: context.user.fid.toString(),
        title: pollForm.title,
        description: pollForm.description,
        options: validOptions.map((opt, index) => ({
          id: `option-${index}`,
          text: opt.text,
        })),
      });
      setPollForm({ title: "", description: "", options: [{ text: "" }, { text: "" }] });
      setIsCreatePollOpen(false);
      setCreatePollError(null);
    } catch (error: any) {
      console.error("Failed to create poll:", error.message);
      setCreatePollError(error.message || "Failed to create poll");
    }
  };

  const addOption = () => {
    setPollForm((prev) => ({
      ...prev,
      options: [...prev.options, { text: "" }],
    }));
  };

  const updateOption = (index: number, text: string) => {
    setPollForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === index ? { text } : opt)),
    }));
  };

  const removeOption = (index: number) => {
    if (pollForm.options.length > 2) {
      setPollForm((prev) => ({
        ...prev,
        options: prev.options.filter((_, i) => i !== index),
      }));
    }
  };

  const getPercentage = (votes: number, total: number): number => {
    return total > 0 ? Math.round((votes / total) * 100) : 0;
  };

  const PollCard = ({ poll }: { poll: any }) => {
    const userFid = context?.user?.fid?.toString();
    const voteStatus = useQuery(
      api.polls.hasVoted,
      userFid ? { pollId: poll._id, userFid } : "skip"
    );
    const isVoting = votingStates[poll._id] || false;

    const castConfig = {
      text: `Check out this poll: ${poll.title} on Flash Poll! @1 @2`,
      bestFriends: true,
      embeds: [
        {
          path: `/poll/${poll._id}`,
          imageUrl: async () => `${APP_URL}/api/opengraph-image?pollId=${poll._id}`,
        },
      ],
    };

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
          {poll.options.map((option: any, index: number) => {
            const percentage = getPercentage(option.votes, poll.totalVotes);
            const isUserVote = voteStatus?.userVote === option.id;

            return (
              <div key={option.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">
                    {option.text}
                  </span>
                  {voteStatus?.hasVoted && (
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
                  )}
                </div>
                {voteStatus?.hasVoted ? (
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
                ) : (
                  <Button
                    onClick={() => handleVote(poll._id, option.id)}
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
              <p className="text-sm text-green-600 mt-1">
                Your vote has been recorded. Results are updated in real-time.
              </p>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <ShareButton
              buttonText="Share Poll"
              cast={castConfig}
              className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              isLoading={false}
            />
            {!context?.user?.fid && (
              <Button
                onClick={() => setShareError("Please sign in with Farcaster to share")}
                className="hidden"
                tabIndex={-1}
                aria-hidden="true"
              >
                Hidden
              </Button>
            )}
            {shareError && (
              <p className="text-red-500 text-sm mt-2">{shareError}</p>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  // Handle shared cast context
  if (isShareContext && sharedCast) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <Card className="w-full max-w-md mx-auto bg-white/80 backdrop-blur-sm border-0 shadow-xl p-6">
          <CardHeader>
            <CardTitle>Shared Cast</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">
              Cast shared by @{sharedCast.author.username || "unknown"}
            </p>
            <p className="text-gray-600 mt-2">{sharedCast.text}</p>
            {sharedCast.embeds && sharedCast.embeds.length > 0 && (
              <p className="text-gray-500 mt-2">
                Embedded URL: <a href={sharedCast.embeds[0]} className="text-blue-600 underline">{sharedCast.embeds[0]}</a>
              </p>
            )}
            <Button
              onClick={() => {
                setIsShareContext(false);
                setSharedCast(null);
              }}
              className="mt-4 w-full bg-gray-500 hover:bg-gray-600"
            >
              Back to Polls
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="bg-white/70 backdrop-blur-md border-b border-purple-100 sticky top-0 z-10">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <p className="text-gray-600 mt-2 text-sm md:text-base">
              Share your opinion and see what others think
            </p>
            <div className="mt-4 flex gap-4 justify-center">
              <Button
                onClick={() => setIsCreatePollOpen(true)}
                disabled={!context?.user?.fid}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Poll
              </Button>
              {!context?.user?.fid && (
                <Button onClick={() => signIn("farcaster")}>
                  Sign In with Farcaster
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {polls.length > 0 ? (
            polls.map((poll) => <PollCard key={poll._id} poll={poll} />)
          ) : (
            <p className="text-center text-gray-500">No polls available.</p>
          )}
        </div>
      </div>
      <Dialog
        open={isCreatePollOpen}
        onOpenChange={(open) => {
          setIsCreatePollOpen(open);
          if (!open) setCreatePollError(null);
        }}
      >
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Create a New Poll</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Poll Title</Label>
              <Input
                id="title"
                value={pollForm.title}
                onChange={(e) => setPollForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Enter poll title"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={pollForm.description}
                onChange={(e) => setPollForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Enter poll description"
              />
            </div>
            {pollForm.options.map((option, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  value={option.text}
                  onChange={(e) => updateOption(index, e.target.value)}
                  placeholder={`Option ${index + 1}`}
                />
                {pollForm.options.length > 2 && (
                  <Button
                    onClick={() => removeOption(index)}
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
            <Button onClick={addOption} className="mt-2">
              Add Option
            </Button>
            {createPollError && (
              <p className="text-red-500 text-sm">{createPollError}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              onClick={() => {
                setIsCreatePollOpen(false);
                setCreatePollError(null);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleCreatePoll}>Create Poll</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <div className="bg-white/50 backdrop-blur-sm border-t border-purple-100 mt-16">
        <div className="container mx-auto px-4 py-8 text-center">
          <p className="text-gray-500 text-sm">Powered by Lisk</p>
        </div>
      </div>
    </div>
  );
}

const renderError = (error: Error | null) => {
  if (!error) return null;
  if (error instanceof BaseError) {
    const isUserRejection = error.walk((e) => e instanceof UserRejectedRequestError);
    if (isUserRejection) {
      return <div className="text-red-500 text-xs mt-1">Rejected by user.</div>;
    }
  }
  return <div className="text-red-500 text-xs mt-1">{error.message}</div>;
};