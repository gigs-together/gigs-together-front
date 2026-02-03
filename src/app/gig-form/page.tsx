import GigFormClient from '@/app/gig-form/GigFormClient';
import { getCountries } from '@/lib/countries.server';

export default async function Page() {
  const countries = await getCountries();
  return <GigFormClient countries={countries} />;
}
