'use client';

import { useEffect } from 'react';
import type { HeaderConfig } from '@/app/_components/HeaderConfigProvider';
import type { CalendarDatesStatus } from '@/app/_components/HeaderConfigProvider';

export interface UseFeedHeaderConfigSyncParams {
  setHeaderConfig: (next: HeaderConfig) => void;
  visibleEventDate: string | undefined;
  availableDates: string[] | undefined;
  calendarDatesStatus: CalendarDatesStatus;
  calendarDatesError: string | undefined;
  onDayClick: (day: Date) => void;
}

export function useFeedHeaderConfigSync(params: UseFeedHeaderConfigSyncParams) {
  const {
    setHeaderConfig,
    visibleEventDate,
    availableDates,
    calendarDatesStatus,
    calendarDatesError,
    onDayClick,
  } = params;

  useEffect(() => {
    setHeaderConfig({
      earliestEventDate: visibleEventDate,
      availableDates,
      calendarDatesStatus,
      calendarDatesError,
      onDayClick,
    });

    return () => {
      setHeaderConfig({});
    };
  }, [
    availableDates,
    calendarDatesError,
    calendarDatesStatus,
    onDayClick,
    setHeaderConfig,
    visibleEventDate,
  ]);
}
