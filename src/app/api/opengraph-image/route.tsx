/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { getNeynarUser } from "~/lib/neynar";

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const fid = searchParams.get('fid');

  const user = fid ? await getNeynarUser(Number(fid)) : null;

  const iconUrl = `${origin}/icon.png`;

  return new ImageResponse(
    (
      <div tw="flex h-full w-full items-center justify-center bg-gradient-to-br from-purple-700 via-fuchsia-700 to-pink-600">
        <div tw="flex flex-col items-center bg-white/20 backdrop-blur-lg rounded-3xl p-16">
          <img src={iconUrl} tw="w-40 h-40 mb-8" alt="Flash Poll logo" />
          <h1 tw="text-8xl font-bold text-white">Flash Poll</h1>
          <p tw="text-4xl text-white mt-4">Create polls in seconds</p>
          {user?.display_name && (
            <p tw="text-3xl text-white mt-2 opacity-90">Welcome, {user.display_name}!</p>
          )}
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}