'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';
import type { Event } from '@/lib/types';

export interface ScrollAnchor {
  readonly eventId: string;
  readonly topPx: number;
}

export interface UsePrependScrollRestoreParams {
  readonly events: readonly Event[];
  readonly headerOffsetPx: number;
}

export interface UsePrependScrollRestoreResult {
  readonly capture: () => void;
  readonly clear: () => void;
}

export function usePrependScrollRestore(
  params: UsePrependScrollRestoreParams,
): UsePrependScrollRestoreResult {
  const { events, headerOffsetPx } = params;
  const pendingRef = useRef<ScrollAnchor | null>(null);

  const clear = useCallback(() => {
    pendingRef.current = null;
  }, []);

  const capture = useCallback(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-event-id]'));
    if (els.length === 0) return;

    let bestBelow: { el: HTMLElement; top: number } | null = null;
    let bestAbove: { el: HTMLElement; top: number } | null = null;

    for (const el of els) {
      const top = el.getBoundingClientRect().top - headerOffsetPx;
      if (top >= 0) {
        if (!bestBelow || top < bestBelow.top) bestBelow = { el, top };
      } else {
        if (!bestAbove || top > bestAbove.top) bestAbove = { el, top };
      }
    }

    const target = (bestBelow ?? bestAbove)?.el;
    const topPx = (bestBelow ?? bestAbove)?.top;
    const eventId = target?.dataset.eventId;
    if (!target || topPx === undefined || !eventId) return;
    pendingRef.current = { eventId, topPx };
  }, [headerOffsetPx]);

  useLayoutEffect(() => {
    const pending = pendingRef.current;
    if (!pending) return;

    const el = document.querySelector<HTMLElement>(`[data-event-id="${pending.eventId}"]`);
    if (!el) {
      pendingRef.current = null;
      return;
    }

    const nextTop = el.getBoundingClientRect().top - headerOffsetPx;
    const delta = nextTop - pending.topPx;
    if (delta !== 0) window.scrollBy({ top: delta, behavior: 'auto' });
    pendingRef.current = null;
  }, [events, headerOffsetPx]);

  return { capture, clear };
}
