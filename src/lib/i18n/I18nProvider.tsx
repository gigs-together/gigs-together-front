'use client';

import React, { createContext, useContext, useMemo } from 'react';
import type { V1TranslationsByNamespace } from '@/lib/translations.server';

export type TParams = Readonly<Record<string, string | number | boolean | null | undefined>>;

export type TFunction = (namespace: string, key: string, params?: TParams) => string;

type I18nContextValue = {
  readonly locale: string;
  readonly translations: V1TranslationsByNamespace;
  readonly t: TFunction;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, rawKey: string) => {
    const v = params[rawKey];
    if (v === null || v === undefined) return match;
    return String(v);
  });
}

export function I18nProvider(props: {
  locale: string;
  translations: V1TranslationsByNamespace;
  children: React.ReactNode;
}) {
  const { locale, translations, children } = props;

  const t: TFunction = useMemo(() => {
    return (namespace, key, params) => {
      const ns = (namespace || 'default').toString().trim().toLowerCase();
      const k = key.toString();
      const entry = translations?.[ns]?.[k];
      const value = entry?.value;
      if (typeof value !== 'string') return k;
      return interpolate(value, params);
    };
  }, [translations]);

  const ctx = useMemo<I18nContextValue>(
    () => ({ locale, translations, t }),
    [locale, translations, t],
  );

  return <I18nContext.Provider value={ctx}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    // Safe fallback (so components won't crash if provider isn't mounted yet).
    const t: TFunction = (_ns, key, params) => {
      void params;
      return key;
    };
    return { locale: 'en', translations: {}, t };
  }
  return ctx;
}

export function useT(): TFunction {
  return useI18n().t;
}
