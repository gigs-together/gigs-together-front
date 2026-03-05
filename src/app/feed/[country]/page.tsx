import { redirect } from 'next/navigation';
import { DEFAULT_FEED_ROUTE } from '@/lib/feed.routes';

export default async function Page(props: PageProps<'/feed/[country]'>) {
  const { country } = await props.params;
  const normalizedCountry = decodeURIComponent(country).trim().toLowerCase();

  // Currently, we only support one location.
  if (normalizedCountry !== 'es') {
    redirect(DEFAULT_FEED_ROUTE);
  }

  redirect(DEFAULT_FEED_ROUTE);
}
