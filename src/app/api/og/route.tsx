import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge"; // Use Edge runtime

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

  if (type !== "poll") {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            width: 1200,
            height: 630,
            background: "linear-gradient(to bottom right, #f3e8ff, #dbeafe)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: 40,
          }}
        >
          <h1 style={{ fontSize: 64, fontWeight: "bold", textAlign: "center" }}>
            Fast Poll
          </h1>
          <p style={{ fontSize: 28, textAlign: "center", color: "#4b5563" }}>
            Create and vote on polls instantly!
          </p>
        </div>
      ),
      { width: 1200, height: 630 },
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

  const totalVotesNum = parseInt(totalVotes, 10) || 1; // Avoid division by zero
  try {
    return new ImageResponse(
      (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            width: 1200,
            height: 630,
            background: "linear-gradient(to bottom right, #f3e8ff, #dbeafe)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: 40,
          }}
        >
          {/* Header */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginBottom: 32,
              padding: "0 32px",
            }}
          >
            <h1
              style={{
                fontSize: 56,
                fontWeight: "bold",
                textAlign: "center",
                color: "#6b46c1",
                maxWidth: 1000,
                wordBreak: "break-word",
                whiteSpace: "pre-wrap",
              }}
            >
              {pollData.title}
            </h1>
            <p
              style={{
                fontSize: 28,
                color: "#4b5563",
                textAlign: "center",
                maxWidth: 900,
                marginTop: 12,
                marginBottom: 24,
                lineHeight: 1.3,
              }}
            >
              {pollData.description}
            </p>
            <p
              style={{ fontSize: 24, color: "#6b46c1", fontWeight: "bold" }}
            >
              Total Votes: {totalVotes}
            </p>
          </div>

          {/* Options */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 20,
              width: "100%",
              maxWidth: 900,
              alignSelf: "center",
            }}
          >
            {pollData.options.map((option, index) => {
              const percentage = ((option.votes / totalVotesNum) * 100).toFixed(
                1,
              );
              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 6,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      fontSize: 24,
                      fontWeight: "bold",
                    }}
                  >
                    <span
                      style={{ flex: 1, marginRight: 16, wordBreak: "break-word" }}
                    >
                      {option.text}
                    </span>
                    <span
                      style={{ width: 160, textAlign: "right", fontWeight: "normal" }}
                    >
                      {option.votes} ({percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      position: "relative",
                      width: "100%",
                      height: 20,
                      backgroundColor: "#E5E7EB",
                      borderRadius: 8,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        width: `${percentage}%`,
                        height: "100%",
                        background: "linear-gradient(to right, #a78bfa, #60a5fa)",
                        borderRadius: 8,
                      }}
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
              marginTop: "auto",
              fontSize: 16,
              color: "#4b5563",
            }}
          >
            Powered by Fast Poll
          </div>
        </div>
      ),
      { width: 1200, height: 630 },
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
            width: 1200,
            height: 630,
            background: "linear-gradient(to bottom right, #f3e8ff, #dbeafe)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: 40,
          }}
        >
          <h1 style={{ fontSize: 64, fontWeight: "bold", textAlign: "center" }}>
            Fast Poll
          </h1>
          <p style={{ fontSize: 28, textAlign: "center", color: "#4b5563" }}>
            Error generating poll image.
          </p>
        </div>
      ),
      { width: 1200, height: 630 },
    );
  }
}
