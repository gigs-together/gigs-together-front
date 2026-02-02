import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { CountriesProvider } from '@/app/_components/CountriesProvider';
import { getCountries } from '@/lib/countries.server';

const geistSans = localFont({
  src: '../../public/fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: '../../public/fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'Gigs Together!',
  description: "Let's go",
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const countries = await getCountries('en');

  return (
    <html>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <CountriesProvider countries={countries}>{children}</CountriesProvider>
        <Toaster />
      </body>
    </html>
  );
}
