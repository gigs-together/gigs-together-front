import FeedClient from './_components/FeedClient';

export default async function Page(props: PageProps<'/feed/[location]'>) {
  const { location } = await props.params;
  return <FeedClient location={location} />;
}
