import React, { useCallback, useRef, useState } from 'react';

export type GigPosterProps = {
  poster: string;
  title: string;
};

export function GigPoster({ poster, title }: GigPosterProps) {
  const [loadedPoster, setLoadedPoster] = useState<string | null>(null);
  const imgElRef = useRef<HTMLImageElement | null>(null);
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
    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
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
    </div>
  );
}
