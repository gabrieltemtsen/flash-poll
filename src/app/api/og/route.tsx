/* eslint-disable @typescript-eslint/no-unused-vars */
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
            background: "linear-gradient(135deg, #f3e8ff 0%, #dbeafe 100%)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: "8%",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 40px)",
              fontWeight: "bold",
              color: "#6b46c1",
              marginBottom: "12px",
              lineHeight: "1.2",
            }}
          >
            Fast Poll
          </h1>
          <p
            style={{
              fontSize: "clamp(18px, 3vw, 20px)",
              color: "#4b5563",
              maxWidth: "80%",
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

  const totalVotesNum = parseInt(totalVotes, 10) || 1; // Avoid division by zero
  const maxOptionWidth = 800; // Increased for better visibility

  try {
   return new ImageResponse(
  (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        width: "100%",
        height: "100%",
        background: "linear-gradient(135deg, #f9f5ff 0%, #e6f0fa 100%)",
        fontFamily: "sans-serif",
        color: "#1f2937",
        padding: "40px",
        gap: "16px",
        boxSizing: "border-box",
        alignItems: "center",
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "8px",
          padding: "16px",
          background: "rgba(255, 255, 255, 0.85)",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          width: "90%",
          maxWidth: "800px",
        }}
      >
        <h1 style={{ fontSize: "32px", fontWeight: "bold", color: "#6b46c1", margin: 0 }}>
          {pollData.title.slice(0, 80)}
        </h1>
        <p style={{ fontSize: "16px", color: "#4b5563", textAlign: "center", margin: "8px 0" }}>
          {pollData.description.slice(0, 120)}
        </p>
        <p style={{ fontSize: "16px", color: "#6b46c1", fontWeight: "bold", margin: 0 }}>
          Total Votes: {totalVotes}
        </p>
      </div>

      {/* Options - Centered and Compact */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          width: "90%",
          maxWidth: "600px",
          padding: "12px 0",
        }}
      >
        {pollData.options.slice(0, 4).map((option, index) => {
          const percentage = ((option.votes / totalVotesNum) * 100).toFixed(1);
          const barWidth = `${Math.min(parseFloat(percentage), 100)}%`;

          return (
            <div
              key={index}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "6px",
                background: "rgba(255, 255, 255, 0.95)",
                padding: "12px 16px",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "14px",
                  fontWeight: "medium",
                }}
              >
                <span>{option.text.slice(0, 30)}</span>
                <span>
                  {option.votes} ({percentage}%)
                </span>
              </div>
              <div
                style={{
                  width: "100%",
                  height: "8px",
                  background: "#e5e7eb",
                  borderRadius: "4px",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: barWidth,
                    height: "100%",
                    background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
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
          padding: "12px",
          fontSize: "14px",
          color: "#4b5563",
          fontWeight: "medium",
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
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg, #f3e8ff, #dbeafe)",
            fontFamily: "sans-serif",
            color: "#1f2937",
            padding: "8%",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(32px, 5vw, 40px)",
              fontWeight: "bold",
              textAlign: "center",
            }}
          >
            Fast Poll
          </h1>
          <p
            style={{
              fontSize: "clamp(18px, 3vw, 20px)",
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