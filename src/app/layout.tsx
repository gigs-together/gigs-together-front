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

const TITLE = 'Gigs Together!';
const DESCRIPTION = 'Find gigs and company in your city.';
const WIDTH = 1200;
const HEIGHT = 630;
const PREVIEW_IMAGE = `/logo-${WIDTH}x${HEIGHT}.png`;

const metadataBase = siteBaseUrl ? new URL(siteBaseUrl) : undefined;
const previewImage = new URL(PREVIEW_IMAGE, metadataBase).toString();

export const metadata: Metadata = {
  metadataBase,
  title: {
    default: TITLE,
    template: `%s | ${TITLE}`,
  },
  description: DESCRIPTION,
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/favicon.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    siteName: 'GigsTogether',
    title: TITLE,
    description: DESCRIPTION,
    url: siteBaseUrl ?? undefined,
    images: [
      {
        url: previewImage,
        width: WIDTH,
        height: HEIGHT,
        alt: TITLE,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
    images: [previewImage],
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
