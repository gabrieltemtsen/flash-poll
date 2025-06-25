import { Metadata } from "next";

const APP_URL = process.env.NEXT_PUBLIC_URL || "http://localhost:3000";
const APP_ICON_URL = `${APP_URL}/icon.png`;
const APP_SPLASH_URL = `${APP_URL}/logo.svg`;
const APP_SPLASH_BACKGROUND_COLOR = "#6b46c1";
const APP_OG_IMAGE_URL = `${APP_URL}/images/fastpoll-preview.png`;
const APP_BUTTON_TEXT = "View Poll";
const APP_NAME = "Flash Poll";

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

export async function generateMetadataForPollsHome(): Promise<Metadata> {
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
    title: "Flash Poll - Share Your Opinion",
    description:
      "Flash Poll lets you create and vote on polls instantly. Join the community on Farcaster and see what others think in real-time!",
    openGraph: {
      type: "website",
      url: APP_URL,
      title: "Flash Poll - Share Your Opinion",
      description:
        "Flash Poll lets you create and vote on polls instantly. Join the community on Farcaster and see what others think in real-time!",
      siteName: APP_NAME,
      images: [
        {
          url: APP_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Flash Poll - Share Your Opinion",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Flash Poll - Share Your Opinion",
      description:
        "Flash Poll lets you create and vote on polls instantly. Join the community on Farcaster and see what others think in real-time!",
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify(frame),
    },
  };
};

export async function generateMetadataForPoll({
  params,
}: {
  params: Promise<{ pollId: string }>;
}): Promise<Metadata> {
  const { pollId } = await params;

  const defaultMetadata: Metadata = {
    title: "Flash Poll - View Poll",
    description:
      "Vote and see real-time results on Flash Poll. Join the Farcaster community and share your opinion!",
    openGraph: {
      type: "website",
      url: `${APP_URL}/poll/${pollId}`,
      title: "Flash Poll - View Poll",
      description:
        "Vote and see real-time results on Flash Poll. Join the Farcaster community and share your opinion!",
      siteName: APP_NAME,
      images: [
        {
          url: APP_OG_IMAGE_URL,
          width: 1200,
          height: 630,
          alt: "Flash Poll",
        },
      ],
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: "Flash Poll - View Poll",
      description:
        "Vote and see real-time results on Flash Poll. Join the Farcaster community and share your opinion!",
      images: [APP_OG_IMAGE_URL],
    },
    other: {
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: APP_OG_IMAGE_URL,
        button: {
          title: APP_BUTTON_TEXT,
          action: {
            type: "launch_frame",
            name: APP_NAME,
            url: `${APP_URL}/poll/${pollId}`,
            splashImageUrl: APP_SPLASH_URL,
            iconUrl: APP_ICON_URL,
            splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };

  if (!pollId) {
    return defaultMetadata;
  }

  let poll: Poll | null = null;
  try {
    const response = await fetch(`${APP_URL}/api/poll?pollId=${pollId}`, {
      next: { revalidate: 60 },
    });
    if (!response.ok) throw new Error("Poll not found");
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
        poll.options.map((opt) => ({
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
      url: `${APP_URL}/poll/${pollId}`,
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
      "fc:frame": JSON.stringify({
        version: "next",
        imageUrl: ogImageUrl,
        button: {
          title: APP_BUTTON_TEXT,
          action: {
            type: "launch_frame",
            name: APP_NAME,
            url: `${APP_URL}/poll/${pollId}`,
            splashImageUrl: APP_SPLASH_URL,
            iconUrl: APP_ICON_URL,
            splashBackgroundColor: APP_SPLASH_BACKGROUND_COLOR,
          },
        },
      }),
    },
  };
};