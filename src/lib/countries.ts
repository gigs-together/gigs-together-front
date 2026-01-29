import countriesJson from '../../countries.json';

type CountryItem = {
  iso: string;
  name: string;
};

export const COUNTRIES: CountryItem[] = (countriesJson as CountryItem[])
  .filter((c) => c?.iso && c?.name)
  .map((c) => ({ iso: String(c.iso).toUpperCase(), name: String(c.name) }));

export const COUNTRY_BY_ISO_MAP = new Map(COUNTRIES.map((c) => [c.iso, c.name]));
