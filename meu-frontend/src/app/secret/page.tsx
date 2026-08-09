import type { Metadata } from 'next';
import SecretBattlePreview from '@/components/SecretBattlePreview';

export const metadata: Metadata = {
  title: '??? | Mangá do Luquinhas',
  description: 'Uma presença aguarda em algum lugar.',
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    noimageindex: true,
  },
};

export default function SecretPage() {
  return (
    <main className="relative grid min-h-dvh place-items-center overflow-x-hidden bg-black px-3 py-4 text-white sm:px-6 sm:py-8">
      <h1 className="sr-only">Prévia da batalha secreta</h1>
      <SecretBattlePreview />
    </main>
  );
}
