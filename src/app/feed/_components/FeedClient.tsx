'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import styles from '@/app/page.module.css';
import { toLocalYMD } from '@/lib/utils';
import '@/app/style.css';
import type { Event } from '@/lib/types';
import type { V1GigGetResponseBody } from '@/lib/types';
import { useT } from '@/lib/i18n/I18nProvider';
import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';
import { FeedMonths } from './feed-client/FeedMonths';
import { useCalendarAvailableDates } from './feed-client/useCalendarAvailableDates';
import { useFeedHeaderConfigSync } from './feed-client/useFeedHeaderConfigSync';
import { useHeaderHeight } from './feed-client/useHeaderHeight';
import { FEED_PAGE_SIZE } from '@/lib/feed.constants';
import { gigToEvent } from '@/lib/feed.mapper';
import { apiRequest } from '@/lib/api';
import { useHashAutoScroll } from './feed-client/useHashAutoScroll';
import { useInfiniteScroll } from './feed-client/useInfiniteScroll';
import { useVisibleEventDateOnScroll } from './feed-client/useVisibleEventDateOnScroll';

interface FeedClientProps {
  country: string; // ISO like "es"
  city: string; // slug like "barcelona"
  initialEvents?: Event[];
  initialNextCursor?: string;
}

export default function FeedClient(props: FeedClientProps) {
  const { country, city, initialEvents, initialNextCursor } = props;

  const t = useT();
  const { setConfig: setHeaderConfig } = useHeaderConfig();
  const headerH = useHeaderHeight(); // will pick [data-app-header], fallback 44

  const [events, setEvents] = useState<Event[]>(() => initialEvents ?? []);
  const [isLoading, setIsLoading] = useState(() => initialEvents === undefined);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(() => initialNextCursor);

  const eventRefs = useRef<Map<string, HTMLElement>>(new Map());
  const inFlightRef = useRef(false);

  type FetchMode = 'replace' | 'append';

  const fetchPage = useCallback(
    async (mode: FetchMode, options?: Readonly<{ cursor?: string }>) => {
      if (inFlightRef.current) return;
      inFlightRef.current = true;

      const qs = new URLSearchParams();
      qs.set('limit', String(FEED_PAGE_SIZE));
      const cursor = options?.cursor;
      if (cursor) qs.set('cursor', cursor);
      if (country) qs.set('country', country);
      if (city) qs.set('city', city);

      try {
        if (mode === 'replace') {
          setIsLoading(true);
          setError(null);
        } else {
          setIsLoadingMore(true);
        }

        const res = await apiRequest<V1GigGetResponseBody>(`v1/gig?${qs.toString()}`, 'GET');

        const mapped: Event[] = res.gigs.map((gig) =>
          gigToEvent(gig, { resolveCountryName: (iso) => t('country', iso) }),
        );

        setEvents((prev) => {
          const merged = mode === 'replace' ? mapped : [...prev, ...mapped];

          // Cursor pagination can overlap; ensure a stable, unique list by gig id.
          const uniqueById = new Map<string, Event>();
          merged.forEach((e) => uniqueById.set(e.id, e));

          const unique = Array.from(uniqueById.values());
          unique.sort((a, b) => a.date.localeCompare(b.date));
          return unique;
        });

        setNextCursor(res.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        inFlightRef.current = false;
      }
    },
    [city, country, t],
  );

  useEffect(() => {
    if (initialEvents !== undefined) {
      setEvents(initialEvents);
      setNextCursor(initialNextCursor);
      setError(null);
      setIsLoading(false);
      setIsLoadingMore(false);
      inFlightRef.current = false;
      return;
    }

    void fetchPage('replace');
  }, [country, city, fetchPage, initialEvents, initialNextCursor]);

  const hasMore = Boolean(nextCursor);
  const loadMore = useCallback(() => {
    if (isLoading || isLoadingMore || !nextCursor) return;
    void fetchPage('append', { cursor: nextCursor });
  }, [fetchPage, isLoading, isLoadingMore, nextCursor]);

  const {
    availableDates: calendarAvailableDates,
    status: calendarDatesStatus,
    error: calendarDatesError,
  } = useCalendarAvailableDates({
    country,
    city,
    enabled: !isLoading && !error,
  });

  const { visibleEventDate } = useVisibleEventDateOnScroll({
    events,
    headerOffsetPx: headerH ?? 0,
  });

  useHashAutoScroll({ events });

  const { sentinelRef } = useInfiniteScroll({
    isEnabled: true,
    hasMore,
    isLoading,
    isLoadingMore,
    onLoadMore: loadMore,
  });

  const registerEventRef = useCallback((eventId: string, element: HTMLElement | null) => {
    if (element) {
      eventRefs.current.set(eventId, element);
    } else {
      eventRefs.current.delete(eventId);
    }
  }, []);

  const handleDayClick = useCallback(
    (day: Date) => {
      const key = toLocalYMD(day);

      // First, try to find an explicit anchor by date (where you added data-date and scroll-mt-[44px])
      let target = document.querySelector<HTMLElement>(`[data-date="${key}"]`);

      // Fallback: if there is no anchor, jump to the first card for this date
      if (!target) {
        const firstEvent = events.find((e) => e.date === key);
        if (firstEvent) {
          target = eventRefs.current.get(String(firstEvent.id)) || null;
        }
      }

      if (!target) return;

      // `scrollIntoView` can overshoot in our layout; compute the scroll position manually.
      const headerPx = headerH ?? 0;
      // Tune this if needed: positive value means "stop a bit earlier" (less scroll down).
      const EXTRA_OFFSET_PX = 32;
      const top = window.scrollY + target.getBoundingClientRect().top - headerPx - EXTRA_OFFSET_PX;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    },
    [events, headerH],
  );

  useFeedHeaderConfigSync({
    setHeaderConfig,
    visibleEventDate,
    availableDates: calendarDatesStatus === 'ready' ? calendarAvailableDates : undefined,
    calendarDatesStatus,
    calendarDatesError,
    onDayClick: handleDayClick,
  });

  if (isLoading) {
    return (
      <div className="min-h-[100svh]">
        <main className={styles.main}>
          <div className="flex justify-center items-center h-96">
            <div className="text-lg">Loading events...</div>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[100svh]">
        <main className={styles.main}>
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-[100svh]">
      <main className={styles.main}>
        <div className="px-8 md:px-8 py-8">
          <FeedMonths events={events} registerEventRef={registerEventRef} />

          <div ref={sentinelRef} className="h-12" aria-hidden />
          {isLoadingMore ? (
            <div className="py-4 text-center text-gray-500">Loading more…</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
