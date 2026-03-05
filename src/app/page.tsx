import { redirect } from 'next/navigation';
import { DEFAULT_FEED_ROUTE } from '@/lib/feed.routes';

export default function RootPage() {
  redirect(DEFAULT_FEED_ROUTE);
}
