'use client';

import { useState } from 'react';
import { FaBars, FaGithub, FaRegLightbulb, FaTelegramPlane } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LocationIcon } from '@/components/ui/location-icon';

export default function HeaderActions(props: {
  locationLabel: string;
  telegramUrl?: string;
  githubUrl?: string;
  suggestGigUrl?: string;
}) {
  const { locationLabel, telegramUrl, githubUrl, suggestGigUrl } = props;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [locationTipOpen, setLocationTipOpen] = useState(false);

  return (
    <div className="min-w-0 justify-self-end flex items-center space-x-4">
      {/* Desktop actions */}
      <div className="hidden sm:flex items-center space-x-4">
        <Popover open={locationTipOpen} onOpenChange={setLocationTipOpen}>
          <PopoverTrigger
            type="button"
            className="flex items-center gap-2 text-base font-normal text-gray-800"
            aria-label="Current location"
            title="Location"
          >
            <LocationIcon className="h-4 w-4" />
            {locationLabel}
          </PopoverTrigger>
          <PopoverContent className="w-auto px-3 py-2 text-sm" align="end" side="bottom">
            Currently, we only support one location: Barcelona.
          </PopoverContent>
        </Popover>

        {!!suggestGigUrl && (
          <a
            href={suggestGigUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md bg-black px-2 py-1.5 text-sm font-medium text-white hover:bg-black/90 whitespace-nowrap lg:px-3"
            aria-label="Suggest a gig"
            title="Suggest a gig"
          >
            <span className="hidden lg:inline">Suggest a gig</span>
            <FaRegLightbulb className="text-[1.05em] lg:hidden" aria-hidden />
          </a>
        )}

        {!!telegramUrl && (
          <a href={telegramUrl} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
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
          <PopoverTrigger type="button" aria-label="Menu" className="py-1.5 px-0">
            <FaBars className="text-base text-black-500 hover:text-black-700" />
          </PopoverTrigger>
          <PopoverContent align="end" className="w-56 p-2">
            <div className="flex flex-col gap-1">
              {!!suggestGigUrl && (
                <>
                  <a
                    href={suggestGigUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 rounded-md px-2 py-2 text-sm hover:bg-muted"
                    onClick={() => setMobileMenuOpen(false)}
                    aria-label="Suggest a gig"
                  >
                    <FaRegLightbulb className="h-4 w-4" />
                    Suggest a gig
                  </a>
                  <div className="my-0.5 h-px w-full bg-border/40" aria-hidden />
                </>
              )}

              <Popover>
                <PopoverTrigger
                  type="button"
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-gray-800 hover:bg-muted"
                  aria-label="Current location"
                >
                  <LocationIcon className="h-4 w-4" />
                  {locationLabel}
                </PopoverTrigger>
                <PopoverContent className="w-64 px-3 py-2 text-sm" align="start" side="bottom">
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
                  <FaGithub className="h-4 w-4" />
                  GitHub
                </a>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
}
