'use client';

import { usePathname } from 'next/navigation';
import Header from '@/app/_components/Header';
import { useHeaderConfig } from '@/app/_components/HeaderConfigProvider';

const DEFAULT_COUNTRY = 'es';
const DEFAULT_CITY = 'barcelona';

function getLocationFromPath(pathname: string): { country: string; city: string } {
  // Expected: /feed/[country]/[city]
  // Also accept: /feed/[country]
  const m = /^\/feed\/([^/]+)(?:\/([^/]+))?/.exec(pathname);
  if (!m) return { country: DEFAULT_COUNTRY, city: DEFAULT_CITY };

  const country =
    decodeURIComponent(m[1] ?? '')
      .trim()
      .toLowerCase() || DEFAULT_COUNTRY;
  const city =
    decodeURIComponent(m[2] ?? '')
      .trim()
      .toLowerCase() || DEFAULT_CITY;

  return { country, city };
}

export default function AppHeader() {
  const pathname = usePathname() ?? '/';
  const { config } = useHeaderConfig();
  const isFeed = pathname === '/feed' || pathname.startsWith('/feed/');
  const isGigForm = pathname === '/gig-form' || pathname.startsWith('/gig-form/');
  const { country, city } = getLocationFromPath(pathname);

  return (
    <Header
      country={country}
      city={city}
      showCalendar={isFeed}
      showSuggestGig={!isGigForm}
      earliestEventDate={config.earliestEventDate}
      availableDates={config.availableDates}
      onDayClick={config.onDayClick}
    />
  );
}
