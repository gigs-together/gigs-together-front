'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Event } from '@/lib/types';

export interface UseVisibleEventDateOnScrollParams {
  readonly events: Event[];
  readonly headerOffsetPx: number;
  readonly anchorSelector?: string;
  readonly debounceMs?: number;
  readonly earlySwitchPx?: number;
}

export interface UseVisibleEventDateOnScrollResult {
  readonly visibleEventDate: string | undefined;
}

export function useVisibleEventDateOnScroll(
  params: UseVisibleEventDateOnScrollParams,
): UseVisibleEventDateOnScrollResult {
  const {
    events,
    headerOffsetPx,
    anchorSelector = '[data-date]',
    debounceMs = 150,
    earlySwitchPx = 40,
  } = params;

  const anchorsRef = useRef<HTMLElement[]>([]);
  const pendingVisibleDateRef = useRef<string | undefined>(undefined);
  const debounceTimeoutRef = useRef<number | undefined>(undefined);

  const [visibleEventDate, setVisibleEventDate] = useState<string | undefined>();

  const scheduleVisibleDateCommit = useCallback(
    (next: string | undefined) => {
      if (debounceTimeoutRef.current) window.clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = window.setTimeout(() => {
        setVisibleEventDate(next);
      }, debounceMs);
    },
    [debounceMs],
  );

  const computeActiveDate = useCallback(() => {
    const anchors = anchorsRef.current;
    if (!anchors || anchors.length === 0) return;

    const withTop = anchors.map((el) => ({
      el,
      top: el.getBoundingClientRect().top - headerOffsetPx,
    }));
    const firstBelow = withTop.filter((x) => x.top >= 0).sort((a, b) => a.top - b.top)[0];
    const closestAbove = withTop.filter((x) => x.top < 0).sort((a, b) => b.top - a.top)[0];
    const targetEl = (
      firstBelow && firstBelow.top < earlySwitchPx ? firstBelow : (closestAbove ?? firstBelow)
    )?.el;

    const next = targetEl?.dataset.date;
    if (pendingVisibleDateRef.current === next) return;
    pendingVisibleDateRef.current = next;
    scheduleVisibleDateCommit(next);
  }, [earlySwitchPx, headerOffsetPx, scheduleVisibleDateCommit]);

  useEffect(() => {
    anchorsRef.current = Array.from(document.querySelectorAll<HTMLElement>(anchorSelector));
    requestAnimationFrame(() => computeActiveDate());
  }, [anchorSelector, computeActiveDate, events]);

  useEffect(() => {
    requestAnimationFrame(() => computeActiveDate());
  }, [computeActiveDate, headerOffsetPx]);

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

    const onScroll = () => schedule();
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

  return { visibleEventDate };
}
