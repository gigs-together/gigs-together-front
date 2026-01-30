import FeedClient from './_components/FeedClient';
import { redirect } from 'next/navigation';

export default async function Page(props: PageProps<'/feed/[location]'>) {
  const { location } = await props.params;
  const normalized = decodeURIComponent(location).trim().toLowerCase();
  if (normalized !== 'barcelona') {
    redirect('/feed/barcelona');
  }
  return <FeedClient location={location} />;
}
