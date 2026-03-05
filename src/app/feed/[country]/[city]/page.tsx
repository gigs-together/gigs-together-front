import { redirect } from 'next/navigation';
import FeedClient from '../../_components/FeedClient';
import { getTranslations } from '@/lib/translations.server';
import { I18nProvider } from '@/lib/i18n/I18nProvider';
import { getFeed } from '@/lib/feed.server';
import type { V1TranslationsByNamespace } from '@/lib/translations.server';
import { FEED_PAGE_SIZE } from '@/lib/feed.constants';
import type { Event } from '@/lib/types';
import { gigToEvent } from '@/lib/feed.mapper';
import { DEFAULT_FEED_ROUTE, SUPPORTED_FEED_LOCATIONS } from '@/lib/feed.routes';

const PAGE_SIZE = FEED_PAGE_SIZE;

export const dynamicParams = false;
export const revalidate = 60;

export async function generateStaticParams() {
  return SUPPORTED_FEED_LOCATIONS.map((x) => ({ country: x.country, city: x.city }));
}

const tFromTranslations = (translations: V1TranslationsByNamespace, ns: string) => {
  const normalizedNs = (ns || 'default').toString().trim().toLowerCase();
  return (key: string): string => translations?.[normalizedNs]?.[key]?.value ?? key;
};

export default async function Page(props: PageProps<'/feed/[country]/[city]'>) {
  const { country, city } = await props.params;
  const normalizedCountry = decodeURIComponent(country).trim().toLowerCase();
  const normalizedCity = decodeURIComponent(city).trim().toLowerCase();

  // Currently, we only support one location.
  if (normalizedCountry !== 'es' || normalizedCity !== 'barcelona') {
    redirect(DEFAULT_FEED_ROUTE);
  }

  const i18n = await getTranslations('en', 'country');
  const tCountry = tFromTranslations(i18n.translations, 'country');

  const feed = await getFeed({ page: 1, size: PAGE_SIZE, country, city });
  const initialEvents: Event[] = feed.gigs.map((gig) =>
    gigToEvent(gig, { resolveCountryName: (iso) => tCountry(iso) }),
  );

  return (
    <I18nProvider locale={i18n.locale} translations={i18n.translations}>
      <FeedClient
        country={country}
        city={city}
        initialEvents={initialEvents}
        initialPage={1}
        initialHasMore={feed.gigs.length === PAGE_SIZE}
      />
    </I18nProvider>
  );
}
