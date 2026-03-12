'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseInfiniteScrollParams {
  readonly isEnabled: boolean;
  readonly canLoadMore: boolean;
  readonly isLoading: boolean;
  readonly onLoadMore: () => void;
  readonly rootMargin?: string;
  readonly requiresUserScroll?: boolean;
  readonly resetUserScrollKey?: string | number;
}

export interface UseInfiniteScrollResult {
  readonly sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useInfiniteScroll(params: UseInfiniteScrollParams): UseInfiniteScrollResult {
  const {
    isEnabled,
    isLoading,
    canLoadMore,
    onLoadMore,
    rootMargin = '400px 0px',
    requiresUserScroll = true,
    resetUserScrollKey,
  } = params;

  const hasUserScrolledRef = useRef(false);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinel(node);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    if (!requiresUserScroll) return;

    const mark = () => {
      hasUserScrolledRef.current = true;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const keys = new Set(['ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End', ' ']);
      if (keys.has(e.key)) mark();
    };

    window.addEventListener('wheel', mark, { passive: true });
    window.addEventListener('touchstart', mark, { passive: true });
    window.addEventListener('pointerdown', mark, { passive: true });
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('wheel', mark);
      window.removeEventListener('touchstart', mark);
      window.removeEventListener('pointerdown', mark);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isEnabled, requiresUserScroll]);

  useEffect(() => {
    hasUserScrolledRef.current = false;
  }, [resetUserScrollKey]);

  useEffect(() => {
    if (!isEnabled) return;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        if (requiresUserScroll && !hasUserScrolledRef.current) return;
        if (!canLoadMore || isLoading) return;
        onLoadMore();
      },
      {
        root: null,
        rootMargin,
        threshold: 0,
      },
    );

    io.observe(sentinel);
    return () => io.disconnect();
  }, [isEnabled, canLoadMore, isLoading, onLoadMore, requiresUserScroll, rootMargin, sentinel]);

  return { sentinelRef };
}
