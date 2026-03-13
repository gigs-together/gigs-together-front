'use client';

import { Fragment, useMemo } from 'react';
import { MonthSection } from '@/app/_components/MonthSection';
import { GigCard } from '@/app/_components/GigCard';
import type { Event } from '@/lib/types';
import { formatMonthTitle } from './utils';

export interface FeedMonthsProps {
  events: Event[];
  registerEventRef: (eventId: string, element: HTMLElement | null) => void;
}

export function FeedMonths(props: FeedMonthsProps) {
  const { events, registerEventRef } = props;

  const months = useMemo(() => {
    const grouped: Record<string, Event[]> = {};
    events.forEach((event) => {
      const monthYear = event.date.split('-').slice(0, 2).join('-');
      grouped[monthYear] = grouped[monthYear] || [];
      grouped[monthYear].push(event);
    });

    return Object.keys(grouped)
      .sort()
      .map((date) => ({
        date: date + '-01',
        events: grouped[date],
      }));
  }, [events]);

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl text-gray-600">No events found</h2>
        <p className="text-gray-500 mt-2">Check back later for upcoming events!</p>
      </div>
    );
  }

  return (
    <>
      {months.map((month, monthIdx) => {
        const orderedMonthEvents = [...month.events].sort(
          (a, b) => a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id)),
        );
        return (
          <MonthSection
            key={month.date}
            title={formatMonthTitle(month.date)}
            date={month.date}
            showDivider={monthIdx !== 0}
          >
            {orderedMonthEvents.map((event, idx) => {
              const prev = orderedMonthEvents[idx - 1];
              const isFirstOfDate = idx === 0 || prev?.date !== event.date;

              return (
                <Fragment key={event.id}>
                  <div
                    id={event.id}
                    data-date={isFirstOfDate ? event.date : undefined}
                    data-event-id={event.id}
                    ref={(el) => registerEventRef(event.id, el)}
                    className="gig-anchor"
                  >
                    <GigCard gig={event} />
                  </div>
                </Fragment>
              );
            })}
          </MonthSection>
        );
      })}
    </>
  );
}
