export interface FeedLocation {
  readonly country: string;
  readonly city: string;
}

// NOTE: Next "typed routes" expect `redirect()` arguments to be a `Route`.
// We centralize the minimal type assertion here to avoid sprinkling `as Route` across pages.
import type { Route } from 'next';

export const SUPPORTED_FEED_LOCATIONS: readonly FeedLocation[] = [
  // Currently, we only support one location.
  { country: 'es', city: 'barcelona' },
];

const normalizeSegment = (value: string): string => decodeURIComponent(value).trim().toLowerCase();

export const buildFeedPath = (loc: FeedLocation): string => {
  const country = normalizeSegment(loc.country);
  const city = normalizeSegment(loc.city);
  return `/feed/${encodeURIComponent(country)}/${encodeURIComponent(city)}`;
};

export const DEFAULT_FEED_LOCATION: FeedLocation = SUPPORTED_FEED_LOCATIONS[0];
export const DEFAULT_FEED_PATH = buildFeedPath(DEFAULT_FEED_LOCATION);
export const DEFAULT_FEED_ROUTE = DEFAULT_FEED_PATH as Route;
