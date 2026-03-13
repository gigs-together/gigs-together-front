'use client';

import { useEffect, useRef, useState } from 'react';
import { apiRequest } from '@/lib/api';
import { gigDateToYMD } from '@/lib/feed.mapper';
import type { CalendarDatesStatus } from '@/app/_components/HeaderConfigProvider';
import { isV1GigDatesGetResponseBody } from './utils';

export interface UseCalendarAvailableDatesParams {
  country: string;
  city: string;
  enabled: boolean;
}

export interface UseCalendarAvailableDatesResult {
  availableDates: string[] | undefined;
  status: CalendarDatesStatus;
  error: string | undefined;
}

export function useCalendarAvailableDates(
  params: UseCalendarAvailableDatesParams,
): UseCalendarAvailableDatesResult {
  const { country, city, enabled } = params;

  const [availableDates, setAvailableDates] = useState<string[] | undefined>();
  const [status, setStatus] = useState<CalendarDatesStatus>('loading');
  const [error, setError] = useState<string | undefined>(undefined);

  const calendarAbortRef = useRef<AbortController | null>(null);
  const calendarRequestSeqRef = useRef<number>(0);
  const calendarDatesLoadedForLocationRef = useRef<string | null>(null);
  const lastLocationKeyRef = useRef<string | null>(null);

  useEffect(() => {
    const locationKey = `${country}|${city}`;

    if (lastLocationKeyRef.current !== locationKey) {
      lastLocationKeyRef.current = locationKey;
      calendarDatesLoadedForLocationRef.current = null;
      setStatus('loading');
      setError(undefined);
      setAvailableDates(undefined);
    }

    if (!enabled) return;
    if (calendarDatesLoadedForLocationRef.current === locationKey) return;

    const ac = new AbortController();
    calendarAbortRef.current?.abort();
    calendarAbortRef.current = ac;
    const seq = (calendarRequestSeqRef.current += 1);
    const timeoutId = window.setTimeout(() => {
      ac.abort();
    }, 15_000);

    setStatus('loading');
    setError(undefined);
    setAvailableDates(undefined);

    const run = async () => {
      try {
        const qs = new URLSearchParams();
        if (country) qs.set('country', country);
        if (city) qs.set('city', city);

        const res = await apiRequest<unknown>(`v1/gig/dates?${qs.toString()}`, 'GET', undefined, {
          signal: ac.signal,
        });

        if (!isV1GigDatesGetResponseBody(res)) {
          throw new Error('Invalid API response: expected { dates: (string | number)[] }');
        }

        const ymd = res.dates.map((x) => gigDateToYMD(String(x)));
        const unique = Array.from(new Set(ymd)).sort();

        if (ac.signal.aborted) return;
        if (seq !== calendarRequestSeqRef.current) return;

        setAvailableDates(unique);
        setStatus('ready');
        calendarDatesLoadedForLocationRef.current = locationKey;
      } catch (e) {
        if (ac.signal.aborted) return;
        if (seq !== calendarRequestSeqRef.current) return;

        const message = e instanceof Error ? e.message : 'Failed to load calendar dates.';
        setStatus('error');
        setError(message);
        setAvailableDates(undefined);
      } finally {
        window.clearTimeout(timeoutId);
        if (calendarAbortRef.current === ac) calendarAbortRef.current = null;
      }
    };

    void run();
    return () => {
      window.clearTimeout(timeoutId);
      ac.abort();
    };
  }, [city, country, enabled]);

  return { availableDates, status, error };
}
