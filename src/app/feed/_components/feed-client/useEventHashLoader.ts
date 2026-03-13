'use client';

import { useCallback, useEffect, useRef } from 'react';
import type { FeedLoadingAction } from './feedLoading';

export interface UseEventHashLoaderParams {
  readonly isEnabled: boolean;
  readonly isBusyRef: Readonly<{ current: boolean }>;
  readonly setIsBusy: (next: boolean) => void;
  readonly dispatchLoading: (action: FeedLoadingAction) => void;
  readonly setError: (message: string | null) => void;
  readonly bumpUserScrollSessionKey: () => void;
  readonly resolveAnchorYmdByEventId: (eventId: string) => Promise<string>;
  readonly loadAroundAndReplace: (anchorYmd: string) => Promise<void>;
}

export function useEventHashLoader(params: UseEventHashLoaderParams): void {
  const {
    isEnabled,
    isBusyRef,
    setIsBusy,
    dispatchLoading,
    setError,
    bumpUserScrollSessionKey,
    resolveAnchorYmdByEventId,
    loadAroundAndReplace,
  } = params;

  const lastMissingHashTargetRef = useRef<string | null>(null);

  const ensureHashTargetLoaded = useCallback(async () => {
    if (!isEnabled) return;

    const hash = window.location.hash;
    if (!hash) {
      lastMissingHashTargetRef.current = null;
      return;
    }

    const id = hash.startsWith('#') ? hash.slice(1) : hash;
    if (!id) return;

    const el = document.getElementById(id);
    if (el) {
      lastMissingHashTargetRef.current = null;
      return;
    }

    if (isBusyRef.current) return;
    if (lastMissingHashTargetRef.current === id) return;
    lastMissingHashTargetRef.current = id;

    setIsBusy(true);
    dispatchLoading({ type: 'jump:start' });
    setError(null);
    bumpUserScrollSessionKey();

    try {
      const anchorYmd = await resolveAnchorYmdByEventId(id);
      await loadAroundAndReplace(anchorYmd);

      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const after = document.getElementById(id);
      if (!after) {
        throw new Error(`Failed to locate target event after load: ${id}`);
      }
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Failed to load event anchor.';
      setError(message);
    } finally {
      dispatchLoading({ type: 'jump:end' });
      setIsBusy(false);
    }
  }, [
    bumpUserScrollSessionKey,
    dispatchLoading,
    isBusyRef,
    isEnabled,
    loadAroundAndReplace,
    resolveAnchorYmdByEventId,
    setError,
    setIsBusy,
  ]);

  useEffect(() => {
    const onHashChange = () => {
      void ensureHashTargetLoaded();
    };
    window.addEventListener('hashchange', onHashChange);
    void ensureHashTargetLoaded();
    return () => window.removeEventListener('hashchange', onHashChange);
  }, [ensureHashTargetLoaded]);
}
