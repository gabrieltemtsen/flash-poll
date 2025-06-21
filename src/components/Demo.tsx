/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { signIn, signOut, getCsrfToken } from "next-auth/react";
import sdk, { SignIn as SignInCore } from "@farcaster/frame-sdk";
import {
  useAccount,
  useSendTransaction,
  useSignTypedData,
  useWaitForTransactionReceipt,
  useDisconnect,
  useConnect,
  useSwitchChain,
  useChainId,
} from "wagmi";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api"; // Adjust path to your generated API
import { Id } from "../../convex/_generated/dataModel"; // Adjust path

import { ShareButton } from "./ui/Share";
import { CheckCircle, Users, TrendingUp, Badge } from "lucide-react";
import { config } from "~/components/providers/WagmiProvider";
import { Button } from "~/components/ui/Button";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, degen, mainnet, optimism, unichain } from "wagmi/chains";
import { BaseError, UserRejectedRequestError } from "viem";
import { useSession } from "next-auth/react";
import { useMiniApp } from "@neynar/react";
import { Header } from "~/components/ui/Header";
import { Footer } from "~/components/ui/Footer";
import { USE_WALLET, APP_NAME } from "~/lib/constants";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";

export type Tab = "home" | "actions" | "context" | "wallet";

interface NeynarUser {
  fid: any;
  score: number;
}

export default function Demo({ title = "Flash Poll" }: { title?: string }) {
  const {
    isSDKLoaded,
    context,
    added,
    notificationDetails,
    actions,
  } = useMiniApp();
  const [isContextOpen, setIsContextOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [txHash, setTxHash] = useState<string | null>(null);
  const [sendNotificationResult, setSendNotificationResult] = useState("");
  const [copied, setCopied] = useState(false);
  const [neynarUser, setNeynarUser] = useState<NeynarUser | null>(null);

  const { address, isConnected } = useAccount();
  const chainId = useChainId();

  // Convex queries and mutations
  const polls = useQuery(api.polls.getAllPolls, { limit: 10 }) || [];
  const addOrUpdateUser = useMutation(api.users.addOrUpdateUser);
  const voteMutation = useMutation(api.polls.vote);
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
  }, [context?.user?.fid, address, isConnected, addOrUpdateUser]);

  // Fetch Neynar user object (retained for later use)
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

  // Wallet-related hooks (retained for later use)
  const {
    sendTransaction,
    error: sendTxError,
    isError: isSendTxError,
    isPending: isSendTxPending,
  } = useSendTransaction();

  const { isLoading: isConfirming, isSuccess: isConfirmed } =
    useWaitForTransactionReceipt({
      hash: txHash as `0x${string}`,
    });

  const {
    signTypedData,
    error: signTypedError,
    isError: isSignTypedError,
    isPending: isSignTypedPending,
  } = useSignTypedData();

  const { disconnect } = useDisconnect();
  const { connect, connectors } = useConnect();
  const {
    switchChain,
    error: switchChainError,
    isError: isSwitchChainError,
    isPending: isSwitchChainPending,
  } = useSwitchChain();

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
      console.error("User not authenticated");
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
    } finally {
      setVotingStates((prev) => ({ ...prev, [pollId]: false }));
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
        </CardContent>
      </Card>
    );
  };

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
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
            <SignIn />
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

function SignIn() {
  const [signingIn, setSigningIn] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [signInResult, setSignInResult] = useState<SignInCore.SignInResult>();
  const [signInFailure, setSignInFailure] = useState<string>();
  // Extend session user type to include optional image and name
  interface SessionUser {
    fid: number;
    image?: string;
    name?: string;
    [key: string]: any;
  }
  interface SessionData {
    user?: SessionUser;
    [key: string]: any;
  }
  const { data: session, status } = useSession() as { data: SessionData; status: string };

  const getNonce = useCallback(async () => {
    const nonce = await getCsrfToken();
    if (!nonce) throw new Error("Unable to generate nonce");
    return nonce;
  }, []);

  const handleSignIn = useCallback(async () => {
    try {
      setSigningIn(true);
      setSignInFailure(undefined);
      const nonce = await getNonce();
      const result: any = await sdk.actions.signIn({ nonce });
      setSignInResult(result);
      await signIn("farcaster", {
        message: result.message,
        signature: result.signature,
        name: result.username,
        pfp: result.pfpUrl,
        redirect: false,
      });
    } catch (e) {
      if (e instanceof SignInCore.RejectedByUser) {
        setSignInFailure("Rejected by user");
      } else {
        console.error("Sign in error:", e);
        setSignInFailure("Unknown error");
      }
    } finally {
      setSigningIn(false);
    }
  }, [getNonce]);

  const handleSignOut = useCallback(async () => {
    try {
      setSigningOut(true);
      await signOut({ redirect: false });
      setSignInResult(undefined);
    } finally {
      setSigningOut(false);
    }
  }, []);

  return (
    <div className="mt-4">
      {status !== "authenticated" ? (
        <Button
          onClick={handleSignIn}
          disabled={signingIn}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {signingIn ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Signing in...
            </span>
          ) : (
            "Sign in with Farcaster"
          )}
        </Button>
      ) : (
        <div className="flex items-center gap-4">
          {session.user?.image && (
            <img
              src={session.user.image}
              alt="Profile"
              className="w-8 h-8 rounded-full"
            />
          )}
          <span className="font-medium text-gray-700">
            {session.user?.name || "Farcaster User"}
          </span>
          <Button
            onClick={handleSignOut}
            disabled={signingOut}
            className="text-sm"
          >
            {signingOut ? "Signing out..." : "Sign out"}
          </Button>
        </div>
      )}

      {signInFailure && (
        <div className="mt-2 text-red-500 text-sm">{signInFailure}</div>
      )}
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