/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode } from "react";
import { generateMetadataForPoll } from "~/app/utils/metada";

// Define the props type for the Layout component
interface LayoutProps {
  children: ReactNode;
  params: { pollId: string };
}

// Export generateMetadata (ensure it matches Next.js expectations)
export const generateMetadata = generateMetadataForPoll;

// Layout component with proper typing
export default function Layout({ children, params }: LayoutProps) {
  // Optional: Log params for debugging
  // console.log("Layout params:", params);

  return children;
}