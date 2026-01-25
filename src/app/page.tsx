'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import styles from './page.module.css';
import Header from '@/components/layout/header';
import { toLocalYMD } from '@/lib/utils';

import './style.css';
import { MonthSection } from './components/MonthSection';
import { Card } from './components/GigCard';
import type { Event, V1GigGetResponseBody } from '@/types';
import { FaRegCalendar } from 'react-icons/fa';
import { apiRequest } from '@/lib/api';
import { gigDtoToEvent } from '@/lib/gigs';

const DEFAULT_LOCALE = 'en-US';
const PAGE_SIZE = 30;

const formatMonthTitle = (date: string): string => {
  return (
    new Date(date).toLocaleString(DEFAULT_LOCALE, { month: 'long' }) + ' ' + date.split('-')[0]
  );
};

const formatFullDate = (dateString?: string) => {
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

function useHeaderHeight(selector = '[data-app-header]', fallback = 44) {
  const [h, setH] = useState(fallback);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) {
      // Still set the CSS variable using the fallback
      document.documentElement.style.setProperty('--header-h', `${fallback}px`);
      return;
    }

    const apply = (px: number) => {
      setH(px);
      // Store the variable globally; you can set it on your scroll container if it's separate
      document.documentElement.style.setProperty('--header-h', `${px}px`);
    };

    // Initial measurement
    apply(el.offsetHeight);

    const ro = new ResizeObserver(() => {
      apply(el.offsetHeight);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [selector, fallback]);

  return h; // value in pixels
}

export default function Home() {
  const headerH = useHeaderHeight(); // will pick [data-app-header], fallback 44

  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  // Raw date from observer (updates on every scroll tick)
  const [rawVisibleEventDate, setRawVisibleEventDate] = useState<string | undefined>();
  // Debounced date passed to the header (stabilized)
  const [visibleEventDate, setVisibleEventDate] = useState<string | undefined>();

  const eventRefs = useRef<Map<string, HTMLElement>>(new Map());
  const scrollContainerRef = useRef<HTMLElement>();
  const headerOffsetHeightRef = useRef<number>();
  const anchorsRef = useRef<HTMLElement[]>([]);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const inFlightRef = useRef(false);
  const hasUserScrolledRef = useRef(false);

  // list of dates that actually have events (YYYY-MM-DD) — used to disable other days in the calendar
  const availableDates = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) set.add(e.date);
    return Array.from(set).sort();
  }, [events]);

  // Debounce raw visible date changes to avoid header jitter while scrolling
  useEffect(() => {
    if (!rawVisibleEventDate) {
      setVisibleEventDate(undefined);
      return;
    }
    const id = setTimeout(() => setVisibleEventDate(rawVisibleEventDate), 150);
    return () => clearTimeout(id);
  }, [rawVisibleEventDate]);

  useEffect(() => {
    headerOffsetHeightRef.current = headerH;
  }, [headerH]);

  const fetchPage = useCallback(async (nextPage: number, mode: 'replace' | 'append') => {
    if (inFlightRef.current) return;
    inFlightRef.current = true;

    const qs = new URLSearchParams();
    qs.set('page', String(nextPage));
    qs.set('size', String(PAGE_SIZE));
    qs.set('country', 'ES');
    qs.set('city', 'Barcelona');

    try {
      if (mode === 'replace') {
        setLoading(true);
        setError(null);
      } else {
        setLoadingMore(true);
      }

      const res = await apiRequest<V1GigGetResponseBody>(`v1/gig?${qs.toString()}`, 'GET');

      const pageOffset = (nextPage - 1) * PAGE_SIZE;
      const mapped = res.gigs.map((gig, idx) => gigDtoToEvent(gig, pageOffset + idx));

      setEvents((prev) => {
        const merged = mode === 'replace' ? mapped : [...prev, ...mapped];
        // Important: don't de-dupe on date/title/etc, otherwise distinct events can disappear.
        merged.sort((a, b) => a.date.localeCompare(b.date));
        return merged;
      });

      setPage(nextPage);
      // Stop when backend returns fewer than requested (or nothing).
      setHasMore(res.gigs.length === PAGE_SIZE);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
      setLoadingMore(false);
      inFlightRef.current = false;
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchPage(1, 'replace');
  }, [fetchPage]);

  // Don't auto-load more until the user scrolls (prevents "burst" requests on short lists)
  useEffect(() => {
    const onScroll = () => {
      hasUserScrolledRef.current = true;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Infinite scroll: when sentinel becomes visible, load next page
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        if (!hasUserScrolledRef.current) return;
        if (loading || loadingMore || !hasMore) return;
        fetchPage(page + 1, 'append');
      },
      {
        root: null, // viewport (works with window scroll)
        rootMargin: '400px 0px',
        threshold: 0,
      },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [loading, loadingMore, hasMore, page, fetchPage]);

  const eventsByMonth = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    events.forEach((event) => {
      const monthYear = event.date.split('-').slice(0, 2).join('-');
      grouped[monthYear] = grouped[monthYear] || [];
      grouped[monthYear].push(event);
    });
    return grouped;
  }, [events]);

  const months = useMemo(() => {
    return Object.keys(eventsByMonth)
      .sort()
      .map((date) => ({
        date: date + '-01',
        events: eventsByMonth[date],
      }));
  }, [eventsByMonth]);

  const computeActiveDate = useCallback(() => {
    const headerH = headerOffsetHeightRef.current ?? 0;
    const anchors = anchorsRef.current;
    if (!anchors || anchors.length === 0) return;

    const withTop = anchors.map((el) => ({ el, top: el.getBoundingClientRect().top - headerH }));
    const firstBelow = withTop.filter((x) => x.top >= 0).sort((a, b) => a.top - b.top)[0];
    const closestAbove = withTop.filter((x) => x.top < 0).sort((a, b) => b.top - a.top)[0];
    const targetEl = (closestAbove ?? firstBelow)?.el as HTMLElement | undefined;
    const dateAttr = targetEl?.dataset.date;
    if (dateAttr) setRawVisibleEventDate((prev) => (prev === dateAttr ? prev : dateAttr));
  }, []);

  // Observe anchors list after events render and compute initial active date
  useEffect(() => {
    // Use [data-date] anchors as the single source of truth
    anchorsRef.current = Array.from(document.querySelectorAll('[data-date]')) as HTMLElement[];
    // Compute once after anchors update
    computeActiveDate();
  }, [events, computeActiveDate]);

  // Scroll + resize handler using rAF for stability
  useEffect(() => {
    let ticking = false,
      frameId: number | undefined;

    const onScrollOrResize = () => {
      if (ticking) return;
      ticking = true;
      frameId = requestAnimationFrame(() => {
        computeActiveDate();
        ticking = false;
      });
    };

    window.addEventListener('scroll', onScrollOrResize, { passive: true });
    window.addEventListener('resize', onScrollOrResize);

    return () => {
      window.removeEventListener('scroll', onScrollOrResize);
      window.removeEventListener('resize', onScrollOrResize);
      if (frameId) {
        cancelAnimationFrame(frameId);
      }
    };
  }, [computeActiveDate]);

  // Register event element refs
  const registerEventRef = useCallback((eventId: string, element: HTMLElement | null) => {
    if (element) {
      eventRefs.current.set(eventId, element);
    } else {
      eventRefs.current.delete(eventId);
    }
  }, []);

  if (loading) {
    return (
      <div className={styles.page}>
        <Header />
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
      <div className={styles.page}>
        <Header />
        <main className={styles.main}>
          <div className="flex justify-center items-center h-96">
            <div className="text-lg text-red-600">Error: {error}</div>
          </div>
        </main>
      </div>
    );
  }

  const handleDayClick = (day: Date) => {
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

    target.scrollIntoView({ behavior: 'smooth', block: 'start', inline: 'nearest' });
  };

  return (
    <div className={styles.page}>
      <Header
        earliestEventDate={visibleEventDate}
        onDayClick={handleDayClick}
        availableDates={availableDates}
      />
      <main
        className={styles.main}
        ref={(el) => {
          if (el) scrollContainerRef.current = el;
        }}
      >
        <div className="px-8 md:px-16 py-8">
          {events.length === 0 ? (
            <div className="text-center py-12">
              <h2 className="text-xl text-gray-600">No events found</h2>
              <p className="text-gray-500 mt-2">Check back later for upcoming events!</p>
            </div>
          ) : (
            months.map((day, monthIdx) => {
              const eventsByDay: Record<string, Event[]> = {};
              day.events.forEach((ev) => {
                eventsByDay[ev.date] = eventsByDay[ev.date] || [];
                eventsByDay[ev.date].push(ev);
              });

              const orderedDates = Object.keys(eventsByDay).sort();

              return (
                <MonthSection key={day.date} title={formatMonthTitle(day.date)} date={day.date}>
                  {orderedDates.map((dateStr, i) => (
                    <div key={dateStr} className="contents">
                      <div
                        data-date={dateStr}
                        className="col-span-full h-0 overflow-hidden scroll-mt-[calc(var(--header-h)_-_10px)]"
                        aria-hidden
                      />

                      {monthIdx === 0 && i === 0 ? null : (
                        <div className="col-span-full">
                          <div
                            data-date={dateStr}
                            className="w-full border-b border-gray-200 my-6 relative scroll-mt-[calc(var(--header-h)-_10px)]"
                          >
                            <span className="inline-flex items-center gap-2 text-base leading-none font-normal text-gray-800 px-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white w-[20ch]">
                              <FaRegCalendar className="text-gray-600" />
                              {formatFullDate(dateStr)}
                            </span>
                          </div>
                        </div>
                      )}

                      {eventsByDay[dateStr].map((event) => (
                        <div
                          key={event.id}
                          data-event-id={event.id}
                          ref={(el) => registerEventRef(event.id, el)}
                        >
                          <Card gig={event} />
                        </div>
                      ))}
                    </div>
                  ))}
                </MonthSection>
              );
            })
          )}

          {/* Infinite scroll sentinel */}
          <div ref={loadMoreRef} className="h-12" aria-hidden />
          {loadingMore ? <div className="py-4 text-center text-gray-500">Loading more…</div> : null}
        </div>
      </main>
    </div>
  );
}
