/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Metadata } from "next";
import { useQuery } from "convex/react";

const APP_URL = process.env.NEXT_PUBLIC_URL || "https://fastpoll.example.com";
const APP_ICON_URL =
  `${process.env.NEXT_PUBLIC_URL}/icon.png` || "https://fastpoll.example.com/icon.png";
const APP_SPLASH_URL =
  `${process.env.NEXT_PUBLIC_URL}/logo.svg` || "https://fastpoll.example.com/logo.svg";
const APP_SPLASH_BACKGROUND_COLOR = "#6b46c1"; // Purple theme to match your UI
const APP_OG_IMAGE_URL =
  `${process.env.NEXT_PUBLIC_URL}/images/fastpoll-preview.png` ||
  "https://fastpoll.example.com/images/fastpoll-preview.png";
const APP_BUTTON_TEXT = "View Poll";
const APP_NAME = "Fast Poll";

// Utility to generate dynamic OG image URLs (adapt to your setup)
const generateDynamicOGUrl = ({
  type,
  dataObject,
}: {
  type: "poll" | "home";
  dataObject: Record<string, string>;
}): string => {
  const baseUrl = `${APP_URL}/api/og`;
  const params = new URLSearchParams({ type, ...dataObject });
  return `${baseUrl}?${params.toString()}`;
};

// Metadata for the main polls page
export const generateMetadataForPollsHome = async (): Promise<Metadata> => {
  const frame = {
    version: "next",
    imageUrl: APP_OG_IMAGE_URL,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: APP_URL,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      },
    },
  };

  return {
    title: "Fast Poll - Share Your Opinion",
    description:
      "Fast Poll lets you create and vote on polls instantly. Join the community on Farcaster and see what others think in real-time!",
    openGraph: {
      type: "website",
      url: APP_URL,
      title: "Fast Poll - Share Your Opinion",
      description:
        "Fast Poll lets you create and vote on polls instantly. Join the community on Farcaster and see what others think in real-time!",
      siteName: APP_NAME,
      images: [
        {
          url: APP_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Fast Poll - Share Your Opinion",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Fast Poll - Share Your Opinion",
      description:
        "Fast Poll lets you create and vote on polls instantly. Join the community on Farcaster and see what others think in real-time!",
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
};

// Metadata for individual poll pages
export const generateMetadataForPoll = async ({
  params,
}: {
  params: { pollId: string };
}): Promise<Metadata> => {
  const frame = {
    version: "next",
    imageUrl: `${APP_URL}/api/og?type=poll&pollId=${params.pollId}`,
    button: {
      title: APP_BUTTON_TEXT,
      action: {
        type: "launch_frame",
        name: APP_NAME,
        url: `${APP_URL}/poll/${params.pollId}`,
        splashImageUrl: APP_SPLASH_URL,
        iconUrl: APP_ICON_URL,
        splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
      },
    },
  };

  const defaultMetadata = {
    title: "Fast Poll - View Poll",
    description:
      "Vote and see real-time results on Fast Poll. Join the Farcaster community and share your opinion!",
    openGraph: {
      type: "website",
      url: `${APP_URL}/poll/${params.pollId}`,
      title: "Fast Poll - View Poll",
      description:
        "Vote and see real-time results on Fast Poll. Join the Farcaster community and share your opinion!",
      siteName: APP_NAME,
      images: [
        {
          url: APP_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Fast Poll",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Fast Poll - View Poll",
      description:
        "Vote and see real-time results on Fast Poll. Join the Farcaster community and share your opinion!",
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };

  if (!params.pollId) {
    return defaultMetadata;
  }

  // Fetch poll data from Convex (server-side)
  // Note: useQuery can't be used directly in server-side metadata generation.
  // Instead, use Convex's server-side client or fetch via API.
  let poll;
  try {
    // Example using a fetch to an API route that queries Convex
    const response = await fetch(`${APP_URL}/api/poll/${params.pollId}`);
    poll = await response.json();
  } catch (error) {
    console.error("Error fetching poll:", error);
    return defaultMetadata;
  }

  if (!poll) {
    return defaultMetadata;
  }

  const ogImageUrl = generateDynamicOGUrl({
    type: "poll",
    dataObject: {
      title: poll.title.slice(0, 150),
      description: poll.description.slice(0, 600),
      totalVotes: poll.totalVotes.toString(),
      options: JSON.stringify(
        poll.options.map((opt: any) => ({
          text: opt.text,
          votes: opt.votes,
        }))
      ),
    },
  });

  return {
    title: poll.title,
    description: poll.description,
    openGraph: {
      type: "website",
      url: `${APP_URL}/poll/${params.pollId}`,
      title: poll.title,
      description: poll.description,
      siteName: APP_NAME,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: poll.title,
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: poll.title,
      description: poll.description,
      images: [ogImageUrl],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
};