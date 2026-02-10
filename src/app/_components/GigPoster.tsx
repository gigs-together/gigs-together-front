import React, { useCallback, useState } from 'react';

export type GigPosterProps = {
  poster: string;
  title: string;
};

export function GigPoster({ poster, title }: GigPosterProps) {
  const [loaded, setLoaded] = useState(false);

  // If the image is already cached, show it immediately.
  const imgRef = useCallback((node: HTMLImageElement | null) => {
    if (node?.complete) setLoaded(true);
  }, []);

  return (
    <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
      {/* Skeleton */}
      {!loaded ? (
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
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
        ref={imgRef}
        src={poster}
        alt={title}
        loading="lazy"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  );
}
