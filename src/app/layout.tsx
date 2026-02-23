import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';
import { HeaderConfigProvider } from '@/app/_components/HeaderConfigProvider';
import AppHeader from '@/app/_components/AppHeader';

const siteBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

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

const description = 'Find gigs and company in your city.';

const TITLE = 'Gigs Together!';
const PREVIEW_IMAGE = '/logo-640x360.png';

export const metadata: Metadata = {
  metadataBase: siteBaseUrl ? new URL(siteBaseUrl) : undefined,
  title: {
    default: TITLE,
    template: `%s | ${TITLE}`,
  },
  description,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'GigsTogether', // 👈 добавь
    title: TITLE,
    description,
    url: siteBaseUrl ?? undefined,
    images: [
      {
        url: PREVIEW_IMAGE,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description,
    images: [PREVIEW_IMAGE],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <HeaderConfigProvider>
          <AppHeader />
          <div className="pt-[45px]">{children}</div>
          <Toaster />
        </HeaderConfigProvider>
      </body>
    </html>
  );
}
