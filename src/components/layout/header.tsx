import TopForm from '@/app/components/TopForm';
import React from 'react';
import { FaGithub, FaTelegramPlane } from 'react-icons/fa';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface HeaderProps {
  earliestEventDate?: string;
  onDayClick?: (day: Date) => void;
  availableDates?: string[]; // formatted as YYYY-MM-DD
}

export default function Header({ earliestEventDate, onDayClick, availableDates }: HeaderProps) {
  const telegramUrl = process.env.NEXT_PUBLIC_TELEGRAM_URL;
  const githubUrl = process.env.NEXT_PUBLIC_GITHUB_URL;

  return (
    <header data-app-header className="bg-background border-b fixed top-0 left-0 w-full z-50">
      <div className="w-full px-4 py-2">
        <div className="flex items-center w-full">
          <div className="basis-0 flex-1 shrink-1">
            <h1 className="text-xl font-semibold">
              Gigs <span className="hidden sm:inline">Together</span>
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
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-2 text-base font-normal text-gray-800"
                  aria-label="Location"
                  title="Location"
                >
                  <svg
                    className="h-4 w-4"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span className="hidden sm:inline">Barcelona</span>
                </button>
              </PopoverTrigger>
              <PopoverContent className="w-auto px-3 py-2 text-sm sm:hidden" align="end">
                Currently, we only support one location: Barcelona.
              </PopoverContent>
            </Popover>
            {!!telegramUrl && (
              <a href={telegramUrl} target="_blank" rel="noopener noreferrer">
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
        </div>
      </div>
    </header>
  );
}
