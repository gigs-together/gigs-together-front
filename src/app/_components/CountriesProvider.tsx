'use client';

import type { ReactNode } from 'react';
import { createContext, useContext } from 'react';
import type { Country } from '@/lib/countries.server';

export type CountriesDictionary = Record<Country['iso'], Country['name']>;

interface CountriesContextValue {
  countriesList: Country[];
  countriesDictionary: CountriesDictionary;
}

const CountriesContext = createContext<CountriesContextValue | null>(null);

interface CountriesProviderProps {
  children: ReactNode;
  countries: Country[];
}

export function getCountriesDictionary(countries: Country[]): CountriesDictionary {
  const countriesDictionary: CountriesDictionary = {};
  for (const country of countries) {
    if (!country.iso || !country.name) continue;
    countriesDictionary[country.iso] = country.name;
  }
  return countriesDictionary;
}

export function CountriesProvider({ children, countries }: CountriesProviderProps) {
  const countriesDictionary = getCountriesDictionary(countries);

  return (
    <CountriesContext.Provider value={{ countriesDictionary, countriesList: countries }}>
      {children}
    </CountriesContext.Provider>
  );
}

export function useCountries(): CountriesContextValue {
  const ctx = useContext(CountriesContext);
  if (!ctx) {
    throw new Error('useCountries must be used within <CountriesProvider />');
  }
  return ctx;
}
