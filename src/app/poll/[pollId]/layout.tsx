/* eslint-disable @typescript-eslint/no-unused-vars */
import { ReactNode } from "react";
import { generateMetadataForPoll } from "~/app/utils/metada";

// Define the props type for the Layout component
interface LayoutProps {
  children: ReactNode;
  params: Promise<{ pollId: string }>; // Use Promise for async params
}

// Export generateMetadata
export { generateMetadataForPoll as generateMetadata };

// Layout component with proper typing
export default async function Layout({ children, params }: LayoutProps) {
  // Await the params to access pollId
  const { pollId } = await params;

  // Optional: Log params for debugging
  // console.log("Layout pollId:", pollId);

  return children;
}