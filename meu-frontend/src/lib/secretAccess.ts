import { createServerClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';

export const SECRET_OWNER_DISCORD_ID = '642834484701691913';

export function getVerifiedDiscordId(user: User | null): string | null {
  const discordIdentity = user?.identities?.find((identity) => identity.provider === 'discord');
  if (!discordIdentity) return null;

  const identityData = discordIdentity.identity_data as Record<string, unknown> | undefined;
  const providerId = identityData?.provider_id;
  const candidate = typeof providerId === 'string' ? providerId : discordIdentity.id;

  return /^\d{15,22}$/.test(candidate) ? candidate : null;
}

export async function canAccessSecret(): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return false;

  const cookieStore = await cookies();
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: () => {
        // Server Components não podem persistir cookies durante a renderização.
      },
    },
  });

  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return false;

  return getVerifiedDiscordId(user) === SECRET_OWNER_DISCORD_ID;
}
