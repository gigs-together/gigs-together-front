import 'server-only';

import { apiRequest } from '@/lib/api';
import type { V1GigGetResponseBody } from '@/lib/types';

export type GetFeedParams = Readonly<{
  limit: number;
  country?: string;
  city?: string;
  cursor?: string;
}>;

/**
 * Server-side feed loader.
 * Use this for the initial page so the feed is pre-rendered.
 */
export async function getFeed(params: GetFeedParams): Promise<V1GigGetResponseBody> {
  const { limit, country, city, cursor } = params;

  const qs = new URLSearchParams();
  qs.set('limit', String(limit));
  if (cursor) qs.set('cursor', cursor);
  if (country) qs.set('country', country);
  if (city) qs.set('city', city);

  return await apiRequest<V1GigGetResponseBody>(`v1/gig?${qs.toString()}`, 'GET');
}
