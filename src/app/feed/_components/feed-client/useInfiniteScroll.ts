'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

export interface UseInfiniteScrollParams {
  readonly isEnabled: boolean;
  readonly hasMore: boolean;
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly onLoadMore: () => void;
  readonly rootMargin?: string;
}

export interface UseInfiniteScrollResult {
  readonly sentinelRef: (node: HTMLDivElement | null) => void;
}

export function useInfiniteScroll(params: UseInfiniteScrollParams): UseInfiniteScrollResult {
  const {
    isEnabled,
    hasMore,
    isLoading,
    isLoadingMore,
    onLoadMore,
    rootMargin = '400px 0px',
  } = params;

  const hasUserScrolledRef = useRef(false);
  const [sentinel, setSentinel] = useState<HTMLDivElement | null>(null);

  const sentinelRef = useCallback((node: HTMLDivElement | null) => {
    setSentinel(node);
  }, []);

  useEffect(() => {
    if (!isEnabled) return;

    const onScroll = () => {
      hasUserScrolledRef.current = true;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [isEnabled]);

  useEffect(() => {
    if (!isEnabled) return;
    if (!sentinel) return;

    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (!hit) return;
        if (!hasUserScrolledRef.current) return;
        if (!hasMore || isLoading || isLoadingMore) return;
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
  }, [isEnabled, hasMore, isLoading, isLoadingMore, onLoadMore, rootMargin, sentinel]);

  return { sentinelRef };
}
