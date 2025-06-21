import { ConvexReactClient } from "convex/react";
import { ConvexHttpClient } from "convex/browser";

// Server-side client
export const convexHttp = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Client-side client
export const convexReact = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);