/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useCallback, useState } from 'react';
import { Button } from './Button';
import { useMiniApp } from '@neynar/react';

interface EmbedConfig {
  path?: string;
  url?: string;
  imageUrl?: () => Promise<string>;
}

interface CastConfig extends Omit<any, 'embeds'> {
  embeds?: (string | EmbedConfig)[];
}

interface ShareButtonProps {
  buttonText?: string; // Made optional to allow children-only usage
  cast: CastConfig;
  className?: string;
  isLoading?: boolean;
  children?: React.ReactNode; // Added children prop
}

export function ShareButton({ buttonText, cast, className = '', isLoading = false, children }: ShareButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { context, actions } = useMiniApp();

  const handleShare = useCallback(async () => {
    try {
      setIsProcessing(true);

      const finalText = cast.text || 'Check out this poll on Flash Poll! Flash Poll by @gabedev.eth';

      // Process embeds
      const processedEmbeds = await Promise.all(
        (cast.embeds || []).map(async (embed) => {
          if (typeof embed === 'string') {
            return embed;
          }
          if (embed.path) {
            const baseUrl = process.env.NEXT_PUBLIC_URL || window.location.origin;
            const url = new URL(`${baseUrl}${embed.path}`);

            // Add UTM parameters
            url.searchParams.set('utm_source', `share-cast-${context?.user?.fid || 'unknown'}`);

            // If custom image generator is provided, use it
            // if (embed.imageUrl) {
            //   const imageUrl = await embed.imageUrl();
            //   url.searchParams.set('share_image_url', imageUrl);
            // }

            return url.toString();
          }
          return embed.url || '';
        })
      );

      // Open cast composer with all supported intents
      await actions.composeCast({
        text: finalText,
        embeds: processedEmbeds as [string] | [string, string] | undefined,
        parent: cast.parent,
        channelKey: cast.channelKey,
        close: cast.close,
      }, 'share-button');
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [cast, context?.user?.fid, actions]);

  return (
    <Button
      onClick={handleShare}
      className={className}
      isLoading={isLoading || isProcessing}
    >
      {children || buttonText}
    </Button>
  );
}