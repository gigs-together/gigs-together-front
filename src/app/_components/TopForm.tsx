'use client';

import type { MouseEvent } from 'react';
import React, { useMemo, useState } from 'react';
import { cn, toLocalYMD } from '@/lib/utils';
import { FaRegCalendar } from 'react-icons/fa';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import type { Modifiers } from 'react-day-picker';

interface TopFormProps {
  visibleEventDate?: string;
  onDayClick?: (day: Date, modifiers?: Modifiers, e?: MouseEvent) => void;
  availableDates?: string[]; // list of dates that have events (YYYY-MM-DD)
}

const formatDisplayMonth = (dateString?: string) => {
  if (!dateString) return '—';
  // Parse manually to avoid timezone shifts with new Date("YYYY-MM-DD")
  const [y, m] = dateString.split('-').map(Number);
  if (!y || !m) return '—';
  const d = new Date(y, m - 1, 1);
  return `${d.toLocaleString('en-US', { month: 'long' })} ${y}`;
};

const TopForm = ({ visibleEventDate, onDayClick, availableDates }: TopFormProps) => {
  const availableSet = useMemo(() => new Set(availableDates ?? []), [availableDates]);
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(undefined);

  const monthFromVisibleDate = useMemo(() => {
    if (!visibleEventDate) return undefined;
    const [y, m] = visibleEventDate.split('-').map(Number);
    if (!y || !m) return undefined;
    return new Date(y, m - 1, 1);
  }, [visibleEventDate]);

  const handleDayClick = (day: Date, modifiers?: Modifiers, e?: MouseEvent) => {
    if (modifiers?.disabled) return; // ignore clicks on disabled days
    onDayClick?.(day, modifiers, e);
  };

  const disabledMatcher = (date: Date) => !availableSet.has(toLocalYMD(date));

  return (
    <form className={cn('flex w-fit items-center space-x-4 rounded-md sticky top-0')}>
      <Popover
        open={open}
        onOpenChange={(nextOpen) => {
          setOpen(nextOpen);
          if (nextOpen) setMonth(monthFromVisibleDate ?? new Date());
        }}
      >
        <PopoverTrigger type="button" className="flex items-center gap-2 focus:outline-none">
          <span className="inline-flex items-center justify-center gap-2 text-base font-normal text-gray-800 px-2">
            <FaRegCalendar className="text-gray-600" />
            {formatDisplayMonth(visibleEventDate)}
          </span>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="center">
          <Calendar
            mode="single"
            month={month}
            onMonthChange={setMonth}
            disabled={disabledMatcher}
            onDayClick={handleDayClick}
          />
        </PopoverContent>
      </Popover>
    </form>
  );
};

export default TopForm;
