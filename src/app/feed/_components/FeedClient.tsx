'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { isV1GigAroundGetResponseBody } from './feed-client/utils';

interface ScrollAnchor {
  readonly eventId: string;
  readonly topPx: number;
}

interface FeedClientProps {
  country: string; // ISO like "es"
  city: string; // slug like "barcelona"
  initialEvents?: Event[];
  initialNextCursor?: string;
}

function compareEventsAsc(a: Event, b: Event): number {
  return a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id));
}

function sortEventsAsc(input: Event[]): Event[] {
  const next = input.slice();
  next.sort(compareEventsAsc);
  return next;
}

export default function FeedClient(props: FeedClientProps) {
  const { country, city, initialEvents, initialNextCursor } = props;

  const t = useT();
  const { setConfig: setHeaderConfig } = useHeaderConfig();
  const headerH = useHeaderHeight(); // will pick [data-app-header], fallback 44

  const [events, setEvents] = useState<Event[]>(() => initialEvents ?? []);
  const [isLoading, setIsLoading] = useState(() => initialEvents === undefined);
  const [isLoadingNext, setIsLoadingNext] = useState(false);
  const [isLoadingPrev, setIsLoadingPrev] = useState(false);
  const [isJumpLoading, setIsJumpLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(() => initialNextCursor);
  const [prevCursor, setPrevCursor] = useState<string | undefined>(undefined);
  const [userScrollSessionKey, setUserScrollSessionKey] = useState(0);

  const eventRefs = useRef<Map<string, HTMLElement>>(new Map());
  const inFlightNextRef = useRef(false);
  const inFlightPrevRef = useRef(false);
  const inFlightJumpRef = useRef(false);
  const pendingScrollRestoreRef = useRef<ScrollAnchor | null>(null);

  const mergeUniqueSorted = useCallback((base: Event[], incoming: Event[]) => {
    const uniqueById = new Map<string, Event>();
    for (const e of base) uniqueById.set(e.id, e);
    for (const e of incoming) uniqueById.set(e.id, e);
    const unique = Array.from(uniqueById.values());
    unique.sort(compareEventsAsc);
    return unique;
  }, []);

  const captureScrollAnchor = useCallback((): ScrollAnchor | null => {
    const headerPx = headerH ?? 0;
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-event-id]'));
    if (els.length === 0) return null;

    let bestBelow: { el: HTMLElement; top: number } | null = null;
    let bestAbove: { el: HTMLElement; top: number } | null = null;

    for (const el of els) {
      const top = el.getBoundingClientRect().top - headerPx;
      if (top >= 0) {
        if (!bestBelow || top < bestBelow.top) bestBelow = { el, top };
      } else {
        if (!bestAbove || top > bestAbove.top) bestAbove = { el, top };
      }
    }

    const target = (bestBelow ?? bestAbove)?.el;
    const topPx = (bestBelow ?? bestAbove)?.top;
    const eventId = target?.dataset.eventId;
    if (!target || topPx === undefined || !eventId) return null;
    return { eventId, topPx };
  }, [headerH]);

  const fetchNextPage = useCallback(async () => {
    if (!nextCursor) return;
    if (inFlightNextRef.current) return;
    inFlightNextRef.current = true;

    const qs = new URLSearchParams();
    qs.set('limit', String(FEED_PAGE_SIZE));
    qs.set('cursor', nextCursor);
    if (country) qs.set('country', country);
    if (city) qs.set('city', city);

    try {
      setIsLoadingNext(true);
      const res = await apiRequest<V1GigGetResponseBody>(`v1/gig?${qs.toString()}`, 'GET');
      const mapped: Event[] = res.gigs.map((gig) =>
        gigToEvent(gig, { resolveCountryName: (iso) => t('country', iso) }),
      );

      setEvents((prev) => mergeUniqueSorted(prev, mapped));
      setNextCursor(res.nextCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoadingNext(false);
      inFlightNextRef.current = false;
    }
  }, [city, country, mergeUniqueSorted, nextCursor, t]);

  const fetchPrevPage = useCallback(async () => {
    if (!prevCursor) return;
    if (inFlightPrevRef.current) return;
    inFlightPrevRef.current = true;

    const anchor = captureScrollAnchor();
    if (anchor) pendingScrollRestoreRef.current = anchor;

    const qs = new URLSearchParams();
    qs.set('limit', String(FEED_PAGE_SIZE));
    qs.set('cursor', prevCursor);
    qs.set('direction', 'prev');
    if (country) qs.set('country', country);
    if (city) qs.set('city', city);

    try {
      setIsLoadingPrev(true);
      const res = await apiRequest<V1GigGetResponseBody>(`v1/gig?${qs.toString()}`, 'GET');
      const mapped: Event[] = res.gigs.map((gig) =>
        gigToEvent(gig, { resolveCountryName: (iso) => t('country', iso) }),
      );

      setEvents((prev) => mergeUniqueSorted(prev, mapped));
      setPrevCursor(res.prevCursor);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoadingPrev(false);
      inFlightPrevRef.current = false;
    }
  }, [captureScrollAnchor, city, country, mergeUniqueSorted, prevCursor, t]);

  const fetchInitial = useCallback(
    async (cursor?: string) => {
      const qs = new URLSearchParams();
      qs.set('limit', String(FEED_PAGE_SIZE));
      if (cursor) qs.set('cursor', cursor);
      if (country) qs.set('country', country);
      if (city) qs.set('city', city);

      try {
        setIsLoading(true);
        setError(null);
        setPrevCursor(undefined);

        const res = await apiRequest<V1GigGetResponseBody>(`v1/gig?${qs.toString()}`, 'GET');

        const mapped: Event[] = res.gigs.map((gig) =>
          gigToEvent(gig, { resolveCountryName: (iso) => t('country', iso) }),
        );

        setEvents(sortEventsAsc(mapped));
        setNextCursor(res.nextCursor);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
        setIsLoadingNext(false);
        setIsLoadingPrev(false);
        inFlightNextRef.current = false;
        inFlightPrevRef.current = false;
        inFlightJumpRef.current = false;
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
      setIsLoadingNext(false);
      setIsLoadingPrev(false);
      setIsJumpLoading(false);
      setPrevCursor(undefined);
      inFlightNextRef.current = false;
      inFlightPrevRef.current = false;
      inFlightJumpRef.current = false;
      return;
    }

    void fetchInitial();
  }, [country, city, fetchInitial, initialEvents, initialNextCursor]);

  const hasMore = Boolean(nextCursor);
  const hasPrev = Boolean(prevCursor);

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

  const { sentinelRef: bottomSentinelRef } = useInfiniteScroll({
    isEnabled: true,
    canLoadMore: hasMore && !isLoading && !isLoadingNext && !isJumpLoading,
    isLoading: isLoading || isLoadingNext || isJumpLoading,
    onLoadMore: fetchNextPage,
    resetUserScrollKey: userScrollSessionKey,
  });

  const { sentinelRef: topSentinelRef } = useInfiniteScroll({
    isEnabled: true,
    canLoadMore: hasPrev && !isLoading && !isLoadingPrev && !isJumpLoading,
    isLoading: isLoading || isLoadingPrev || isJumpLoading,
    onLoadMore: fetchPrevPage,
    rootMargin: '400px 0px',
    resetUserScrollKey: userScrollSessionKey,
  });

  const registerEventRef = useCallback((eventId: string, element: HTMLElement | null) => {
    if (element) {
      eventRefs.current.set(eventId, element);
    } else {
      eventRefs.current.delete(eventId);
    }
  }, []);

  useLayoutEffect(() => {
    const pending = pendingScrollRestoreRef.current;
    if (!pending) return;

    const headerPx = headerH ?? 0;
    const el = document.querySelector<HTMLElement>(`[data-event-id="${pending.eventId}"]`);
    if (!el) {
      pendingScrollRestoreRef.current = null;
      return;
    }

    const nextTop = el.getBoundingClientRect().top - headerPx;
    const delta = nextTop - pending.topPx;
    if (delta !== 0) window.scrollBy({ top: delta, behavior: 'auto' });
    pendingScrollRestoreRef.current = null;
  }, [events, headerH]);

  const handleDayClick = useCallback(
    async (day: Date) => {
      const key = toLocalYMD(day);

      const scrollToTarget = (el: HTMLElement) => {
        const headerPx = headerH ?? 0;
        const EXTRA_OFFSET_PX = 32;
        const top = window.scrollY + el.getBoundingClientRect().top - headerPx - EXTRA_OFFSET_PX;
        window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      };

      // 1) Try to scroll to an already-loaded anchor.
      let target = document.querySelector<HTMLElement>(`[data-date="${key}"]`);
      if (!target) {
        const firstEvent = events.find((e) => e.date === key);
        if (firstEvent) {
          target = eventRefs.current.get(String(firstEvent.id)) || null;
        }
      }
      if (target) {
        scrollToTarget(target);
        return;
      }

      // 2) Not loaded yet — fetch a chunk around the date and then scroll.
      if (inFlightJumpRef.current) return;
      inFlightJumpRef.current = true;
      setIsJumpLoading(true);
      setError(null);
      setUserScrollSessionKey((x) => x + 1);

      try {
        const qs = new URLSearchParams();
        qs.set('anchor', key);
        qs.set('beforeLimit', String(FEED_PAGE_SIZE));
        qs.set('afterLimit', String(FEED_PAGE_SIZE));
        if (country) qs.set('country', country);
        if (city) qs.set('city', city);

        const res = await apiRequest<unknown>(`v1/gig/around?${qs.toString()}`, 'GET');
        if (!isV1GigAroundGetResponseBody(res)) {
          throw new Error('Invalid API response: expected { before: [], after: [] }');
        }

        const mappedBefore: Event[] = res.before.map((gig) =>
          gigToEvent(gig, { resolveCountryName: (iso) => t('country', iso) }),
        );
        const mappedAfter: Event[] = res.after.map((gig) =>
          gigToEvent(gig, { resolveCountryName: (iso) => t('country', iso) }),
        );

        // Reset the window around the target date so cursors stay consistent.
        setPrevCursor(res.prevCursor);
        setNextCursor(res.nextCursor);

        const windowEvents = mergeUniqueSorted(mappedBefore, mappedAfter);
        setEvents(windowEvents);

        await new Promise<void>((r) => requestAnimationFrame(() => r()));
        target = document.querySelector<HTMLElement>(`[data-date="${key}"]`);
        if (!target) {
          const firstEvent = windowEvents.find((e) => e.date === key);
          if (firstEvent) {
            target = eventRefs.current.get(String(firstEvent.id)) || null;
          }
        }
        if (!target) {
          throw new Error(`Failed to locate target date after load: ${key}`);
        }
        scrollToTarget(target);
      } catch (e) {
        const message = e instanceof Error ? e.message : 'Failed to jump to date.';
        setError(message);
      } finally {
        setIsJumpLoading(false);
        inFlightJumpRef.current = false;
      }
    },
    [city, country, events, headerH, mergeUniqueSorted, t],
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
          {isJumpLoading ? (
            <div
              className="fixed left-1/2 -translate-x-1/2 z-50"
              style={{ top: 'calc(var(--header-h, 44px) + 8px)' }}
              aria-live="polite"
            >
              <div className="rounded-md bg-white/90 backdrop-blur px-3 py-1 text-sm text-gray-700 shadow">
                Jumping…
              </div>
            </div>
          ) : null}
          <div ref={topSentinelRef} className="h-px" aria-hidden />
          {isLoadingPrev ? (
            <div className="py-4 text-center text-gray-500">Loading previous…</div>
          ) : null}
          <FeedMonths events={events} registerEventRef={registerEventRef} />

          <div ref={bottomSentinelRef} className="h-12" aria-hidden />
          {isLoadingNext ? (
            <div className="py-4 text-center text-gray-500">Loading more…</div>
          ) : null}
        </div>
      </main>
    </div>
  );
}
