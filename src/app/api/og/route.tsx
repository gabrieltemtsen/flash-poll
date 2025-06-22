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
          <h1 style={{ fontSize: 48, fontWeight: "bold", textAlign: "center" }}>
            Fast Poll
          </h1>
          <p style={{ fontSize: 24, textAlign: "center", color: "#4b5563" }}>
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

  const totalVotesNum = parseInt(totalVotes, 10) || 1; // Avoid division by zero
  const maxOptionWidth = 600; // Max width for vote bars

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
              marginBottom: 20,
            }}
          >
            <h1
              style={{
                fontSize: 36,
                fontWeight: "bold",
                textAlign: "center",
                color: "#6b46c1",
              }}
            >
              {pollData.title.slice(0, 100)}
            </h1>
            <p
              style={{
                fontSize: 20,
                color: "#4b5563",
                textAlign: "center",
                maxWidth: 800,
              }}
            >
              {pollData.description.slice(0, 200)}
            </p>
            <p
              style={{ fontSize: 18, color: "#6b46c1", fontWeight: "bold" }}
            >
              Total Votes: {totalVotes}
            </p>
          </div>

          {/* Options */}
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {pollData.options.map((option, index) => {
              const percentage = (
                (option.votes / totalVotesNum) *
                100
              ).toFixed(1);
              const barWidth = (parseInt(percentage, 10) / 100) * maxOptionWidth;

              return (
                <div
                  key={index}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 16,
                      fontWeight: "medium",
                    }}
                  >
                    <span>{option.text.slice(0, 50)}</span>
                    <span>
                      {option.votes} votes ({percentage}%)
                    </span>
                  </div>
                  <div
                    style={{
                      width: barWidth,
                      height: 12,
                      background: "linear-gradient(to right, #a78bfa, #60a5fa)",
                      borderRadius: 6,
                    }}
                  />
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
            width: 1200,
            height: 630,
            background: "linear-gradient(to bottom right, #f3e8ff, #dbeafe)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: 40,
          }}
        >
          <h1 style={{ fontSize: 48, fontWeight: "bold", textAlign: "center" }}>
            Fast Poll
          </h1>
          <p style={{ fontSize: 24, textAlign: "center", color: "#4b5563" }}>
            Error generating poll image.
          </p>
        </div>
      ),
      { width: 1200, height: 630 }
    );
  }
}