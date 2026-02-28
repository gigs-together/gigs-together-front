'use client';

import Script from 'next/script';

export default function TelegramWebAppScript() {
  return (
    <Script src="https://telegram.org/js/telegram-web-app.js?56" strategy="afterInteractive" />
  );
}
