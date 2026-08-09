import type { ReactNode } from 'react';
import { redirect } from 'next/navigation';
import { canAccessSecret } from '@/lib/secretAccess';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function SecretLayout({ children }: Readonly<{ children: ReactNode }>) {
  if (!await canAccessSecret()) redirect('/soon');
  return children;
}
