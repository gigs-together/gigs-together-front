import type { Event, V1GigGetResponseBodyGig } from '@/lib/types';
import { toLocalYMD } from '@/lib/utils';

const toMs = (n: number) => (n < 1_000_000_000_000 ? n * 1000 : n); // seconds -> ms (heuristic)

const gigDateToYMD = (date: V1GigGetResponseBodyGig['date']): string => {
  if (typeof date === 'number') {
    return toLocalYMD(new Date(toMs(date)));
  }

  const s = String(date).trim();

  // "1705257600000" or "1705257600"
  if (/^\d+$/.test(s)) {
    const n = Number(s);
    return toLocalYMD(new Date(toMs(n)));
  }

  // ISO "2026-01-14T19:00:00.000Z"
  if (s.includes('T')) return s.slice(0, 10);

  // "YYYY-MM-DD"
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;

  // last resort parse
  const d = new Date(s);
  if (!Number.isNaN(d.getTime())) return toLocalYMD(d);

  return s;
};

export function gigDtoToEvent(gig: V1GigGetResponseBodyGig, idx: number): Event {
  const date = gigDateToYMD(gig.date);

  return {
    id: `${date}-${idx}`,
    date,
    poster: gig.posterUrl,
    title: gig.title,
    venue: gig.venue,
    ticketsUrl: gig.ticketsUrl,
    calendarUrl: gig.calendarUrl,
  };
}
