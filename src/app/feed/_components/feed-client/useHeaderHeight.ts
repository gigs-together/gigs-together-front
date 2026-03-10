'use client';

import { useEffect, useState } from 'react';

export function useHeaderHeight(selector = '[data-app-header]', fallback = 44) {
  const [h, setH] = useState(fallback);

  useEffect(() => {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) {
      document.documentElement.style.setProperty('--header-h', `${fallback}px`);
      return;
    }

    const apply = (px: number) => {
      setH(px);
      document.documentElement.style.setProperty('--header-h', `${px}px`);
    };

    apply(el.offsetHeight);

    const ro = new ResizeObserver(() => {
      apply(el.offsetHeight);
    });
    ro.observe(el);

    return () => ro.disconnect();
  }, [selector, fallback]);

  return h;
}
