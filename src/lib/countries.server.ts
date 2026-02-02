import 'server-only';

import { apiRequest } from '@/lib/api';

type Language = 'en' | 'ru' | 'es' | string;
type CountryTranslations = Record<Language, string>;

interface CountryApiItem {
  iso: string;
  names: CountryTranslations;
}

export interface Country {
  iso: string;
  name: string;
}

const COUNTRIES_REVALIDATE_SECONDS = 60 * 60; // 1h

export async function getCountries(language: Language = 'en'): Promise<Country[]> {
  const data = await apiRequest<CountryApiItem[]>('/v1/location/countries', 'GET', undefined, {
    next: { revalidate: COUNTRIES_REVALIDATE_SECONDS },
  });
  if (!Array.isArray(data)) return [];

  return data
    .map((country) => {
      const name = country.names?.[language]?.trim();
      return { iso: country.iso, name };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
}
