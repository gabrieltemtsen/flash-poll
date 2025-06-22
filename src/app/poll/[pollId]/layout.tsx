/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { generateMetadataForPoll } from '~/app/utils/metada';



type Props = {
  children: React.ReactNode;
  params: { pollId: any };
};

export const generateMetadata = generateMetadataForPoll;

export default function Layout({ children }: Props) {
  return children;
}
