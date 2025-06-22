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
  const maxOptionWidth = 400; // Increased for better visibility

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
            padding: "6%",
            gap: "16px",
            boxSizing: "border-box",
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
            }}
          >
            <h1
              style={{
                fontSize: "clamp(28px, 4vw, 34px)",
                fontWeight: "bold",
                textAlign: "center",
                color: "#6b46c1",
                margin: 0,
                lineHeight: "1.2",
              }}
            >
              {pollData.title.slice(0, 80)}
            </h1>
            <p
              style={{
                fontSize: "clamp(14px, 2.5vw, 16px)",
                color: "#4b5563",
                textAlign: "center",
                maxWidth: "90%",
                margin: "8px 0",
                lineHeight: "1.4",
              }}
            >
              {pollData.description.slice(0, 120)}
            </p>
            <p
              style={{
                fontSize: "clamp(14px, 2vw, 16px)",
                color: "#6b46c1",
                fontWeight: "bold",
                margin: 0,
              }}
            >
              Total Votes: {totalVotes}
            </p>
          </div>

          {/* Options */}
<div
  style={{
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    width: "100%",
    maxWidth: "400px", // Constrain width like Google Forms
    margin: "0 auto", // Center align
    padding: "8px",
    overflow: "hidden",
  }}
>
  {pollData.options.slice(0, 4).map((option, index) => {
    const percentage = ((option.votes / totalVotesNum) * 100).toFixed(1);
    const barWidth = Math.min((parseFloat(percentage) / 100) * 300, 300); // Shorter bar

    return (
      <div
        key={index}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          background: "rgba(255, 255, 255, 0.95)",
          padding: "8px",
          borderRadius: "6px",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.05)",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "clamp(11px, 1.8vw, 13px)",
            fontWeight: "medium",
            color: "#1f2937",
          }}
        >
          <span style={{ maxWidth: "70%", overflow: "hidden", textOverflow: "ellipsis" }}>
            {option.text.slice(0, 30)} {/* Shorter text truncation */}
          </span>
          <span>
            {option.votes} ({percentage}%)
          </span>
        </div>
        <div
          style={{
            width: `${barWidth}px`,
            height: "8px", // Thinner bar
            background: "linear-gradient(90deg, #a78bfa, #60a5fa)",
            borderRadius: "4px",
            boxShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
            transition: "width 0.3s ease",
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
              alignItems: "center",
              padding: "12px",
              background: "rgba(255, 255, 255, 0.7)",
              borderRadius: "8px",
              fontSize: "clamp(12px, 2vw, 14px)",
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