import GigFormClient from '@/app/gig-form/GigFormClient';
import { getCountries } from '@/lib/countries.server';
import { getTranslations } from '@/lib/translations.server';
import { I18nProvider } from '@/lib/i18n/I18nProvider';

export default async function Page() {
  const countries = await getCountries();
  const i18n = await getTranslations('en', 'country');

  return (
    <I18nProvider locale={i18n.locale} translations={i18n.translations}>
      <GigFormClient countries={countries} />
    </I18nProvider>
  );
}
