import React from 'react';
import { useRef } from 'react';
import { FaRegCalendar } from 'react-icons/fa';

type MonthSectionProps = {
  children: React.ReactNode;
  title: string;
  date: string;
  showDivider?: boolean;
};

export function MonthSection({ children, title, date, showDivider = true }: MonthSectionProps) {
  const monthRef = useRef<HTMLDivElement>(null);

  return (
    <div id={'month-' + date} ref={monthRef} className="flex flex-col w-full">
      {showDivider ? (
        <div className="w-full border-b border-gray-200 dark:border-gray-700 mt-6 mb-10 relative">
          <span className="inline-flex items-center justify-center gap-2 text-base leading-none font-normal text-gray-800 dark:text-gray-100 px-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 w-[20ch]">
            <FaRegCalendar className="text-gray-600 dark:text-gray-300" />
            {title}
          </span>
        </div>
      ) : null}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {children}
      </div>
    </div>
  );
}
