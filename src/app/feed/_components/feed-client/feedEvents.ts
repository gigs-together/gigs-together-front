import type { Event } from '@/lib/types';

export function compareEventsAsc(a: Event, b: Event): number {
  return a.date.localeCompare(b.date) || String(a.id).localeCompare(String(b.id));
}

export function sortEventsAsc(input: readonly Event[]): Event[] {
  const next = input.slice();
  next.sort(compareEventsAsc);
  return next;
}

export function mergeUniqueSorted(base: readonly Event[], incoming: readonly Event[]): Event[] {
  const uniqueById = new Map<string, Event>();
  for (const e of base) uniqueById.set(e.id, e);
  for (const e of incoming) uniqueById.set(e.id, e);
  const unique = Array.from(uniqueById.values());
  unique.sort(compareEventsAsc);
  return unique;
}
