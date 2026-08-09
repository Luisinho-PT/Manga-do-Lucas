import type { Metadata } from 'next';
import SecretProgressTeaser from '@/components/SecretProgressTeaser';

export const metadata: Metadata = {
  title: '???',
  description: '...',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    noimageindex: true,
  },
};

export default function SoonPage() {
  return <SecretProgressTeaser />;
}
