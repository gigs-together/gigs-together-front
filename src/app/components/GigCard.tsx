import React, { useEffect, useState } from 'react';
import { FaUsers } from 'react-icons/fa';
import type { Event } from '@/types';

type CardProps = {
  gig: Event;
};

export function Card({ gig }: CardProps) {
  const href = gig.ticketsUrl || undefined;
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    // Reset when card changes (e.g. pagination / new src)
    setImgLoaded(false);
  }, [gig.cover]);

  return (
    <div className="flex w-full flex-col bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700">
      {gig.cover ? (
        <div
          className="relative w-full rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700"
          style={{ aspectRatio: '5 / 3' }}
        >
          {/* Skeleton */}
          {!imgLoaded ? (
            <div
              className="absolute inset-0 skeleton-shimmer"
              // Fallback so there's no "blank -> skeleton" flash before CSS loads
              style={{ backgroundColor: '#e5e7eb' }}
              aria-hidden
            />
          ) : null}

          <img
            className={`h-full w-full object-cover transition-opacity duration-200 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            src={gig.cover}
            alt={gig.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        </div>
      ) : (
        <div
          className="w-full rounded-lg bg-gray-100 dark:bg-gray-700"
          style={{ aspectRatio: '5 / 3' }}
          aria-hidden
        />
      )}
      <div className="p-2">
        <div className="flex flex-row gap-4 items-center">
          <a
            href={href}
            target={href ? '_blank' : undefined}
            rel={href ? 'noopener noreferrer' : undefined}
            className={
              href
                ? 'transition-colors hover:text-gray-500 dark:hover:text-violet-400 cursor-pointer'
                : 'pointer-events-none'
            }
          >
            <span className="mb-2 tracking-tight dark:text-white font-bold">{gig.title}</span>
          </a>
          <div className="flex-1"></div>
          {Number.isFinite(gig.people) && gig.people > 0 ? (
            <p className="text-sm flex flex-row items-center gap-1">
              <FaUsers />
              {gig.people}
            </p>
          ) : null}
        </div>
        <div className="flex flex-row gap-2 items-center text-gray-500">{gig.venueAddress}</div>
      </div>
    </div>
  );
}
