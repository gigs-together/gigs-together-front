import 'server-only';

import { apiRequest } from '@/lib/api';

export interface Country {
  iso: string;
}

export async function getCountries(): Promise<Country[]> {
  const data = await apiRequest<Country[]>('/v1/location/countries', 'GET', undefined, {
    cache: 'force-cache',
  });
  return Array.isArray(data) ? data : [];
}
