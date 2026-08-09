import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { SpeedInsights } from '@vercel/speed-insights/next';
import MediaGuard from '@/components/MediaGuard';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mangá do Luquinhas',
  description: 'O site oficial do Mangá do Luquinhas — conheça personagens, acompanhe as atualizações e deixe seu recado!',
  icons: {
    icon: '/favicon.ico?v=2',
    shortcut: '/favicon.ico?v=2',
  },
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    noimageindex: true,
  },
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <MediaGuard />
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
