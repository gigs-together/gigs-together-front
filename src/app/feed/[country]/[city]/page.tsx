import { redirect } from 'next/navigation';
import FeedClient from '../../_components/FeedClient';
import { getTranslations } from '@/lib/translations.server';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

export default async function Page(props: PageProps<'/feed/[country]/[city]'>) {
  const { country, city } = await props.params;
  const normalizedCountry = decodeURIComponent(country).trim().toLowerCase();
  const normalizedCity = decodeURIComponent(city).trim().toLowerCase();

  // Currently we only support one location.
  if (normalizedCountry !== 'es' || normalizedCity !== 'barcelona') {
    redirect('/feed/es/barcelona');
  }

  const i18n = await getTranslations(['countries']);

  return (
    <I18nProvider locale={i18n.locale} translations={i18n.translations}>
      <FeedClient country={country} city={city} />
    </I18nProvider>
  );
}
