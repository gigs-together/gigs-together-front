import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import type { ReactNode } from 'react';

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

export const metadata: Metadata = {
  metadataBase: siteBaseUrl ? new URL(siteBaseUrl) : undefined,
  title: {
    default: 'Gigs Together!',
    template: '%s | Gigs Together!',
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
    title: 'Gigs Together!',
    description,
    url: siteBaseUrl ?? undefined,
    images: [
      {
        url: '/preview-tg.jpg',
        alt: 'Gigs Together preview',
      },
      {
        url: '/preview.jpg',
        alt: 'Gigs Together preview (square)',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Gigs Together!',
    description,
    images: ['/preview-tg.jpg'],
  },
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
