import { redirect } from 'next/navigation';
import FeedClient from '../../_components/FeedClient';

export default async function Page(props: PageProps<'/feed/[country]/[city]'>) {
  const { country, city } = await props.params;
  const normalizedCountry = decodeURIComponent(country).trim().toLowerCase();
  const normalizedCity = decodeURIComponent(city).trim().toLowerCase();

  // Currently we only support one location.
  if (normalizedCountry !== 'es' || normalizedCity !== 'barcelona') {
    redirect('/feed/es/barcelona');
  }

  return <FeedClient country={country} city={city} />;
}
