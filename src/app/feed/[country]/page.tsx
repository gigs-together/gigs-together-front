import { redirect } from 'next/navigation';

export default async function Page(props: PageProps<'/feed/[country]'>) {
  const { country } = await props.params;
  const normalizedCountry = decodeURIComponent(country).trim().toLowerCase();

  // Currently we only support one location.
  if (normalizedCountry !== 'es') {
    redirect('/feed/es/barcelona');
  }

  redirect('/feed/es/barcelona');
}
