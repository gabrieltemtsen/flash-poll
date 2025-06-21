// lib/convex.ts
import { ConvexReactClient } from "convex/react";

const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL as string;
export const convex = new ConvexReactClient(CONVEX_URL);