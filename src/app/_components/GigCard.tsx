import React, { useEffect, useRef, useState } from 'react';
import type { Event } from '@/lib/types';
import { LocationIcon } from '@/components/ui/location-icon';
import { Calendar, Ticket } from 'lucide-react';

type GigCardProps = {
  gig: Event;
};

const DEFAULT_LOCALE = 'en-US';

const formatGigDate = (dateString?: string) => {
  if (!dateString) return '';
  // Parse as local date to avoid timezone shifts (don't use new Date("YYYY-MM-DD"))
  const [y, m, day] = dateString.split('-').map(Number);
  const d = new Date(y, (m ?? 1) - 1, day ?? 1);
  return d.toLocaleDateString(DEFAULT_LOCALE, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export function GigCard({ gig }: GigCardProps) {
  const mapsHref = gig.venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(gig.venue)}`
    : undefined;
  const imgRef = useRef<HTMLImageElement>(null);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    // Reset when card changes (e.g. pagination / new src)
    setImgLoaded(imgRef.current?.complete ?? false);
  }, [gig.poster]);

  return (
    <div className="flex w-full flex-col bg-white rounded-lg dark:bg-gray-800 dark:border-gray-700">
      {gig.poster ? (
        <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          {/* Skeleton */}
          {!imgLoaded ? (
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
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            ref={imgRef}
            src={gig.poster}
            alt={gig.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgLoaded(true)}
          />
        </div>
      ) : (
        <div className="w-full aspect-[3/4] rounded-lg bg-gray-100 dark:bg-gray-700" aria-hidden />
      )}
      <div className="p-2">
        <div className="flex min-w-0 flex-row gap-4 items-center">
          <div className="flex min-w-0 flex-1 flex-col">
            <span className="tracking-tight dark:text-white font-bold">{gig.title}</span>
            {gig.calendarUrl ? (
              <a
                href={gig.calendarUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full min-w-0 flex-row gap-2 items-center text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-violet-400"
                title="Add to Google Calendar"
                aria-label="Add to Google Calendar"
              >
                <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{formatGigDate(gig.date)}</span>
              </a>
            ) : (
              <div
                className="flex w-full min-w-0 flex-row gap-2 items-center text-gray-500"
                title="Date"
              >
                <Calendar className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0 flex-1 truncate">{formatGigDate(gig.date)}</span>
              </div>
            )}
            <div
              className="flex w-full min-w-0 flex-row gap-2 items-center text-gray-500"
              title="Venue"
            >
              {mapsHref ? (
                <a
                  href={mapsHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex min-w-0 flex-1 items-center gap-2 truncate transition-colors hover:text-gray-700 dark:hover:text-violet-400"
                  title="Open in Google Maps"
                  aria-label="Open venue in Google Maps"
                >
                  <LocationIcon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{gig.venue}</span>
                </a>
              ) : (
                <>
                  <LocationIcon className="h-4 w-4 shrink-0" aria-hidden />
                  <span className="min-w-0 flex-1 truncate">{gig.venue}</span>
                </>
              )}
            </div>
          </div>
          {/*          {Number.isFinite(gig.people) && gig.people > 0 ? (
            <p className="text-sm flex flex-row items-center gap-1">
              <FaUsers />
              {gig.people}
            </p>
          ) : null}*/}
        </div>
        {gig.ticketsUrl ? (
          <a
            href={gig.ticketsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full min-w-0 flex-row gap-2 items-center text-gray-500 transition-colors hover:text-gray-700 dark:hover:text-violet-400"
            title="Open tickets"
          >
            <Ticket className="h-4 w-4 shrink-0" aria-hidden />
            <span className="min-w-0 flex-1 truncate">Tickets</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
