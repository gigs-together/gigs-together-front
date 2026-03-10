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
  const [loading, setLoading] = useState(() => initialEvents === undefined);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | undefined>(() => initialNextCursor);

  const eventRefs = useRef<Map<string, HTMLElement>>(new Map());
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const hasUserScrolledRef = useRef(false);
  const inFlightRef = useRef(false);

  const lastAutoScrolledHashRef = useRef<string | null>(null);
  const autoHighlightTimeoutRef = useRef<number | undefined>(undefined);

  const anchorsRef = useRef<HTMLElement[]>([]);
  const pendingVisibleDateRef = useRef<string | undefined>(undefined);
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  const [visibleEventDate, setVisibleEventDate] = useState<string | undefined>();

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
          setLoading(true);
          setError(null);
        } else {
          setLoadingMore(true);
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
        setLoading(false);
        setLoadingMore(false);
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
      setLoading(false);
      setLoadingMore(false);
      inFlightRef.current = false;
      return;
    }

    void fetchPage('replace');
  }, [country, city, fetchPage, initialEvents, initialNextCursor]);

  const hasMore = Boolean(nextCursor);
  const loadMore = useCallback(() => {
    if (loading || loadingMore || !nextCursor) return;
    void fetchPage('append', { cursor: nextCursor });
  }, [fetchPage, loading, loadingMore, nextCursor]);

  const {
    availableDates: calendarAvailableDates,
    status: calendarDatesStatus,
    error: calendarDatesError,
  } = useCalendarAvailableDates({
    country,
    city,
    enabled: !loading && !error,
  });

  const scheduleVisibleDateCommit = useCallback((next: string | undefined) => {
    if (debounceTimeoutRef.current) window.clearTimeout(debounceTimeoutRef.current);
    debounceTimeoutRef.current = window.setTimeout(() => {
      setVisibleEventDate(next);
    }, 150);
  }, []);

  const computeActiveDate = useCallback(() => {
    const headerPx = headerH ?? 0;
    const anchors = anchorsRef.current;
    if (!anchors || anchors.length === 0) return;

    // Switch to the next anchor a bit *before* it touches the header.
    const EARLY_SWITCH_PX = 40;

    const withTop = anchors.map((el) => ({ el, top: el.getBoundingClientRect().top - headerPx }));
    const firstBelow = withTop.filter((x) => x.top >= 0).sort((a, b) => a.top - b.top)[0];
    const closestAbove = withTop.filter((x) => x.top < 0).sort((a, b) => b.top - a.top)[0];
    const targetEl = (
      firstBelow && firstBelow.top < EARLY_SWITCH_PX ? firstBelow : (closestAbove ?? firstBelow)
    )?.el as HTMLElement | undefined;

    const next = targetEl?.dataset.date;
    if (pendingVisibleDateRef.current === next) return;
    pendingVisibleDateRef.current = next;
    scheduleVisibleDateCommit(next);
  }, [headerH, scheduleVisibleDateCommit]);

  useEffect(() => {
    anchorsRef.current = Array.from(document.querySelectorAll('[data-date]')) as HTMLElement[];
    requestAnimationFrame(() => computeActiveDate());
  }, [events, computeActiveDate]);

  useEffect(() => {
    requestAnimationFrame(() => computeActiveDate());
  }, [computeActiveDate, headerH]);

  useEffect(() => {
    let ticking = false;
    let frameId: number | undefined;

    const schedule = () => {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(() => {
        computeActiveDate();
        ticking = false;
      });
    };

    const onScroll = () => {
      hasUserScrolledRef.current = true;
      schedule();
    };
    const onResize = () => schedule();

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, [computeActiveDate]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) window.clearTimeout(debounceTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    const hash = window.location.hash;
    if (!hash) {
      lastAutoScrolledHashRef.current = null;
      return;
    }
    if (lastAutoScrolledHashRef.current === hash) return;

    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) return;

    const el = document.getElementById(id);
    if (!el) return;

    lastAutoScrolledHashRef.current = hash;
    requestAnimationFrame(() => {
      el.scrollIntoView({ block: 'start', inline: 'nearest' });
      el.classList.remove('gig-anchor-auto');
      // Force a reflow so the class removal is committed and the CSS animation
      // reliably restarts when we add the class again.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetWidth;
      el.classList.add('gig-anchor-auto');

      if (autoHighlightTimeoutRef.current) {
        window.clearTimeout(autoHighlightTimeoutRef.current);
      }
      autoHighlightTimeoutRef.current = window.setTimeout(() => {
        el.classList.remove('gig-anchor-auto');
      }, 1800);
    });
  }, [events]);

  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        if (!hasUserScrolledRef.current) return;
        if (!hasMore || loading || loadingMore) return;
        loadMore();
      },
      {
        root: null,
        rootMargin: '400px 0px',
        threshold: 0,
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, loadMore, loading, loadingMore]);

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

  if (loading) {
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

          <div ref={loadMoreRef} className="h-12" aria-hidden />
          {loadingMore ? <div className="py-4 text-center text-gray-500">Loading more…</div> : null}
        </div>
      </main>
    </div>
  );
}
