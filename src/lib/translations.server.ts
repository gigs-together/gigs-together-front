import 'server-only';

import { apiRequest } from '@/lib/api';
import type { Language } from '@/lib/types';

export type TranslationFormat = 'plain' | 'icu';

export type V1TranslationValue = {
  readonly value: string;
  readonly format: TranslationFormat;
};

export type V1TranslationsByNamespace = Readonly<
  Record<string, Readonly<Record<string, V1TranslationValue>>>
>;

export interface V1LanguageGetTranslationsResponseBody {
  readonly locale: string;
  readonly translations: V1TranslationsByNamespace;
}

const TRANSLATIONS_REVALIDATE_SECONDS = 60 * 60; // 1h

// const TRANSLATIONS_TAG_ALL = 'translations';
// const tagLocale = (locale: string) => `translations:locale:${locale}`;
// const tagNamespace = (ns: string) => `translations:ns:${ns}`;

/**
 * Server-side translations loader (cached for 1h).
 *
 * - Uses `accept-language` header by default (primary language tag like "en", "es", "ru")
 * - Supports namespaces: `?namespaces=common,feed`
 * - Adds cache tags so you can manually revalidate via `revalidateTag()`
 */
export async function getTranslations(
  namespaces?: readonly string[],
  language?: Language,
): Promise<V1LanguageGetTranslationsResponseBody> {
  const nsQuery = namespaces?.join(',');

  const acceptLanguage = language;

  const qs = new URLSearchParams();
  if (nsQuery) qs.set('namespaces', nsQuery);

  const url = `/v1/language/translations${qs.size ? `?${qs.toString()}` : ''}`;

  const data = await apiRequest<V1LanguageGetTranslationsResponseBody>(url, 'GET', undefined, {
    headers: acceptLanguage ? { 'accept-language': acceptLanguage } : undefined,
    next: {
      revalidate: TRANSLATIONS_REVALIDATE_SECONDS,
      // tags: [
      //   TRANSLATIONS_TAG_ALL,
      //   ...(acceptLanguage ? [tagLocale(acceptLanguage)] : []),
      //   ...(namespaces ? namespaces.map(tagNamespace) : []),
      // ],
    },
  });

  // Safety net: keep return shape stable even if backend misbehaves.
  if (!data || typeof data !== 'object') {
    return { locale: acceptLanguage ?? 'en', translations: {} };
  }
  if (!data.translations || typeof data.translations !== 'object') {
    return { locale: data.locale ?? acceptLanguage ?? 'en', translations: {} };
  }

  return data;
}
