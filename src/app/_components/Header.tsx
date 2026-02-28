'use client';

import Link from 'next/link';
import type { Route } from 'next';
import dynamic from 'next/dynamic';
import { normalizeLocationTitle } from '@/lib/utils';

const TopForm = dynamic(() => import('@/app/_components/TopForm'), { ssr: false });
const HeaderActions = dynamic(() => import('@/app/_components/HeaderActions'), { ssr: false });

interface HeaderProps {
  earliestEventDate?: string;
  onDayClick?: (day: Date) => void;
  availableDates?: string[]; // formatted as YYYY-MM-DD
  showCalendar?: boolean;
  showSuggestGig?: boolean;
  country: string;
  city: string;
}

export default function Header(props: HeaderProps) {
  const {
    earliestEventDate,
    onDayClick,
    availableDates,
    showCalendar = true,
    showSuggestGig = true,
    country,
    city,
  } = props;
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;
  const suggestGigUrl = showSuggestGig ? process.env.NEXT_PUBLIC_SUGGEST_GIG_LINK : undefined;
  const locationLabel = city ? normalizeLocationTitle(city) : country.toUpperCase();
  const homeHref = (city ? `/feed/${country}/${city}` : `/feed/${country}`) as Route;

  return (
    <header
      data-app-header
      className="bg-background border-b fixed top-0 left-0 w-full z-50 h-[45px]"
    >
      <div className="w-full px-4 h-full">
        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center w-full h-full">
          <div className="min-w-0 justify-self-start">
            <h1 className="text-xl font-semibold whitespace-nowrap">
              <Link
                href={homeHref}
                className="cursor-pointer select-none"
                aria-label="Go to home"
                title="Go to home"
              >
                Gigs<span className="hidden sm:inline"> Together</span>!
              </Link>
            </h1>
          </div>
          <div className="min-w-0 justify-self-center">
            {showCalendar ? (
              <TopForm
                visibleEventDate={earliestEventDate}
                onDayClick={onDayClick}
                availableDates={availableDates}
              />
            ) : null}
          </div>
          <HeaderActions
            locationLabel={locationLabel}
            telegramUrl={telegramUrl}
            githubUrl={githubUrl}
            suggestGigUrl={suggestGigUrl}
          />
        </div>
      </div>
    </header>
  );
}
