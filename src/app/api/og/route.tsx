import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

interface PollOption {
  text: string;
  votes: number;
}

interface PollData {
  title: string;
  description: string;
  totalVotes: string;
  options: PollOption[];
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type");
  const title = searchParams.get("title") || "Fast Poll";
  const description = searchParams.get("description") || "Share your opinion!";
  const totalVotes = searchParams.get("totalVotes") || "0";
  const optionsRaw = searchParams.get("options");

  // Fallback for non-poll type
  if (type !== "poll") {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: "10%",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 32px)",
              fontWeight: "bold",
              color: "#5b21b6",
              marginBottom: "10px",
              lineHeight: "1.2",
            }}
          >
            Fast Poll
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              color: "#4b5563",
              maxWidth: "80%",
              textAlign: "center",
              lineHeight: "1.4",
            }}
          >
            Create and vote on polls instantly!
          </p>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }

  let options: PollOption[] = [];
  try {
    if (optionsRaw) {
      options = JSON.parse(optionsRaw);
    }
  } catch (error) {
    console.error("Error parsing options:", error);
  }

  const pollData: PollData = {
    title,
    description,
    totalVotes,
    options,
  };

  const totalVotesNum = parseInt(totalVotes, 10) || 1;

  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: "5%",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              maxWidth: "500px",
              background: "#ffffff",
              borderRadius: "16px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
              padding: "20px",
              gap: "12px",
            }}
          >
            {/* Header */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <h1
                style={{
                  fontSize: "clamp(20px, 3vw, 24px)",
                  fontWeight: "bold",
                  color: "#5b21b6",
                  textAlign: "center",
                  margin: 0,
                  lineHeight: "1.2",
                }}
              >
                {pollData.title.slice(0, 60)}
              </h1>
              <p
                style={{
                  fontSize: "clamp(12px, 1.8vw, 14px)",
                  color: "#4b5563",
                  textAlign: "center",
                  maxWidth: "90%",
                  margin: "4px 0",
                  lineHeight: "1.3",
                }}
              >
                {pollData.description.slice(0, 80)}
              </p>
              <p
                style={{
                  fontSize: "clamp(12px, 1.8vw, 14px)",
                  color: "#5b21b6",
                  fontWeight: "bold",
                  margin: 0,
                }}
              >
                Total Votes: {totalVotes}
              </p>
            </div>

            {/* Options */}
                <div className="space-y-4">
          {pollData.options.slice(0, 4).map((option, index) => {
            const percentage = Math.round((option.votes / totalVotesNum) * 100);
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
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                fontSize: "clamp(10px, 1.5vw, 11px)",
                color: "#4b5563",
                marginTop: "8px",
              }}
            >
              Powered by Fast Poll
            </div>
          </div>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  } catch (error) {
    console.error("Error generating image:", error);
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #ffffff, #f0f4ff)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: "10%",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(28px, 4vw, 32px)",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Fast Poll
          </h1>
          <p
            style={{
              fontSize: "clamp(14px, 2vw, 16px)",
              textAlign: "center",
              color: "#4b5563",
            }}
          >
            Error generating poll image.
          </p>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}