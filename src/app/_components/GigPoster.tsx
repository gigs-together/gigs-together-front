import React, { useCallback, useRef, useState } from 'react';
import { ImageLightbox } from '@/app/_components/ImageLightbox';

export type GigPosterProps = {
  poster: string;
  title: string;
};

export function GigPoster({ poster, title }: GigPosterProps) {
  const [loadedPoster, setLoadedPoster] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const imgElRef = useRef<HTMLImageElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const isLoaded = loadedPoster === poster;

  // If the image is already cached, show it immediately.
  const imgRef = useCallback(
    (node: HTMLImageElement | null) => {
      imgElRef.current = node;
      if (node?.complete) setLoadedPoster(poster);
    },
    [poster],
  );

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen(true)}
        className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-violet-500/40"
        aria-label={`Open poster: ${title}`}
        aria-haspopup="dialog"
      >
        {/* Skeleton */}
        {!isLoaded ? (
          <div
            className="absolute inset-0 skeleton-shimmer"
            // Fallback so there's no "blank -> skeleton" flash before CSS loads
            style={{ backgroundColor: '#e5e7eb' }}
            aria-hidden
          />
        ) : null}

        {/* TODO: Consider using `<Image />` from `next/image`  */}
        <img
          className={`h-full w-full object-cover transition-opacity duration-200 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          ref={imgRef}
          src={poster}
          alt={title}
          loading="lazy"
          onLoad={() => setLoadedPoster(poster)}
          onError={() => setLoadedPoster(poster)}
        />
      </button>

      <ImageLightbox
        open={open}
        src={poster}
        alt={title}
        onClose={() => {
          setOpen(false);
          triggerRef.current?.focus();
        }}
      />
    </>
  );
}
