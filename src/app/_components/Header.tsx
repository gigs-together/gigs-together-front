'use client';

import TopForm from '@/app/_components/TopForm';
import { useState, useCallback } from 'react';
import { FaBars, FaGithub, FaTelegramPlane } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationIcon } from '@/components/ui/location-icon';
import { normalizeLocationTitle } from '@/lib/utils';

interface HeaderProps {
  earliestEventDate?: string;
  onDayClick?: (day: Date) => void;
  availableDates?: string[]; // formatted as YYYY-MM-DD
  country: string;
  city: string;
}

export default function Header(props: HeaderProps) {
  const { earliestEventDate, onDayClick, availableDates, country, city } = props;
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationTipOpen, setLocationTipOpen] = useState(false);
  const locationLabel = city ? normalizeLocationTitle(city) : country.toUpperCase();

  const onLogoClick = useCallback(() => {
    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    window.scrollTo({ top: 0, left: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  }, []);

  return (
    <header
      data-app-header
      className="bg-background border-b fixed top-0 left-0 w-full z-50 h-[45px]"
    >
      <div className="w-full px-4 h-full">
        <div className="flex items-center w-full h-full">
          <div className="basis-0 flex-1 shrink-1">
            <h1 className="text-xl font-semibold whitespace-nowrap">
              <button
                type="button"
                onClick={onLogoClick}
                className="cursor-pointer select-none"
                aria-label="Scroll to top"
                title="Scroll to top"
              >
                Gigs<span className="hidden sm:inline"> Together</span>!
              </button>
            </h1>
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4">
            <TopForm
              visibleEventDate={earliestEventDate}
              onDayClick={onDayClick}
              availableDates={availableDates}
            />
          </div>
          <div className="flex-1"></div>
          <div className="flex items-center space-x-4 basis-0 flex-1 shrink-1 justify-end">
            {/* Desktop actions */}
            <div className="hidden sm:flex items-center space-x-4">
              <Popover open={locationTipOpen} onOpenChange={setLocationTipOpen}>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-2 text-base font-normal text-gray-800"
                    aria-label="Current location"
                    title="Location"
                  >
                    <LocationIcon className="h-4 w-4" />
                    {locationLabel}
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto px-3 py-2 text-sm" align="end" side="bottom">
                  Currently, we only support one location: Barcelona.
                </PopoverContent>
              </Popover>
              {!!telegramUrl && (
                <a
                  href={telegramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Telegram"
                >
                  <FaTelegramPlane className="text-xl text-black-500 hover:text-black-700" />
                </a>
              )}
              {!!githubUrl && (
                <a
                  href={githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="GitHub"
                  title="GitHub"
                >
                  <FaGithub className="text-xl text-black-500 hover:text-black-700" />
                </a>
              )}
            </div>

            {/* Mobile menu */}
            <div className="sm:hidden">
              <Popover open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <PopoverTrigger asChild>
                  <button type="button" aria-label="Menu" className="py-1.5 px-0">
                    <FaBars className="text-base text-black-500 hover:text-black-700" />
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-56 p-2">
                  <div className="flex flex-col gap-1">
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-gray-800 hover:bg-muted"
                          aria-label="Current location"
                        >
                          <LocationIcon className="h-4 w-4" />
                          {locationLabel}
                        </button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-64 px-3 py-2 text-sm"
                        align="start"
                        side="bottom"
                      >
                        Currently, we only support one location: Barcelona.
                      </PopoverContent>
                    </Popover>

                    {!!telegramUrl && (
                      <a
                        href={telegramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FaTelegramPlane className="text-lg" />
                        Telegram
                      </a>
                    )}

                    {!!githubUrl && (
                      <a
                        href={githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <FaGithub className="text-lg" />
                        GitHub
                      </a>
                    )}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
