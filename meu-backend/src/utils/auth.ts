import type { User } from '@supabase/supabase-js';

type IdentityData = Record<string, unknown>;

function firstText(source: IdentityData | undefined, keys: string[]): string | null {
  for (const key of keys) {
    const value = source?.[key];
    if (typeof value === 'string' && value.trim()) return value.trim();
  }
  return null;
}

export function getDiscordId(user: User): string | null {
  const identity = user.identities?.find((item) => item.provider === 'discord');
  if (!identity) return null;
  const identityData = identity.identity_data as Record<string, unknown> | undefined;
  const candidate = typeof identityData?.provider_id === 'string' ? identityData.provider_id : identity.id;
  return /^\d{15,22}$/.test(candidate) ? candidate : null;
}

export function getAdminIds(): string[] {
  return (process.env.ADMIN_DISCORD_IDS || '')
    .split(',')
    .map((id) => id.trim())
    .filter((id) => /^\d{15,22}$/.test(id));
}

export function getDisplayName(user: User): string {
  const preferredIdentity = user.identities?.find((identity) => identity.provider === 'discord')
    ?? user.identities?.[0];
  const identityData = preferredIdentity?.identity_data as IdentityData | undefined;
  const providerName = firstText(identityData, ['full_name', 'name', 'global_name', 'preferred_username', 'user_name']);
  const fallback = user.email?.split('@')[0] || 'Usuário';
  return (providerName || fallback).replace(/[\u0000-\u001f\u007f]/g, '').replace(/\s+/g, ' ').slice(0, 100);
}

export function getProviderAvatar(user: User): string | null {
  const preferredIdentity = user.identities?.find((identity) => identity.provider === 'discord')
    ?? user.identities?.[0];
  const identityData = preferredIdentity?.identity_data as IdentityData | undefined;
  const candidate = firstText(identityData, ['avatar_url', 'picture']);
  if (!candidate) return null;

  try {
    const url = new URL(candidate);
    return url.protocol === 'https:' ? url.toString() : null;
  } catch {
    return null;
  }
}
