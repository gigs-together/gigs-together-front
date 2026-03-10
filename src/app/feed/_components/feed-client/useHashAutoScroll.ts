'use client';

import { useEffect, useRef } from 'react';
import type { Event } from '@/lib/types';

export interface UseHashAutoScrollParams {
  readonly events: Event[];
  readonly highlightClass?: string;
  readonly highlightDurationMs?: number;
}

export function useHashAutoScroll(params: UseHashAutoScrollParams) {
  const { events, highlightClass = 'gig-anchor-auto', highlightDurationMs = 1800 } = params;

  const lastAutoScrolledHashRef = useRef<string | null>(null);
  const autoHighlightTimeoutRef = useRef<number | undefined>(undefined);

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
      el.classList.remove(highlightClass);
      // Force a reflow so the class removal is committed and the CSS animation
      // reliably restarts when we add the class again.
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions
      el.offsetWidth;
      el.classList.add(highlightClass);

      if (autoHighlightTimeoutRef.current) {
        window.clearTimeout(autoHighlightTimeoutRef.current);
      }
      autoHighlightTimeoutRef.current = window.setTimeout(() => {
        el.classList.remove(highlightClass);
      }, highlightDurationMs);
    });
  }, [events, highlightClass, highlightDurationMs]);

  useEffect(() => {
    return () => {
      if (autoHighlightTimeoutRef.current) window.clearTimeout(autoHighlightTimeoutRef.current);
    };
  }, []);
}
